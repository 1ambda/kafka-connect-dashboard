import {
  INITIAL_ITEM_STATE as INITIAL_CONNECTOR_ITEM_STATE,
  ItemProperty as CONNECTOR_PROPERTY,
  State as CONNECTOR_STATE,
  isRunning, isWaiting, isStopped,
  EMPTY_CONNECTOR, isEmptyConnector,
} from '../reducers/ConnectorReducer/ItemState'

import * as Logger from '../util/logger'

export const STORAGE_PROPERTY = {
  META: '_meta',
  ENABLED: 'enabled',
  RUNNING: 'running',
  TAGS: 'tags',
}


export function getStorageMeta(storageConnector) {
  return storageConnector[STORAGE_PROPERTY.META]
}

export function getStorageEnabled(storageConnector) {
  return getStorageMeta(storageConnector)[STORAGE_PROPERTY.ENABLED]
}

export function getStorageRunning(storageConnector) {
  return getStorageMeta(storageConnector)[STORAGE_PROPERTY.RUNNING]
}

export function getStorageTags(storageConnector) {
  return getStorageMeta(storageConnector)[STORAGE_PROPERTY.TAGS]
}

export function getConnectorConfig(connector) {
  return connector[CONNECTOR_PROPERTY.config]
}

export function getInitialStorageMeta() {
  return {
    [STORAGE_PROPERTY.META]: {
      [STORAGE_PROPERTY.TAGS]: [],
      [STORAGE_PROPERTY.RUNNING]: false,
      [STORAGE_PROPERTY.ENABLED]: true,
    },
  }
}

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

export function createClientConnector(storageConnector) {
  try {
    const connectorName = storageConnector[CONNECTOR_PROPERTY.name]
    const isRunning = getStorageRunning(storageConnector)
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

export function createStorageMetaFromClientConnector(connector) {
  let running = false
  let enabled = false

  const tags = connector[CONNECTOR_PROPERTY.tags]

  if (isRunning(connector)) {
    enabled = true; running = true
  } else if (isWaiting(connector)) {
    enabled = true; running = false
  } else if (isStopped(connector)) {
    enabled = false; running = false
  }

  return Object.assign({}, connector[STORAGE_PROPERTY.META], {
    [STORAGE_PROPERTY.ENABLED]: enabled,
    [STORAGE_PROPERTY.RUNNING]: running,
    [STORAGE_PROPERTY.TAGS]: tags,
  })
}

export function createStorageMetaToStart(connector) {
  return createStorageMetaFromClientConnector(Object.assign({}, connector, {
    [CONNECTOR_PROPERTY.state]: CONNECTOR_STATE.RUNNING,
  }))
}

export function createStorageMetaToStop(connector) {
  return createStorageMetaFromClientConnector(Object.assign({}, connector, {
    [CONNECTOR_PROPERTY.state]: CONNECTOR_STATE.WAITING,
  }))
}

export function createStorageMetaToEnable(connector) {
  return createStorageMetaToStop(connector)
}

export function createStorageMetaToDisable(connector) {
  return createStorageMetaFromClientConnector(Object.assign({}, connector, {
    [CONNECTOR_PROPERTY.state]: CONNECTOR_STATE.STOPPED,
  }))
}

export function createClientConnectors(storageConnectors) {
  return storageConnectors.map(storageConnector => {
    return createClientConnector(storageConnector)
  }).filter(connector => !isEmptyConnector(connector))
}

