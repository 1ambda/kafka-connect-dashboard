package io.github.lambda.exception

object ErrorCode {
  val CONNECTOR_NOT_FOUND = "CONNECTOR_NOT_FOUND"
  val CONNECTOR_NAME_DUPLICATED = "CONNECTOR_NAME_DUPLICATED"
  val CANNOT_MODIFY_RUNNING_CONNECTOR_META =
    "CANNOT_MODIFY_RUNNING_CONNECTOR_META"
  val CANNOT_MODIFY_DISABLED_CONNECTOR_META =
    "CANNOT_MODIFY_DISABLED_CONNECTOR_META"
  val CANNOT_CREATE_RUNNING_CONNECTOR = "CANNOT_CREATE_RUNNING_CONNECTOR"
  val CANNOT_UPDATE_DUPLICATED_META = "CANNOT_UPDATE_DUPLICATED_META"
  val CANNOT_RUN_CONNECTOR_WHILE_DISABLING =
    "CANNOT_RUN_CONNECTOR_WHILE_DISABLING"

  def genConnectorNotFound = new RuntimeException(CONNECTOR_NOT_FOUND)
  def genConnectorNameDuplicated =
    new RuntimeException(CONNECTOR_NAME_DUPLICATED)
  def genCannotModifyRunningConnectorMeta =
    new RuntimeException(CANNOT_MODIFY_RUNNING_CONNECTOR_META)
  def genCannotModifyDisabledConnectorMeta =
    new RuntimeException(CANNOT_MODIFY_DISABLED_CONNECTOR_META)
  def genCannotCreateRunningConnector =
    new RuntimeException(CANNOT_CREATE_RUNNING_CONNECTOR)
  def genCannotUpdateDuplicatedMeta =
    new RuntimeException(CANNOT_UPDATE_DUPLICATED_META)
  def genCannotRunConnectorWhileDisabling =
    new RuntimeException(CANNOT_RUN_CONNECTOR_WHILE_DISABLING)
}
