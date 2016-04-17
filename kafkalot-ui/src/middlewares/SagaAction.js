import { createAction, } from 'redux-actions'

export const ActionType = {
  CREATE: 'API_CREATE',
  REMOVE: 'API_REMOVE',
  UPDATE: 'API_UPDATE',

  CHANGE_CONTAINER: 'API_CHANGE_CONTAINER',
  OPEN_EDITOR_DIALOG_TO_EDIT: 'API_OPEN_EDITOR_DIALOG_TO_EDIT',

  SET_READONLY: 'API_SET_READONLY',
  UNSET_READONLY: 'API_UNSET_READONLY',
  START: 'API_START',
  STOP: 'API_STOP',
}

export const Action = {
  create: createAction(ActionType.CREATE),
  remove: createAction(ActionType.REMOVE),
  update: createAction(ActionType.UPDATE),

  changeContainer: createAction(ActionType.CHANGE_CONTAINER),
  openEditorDialogToEdit: createAction(ActionType.OPEN_EDITOR_DIALOG_TO_EDIT),

  unsetReadonly: createAction(ActionType.UNSET_READONLY),
  setReadonly: createAction(ActionType.SET_READONLY),
  start: createAction(ActionType.START),
  stop: createAction(ActionType.STOP),
}

