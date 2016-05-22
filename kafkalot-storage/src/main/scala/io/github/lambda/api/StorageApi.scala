package io.github.lambda.api

import scala.util.{Failure, Success, Try}
import com.twitter.finagle.Service
import com.twitter.finagle.http.{Request, Response}
import com.twitter.logging.Logger
import io.finch._
import io.finch.circe._
import io.circe._
import io.circe.generic.auto._
import io.circe.parser._
import io.circe.syntax._
import io.circe.jawn._
import cats.data.Xor
import com.twitter.util.Future
import io.github.lambda.exception.ErrorCode
import io.github.lambda.model.{Connector, ConnectorMeta}

object StorageApi {

  val END_POINT = "connectors"

  def extractConnector(name: String): Option[Connector] = Connector.get(name)
  object connectorFromName extends Extractor("connector", extractConnector)

  val ConnectorExtractor: Endpoint[Connector] = body.as[Connector]
  val ConnectorMetaExtractor: Endpoint[ConnectorMeta] = body.as[ConnectorMeta]
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

  val getConnectors: Endpoint[List[Connector]] =
    get(END_POINT) {
      Ok(Connector.getAll())
    } mapAsync { cs: List[Connector] =>
      KafkaConnectClientApi.getConnectors().map {
        runningConnectorNames: List[String] =>
          cs.foreach { c =>
            if (runningConnectorNames.contains(c.name)) {
              val updatedMeta = c._meta.copy(running = true)
              Connector.upsert(c.copy(_meta = updatedMeta))
            }
          }
      } rescue {
        case e: Exception => Future { BadRequest(e) }
      }
    } mapOutput { _ =>
      Ok(Connector.getAll())
    }

  val getConnector: Endpoint[Connector] =
    get(END_POINT :: connectorFromName) mapAsync { c: Connector =>
      KafkaConnectClientApi.getConnector(c.name).map {
        connectorJson: JsonObject =>
          val updatedMeta = c._meta.copy(running = true)
          val connectorJsonCursor = Json.fromJsonObject(connectorJson).hcursor
          val updatedConnector =
            connectorJsonCursor.get[JsonObject]("config") match {
              case Xor.Right(updatedConfig) =>
                c.copy(_meta = updatedMeta, config = updatedConfig)
              case Xor.Left(error) =>
                throw new RuntimeException(error)
            }

          Connector.upsert(updatedConnector)
          updatedConnector
      } rescue {
        case e: Exception => Future { c }
      }
    }

  val postConnector: Endpoint[Connector] =
    post(END_POINT :: ConnectorExtractor) { (c: Connector) =>
      Connector.get(c.name) match {
        case Some(_) =>
          Conflict(new RuntimeException(ErrorCode.CONNECTOR_NAME_DUPLICATED))
        case None =>
          if (c._meta.running) {
            BadRequest(
                new RuntimeException(ErrorCode.CANNOT_CREATE_RUNNING_CONNECTOR)
            )
          } else {
            Connector.upsert(c)
            Created(c)
          }
      }
    }

  val handlePostConnectorCommand: Endpoint[Connector] =
    post(END_POINT :: connectorFromName :: "command" :: ConnectorCommandExtractor) mapOutputAsync {
      hlist => {
        val connector: Connector = hlist.head
        val command: ConnectorCommand = hlist.tail.head

        command.operation match {
          case ConnectorCommand.OPERATION_START =>
            connector.start map { _ =>
              // TODO already
              val updatedMeta = connector._meta.copy(running = true)
              val updatedConnector = connector.copy(_meta = updatedMeta)
              Ok(Connector.upsert(updatedConnector))
            } rescue { case e: Exception => Future { BadRequest(e) } }
          case ConnectorCommand.OPERATION_STOP =>
            connector.stop map { _ =>
              val updatedMeta = connector._meta.copy(running = false)
              val updatedConnector = connector.copy(_meta = updatedMeta)
              Ok(Connector.upsert(updatedConnector))
            } rescue { case e: Exception => Future { BadRequest(e) } }
          case ConnectorCommand.OPERATION_ENABLE =>
            val updatedMeta = connector._meta.copy(enabled = true)
            val updatedConnector = connector.copy(_meta = updatedMeta)
            Future { Ok(Connector.upsert(updatedConnector)) }
          case ConnectorCommand.OPERATION_DISABLE =>
            val updatedMeta = connector._meta.copy(enabled = false)
            val updatedConnector = connector.copy(_meta = updatedMeta)
            Future { Ok(Connector.upsert(updatedConnector)) }
          case _ =>
            Future { createBadRequest(ErrorCode.UNSUPPORTED_CONNECTOR_OPERATION) }
        }
      }
    }

  val putConnectorMeta: Endpoint[Connector] =
    put(END_POINT :: connectorFromName :: "_meta" :: ConnectorMetaExtractor) {
      (c: Connector, requestedMeta: ConnectorMeta) => {
        val currentMeta = c._meta

        if (currentMeta == requestedMeta) {
          Conflict(new RuntimeException(ErrorCode.CANNOT_UPDATE_DUPLICATED_META))
        } else if (currentMeta.running != requestedMeta.running ||
          currentMeta.enabled != requestedMeta.enabled) {
          createBadRequest(ErrorCode.CANNOT_UPDATE_META_USING_PUT_API)
        } else {
          /** update tags only */
          val updatedMeta = c._meta.copy(tags = requestedMeta.tags)
          val updatedConnector = c.copy(_meta = updatedMeta)
          Ok(Connector.upsert(updatedConnector))
        }
      }
    }

  def createBadRequest(errorCode: String): Output[Nothing] =
    BadRequest(new RuntimeException(errorCode))

  val api: Service[Request, Response] =
    (getConnectors :+: getConnector :+: postConnector :+: putConnectorMeta :+: handlePostConnectorCommand).toService
}
