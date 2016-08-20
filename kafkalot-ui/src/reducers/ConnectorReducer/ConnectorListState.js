import { createAction, handleActions, } from 'redux-actions'

import { Property as PaginatorProperty, } from './PaginatorState'
import { ConnectorState, } from '../../constants/ConnectorState'
import { SorterType, AvailableSorters, } from '../../constants/Sorter'
import { CommonActionType, } from './ConnectorActionType'


export const Payload = {
  CONNECTOR: 'connector',
  CONNECTORS: 'connectors',
  FILTER_KEYWORD: 'filterKeyword',
  NEW_PAGE_OFFSET: 'newPageOffset',
  SORTER: 'sorter',
}

export function isEmptyName(name) {
  return (name === void 0) || (name === null) || (name === '')
}

export const ActionType = {
  ADD_FETCHED_CONNECTOR: 'CONNECTOR/LIST/ADD_FETCHED_CONNECTOR',
  SET_CONNECTOR_PROPERTY: 'CONNECTOR/LIST/SET_CONNECTOR_PROPERTY',
  SET_CONNECTOR_TASKS: 'CONNECTOR/LIST/SET_CONNECTOR_TASKS',
  ADD_CREATED_CONNECTOR: 'CONNECTOR/LIST/ADD_CREATED_CONNECTOR',
  REMOVE_DELETED_CONNECTOR: 'CONNECTOR/LIST/REMOVE_DELETED_CONNECTOR',
  SET_CHECKED: 'CONNECTOR/LIST/SET_CHECKED',
  TOGGLE_CURRENT_PAGE_CHECKBOXES: 'CONNECTOR/LIST/TOGGLE_CURRENT_PAGE_CHECKBOXES',
}

export const Action = {
  setConnectorChecked: createAction(ActionType.SET_CHECKED),
  changeFilterKeyword: createAction(CommonActionType.CHANGE_FILTER_KEYWORD),
  changeSorter: createAction(CommonActionType.CHANGE_SORTER),

  toggleCurrentPageCheckboxes: createAction(ActionType.TOGGLE_CURRENT_PAGE_CHECKBOXES),
}

export const PrivateAction = {
  setConnector: createAction(ActionType.SET_CONNECTOR_PROPERTY),
  setConnectorTasks: createAction(ActionType.SET_CONNECTOR_TASKS),
  addCreatedConnector: createAction(ActionType.ADD_CREATED_CONNECTOR),
  removeDeletedConnector: createAction(ActionType.REMOVE_DELETED_CONNECTOR),
  addFetchedConnector: createAction(ActionType.ADD_FETCHED_CONNECTOR),
}

export const ConnectorListProperty = {
  CONNECTORS: 'connectors',
  FILTER_KEYWORD: 'filterKeyword',
  SORTER: 'sorter',
  TABLE_HEADER_CHECKED: 'tableHeaderChecked',
}

export const ConnectorProperty = {
  NAME: 'name',
  STATE: 'state',
  CONFIG: 'config',
  TASKS: 'tasks',
  UPTIME: 'uptime',
  TAGS: 'tags',
  CHECKED: 'checked',
}

export const ConnectorTaskProperty = {
  ID: 'id',
  WORKER_ID: 'worker_id',
  STATE: 'state',
  TRACE: 'trace',
}

export function isRunningState(state) { return state === ConnectorState.RUNNING }
export function isUnassignedState(state) { return state === ConnectorState.UNASSIGNED }
export function isPausedState(state) { return state === ConnectorState.PAUSED }
export function isFailedState(state) { return state === ConnectorState.FAILED }
export function isRegisteredState(state) { return state === ConnectorState.REGISTERED }
export function isDisabledState(state) { return state === ConnectorState.DISABLED }
export function isWorkingState(state) { return (!isRegisteredState(state) && !isDisabledState(state)) }

export function isFailedConnector(connector) { return isFailedState(connector[ConnectorProperty.STATE]) }
export function isPausedConnector(connector) { return isPausedState(connector[ConnectorProperty.STATE]) }
export function isRunningConnector(connector) { return isRunningState(connector[ConnectorProperty.STATE]) }
export function isRegisteredConnector(connector) { return isRegisteredState(connector[ConnectorProperty.STATE]) }
export function isDisabledConnector(connector) { return isDisabledState(connector[ConnectorProperty.STATE]) }

export function isRunningTask(task) {
  if (task[ConnectorTaskProperty.STATE] === ConnectorState.RUNNING) return true
  else return false
}

const INITIAL_FILTER_STATE = ''
const INITIAL_SORTER_STATE = AvailableSorters[0]

const INITIAL_CONNECTOR_LIST_STATE = {
  [ConnectorListProperty.CONNECTORS]: [],
  [ConnectorListProperty.FILTER_KEYWORD]: INITIAL_FILTER_STATE,
  [ConnectorListProperty.SORTER]: INITIAL_SORTER_STATE,
  [ConnectorListProperty.TABLE_HEADER_CHECKED]: false,
}

const INITIAL_CONNECTOR_STATE = {
  name: '',
  state: ConnectorState.RUNNING,
  config: {},
  tasks: [],

  switching: false,
  checked: false,
  uptime: '',
  tags: [],
}

export const handler = handleActions({
  [ActionType.ADD_FETCHED_CONNECTOR]: (state, { payload, }) => {
    const fetched = Object.assign({}, INITIAL_CONNECTOR_STATE, {
      [ConnectorProperty.NAME]: payload[ConnectorProperty.NAME],
      [ConnectorProperty.STATE]: payload[ConnectorProperty.STATE],
      [ConnectorProperty.CONFIG]: payload[ConnectorProperty.CONFIG],
      [ConnectorProperty.TASKS]: payload[ConnectorProperty.TASKS],
    })

    const connectors = state[ConnectorListProperty.CONNECTORS]
    const updatedConnectors = connectors.concat([ fetched, ])

    return Object.assign({}, state, {
      [ConnectorListProperty.CONNECTORS]: updatedConnectors,
    })
  },

  [ActionType.SET_CONNECTOR_PROPERTY]: (state, { payload, }) => {
    const name = payload[ConnectorProperty.NAME]

    const connectors = state[ConnectorListProperty.CONNECTORS]
    const updatedConnectors = connectors.map(connector => {
      if (connector[ConnectorProperty.NAME] === name) {
        return Object.assign({}, connector, {
          [ConnectorProperty.NAME]: name,
          [ConnectorProperty.STATE]: payload[ConnectorProperty.STATE],
          [ConnectorProperty.CONFIG]: payload[ConnectorProperty.CONFIG],
          [ConnectorProperty.TASKS]: payload[ConnectorProperty.TASKS],
        })
      }

      return connector
    })

    return Object.assign({}, state, {
      [ConnectorListProperty.CONNECTORS]: updatedConnectors,
    })
  },

  [ActionType.SET_CONNECTOR_TASKS]: (state, { payload, }) => {
    const name = payload[ConnectorProperty.NAME]
    const tasks = payload[ConnectorProperty.TASKS]

    const connectors = state[ConnectorListProperty.CONNECTORS]
    const updatedConnectors = connectors.map(connector => {
      if (connector[ConnectorProperty.NAME] === name) {
        return Object.assign({}, connector, {
          [ConnectorProperty.TASKS]: tasks,
        })
      }

      return connector
    })

    return Object.assign({}, state, {
      [ConnectorListProperty.CONNECTORS]: updatedConnectors,
    })
  },

  [ActionType.SET_CHECKED]: (state, { payload, }) => {
    const name = payload[ConnectorProperty.NAME]
    const checked = payload[ConnectorProperty.CHECKED]

    const connectors = state[ConnectorListProperty.CONNECTORS]
    const updatedConnectors = connectors.map(connector => {
      if (connector[ConnectorProperty.NAME] === name) {
        return Object.assign({}, connector, {
          [ConnectorProperty.CHECKED]: checked,
        })
      }

      return connector
    })

    return Object.assign({}, state, {
      [ConnectorListProperty.CONNECTORS]: updatedConnectors,
    })
  },

  [ActionType.ADD_CREATED_CONNECTOR]: (state, { payload, }) => {
    const created = payload[Payload.CONNECTOR]
    const connectors = state[ConnectorListProperty.CONNECTORS]
    const updatedConnectors = [ created, ].concat(connectors.slice())

    return Object.assign({}, state, {
      [ConnectorListProperty.CONNECTORS]: updatedConnectors,
    })
  },

  [ActionType.REMOVE_DELETED_CONNECTOR]: (state, { payload, }) => {
    const name = payload[ConnectorProperty.NAME]

    const connectors = state[ConnectorListProperty.CONNECTORS]
    const filtered = connectors.filter(c => name !== c[ConnectorProperty.NAME])

    return Object.assign({}, state, {
      [ConnectorListProperty.CONNECTORS]: filtered,
    })
  },

  [CommonActionType.CHANGE_SORTER]: (state, { payload, }) => {
    const requestedSorter = payload[Payload.SORTER]

    const connectors = state[ConnectorListProperty.CONNECTORS]
    const copiedConnectors = connectors.slice()

    switch(requestedSorter) {
      case SorterType.CHECKED:
        copiedConnectors.sort((c1, c2) => {
          const c1Checked = c1[ConnectorProperty.CHECKED]
          const c2Checked = c2[ConnectorProperty.CHECKED]

          if (c1Checked && !c2Checked ) return -1
          else if (!c1Checked && c2Checked ) return 1
          else return 0
        })
        break
      case SorterType.UNCHECKED:
        copiedConnectors.sort((c1, c2) => {
          const c1Checked = c1[ConnectorProperty.CHECKED]
          const c2Checked = c2[ConnectorProperty.CHECKED]

          if (!c1Checked && c2Checked ) return -1
          else if (c1Checked && !c2Checked ) return 1
          else return 0
        })
        break
      default:
        /** sort by connector state */
        copiedConnectors.sort((c1, c2) => {
          const c1State = c1[ConnectorProperty.STATE]
          const c2State = c2[ConnectorProperty.STATE]

          if (c1State === requestedSorter && c2State !== requestedSorter) return -1
          else if (c1State !== requestedSorter && c2State === requestedSorter) return 1
          else return 0
        })
    }

    return Object.assign({}, state, {
      [ConnectorListProperty.CONNECTORS]: copiedConnectors,
      [ConnectorListProperty.SORTER]: requestedSorter,
    })
  },

  [CommonActionType.CHANGE_FILTER_KEYWORD]: (state, { payload, }) => {
    return Object.assign({}, state, {
      [ConnectorListProperty.FILTER_KEYWORD]: payload[Payload.FILTER_KEYWORD],
    })
  },

  [ActionType.TOGGLE_CURRENT_PAGE_CHECKBOXES]: (state, { payload, }) => {
    const {
      [ConnectorListProperty.TABLE_HEADER_CHECKED]: tableHeaderChecked,
      [PaginatorProperty.ITEM_OFFSET]: itemOffset,
      [PaginatorProperty.ITEM_COUNT_PER_PAGE]: itemCountPerPage,
    } = payload

    const copied = state[ConnectorListProperty.CONNECTORS].slice()

    for (let i = itemOffset; i < itemOffset + itemCountPerPage && i < copied.length; i++) {
      const c = copied[i]
      c[ConnectorProperty.CHECKED] = tableHeaderChecked
    }

    return Object.assign({}, state, {
      [ConnectorListProperty.CONNECTORS]: copied,
      [ConnectorListProperty.TABLE_HEADER_CHECKED]: tableHeaderChecked,
    })
  },

}, INITIAL_CONNECTOR_LIST_STATE)
