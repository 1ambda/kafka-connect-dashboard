import fetch from 'isomorphic-fetch'
import { take, put, call, fork, select, } from 'redux-saga/effects'

import URL from './url'
import * as Converter from './converter'
import * as Selector from '../reducers/ConnectorReducer/selector'

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

export function* fetchAll(storageName) {
  const storageConnectorsUrl = URL.getConnectorsUrl(storageName)
  const storageConnectors = yield call(getJSON, storageConnectorsUrl)

  if (!Array.isArray(storageConnectors))
    throw new Error(`GET ${storageConnectorsUrl} didn't return an array, got ${storageConnectors}`)

  return Converter.createClientConnectors(storageConnectors)
}

export function* getStorageConnector(connectorName) {
  const storageName = yield select(Selector.getSelectedStorage)
  const connectorUrl = URL.getConnectorUrl(storageName, connectorName)

  /** do not convert */
  const storageConnector = yield call(getJSON, connectorUrl)

  return storageConnector
}

export function* getConnector(connectorName) {
  const storageConnector = yield call(getStorageConnector, connectorName)
  return Converter.createClientConnector(storageConnector)
}


export function* postConnector(connector) {
  const storageName = yield select(Selector.getSelectedStorage)
  const connectorsUrl = URL.getConnectorsUrl(storageName)

  yield call(postJSON, connectorsUrl, connector)
}

export function* deleteConnector(connectorName) {
  const storageName = yield select(Selector.getSelectedStorage)
  const connectorsUrl = URL.getConnectorUrl(storageName, connectorName)

  yield call(deleteJSON, connectorsUrl)
}

export function* postConnectorCommand(connectorName, command) {
  const storageName = yield select(Selector.getSelectedStorage)
  const connectorCommandUrl = URL.getConnectorCommandUrl(storageName, connectorName)
  const updated = yield call(postJSON, connectorCommandUrl, command)

  return Converter.createClientConnector(updated)
}

export function* putConnectorMeta(connectorName, meta) {
  const storageName = yield select(Selector.getSelectedStorage)
  const connectorUrl = URL.getConnectorMetaUrl(storageName, connectorName)

  const updated = yield call(putJSON, connectorUrl, meta)

  return Converter.createClientConnector(updated)
}

