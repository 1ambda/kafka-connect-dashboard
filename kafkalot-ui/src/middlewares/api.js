import Fetch from 'isomorphic-fetch'
import { take, put, call, fork, select, } from 'redux-saga/effects'

import * as Converter from './converter'
import URL from './url'

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

  return handleJsonResponse(url, method, Fetch(url, {
    method,
    credentials: 'include',
    headers: HTTP_HEADERS_JSON,
  }))
}

function postJSON(url, body) {
  const method = HTTP_METHOD.POST

  return handleJsonResponse(url, method, Fetch(url, {
    method,
    credentials: 'include',
    headers: HTTP_HEADERS_JSON,
    body: JSON.stringify(body),
  }))
}

function patchJSON(url, body) {
  const method = HTTP_METHOD.PATCH

  return handleJsonResponse(url, method, Fetch(url, {
    method,
    credentials: 'include',
    headers: HTTP_HEADERS_JSON,
    body: JSON.stringify(body),
  }))
}

function putJSON(url, body) {
  const method = HTTP_METHOD.PUT

  return handleJsonResponse(url, method, Fetch(url, {
    method,
    credentials: 'include',
    headers: HTTP_HEADERS_JSON,
    body: JSON.stringify(body),
  }))
}

function deleteJSON(url) {
  const method = HTTP_METHOD.DELETE

  return handleJsonResponse(url, method, Fetch(url, {
    method,
    credentials: 'include',
    headers: HTTP_HEADERS_JSON,
  }))
}

/** job related functions */

export function delay(millis) {
  return new Promise(resolve => setTimeout(() => { resolve() }, millis))
}

/**
 * high level API (business related)
 *
 * exception will be caught in watcher functions
 */

export function* fetchAll(containerName) {
  const connectorsUrl = URL.getContainerConnectorUrl(containerName)
  const connectorNames = yield call(getJSON, connectorsUrl)

  if (!Array.isArray(connectorNames))
    throw new Error(`GET ${connectorsUrl} didn't return an array, got ${connectorNames}`)

  const connectorUrls = connectorNames.map(connectorName => {
    return URL.getContainerConnectorUrl(containerName, connectorName)
  })

  const connectors = yield call(getJSONs, connectorUrls)

  if (!Array.isArray(connectors))
    throw new Error(`GET LIST ${connectorUrls} didn't return an array, got ${connectors}`)

  return connectors
}

export function* fetch(containerName, connectorName) {
  const url = URL.getContainerConnectorUrl(containerName, connectorName)

  const serverJob = yield call(getJSON, url)
  return Converter.convertServerJobToClientJob(serverJob)
}

export function* create(containerName, job) {
  const url = URL.getContainerConnectorUrl(containerName)
  yield call(postJSON, url, Converter.removeClientProps(job)) /** return nothing */
}

export function* remove(containerName, connectorName) {
  const url = URL.getContainerConnectorUrl(containerName, connectorName)
  yield call(deleteJSON, url) /** return nothing */
}

export function* fetchConfig(container, connectorName) {
  const url = URL.getContainerConnectorConfigUrl(container, connectorName)

  const serverJob = yield call(getJSON, url)

  /** remove state fields */
  return Converter.removeStateProps(serverJob)
}

export function* updateConfig(containerName, connectorName, property) {
  const url = URL.getContainerConnectorConfigUrl(containerName, connectorName)

  /** replace whole job config */
  yield call(putJSON, url, Converter.removeStateProps(property))

  /** since `patch` doesn't return job state, we need to fetch job */
  return yield call(fetch, containerName, connectorName)
}

export function* patchConfig(containerName, connectorName, property) {
  const url = URL.getContainerConnectorConfigUrl(containerName, connectorName)

  yield call(patchJSON, url, Converter.removeStateProps(property))

  /** since `patch` doesn't return job state, we need to fetch job */
  return yield call(fetch, containerName, connectorName)
}

export function* setReadonly(containerName, connectorName) {
  return yield call(patchConfig, containerName, connectorName, Converter.createConfigToSetReadonly())
}

export function* unsetReadonly(containerName, connectorName) {
  return yield call(patchConfig, containerName, connectorName, Converter.createConfigToUnsetReadonly())
}

export function* patchState(containerName, connectorName, state) {
  const url = URL.getContainerConnectorStateUrl(containerName, connectorName)

  yield call(patchJSON, url, state)
}

export function* start(containerName, connectorName) {
  yield call(patchState, containerName, connectorName, Converter.createStateToStartJob())

  /** since `patch` METHOD doesn't return all job props (state + config), we need to fetch job */
  return yield call(fetch, containerName, connectorName)
}

export function* stop(containerName, connectorName) {
  yield call(patchState, containerName, connectorName, Converter.createStateToStopJob())

  /** since `patch` METHOD doesn't return all job props (state + config), we need to fetch job */
  return yield call(fetch, containerName, connectorName)
}



