import { CONTAINERS, STORAGE, } from '../constants/config'

export const URL_BASE = 'connectors'
export const URL_PROPERTY_TASKS = 'tasks'
export const URL_PROPERTY_STATE = 'state'
export const URL_PROPERTY_CONFIG = 'config'

export const CONTAINER_PROPERTY = { name: 'name', address: 'address', }

/** multi container support */
export const CONTAINER_NAMES = CONTAINERS.map(container => container[CONTAINER_PROPERTY.name])
export const INITIAL_CONTAINER_NAME = CONTAINER_NAMES[0]

/** internal functions (tested) */

export function _getContainerAddress(containers, name) {
  const filtered = containers.filter(container => container[CONTAINER_PROPERTY.name] === name)

  if (filtered.length >= 2) throw new Error(`CONTAINERS has duplicated ${name}`)
  if (filtered.length === 0) throw new Error(`Can't find address using container name: ${name}`)

  return filtered[0].address
}

/** connectorName might be undefined to retrieve all connectors */
export function _buildStorageConnnectorUrl(storage, connectorName) {
  const postfix = (connectorName === void 0) ? '' : `/${connectorName}`

  return `${storage}/${URL_BASE}${postfix}`
}

export function _buildContainerConnectorPropertyUrl(containers, containerName, connectorName, property) {
  if (connectorName === void 0 || connectorName === null || connectorName === '')
    throw new Error(`Can't get container connector url. name is ${connectorName}`)

  if (property === void 0 || property === null || property === '')
    throw new Error(`Can't get container connector url. property is ${property}`)

  if (containerName === void 0 || containerName === null || containerName === '')
    throw new Error(`Can't get container connector ${property} url. container' is ${containerName}`)

  const containerAddress = _getContainerAddress(containers, containerName)

  if (containerAddress === void 0 || containerAddress === null || containerAddress === '')
    throw new Error(`Can\'t get container address, CONTAINER_NAME_TO_ADDRESS[${containerName}] is undefined`)

  return `${containerAddress}/${URL_BASE}/${connectorName}/${property}`
}

export function buildContainerConnectorPropertyUrl(containerName, connectorName, property) {
  return _buildContainerConnectorPropertyUrl(CONTAINERS, containerName, connectorName, property)
}

export function _buildContainerConnectorUrl(containers, containerName, connectorName) {

  const postfix = (connectorName === void 0) ? '' : `/${connectorName}`

  const containerAddress = _getContainerAddress(containers, containerName)

  return `${containerAddress}/${URL_BASE}${postfix}`
}

/** exposed functions, use ENV variables (injected by webpack) */

export default {
  getContainerConnectorStateUrl: (containerName, connectorName) => {
    return buildContainerConnectorPropertyUrl(containerName, connectorName, URL_PROPERTY_STATE)
  },

  getContainerConnectorConfigUrl: (containerName, connectorName) => {
    return buildContainerConnectorPropertyUrl(containerName, connectorName, URL_PROPERTY_CONFIG)
  },

  getContainerConnectorUrl: (containerName, connectorName) => {
    return _buildContainerConnectorUrl(CONTAINERS, containerName, connectorName)
  },

  getStorageConnectorUrl: (connectorName) => {
    return _buildStorageConnnectorUrl(STORAGE, connectorName)
  },
}



