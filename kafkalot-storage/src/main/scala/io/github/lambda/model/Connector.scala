package io.github.lambda.model

import io.circe._, io.circe.generic.auto._, io.circe.jawn._, io.circe.syntax._

import scala.collection.mutable

case class ConnectorMeta(enabled: Boolean,
                         running: Boolean,
                         tags: List[String])
case class Connector(name: String, config: JsonObject, _meta: ConnectorMeta)

object Connector {

  val FIELD_NAME_META = "_meta"

  private[this] val db = mutable.Map.empty[String, Connector]

  def get(name: String): Option[Connector] = synchronized { db.get(name) }
  def getAll(): List[Connector] = synchronized { db.values.toList }
  def upsert(c: Connector): Unit = synchronized { db += (c.name -> c) }
  def delete(name: String): Unit = synchronized { db -= name }

  /** fixtures */
  val cs = List(
      Connector(
          "kafka-connect-console-sink-143",
          JsonObject.empty,
          ConnectorMeta(true, true, List("console"))
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
