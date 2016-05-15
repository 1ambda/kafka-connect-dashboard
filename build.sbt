lazy val SCALA_VERSION = "2.11.7"

lazy val LIB_VERSION_SCALA_TEST = "2.2.4"
lazy val LIB_VERSION_FINCH = "0.10.0"
lazy val LIB_VERSION_SHAPELESS = "2.3.0"
lazy val LIB_VERSION_CIRCLE = "0.4.1"
lazy val LIB_VERSION_TWITTER_SERVER = "1.19.0"

lazy val TEST_DEPENDENCIES = Seq(
  "org.scalatest" %% "scalatest" % LIB_VERSION_SCALA_TEST
)

lazy val commonSettings = Seq(
  organization := "io.github.lambda",
  version := "0.0.1",
  scalaVersion := "2.11.7",
  resolvers ++= Seq(
    Resolver.sonatypeRepo("releases"),
    Resolver.sonatypeRepo("snapshots"),
    "twitter-repo" at "http://maven.twttr.com"
  )
)

lazy val PROJECT_STORAGE = Project("kafkalot-storage", file("kafkalot-storage"))
  .settings(commonSettings: _*)
  .settings(
    libraryDependencies ++= Seq(
      "com.github.finagle" %% "finch-core" % LIB_VERSION_FINCH,
      "com.github.finagle" %% "finch-circe" % LIB_VERSION_FINCH,
      "com.github.finagle" %% "finch-test" % LIB_VERSION_FINCH,
      "com.chuusai" %% "shapeless" % LIB_VERSION_SHAPELESS,
      "io.circe" %% "circe-core" % LIB_VERSION_CIRCLE,
      "io.circe" %% "circe-generic" % LIB_VERSION_CIRCLE,
      "io.circe" %% "circe-parser" % LIB_VERSION_CIRCLE
    ) ++ TEST_DEPENDENCIES.map(_ % "test"))

lazy val PROJECT_UI = Project(
  "kafkalot-ui", file("kafkalot-ui")
)
