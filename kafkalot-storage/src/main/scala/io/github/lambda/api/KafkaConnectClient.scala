package io.github.lambda.api

import java.net.URL

import com.twitter.finagle.Http
import com.twitter.finagle.http._
import com.twitter.util.Future
import org.jboss.netty.handler.codec.http.HttpHeaders
import io.circe._
import io.circe.generic.auto._
import io.circe.parser._
import io.circe.syntax._
import cats.data.Xor
import com.twitter.io.Buf
import io.github.lambda.exception.ErrorCode

import scala.util.{Try, Success, Failure}

object KafkaConnectClient {

  val CONTAINER_HOST = "localhost" // TODO config
  val CONTAINER_PORT = "8083" // TODO config
  val RESOURCE_CONNECTORS = "connectors"
  val RESOURCE_CONFIG = "config"

  val client = Http.client.newService(s"${CONTAINER_HOST}:${CONTAINER_PORT}")

  def buildConnectorsUrl(): String =
    s"http://${CONTAINER_HOST}:${CONTAINER_PORT}/${RESOURCE_CONNECTORS}"

  def buildConnectorUrl(name: String): String =
    s"http://${CONTAINER_HOST}:${CONTAINER_PORT}/${RESOURCE_CONNECTORS}/${name}"

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

  def decodeResponseToJsonObject(responseContent: String): JsonObject = {
    decode[JsonObject](responseContent) match {
      case Xor.Right(jsonObject) => jsonObject
      case Xor.Left(error) => throw new RuntimeException(error)
    }
  }

  def getConnectors(): Future[Try[List[String]]] = {
    val request = createGetRequest(new URL(buildConnectorsUrl()))

    client(request).map { response =>
      if (response.getStatusCode() != 200 /** OK */ )
        Failure(new RuntimeException(ErrorCode.FAILED_TO_GET_CONNECTORS))

      decode[List[String]](response.getContentString()) match {
        case Xor.Right(jsonObject) => Success(jsonObject)
        case Xor.Left(error) => Failure(new RuntimeException(error))
      }
    }
  }

  def getConnector(name: String): Future[Try[JsonObject]] = {
    val request = createGetRequest(new URL(buildConnectorUrl(name)))

    client(request).map { response =>
      if (response.getStatusCode() != 200 /** OK */ )
        Failure(new RuntimeException(ErrorCode.FAILED_TO_GET_CONNECTOR))

      Success(decodeResponseToJsonObject(response.getContentString()))
    }
  }

  def updateConnectorConfig(name: String, config: Json): Future[Try[JsonObject]] = {
    val request = createPutRequest(
        new URL(buildConnectorConfigUrl(name)), config)

    client(request).map { response =>
      if (response.getStatusCode() != 200 /** OK */ )
        Failure(new RuntimeException(ErrorCode.FAILED_TO_UPDATE_CONNECTOR_CONFIG))

      Success(decodeResponseToJsonObject(response.getContentString()))
    }
  }

  def startConnector(config: Json): Future[Try[JsonObject]] = {
    val request = createPostRequest(new URL(buildConnectorsUrl()), config)

    client(request).map { response =>
      if (response.getStatusCode() != 201 /** CREATED */ )
        Failure(new RuntimeException(ErrorCode.FAILED_TO_START_CONNECTOR))

      Success(decodeResponseToJsonObject(response.getContentString()))
    }
  }

  def stopConnector(name: String): Future[Try[Int]] = {
    val request = createDeleteRequest(new URL(buildConnectorUrl(name)))

    client(request).map { response =>
      if (response.getStatusCode() != 204 /** NO CONTENT */ )
        Failure(new RuntimeException(ErrorCode.FAILED_TO_STOP_CONNECTOR))

      Success(response.getStatusCode())
    }
  }
}
