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
import io.github.lambda.kafkalot.storage.model._

object StorageApi {

  val END_POINT = "connectors"

  val StorageConnectorExtractor: Endpoint[StorageConnector] = body.as[StorageConnector]
  val StorageConnectorMetaExtractor: Endpoint[StorageConnectorMeta] = body.as[StorageConnectorMeta]
  val ConnectorCommandExtractor: Endpoint[ConnectorCommand] =
    body.as[ConnectorCommand] mapOutput { command: ConnectorCommand =>
      command.operation match {
        case ConnectorCommand.OPERATION_START =>
          Ok(command)
        case ConnectorCommand.OPERATION_DISABLE =>
          Ok(command)
        case ConnectorCommand.OPERATION_ENABLE =>
          Ok(command)
        case ConnectorCommand.OPERATION_STOP =>
          Ok(command)
        case _ =>
          createBadRequest(ErrorCode.INVALID_CONNECTOR_COMMAND_OPERATION)
      }
    }

  val getConnectors: Endpoint[List[ExportedConnector]] =
    get(END_POINT) mapAsync { _ =>
      StorageConnectorDao.getAll()
    } mapOutputAsync { storageConnectors: List[StorageConnector] =>
      StorageConnector.getExportedConnectors(storageConnectors) map {
        Ok(_)
      } rescue {
        case e: Exception => Future { InternalServerError(e) }
      }
    }

  val getConnector: Endpoint[ExportedConnector] =
    get(END_POINT :: string) mapAsync { connectorName: String =>
      StorageConnectorDao.get(connectorName)
    } mapOutput { scOption: Option[StorageConnector] =>
      scOption match {
        case None => BadRequest(new RuntimeException(ErrorCode.FAILED_TO_GET_CONNECTOR))
        case Some(sc) => Ok(sc)
      }
    } mapAsync { sc: StorageConnector =>
      sc.toExportedConnector
    }

  val postConnector: Endpoint[ExportedConnector] =
    post(END_POINT :: StorageConnectorExtractor) { (sc: StorageConnector) =>
      StorageConnectorDao.insert(sc) map { inserted =>
        Created(inserted.toStoppedExportedConnector) } rescue {
        case e: Exception =>
          Future { Conflict(e) } // TODO branch CreatedFailedException
      }
    }

  val handlePostConnectorCommand: Endpoint[ExportedConnector] =
    post(END_POINT :: string :: "command" :: ConnectorCommandExtractor) {
      (name: String, command: ConnectorCommand) =>
        /** get storage connector from DB */
        val f = StorageConnectorDao.get(name) map { scOption => (scOption, command) }
        Ok(f)
    } mapOutput {
      scOptionWithCommand =>
        val (scOption: Option[StorageConnector], command: ConnectorCommand) = scOptionWithCommand
        scOption match {
          case None => createBadRequest(ErrorCode.FAILED_TO_GET_CONNECTOR)
          case Some(sc) => Ok((sc, command))
        }
    } mapOutputAsync {
      scWithCommand =>
        val (sc: StorageConnector, command: ConnectorCommand) = scWithCommand

        sc.handleCommand(command) map { ec: ExportedConnector =>
          Ok(ec)
        } rescue {
          case e: Exception => Future { BadRequest(e) }
        }
    }

  val putConnectorMeta: Endpoint[ExportedConnector] =
    put(END_POINT :: string :: "_meta" :: StorageConnectorMetaExtractor) {
      (name: String, requestedMeta: StorageConnectorMeta) =>
        val f = StorageConnectorDao.get(name) map { scOption => (scOption, requestedMeta) }
        Ok(f)
    } mapOutput {
      scOptionWithMeta=>
        val (scOption: Option[StorageConnector], meta: StorageConnectorMeta) = scOptionWithMeta
        scOption match {
          case None => createBadRequest(ErrorCode.FAILED_TO_GET_CONNECTOR)
          case Some(sc) => Ok((sc, meta))
        }
    } mapOutputAsync {
      scWithMeta =>
        val (sc: StorageConnector, requestedMeta: StorageConnectorMeta) = scWithMeta

        sc.updateMeta(requestedMeta) map { ec: ExportedConnector =>
          Ok(ec)
        } rescue {
          // TODO Conflict(DUPLICATED_META), BadRequest(others)
          case e: Exception => Future { BadRequest(e) }
        }
    }

  def createBadRequest(errorCode: String): Output[Nothing] =
    BadRequest(new RuntimeException(errorCode))

  val api: Service[Request, Response] =
    (getConnectors :+: getConnector :+: postConnector :+: putConnectorMeta :+: handlePostConnectorCommand).toService
}
