import { combineReducers, } from 'redux'
import { handleActions, } from 'redux-actions'

import * as ConnectorListState from './ConnectorListState'
import * as StorageSelectorState from './StorageSelectorState'
import * as ConfigSchemaState from './ConfigSchemaState'

import * as CreateEditorState from './CreateEditorState'
import * as ConfigEditorState from './ConfigEditorState'
import * as RemoveDialogState from './RemoveDialogState'
import * as ClosableSnackbarState from './ClosableSnackbarState'

import { CONNECTOR, } from '../../constants/State'

export default combineReducers({
  [CONNECTOR.STORAGE_SELECTOR]: StorageSelectorState.handler,
  [CONNECTOR.CONNECTOR_LIST]: ConnectorListState.handler,
  [CONNECTOR.CONFIG_SCHEMA]: ConfigSchemaState.handler,

  [CONNECTOR.CONFIG_EDITOR]: ConfigEditorState.handler,
  [CONNECTOR.CREATE_EDITOR]: CreateEditorState.handler,
  [CONNECTOR.REMOVE_DIALOG]: RemoveDialogState.handler,
  [CONNECTOR.SNACKBAR]: ClosableSnackbarState.handler,
})
