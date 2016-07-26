package kafkalot.storage.exception

case class ConnectorPluginNotFoundException(message: String) extends Exception(message)
case class ConnectorPluginValidationFailed(message: String) extends Exception(message)
case class RawConnectorHasNoConnectorClassField(message: String) extends Exception(message)
