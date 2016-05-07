package io.github.lambda

import com.twitter.finagle.Http
import com.twitter.util.Await
import io.github.lambda.api.ConnectorApi

object Application extends App {

  Await.ready(Http.server.serve(":8081", ConnectorApi.api))
}
