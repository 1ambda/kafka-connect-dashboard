package kafkalot.storage

import com.twitter.finagle.Http
import com.twitter.util.Await
import com.typesafe.scalalogging.LazyLogging

import io.finch._
import io.finch.circe._
import io.circe._
import io.circe.generic.auto._
import io.circe.parser._
import io.circe.syntax._
import io.circe.jawn._
import shapeless._

import kafkalot.storage.api._
import kafkalot.storage.model.MongoUtil
import kafkalot.storage.security.CorsFilter

object Application extends App with LazyLogging {

  /** use `application/json` as Content-Type of error response */
  implicit val encodeException: Encoder[Exception] = Encoder.instance(e =>
    Json.obj(
      "error_type" -> e.getClass.getCanonicalName.asJson
      , "error_message" -> e.getMessage.asJson
    )
  )

  val corsFilter = new CorsFilter
  val service = (StaticFileApi.api :+: StorageApi.api).toService

  sys.addShutdownHook {
    logger.info("Stopping kafkalot-storage...")

    service.close()
    MongoUtil.mongoClient.close()

    logger.info("Stopped kafkalot-storage")
  }

  Await.ready(
    Http.server.serve(s":${Configuration.app.port}",
    corsFilter andThen service)
  )
}

