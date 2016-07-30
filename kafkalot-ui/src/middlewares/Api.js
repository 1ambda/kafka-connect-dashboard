import fetch from 'isomorphic-fetch'
import { take, put, call, fork, select, } from 'redux-saga/effects'

import URL from './Url'
import { Code as ErrorCode, } from '../constants/Error'
import * as Logger from '../util/Logger'
import * as Selector from '../reducers/ConnectorReducer/Selector'

/**
 * low-level APIs
 *
 * doesn't handle exceptions
 */

const HTTP_METHOD = {
  GET: 'GET',       /** get */
  POST: 'POST',     /** create */
  PATCH: 'PATCH',   /** partial update */
  PUT: 'PUT',       /** replace */
  DELETE: 'DELETE', /** remove */
}

const HTTP_HEADERS_JSON = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
}

function handleJsonResponse(url, method, promise) {
  return promise
    .then(response => {
      let error = undefined
      if (response.status >= 300)
        error = true

      return response.text().then(text => {
        return { url, method, status: response.status, text, error, }
      })
    })
    .then(({ url, method, status, text, error, }) => {
      if (error) throw new Error(text)

      return JSON.parse(text)
    })
}

function getJSON(url) {
  const method = HTTP_METHOD.GET

  return handleJsonResponse(url, method, fetch(url, {
    method,
    credentials: 'include',
    headers: HTTP_HEADERS_JSON,
  }))
}

function postJSON(url, body) {
  const method = HTTP_METHOD.POST

  return handleJsonResponse(url, method, fetch(url, {
    method,
    credentials: 'include',
    headers: HTTP_HEADERS_JSON,
    body: JSON.stringify(body),
  }))
}

function patchJSON(url, body) {
  const method = HTTP_METHOD.PATCH

  return handleJsonResponse(url, method, fetch(url, {
    method,
    credentials: 'include',
    headers: HTTP_HEADERS_JSON,
    body: JSON.stringify(body),
  }))
}

function putJSON(url, body) {
  const method = HTTP_METHOD.PUT

  return handleJsonResponse(url, method, fetch(url, {
    method,
    credentials: 'include',
    headers: HTTP_HEADERS_JSON,
    body: JSON.stringify(body),
  }))
}

function deleteJSON(url) {
  const method = HTTP_METHOD.DELETE

  return handleJsonResponse(url, method, fetch(url, {
    method,
    credentials: 'include',
    headers: HTTP_HEADERS_JSON,
  }))
}

export function delay(millis) {
  return new Promise(resolve => setTimeout(() => { resolve() }, millis))
}

/**
 * high level API (business related)
 *
 * exception will be caught in watcher functions
 */

export function* fetchAllConnectorNames(storageName) {
  const connectorsUrl = URL.getConnectorsUrl(storageName)
  const connectorNames = yield call(getJSON, connectorsUrl)

  if (!Array.isArray(connectorNames))
    throw new Error(`GET ${connectorsUrl} didn't return an array, got ${connectorNames}`)

  return connectorNames 
}

export function* getConnector(connectorName) {
  const storageName = yield select(Selector.getSelectedStorage)
  const connectorUrl = URL.getConnectorUrl(storageName, connectorName)

  const connector = yield call(getJSON, connectorUrl)
  return connector 
}

export function* getConnectorTasks(connectorName) {
  const storageName = yield select(Selector.getSelectedStorage)
  const url = URL.getConnectorTaskUrl(storageName, connectorName)

  const tasks = yield call(getJSON, url)

  if (!tasks && !Array.isArray(tasks)) {
    Logger.error(`Invalid tasks returned from ${url}`)
    throw new Error(ErrorCode.INVALID_TASKS)
  }

  return tasks
}

export function* putConnectorConfig(connectorName, config) {
  const storageName = yield select(Selector.getSelectedStorage)
  const connectorConfigUrl = URL.getConnectorConfigUrl(storageName, connectorName)
  
  yield call(putJSON, connectorConfigUrl, config)
}

export function* postConnector(config, name) {
  const storageName = yield select(Selector.getSelectedStorage)
  const connectorsUrl = URL.getConnectorsUrl(storageName)

  const connector = { name, config, } // TODO: assembly in server

  return yield call(postJSON, connectorsUrl, connector)
}

export function* deleteConnector(connectorName) {
  const storageName = yield select(Selector.getSelectedStorage)
  const connectorsUrl = URL.getConnectorUrl(storageName, connectorName)

  yield call(deleteJSON, connectorsUrl)
}


/** command related */

export const KEY_OPERATION = 'operation'
export const CONNECTOR_COMMAND = {
  START: { [KEY_OPERATION]: 'start', },
  STOP: { [KEY_OPERATION]: 'stop', },
  RESTART: { [KEY_OPERATION]: 'restart', },
  PAUSE: { [KEY_OPERATION]: 'pause', },
  RESUME: { [KEY_OPERATION]: 'resume', },
  ENABLE: { [KEY_OPERATION]: 'enable', },
  DISABLE: { [KEY_OPERATION]: 'disable', },
}

export const CONNECTOR_TASK_COMMAND = {
  RESTART: { [KEY_OPERATION]: 'restart', },
}

export function* postConnectorCommand(connectorName, command) {
  const storageName = yield select(Selector.getSelectedStorage)
  const url = URL.getConnectorCommandUrl(storageName, connectorName)
  
  return yield call(postJSON, url, command)
}

export function* postConnectorTaskCommand(connectorName, taskId, command) {
  const storageName = yield select(Selector.getSelectedStorage)
  const url = URL.getConnectorTaskCommandUrl(storageName, connectorName, taskId)

  return yield call(postJSON, url, command)
}

export function* disableConnector(connectorName) {
  return yield call(postConnectorCommand, connectorName, CONNECTOR_COMMAND.DISABLE)
}

export function* enableConnector(connectorName) {
  return yield call(postConnectorCommand, connectorName, CONNECTOR_COMMAND.ENABLE)
}

export function* startConnector(connectorName) {
  return yield call(postConnectorCommand, connectorName, CONNECTOR_COMMAND.START)
}

export function* stopConnector(connectorName) {
  return yield call(postConnectorCommand, connectorName, CONNECTOR_COMMAND.STOP)
}

export function* restartConnector(connectorName) {
  return yield call(postConnectorCommand, connectorName, CONNECTOR_COMMAND.RESTART)
}

export function* pauseConnector(connectorName) {
  return yield call(postConnectorCommand, connectorName, CONNECTOR_COMMAND.PAUSE)
}

export function* resumeConnector(connectorName) {
  return yield call(postConnectorCommand, connectorName, CONNECTOR_COMMAND.RESUME)
}

export function* restartConnectorTask(connectorName, taskId) {
  return yield call(postConnectorTaskCommand, connectorName, taskId, CONNECTOR_TASK_COMMAND.RESTART)
}

/** connector plugins related */

export function* getConnectorPlugins() {
  const storageName = yield select(Selector.getSelectedStorage)
  const url = URL.getConnectorPluginsUrl(storageName)

  const connectorPlugins = yield call(getJSON, url)

  // TODO return class name only in STORAGE
  return connectorPlugins.map(connectorPlugin => connectorPlugin.class)
}

export function* getConnectorPluginsConfigSchema(connectorClass) {
  let schema = undefined

  const storageName = yield select(Selector.getSelectedStorage)
  const url = URL.getConnectorPluginsSchemaUrl(storageName, connectorClass)

  try {
    /** get available connector plugins */
    schema = yield call(getJSON, url)
  } catch (error) {
    Logger.warn(`${ErrorCode.CANNOT_FIND_CONNECTOR_PLUGINS} (${connectorClass})`)
    return undefined
  }

  return schema
}

export function* validateConnectorConfig(connectorClass, connectorConfig) {
  let errorMessages = []

  const storageName = yield select(Selector.getSelectedStorage)
  const url = URL.getConnectorPluginsValidateUrl(storageName, connectorClass)

  try {
    /** put connector config and get validation result */
    const validationResult = yield call(putJSON, url, connectorConfig)

    if (validationResult.error_messages && Array.isArray(validationResult.error_messages))
      errorMessages = validationResult.error_messages

  } catch (error) {
    Logger.warn(`${ErrorCode.CANNOT_FIND_CONNECTOR_PLUGINS} (${connectorClass})`)
    return undefined
  }

  return errorMessages
}
