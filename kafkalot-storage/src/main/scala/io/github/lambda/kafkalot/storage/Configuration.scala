package io.github.lambda.kafkalot.storage

import com.typesafe.config.ConfigFactory

case class MongoConfiguration(host: String, port: Int, db: String)
case class ConnectorConfiguration(clusterHost: String, clusterPort: String)
case class AppConfiguration(port: Int)

object Configuration {
  import net.ceedubs.ficus.Ficus._
  import net.ceedubs.ficus.readers.ArbitraryTypeReader._

  /** validate config on startup time */

  val connector =
    ConfigFactory.load().as[ConnectorConfiguration]("kafkalot.storage.connector")

  val mongo =
    ConfigFactory.load().as[MongoConfiguration]("kafkalot.storage.mongo")

  val app =
    ConfigFactory.load().as[AppConfiguration]("kafkalot.storage.app")
}
