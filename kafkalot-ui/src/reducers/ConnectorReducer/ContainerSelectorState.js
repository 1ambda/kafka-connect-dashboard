import { createAction, handleActions, } from 'redux-actions'

import * as URL from '../../middlewares/url'

export const ActionType = {
  SELECT_CONTAINER: 'SELECT_CONTAINER',
}

export const Payload = {
  CONTAINER: 'container',
}

export const Action = {
  selectContainer: createAction(ActionType.SELECT_CONTAINER),
}

export const INITIAL_STATE = {
  selectedContainer: URL.INITIAL_CONTAINER_NAME,
  availableContainers: URL.CONTAINER_NAMES,
}

export const handler = handleActions({
  [ActionType.SELECT_CONTAINER]: (state, { payload, }) => {
    return Object.assign({}, state, { selectedContainer: payload[Payload.CONTAINER], })
  },

}, INITIAL_STATE)
