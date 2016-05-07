import { take, put, call, select, } from 'redux-saga/effects'

import { Action as SorterAction, Payload as SorterPayload, } from '../reducers/ConnectorReducer/SorterState'
import {
  isRunning, isWaiting, isStopped,
  ItemProperty as ConnectorItemProperty,
  Action as ConnectorItemAction,
  Payload as ConnectorItemPayload,
  isEmptyConnector, isEmptyName, isEmptyConfig,
} from '../reducers/ConnectorReducer/ItemState'
import { Action as StorageSelectorAction, Payload as StorageSelectorPayload, } from '../reducers/ConnectorReducer/StorageSelectorState'
import { Action as EditorDialogAction, Payload as EditorDialogPayload, } from '../reducers/ConnectorReducer/EditorDialogState'
import { Action as SnackbarAction, Payload as SnackbarPayload, } from '../reducers/ConnectorReducer/ClosableSnackbarState'

import { Code as ErrorCode, } from '../constants/error'
import * as Converter from './converter'
import * as API from './api'
import * as Selector from '../reducers/ConnectorReducer/selector'

export const JOB_TRANSITION_DELAY = 1000

/**
 * handlers that catch exceptions and validate conditions. (used in watcher functions)
 */

export function* initialize() {
  try {
    yield call(fetchAndUpdateAll)
  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
        [SnackbarPayload.MESSAGE]: 'Failed to fetch all connectors',
        [SnackbarPayload.ERROR]: error,
    }))
  }
}

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
    }))
  }
}

export function* handleSetReadonly(action) {
  const { payload, } = action

  let name = null

  try {
    const connector = payload[ConnectorItemPayload.CONNECTOR]

    if (isStopped(connector) || isRunning(connector))
      throw new Error(ErrorCode.INVALID_STATE)

    name = connector[ConnectorItemProperty.name]
    if (isEmptyName(name)) throw new Error(ErrorCode.EMPTY_NAME)

    yield call(setReadonly, connector, name)

  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
        [SnackbarPayload.MESSAGE]: `Failed to set readonly '${name}'`,
        [SnackbarPayload.ERROR]: error,
    }))
  }
}

export function* handleUnsetReadonly(action) {
  const { payload, } = action

  let name = null

  try {
    const connector = payload[ConnectorItemPayload.CONNECTOR]

    if (isWaiting(connector) || isRunning(connector))
      throw new Error(ErrorCode.INVALID_STATE)

    name = connector[ConnectorItemProperty.name]
    if (isEmptyName(name)) throw new Error(ErrorCode.EMPTY_NAME)

    yield call(unsetReadonly, connector, name)

  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
        [SnackbarPayload.MESSAGE]: `Failed to unset readonly '${name}'`,
        [SnackbarPayload.ERROR]: error,
    }))
  }
}

export function* handleCreate(action) {
  const { payload, } = action

  let connector = null
  let name = null

  try {
    connector = payload[ConnectorItemPayload.CONNECTOR]

    name = connector[ConnectorItemProperty.name]
    if (isEmptyName(name)) throw new Error(ErrorCode.EMPTY_NAME)

    const existing = yield select(Selector.getConnectorByNameElseEmptyConnector, name)
    if (!isEmptyConnector(existing)) throw new Error(ErrorCode.DUPLICATE_NAME)

    yield call(create, connector, name)
  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
        [SnackbarPayload.MESSAGE]: `Failed to create '${name}'`,
        [SnackbarPayload.ERROR]: error,
    }))
  }
}

export function* handleUpdate(action) {
  const { payload, } = action

  let name = null

  try {
    const connector = payload[ConnectorItemPayload.CONNECTOR]
    name = payload[ConnectorItemPayload.NAME]

    if (isEmptyName(name)) throw new Error(ErrorCode.EMPTY_NAME)

    /** name field in connector object */
    const connectorName = connector[ConnectorItemProperty.name]

    if (isEmptyName(connectorName)) throw new Error(ErrorCode.EMPTY_NAME)

    if (name !== connectorName) throw new Error(ErrorCode.CANNOT_CHANGE_NAME)

    yield call(update, connector, name)
  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
      [SnackbarPayload.MESSAGE]: `Failed to update '${name}'`,
      [SnackbarPayload.ERROR]: error,
    }))
  }
}

export function* handleRemove(action) {
  const { payload, } = action

  let name = null

  try {
    const connector = payload[ConnectorItemPayload.CONNECTOR]
    name = connector[ConnectorItemProperty.name]
    if (isEmptyName(name)) throw new Error(ErrorCode.EMPTY_NAME)

    yield call(remove, name)
  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
        [SnackbarPayload.MESSAGE]: `Failed to remove '${name}'`,
        [SnackbarPayload.ERROR]: error,
    }))
  }
}

export function* handleStart(action) {
  const { payload, } = action

  let name = null

  try {
    const connector = payload[ConnectorItemPayload.CONNECTOR]
    name = connector[ConnectorItemProperty.name]

    yield put(ConnectorItemAction.startSwitching({
      [ConnectorItemPayload.NAME]: name,
    }))
    yield call(API.delay, JOB_TRANSITION_DELAY)

    if (isEmptyName(name)) throw new Error(ErrorCode.EMPTY_NAME)

    yield call(start, connector, name)
  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
      [SnackbarPayload.MESSAGE]: `Failed to start '${name}'`,
      [SnackbarPayload.ERROR]: error,
    }))
  }

  yield put(ConnectorItemAction.endSwitching({
    [ConnectorItemPayload.NAME]: name,
  }))
}

export function* handleStop(action) {
  const { payload, } = action

  let name = null

  try {
    const connector = payload[ConnectorItemPayload.CONNECTOR]
    name = connector[ConnectorItemProperty.name]

    yield put(ConnectorItemAction.startSwitching({
      [ConnectorItemPayload.NAME]: name,
    }))
    yield call(API.delay, JOB_TRANSITION_DELAY)

    /** validation */
    if (isEmptyName(name)) throw new Error(ErrorCode.EMPTY_NAME)

    yield call(stop, connector, name)

  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
      [SnackbarPayload.MESSAGE]: `Failed to stop '${name}'`,
      [SnackbarPayload.ERROR]: error,
    }))
  }

  yield put(ConnectorItemAction.endSwitching({
    [ConnectorItemPayload.NAME]: name,
  }))
}

/** utils that call high-level APIs and update redux state. */

export function* fetchAndUpdateAll() {
  const currentSortStrategy = yield select(Selector.getCurrentSortStrategy)
  const storageName = yield select(Selector.getSelectedStorage)

  const connectors = yield call(API.fetchAll, storageName)
  yield put(ConnectorItemAction.updateAll({
    [ConnectorItemPayload.CONNECTORS]: connectors,
  }))
  yield put(SorterAction.sort({
    [SorterPayload.STRATEGY]: currentSortStrategy,
  }))
}

export function* setReadonly(connector, name) {
  const meta = Converter.createStorageMetaToDisable(connector)
  const updated = yield call(API.putConnectorMeta, name, meta)

  yield put(ConnectorItemAction.update({
    [ConnectorItemPayload.CONNECTOR]: updated,
  }))
}

export function* unsetReadonly(connector, name) {
  const meta = Converter.createStorageMetaToEnable(connector)
  const updated = yield call(API.putConnectorMeta, name, meta)

  yield put(ConnectorItemAction.update({
    [ConnectorItemPayload.CONNECTOR]: updated,
  }))
}

export function* create(connector, name) {
  const connectorWithMeta = Object.assign(Converter.getInitialStorageMeta(), connector)
  yield call(API.postConnector, connectorWithMeta)

  yield call(fetchAndUpdateAll) /** then, updated all */

  yield put(SnackbarAction.openInfoSnackbar({
    [SnackbarPayload.MESSAGE]: `Created connector '${name}'`,
  }))
}

export function* update(connector, name) {
  yield call(API.putConnector, connector, name)

  const updated = yield call(API.fetchConnector, name) /** then, update it */

  yield put(ConnectorItemAction.update({
    [ConnectorItemPayload.CONNECTOR]: updated,
  }))

  yield put(SnackbarAction.openInfoSnackbar({
    [SnackbarPayload.MESSAGE]: `Updated connector '${name}'`,
  }))
}

export function* remove(name) {
  yield call(API.deleteConnector, name)

  yield call(fetchAndUpdateAll) /** then, updated all */

  yield put(SnackbarAction.openInfoSnackbar({
    [SnackbarPayload.MESSAGE]: `Removed connector '${name}'`,
  }))
}

export function* start(connector, name) {
  const meta = Converter.createStorageMetaToStart(connector)
  const updated = yield call(API.putConnectorMeta, name, meta)

  yield put(ConnectorItemAction.update({
    [ConnectorItemPayload.CONNECTOR]: updated,
  }))
}

export function* stop(connector, name) {
  const meta = Converter.createStorageMetaToStop(connector)
  const updated = yield call(API.putConnectorMeta, name, meta)

  yield put(ConnectorItemAction.update({
    [ConnectorItemPayload.CONNECTOR]: updated,
  }))
}

