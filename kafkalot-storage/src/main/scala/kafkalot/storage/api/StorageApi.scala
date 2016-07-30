package kafkalot.storage.api

import com.twitter.util.Future
import com.twitter.finagle.http
import com.typesafe.scalalogging.LazyLogging
import io.finch._
import io.finch.circe._
import io.circe._
import io.circe.generic.auto._
import io.circe.parser._
import io.circe.syntax._
import io.circe.jawn._
import shapeless._
import kafkalot.storage.exception._
import kafkalot.storage.kafka._
import kafkalot.storage.model._

object StorageApi extends LazyLogging {

  val API_VERSION = "v1"
  val RES_API = "api"
  val RES_CONNECTORS = "connectors"
  val RES_CONFIG = "config"
  val RES_COMMAND = "command"
  val RES_TASKS = "tasks"
  val RES_CONNECTOR_PLUGINS = "connector-plugins"
  val RES_VALIDATE = "validate"

  val handleGetConnectors: Endpoint[List[String]] =
    get(RES_API :: API_VERSION :: RES_CONNECTORS) mapOutputAsync { _ =>
      StorageConnectorDao.getAll().map { scs: List[StorageConnector] =>
        val names: List[String] = scs.map(_.name)
        Ok(names)
      }
    }

  val handleGetConnector: Endpoint[ExportedConnector] =
    get(RES_API :: API_VERSION :: RES_CONNECTORS :: string) mapOutputAsync {
      case connectorName =>
        ExportedConnector.get(connectorName) map { Ok(_) }
    }

  val handleGetConnectorTasks: Endpoint[List[ConnectorTask]] =
    get(RES_API :: API_VERSION :: RES_CONNECTORS ::
      string :: RES_TASKS) mapOutputAsync {
      case connectorName =>
        ExportedConnector.get(connectorName) map { ec => Ok(ec.tasks) }
    }

  val handleGetConnectorTask: Endpoint[ConnectorTask] =
    get(RES_API :: API_VERSION :: RES_CONNECTORS ::
      string :: RES_TASKS :: int) mapOutputAsync {
      case connectorName :: taskId :: HNil =>
        ExportedConnector.get(connectorName) map { ec =>
          if (taskId >= ec.tasks.length) {
            logger.error(s"Can't find task ${taskId} for ${ec.name}")
            throw new NoSuchConnectorTask(s"Can't find task ${taskId} for ${ec.name} (tasks.length: ${ec.tasks.length})")
          }
          else Ok(ec.tasks(taskId))
        }
    }


  val handlePutConnectorConfig: Endpoint[ExportedConnector] =
    put(RES_API :: API_VERSION :: RES_CONNECTORS ::
      string :: RES_CONFIG :: body.as[JsonObject]) mapOutputAsync {

      case connectorName :: config :: HNil =>
        val fEc: Future[ExportedConnector] =
          for {
            sc <- StorageConnector.get(connectorName)
            ec <- sc.updateConfig(config)
          } yield ec

        fEc map { Ok(_) }
    }

  val handlePostConnector: Endpoint[ExportedConnector] =
    post(RES_API :: API_VERSION :: RES_CONNECTORS :: body.as[RawConnector]) { (c: RawConnector) =>
      StorageConnectorDao.insert(c.toInitialStorageConnector) map { inserted =>
        Created(inserted.toStoppedExportedConnector)
      }
    }

  val handleDeleteConnector: Endpoint[Boolean] =
    delete(RES_API :: API_VERSION :: RES_CONNECTORS :: string) mapOutputAsync {

      case connectorName =>
        ExportedConnector.get(connectorName).flatMap { ec =>
          if (ec.state != ConnectorState.REGISTERED) {
            logger.error(s"Can't delete connector which is not in REGISTERED state (${connectorName})")
            Future {
              BadRequest(new InvalidStorageConnectorState(s"Can't delete connector which is not in REGISTERED state (${connectorName})"))
            }
          } else {
            StorageConnectorDao.delete(ec.name).map { Ok(_) }
          }
        }
    }

  val handlePostConnectorCommand: Endpoint[ExportedConnector] =
    post(RES_API :: API_VERSION :: RES_CONNECTORS ::
      string :: RES_COMMAND :: body.as[ConnectorCommand]) mapOutputAsync {

      case connectorName :: command :: HNil =>
        StorageConnector.get(connectorName).flatMap { sc =>
          sc.handleCommand(command) map { Ok(_) }
        }
    }

  val handlePostConnectorTaskCommand: Endpoint[ConnectorTask] =
    post(RES_API :: API_VERSION :: RES_CONNECTORS ::
      string :: RES_TASKS :: int :: RES_COMMAND :: body.as[ConnectorTaskCommand]) mapOutputAsync {

      case connectorName :: taskId :: command :: HNil =>
        StorageConnector.get(connectorName) flatMap { sc =>
          sc.handleTaskCommand(taskId, command).map { Ok(_) }
        }
    }

  val handleGetConnectorPlugins: Endpoint[Json] =
    get(RES_API :: API_VERSION :: RES_CONNECTOR_PLUGINS) mapOutputAsync { _ =>
      ConnectorClientApi.getConnectorPlugins() map { Ok(_) }
    }

  val handleGetConnectorPluginsJSONSchema: Endpoint[JSONSchema] =
    get(RES_API :: API_VERSION :: RES_CONNECTOR_PLUGINS ::
      string :: "schema") mapOutputAsync {
      case connectorClass =>
        ConnectorClientApi.getConnectorPluginJSONSchema(connectorClass) map { Ok(_) }
    }

  val handlePutConnectorConfigValidation: Endpoint[ConnectorConfigValidationResult] =
    put(RES_API :: API_VERSION :: RES_CONNECTOR_PLUGINS ::
      string :: RES_VALIDATE :: body.as[Json]) mapOutputAsync {
      case connectorClass :: config :: HNil =>
        ConnectorClientApi.validateConnectorPlugin(connectorClass, config) map { Ok(_) }
    }

  val api =
    (handleGetConnectors
      :+: handleGetConnector
      :+: handleGetConnectorTasks
      :+: handleGetConnectorTask
      :+: handlePutConnectorConfig
      :+: handlePostConnector
      :+: handleDeleteConnector
      :+: handlePostConnectorCommand
      :+: handlePostConnectorTaskCommand
      :+: handleGetConnectorPlugins
      :+: handlePutConnectorConfigValidation
      :+: handleGetConnectorPluginsJSONSchema
      ) handle { /** global exception handler */

      case e: NoSuchConnectorInStorage =>
        logger.error(s"Cannot found connector in storage")
        NotFound(e)
      case e: CannotCreateDuplicatedConnector =>
        logger.error(s"Can't create duplicated connector")
        Conflict(e)
      case e: ConnectorPluginValidationFailed =>
        logger.error(s"Invalid Connector Config ${e.message}")
        BadRequest(e)
      case e: ConnectorPluginNotFoundException =>
        logger.error(s"Requested connector class does not exist (${e.message})")
        BadRequest(e)

      case e: KafkalotException =>
        logger.error(e.getMessage)
        BadRequest(e)

      case e: ConnectClusterException =>
        logger.error(e.getMessage)
        InternalServerError(e)

      case e: Exception =>
        logger.error(s"Unknown exception occurred: ${e.getMessage}", e)
        InternalServerError(e)
      }

}
