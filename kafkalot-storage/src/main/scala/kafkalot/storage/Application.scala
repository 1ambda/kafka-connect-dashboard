package kafkalot.storage

import java.util.concurrent.atomic.AtomicBoolean

import com.twitter.finagle.Http
import com.twitter.finagle.http.filter.Cors
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

object Application extends App with LazyLogging {
  private val shutdown = new AtomicBoolean(false)

  /** use `application/json` as Content-Type of error response */
  implicit val encodeException: Encoder[Exception] = Encoder.instance(e =>
    Json.obj(
      "error_type" -> e.getClass.getCanonicalName.asJson
      , "error_message" -> e.getMessage.asJson
    )
  )

  val corsFilter = new Cors.HttpFilter(Cors.Policy(
    allowsOrigin = { origin: String => Some(origin) }
    , allowsMethods = { method: String => Some(Seq("GET", "POST", "PUT", "DELETE")) }
    , allowsHeaders = { headers: Seq[String] => Some(headers) }
    , supportsCredentials = true
  ))

  val service = (StaticFileApi.api :+: StorageApi.api).toService

  def shutdownHook: Unit = {
    val wasShuttingDown = shutdown.getAndSet(true)

    if (!wasShuttingDown) {
      logger.info("Stopping kafkalot-storage...")

      service.close()
      MongoUtil.mongoClient.close()

      logger.info("Stopped kafkalot-storage")
    }
  }

  def start() = {
    logger.info("Starting kafkalot-storage...")
    sys.addShutdownHook(shutdownHook)

    Await.ready(
      Http.server.serve(s":${Configuration.app.port}"
        , corsFilter andThen service)
    )
  }

  start()
}

