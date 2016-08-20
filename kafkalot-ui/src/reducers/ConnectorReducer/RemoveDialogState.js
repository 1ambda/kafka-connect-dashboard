import { createAction, handleActions, } from 'redux-actions'

export const ActionType = {
  SUCCEED_TO_OPEN_REMOVE_DIALOG: 'CONNECTOR/REMOVE_DIALOG/SUCCEED_TO_OPEN',
  CLOSE_REMOVE_DIALOG: 'CONNECTOR/REMOVE_DIALOG/CLOSE',
}

export const Action = {
  closeRemoveDialog: createAction(ActionType.CLOSE_REMOVE_DIALOG),
}

export const PrivateAction = {
  succeededToOpenRemoveDialog: createAction(ActionType.SUCCEED_TO_OPEN_REMOVE_DIALOG),
}

export const Property = {
  OPENED: 'opened',
  CONNECTOR_NAMES: 'connectorNames',
}

export const INITIAL_STATE = {
  [Property.OPENED]: false,
  [Property.CONNECTOR_NAMES]: [],
}

export const handler = handleActions({
  [ActionType.SUCCEED_TO_OPEN_REMOVE_DIALOG]: (state, { payload, }) =>
    Object.assign({}, state, {
      [Property.OPENED]: true,
      [Property.CONNECTOR_NAMES]: payload[Property.CONNECTOR_NAMES],
    }),

  [ActionType.CLOSE_REMOVE_DIALOG]: (state) =>
    Object.assign({}, INITIAL_STATE), /** reset */
}, INITIAL_STATE)

