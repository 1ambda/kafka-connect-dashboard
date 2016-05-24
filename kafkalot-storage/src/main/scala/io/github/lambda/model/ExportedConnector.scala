package io.github.lambda.model

import scala.collection.mutable
import io.circe._
import io.circe.generic.auto._
import io.circe.jawn._
import io.circe.syntax._
import cats.data.Xor
import com.twitter.util.Future
import io.github.lambda.api.{ConnectorCommand, KafkaConnectClientApi}
import io.github.lambda.exception.ErrorCode
import io.github.lambda.util.JsonUtil

case class StorageConnectorMeta(enabled: Boolean,
                                 tags: List[String])

case class StorageConnector(name: String, config: JsonObject, _meta: StorageConnectorMeta) {
  def toJsonObjectWithoutMeta: JsonObject = {
    val jsonObject = JsonUtil.convertStringToJsonObject(this.asJson.noSpaces)
    jsonObject.remove("_meta")
  }

  def toPersistedStorageConnector: PersistedStorageConnector = {
    PersistedStorageConnector(name, config.asJson.noSpaces, _meta)
  }

  def toStoppedExportedConnector: ExportedConnector = toExportedConnectorWithRunning(false)
  def toRunningExportedConnector: ExportedConnector = toExportedConnectorWithRunning(true)

  def toExportedConnectorWithRunning(running: Boolean): ExportedConnector = {
    val ecm = ExportedConnectorMeta(_meta.enabled, running, _meta.tags)
    ExportedConnector(name, config, ecm)
  }

  def toExportedConnector: Future[ExportedConnector] = {
    KafkaConnectClientApi.getConnector(name).map {
      connectorJson: JsonObject =>
        val connectorJsonCursor = Json.fromJsonObject(connectorJson).hcursor
        connectorJsonCursor.get[JsonObject]("config") match {
          case Xor.Right(runningConnectorConfig) =>
            toRunningExportedConnector.copy(config = runningConnectorConfig)
          case Xor.Left(error) =>
            // TODO: logging, connector is running but has no config property
            // TODO: branch in recuse case stmt
            throw new RuntimeException(error)
        }
    } rescue {
      case e: Exception => Future { toStoppedExportedConnector }
    }
  }

  def toExportedConnector(runningConnectorNames: List[String]): ExportedConnector = {
    if (runningConnectorNames.contains(name)) toRunningExportedConnector
    else toStoppedExportedConnector
  }

  def stop: Future[Int] = KafkaConnectClientApi.stopConnector(name)
  def start: Future[JsonObject] = KafkaConnectClientApi.startConnector(toJsonObjectWithoutMeta)

  def handleCommand(command: ConnectorCommand): Future[ExportedConnector] = {
    // TODO validation: already running, already disabled

    command.operation match {
      case ConnectorCommand.OPERATION_START =>
        start map { _ => toRunningExportedConnector }
      case ConnectorCommand.OPERATION_STOP =>
        stop map { _ => toStoppedExportedConnector }
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

  def updateMeta(requestedMeta: StorageConnectorMeta): Future[ExportedConnector] = {
    // TODO: already running validation

    if (_meta == requestedMeta)
      return Future.exception(new RuntimeException(ErrorCode.CANNOT_UPDATE_DUPLICATED_META))

    if (_meta.enabled != requestedMeta.enabled)
      return Future.exception(new RuntimeException(ErrorCode.CANNOT_UPDATE_META_USING_PUT_API))

    val updatedMeta = _meta.copy(tags = requestedMeta.tags)
    val updated = this.copy(_meta = updatedMeta)

    StorageConnectorDao.update(updated) map { sc: StorageConnector =>
      sc.toStoppedExportedConnector
    }
  }
}

case class ExportedConnectorMeta(enabled: Boolean,
                                 running: Boolean,
                                 tags: List[String])

case class ExportedConnector(name: String, config: JsonObject, _meta: ExportedConnectorMeta)

object StorageConnector {
  val FIELD_KEY_META = "_meta"
  val FIELD_KEY_NAME = "name"

  def getExportedConnectors(storageConnectors: List[StorageConnector]): Future[List[ExportedConnector]] = {
    KafkaConnectClientApi.getConnectors().map {
      runningConnectorNames: List[String] =>
        storageConnectors.map(_.toExportedConnector(runningConnectorNames))
    }
  }
}
