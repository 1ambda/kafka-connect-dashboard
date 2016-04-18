import fetch from 'isomorphic-fetch'
import { take, put, call, fork, select, } from 'redux-saga/effects'

import URL from './url'
import * as Converter from './converter'
import { ItemProperty as ConnectorProperty, } from '../reducers/ConnectorReducer/ItemState'
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
      if ((method === HTTP_METHOD.POST && response.status !== 201) /** if post, status should === 201 */
        || (method !== HTTP_METHOD.POST && response.status !== 200)) /** otherwise, status === 200 */
        throw new Error(`${method} ${url}, status: ${response.status}`)
      else return response.json()
    })
}

function getJSONs(urls) {
  const promises = urls.map(url => {
    return getJSON(url)
      .catch(error => {
        console.error(`Failed to fetch ${url}. ${error.message}`) // eslint-disable-line no-console
        return [] /** return an empty array */
      })
  })
  return Promise.all(promises) /** return nested arrays */
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

export function* fetchAll() {
  const storageConnectorsUrl = URL.getStorageConnectorUrl()
  const storageConnectors = yield call(getJSON, storageConnectorsUrl)

  if (!Array.isArray(storageConnectors))
    throw new Error(`GET ${storageConnectorsUrl} didn't return an array, got ${storageConnectors}`)

  const containerConnectorNames = yield call(fetchContainerConnectorNames)

  return Converter.createClientConnectors(storageConnectors, containerConnectorNames)
}

export function* fetchContainerConnectorNames() {
  const containerName = yield select(Selector.getSelectedContainer)
  const containerConnectorsUrl = URL.getContainerConnectorUrl(containerName)
  const containerConnectorNames = yield call(getJSON, containerConnectorsUrl)

  if (!Array.isArray(containerConnectorNames))
    throw new Error(`GET LIST ${containerConnectorsUrl} didn't return an array, got ${containerName}`)

  return containerConnectorNames
}

export function* fetchConnector(connectorName) {
  const containerConnectorNames = yield call(fetchContainerConnectorNames)
  const storageConnector = yield call(fetchStorageConnector, connectorName)

  return Converter.createClientConnector(storageConnector, containerConnectorNames)
}

export function* fetchStorageConnector(connectorName) {
  const storageConnectorUrl = URL.getStorageConnectorUrl(connectorName)

  const storageConnector = yield call(getJSON, storageConnectorUrl)

  return storageConnector
}

export function* patchStorageConnectorMeta(connectorName, partialStorageMeta) {
  const storageConnectorUrl = URL.getStorageConnectorUrl(connectorName)

  yield call(patchJSON, storageConnectorUrl, partialStorageMeta)

  yield call(fetchStorageConnector, connectorName)
  const updated = yield call(fetchConnector, connectorName)

  return updated
}


