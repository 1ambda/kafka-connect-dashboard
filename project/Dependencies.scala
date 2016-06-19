import sbt._
import Keys._

object Dependencies {

  object V {
    val SCALA_TEST = "2.2.4"
    val FINCH = "0.10.0"
    val SHAPELESS = "2.3.0"
    val CIRCLE = "0.4.1"
    val TWITTER_SERVER = "1.19.0"
    val MONGO_CASBAH = "3.1.1"
    val SALAT = "1.9.9"
    val TYPESAFE_CONFIG = "1.3.0"
    val SLF4j = "1.7.21"
    val LOGBACK = "1.1.7"
  }

  // Split accordingly
  val STORAGE = Def.setting(Seq(
    "com.github.finagle" %% "finch-core" % V.FINCH,
    "com.github.finagle" %% "finch-circe" % V.FINCH,
    "com.github.finagle" %% "finch-test" % V.FINCH,
    "com.chuusai" %% "shapeless" % V.SHAPELESS,
    "com.novus" %% "salat" % V.SALAT,
    "org.mongodb" %% "casbah" % V.MONGO_CASBAH,
    "io.circe" %% "circe-core" % V.CIRCLE,
    "io.circe" %% "circe-generic" % V.CIRCLE,
    "io.circe" %% "circe-parser" % V.CIRCLE,
    "com.typesafe" % "config" % V.TYPESAFE_CONFIG,
    "org.slf4j" % "slf4j-api" % V.SLF4j,
    "ch.qos.logback" % "logback-classic" % V.LOGBACK,
    "org.scalatest" %% "scalatest" % V.SCALA_TEST % "test"
  ))
}