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
  const { id, readonly, } = payload

  try {
    const job = yield call(API.fetchConfig, container, id)
    yield put(EditorDialogState.Action.updateEditorDialogConfig({ id, readonly, job, }))
  } catch (error) {
    yield put(SnackBarState.Action.openErrorSnackbar(
      { message: `Failed to fetch job '${container}/${id}`, error, })
    )
  }
}

export function* handleUpdate(action) {
  const { payload, } = action
  const { id, job, } = payload
  const container = yield select(Selector.getSelectedContainer)

  try {
    const updatedJob = yield call(API.updateConfig, container, id, job)
    yield put(ItemState.Action.update({ id, job: updatedJob, }))
    yield put(
      SnackBarState.Action.openInfoSnackbar(
        { message: `${container}/${id} was updated`, }
      )
    )
  } catch (error) {
    yield put(
      SnackBarState.Action.openErrorSnackbar(
        { message: `Failed to update job '${container}/${id}`, error, }
      )
    )
  }
}

export function* handleCreate(action) {
  const { payload, } = action
  const { job, } = payload
  const container = yield select(Selector.getSelectedContainer)

  try {
    /** validate */
    const id = validateConnectorName(job)
    const existingJobs = yield select(Selector.getConnectorItems)
    checkDuplicated(job, existingJobs)

    yield call(API.create, container, job) /** create job */
    yield call(callFetchAll)      /** fetch all jobs again */
    yield put(EditorDialogState.Action.closeEditorDialog())
    yield put(
      SnackBarState.Action.openInfoSnackbar(
        { message: `${container}/${id} was created`, }
      )
    )
  } catch (error) {
    yield put(
      SnackBarState.Action.openErrorSnackbar(
      { message: 'Failed to create job', error, }
      )
    )
  }
}

export function* handleRemove(action) {
  const { payload, } = action
  const { id, } = payload
  const container = yield select(Selector.getSelectedContainer)

  try {
    validateName(id)
    yield call(API.remove, container, id)
    yield call(callFetchAll) /** fetch all job again */
    yield put(
      SnackBarState.Action.openInfoSnackbar(
        { message: `${container}/${id} was removed`, }
      )
    )
  } catch(error) {
    yield put(
      SnackBarState.Action.openErrorSnackbar(
      { message: `Failed to remove job '${container}/${id}'`, error, }
      )
    )
  }
}

export function* handleSetReadonly(action) {
  const { payload, } = action
  const { id, } = payload
  const container = yield select(Selector.getSelectedContainer)

  try {
    validateName(id)
    const updatedJob = yield call(API.setReadonly, container, id)
    yield put(ItemState.Action.update({ id, job: updatedJob, }))
  } catch (error) {
    yield put(
      SnackBarState.Action.openErrorSnackbar(
        { message: `Failed to set readonly '${container}/${id}'`, error, }
      )
    )
  }
}

export function* handleUnsetReadonly(action) {
  const { payload, } = action
  const { id, } = payload
  const container = yield select(Selector.getSelectedContainer)

  try {
    validateName(id)
    const updatedJob = yield call(API.unsetReadonly, container, id)
    yield put(ItemState.Action.update({ id, job: updatedJob, }))
  } catch (error) {
    yield put(
      SnackBarState.Action.openErrorSnackbar(
        { message: `Failed to unset readonly '${container}/${id}'`, error, }
      )
    )
  }
}

export function* handleStart(action) {
  const { payload, } = action
  const { id, } = payload
  const container = yield select(Selector.getSelectedContainer)

  yield put(ItemState.Action.startSwitching({ id, }))

  try {
    validateName(id)
    const updatedJob = yield call(API.start, container, id)
    yield call(API.delay, JOB_TRANSITION_DELAY)
    yield put(ItemState.Action.update({ id, job: updatedJob, }))
  } catch (error) {
    yield put(
      SnackBarState.Action.openErrorSnackbar(
        { message: `Failed to start job '${container}/${id}'`, error, }
      )
    )
  }

  yield put(ItemState.Action.endSwitching({ id, }))
}

export function* handleStop(action) {
  const { payload, } = action
  const { id, } = payload
  const container = yield select(Selector.getSelectedContainer)

  yield put(ItemState.Action.startSwitching({ id, }))

  try {
    validateName(id)
    const updatedJob = yield call(API.stop, container, id)
    yield call(API.delay, JOB_TRANSITION_DELAY)
    yield put(ItemState.Action.update({ id, job: updatedJob, }))
  } catch (error) {
    yield put(
      SnackBarState.Action.openErrorSnackbar(
        { message: `Failed to stop job '${container}/${id}'`, error, }
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

    const jobs = yield call(API.fetchAll, container)
    yield put(ItemState.Action.updateAll({ jobs, }))
    yield put(SorterState.Action.sort({ strategy: currentSortStrategy, }))
    yield put(ContainerSelectorState.Action.selectContainer({ container, }))
  } catch (error) {
    yield put(
      SnackBarState.Action.openErrorSnackbar(
        { message: `Failed to fetch jobs from '${container}'`, error, }
      )
    )
  }
}


