import { createAction, handleActions, } from 'redux-actions'

export const EDITOR_DIALOG_MODE = {
  EDIT: 'EDIT',
  CREATE: 'CREATE',
  CLOSE: 'CLOSE',
}

export const ActionType = {
  OPEN_EDITOR_DIALOG_TO_CREATE: 'OPEN_EDITOR_DIALOG_TO_CREATE',
  UPDATE_EDITOR_DIALOG_CONFIG: 'UPDATE_EDITOR_DIALOG_CONFIG',
  CLOSE_EDITOR_DIALOG: 'CLOSE_EDITOR_DIALOG',
}

export const Action = {
  openEditorDialogToCreate: createAction(ActionType.OPEN_EDITOR_DIALOG_TO_CREATE),
  updateEditorDialogConfig: createAction(ActionType.UPDATE_EDITOR_DIALOG_CONFIG),
  closeEditorDialog: createAction(ActionType.CLOSE_EDITOR_DIALOG),
}

export const Property = {
  NAME: 'name',
  CONNECTOR: 'connector',
  DIALOG_MODE: 'dialogMode',
  READONLY: 'readonly',
}

export const INITIAL_STATE = {
  [Property.NAME]: '',
  [Property.CONNECTOR]: {},
  [Property.DIALOG_MODE]: EDITOR_DIALOG_MODE.CLOSE,
  [Property.READONLY]: true,
}

export const handler = handleActions({
  /** open editor dialog to edit */
  [ActionType.UPDATE_EDITOR_DIALOG_CONFIG]: (state, { payload, }) =>
    Object.assign({}, INITIAL_STATE, {
      [Property.NAME]: payload[Property.NAME],
      [Property.READONLY]: payload[Property.READONLY],
      [Property.DIALOG_MODE]: EDITOR_DIALOG_MODE.EDIT,
      [Property.CONNECTOR]: payload[Property.CONNECTOR],
    }),

  [ActionType.OPEN_EDITOR_DIALOG_TO_CREATE]: (state) =>
    Object.assign({}, INITIAL_STATE, {
      [Property.DIALOG_MODE]: EDITOR_DIALOG_MODE.CREATE,
    }),

  [ActionType.CLOSE_EDITOR_DIALOG]: (state) =>
    Object.assign({}, INITIAL_STATE /** reset */, {
      [Property.DIALOG_MODE]: EDITOR_DIALOG_MODE.CLOSE,
      [Property.READONLY]: false,
    }),
}, INITIAL_STATE)
