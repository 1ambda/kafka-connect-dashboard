import { ROOT, CONNECTOR, } from '../../constants/State'
import { ConnectorListProperty, ConnectorProperty, } from './ConnectorListState'
import { Property as StorageSelectorProperty, } from './StorageSelectorState'

export function findConnector(state, connectorName) {
  const connectors = state[ROOT.CONNECTOR][CONNECTOR.CONNECTOR_LIST][ConnectorListProperty.CONNECTORS]
  const found = connectors.filter(c => c[ConnectorProperty.NAME] === connectorName)

  if (found) return found[0]
  else return null
}

export function getCheckedConnectors(state) {
  const connectors = state[ROOT.CONNECTOR][CONNECTOR.CONNECTOR_LIST][ConnectorListProperty.CONNECTORS]
  return connectors.filter(c => c[ConnectorProperty.CHECKED] === true)
}

export function getCurrentSorter(state) {
  return state[ROOT.CONNECTOR][CONNECTOR.CONNECTOR_LIST][ConnectorListProperty.SORTER]
}

export function getSelectedStorage(state) {
  return state[ROOT.CONNECTOR][CONNECTOR.STORAGE_SELECTOR][StorageSelectorProperty.SELECTED_STORAGE]
}
