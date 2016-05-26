package io.github.lambda.kafkalot.storage

import com.twitter.finagle.Http
import com.twitter.util.Await
import io.github.lambda.kafkalot.storage.api.StorageApi
import io.github.lambda.kafkalot.storage.security.CorsFilter

object Application extends App {

  val corsFilter = new CorsFilter
  val service = StorageApi.api

  // TODO: gradeful shutdown
  Await.ready(Http.server.serve(":3003", corsFilter andThen service))
}
