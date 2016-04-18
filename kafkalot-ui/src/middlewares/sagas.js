import { fork, call, put, } from 'redux-saga/effects'
import { takeEvery, } from 'redux-saga'

import { Action as SnackbarAction, Payload as SnackbarPayload, } from '../reducers/ConnectorReducer/ClosableSnackbarState'
import { ActionType as SagaActionType, }from './SagaAction'
import * as Handler from './handler'

/**
 * watcher functions
 */

export function* initialize() {
  try {
    yield call(Handler.fetchAndUpdateAll)
  } catch (error) {
    yield put(
      SnackbarAction.openErrorSnackbar({
          [SnackbarPayload.MESSAGE]: 'Failed to fetch all connectors',
          [SnackbarPayload.ERROR]: error,
      })
    )
  }
}

export function* watchOpenEditorDialogToEdit() {
  yield* takeEvery(
    SagaActionType.OPEN_EDITOR_DIALOG_TO_EDIT,
    Handler.handleOpenEditorDialogToEdit
  )
}

export function* watchSetReadonly() {
  yield* takeEvery(
    SagaActionType.SET_READONLY,
    Handler.handleSetReadonly
  )
}

export function* watchUnsetReadonly() {
  yield* takeEvery(
    SagaActionType.UNSET_READONLY,
    Handler.handleUnsetReadonly
  )
}

export default function* root() {
  yield [
    fork(initialize),
    fork(watchOpenEditorDialogToEdit),
    fork(watchSetReadonly),
    fork(watchUnsetReadonly),
  ]
}
