package io.github.lambda.model

import io.circe._
import io.circe.generic.auto._
import io.circe.jawn._
import io.circe.syntax._
import cats.data.Xor
import com.twitter.util.Future
import io.github.lambda.api.KafkaConnectClientApi

import scala.collection.mutable

case class ConnectorMeta(enabled: Boolean,
                         running: Boolean,
                         tags: List[String])
case class Connector(name: String, config: JsonObject, _meta: ConnectorMeta) {
  def getJsonWithoutMeta: JsonObject = {
    decode[JsonObject](this.asJson.toString) match {
      case Xor.Right(jsonObject) =>
        jsonObject.remove("_meta")
      case Xor.Left(cause) =>
        throw cause
    }
  }

  def stop: Future[Int] = KafkaConnectClientApi.stopConnector(name)
  def start: Future[JsonObject] = KafkaConnectClientApi.startConnector(getJsonWithoutMeta)
}

object Connector {

  val FIELD_NAME_META = "_meta"

  private[this] val db = mutable.Map.empty[String, Connector]

  def get(name: String): Option[Connector] = synchronized { db.get(name) }

  def getAll(): List[Connector] = synchronized { db.values.toList }

  def upsert(c: Connector): Connector = synchronized {
    db += (c.name -> c)
    c
  }

  def delete(name: String): Unit = synchronized {
    db -= name
  }

  def createJsonObjectFromString(str: String): JsonObject = {
    parse(str).getOrElse(Json.Null).asObject.get
  }

  /** fixtures */
  val cs = List(
      Connector(
          "kafka-connect-console-sink-143",
          createJsonObjectFromString("""
         {
           "connector.class": "io.github.lambda.ConsoleSinkConnector",
           "tasks.max": "4",
           "topics": "test-p4-1",
           "name": "kafka-connect-console-sink-143",
           "id": "console-connector-id-2"
         }
                                   """),
          ConnectorMeta(true, false, List("console"))
      ),
      Connector(
          "c1",
          JsonObject.empty,
          ConnectorMeta(true, false, List("akka"))
      ),
      Connector(
          "c2",
          JsonObject.empty,
          ConnectorMeta(true, false, List("batch"))
      ),
      Connector(
          "c3",
          JsonObject.empty,
          ConnectorMeta(false, false, List("spark-streaming"))
      )
  )

  cs.foreach { c =>
    upsert(c)
  }
}
