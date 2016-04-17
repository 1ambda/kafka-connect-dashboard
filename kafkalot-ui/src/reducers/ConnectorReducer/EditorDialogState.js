import { createAction, handleActions, } from 'redux-actions'

import { EDITOR_DIALOG_MODE, } from '../../components/Common/EditorDialog'

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

export const INITIAL_EDITOR_DIALOG_STATE = {
  id: '',
  job: {},
  dialogMode: EDITOR_DIALOG_MODE.CLOSE,
  readonly: true,
}

export const handler = handleActions({
  /** open editor dialog to edit */
  [ActionType.UPDATE_EDITOR_DIALOG_CONFIG]: (state, { payload, }) =>
    Object.assign({}, INITIAL_EDITOR_DIALOG_STATE, {
      id: payload.id,
      readonly: payload.readonly,
      dialogMode: EDITOR_DIALOG_MODE.EDIT,
      job: payload.job,
    }),

  [ActionType.OPEN_EDITOR_DIALOG_TO_CREATE]: (state) =>
    Object.assign({}, INITIAL_EDITOR_DIALOG_STATE, {
      dialogMode: EDITOR_DIALOG_MODE.CREATE,
    }),

  [ActionType.CLOSE_EDITOR_DIALOG]: (state) =>
    Object.assign({}, INITIAL_EDITOR_DIALOG_STATE /** reset job */, {
      dialogMode: EDITOR_DIALOG_MODE.CLOSE,
      readonly: false,
    }),
}, INITIAL_EDITOR_DIALOG_STATE)
