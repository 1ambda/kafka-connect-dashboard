import { createAction, handleActions, } from 'redux-actions'

import * as SorterState from './SorterState'
import * as FilterState from './FilterState'

export const State = {
  STOPPED: 'STOPPED', /** readonly */
  WAITING: 'WAITING',
  RUNNING: 'RUNNING',
}

export const ItemProperty = {
  state: 'state', /** array */
  switching: 'switching', /** boolean */
  name: 'name', /** string */
  tags: 'tags', /** array */
  config: 'config', /** array */
}

export const INITIAL_ITEM_STATE = {
  name: '', tags: [], state: State.WAITING, switching: false, config: {},
}

export const Payload = {
  NAME: ItemProperty.name,
  CONNECTOR: 'connector',
  CONNECTORS: 'connectors',
}

export const isRunning = (connector) => connector[ItemProperty.state] === State.RUNNING
export const isStopped = (connector) => connector[ItemProperty.state] === State.STOPPED
export const isWaiting = (connector) => connector[ItemProperty.state] === State.WAITING

export const isSwitching = (connector) => connector[ItemProperty.switching]

export function getNameFilter(updated) {
  return (connector) => (updated[ItemProperty.name] === connector[ItemProperty.name])
}

export const modifyProp = (connector, prop, value) =>
  Object.assign({}, connector, {[prop]: value,})

export const modifyWithFilter = (state, filter, prop, value) =>
  state.map(connector => {
    return (filter(connector)) ? modifyProp(connector, prop, value) : connector
  })

export const replaceWithFilter = (state, filter, updated) =>
  state.map(connector => {
    return (filter(connector)) ? updated : connector
  })

export const stop = (state, { payload, }) => {
  // TODO use compose to combine filters
  const filter = (connector) => (payload.name === connector[ItemProperty.name] && isRunning(connector))
  return modifyWithFilter(state, filter, ItemProperty.state, State.WAITING)
}

export const start = (state, { payload, }) => {
  const filter = (connector) => (payload.name === connector[ItemProperty.name] && isWaiting(connector))
  return modifyWithFilter(state, filter, ItemProperty.state, State.RUNNING)
}

export const startSwitching = (state, { payload, }) => {
  const filter = (connector) => (payload.name === connector[ItemProperty.name])
  return modifyWithFilter(state, filter, ItemProperty.switching, true)
}

export const endSwitching = (state, { payload, }) => {
  const filter = (connector) => (payload.name === connector[ItemProperty.name])
  return modifyWithFilter(state, filter, ItemProperty.switching, false)
}

export function sortByRunning(connector1, connector2) {
  if (isRunning((connector1)) && !isRunning(connector2)) return -1
  else if (!isRunning(connector1) && isRunning(connector2)) return 1

  /** if both connectors are not running, enabled first  */
  if (!isStopped(connector1) && isStopped(connector2)) return -1
  else if (isStopped(connector1) && !isStopped(connector2)) return 1
  else return 0
}

export function sortByWaiting(connector1, connector2) {
  if (!isRunning(connector1) && isRunning(connector2)) return -1
  else if (isRunning(connector1) && !isRunning(connector2)) return 1

  /** if both connectors are not running, enabled first  */
  if (!isStopped(connector1) && isStopped(connector2)) return -1
  else if (isStopped(connector1) && !isStopped(connector2)) return 1
  else return 0
}

export function sortByStopped(connector1, connector2) {
  if (!isRunning(connector1) && isRunning(connector2)) return -1
  else if (isRunning(connector1) && !isRunning(connector2)) return 1

  /** if both connectors are not running */
  if (isStopped(connector1) && !isStopped(connector2)) return -1
  else if (!isStopped(connector1) && isStopped(connector2)) return 1
  else return 0
}

export const ActionType = {
  START_SWITCHING: 'START_SWITCHING',
  END_SWITCHING: 'END_SWITCHING',
  UPDATE_ALL: 'UPDATE_ALL',
  UPDATE: 'UPDATE',
}

export const Action = {
  startSwitching: createAction(ActionType.START_SWITCHING),
  endSwitching: createAction(ActionType.END_SWITCHING),
  updateAll: createAction(ActionType.UPDATE_ALL),
  update: createAction(ActionType.UPDATE),
}

const INITIAL_STATE = []

export const handler = handleActions({
  /** from UI component */
  [ActionType.START_SWITCHING]: startSwitching,
  [ActionType.END_SWITCHING]: endSwitching,
  [SorterState.ActionType.SORT]: (state, { payload, }) => {
    const strategy = payload[SorterState.Payload.STRATEGY]
    const connectors = state.slice() /** copy origin state */

    switch(strategy) {
      case SorterState.RUNNING:
        return connectors.sort(sortByRunning)
      case SorterState.WAITING:
        return connectors.sort(sortByWaiting)
      case SorterState.STOPPED:
        return connectors.sort(sortByStopped)
    }

    return state
  },

  /** from API sagas */
  [ActionType.UPDATE_ALL]: (state, { payload, }) => {
    return payload[Payload.CONNECTORS]
  },

  [ActionType.UPDATE]: (state, { payload, }) => {
    const updated = payload[Payload.CONNECTOR]
    return replaceWithFilter(state, getNameFilter(updated), updated)
  },
}, INITIAL_STATE)
