import { take, put, call, select, } from 'redux-saga/effects'

import * as FilterState from '../reducers/ConnectorReducer/FilterState'
import * as SorterState from '../reducers/ConnectorReducer/SorterState'
import * as PaginatorState from '../reducers/ConnectorReducer/PaginatorState'
import * as ItemState from '../reducers/ConnectorReducer/ItemState'
import * as ContainerSelectorState from '../reducers/ConnectorReducer/ContainerSelectorState'
import * as EditorDialogState from '../reducers/ConnectorReducer/EditorDialogState'
import * as ConfirmDialogState from '../reducers/ConnectorReducer/ConfirmDialogState'
import * as SnackBarState from '../reducers/ConnectorReducer/ClosableSnackbarState'

import * as SagaAction from '../middlewares/SagaAction'

import {
  sort, ITEM_PROPERTY, validateName, validateConnectorName, checkDuplicated,
} from '../reducers/ConnectorReducer/ItemState'
import * as JobSortingStrategies from '../reducers/ConnectorReducer/SorterState'
import * as API from './api'
import * as Selector from '../reducers/ConnectorReducer/selector'

export const JOB_TRANSITION_DELAY = 1000

/** utils */

export function* callFetchAll() {
  const container = yield select(Selector.getSelectedContainer)
  const currentSortStrategy = yield select(Selector.getCurrentSortStrategy)

  const connectors = yield call(API.fetchAll, container)
  yield put(ItemState.Action.updateAll({ connectors, }))
  yield put(SorterState.Action.sort({ strategy: currentSortStrategy, }))
  yield put(ContainerSelectorState.Action.selectContainer({ container, }))
}

/**
 * handlers used in watcher functions
 *
 * every handler should catch exceptions
 */

export function* handleOpenEditorDialogToEdit(action) {
  const { payload, } = action
  const container = yield select(Selector.getSelectedContainer)
  const { name, readonly, } = payload

  try {
    const connector = yield call(API.fetchConfig, container, name)
    yield put(EditorDialogState.Action.updateEditorDialogConfig({ name, readonly, connector, }))
  } catch (error) {
    yield put(SnackBarState.Action.openErrorSnackbar(
      { message: `Failed to fetch '${container}/${name}`, error, })
    )
  }
}

export function* handleUpdate(action) {
  const { payload, } = action
  const { name, connector, } = payload
  const container = yield select(Selector.getSelectedContainer)

  try {
    const updated = yield call(API.updateConfig, container, name, connector)
    yield put(ItemState.Action.update({ name, connector: updated, }))
    yield put(
      SnackBarState.Action.openInfoSnackbar(
        { message: `${container}/${name} was updated`, }
      )
    )
  } catch (error) {
    yield put(
      SnackBarState.Action.openErrorSnackbar(
        { message: `Failed to update '${container}/${name}`, error, }
      )
    )
  }
}

export function* handleCreate(action) {
  const { payload, } = action
  const { connector, } = payload
  const container = yield select(Selector.getSelectedContainer)

  try {
    /** validate */
    const name = validateConnectorName(connector)
    const existingJobs = yield select(Selector.getConnectorItems)
    checkDuplicated(connector, existingJobs)

    yield call(API.create, container, connector)
    yield call(callFetchAll)
    yield put(EditorDialogState.Action.closeEditorDialog())
    yield put(
      SnackBarState.Action.openInfoSnackbar(
        { message: `${container}/${name} was created`, }
      )
    )
  } catch (error) {
    yield put(
      SnackBarState.Action.openErrorSnackbar(
      { message: 'Failed to create ', error, }
      )
    )
  }
}

export function* handleRemove(action) {
  const { payload, } = action
  const { name, } = payload
  const container = yield select(Selector.getSelectedContainer)

  try {
    validateName(name)
    yield call(API.remove, container, name)
    yield call(callFetchAll) /** fetch all again */
    yield put(
      SnackBarState.Action.openInfoSnackbar(
        { message: `${container}/${name} was removed`, }
      )
    )
  } catch(error) {
    yield put(
      SnackBarState.Action.openErrorSnackbar(
      { message: `Failed to remove '${container}/${name}'`, error, }
      )
    )
  }
}

export function* handleSetReadonly(action) {
  const { payload, } = action
  const { name, } = payload
  const container = yield select(Selector.getSelectedContainer)

  try {
    validateName(name)
    const updated = yield call(API.setReadonly, container, name)
    yield put(ItemState.Action.update({ name, connector: updated, }))
  } catch (error) {
    yield put(
      SnackBarState.Action.openErrorSnackbar(
        { message: `Failed to set readonly '${container}/${name}'`, error, }
      )
    )
  }
}

export function* handleUnsetReadonly(action) {
  const { payload, } = action
  const { name, } = payload
  const container = yield select(Selector.getSelectedContainer)

  try {
    validateName(name)
    const updated = yield call(API.unsetReadonly, container, name)
    yield put(ItemState.Action.update({ name, connector: updated, }))
  } catch (error) {
    yield put(
      SnackBarState.Action.openErrorSnackbar(
        { message: `Failed to unset readonly '${container}/${name}'`, error, }
      )
    )
  }
}

export function* handleStart(action) {
  const { payload, } = action
  const { name, } = payload
  const container = yield select(Selector.getSelectedContainer)

  yield put(ItemState.Action.startSwitching({ name, }))

  try {
    validateName(name)
    const updatedJob = yield call(API.start, container, name)
    yield call(API.delay, JOB_TRANSITION_DELAY)
    yield put(ItemState.Action.update({ name, connector: updatedJob, }))
  } catch (error) {
    yield put(
      SnackBarState.Action.openErrorSnackbar(
        { message: `Failed to start '${container}/${name}'`, error, }
      )
    )
  }

  yield put(ItemState.Action.endSwitching({ name, }))
}

export function* handleStop(action) {
  const { payload, } = action
  const { name, } = payload
  const container = yield select(Selector.getSelectedContainer)

  yield put(ItemState.Action.startSwitching({ name, }))

  try {
    validateName(name)
    const updatedJob = yield call(API.stop, container, name)
    yield call(API.delay, JOB_TRANSITION_DELAY)
    yield put(ItemState.Action.update({ name, connector: updatedJob, }))
  } catch (error) {
    yield put(
      SnackBarState.Action.openErrorSnackbar(
        { message: `Failed to stop '${container}/${name}'`, error, }
      )
    )
  }

  yield put(ItemState.Action.endSwitching(payload))
}

export function* handleChangeContainerSelector(action) {
  const { payload, } = action
  let container = null

  const currentSortStrategy = yield select(Selector.getCurrentSortStrategy)

  try {
    container = payload.container /** payload might be undefined */

    const connectors = yield call(API.fetchAll, container)
    yield put(ItemState.Action.updateAll({ connectors, }))
    yield put(SorterState.Action.sort({ strategy: currentSortStrategy, }))
    yield put(ContainerSelectorState.Action.selectContainer({ container, }))
  } catch (error) {
    yield put(
      SnackBarState.Action.openErrorSnackbar(
        { message: `Failed to fetch all from '${container}'`, error, }
      )
    )
  }
}


