/** import sbt-native-packager keys */
enablePlugins(JavaAppPackaging)

lazy val commonSettings = Seq(
    organization := "io.github.lambda",
    version := "0.0.1",
    scalaVersion := "2.11.8",
    resolvers ++= Seq(
      Resolver.sonatypeRepo("releases"),
      Resolver.sonatypeRepo("snapshots"),
      "twitter-repo" at "http://maven.twttr.com"
    )
  )

lazy val ROOT_PROJECT = Project(
    id = "kafkalot",
    base = file("."),
    settings = commonSettings ++ Seq(
      mainClass in Compile := Some("io.github.lambda.kafkalot.storage.Application")
    ),
    aggregate = Seq(PROJECT_STORAGE)
  ).dependsOn(PROJECT_STORAGE)

lazy val PROJECT_STORAGE = Project("kafkalot-storage", file("kafkalot-storage"))
  .settings(commonSettings: _*)
  .settings(
    libraryDependencies ++= Dependencies.STORAGE.value)

lazy val PROJECT_UI = Project(
  "kafkalot-ui", file("kafkalot-ui")
)

cancelable in Global := true
