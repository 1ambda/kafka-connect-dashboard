import sbt._
import sbt.Keys._

object NpmPlugin extends AutoPlugin {
  object autoImport {
    val npm = NpmPluginKeys.npm
    var targetDirectory = NpmPluginKeys.targetDirectory
    val npmTasks = NpmPluginKeys.npmTasks

    type NpmTask = NpmTypes.NpmTask
    val NpmTask = NpmTypes.NpmTask
    type NpmEnv = NpmTypes.NpmEnv
    val NpmEnv = NpmTypes.NpmEnv
  }

  override def projectSettings = NpmSettings.baseNpmSettings
}

object NpmPluginKeys {
  import NpmTypes. _

  val npm = taskKey[Unit]("NPM task")
  val targetDirectory = SettingKey[File]("Target Directory where npm command will be executed.")
  var npmTasks = SettingKey[Seq[NpmTask]]("NPM tasks to be executed.")
}

object NpmSettings {
  import NpmPluginKeys._
  import NpmTypes._

  def createEnvString(envs: Seq[NpmEnv]): String = {
    if (envs.isEmpty) ""
    else envs.map(env => s"${env.key}=${env.value}").mkString(" ")
  }

  def createEnvTuples(envs: Seq[NpmEnv]): Seq[(String, String)] = {
    envs.map { env => (env.key, env.value) }
  }

  lazy val baseNpmSettings = Seq(
    npm := {
      val log = streams.value.log
      val targetDirectory = (NpmPluginKeys.targetDirectory in npm).value
      val npmTasks = (NpmPluginKeys.npmTasks in npm).value

      log.info(s"NPM TargetDirectory ${targetDirectory.getAbsolutePath}")
      log.info(s"NPM Tasks: ${npmTasks}")

      npmTasks.map { task =>
        val command = task.command
        val envString = createEnvString(task.envs)
        val commandString = if (envString.isEmpty) s"npm ${command}" else s"${envString} npm ${command}"

        log.info(s"Executing: ${commandString}")
        val processResult = Process(
          s"npm ${command}",
          targetDirectory,
          createEnvTuples(task.envs):_*
        ).!

        if (processResult != 0)  {
          throw new Exception(s"Failed: ${commandString}")
        }
      }

    }
  )
}

object NpmTypes {
  case class NpmTask(command: String, envs: Seq[NpmEnv] = Seq())
  case class NpmEnv(key: String, value: String)
}
