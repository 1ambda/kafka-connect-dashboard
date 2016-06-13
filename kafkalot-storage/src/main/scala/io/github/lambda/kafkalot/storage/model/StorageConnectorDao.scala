package io.github.lambda.kafkalot.storage.model

import io.circe._
import io.circe.generic.auto._
import io.circe.jawn._
import io.circe.syntax._
import com.twitter.util.Future
import com.novus.salat._
import com.novus.salat.global._
import com.mongodb.casbah.Imports._
import io.github.lambda.kafkalot.storage.exception.ErrorCode

/**
  * StorageConnector including the stringified `config` field
  *
  * since MongoDB doesn't allow to save BSON fields including `.` in field key (e.g `tasks.max`)
  * so that we have to stringify StroageConnector.config before saving it
  **/
case class PersistedStorageConnector(name: String,
                                     config: String,
                                     _meta: StorageConnectorMeta) {

  def toStorageConnector: StorageConnector = {
    val jsonConfig = decode[JsonObject](config).valueOr(throw _)
    StorageConnector(name, jsonConfig, _meta)
  }
}

object StorageConnectorDao {
  import MongoUtil._

  val COLLECTION_NAME_CONNECTOR = "connector"

  lazy val collection = mongoDb(COLLECTION_NAME_CONNECTOR)

  def createSelectQuery(sc: StorageConnector): MongoDBObject =
    createSelectQuery(sc.name)

  def createSelectQuery(name: String): MongoDBObject =
    MongoDBObject(StorageConnector.FIELD_KEY_NAME -> name)


  def convertStorageConnectorToDBObject(sc: StorageConnector): MongoDBObject = {
    val pc = sc.toPersistedStorageConnector
    grater[PersistedStorageConnector].asDBObject(pc)
  }

  def convertDBObjectToStorageConnector(dbo: DBObject): StorageConnector = {
    val pc = grater[PersistedStorageConnector].asObject(dbo)
    pc.toStorageConnector
  }

  def insert(sc: StorageConnector): Future[StorageConnector] = {

    get(sc.name) map { scOption: Option[StorageConnector] =>
      scOption match {
        case Some(_) =>
          throw new RuntimeException(ErrorCode.STORAGE_CONNECTOR_ALREADY_EXISTS)
        case None =>
          val dbo = convertStorageConnectorToDBObject(sc)
          collection.insert(dbo)
          sc
      }
    }
  }

  def update(sc: StorageConnector): Future[StorageConnector] = {
    get(sc.name) map { scOption: Option[StorageConnector] =>
      scOption match {
        case Some(_) =>
          val query = createSelectQuery(sc)
          val dbo = convertStorageConnectorToDBObject(sc)
          collection.update(query, dbo, upsert = true)
          sc
        case None =>
          throw new RuntimeException(ErrorCode.STORAGE_CONNECTOR_DOES_NOT_EXIST)
      }
    }
  }

  def delete(connectorName: String): Future[Boolean] = {
    Future {
      val query = createSelectQuery(connectorName)
      val result = collection.remove(query)

      if (result.getN < 1) throw new RuntimeException(ErrorCode.STORAGE_CONNECTOR_DOES_NOT_EXIST)
      else true
    }
  }

  def get(sc: StorageConnector): Future[Option[StorageConnector]] =
    get(sc.name)

  def get(name: String): Future[Option[StorageConnector]] = {
    Future {
      val query = createSelectQuery(name)
      collection.findOne(query) map { convertDBObjectToStorageConnector(_) }
    }
  }

  def getAll(): Future[List[StorageConnector]] = {
    Future {
      collection.find().toList map { convertDBObjectToStorageConnector(_) }
    }
  }

}
