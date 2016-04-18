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
    yield call(Handler.callFetchAll)
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

export default function* root() {
  yield [
    fork(initialize),
    fork(watchOpenEditorDialogToEdit),
  ]
}
