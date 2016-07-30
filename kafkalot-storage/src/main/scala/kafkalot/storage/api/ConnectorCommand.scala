package kafkalot.storage.api

case class ConnectorCommand(operation: String)
case class ConnectorTaskCommand(operation: String)

object ConnectorCommand {
  val OPERATION_START = "start"
  val OPERATION_STOP = "stop"
  val OPERATION_RESTART = "restart"
  val OPERATION_PAUSE = "pause"
  val OPERATION_RESUME = "resume"
  val OPERATION_ENABLE = "enable"
  val OPERATION_DISABLE = "disable"
}

object ConnectorTaskCommand {
  val OPERATION_RESTART = "restart"
}