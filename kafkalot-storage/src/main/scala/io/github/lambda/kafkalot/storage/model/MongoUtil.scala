package io.github.lambda.kafkalot.storage.model

import io.github.lambda.kafkalot.storage.ApplicationConfig


object MongoUtil {
  import com.mongodb.casbah.Imports._

  val MONGO_HOST = ApplicationConfig.mongoHost
  val MONGO_PORT = ApplicationConfig.mongoPort
  val MONGO_DB_NAME = ApplicationConfig.mongoDatabase

  lazy val mongoClient = MongoClient(MONGO_HOST, MONGO_PORT)
  lazy val mongoDb = mongoClient(MONGO_DB_NAME)
}
