package io.github.lambda.api

case class ConnectorCommand(operation: String)

object ConnectorCommand {
  val OPERATION_START = "start"
  val OPERATION_STOP = "stop"
  val OPERATION_ENABLE = "enable"
  val OPERATION_DISABLE = "disable"
}
