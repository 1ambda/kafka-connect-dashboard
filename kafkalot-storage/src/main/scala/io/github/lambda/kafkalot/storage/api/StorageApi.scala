package io.github.lambda.kafkalot.storage.api

import com.twitter.finagle.Service
import com.twitter.finagle.http.{Request, Response}
import com.twitter.logging.Logger
import com.twitter.util.Future
import io.finch._
import io.finch.circe._
import io.circe._
import io.circe.generic.auto._
import io.circe.parser._
import io.circe.syntax._
import io.circe.jawn._
import cats.data.Xor
import shapeless._
import io.github.lambda.kafkalot.storage.exception.ErrorCode
import io.github.lambda.kafkalot.storage.kafka.{ConnectorState, ExportedConnector, RawConnector}
import io.github.lambda.kafkalot.storage.model._

object StorageApi {

  val RES_API = "api"
  val RES_API_VERSION = "v1"
  val RES_CONNECTORS = "connectors"
  val RES_CONFIG = "config"
  val RES_COMMAND = "command"

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
        case _ => createBadRequest(ErrorCode.INVALID_CONNECTOR_COMMAND_OPERATION)
      }
    }

  val getConnectors: Endpoint[List[String]] =
    get(RES_API :: RES_API_VERSION :: RES_CONNECTORS) mapOutputAsync { _ =>
      StorageConnectorDao.getAll().map { scs =>
        Ok(scs.map(sc => sc.name))
      } rescue {
        case e: Exception => Future { InternalServerError(e) }
      }
    }

  val getConnector: Endpoint[ExportedConnector] =
    get(RES_API :: RES_API_VERSION :: RES_CONNECTORS :: string) mapAsync { connectorName: String =>
      StorageConnectorDao.get(connectorName)
    } mapOutput { scOption: Option[StorageConnector] =>
      scOption match {
        case None => NotFound(new RuntimeException(ErrorCode.FAILED_TO_GET_CONNECTOR))
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
          case None => Future { createBadRequest(ErrorCode.FAILED_TO_GET_CONNECTOR) }
          case Some(sc) => sc.updateConfig(config).map { Ok(_) }
        }
    }

  val postConnector: Endpoint[ExportedConnector] =
    post(RES_API :: RES_API_VERSION :: RES_CONNECTORS :: RawConnectorExtractor) { (c: RawConnector) =>
      StorageConnectorDao.insert(c.toInitialStorageConnector) map { inserted =>
        Created(inserted.toStoppedExportedConnector) } rescue {
        case e: Exception =>
          Future { Conflict(e) } // TODO branch CreatedFailedException
      }
    }

  val deleteConnector: Endpoint[Boolean] =
    delete(RES_API :: RES_API_VERSION :: RES_CONNECTORS :: string) mapAsync { connectorName: String =>
      StorageConnectorDao.get(connectorName)
    } mapOutputAsync { scOption: Option[StorageConnector] =>
      scOption match {
        case None => Future { NotFound(new RuntimeException(ErrorCode.CANNOT_DELETE_UNKNOWN_CONNECTOR)) }
        case Some(sc) => sc.toExportedConnector.map { ec => Ok(ec) }
      }
    } mapOutputAsync { ec: ExportedConnector =>
      if (ec.state != ConnectorState.REGISTERED)
        Future { BadRequest(new RuntimeException(ErrorCode.CANNOT_DELETE_NOT_REGISTERED_CONNECTOR)) }
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
          case None => createBadRequest(ErrorCode.FAILED_TO_GET_CONNECTOR)
          case Some(sc) => Ok((sc, command))
        }
    } mapOutputAsync {
      case (sc, command) =>
        sc.handleCommand(command) map { ec: ExportedConnector =>
          Ok(ec)
        } rescue {
          case e: Exception => Future { BadRequest(e) }
        }
    }


  def createBadRequest(errorCode: String): Output[Nothing] =
    BadRequest(new RuntimeException(errorCode))

  val api =
    (getConnectors :+:
      getConnector :+:
      putConnectorConfig :+:
      postConnector :+:
      deleteConnector :+:
      handlePostConnectorCommand
      )
}
