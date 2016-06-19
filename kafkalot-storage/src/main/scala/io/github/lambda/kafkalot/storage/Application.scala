package io.github.lambda.kafkalot.storage

import com.twitter.finagle.Http
import com.twitter.util.Await
import com.typesafe.config.ConfigFactory
import io.github.lambda.kafkalot.storage.api.StorageApi
import io.github.lambda.kafkalot.storage.security.CorsFilter
import io.finch.circe._
import io.circe._
import io.circe.generic.auto._
import io.circe.parser._
import io.circe.syntax._
import io.circe.jawn._
import shapeless._

object Application extends App {

  val corsFilter = new CorsFilter
  val service = (StorageApi.api).toService

  // TODO: gradeful shutdown
  Await.ready(
    Http.server.serve(s":${ApplicationConfig.port}",
    corsFilter andThen service)
  )
}

object ApplicationConfig {
  val conf = ConfigFactory.load()

  /** validate config on startup time */
  val port = conf.getString("kafkalot.storage.app.port")
  private val connectorClusterHost = conf.getString("kafkalot.storage.connector.clusterHost")
  private val connectorClusterPort = conf.getString("kafkalot.storage.connector.clusterPort")
  val connectorClusterUrl = s"${connectorClusterHost}:${connectorClusterPort}"

  val mongoHost = conf.getString("kafkalot.storage.mongo.host")
  val mongoPort = conf.getInt("kafkalot.storage.mongo.port")
  val mongoDatabase = conf.getString("kafkalot.storage.mongo.db")
}
