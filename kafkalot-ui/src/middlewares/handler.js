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

