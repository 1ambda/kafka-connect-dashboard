import { createAction, handleActions, } from 'redux-actions'

export const ActionType = {
  SUCCEED_TO_VALIDATE_CONFIG: 'CONNECTOR/CONFIG_SCHEMA/SUCCEED_TO_VALIDATE',
  SUCCEED_TO_SET_CONFIG_SCHEMA_ONLY: 'CONNECTOR/CONFIG_SCHEMA/SUCCEED_TO_SET',
}

export const PrivateAction = {
  succeededToValidateConfig: createAction(ActionType.SUCCEED_TO_VALIDATE_CONFIG),
  succeededToSetConfigSchemaOnly: createAction(ActionType.SUCCEED_TO_SET_CONFIG_SCHEMA_ONLY),
}

export const Payload = {
  CONNECTOR_CLASS: 'connectorClass',
  CONNECTOR_CONFIG: 'connectorConfig',
  ERROR_MESSAGES: 'errorMessages',
  CONFIG_SCHEMA: 'configSchema', /** JSONSchema of `config` */
}

/** handle connector schema, validation result only. (not config itself) */
export const INITIAL_STATE = {
  [Payload.ERROR_MESSAGES]: [],
  [Payload.CONFIG_SCHEMA]: undefined,
}

export const handler = handleActions({
  /** handle clicking `validate` button */
  [ActionType.SUCCEED_TO_VALIDATE_CONFIG]: (state, { payload, }) =>
    Object.assign({}, state, {
      [Payload.ERROR_MESSAGES]: payload[Payload.ERROR_MESSAGES],
      [Payload.CONFIG_SCHEMA]: payload[Payload.CONFIG_SCHEMA],
    }),

  /** handle initial dialog open, changing connector class */
  [ActionType.SUCCEED_TO_SET_CONFIG_SCHEMA_ONLY]: (state, { payload, }) =>
    Object.assign({}, INITIAL_STATE, {
      [Payload.CONFIG_SCHEMA]: payload[Payload.CONFIG_SCHEMA],
    }),

}, INITIAL_STATE)

