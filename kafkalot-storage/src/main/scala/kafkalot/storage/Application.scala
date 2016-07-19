package kafkalot.storage

import com.twitter.finagle.Http
import com.twitter.util.Await
import com.typesafe.scalalogging.LazyLogging
import io.circe.generic.auto._
import io.finch.circe._

import kafkalot.storage.api.StorageApi
import kafkalot.storage.security.CorsFilter

object Application extends App with LazyLogging {

  val corsFilter = new CorsFilter
  val service = (StorageApi.api).toService

  logger.info("Starting kafkalot-storage...")

  sys.addShutdownHook {
    logger.info("Stopping kafkalot-storage...")
    service.close()
    logger.info("Stopped kafkalot-storage")
  }

  Await.ready(
    Http.server.serve(s":${Configuration.app.port}",
    corsFilter andThen service)
  )
}

