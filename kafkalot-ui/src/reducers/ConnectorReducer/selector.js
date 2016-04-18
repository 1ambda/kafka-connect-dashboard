import { ROOT, CONNECTOR, } from '../../constants/state'

export function getConnectorItems(state) {
  return state[ROOT.CONNECTOR][CONNECTOR.ITEMS]
}

export function getSelectedContainer(state) {
  return state[ROOT.CONNECTOR][CONNECTOR.CONTAINER_SELECTOR].selectedContainer
}

export function getCurrentSortStrategy(state) {
  return state[ROOT.CONNECTOR][CONNECTOR.SORTER].selectedStrategy
}

