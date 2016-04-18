import { take, put, call, select, } from 'redux-saga/effects'

import { Action as SorterAction, Payload as SorterPayload, } from '../reducers/ConnectorReducer/SorterState'
import { Action as ConnectorItemAction, Payload as ConnectorItemPayload, } from '../reducers/ConnectorReducer/ItemState'
import { Action as ContainerSelectorAction, Payload as ContainerSelectorPayload, } from '../reducers/ConnectorReducer/ContainerSelectorState'
import { Action as EditorDialogAction, Payload as EditorDialogPayload, } from '../reducers/ConnectorReducer/EditorDialogState'
import { Action as SnackbarAction, Payload as SnackbarPayload, } from '../reducers/ConnectorReducer/ClosableSnackbarState'

import * as SagaAction from '../middlewares/SagaAction'

import * as API from './api'
import * as Selector from '../reducers/ConnectorReducer/selector'

export const JOB_TRANSITION_DELAY = 1000

/** utils */

export function* callFetchAll() {
  const container = yield select(Selector.getSelectedContainer)
  const currentSortStrategy = yield select(Selector.getCurrentSortStrategy)

  const connectors = yield call(API.fetchAll, container)
  yield put(ConnectorItemAction.updateAll({
    [ConnectorItemPayload.CONNECTORS]: connectors,
  }))
  yield put(SorterAction.sort({
    [SorterPayload.STRATEGY]: currentSortStrategy,
  }))
  yield put(ContainerSelectorAction.selectContainer({
    [ContainerSelectorPayload.CONTAINER]: container,
  }))
}

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

    const connector = yield call(API.fetchConfig, name)

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
