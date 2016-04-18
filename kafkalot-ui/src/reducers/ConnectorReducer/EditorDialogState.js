import { createAction, handleActions, } from 'redux-actions'

export const EDITOR_DIALOG_MODE = {
  EDIT: 'EDIT',
  CREATE: 'CREATE',
  CLOSE: 'CLOSE',
}

export const ActionType = {
  OPEN_EDITOR_DIALOG_TO_CREATE: 'OPEN_EDITOR_DIALOG_TO_CREATE',
  OPEN_EDITOR_DIALOG_TO_EDIT: 'OPEN_EDITOR_DIALOG_TO_EDIT',
  CLOSE_EDITOR_DIALOG: 'CLOSE_EDITOR_DIALOG',
}

export const Action = {
  openEditorDialogToCreate: createAction(ActionType.OPEN_EDITOR_DIALOG_TO_CREATE),
  openEditorDialogToEdit: createAction(ActionType.OPEN_EDITOR_DIALOG_TO_EDIT),
  closeEditorDialog: createAction(ActionType.CLOSE_EDITOR_DIALOG),
}

export const Property = {
  NAME: 'name',
  CONNECTOR: 'connector',
  DIALOG_MODE: 'dialogMode',
  READONLY: 'readonly',
}

export const Payload = {
  NAME: Property.NAME,
  CONNECTOR: Property.CONNECTOR,
  READONLY: Property.READONLY,
}

export const INITIAL_STATE = {
  [Property.NAME]: '',
  [Property.CONNECTOR]: {},
  [Property.DIALOG_MODE]: EDITOR_DIALOG_MODE.CLOSE,
  [Property.READONLY]: true,
}

export const handler = handleActions({
  /** open editor dialog to edit */
  [ActionType.OPEN_EDITOR_DIALOG_TO_EDIT]: (state, { payload, }) =>
    Object.assign({}, state, {
      [Property.NAME]: payload[Payload.NAME],
      [Property.READONLY]: payload[Payload.READONLY],
      [Property.CONNECTOR]: payload[Payload.CONNECTOR],
      [Property.DIALOG_MODE]: EDITOR_DIALOG_MODE.EDIT,
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
