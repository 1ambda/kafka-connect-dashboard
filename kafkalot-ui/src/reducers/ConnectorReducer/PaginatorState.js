import { createAction, handleActions, } from 'redux-actions'

import { CommonActionType, } from './ConnectorActionType'

export const ActionType = {
  CHANGE_PAGE_OFFSET: 'CONNECTOR/PAGINATOR/CHANGE_PAGE_OFFSET',
  CHANGE_PAGE_ITEM_COUNT: 'CONNECTOR/PAGINATOR/CHANGE_PAGE_ITEM_COUNT',
}

export const Action = {
  changePageOffset: createAction(ActionType.CHANGE_PAGE_OFFSET),
  changePageItemCount: createAction(ActionType.CHANGE_PAGE_ITEM_COUNT),
}

export const Property = {
  PAGE_OFFSET: 'pageOffset',
  ITEM_OFFSET: 'itemOffset',
  ITEM_COUNT_PER_PAGE: 'itemCountPerPage',
  AVAILABLE_ITEM_COUNTS_PER_PAGE: 'availableItemCountsPerPage',
}

const AvailableItemCountsPerPage = [ 10, 25, 50, 100, ]

export const INITIAL_STATE = {
  [Property.PAGE_OFFSET]: 0,
  [Property.ITEM_OFFSET]: 0,
  [Property.ITEM_COUNT_PER_PAGE]: AvailableItemCountsPerPage[0],
  [Property.AVAILABLE_ITEM_COUNTS_PER_PAGE]: AvailableItemCountsPerPage,
}

export const handler = handleActions({

  /** reset offset if the filter keyword changes */
  [CommonActionType.CHANGE_FILTER_KEYWORD]: (state) => {
    return Object.assign({}, state, {
      [Property.PAGE_OFFSET]: INITIAL_STATE[Property.PAGE_OFFSET],
      [Property.ITEM_OFFSET]: INITIAL_STATE[Property.ITEM_OFFSET],
    })
  },

  /** reset offset if the sorter changes */
  [CommonActionType.CHANGE_SORTER]: (state) => {
    return Object.assign({}, state, {
      [Property.PAGE_OFFSET]: INITIAL_STATE[Property.PAGE_OFFSET],
      [Property.ITEM_OFFSET]: INITIAL_STATE[Property.ITEM_OFFSET],
    })
  },

  [ActionType.CHANGE_PAGE_OFFSET]: (state, { payload, }) => {
    const newPageOffset = payload[Property.PAGE_OFFSET]
    const currentItemOffset = newPageOffset * state[Property.ITEM_COUNT_PER_PAGE]

    return Object.assign({}, state, {
      [Property.PAGE_OFFSET]: newPageOffset,
      [Property.ITEM_OFFSET]: currentItemOffset,
    })
  },

  [ActionType.CHANGE_PAGE_ITEM_COUNT]: (state, { payload, }) => {
    const pageOffset = INITIAL_STATE[Property.PAGE_OFFSET] /** reset */
    const newPageItemCount = payload[Property.ITEM_COUNT_PER_PAGE]
    const currentItemOffset = pageOffset * newPageItemCount

    return Object.assign({}, state, {
      [Property.PAGE_OFFSET]: pageOffset,
      [Property.ITEM_OFFSET]: currentItemOffset,
      [Property.ITEM_COUNT_PER_PAGE]: newPageItemCount,
    })
  },

}, INITIAL_STATE)
