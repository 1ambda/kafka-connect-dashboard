import { take, put, call, select, } from 'redux-saga/effects'

import { Action as SorterAction, Payload as SorterPayload, } from '../reducers/ConnectorReducer/SorterState'
import {
  isRunning, isWaiting, isStopped,
  ItemProperty as ConnectorItemProperty,
  Action as ConnectorItemAction,
  Payload as ConnectorItemPayload,
} from '../reducers/ConnectorReducer/ItemState'
import { Action as ContainerSelectorAction, Payload as ContainerSelectorPayload, } from '../reducers/ConnectorReducer/ContainerSelectorState'
import { Action as EditorDialogAction, Payload as EditorDialogPayload, } from '../reducers/ConnectorReducer/EditorDialogState'
import { Action as SnackbarAction, Payload as SnackbarPayload, } from '../reducers/ConnectorReducer/ClosableSnackbarState'

import * as SagaAction from '../middlewares/SagaAction'

import * as Converter from './converter'
import * as API from './api'
import * as Selector from '../reducers/ConnectorReducer/selector'

export const JOB_TRANSITION_DELAY = 1000

/** utils */

/**
 * handlers used in watcher functions
 *
 * every handler should catch exceptions
 */

export function* handleOpenEditorDialogToEdit(action) {
  const { payload, } = action

  let name = null
  let readonly = null

  try {
    name = payload[EditorDialogPayload.NAME]
    readonly = payload[EditorDialogPayload.READONLY]

    const connector = yield call(API.fetchStorageConnector, name)

    yield put(EditorDialogAction.openEditorDialogToEdit({
      [EditorDialogPayload.NAME]: name,
      [EditorDialogPayload.READONLY]: readonly,
      [EditorDialogPayload.CONNECTOR]: connector,
    }))

  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
        [SnackbarPayload.MESSAGE]: `Failed to fetchConfig '${name}'`,
        [SnackbarPayload.ERROR]: error,
      })
    )
  }
}

export function* handleSetReadonly(action) {
  const { payload, } = action

  let name = null

  try {
    name = payload[ConnectorItemPayload.NAME]
    const connector = yield select(Selector.getConnector, name)

    // TODO use fetchConnector
    if (isStopped(connector) || isRunning(connector)) throw new Error('INVALID STATE')
    yield call(setReadonly, name)

  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
        [SnackbarPayload.MESSAGE]: `Failed to set readonly '${name}'`,
        [SnackbarPayload.ERROR]: error,
      })
    )
  }
}

export function* handleUnsetReadonly(action) {
  const { payload, } = action

  let name = null

  try {
    name = payload[ConnectorItemPayload.NAME]
    const connector = yield select(Selector.getConnector, name)

    // TODO use fetchConnector
    if (isWaiting(connector) || isRunning(connector)) throw new Error('INVALID STATE')

    yield call(unsetReadonly, name)

  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
        [SnackbarPayload.MESSAGE]: `Failed to unset readonly '${name}'`,
        [SnackbarPayload.ERROR]: error,
      })
    )
  }
}

/** utils that wrap high-level APIs. */

export function* fetchAndUpdateAll() {
  const currentSortStrategy = yield select(Selector.getCurrentSortStrategy)

  const connectors = yield call(API.fetchAll)
  yield put(ConnectorItemAction.updateAll({
    [ConnectorItemPayload.CONNECTORS]: connectors,
  }))
  yield put(SorterAction.sort({
    [SorterPayload.STRATEGY]: currentSortStrategy,
  }))
}

export function* setReadonly(connectorName) {
  const updated = yield call(API.patchStorageConnectorMeta, connectorName, Converter.getDisabledStorageMeta())

  yield put(ConnectorItemAction.update({
    [ConnectorItemPayload.CONNECTOR]: updated,
  }))
}

export function* unsetReadonly(connectorName) {
  const updated = yield call(API.patchStorageConnectorMeta, connectorName, Converter.getEnabledStorageMeta())

  yield put(ConnectorItemAction.update({
    [ConnectorItemPayload.CONNECTOR]: updated,
  }))
}
