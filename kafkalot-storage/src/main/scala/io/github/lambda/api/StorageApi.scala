package io.github.lambda.api

import scala.util.{Try, Failure, Success}

import com.twitter.finagle.Service
import com.twitter.finagle.http.{Request, Response}
import com.twitter.logging.Logger
import io.finch._
import io.finch.circe._
import io.circe._, io.circe.generic.auto._, io.circe.parser._, io.circe.syntax._, io.circe.jawn._
import cats.data.Xor

import io.github.lambda.exception.ErrorCode
import io.github.lambda.model.{ConnectorMeta, Connector}

object StorageApi {

  val END_POINT = "connectors"

  def extractConnector(name: String): Option[Connector] = Connector.get(name)
  object connectorFromName extends Extractor("connector", extractConnector)

  val connector: Endpoint[Connector] = body.as[Connector]
  val connectorMeta: Endpoint[ConnectorMeta] = body.as[ConnectorMeta]

  val getConnectors: Endpoint[List[Connector]] =
    get(END_POINT) {
      Ok(Connector.getAll())
    } mapAsync { cs: List[Connector] =>
      KafkaConnectClient.getConnectors().map { tryConnectorNames: Try[List[String]] =>

        tryConnectorNames match {
          case Failure(cause) => throw cause // TODO BadRequest
          case Success(runningConnectorNames) =>
            cs.foreach { c =>
              if (runningConnectorNames.contains(c.name)) {
                val updatedMeta = c._meta.copy(running = true)
                Connector.upsert(c.copy(_meta = updatedMeta))
              }
            }
        }

      }
    } mapOutput { _ =>
      Ok(Connector.getAll())
    }

  val getConnector: Endpoint[Connector] =
    get(END_POINT :: connectorFromName) { c: Connector =>
      Ok(c)
    } mapAsync { c: Connector =>
      KafkaConnectClient.getConnector(c.name).map { tryConnectorJson: Try[JsonObject] =>

        tryConnectorJson match {
          case Success(connectorJson) =>
            val updatedMeta = c._meta.copy(running = true)
            val connectorJsonCursor = Json.fromJsonObject(connectorJson).hcursor
            val updatedConnector = connectorJsonCursor.get[JsonObject]("config") match {
              case Xor.Right(updatedConfig) =>
                c.copy(_meta = updatedMeta, config = updatedConfig)
              case Xor.Left(error) =>
                c.copy(_meta = updatedMeta) // TODO: logging, error
            }

            Connector.upsert(updatedConnector)
            updatedConnector

          case Failure(cause) =>
            c
        }
      }
    }

  val postConnector: Endpoint[Connector] = post(END_POINT :: connector) {
    (c: Connector) =>
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

  val putConnectorMeta: Endpoint[Connector] =
    put(END_POINT :: connectorFromName :: "_meta" :: connectorMeta) {
      (c: Connector, requestedMeta: ConnectorMeta) =>
        {
          val currentMeta = c._meta

          if (currentMeta == requestedMeta) {
            Conflict(
                new RuntimeException(ErrorCode.CANNOT_UPDATE_DUPLICATED_META)
            )
          } else if (currentMeta.running &&
                     (currentMeta.tags != requestedMeta.tags ||
                         currentMeta.enabled != requestedMeta.enabled)) {

            /** already running, but requested to update meta except 'running' field */
            BadRequest(
                new RuntimeException(
                    ErrorCode.CANNOT_MODIFY_RUNNING_CONNECTOR_META)
            )
          } else if (!currentMeta.enabled &&
                     (currentMeta.tags != requestedMeta.tags ||
                         requestedMeta.running)) {

            /** already disabled, but requested to run the connector or update tags */
            BadRequest(
                new RuntimeException(
                    ErrorCode.CANNOT_MODIFY_DISABLED_CONNECTOR_META)
            )
          } else if (!requestedMeta.enabled && requestedMeta.running) {

            /** inconsistency in the requested meta */
            BadRequest(
                new RuntimeException(
                    ErrorCode.CANNOT_RUN_CONNECTOR_WHILE_DISABLING)
            )
          } else {
            val updatedConnector = c.copy(_meta = requestedMeta)
            Connector.upsert(updatedConnector)
            Ok(updatedConnector)
          }
        }
    }

  val api: Service[Request, Response] =
    (getConnectors :+: getConnector :+: postConnector :+: putConnectorMeta).toService
}
