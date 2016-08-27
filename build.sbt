/** project setting */

val DockerNamespace = "1ambda"

lazy val commonSettings = Seq(
    organization := "kafkalot",
    resolvers ++= Seq(
      Resolver.jcenterRepo,
      Resolver.sonatypeRepo("releases"),
      Resolver.sonatypeRepo("snapshots"),
      "twitter-repo" at "http://maven.twttr.com",
      Resolver.url("bintray-alpeb-sbt-plugins", url("http://dl.bintray.com/alpeb/sbt-plugins"))(Resolver.ivyStylePatterns)
    )
  )

lazy val PROJECT_UI = Project("kafkalot-ui", file("kafkalot-ui"))
  .enablePlugins(NpmPlugin)
  .settings(commonSettings: _*)
  .settings(
    version := "0.0.1"
    , targetDirectory in npm := baseDirectory.value
    , npmTasks in npm := Seq(
      NpmTask("install"),
      NpmTask("run test"),
      NpmTask(
        "run build",
        Seq(
          NpmEnv("KAFKALOT_TITLE", "kafkalot"),
          NpmEnv("KAFKALOT_STORAGES", "[{\"name\":\"kafkalot-storage\",\"address\":\"\"}]")
        )
      )
    )
  )

lazy val PROJECT_STORAGE = Project("kafkalot-storage", file("kafkalot-storage"))
  .enablePlugins(sbtdocker.DockerPlugin, JavaAppPackaging)
  .settings(commonSettings: _*)
  .settings(
    version := "0.0.1"
    , scalaVersion := "2.11.8"
    , libraryDependencies ++= Dep.STORAGE.value
    , mainClass in Compile := Some("kafkalot.storage.Application")
    , mappings in Universal += { (resourceDirectory in Compile).value / "application.conf" -> "conf/application.conf" }
    , bashScriptExtraDefines += """addJava "-Dconfig.file=${app_home}/../conf/application.conf""""
    , mappings in Universal += { (resourceDirectory in Compile).value / "logback.xml" -> "conf/logback.xml" }
    , bashScriptExtraDefines += """addJava "-Dlogback.configurationFile=${app_home}/../conf/logback.xml""""
    , topLevelDirectory := None
    , target in Universal := file(baseDirectory.value.getParent + "/dist/storage")
    , dockerfile in docker := {
      val appDir: File = stage.value
      val targetDir = "/app"

      new Dockerfile {
        from("java:8")
        copy(appDir, targetDir)
        entryPoint(s"$targetDir/bin/${executableScriptName.value}")
        expose(3003)
      }
    }
    , imageNames in docker := Seq(
      ImageName(s"${DockerNamespace}/${name.value}:latest"),
      ImageName(
        namespace = Some(DockerNamespace),
        repository = name.value,
        tag = Some("v" + version.value)
      )
    )
    , packageBin in Compile <<= (packageBin in Compile).dependsOn(npm in PROJECT_UI)
  )


cancelable in Global := true

parallelExecution in Global := false
