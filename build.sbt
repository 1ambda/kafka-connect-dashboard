/** project setting */

lazy val commonSettings = Seq(
    organization := "kafkalot",
    resolvers ++= Seq(
      Resolver.sonatypeRepo("releases"),
      Resolver.sonatypeRepo("snapshots"),
      "twitter-repo" at "http://maven.twttr.com",
      Resolver.url("bintray-alpeb-sbt-plugins", url("http://dl.bintray.com/alpeb/sbt-plugins"))(Resolver.ivyStylePatterns)
    )
  )

lazy val PROJECT_ROOT = Project(
  id = "kafkalot",
  base = file("."),
  settings = commonSettings,
  aggregate = Seq(PROJECT_STORAGE, PROJECT_UI)
)

lazy val PROJECT_STORAGE = Project("kafkalot-storage", file("kafkalot-storage"))
  .enablePlugins(sbtdocker.DockerPlugin, JavaAppPackaging)
  .settings(commonSettings: _*)
  .settings(
    version := "0.0.1"
    , scalaVersion := "2.11.8"
    , libraryDependencies ++= Dep.STORAGE.value
    , mainClass in Compile := Some("io.github.lambda.kafkalot.storage.Application")
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
        entryPoint(s"$targetDir/bin/${executableScriptName.value}")
        copy(appDir, targetDir)
      }
    }
    , imageNames in docker := Seq(
      ImageName(s"${organization.value}/${name.value}:latest"),
      ImageName(
        namespace = Some(organization.value),
        repository = name.value,
        tag = Some("v" + version.value)
      )
    )
  )

lazy val PROJECT_UI = Project("kafkalot-ui", file("kafkalot-ui"))
  .enablePlugins(sbtdocker.DockerPlugin, NpmPlugin)
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
    , dockerfile in docker := {
      val appDir: File = file(baseDirectory.value.getParent + "/dist/ui")
      val targetAppDir = "/usr/share/nginx/html"
      
      val nginxConf: File = baseDirectory.value / "resource" / "nginx" / "default.conf"
      val targetConfDir = "/etc/nginx/conf.d/"

      new Dockerfile {
        from("nginx:1.10.1")
        copy(appDir, targetAppDir)
        copy(nginxConf, targetConfDir)
      }
    }
    , imageNames in docker := Seq(
      ImageName(s"${organization.value}/${name.value}:latest"),
      ImageName(
        namespace = Some(organization.value),
        repository = name.value,
        tag = Some("v" + version.value)
      )
    )
    , docker <<= docker dependsOn npm
  )

cancelable in Global := true

parallelExecution in Global := false