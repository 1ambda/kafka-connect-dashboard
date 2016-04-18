import { createAction, handleActions, } from 'redux-actions'

export const RUNNING = 'Running'
export const STOPPED = 'Stopped'
export const WAITING = 'Waiting'

export const AVAILABLE_STRATEGIES = [
  RUNNING,
  WAITING,
  STOPPED,
]

export const ActionType = {
  SORT: 'SORT',
}

export const Payload = {
  STRATEGY: 'strategy',
}

export const Action = {
  sort: createAction(ActionType.SORT),
}

const INITIAL_STATE = {
  selectedStrategy: RUNNING,
  availableStrategies: AVAILABLE_STRATEGIES,
}

export const handler = handleActions({
  [ActionType.SORT]: (state, { payload, }) =>
    Object.assign({}, state, { selectedStrategy: payload[Payload.STRATEGY], }),
}, INITIAL_STATE)
