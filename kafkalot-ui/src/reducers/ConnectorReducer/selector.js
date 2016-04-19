import { ROOT, CONNECTOR, } from '../../constants/state'
import {
  ItemProperty as ConnectorProperty,
  EMPTY_CONNECTOR, isEmptyConnector,
} from './ItemState'
import { Code as ErrorCode, } from '../../constants/error'


export function getConnectors(state) {
  return state[ROOT.CONNECTOR][CONNECTOR.ITEMS]
}

export function getConnectorByNameElseEmptyConnector(state, connectorName) {
  const connectors = getConnectors(state)

  try {
    return findConnector(connectors, connectorName)
  } catch (error) {
    if (error.message === ErrorCode.NO_SUCH_CONNECTOR)
      return EMPTY_CONNECTOR
    else throw error
  }
}

export function findConnector(connectors, connectorName) {
  const found = connectors.filter(c => c[ConnectorProperty.name] === connectorName)

  if (found.length >= 2) throw new Error(ErrorCode.FOUND_DUPLICATED_CONNECTORS)
  if (found.length === 0) throw new Error(ErrorCode.NO_SUCH_CONNECTOR)

  return found[0]
}

export function getConnectorByNameElseThrowError(state, connectorName) {
  const connectors = getConnectors(state)
  return findConnector(connectors, connectorName)
}

export function getSelectedContainer(state) {
  return state[ROOT.CONNECTOR][CONNECTOR.CONTAINER_SELECTOR].selectedContainer
}

export function getCurrentSortStrategy(state) {
  return state[ROOT.CONNECTOR][CONNECTOR.SORTER].selectedStrategy
}

