package kafkalot.storage.kafka

import com.twitter.util.Future
import io.circe._
import io.circe.generic.auto._
import io.circe.jawn._
import io.circe.syntax._

import kafkalot.storage.model.{StorageConnectorDao, StorageConnectorMeta}

case class ExportedConnector(name: String,
                             state: String,
                             config: JsonObject,
                             tasks: List[ConnectorTask],
                             _meta: Option[StorageConnectorMeta])

object ExportedConnector {
  def get(connectorName: String): Future[ExportedConnector] = {
    for {
      sc <- StorageConnectorDao.get(connectorName)
      ec <- sc.toExportedConnector
    } yield ec
  }
}

