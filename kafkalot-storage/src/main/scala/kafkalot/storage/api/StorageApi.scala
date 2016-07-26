package kafkalot.storage.api

import com.twitter.util.Future
import com.typesafe.scalalogging.LazyLogging
import io.finch._
import io.finch.circe._
import io.circe._
import io.circe.generic.auto._
import io.circe.parser._
import io.circe.syntax._
import io.circe.jawn._
import shapeless._
import kafkalot.storage.exception.{ConnectorPluginNotFoundException, ErrorCode}
import kafkalot.storage.kafka._
import kafkalot.storage.model._

object StorageApi extends LazyLogging {

  val RES_API = "api"
  val RES_API_VERSION = "v1"
  val RES_CONNECTORS = "connectors"
  val RES_CONFIG = "config"
  val RES_COMMAND = "command"
  val RES_CONNECTOR_PLUGINS = "connector-plugins"
  val RES_VALIDATE = "validate"

  val RawConnectorExtractor: Endpoint[RawConnector] =
    body.as[RawConnector]
  val StorageConnectorConfigExtractor: Endpoint[JsonObject] =
    body.as[JsonObject]
  val ConnectorCommandExtractor: Endpoint[ConnectorCommand] =
    body.as[ConnectorCommand] mapOutput { command: ConnectorCommand =>
      command.operation match {
        case ConnectorCommand.OPERATION_START => Ok(command)
        case ConnectorCommand.OPERATION_DISABLE => Ok(command)
        case ConnectorCommand.OPERATION_ENABLE => Ok(command)
        case ConnectorCommand.OPERATION_STOP => Ok(command)
        case ConnectorCommand.OPERATION_RESTART => Ok(command)
        case ConnectorCommand.OPERATION_PAUSE => Ok(command)
        case ConnectorCommand.OPERATION_RESUME => Ok(command)
        case _ =>
          logger.error(s"Invalid command type ${command.operation}")
          BadRequest(new RuntimeException(ErrorCode.INVALID_CONNECTOR_COMMAND_OPERATION))
      }
    }

  val getConnectors: Endpoint[List[String]] =
    get(RES_API :: RES_API_VERSION :: RES_CONNECTORS) mapOutputAsync { _ =>
      StorageConnectorDao.getAll().map { scs =>
        Ok(scs.map(sc => sc.name))
      } rescue {
        case e: Exception =>
          logger.error("Failed to get all connectors", e)
          Future { InternalServerError(e) }
      }
    }

  val getConnector: Endpoint[ExportedConnector] =
    get(RES_API :: RES_API_VERSION :: RES_CONNECTORS :: string) mapAsync { connectorName: String =>
      StorageConnectorDao.get(connectorName)
    } mapOutput { scOption: Option[StorageConnector] =>
      scOption match {
        case None =>
          logger.error("Can't get a connector which does not exist")
          NotFound(new RuntimeException(ErrorCode.FAILED_TO_GET_CONNECTOR))
        case Some(sc) => Ok(sc)
      }
    } mapAsync { sc: StorageConnector =>
      sc.toExportedConnector
    }

  val putConnectorConfig: Endpoint[ExportedConnector] =
    put(RES_API :: RES_API_VERSION :: RES_CONNECTORS :: string :: RES_CONFIG :: StorageConnectorConfigExtractor) mapAsync {
      case connectorName :: config :: HNil =>
      StorageConnectorDao.get(connectorName).map { scOption => (scOption, config) }
    } mapOutputAsync {
      case (scOption, config) =>
        scOption match {
          case None =>
            logger.error("Can't update a connector which does not exist")
            Future { NotFound(new RuntimeException(ErrorCode.FAILED_TO_GET_CONNECTOR)) }
          case Some(sc) =>
            sc.updateConfig(config).map { Ok(_) }
        }
    }

  val postConnector: Endpoint[ExportedConnector] =
    post(RES_API :: RES_API_VERSION :: RES_CONNECTORS :: RawConnectorExtractor) { (c: RawConnector) =>
      StorageConnectorDao.insert(c.toInitialStorageConnector) map { inserted =>
        Created(inserted.toStoppedExportedConnector) } rescue {
        case e: Exception =>
          logger.error("Failed to create connector", e)
          Future { BadRequest(e) } // TODO branch CreatedFailedException
      }
    }

  val deleteConnector: Endpoint[Boolean] =
    delete(RES_API :: RES_API_VERSION :: RES_CONNECTORS :: string) mapAsync { connectorName: String =>
      StorageConnectorDao.get(connectorName)
    } mapOutputAsync { scOption: Option[StorageConnector] =>
      scOption match {
        case None =>
          logger.error("Can't delete a connector which does not exist")
          Future { NotFound(new RuntimeException(ErrorCode.CANNOT_DELETE_UNKNOWN_CONNECTOR)) }
        case Some(sc) => sc.toExportedConnector.map { ec => Ok(ec) }
      }
    } mapOutputAsync { ec: ExportedConnector =>
      if (ec.state != ConnectorState.REGISTERED) {
        logger.error("Can't delete connector which is not in REGISTERED state")
        Future { BadRequest(new RuntimeException(ErrorCode.CANNOT_DELETE_NOT_REGISTERED_CONNECTOR)) }
      }
      else {
        StorageConnectorDao.delete(ec.name).map { Ok(_) }
      }
    }

  val handlePostConnectorCommand: Endpoint[ExportedConnector] =
    post(RES_API :: RES_API_VERSION :: RES_CONNECTORS :: string :: RES_COMMAND :: ConnectorCommandExtractor) {
      (name: String, command: ConnectorCommand) =>
        val f = StorageConnectorDao.get(name) map { scOption => (scOption, command) }
        Ok(f)
    } mapOutput {
      case (scOption, command) =>
        scOption match {
          case None =>
            logger.error("Can't command to a connector which does not exist")
            BadRequest(new RuntimeException(ErrorCode.FAILED_TO_GET_CONNECTOR))
          case Some(sc) => Ok((sc, command))
        }
    } mapOutputAsync {
      case (sc, command) =>
        sc.handleCommand(command) map { ec: ExportedConnector =>
          Ok(ec)
        } rescue {
          case e: Exception =>
            logger.error("Failed to handle command", e)
            Future { BadRequest(e) }
        }
    }

  val getConnectorPlugins: Endpoint[Json] =
    get(RES_API :: RES_API_VERSION :: RES_CONNECTOR_PLUGINS) mapOutputAsync { _ =>
      ConnectorClientApi.getConnectorPlugins() map {
        Ok(_)
      } rescue {
        case e: Exception =>
          logger.error("Failed to get connector plugins", e)
          Future { InternalServerError(e) }
      }
    }

  val getConnectorPluginsJSONSchema: Endpoint[JSONSchema] =
    get(RES_API :: RES_API_VERSION :: RES_CONNECTOR_PLUGINS :: string :: "schema") mapOutputAsync {
      case connectorClass =>
        ConnectorClientApi.getConnectorPluginJSONSchema(connectorClass) map { jsonSchema =>
          Ok(jsonSchema)
        } rescue {
          case e: ConnectorPluginNotFoundException =>
            logger.error(s"Requested connector class does not exist (${e.message})")
            Future { BadRequest(e) }
          case e: Exception =>
            logger.error("Failed to get connector plugin schema", e)
            Future { InternalServerError(e) }
        }
    }

  val handlePutConnectorConfigValidation: Endpoint[ConnectorConfigValidationResult] =
    put(RES_API :: RES_API_VERSION :: RES_CONNECTOR_PLUGINS :: string :: RES_VALIDATE :: body.as[Json]) mapOutputAsync {
      case connectorClass :: config :: HNil =>
        ConnectorClientApi.validateConnectorPlugin(connectorClass, config) map { validationResult =>
          Ok(validationResult)
        } rescue {
          case e: ConnectorPluginNotFoundException =>
            logger.error(s"Requested connector class does not exist (${e.message})")
            Future { BadRequest(e) }
          case e: Exception =>
            logger.error("Failed to validate connector config", e)
            Future { InternalServerError(e) }
        }
    }

  val api =
    (getConnectors
      :+: getConnector
      :+: putConnectorConfig
      :+: postConnector
      :+: deleteConnector
      :+: handlePostConnectorCommand
      :+: getConnectorPlugins
      :+: handlePutConnectorConfigValidation
      :+: getConnectorPluginsJSONSchema
      )
}
