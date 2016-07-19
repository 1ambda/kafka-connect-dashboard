package kafkalot.storage.model

import kafkalot.storage.Configuration


object MongoUtil {
  import com.mongodb.casbah.Imports._

  val MONGO_HOST = Configuration.mongo.host
  val MONGO_PORT = Configuration.mongo.port
  val MONGO_DB_NAME = Configuration.mongo.db

  lazy val mongoClient = MongoClient(MONGO_HOST, MONGO_PORT)
  lazy val mongoDb = mongoClient(MONGO_DB_NAME)
}
