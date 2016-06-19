/** project setting */

lazy val commonSettings = Seq(
    organization := "io.github.lambda",
    version := "0.0.1",
    scalaVersion := "2.11.8",
    resolvers ++= Seq(
      Resolver.sonatypeRepo("releases"),
      Resolver.sonatypeRepo("snapshots"),
      "twitter-repo" at "http://maven.twttr.com",
      Resolver.url("bintray-alpeb-sbt-plugins", url("http://dl.bintray.com/alpeb/sbt-plugins"))(Resolver.ivyStylePatterns)
    )
  )

lazy val PROJECT_STORAGE = Project("kafkalot-storage", file("kafkalot-storage"))
  .enablePlugins(JavaServerAppPackaging)
  .settings(commonSettings: _*)
  .settings(
    libraryDependencies ++= Dependencies.STORAGE.value
    , mainClass in Compile := Some("io.github.lambda.kafkalot.storage.Application")
    , mappings in Universal += { (resourceDirectory in Compile).value / "application.conf" -> "conf/application.conf" }
    , bashScriptExtraDefines += """addJava "-Dconfig.file=${app_home}/../conf/application.conf""""
    , mappings in Universal += { (resourceDirectory in Compile).value / "logback.xml" -> "conf/logback.xml" }
    , bashScriptExtraDefines += """addJava "-Dlogback.configurationFile=${app_home}/../conf/logback.xml""""
    , topLevelDirectory := None
    , target in Universal := file(baseDirectory.value.getParent + "/dist/storage")
  )

lazy val PROJECT_UI = Project(
  "kafkalot-ui", file("kafkalot-ui")
)

cancelable in Global := true
