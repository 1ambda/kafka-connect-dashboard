import { fork, call, put, } from 'redux-saga/effects'
import { takeEvery, } from 'redux-saga'
import { createAction, } from 'redux-actions'

import * as Handler from './Handler'

/**
 * watcher functions
 */

export const ActionType = {
  FETCH_CONNECTOR: 'FETCH_CONNECTOR',
  REQUEST_TO_OPEN_CONFIG_EDITOR: 'REQUEST_TO_OPEN_CONFIG_EDITOR',
  REQUEST_TO_OPEN_REMOVE_DIALOG: 'REQUEST_TO_OPEN_REMOVE_DIALOG',
  REQUEST_TO_UPDATE_CONFIG: 'REQUEST_TO_UPDATE_CONFIG',
  REQUEST_TO_CREATE_CONNECTOR: 'REQUEST_TO_CREATE_CONNECTOR',
  REQUEST_TO_REMOVE_CONNECTOR: 'REQUEST_TO_REMOVE_CONNECTOR',
  REQUEST_TO_CHANGE_STORAGE: 'REQUEST_TO_CHANGE_STORAGE',
  REQUEST_TO_DISABLE_CONNECTOR: 'REQUEST_TO_DISABLE_CONNECTOR',
  REQUEST_TO_ENABLE_CONNECTOR: 'REQUEST_TO_ENABLE_CONNECTOR',
  REQUEST_TO_START_CONNECTOR: 'REQUEST_TO_START_CONNECTOR',
  REQUEST_TO_STOP_CONNECTOR: 'REQUEST_TO_STOP_CONNECTOR',
}

export const Action = {
  fetchConnector: createAction(ActionType.FETCH_CONNECTOR),
  openConfigEditor: createAction(ActionType.REQUEST_TO_OPEN_CONFIG_EDITOR),
  openRemoveDialog: createAction(ActionType.REQUEST_TO_OPEN_REMOVE_DIALOG),
  updateConfig: createAction(ActionType.REQUEST_TO_UPDATE_CONFIG),
  createConnector: createAction(ActionType.REQUEST_TO_CREATE_CONNECTOR),
  removeConnector: createAction(ActionType.REQUEST_TO_REMOVE_CONNECTOR),
  changeStorage: createAction(ActionType.REQUEST_TO_CHANGE_STORAGE),
  disableConnector: createAction(ActionType.REQUEST_TO_DISABLE_CONNECTOR),
  enableConnector: createAction(ActionType.REQUEST_TO_ENABLE_CONNECTOR),
  startConnector: createAction(ActionType.REQUEST_TO_START_CONNECTOR),
  stopConnector: createAction(ActionType.REQUEST_TO_STOP_CONNECTOR),
}

export function* watchFetchConnector() {
  yield* takeEvery(
    ActionType.FETCH_CONNECTOR,
    Handler.handleFetchConnector
  )
}

export function* watchOpenConfigEditor() {
  yield* takeEvery(
    ActionType.REQUEST_TO_OPEN_CONFIG_EDITOR,
    Handler.handleOpenConfigEditor
  )
}

export function* watchOpenRemoveDialog() {
  yield* takeEvery(
    ActionType.REQUEST_TO_OPEN_REMOVE_DIALOG,
    Handler.handleOpenRemoveDialog
  )
}

export function* watchUpdateConfig() {
  yield* takeEvery(
    ActionType.REQUEST_TO_UPDATE_CONFIG,
    Handler.handleUpdateConfig
  )
}

export function* watchRemoveConnector() {
  yield* takeEvery(
    ActionType.REQUEST_TO_REMOVE_CONNECTOR,
    Handler.handleRemove,
  )
}

export function* watchCreateConnector() {
  yield* takeEvery(
    ActionType.REQUEST_TO_CREATE_CONNECTOR,
    Handler.handleCreateConnector
  )
}

export function* watchDisableConnector() {
  yield* takeEvery(
    ActionType.REQUEST_TO_DISABLE_CONNECTOR,
    Handler.handleDisableConnector
  )
}

export function* watchEnableConnector() {
  yield* takeEvery(
    ActionType.REQUEST_TO_ENABLE_CONNECTOR,
    Handler.handleEnableConnector
  )
}

export function* watchStartConnector() {
  yield* takeEvery(
    ActionType.REQUEST_TO_START_CONNECTOR,
    Handler.handleStartConnector
  )
}

export function* watchStopConnector() {
  yield* takeEvery(
    ActionType.REQUEST_TO_STOP_CONNECTOR,
    Handler.handleStopConnector
  )
}

export default function* root() {
  yield [
    fork(Handler.initialize),
    fork(watchFetchConnector),
    fork(watchOpenConfigEditor),
    fork(watchOpenRemoveDialog),
    fork(watchUpdateConfig),
    fork(watchCreateConnector),
    fork(watchRemoveConnector),
    fork(watchDisableConnector),
    fork(watchEnableConnector),
    fork(watchStartConnector),
    fork(watchStopConnector),
  ]
}
