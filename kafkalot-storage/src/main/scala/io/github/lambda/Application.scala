package io.github.lambda

import com.twitter.finagle.Http
import com.twitter.util.Await
import io.github.lambda.api.ConnectorApi
import io.github.lambda.security.CorsFilter

object Application extends App {

  val corsFilter = new CorsFilter

  Await.ready(Http.server.serve(":3003", corsFilter andThen ConnectorApi.api))
}
