package io.github.lambda.model


object MongoUtil {
  import com.mongodb.casbah.Imports._

  val MONGO_HOST = "localhost" // TODO: config
  val MONGO_PORT = 27017 // TODO: config
  val MONGO_DB_NAME = "kafkalot-local" // TODO: config

  lazy val mongoClient = MongoClient(MONGO_HOST, MONGO_PORT)
  lazy val mongoDb = mongoClient(MONGO_DB_NAME)
}
