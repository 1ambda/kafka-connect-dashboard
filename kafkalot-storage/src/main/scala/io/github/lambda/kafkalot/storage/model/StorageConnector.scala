package io.github.lambda.kafkalot.storage.model

import io.circe._
import io.circe.generic.auto._
import io.circe.jawn._
import io.circe.syntax._
import cats.data.Xor
import com.twitter.util.Future
import io.github.lambda.kafkalot.storage.api.ConnectorCommand
import io.github.lambda.kafkalot.storage.exception.ErrorCode
import io.github.lambda.kafkalot.storage.kafka.{ConnectorClientApi, ConnectorState, ExportedConnector, RawConnector}

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
      case e: Exception => Future { toStoppedExportedConnector }
    }
  }

  def toRawConnector: RawConnector = {
    RawConnector(name, config)
  }

  def updateConfig(config: JsonObject): Future[ExportedConnector] = {
    if (!_meta.enabled) {
      Future.exception(new RuntimeException(ErrorCode.CANNOT_UPDATE_DISABLED_CONNECTOR_CONFIG))
    } else {
      ConnectorClientApi.getConnector(name) map { ec =>
        throw new RuntimeException(ErrorCode.CANNOT_UPDATE_RUNNING_CONNECTOR_CONFIG  )
      } rescue {
        // TODO match Exception type instead of error message
        case e: Exception => e.getMessage match {
          case ErrorCode.CANNOT_CREATE_RUNNING_CONNECTOR =>
            Future.exception(e)
          case _ =>
            StorageConnectorDao.update(this.copy(config = config)).map {
              _.toStoppedExportedConnector
            }
        }
      } /** rescue */
    } /** else */
  }

  def handleCommand(command: ConnectorCommand): Future[ExportedConnector] = {
    command.operation match {
      case ConnectorCommand.OPERATION_START =>
        ConnectorClientApi.start(toRawConnector) flatMap { res =>
          toExportedConnector
        }

      case ConnectorCommand.OPERATION_STOP =>
        ConnectorClientApi.stop(toRawConnector) map { _ =>
          toStoppedExportedConnector
        }

      case ConnectorCommand.OPERATION_RESTART =>
        ConnectorClientApi.restart(toRawConnector) flatMap { _ =>
          toExportedConnector
        }

      case ConnectorCommand.OPERATION_PAUSE =>
        ConnectorClientApi.pause(toRawConnector) flatMap { _ =>
          toExportedConnector
        }

      case ConnectorCommand.OPERATION_RESUME =>
        ConnectorClientApi.resume(toRawConnector) flatMap { _ =>
          toExportedConnector
        }

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
        Future.exception(new RuntimeException(ErrorCode.UNSUPPORTED_CONNECTOR_OPERATION))
    }
  }

}

object StorageConnector {
  val FIELD_KEY_META = "_meta"
  val FIELD_KEY_NAME = "name"
}
