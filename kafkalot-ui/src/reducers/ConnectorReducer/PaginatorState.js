import { createAction, handleActions, } from 'redux-actions'

import { PAGINATOR_ITEM_COUNT_PER_PAGE, } from '../../constants/config'

import * as FilterState from './FilterState'
import * as SorterState from './SorterState'

const INITIAL_PAGINATOR_STATE = {
  currentPageOffset: 0,
  currentItemOffset: 0,
  itemCountPerPage: PAGINATOR_ITEM_COUNT_PER_PAGE,
}

export const ActionType = {
  CHANGE_PAGE_OFFSET: 'CHANGE_PAGE_OFFSET',
}

export const Action = {
  changePageOffset: createAction(ActionType.CHANGE_PAGE_OFFSET),
}

export const handler = handleActions({
  [ActionType.CHANGE_PAGE_OFFSET]: (state, { payload, }) => {
    const { newPageOffset, } = payload
    const currentItemOffset = newPageOffset * state.itemCountPerPage
    return Object.assign({}, state, {currentPageOffset: newPageOffset, currentItemOffset,})
  },

  /** reset paginator if filter or sorter action is occurred */
  [SorterState.ActionType.SORT]: (state) => INITIAL_PAGINATOR_STATE,
  [FilterState.ActionType.FILTER]: (state) => INITIAL_PAGINATOR_STATE,
}, INITIAL_PAGINATOR_STATE)

