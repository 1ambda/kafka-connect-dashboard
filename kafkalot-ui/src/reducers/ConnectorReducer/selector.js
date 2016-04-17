import { CONNECTOR_STATE_PROPERTY, } from './index'
import { REDUCER_STATE_PROPERTY, } from '../../constants/state'

/** selectors used in saga handlers */
export function getConnectorItems(state) {
  return state[REDUCER_STATE_PROPERTY.CONNECTOR][CONNECTOR_STATE_PROPERTY.ITEMS]
}

export function getSelectedContainer(state) {
  return state[REDUCER_STATE_PROPERTY.CONNECTOR][CONNECTOR_STATE_PROPERTY.CONTAINER_SELECTOR].selectedContainer
}

export function getCurrentSortStrategy(state) {
  return state[REDUCER_STATE_PROPERTY.CONNECTOR][CONNECTOR_STATE_PROPERTY.SORTER].selectedStrategy
}

