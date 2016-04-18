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

//export function* watchOpenEditorDialogToEdit() {
//  yield* takeEvery(
//    SagaAction.ActionType.OPEN_EDITOR_DIALOG_TO_EDIT,
//    Handler.handleOpenEditorDialogToEdit
//  )
//}


export default function* root() {
  yield [
    fork(initialize),
    //fork(watchOpenEditorDialogToEdit),
  ]
}
