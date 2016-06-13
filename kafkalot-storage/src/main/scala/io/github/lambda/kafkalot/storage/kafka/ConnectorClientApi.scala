package io.github.lambda.kafkalot.storage.kafka

import java.net.URL

import cats.data.Xor
import com.twitter.finagle.Http
import com.twitter.finagle.http._
import com.twitter.io.Buf
import com.twitter.util.Future
import io.circe._
import io.circe.generic.auto._
import io.circe.jawn._
import io.circe.syntax._
import io.github.lambda.kafkalot.storage.exception.ErrorCode
import io.github.lambda.kafkalot.storage.model.{StorageConnector, StorageConnectorMeta}
import org.jboss.netty.handler.codec.http.HttpHeaders

object ConnectorClientApi {

  val CONTAINER_HOST = "localhost" // TODO config
  val CONTAINER_PORT = "8083" // TODO config
  val RESOURCE_CONNECTORS = "connectors"
  val RESOURCE_CONFIG = "config"
  val RESOURCE_STATUS = "status"

  val client = Http.client.newService(s"${CONTAINER_HOST}:${CONTAINER_PORT}")

  def buildConnectorsUrl(): String =
    s"http://${CONTAINER_HOST}:${CONTAINER_PORT}/${RESOURCE_CONNECTORS}"

  def buildConnectorUrl(name: String): String =
    s"http://${CONTAINER_HOST}:${CONTAINER_PORT}/${RESOURCE_CONNECTORS}/${name}"

  def buildConnectorStatusUrl(name: String): String =
    s"${buildConnectorUrl(name)}/${RESOURCE_STATUS}"

  def buildConnectorConfigUrl(name: String): String =
    s"${buildConnectorUrl(name)}/${RESOURCE_CONFIG}"

  def getPreBuildJsonHeaderRequest() = {
    RequestBuilder().setHeader(
        HttpHeaders.Names.CONTENT_TYPE, "application/json")
  }

  def createDeleteRequest(url: URL): Request = {
    getPreBuildJsonHeaderRequest().url(url).buildDelete()
  }

  def createGetRequest(url: URL): Request = {
    getPreBuildJsonHeaderRequest().url(url).buildGet()
  }

  def createPutRequest(url: URL, payload: Json): Request = {
    getPreBuildJsonHeaderRequest()
      .url(url)
      .buildPut(Buf.Utf8(payload.toString))
  }

  def createPostRequest(url: URL, payload: Json): Request = {
    getPreBuildJsonHeaderRequest()
      .url(url)
      .buildPost(Buf.Utf8(payload.toString))
  }

  def deleteConnector(name: String): Future[Boolean] = {
    val request = createDeleteRequest(new URL(buildConnectorUrl(name)))

    client(request).map { response =>
      if (response.getStatusCode() != 200 /** OK */ )
        throw new RuntimeException(ErrorCode.FAILED_TO_DELETE_CONNECTOR)

      true
    }
  }

  def getConnectors(): Future[List[String]] = {
    val request = createGetRequest(new URL(buildConnectorsUrl()))

    client(request).map { response =>
      if (response.getStatusCode() != 200 /** OK */ )
        throw new RuntimeException(ErrorCode.FAILED_TO_GET_CONNECTORS)

      decode[List[String]](response.getContentString()).valueOr(throw _)
    }
  }

  def getConnector(name: String): Future[ExportedConnector] = {
    val reqGetConnector = createGetRequest(new URL(buildConnectorUrl(name)))
    val reqGetConnectorStatus = createGetRequest(new URL(buildConnectorStatusUrl(name)))

    val fConnector = client(reqGetConnector).map { response =>
      if (response.getStatusCode() != 200 /** OK */ )
        throw new RuntimeException(ErrorCode.FAILED_TO_GET_CONNECTOR)

      decode[Connector](response.getContentString()).valueOr(throw _)
    }

    val fConnectorStatus = client(reqGetConnectorStatus).map { response =>
      if (response.getStatusCode() != 200 /** OK */ )
        throw new RuntimeException(ErrorCode.FAILED_TO_GET_CONNECTOR_STATUS)

      decode[ConnectorStatus](response.getContentString()).valueOr(throw _)
    }

    for {
      connector <- fConnector
      connectorStatus <- fConnectorStatus
    } yield {
      ExportedConnector(
        connector.name,
        connectorStatus.connector.state,
        connector.config,
        connectorStatus.tasks,
        None
      )
    }
  }

  def updateConnectorConfig(rawConnector: RawConnector): Future[JsonObject] = {
    val request = createPutRequest(
      new URL(buildConnectorConfigUrl(rawConnector.name)),
      Json.fromJsonObject(rawConnector.config)
    )

    client(request).map { response =>
      if (response.getStatusCode() != 200 /** OK */ )
        throw new RuntimeException(ErrorCode.FAILED_TO_UPDATE_CONNECTOR_CONFIG)

      decode[JsonObject](response.getContentString()).valueOr(throw _)
    }
  }

  def startConnector(rawConnector: RawConnector): Future[JsonObject] = {
    val request = createPostRequest(
      new URL(buildConnectorsUrl()),
      rawConnector.asJson
    )

    client(request).map { response =>
      if (response.getStatusCode() != 201 /** CREATED */ )
        throw new RuntimeException(ErrorCode.FAILED_TO_START_CONNECTOR)

      decode[JsonObject](response.getContentString()).valueOr(throw _)
    }
  }

  def stopConnector(rawConnector: RawConnector): Future[Int] = {
    val request = createDeleteRequest(new URL(buildConnectorUrl(rawConnector.name)))

    client(request).map { response =>
      if (response.getStatusCode() != 204 /** NO CONTENT */ )
        throw new RuntimeException(ErrorCode.FAILED_TO_STOP_CONNECTOR)

      response.getStatusCode()
    }
  }
}

case class Connector(name: String, config: JsonObject)
case class ConnectorTask(state: String, id: Int, worker_id: String)
case class ConnectorState(state: String, worker_id: String)
case class ConnectorStatus(name: String, connector: ConnectorState, tasks: List[ConnectorTask])

object ConnectorState {
  val RUNNING = "RUNNING"
  val REGISTERED = "REGISTERED"
  val DISABLED = "DISABLED"
}

case class ExportedConnector(name: String,
                             state: String,
                             config: JsonObject,
                             tasks: List[ConnectorTask],
                             _meta: Option[StorageConnectorMeta])

case class RawConnector(name: String,
                        config: JsonObject) {
  def toInitialStorageConnector: StorageConnector = {
    StorageConnector(name, config, StorageConnectorMeta(true, Nil))
  }
}

