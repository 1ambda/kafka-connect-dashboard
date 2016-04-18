import { createAction, handleActions, } from 'redux-actions'

export const CONFIRM_DIALOG_MODE = {
  REMOVE: 'REMOVE',
  CLOSE: 'CLOSE',
}

export const ActionType = {
  OPEN_CONFIRM_DIALOG_TO_REMOVE: 'OPEN_CONFIRM_DIALOG_TO_REMOVE',
  CLOSE_CONFIRM_DIALOG: 'CLOSE_CONFIRM_DIALOG',
}

export const Action = {
  openConfirmDialogToRemove: createAction(ActionType.OPEN_CONFIRM_DIALOG_TO_REMOVE),
  closeConfirmDialog: createAction(ActionType.CLOSE_CONFIRM_DIALOG),
}

export const Property = {
  CONNECTOR: 'connector',
  DIALOG_MODE: 'dialogMode',
}

const INITIAL_STATE = {
  connector: {},
  dialogMode: CONFIRM_DIALOG_MODE.CLOSE,
}

export const handler = handleActions({
  [ActionType.OPEN_CONFIRM_DIALOG_TO_REMOVE]: (state, { payload, }) =>
    Object.assign({}, state, {
      [Property.CONNECTOR]: payload[Property.CONNECTOR],
      [Property.DIALOG_MODE]: CONFIRM_DIALOG_MODE.REMOVE,
    }),

  [ActionType.CLOSE_CONFIRM_DIALOG]: (state, { payload, }) =>
    Object.assign({}, state, {
      [Property.DIALOG_MODE]: CONFIRM_DIALOG_MODE.CLOSE,
    }),

}, INITIAL_STATE)
