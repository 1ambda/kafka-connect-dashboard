import fetch from 'isomorphic-fetch'
import { take, put, call, fork, select, } from 'redux-saga/effects'

import URL from './Url'
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
        error = new Error(`${method} ${url}, status: ${response.status}`)

      return response.text().then(text => {
        return { error, text, }
      })
    })
    .then(parsed => {
      const { error, text, } = parsed
      if (error) throw new Error(`${error.message}, body: ${text}`)

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

export function* putConnectorConfig(connectorName, config) {
  const storageName = yield select(Selector.getSelectedStorage)
  const connectorConfigUrl = URL.getConnectorConfigUrl(storageName, connectorName)
  
  yield call(putJSON, connectorConfigUrl, config)
}

export function* postConnector(connector) {
  const storageName = yield select(Selector.getSelectedStorage)
  const connectorsUrl = URL.getConnectorsUrl(storageName)

  return yield call(postJSON, connectorsUrl, connector)
}

export function* deleteConnector(connectorName) {
  const storageName = yield select(Selector.getSelectedStorage)
  const connectorsUrl = URL.getConnectorUrl(storageName, connectorName)

  yield call(deleteJSON, connectorsUrl)
}


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

export function* postConnectorCommand(connectorName, command) {
  const storageName = yield select(Selector.getSelectedStorage)
  const connectorCommandUrl = URL.getConnectorCommandUrl(storageName, connectorName)
  
  return yield call(postJSON, connectorCommandUrl, command)
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
