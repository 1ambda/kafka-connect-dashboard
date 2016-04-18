import { ROOT, CONNECTOR, } from '../../constants/state'
import { ItemProperty as ConnectorProperty, } from './ItemState'

export function findConnector(connectors, name) {
  const found = connectors.filter(c => c[ConnectorProperty.name] === name)

  if (found.length >= 2) throw new Error(`DUPLICATED CONNECTOR '${name}'`)
  if (found.length === 0) throw new Error(`NO CONNECTOR '${name}`)

  return found[0]
}

export function getConnector(state, connectorName) {
  const connectors = state[ROOT.CONNECTOR][CONNECTOR.ITEMS]
  return findConnector(connectors, connectorName)
}

export function getSelectedContainer(state) {
  return state[ROOT.CONNECTOR][CONNECTOR.CONTAINER_SELECTOR].selectedContainer
}

export function getCurrentSortStrategy(state) {
  return state[ROOT.CONNECTOR][CONNECTOR.SORTER].selectedStrategy
}

