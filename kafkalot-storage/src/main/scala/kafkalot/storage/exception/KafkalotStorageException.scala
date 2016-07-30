package kafkalot.storage.exception

sealed trait KafkalotException extends Exception { def message: String }
sealed trait ConnectClusterException extends Exception { def message: String }

case class RawConnectorHasNoConnectorClassField(message: String)
  extends Exception(message) with KafkalotException

/** client exception: 400 */
case class NoSuchConnectorInStorage(message: String)
  extends Exception(message) with KafkalotException
case class InvalidStorageConnectorState(message: String)
  extends Exception(message) with KafkalotException
case class InvalidStorageConnectorCommand(message: String)
  extends Exception(message) with KafkalotException
case class InvalidStorageConnectorTaskCommand(message: String)
  extends Exception(message) with KafkalotException
case class CannotCreateDuplicatedConnector(message: String)
  extends Exception(message) with KafkalotException
case class TaskIdDoesNotExist(message: String)
  extends Exception(message) with KafkalotException
case class ConnectorPluginNotFoundException(message: String)
  extends Exception(message) with KafkalotException
case class ConnectorPluginValidationFailed(message: String)
  extends Exception(message) with KafkalotException

/** connector cluster exception : 500 */

case class FailedToDeleteConnectorFromCluster(message: String)
  extends Exception(message) with ConnectClusterException
case class FailedToGetConnectorsFromCluster(message: String)
  extends Exception(message) with ConnectClusterException
case class FailedToGetConnectorFromCluster(message: String)
  extends Exception(message) with ConnectClusterException
case class FailedToUpdateConnectorConfig(message: String)
  extends Exception(message) with ConnectClusterException
case class FailedToStartConnector(message: String)
  extends Exception(message) with ConnectClusterException
case class FailedToStopConnector(message: String)
  extends Exception(message) with ConnectClusterException
case class FailedToRestartConnector(message: String)
  extends Exception(message) with ConnectClusterException
case class FailedToRestartConnectorTask(message: String)
  extends Exception(message) with ConnectClusterException
case class FailedToPauseConnector(message: String)
  extends Exception(message) with ConnectClusterException
case class FailedToResumeConnector(message: String)
  extends Exception(message) with ConnectClusterException
case class FailedToGetConnectorPlugins(message: String)
  extends Exception(message) with ConnectClusterException


