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

object KafkaConnectClient {

  val CONTAINER_HOST = "localhost" // TODO config
  val CONTAINER_PORT = "8083" // TODO config
  val RESOURCE_CONNECTORS = "connectors"

  val client = Http.client.newService(s"${CONTAINER_HOST}:${CONTAINER_PORT}")

  def buildConnectorsUrl(): String =
    s"http://${CONTAINER_HOST}:${CONTAINER_PORT}/${RESOURCE_CONNECTORS}"

  def buildConnectorUrl(name: String): String =
    s"http://${CONTAINER_HOST}:${CONTAINER_PORT}/${RESOURCE_CONNECTORS}/${name}"

  def createGetRequest(url: URL): Request = {
    RequestBuilder()
      .setHeader(HttpHeaders.Names.CONTENT_TYPE, "application/json")
      .url(url)
      .buildGet()
  }

  def getConnectors(): Future[List[String]] = {
    val request = createGetRequest(new URL(buildConnectorsUrl()))

    client(request).map { response =>
      decode[List[String]](response.getContentString()) match {
        case Xor.Right(connectors) => connectors
        case Xor.Left(error) => throw new RuntimeException(error)
      }
    }
  }

  def getConnector(name: String): Future[JsonObject] = {
    val request = createGetRequest(new URL(buildConnectorUrl(name)))

    client(request).map { response =>
      decode[JsonObject](response.getContentString()) match {
        case Xor.Right(json) => json
        case Xor.Left(error) => throw new RuntimeException(error)
      }
    }
  }
}
