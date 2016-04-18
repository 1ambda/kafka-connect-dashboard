import { createAction, handleActions, } from 'redux-actions'

import * as SorterState from './SorterState'
import * as FilterState from './FilterState'

export const STATE = {
  STOPPED: 'STOPPED', /** readonly */
  WAITING: 'WAITING',
  RUNNING: 'RUNNING',
}

export const ITEM_PROPERTY = {
  state: 'state', /** array */
  switching: 'switching', /** boolean */
  name: 'name', /** string */
  tags: 'tags', /** array */
  config: 'config', /** array */
}

export const INITIAL_ITEM_STATE = {
  name: '', tags: [], state: STATE.WAITING, switching: false, config: {},
}

export const isRunning = (connector) => connector[ITEM_PROPERTY.state] === STATE.RUNNING
export const isStopped = (connector) => connector[ITEM_PROPERTY.state] === STATE.STOPPED
export const isWaiting = (connector) => connector[ITEM_PROPERTY.state] === STATE.WAITING

export const isSwitching = (connector) => connector[ITEM_PROPERTY.switching]

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
  const filter = (connector) => (payload.name === connector[ITEM_PROPERTY.name] && isRunning(connector))
  return modifyWithFilter(state, filter, ITEM_PROPERTY.state, STATE.WAITING)
}

export const start = (state, { payload, }) => {
  const filter = (connector) => (payload.name === connector[ITEM_PROPERTY.name] && isWaiting(connector))
  return modifyWithFilter(state, filter, ITEM_PROPERTY.state, STATE.RUNNING)
}

export const update = (state, { payload, }) => {
  const updated = payload.connector
  const filter = (connector) => (updated[ITEM_PROPERTY.name] === connector[ITEM_PROPERTY.name])
  return replaceWithFilter(state, filter, updated)
}

export const setReadonly = (state, { payload, }) => {
  const filter = (connector) => (payload.name === connector[ITEM_PROPERTY.name] && isWaiting(connector))
  return modifyWithFilter(state, filter, ITEM_PROPERTY.state, STATE.STOPPED)
}

export const unsetReadonly = (state, { payload, }) => {
  const filter = (connector) => (payload.name === connector[ITEM_PROPERTY.name] && isStopped(connector))
  return modifyWithFilter(state, filter, ITEM_PROPERTY.state, STATE.WAITING)
}

export const startSwitching = (state, { payload, }) => {
  const filter = (connector) => (payload.name === connector[ITEM_PROPERTY.name])
  return modifyWithFilter(state, filter, ITEM_PROPERTY.switching, true)
}

export const endSwitching = (state, { payload, }) => {
  const filter = (connector) => (payload.name === connector[ITEM_PROPERTY.name])
  return modifyWithFilter(state, filter, ITEM_PROPERTY.switching, false)
}

export const updateAll = (state, { payload, }) => {
  return payload.connectors
}

export const stopAll = (state) => {
  /** iff connector is running */
  const filter = (connector) => isRunning(connector)
  return modifyWithFilter(state, filter, ITEM_PROPERTY.state, STATE.WAITING)
}

export const startAll = (state) => {
  /** iff not running and not readonly */
  const filter = (connector) => isWaiting(connector)
  return modifyWithFilter(state, filter, ITEM_PROPERTY.state, STATE.RUNNING)
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

export function sort(state, { payload, }) {
  const connectors = state.slice() /** copy origin state */

  switch(payload.strategy) {
    case SorterState.RUNNING:
      return connectors.sort(sortByRunning)
    case SorterState.WAITING:
      return connectors.sort(sortByWaiting)
    case SorterState.STOPPED:
      return connectors.sort(sortByStopped)
  }

  return state
}

/** utils */

export function validateName(name) {
  /** validate id */
  if (name === void 0 || '' === name) {
    throw new Error('EMPTY CONNECTOR NAME')
  }
}

export function validateConnectorName(connector) {

  /** if undefined or empty connector*/
  if (connector === void 0 || Object.keys(connector).length === 0) {
    throw new Error('EMPTY CONNECTOR')
  }

  const id = connector[ITEM_PROPERTY.id] /** id might be undefined */

  validateName(id)

  return id
}

export function checkDuplicated(name, existings) {
  /** check already exists in client connectors */
  const alreadyExist = existings.reduce((exist, connector) => {
    return exist || name === connector[ITEM_PROPERTY.name]
  }, false)

  if (alreadyExist) {
    throw new Error(`DUPLICATED: ${name}`)
  }
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
  /** client only */
  [ActionType.START_SWITCHING]: startSwitching,
  [ActionType.END_SWITCHING]: endSwitching,

  [SorterState.ActionType.SORT]: sort,

  /** api related */
  [ActionType.UPDATE_ALL]: updateAll,
  [ActionType.UPDATE]: update,
}, INITIAL_STATE)
