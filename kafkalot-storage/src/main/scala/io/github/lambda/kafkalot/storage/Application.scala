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
    Http.server.serve(s":${Configuration.app.port}",
    corsFilter andThen service)
  )
}

