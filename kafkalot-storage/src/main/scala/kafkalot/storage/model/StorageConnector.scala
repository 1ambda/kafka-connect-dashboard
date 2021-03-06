package kafkalot.storage.model

import io.circe._
import io.circe.generic.auto._
import io.circe.jawn._
import io.circe.syntax._
import cats.data.Xor
import com.twitter.util.Future
import kafkalot.storage.api.{ConnectorCommand, ConnectorTaskCommand}
import kafkalot.storage.exception.{FailedToGetConnectorsFromCluster, InvalidStorageConnectorCommand, InvalidStorageConnectorState, InvalidStorageConnectorTaskCommand}
import kafkalot.storage.kafka._

case class StorageConnectorMeta(enabled: Boolean,
                                tags: List[String])

case class StorageConnector(name: String,
                            config: JsonObject,
                            _meta: StorageConnectorMeta) {

  def toPersistedStorageConnector: PersistedStorageConnector = {
    PersistedStorageConnector(name, config.asJson.noSpaces, _meta)
  }

  def toStoppedExportedConnector: ExportedConnector = {
    val state = if (_meta.enabled) ConnectorState.REGISTERED else ConnectorState.DISABLED
    ExportedConnector(name, state, config, Nil, Some(_meta))
  }

  def toExportedConnector: Future[ExportedConnector] = {
    ConnectorClientApi.getConnector(name) map { ec =>
      ec.copy(_meta = Some(_meta)) /** set _meta to running connector */
    } rescue {
      // TODO: case e: FailedToGetConnectorsFromCluster => Future { toStoppedExportedConnector }
      case e: Exception => Future { toStoppedExportedConnector }
    }
  }

  def toRawConnector: RawConnector = {
    RawConnector(name, config)
  }

  def updateConfig(config: JsonObject): Future[ExportedConnector] = {
    if (!_meta.enabled) {
      Future.exception(new InvalidStorageConnectorState(s"Cannot update disabled connector config (${name})"))
    } else {
      ConnectorClientApi.getConnector(name) map { ec =>
        throw new InvalidStorageConnectorState(s"Cannot update running connector config (${name})")
      } rescue {
        case e: InvalidStorageConnectorState =>
          Future.exception(e)
        case _ => StorageConnectorDao.update(this.copy(config = config)).map {
          _.toStoppedExportedConnector
        }
      } /** rescue */
    } /** else */
  }

  def handleCommand(command: ConnectorCommand): Future[ExportedConnector] = {
    command.operation match {
      case ConnectorCommand.OPERATION_START =>
        ConnectorClientApi.start(toRawConnector) flatMap { _ => toExportedConnector }

      case ConnectorCommand.OPERATION_STOP =>
        ConnectorClientApi.stop(toRawConnector) map { _ => toStoppedExportedConnector }

      case ConnectorCommand.OPERATION_RESTART =>
        ConnectorClientApi.restart(toRawConnector) flatMap { _ => toExportedConnector }

      case ConnectorCommand.OPERATION_PAUSE =>
        ConnectorClientApi.pause(toRawConnector) flatMap { _ => toExportedConnector }

      case ConnectorCommand.OPERATION_RESUME =>
        ConnectorClientApi.resume(toRawConnector) flatMap { _ => toExportedConnector }

      case ConnectorCommand.OPERATION_ENABLE =>
        val updatedMeta = _meta.copy(enabled = true)
        val updated = this.copy(_meta = updatedMeta)
        StorageConnectorDao.update(updated) map { persisted =>
          persisted.toStoppedExportedConnector
        }

      case ConnectorCommand.OPERATION_DISABLE =>
        val updatedMeta = _meta.copy(enabled = false)
        val updated = this.copy(_meta = updatedMeta)
        StorageConnectorDao.update(updated) map { persisted =>
          persisted.toStoppedExportedConnector
        }
      case _ =>
        Future.exception(
          new InvalidStorageConnectorCommand(
            s"Invalid storage connector command ${command.operation}"
          )
        )
    }
  }

  def handleTaskCommand(taskId: Int, command: ConnectorTaskCommand): Future[ConnectorTask] = {
    command.operation match {
      case ConnectorTaskCommand.OPERATION_RESTART =>
        ConnectorClientApi.restartTask(toRawConnector, taskId)

      case _ =>
        Future.exception(
          new InvalidStorageConnectorTaskCommand(
            s"Invalid storage task connector command ${command.operation}"
          )
        )
    }
  }

}

object StorageConnector {
  val FIELD_KEY_META = "_meta"
  val FIELD_KEY_NAME = "name"

  def get(connectorName: String): Future[StorageConnector] = {
    StorageConnectorDao.get(connectorName)
  }
}
