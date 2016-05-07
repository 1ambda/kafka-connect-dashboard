package io.github.lambda.api

import cats.std.int._
import com.twitter.finagle.Service
import com.twitter.finagle.http.{Request, Response}
import io.circe.generic.auto._
import io.finch._
import io.finch.circe._
import io.github.lambda.exception.ErrorCode
import io.github.lambda.model.{ConnectorMeta, Connector}

object ConnectorApi {

  val END_POINT = "connectors"

  def extractConnector(name: String): Option[Connector] = Connector.get(name)
  object connectorFromName extends Extractor("connector", extractConnector)
  val connector: Endpoint[Connector] = body.as[Connector]
  val connectorMeta: Endpoint[ConnectorMeta] = body.as[ConnectorMeta]

  val getConnectors: Endpoint[List[Connector]] = get(END_POINT) {
    Ok(Connector.getAll())
  }

  val getConnector: Endpoint[Connector] = get(END_POINT :: connectorFromName) { (c: Connector) =>
    Ok(c)
  }

  val postConnector: Endpoint[Connector] = post(END_POINT :: connector) { (c: Connector) =>
    Connector.get(c.name) match {
      case Some(_) =>
        Conflict(ErrorCode.genConnectorNameDuplicated)
      case None =>
        if (c._meta.running) {
          BadRequest(ErrorCode.genCannotCreateRunningConnector)
        } else {
          Connector.upsert(c)
          Created(c)
        }
    }
  }

  val putConnectorMeta: Endpoint[Connector] = put(END_POINT :: connectorFromName :: "_meta" :: connectorMeta) {
    (c: Connector, requestedMeta: ConnectorMeta) => {
      val currentMeta = c._meta

      if (currentMeta == requestedMeta) {
        Conflict(ErrorCode.genCannotUpdateDuplicatedMeta)
      }
      else if (currentMeta.running
        && (currentMeta.tags != requestedMeta.tags || currentMeta.enabled != requestedMeta.enabled)) {
        /** already running, but requested to update meta except 'running' field */
        BadRequest(ErrorCode.genCannotModifyRunningConnectorMeta)
      }
      else if (!currentMeta.enabled
        && (currentMeta.tags != requestedMeta.tags || requestedMeta.running)) {
        /** already disabled, but requested to run the connector or update tags */
        BadRequest(ErrorCode.genCannotModifyDisabledConnectorMeta)
      }
      else if (!requestedMeta.enabled && requestedMeta.running) {
        /** inconsistency in the requested meta */
        BadRequest(ErrorCode.genCannotRunConnectorWhileDisabling)
      }
      else {
        val updatedConnector = c.copy(_meta = requestedMeta)
        Connector.upsert(updatedConnector)
        Ok(updatedConnector)
      }
    }
  }

  val api: Service[Request, Response] = (
    getConnectors :+: getConnector :+: postConnector :+: putConnectorMeta).toService
}
