import { fork, call, put, } from 'redux-saga/effects'
import { takeEvery, } from 'redux-saga'
import { createAction, } from 'redux-actions'

import * as Handler from './handler'

/**
 * watcher functions
 */

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

export function* watchOpenEditorDialogToEdit() {
  yield* takeEvery(
    ActionType.OPEN_EDITOR_DIALOG_TO_EDIT,
    Handler.handleOpenEditorDialogToEdit
  )
}

export function* watchSetReadonly() {
  yield* takeEvery(
    ActionType.SET_READONLY,
    Handler.handleSetReadonly
  )
}

export function* watchUnsetReadonly() {
  yield* takeEvery(
    ActionType.UNSET_READONLY,
    Handler.handleUnsetReadonly
  )
}

export function* watchCreate() {
  yield* takeEvery(
    ActionType.CREATE,
    Handler.handleCreate
  )
}

export function* watchUpdate() {
  yield* takeEvery(
    ActionType.UPDATE,
    Handler.handleUpdate
  )
}

export function* watchRemove() {
  yield* takeEvery(
    ActionType.REMOVE,
    Handler.handleRemove
  )
}

export default function* root() {
  yield [
    fork(Handler.initialize),
    fork(watchOpenEditorDialogToEdit),
    fork(watchSetReadonly),
    fork(watchUnsetReadonly),
    fork(watchCreate),
    fork(watchUpdate),
    fork(watchRemove),
  ]
}
