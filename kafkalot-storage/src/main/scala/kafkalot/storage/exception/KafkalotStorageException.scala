package kafkalot.storage.exception

sealed trait KafkalotStorageException


case class RawConnectorHasNoConnectorClassField(message: String) extends Exception(message)

/** kafkalot-storage related */
case class NoSuchConnectorInStorage(message: String) extends Exception(message)
case class InvalidStorageConnectorState(message: String) extends Exception(message)
case class InvalidStorageConnectorCommand(message: String) extends Exception(message)
case class CannotCreateDuplicatedConnector(message: String) extends Exception(message)

/** connector cluster related */
case class FailedToDeleteConnectorFromCluster(message: String) extends Exception(message)
case class FailedToGetConnectorsFromCluster(message: String) extends Exception(message)
case class FailedToGetConnectorFromCluster(message: String) extends Exception(message)
case class FailedToUpdateConnectorConfig(message: String) extends Exception(message)
case class FailedToStartConnector(message: String) extends Exception(message)
case class FailedToStopConnector(message: String) extends Exception(message)
case class FailedToRestartConnector(message: String) extends Exception(message)
case class FailedToPauseConnector(message: String) extends Exception(message)
case class FailedToResumeConnector(message: String) extends Exception(message)
case class FailedToGetConnectorPlugins(message: String) extends Exception(message)

case class ConnectorPluginNotFoundException(message: String) extends Exception(message)
case class ConnectorPluginValidationFailed(message: String) extends Exception(message)
