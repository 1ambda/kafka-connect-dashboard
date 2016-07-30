package kafkalot.storage.kafka

import java.net.URL

import com.twitter.finagle.Http
import com.twitter.finagle.http._
import com.twitter.io.Buf
import com.twitter.util.Future
import io.circe._
import io.circe.generic.auto._
import io.circe.jawn._
import io.circe.syntax._
import org.jboss.netty.handler.codec.http.HttpHeaders

import kafkalot.storage.exception._
import kafkalot.storage.model.{StorageConnector, StorageConnectorDao, StorageConnectorMeta}
import kafkalot.storage.Configuration

object ConnectorClientApi {

  val connectorUrl =
    s"${Configuration.connector.clusterHost}:${Configuration.connector.clusterPort}"

  val client = Http.client.newService(connectorUrl)

  def buildConnectorsUrl() = s"http://${connectorUrl}/connectors"
  def buildConnectorUrl(name: String) = s"${buildConnectorsUrl()}/${name}"
  def buildConnectorCommandUrl(name: String, command: String) = s"${buildConnectorsUrl()}/${name}/${command}"
  def buildConnectorTaskCommandUrl(name: String, taskId: Int, command: String) = s"${buildConnectorsUrl()}/${name}/tasks/${taskId}/${command}"
  def buildConnectorStatusUrl(name: String) = s"${buildConnectorUrl(name)}/status"
  def buildConnectorConfigUrl(name: String) = s"${buildConnectorUrl(name)}/config"
  def buildConnectorPluginsUrl() = s"http://${connectorUrl}/connector-plugins"
  def buildConnectorPluginsValidateUrl(name: String) = s"${buildConnectorPluginsUrl()}/${name}/config/validate"

  def getPreBuildJsonHeaderRequest() = {
    RequestBuilder().setHeader(
        HttpHeaders.Names.CONTENT_TYPE, "application/json")
  }

  def createDeleteRequest(url: URL): Request = {
    getPreBuildJsonHeaderRequest().url(url).buildDelete()
  }

  def createGetRequest(url: URL): Request = {
    getPreBuildJsonHeaderRequest().url(url).buildGet()
  }

  def createPutRequest(url: URL, payload: Json): Request = {
    getPreBuildJsonHeaderRequest()
      .url(url)
      .buildPut(Buf.Utf8(payload.toString))
  }

  def createEmptyPutRequest(url: URL): Request = {
    getPreBuildJsonHeaderRequest()
      .url(url)
      .buildPut(Buf.Empty)
  }

  def createPostRequest(url: URL, payload: Json): Request = {
    getPreBuildJsonHeaderRequest()
      .url(url)
      .buildPost(Buf.Utf8(payload.toString))
  }

  def createEmptyPostRequest(url: URL): Request = {
    getPreBuildJsonHeaderRequest()
      .url(url)
      .buildPost(Buf.Empty)
  }

  def deleteConnector(name: String): Future[Boolean] = {
    val request = createDeleteRequest(new URL(buildConnectorUrl(name)))

    client(request).map { response =>
      if (response.getStatusCode() != 200 /** OK */ )
        throw new FailedToDeleteConnectorFromCluster(s"Failed to delete connector from cluster (${name})")

      true
    }
  }

  def getConnectors(): Future[List[String]] = {
    val request = createGetRequest(new URL(buildConnectorsUrl()))

    client(request).map { response =>
      if (response.getStatusCode() != 200 /** OK */ )
        throw new FailedToGetConnectorsFromCluster("Failed to get connectors from cluster")

      decode[List[String]](response.getContentString()).valueOr(throw _)
    }
  }

  def getConnector(name: String): Future[ExportedConnector] = {
    val reqGetConnector = createGetRequest(new URL(buildConnectorUrl(name)))
    val reqGetConnectorStatus = createGetRequest(new URL(buildConnectorStatusUrl(name)))

    /** iterate future sequentially to wait for updating connectorStatus in connect cluster */
    for {
      connector <- client(reqGetConnector).map { response =>
        if (response.getStatusCode() != 200 /** OK */ )
          throw new FailedToGetConnectorFromCluster(s"Failed to get connector ${name} from cluster")

        decode[Connector](response.getContentString()).valueOr(throw _)
      }

      connectorStatus <- client(reqGetConnectorStatus).map { response =>
      if (response.getStatusCode() != 200 /** OK */ )
        throw new FailedToGetConnectorsFromCluster("Failed to get connectors from cluster")
        decode[ConnectorStatus](response.getContentString()).valueOr(throw _)
      }
    } yield {
      ExportedConnector(
        connector.name,
        connectorStatus.connector.state,
        connector.config,
        connectorStatus.tasks,
        None
      )
    }
  }

  def updateConnectorConfig(rawConnector: RawConnector): Future[JsonObject] = {
    val request = createPutRequest(
      new URL(buildConnectorConfigUrl(rawConnector.name)),
      Json.fromJsonObject(rawConnector.config)
    )

    client(request).map { response =>
      if (response.getStatusCode() != 200 /** OK */ )
        throw new FailedToUpdateConnectorConfig(s"Failed to update connector config (${rawConnector.name})")

      decode[JsonObject](response.getContentString()).valueOr(throw _)
    }
  }

  def start(rawConnector: RawConnector): Future[JsonObject] = {
    rawConnector.getConnectorClass match {
      case None =>
        Future.exception(new RawConnectorHasNoConnectorClassField(rawConnector.name))

      case Some(connectorClass) =>
        validateConnectorPlugin(connectorClass, rawConnector.config.asJson) map { validationResult =>
          if (validationResult.error_count > 0) throw new ConnectorPluginValidationFailed(connectorClass)
        } flatMap { _ =>
          val request = createPostRequest(new URL(buildConnectorsUrl()), rawConnector.asJson)

          client(request).map { response =>
            if (response.getStatusCode() != 201 /** CREATED */ )
              throw new FailedToStartConnector(s"Failed to start connector (${rawConnector.name})")

            decode[JsonObject](response.getContentString()).valueOr(throw _)
          }
        }
    }
  }

  def stop(rawConnector: RawConnector): Future[Int] = {
    rawConnector.getConnectorClass match {
      case None =>
        Future.exception(new RawConnectorHasNoConnectorClassField(rawConnector.name))

      case Some(connectorClass) =>
        validateConnectorPlugin(connectorClass, rawConnector.config.asJson) map { validationResult =>
          if (validationResult.error_count > 0) throw new ConnectorPluginValidationFailed(connectorClass)

        } flatMap { _ =>
          val request = createDeleteRequest(new URL(buildConnectorUrl(rawConnector.name)))

          client(request).map { response =>
            if (response.getStatusCode() != 204 /** NO CONTENT */ )
              throw new FailedToStopConnector(s"Failed to stop connector (${rawConnector.name})")

            response.getStatusCode()
          }
        }
    }
  }

  def restart(rawConnector: RawConnector): Future[Int] = {
    val request = createEmptyPostRequest(
      new URL(buildConnectorCommandUrl(rawConnector.name, "restart"))
    )

    client(request).map { response =>
      if (response.getStatusCode() != 204 /** NO CONTENT */ )
        throw new FailedToRestartConnector(s"Failed to restart connector (${rawConnector.name})")

      response.getStatusCode()
    }
  }

  def getConnectorTask(connectorName: String, taskId: Int): Future[ConnectorTask] = {
    getConnector(connectorName) map { ec: ExportedConnector =>
      if (taskId >= ec.tasks.length)
        throw new TaskIdDoesNotExist(s"Task id ${taskId} does not exist on ${connectorName} (tasks.length: ${ec.tasks.length})")

      ec.tasks(taskId)
    }
  }

  def restartTask(rawConnector: RawConnector, taskId: Int): Future[ConnectorTask] = {
    val connectorName = rawConnector.name

    val req = createEmptyPostRequest(
      new URL(buildConnectorTaskCommandUrl(connectorName, taskId, "restart"))
    )

    client(req).map { response =>
      if (response.getStatusCode() != 204 /** NO CONTENT */ )
        throw new FailedToRestartConnectorTask(s"Failed to restart connector task (${connectorName}, ${taskId})")
    } flatMap { _ =>
      getConnectorTask(connectorName, taskId)
    }
  }

  def pause(rawConnector: RawConnector): Future[Int] = {
    val request = createEmptyPutRequest(
      new URL(buildConnectorCommandUrl(rawConnector.name, "pause"))
    )

    client(request).map { response =>
      if (response.getStatusCode() != 202 /** ACCEPTED */ )
        throw new FailedToPauseConnector(s"Failed to pause connector (${rawConnector.name})")

      response.getStatusCode()
    }
  }

  def resume(rawConnector: RawConnector): Future[Int] = {
    val request = createEmptyPutRequest(
      new URL(buildConnectorCommandUrl(rawConnector.name, "resume"))
    )

    client(request).map { response =>
      if (response.getStatusCode() != 202 /** ACCEPTED */ )
        throw new FailedToResumeConnector(s"Failed to resume connector (${rawConnector.name})")

      response.getStatusCode()
    }
  }

  def getConnectorPlugins(): Future[Json] = {
    val request = createGetRequest(
      new URL(buildConnectorPluginsUrl())
    )

    client(request).map { response =>
      if (response.getStatusCode() != 200 /** OK */ )
        throw new FailedToGetConnectorPlugins("Failed to resume connector")

      /** just proxy */
      decode[Json](response.getContentString()).valueOr(throw _)
    }
  }

  def getConnectorPluginJSONSchema(connectorClass: String): Future[JSONSchema] = {
    val request = createPutRequest(
      new URL(buildConnectorPluginsValidateUrl(connectorClass)),
      JsonObject.empty.asJson /** send empty json object to get schema only */
    )

    client(request).map { response =>
      if (response.getStatusCode() != 200 /** OK */ )
        throw new ConnectorPluginNotFoundException(s"Can't find connector plugin (${connectorClass})")

      /** convert validation result to JSONSchema */
      val v = decode[PluginValidation](response.getContentString()).valueOr(throw _)
      v.toJSONSchema
    }
  }

  def validateConnectorPlugin(connectorClass: String, config: Json): Future[ConnectorConfigValidationResult] = {
    val request = createPutRequest(
      new URL(buildConnectorPluginsValidateUrl(connectorClass)),
      config
    )

    client(request).map { response =>
      if (response.getStatusCode() != 200 /** OK */ )
        throw new ConnectorPluginNotFoundException(s"Can't find connector plugin (${connectorClass})")

      /** just proxy */
      val v = decode[PluginValidation](response.getContentString()).valueOr(throw _)
      v.toValidationResult()
    }
  }
}

case class Connector(name: String, config: JsonObject)
case class ConnectorTask(state: String, id: Int, worker_id: String, trace: Option[String] = None)
case class ConnectorState(state: String, worker_id: String)
case class ConnectorStatus(name: String, connector: ConnectorState, tasks: List[ConnectorTask])

object ConnectorState {
  val RUNNING = "RUNNING"
  val REGISTERED = "REGISTERED"
  val DISABLED = "DISABLED"
}

case class RawConnector(name: String,
                        config: JsonObject) {
  def toInitialStorageConnector: StorageConnector = {
    StorageConnector(name, config, StorageConnectorMeta(true, Nil))
  }

  def getConnectorClass: Option[String] = {
    config.asJson.hcursor.get[String]("connector.class").toOption
  }
}
