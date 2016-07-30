import { fork, call, put, } from 'redux-saga/effects'
import { takeEvery, } from 'redux-saga'
import { createAction, } from 'redux-actions'

import * as Handler from './Handler'

/**
 * watcher functions
 */

export const ActionType = {
  FETCH_CONNECTOR: 'CONNECTOR/SAGA/FETCH_CONNECTOR',
  REQUEST_TO_OPEN_CONFIG_EDITOR: 'CONNECTOR/SAGA/OPEN_CONFIG_EDITOR',
  REQUEST_TO_OPEN_CREATE_EDITOR: 'CONNECTOR/SAGA/OPEN_CREATE_EDITOR',
  REQUEST_TO_CHANGE_SELECTED_CONNECTOR_CLASS: 'CONNECTOR/SAGA/CHANGE_SELECTED_CONNECTOR_CLASS',
  REQUEST_TO_VALIDATE_CONNECTOR_CONFIG: 'CONNECTOR/SAGA/VALIDATE_CONNECTOR_CONFIG',
  REQUEST_TO_OPEN_REMOVE_DIALOG: 'CONNECTOR/SAGA/OPEN_REMOVE_DIALOG',
  REQUEST_TO_UPDATE_CONFIG: 'CONNECTOR/SAGA/UPDATE_CONFIG',
  REQUEST_TO_CREATE_CONNECTOR: 'CONNECTOR/SAGA/CREATE_CONNECTOR',
  REQUEST_TO_REMOVE_CONNECTOR: 'CONNECTOR/SAGA/REMOVE_CONNECTOR',
  REQUEST_TO_CHANGE_STORAGE: 'CONNECTOR/SAGA/CHANGE_STORAGE',
  REQUEST_TO_DISABLE_CONNECTOR: 'CONNECTOR/SAGA/DISABLE_CONNECTOR',
  REQUEST_TO_ENABLE_CONNECTOR: 'CONNECTOR/SAGA/ENABLE_CONNECTOR',
  REQUEST_TO_START_CONNECTOR: 'CONNECTOR/SAGA/START_CONNECTOR',
  REQUEST_TO_STOP_CONNECTOR: 'CONNECTOR/SAGA/STOP_CONNECTOR',
  REQUEST_TO_RESTART_CONNECTOR: 'CONNECTOR/SAGA/RESTART_CONNECTOR',
  REQUEST_TO_RESTART_CONNECTOR_TASK: 'CONNECTOR/SAGA/RESTART_CONNECTOR_TASK',
  REQUEST_TO_PAUSE_CONNECTOR: 'CONNECTOR/SAGA/PAUSE_CONNECTOR',
  REQUEST_TO_RESUME_CONNECTOR: 'CONNECTOR/SAGA/RESUME_CONNECTOR',
}

export const Action = {
  fetchConnector: createAction(ActionType.FETCH_CONNECTOR),
  openConfigEditor: createAction(ActionType.REQUEST_TO_OPEN_CONFIG_EDITOR),
  openCreateEditor: createAction(ActionType.REQUEST_TO_OPEN_CREATE_EDITOR),
  changeSelectedConnectorClass: createAction(ActionType.REQUEST_TO_CHANGE_SELECTED_CONNECTOR_CLASS),
  validateConnectorConfig: createAction(ActionType.REQUEST_TO_VALIDATE_CONNECTOR_CONFIG),
  openRemoveDialog: createAction(ActionType.REQUEST_TO_OPEN_REMOVE_DIALOG),
  updateConfig: createAction(ActionType.REQUEST_TO_UPDATE_CONFIG),
  createConnector: createAction(ActionType.REQUEST_TO_CREATE_CONNECTOR),
  removeConnector: createAction(ActionType.REQUEST_TO_REMOVE_CONNECTOR),
  changeStorage: createAction(ActionType.REQUEST_TO_CHANGE_STORAGE),
  disableConnector: createAction(ActionType.REQUEST_TO_DISABLE_CONNECTOR),
  enableConnector: createAction(ActionType.REQUEST_TO_ENABLE_CONNECTOR),
  startConnector: createAction(ActionType.REQUEST_TO_START_CONNECTOR),
  stopConnector: createAction(ActionType.REQUEST_TO_STOP_CONNECTOR),
  restartConnector: createAction(ActionType.REQUEST_TO_RESTART_CONNECTOR),
  restartConnectorTask: createAction(ActionType.REQUEST_TO_RESTART_CONNECTOR_TASK),
  pauseConnector: createAction(ActionType.REQUEST_TO_PAUSE_CONNECTOR),
  resumeConnector: createAction(ActionType.REQUEST_TO_RESUME_CONNECTOR),
}

export function* watchFetchConnector() {
  yield* takeEvery(
    ActionType.FETCH_CONNECTOR, Handler.handleFetchConnector)
}

export function* watchOpenConfigEditor() {
  yield* takeEvery(
    ActionType.REQUEST_TO_OPEN_CONFIG_EDITOR, Handler.handleOpenConfigEditor)
}

export function* watchOpenCreateEditor() {
  yield* takeEvery(
    ActionType.REQUEST_TO_OPEN_CREATE_EDITOR, Handler.handleOpenCreateEditor)
}

export function* watchChangeSelectedConnectorClass() {
  yield* takeEvery(
    ActionType.REQUEST_TO_CHANGE_SELECTED_CONNECTOR_CLASS, Handler.handleChangeSelectedConnectorClass)
}

export function* watchValidateConnectorConfig() {
  yield* takeEvery(
    ActionType.REQUEST_TO_VALIDATE_CONNECTOR_CONFIG,
    Handler.handleValidateConnectorConfig)
}

export function* watchOpenRemoveDialog() {
  yield* takeEvery(
    ActionType.REQUEST_TO_OPEN_REMOVE_DIALOG, Handler.handleOpenRemoveDialog)
}

export function* watchUpdateConfig() {
  yield* takeEvery(
    ActionType.REQUEST_TO_UPDATE_CONFIG, Handler.handleUpdateConfig)
}

export function* watchRemoveConnector() {
  yield* takeEvery(
    ActionType.REQUEST_TO_REMOVE_CONNECTOR, Handler.handleRemove,)
}

export function* watchCreateConnector() {
  yield* takeEvery(
    ActionType.REQUEST_TO_CREATE_CONNECTOR, Handler.handleCreateConnector)
}

export function* watchDisableConnector() {
  yield* takeEvery(
    ActionType.REQUEST_TO_DISABLE_CONNECTOR, Handler.handleDisableConnector)
}

export function* watchEnableConnector() {
  yield* takeEvery(
    ActionType.REQUEST_TO_ENABLE_CONNECTOR, Handler.handleEnableConnector)
}

export function* watchStartConnector() {
  yield* takeEvery(
    ActionType.REQUEST_TO_START_CONNECTOR, Handler.handleStartConnector)
}

export function* watchStopConnector() {
  yield* takeEvery(
    ActionType.REQUEST_TO_STOP_CONNECTOR, Handler.handleStopConnector)
}

export function* watchRestartConnector() {
  yield* takeEvery(
    ActionType.REQUEST_TO_RESTART_CONNECTOR, Handler.handleRestartConnector)
}

export function* watchRestartConnectorTask() {
  yield* takeEvery(
    ActionType.REQUEST_TO_RESTART_CONNECTOR_TASK, Handler.handleRestartConnectorTask)
}

export function* watchPauseConnector() {
  yield* takeEvery(
    ActionType.REQUEST_TO_PAUSE_CONNECTOR, Handler.handlePauseConnector)
}

export function* watchResumeConnector() {
  yield* takeEvery(
    ActionType.REQUEST_TO_RESUME_CONNECTOR, Handler.handleResumeConnector)
}

export default function* root() {
  yield [
    fork(Handler.initialize),
    fork(watchFetchConnector),
    fork(watchOpenConfigEditor),
    fork(watchOpenCreateEditor),
    fork(watchChangeSelectedConnectorClass),
    fork(watchValidateConnectorConfig),
    fork(watchOpenRemoveDialog),
    fork(watchUpdateConfig),
    fork(watchCreateConnector),
    fork(watchRemoveConnector),
    fork(watchDisableConnector),
    fork(watchEnableConnector),
    fork(watchStartConnector),
    fork(watchStopConnector),
    fork(watchRestartConnector),
    fork(watchRestartConnectorTask),
    fork(watchPauseConnector),
    fork(watchResumeConnector),
  ]
}
