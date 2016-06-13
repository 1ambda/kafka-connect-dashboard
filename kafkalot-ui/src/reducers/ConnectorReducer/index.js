import { combineReducers, } from 'redux'
import { handleActions, } from 'redux-actions'

import * as ConnectorListState from './ConnectorListState'
import * as RemoveDialogState from './RemoveDialogState'
import * as ClosableSnackbarState from './ClosableSnackbarState'
import * as StorageSelectorState from './StorageSelectorState'

import * as ConfigEditorState from './ConfigEditorState'
import * as CreateEditorState from './CreateEditorState'

import { CONNECTOR, } from '../../constants/State'

export default combineReducers({
  [CONNECTOR.STORAGE_SELECTOR]: StorageSelectorState.handler,
  [CONNECTOR.CONNECTOR_LIST]: ConnectorListState.handler,

  [CONNECTOR.SNACKBAR]: ClosableSnackbarState.handler,
  [CONNECTOR.CONFIG_EDITOR]: ConfigEditorState.handler,
  [CONNECTOR.CREATE_EDITOR]: CreateEditorState.handler,
  [CONNECTOR.REMOVE_DIALOG]: RemoveDialogState.handler,
})
