import { take, put, call, select, } from 'redux-saga/effects'

import {
  Action as ConnectorAction,
  PrivateAction as ConnectorPrivateAction,
  Payload as ConnectorPayload,
  ConnectorProperty, ConnectorTaskProperty,
  isRunningConnector, isFailedConnector, isPausedConnector,
  isRegisteredConnector, isDisabledConnector,
  isEmptyName,
} from '../reducers/ConnectorReducer/ConnectorListState'

import {
  PrivateAction as ConfigSchemaPrivateAction,
  Payload as ConfigSchemaPayload,
} from '../reducers/ConnectorReducer/ConfigSchemaState'

import {
  Action as CreateEditorAction,
  PrivateAction as CreateEditorPrivateAction,
  Payload as CreateEditorPayload,
} from '../reducers/ConnectorReducer/CreateEditorState'

import {
  Action as ConfigEditorAction,
  PrivateAction as ConfigEditorPrivateAction,
  Payload as ConfigEditorPayload,
} from '../reducers/ConnectorReducer/ConfigEditorState'

import {
  Action as RemoveDialogAction,
  PrivateAction as RemoveDialogPrivateAction,
  Property as RemoveDialogProperty,
} from '../reducers/ConnectorReducer/RemoveDialogState'

import {
  Action as SnackbarAction, 
  Payload as SnackbarPayload,
} from '../reducers/ConnectorReducer/ClosableSnackbarState'


import { Code as ErrorCode, } from '../constants/Error'
import * as SchemaUtil from '../util/SchemaUtil'
import * as Logger from '../util/Logger'
import * as API from './Api'
import * as Selector from '../reducers/ConnectorReducer/Selector'

/**
 * handlers that catch exceptions and validate conditions. (used in watcher functions)
 */

export function* initialize() {
  try {
    const storageName = yield select(Selector.getSelectedStorage)
    const connectorNames = yield call(API.fetchAllConnectorNames, storageName)

    const failedConnectorNames = []

    /** fetch connectors while handling errors caused from each connector */
    for(let i = 0; i < connectorNames.length; i++) {
      const name = connectorNames[i]
      
      try {
        const connector = yield call(API.getConnector, name)
        yield put(ConnectorPrivateAction.addFetchedConnector({ ...connector, }))
      } catch(error) {
        failedConnectorNames.push(connectorNames[i])
      }
    }

    /** sort */
    const sorter = yield select(Selector.getCurrentSorter)
    yield put(ConnectorAction.changeSorter({ [ConnectorPayload.SORTER]: sorter, }))

    /** logging failed connectors */
    if (failedConnectorNames.length !== 0)
      throw new Error(`${ErrorCode.CANNOT_FETCH_ALL_CONNECTORS} (${failedConnectorNames.join(', ')})`)

  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
        [SnackbarPayload.MESSAGE]: 'Failed to fetch all connectors',
        [SnackbarPayload.ERROR]: error,
    }))
  }
}

export function* updateConnector(name) {
  if (isEmptyName(name)) throw new Error(ErrorCode.EMPTY_NAME)

  const connector = yield call(API.getConnector, name)
  yield put(ConnectorPrivateAction.setConnector({
    ...connector,
  }))
}

export function* handleFetchConnector(action) {
  const { payload, } = action

  let name = null

  try {
    name = payload[ConnectorProperty.NAME]
    yield call(updateConnector, name)
  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
      [SnackbarPayload.MESSAGE]: `Failed to fetch '${name}'`,
      [SnackbarPayload.ERROR]: error,
    }))
  }
}

export function* handleOpenConfigEditor(action) {
  const { payload, } = action

  let name = null

  try {
    name = payload[ConfigEditorPayload.NAME]

    /** update */
    yield call(updateConnector, name)
    const updated = yield select(Selector.findConnector, name)

    const connectorClass = SchemaUtil.extractConnectorClassFromConfig(name, updated[ConnectorProperty.CONFIG])
    const connectorSchema = yield call(API.getConnectorPluginsConfigSchema, connectorClass)

    let readonly = true

    if (isRegisteredConnector(updated)) readonly = false

    /** open config editor */
    yield put(ConfigEditorPrivateAction.succeededToOpenConfigEditor({
      [ConfigEditorPayload.NAME]: name,
      [ConfigEditorPayload.READONLY]: readonly,
      [ConfigEditorPayload.CONFIG]: updated[ConnectorProperty.CONFIG],
    }))

    /** set initial schema */
    yield put(ConfigSchemaPrivateAction.succeededToSetConfigSchemaOnly({
      [ConfigSchemaPayload.CONFIG_SCHEMA]: connectorSchema,
    }))

  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
        [SnackbarPayload.MESSAGE]: `Failed to fetch config '${name}'`,
        [SnackbarPayload.ERROR]: error,
    }))
  }
}

export function* handleOpenCreateEditor(action) {
  const { payload, } = action

  try {

    /** get available connectors */
    const availableConnectors = yield call(API.getConnectorPlugins)

    /** open create editor */
    yield put(CreateEditorPrivateAction.succeedToOpenCreateEditor({
      [CreateEditorPayload.AVAILABLE_CONNECTORS]: availableConnectors,
    }))

    /** set initial schema */
    yield put(ConfigSchemaPrivateAction.succeededToSetConfigSchemaOnly({
      [ConfigSchemaPayload.CONFIG_SCHEMA]: SchemaUtil.defaultConnectorConfigSchema,
    }))

  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
      [SnackbarPayload.MESSAGE]: `Failed to open CreateEditor '${name}'`,
      [SnackbarPayload.ERROR]: error,
    }))
  }
}

export function* handleChangeSelectedConnectorClass(action) {
  const { payload, } = action
  let connectorClass = undefined

  try {
    connectorClass = payload[CreateEditorPayload.SELECTED_CONNECTOR_CLASS]

    const connectorSchema = yield call(API.getConnectorPluginsConfigSchema, connectorClass)

    yield put(CreateEditorPrivateAction.succeedToChangeSelectedConnectorClass({
      [CreateEditorPayload.SELECTED_CONNECTOR_CLASS]: connectorClass,
    }))

    /** set configSchema */
    yield put(ConfigSchemaPrivateAction.succeededToSetConfigSchemaOnly({
      [ConfigSchemaPayload.CONFIG_SCHEMA]: connectorSchema,
    }))

  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
      [SnackbarPayload.MESSAGE]: `Failed to change selected connector class '${connectorClass}'`,
      [SnackbarPayload.ERROR]: error,
    }))
  }
}

export function* handleValidateConnectorConfig(action) {
  const { payload, } = action
  let connectorClass = undefined

  try {
    connectorClass = payload[ConfigSchemaPayload.CONNECTOR_CLASS]
    const connectorConfig = payload[ConfigSchemaPayload.CONNECTOR_CONFIG]
    let connectorSchema = yield call(API.getConnectorPluginsConfigSchema, connectorClass)
    let errorMessages = yield call(API.validateConnectorConfig, connectorClass, connectorConfig)

    if (errorMessages.length > 0) {
      errorMessages.map(message => Logger.warn(`SCHEMA ERROR: ${message} (${connectorClass})`) )
    }

    /** set configSchema and errorMessages */
    yield put(ConfigSchemaPrivateAction.succeededToValidateConfig({
      [ConfigSchemaPayload.CONFIG_SCHEMA]: connectorSchema,
      [ConfigSchemaPayload.ERROR_MESSAGES]: errorMessages,
    }))

    /** change connectorClass in createEditor */
    yield put(CreateEditorPrivateAction.succeedToChangeSelectedConnectorClass({
      [CreateEditorPayload.SELECTED_CONNECTOR_CLASS]: connectorClass,
    }))

  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
      [SnackbarPayload.MESSAGE]: `
    }Failed to validate config for '${connectorClass}'`,
      [SnackbarPayload.ERROR]: error,
    }))
  }
}

export function* handleOpenRemoveDialog() {
  try {
    const checkedConnectors = yield select(Selector.getCheckedConnectors)
    if (checkedConnectors.length === 0) throw new Error(ErrorCode.NO_SELECTED_CONNECTORS)

    const invalidConnectorNames = []

    const registeredConnectorNames = []

    checkedConnectors.map(c => {
      const name = c[ConnectorProperty.NAME]

      /** validate whether all connectors are in registered state or not */
      if (!isRegisteredConnector(c)) invalidConnectorNames.push(name)
      else registeredConnectorNames.push(name)
    })

    /** logging failed connectors */
    if (invalidConnectorNames.length !== 0) {
      throw new Error(`${ErrorCode.CANNOT_REMOVE_ALL_SELECTED_CONNECTORS} (${invalidConnectorNames.join(', ')})`)
    }

    yield put(RemoveDialogPrivateAction.succeededToOpenRemoveDialog({
      [RemoveDialogProperty.CONNECTOR_NAMES]: registeredConnectorNames,
    }))

  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
      [SnackbarPayload.MESSAGE]: 'Failed to open RemoveDialog',
      [SnackbarPayload.ERROR]: error,
    }))
  }
}

export function* handleUpdateConfig(action) {
  const { payload, } = action

  let name = null

  try {
    name = payload[ConnectorProperty.NAME]

    yield call(updateConnector, name)
    const updated = yield select(Selector.findConnector, name)

    if (!isRegisteredConnector(updated))
      throw new Error(ErrorCode.CANNOT_UPDATE_NON_REGISTERED_CONNECTOR)

    const config = payload[ConnectorProperty.CONFIG]
    yield call(API.putConnectorConfig, name, config)

    yield put(ConfigEditorAction.closeConfigEditor())

    yield put(SnackbarAction.openInfoSnackbar({
      [SnackbarPayload.MESSAGE]: `'${name}' was updated`,
    }))

  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
      [SnackbarPayload.MESSAGE]: `Failed to fetchConfig '${name}'`,
      [SnackbarPayload.ERROR]: error,
    }))
  }
}

export function* handleCreateConnector(action) {
  const { payload, } = action

  let config = null
  let name = null

  try {
    name = payload[CreateEditorPayload.CONNECTOR_NAME]
    config = payload[CreateEditorPayload.CONNECTOR_CONFIG]

    if (isEmptyName(name)) throw new Error(ErrorCode.EMPTY_NAME)

    const existing = yield select(Selector.findConnector, name)
    if (existing) throw new Error(ErrorCode.DUPLICATE_NAME)

    const created = yield call(API.postConnector, config, name)

    /** add to redux state */
    yield put(ConnectorPrivateAction.addCreatedConnector({
      [ConnectorPayload.CONNECTOR]: created,
    }))

    yield put(CreateEditorAction.closeCreateEditor())

    yield put(SnackbarAction.openInfoSnackbar({
      [SnackbarPayload.MESSAGE]: `'${name}' was created`,
    }))

  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
        [SnackbarPayload.MESSAGE]: 'Failed to create',
        [SnackbarPayload.ERROR]: error,
    }))
  }
}

export function* handleRemove(action) {
  const { payload, } = action
  
  try {
    const connectorNames = payload[RemoveDialogProperty.CONNECTOR_NAMES]
    const failedConnectorNames = []

    /** delete connectors while handling errors caused from each connector */
    for(let i = 0; i < connectorNames.length; i++) {
      const name = connectorNames[i]
      const existing = yield select(Selector.findConnector, name)

      try {
        if (!isRegisteredConnector(existing)) throw new Error(ErrorCode.CANNOT_REMOVE_CONNECTOR)
        yield call(API.deleteConnector, name)
        yield put(ConnectorPrivateAction.removeDeletedConnector({ [ConnectorProperty.NAME]: name, }))
      } catch (e) {
        failedConnectorNames.push(name)
      }
    }

    /** logging failed connectors */
    if (failedConnectorNames.length !== 0) {
      throw new Error(`${ErrorCode.CANNOT_REMOVE_ALL_SELECTED_CONNECTORS} (${failedConnectorNames.join(', ')})`)
    }

    /** close remove dialog */
    yield put(RemoveDialogAction.closeRemoveDialog())

    /** open info snackbar */
    const infoMessage = (connectorNames.length > 1) ? `${connectorNames.length} connectors were deleted` :
      `${connectorNames.length} connector was deleted`

    yield put(SnackbarAction.openInfoSnackbar({ [SnackbarPayload.MESSAGE]: infoMessage, }))

  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
        [SnackbarPayload.MESSAGE]: 'Failed to remove connectors',
        [SnackbarPayload.ERROR]: error,
    }))
  }
}

export function* handleDisableConnector(action) {
  const { payload, } = action

  let name = null

  try {
    name = payload[ConnectorProperty.NAME]
    if (isEmptyName(name)) throw new Error(ErrorCode.EMPTY_NAME)
    
    const existing = yield select(Selector.findConnector, name)
    if (!isRegisteredConnector(existing))
      throw new Error(`${ErrorCode.CONNECTOR_COMMAND_FAILED} (DISABLE)`)

    const disabled = yield call(API.disableConnector, name)
    yield put(ConnectorPrivateAction.setConnector({ ...disabled, }))

  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
        [SnackbarPayload.MESSAGE]: `Failed to disable '${name}'`,
        [SnackbarPayload.ERROR]: error,
    }))
  }
}

export function* handleEnableConnector(action) {
  const { payload, } = action

  let name = null

  try {
    name = payload[ConnectorProperty.NAME]
    if (isEmptyName(name)) throw new Error(ErrorCode.EMPTY_NAME)
    
    const existing = yield select(Selector.findConnector, name)
    if (!isDisabledConnector(existing))
      throw new Error(`${ErrorCode.CONNECTOR_COMMAND_FAILED} (ENABLE)`)

    const enabled = yield call(API.enableConnector, name)
    yield put(ConnectorPrivateAction.setConnector({ ...enabled, }))

  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
      [SnackbarPayload.MESSAGE]: `Failed to enable '${name}'`,
      [SnackbarPayload.ERROR]: error,
    }))
  }
}

export function* handleStartConnector() {

  try {
    const checkedConnectors = yield select(Selector.getCheckedConnectors)
    if (checkedConnectors.length === 0) throw new Error(ErrorCode.NO_SELECTED_CONNECTORS)
    
    const failedConnectorNames = []

    /** run connectors while handling errors caused from each connector */
    for(let i = 0; i < checkedConnectors.length; i++) {
      const c = checkedConnectors[i]
      const name = c[ConnectorProperty.NAME]

      try {
        if (!isRegisteredConnector(c)) throw new Error(ErrorCode.CONNECTOR_COMMAND_FAILED)
        const started = yield call(API.startConnector, name)
        yield put(ConnectorPrivateAction.setConnector({ ...started, }))
      } catch (e) {
        failedConnectorNames.push(name) 
      }
    }

    /** logging failed connectors */
    if (failedConnectorNames.length !== 0) {
      throw new Error(`${ErrorCode.CONNECTOR_COMMAND_FAILED} (START): ${failedConnectorNames.join(', ')}`)
    }

  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
      [SnackbarPayload.MESSAGE]: 'Failed to start connectors',
      [SnackbarPayload.ERROR]: error,
    }))
  }
}

export function* handleStopConnector() {
  try {
    const checkedConnectors = yield select(Selector.getCheckedConnectors)
    if (checkedConnectors.length === 0) throw new Error(ErrorCode.NO_SELECTED_CONNECTORS)

    const failedConnectorNames = []

    /** stop connectors while handling errors caused from each connector */
    for(let i = 0; i < checkedConnectors.length; i++) {
      const c = checkedConnectors[i]
      const name = c[ConnectorProperty.NAME]

      try {
        if (!isRunningConnector(c)) throw new Error(ErrorCode.CONNECTOR_COMMAND_FAILED)
        const stopped = yield call(API.stopConnector, name)
        yield put(ConnectorPrivateAction.setConnector({ ...stopped, }))
      } catch (e) {
        failedConnectorNames.push(name)
      }
    }

    /** logging failed connectors */
    if (failedConnectorNames.length !== 0) {
      throw new Error(`${ErrorCode.CONNECTOR_COMMAND_FAILED} (STOP): ${failedConnectorNames.join(', ')}`)
    }

  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
      [SnackbarPayload.MESSAGE]: 'Failed to stop connectors',
      [SnackbarPayload.ERROR]: error,
    }))
  }
}

export function* handleRestartConnector() {
  try {
    const checkedConnectors = yield select(Selector.getCheckedConnectors)
    if (checkedConnectors.length === 0) throw new Error(ErrorCode.NO_SELECTED_CONNECTORS)

    const failedConnectorNames = []

    /** restart connectors while handling errors caused from each connector */
    for(let i = 0; i < checkedConnectors.length; i++) {
      const c = checkedConnectors[i]
      const name = c[ConnectorProperty.NAME]

      try {
        if (!(isFailedConnector(c) || isRunningConnector(c))) throw new Error(ErrorCode.CONNECTOR_COMMAND_FAILED)
        const restarted = yield call(API.restartConnector, name)
        yield put(ConnectorPrivateAction.setConnector({ ...restarted, }))
      } catch (e) {
        failedConnectorNames.push(name)
      }
    }

    /** logging failed connectors */
    if (failedConnectorNames.length !== 0) {
      throw new Error(`${ErrorCode.CONNECTOR_COMMAND_FAILED} (RESTART): ${failedConnectorNames.join(', ')}`)
    }

  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
      [SnackbarPayload.MESSAGE]: 'Failed to restart connectors',
      [SnackbarPayload.ERROR]: error,
    }))
  }
}

export function* handleRestartConnectorTask(action) {
  const { payload, } = action

  let connectorName = undefined
  let taskId = undefined

  try {
    connectorName = payload[ConnectorProperty.NAME]
    taskId = payload[ConnectorTaskProperty.ID]

    yield call(API.restartConnectorTask, connectorName, taskId)
    const tasks = yield call(API.getConnectorTasks, connectorName)

    yield put(ConnectorPrivateAction.setConnectorTasks({
      [ConnectorProperty.TASKS]: tasks,
    }))

    yield put(SnackbarAction.openInfoSnackbar({
      [SnackbarPayload.MESSAGE]: `'${connectorName}/${taskId}' was restarted`,
    }))

  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
      [SnackbarPayload.MESSAGE]: `Failed to restart connector task (${connectorName}/${taskId})`,
      [SnackbarPayload.ERROR]: error,
    }))
  }
}

export function* handlePauseConnector() {
  try {
    const checkedConnectors = yield select(Selector.getCheckedConnectors)
    if (checkedConnectors.length === 0) throw new Error(ErrorCode.NO_SELECTED_CONNECTORS)

    const failedConnectorNames = []

    /** pause connectors while handling errors caused from each connector */
    for(let i = 0; i < checkedConnectors.length; i++) {
      const c = checkedConnectors[i]
      const name = c[ConnectorProperty.NAME]

      try {
        if (!isRunningConnector(c)) throw new Error(ErrorCode.CONNECTOR_COMMAND_FAILED)
        const paused = yield call(API.pauseConnector, name)
        yield put(ConnectorPrivateAction.setConnector({ ...paused, }))
      } catch (e) {
        failedConnectorNames.push(name)
      }
    }

    /** logging failed connectors */
    if (failedConnectorNames.length !== 0) {
      throw new Error(`${ErrorCode.CONNECTOR_COMMAND_FAILED} (PAUSE): ${failedConnectorNames.join(', ')}`)
    }

  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
      [SnackbarPayload.MESSAGE]: 'Failed to pause connectors',
      [SnackbarPayload.ERROR]: error,
    }))
  }
}

export function* handleResumeConnector() {
  try {
    const checkedConnectors = yield select(Selector.getCheckedConnectors)
    if (checkedConnectors.length === 0) throw new Error(ErrorCode.NO_SELECTED_CONNECTORS)

    const failedConnectorNames = []

    /** resume connectors while handling errors caused from each connector */
    for(let i = 0; i < checkedConnectors.length; i++) {
      const c = checkedConnectors[i]
      const name = c[ConnectorProperty.NAME]

      try {
        if (!isPausedConnector(c)) throw new Error(ErrorCode.CONNECTOR_COMMAND_FAILED)
        const resumed = yield call(API.resumeConnector, name)
        yield put(ConnectorPrivateAction.setConnector({ ...resumed, }))
      } catch (e) {
        failedConnectorNames.push(name)
      }
    }

    /** logging failed connectors */
    if (failedConnectorNames.length !== 0) {
      throw new Error(`${ErrorCode.CONNECTOR_COMMAND_FAILED} (RESUME): ${failedConnectorNames.join(', ')}`)
    }

  } catch (error) {
    yield put(SnackbarAction.openErrorSnackbar({
      [SnackbarPayload.MESSAGE]: 'Failed to resume connectors',
      [SnackbarPayload.ERROR]: error,
    }))
  }
}
