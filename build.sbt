/** project setting */

val DockerNamespace = "1ambda"

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
  )


/**
  * ${'"'} used to escape quote in string interpolation which is not supported currently
  * '\$' used for specify required a env var set (only '$' did not work)
  *
  * 1. substitute env variable `KAFKALOT_UI_STORAGE_HOST` and `KAFKALOT_UI_STORAGE_PORT`
  * 2. and copy into ${nginxConfgPath}
  * 3. cat ${nginxConfPath}
  * 4. run nginx
  *
  * ref
  * - https://github.com/docker-library/docs/issues/496
  * - https://hub.docker.com/_/nginx/
  */
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
      val appDir = file(baseDirectory.value.getParent + "/dist/ui")
      val targetAppDir = "/usr/share/nginx/html"
      val templateConfName = "default.template"
      val nginxConfName = "default.conf"
      val targetConfDir = "/etc/nginx/conf.d/"

      val templateConfPath = s"${targetConfDir}${templateConfName}"
      val nginxConfPath = s"${targetConfDir}${nginxConfName}"

      val nginxConfTemplate = baseDirectory.value / "resource" / "nginx" / templateConfName

      new Dockerfile {
        from("nginx:1.10.1")
        copy(appDir, targetAppDir)
        copy(nginxConfTemplate, targetConfDir)
        expose(80)
        cmdRaw(s"/bin/bash -c ${'"'}envsubst '\\$$KAFKALOT_UI_STORAGE_HOST \\$$KAFKALOT_UI_STORAGE_PORT' < ${templateConfPath} > ${nginxConfPath} && cat ${nginxConfPath} && nginx -g 'daemon off;'${'"'}")
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
    , docker <<= docker dependsOn npm
  )

cancelable in Global := true

parallelExecution in Global := false
