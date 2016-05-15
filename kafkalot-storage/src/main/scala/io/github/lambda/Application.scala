package io.github.lambda

import com.twitter.finagle.Http
import com.twitter.util.Await
import io.github.lambda.api.StorageApi
import io.github.lambda.security.CorsFilter

object Application extends App {

  val corsFilter = new CorsFilter
  val service = StorageApi.api

  Await.ready(Http.server.serve(":3003", corsFilter andThen service))
}
