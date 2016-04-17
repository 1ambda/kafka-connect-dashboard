import { fork, call, put, } from 'redux-saga/effects'
import { takeEvery, } from 'redux-saga'

import * as SnackbarState from '../reducers/ConnectorReducer/ClosableSnackbarState'
import * as SagaAction from './SagaAction'
import * as Handler from './handler'

/**
 * watcher functions
 */

export function* initialize() {
  try {
    yield call(Handler.callFetchAll)
  } catch (error) {
    yield put(
      SnackbarState.Action.openErrorSnackbar(
        { message: 'Failed to fetch all connectors', error, }
      )
    )
  }
}

export function* watchOpenEditorDialogToEdit() {
  yield* takeEvery(
    SagaAction.ActionType.OPEN_EDITOR_DIALOG_TO_EDIT,
    Handler.handleOpenEditorDialogToEdit
  )
}

export function* watchUpdate() {
  yield* takeEvery(SagaAction.ActionType.UPDATE, Handler.handleUpdate)
}

export function* watchCreate() {
  yield* takeEvery(SagaAction.ActionType.CREATE, Handler.handleCreate)
}

export function* watchRemove() {
  yield* takeEvery(SagaAction.ActionType.REMOVE, Handler.handleRemove)
}

export function* watchSetReadonly() {
  yield* takeEvery(SagaAction.ActionType.SET_READONLY, Handler.handleSetReadonly)
}

export function* watchUnsetReadonly() {
  yield* takeEvery(SagaAction.ActionType.UNSET_READONLY, Handler.handleUnsetReadonly)
}

export function* watchStart() {
  yield* takeEvery(SagaAction.ActionType.START, Handler.handleStart)
}

export function* watchStop() {
  yield* takeEvery(SagaAction.ActionType.STOP, Handler.handleStop)
}

export function* watchChangeContainer() {
  yield* takeEvery(SagaAction.ActionType.CHANGE_CONTAINER, Handler.handleChangeContainerSelector)
}


export default function* root() {
  yield [
    fork(initialize),
    fork(watchOpenEditorDialogToEdit),
    fork(watchUpdate),
    fork(watchRemove),
    fork(watchCreate),
    fork(watchSetReadonly),
    fork(watchUnsetReadonly),
    fork(watchStart),
    fork(watchStop),
    fork(watchChangeContainer),
  ]
}
