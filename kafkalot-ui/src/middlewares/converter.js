import {
  INITIAL_ITEM_STATE as INITIAL_CONNECTOR_ITEM_STATE,
  ItemProperty as CONNECTOR_PROPERTY,
  State as CONNECTOR_STATE,
} from '../reducers/ConnectorReducer/ItemState'

import * as Logger from '../util/logger'

export const STORAGE_PROPERTY = {
  META: '_storage_meta',
  ENABLED: 'enabled',
  TAGS: 'tags',
}


export function getStorageMeta(storageConnector) {
  return storageConnector[STORAGE_PROPERTY.META]
}

export function getStorageEnabled(storageConnector) {
  return getStorageMeta(storageConnector)[STORAGE_PROPERTY.ENABLED]
}

export function getStorageTags(storageConnector) {
  return getStorageMeta(storageConnector)[STORAGE_PROPERTY.TAGS]
}

export function getConnectorConfig(connector) {
  return connector[CONNECTOR_PROPERTY.config]
}


/**
 * @param props Object
 * @param propsToIgnore Array of String
 */
export function removeProps(props, propsToIgnore) {
  /** copy before removing properties */
  const copied = Object.assign({}, props)

  return propsToIgnore.reduce((acc, ignoredProp) => {
    delete acc[ignoredProp]
    return acc
  }, copied)
}

export function createConnectorState(connectorName, isRunning, isEnabled) {
  if (isRunning && isEnabled) return CONNECTOR_STATE.RUNNING
  else if (!isRunning && isEnabled) return CONNECTOR_STATE.WAITING
  else if (!isRunning && !isEnabled) return CONNECTOR_STATE.STOPPED
  else throw new Error(`Invalid connector ${connectorName} state isRunning: ${isRunning}, isEnabled: ${isEnabled}`)
}

export const EMPTY_CONNECTOR = undefined
export function isEmptyConnector(connector) {
  return connector === void 0
}

export function createClientConnector(storageConnector, containerConnectorNames) {
  try {
    const connectorName = storageConnector[CONNECTOR_PROPERTY.name]
    const isRunning = (containerConnectorNames.includes(connectorName))
    const isEnabled = getStorageEnabled(storageConnector)

    // TODO comparison config between storage connector and container connector using `deep-equal`

    const state = createConnectorState(name, isRunning, isEnabled)
    const tags = getStorageTags(storageConnector)
    const config = getConnectorConfig(storageConnector)

    return Object.assign({}, INITIAL_CONNECTOR_ITEM_STATE, {
      [CONNECTOR_PROPERTY.name]: connectorName,
      [CONNECTOR_PROPERTY.state]: state,
      [CONNECTOR_PROPERTY.tags]: tags,
      [CONNECTOR_PROPERTY.config]: config,
    })
  } catch (error) {
    Logger.error(`Failed to create connector due to ${error.message}}`)

    return EMPTY_CONNECTOR
  }
}

export function createClientConnectors(storageConnectors, containerConnectorNames) {
  return storageConnectors.map(storageConnector => {
    return createClientConnector(storageConnector, containerConnectorNames)
  }).filter(connector => !isEmptyConnector(connector))
}

