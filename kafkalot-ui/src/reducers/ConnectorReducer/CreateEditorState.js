import { createAction, handleActions, } from 'redux-actions'

export const ActionType = {
  SUCCEED_TO_OPEN_CREATE_EDITOR: 'CONNECTOR/CREATE_EDITOR/SUCCEED_TO_OPEN',
  SUCCEED_TO_CHANGE_SELECTED_CONNECTOR_CLASS: 'CONNECTOR/CREATE_EDITOR/SUCCEED_TO_CHANGE_SELECTED_CONNECTOR_CLASS',
  CLOSE_CREATE_EDITOR: 'CONNECTOR/CREATE_EDITOR/CLOSE',
}

export const Action = {
  closeCreateEditor: createAction(ActionType.CLOSE_CREATE_EDITOR),
}

export const PrivateAction = {
  succeedToChangeSelectedConnectorClass: createAction(ActionType.SUCCEED_TO_CHANGE_SELECTED_CONNECTOR_CLASS),
  succeedToOpenCreateEditor: createAction(ActionType.SUCCEED_TO_OPEN_CREATE_EDITOR),
}

export const Payload = {
  OPENED: 'opened',
  CONNECTOR_NAME: 'connectorName',
  CONNECTOR_CONFIG: 'connectorConfig',
  AVAILABLE_CONNECTORS: 'availableConnectors',
  SELECTED_CONNECTOR_CLASS: 'selectedConnectorClass',
}

export const INITIAL_STATE = {
  [Payload.OPENED]: false,
  [Payload.AVAILABLE_CONNECTORS]: [],
  [Payload.SELECTED_CONNECTOR_CLASS]: null,
}

export const handler = handleActions({
  /** open editor dialog to edit */
  [ActionType.SUCCEED_TO_OPEN_CREATE_EDITOR]: (state, { payload, }) =>
    Object.assign({}, INITIAL_STATE, {
      [Payload.OPENED]: true,
      [Payload.AVAILABLE_CONNECTORS]: payload[Payload.AVAILABLE_CONNECTORS],
    }),

  [ActionType.SUCCEED_TO_CHANGE_SELECTED_CONNECTOR_CLASS]: (state, { payload, }) =>
    Object.assign({}, state, {
      [Payload.SELECTED_CONNECTOR_CLASS]: payload[Payload.SELECTED_CONNECTOR_CLASS],
    }),

  [ActionType.CLOSE_CREATE_EDITOR]: (state) =>
    Object.assign({}, INITIAL_STATE, {
      [Payload.OPENED]: false,
    }),

}, INITIAL_STATE)

