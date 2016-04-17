import { combineReducers, } from 'redux'
import { handleActions, } from 'redux-actions'

import * as ItemState from './ItemState'
import * as PaginatorState from './PaginatorState'
import * as FilterState from './FilterState'
import * as SorterState from './SorterState'
import * as EditorDialogState from './EditorDialogState'
import * as ConfirmDialogState from './ConfirmDialogState'
import * as ClosableSnackbarState from './ClosableSnackbarState'
import * as ContainerSelectorState from './ContainerSelectorState'

export const CONNECTOR_STATE_PROPERTY = {
  ITEMS: 'items',
  PAGINATOR: 'paginator',
  FILTER: 'filterKeyword',
  EDITOR_DIALOG: 'editorDialog',
  CONFIRM_DIALOG: 'confirmDialog',
  SORTER: 'sortingStrategy',
  SNACKBAR: 'snackbar',
  CONTAINER_SELECTOR: 'containerSelector',
}

export default combineReducers({
  [CONNECTOR_STATE_PROPERTY.CONTAINER_SELECTOR]: ContainerSelectorState.handler,
  [CONNECTOR_STATE_PROPERTY.ITEMS]: ItemState.handler,
  [CONNECTOR_STATE_PROPERTY.PAGINATOR]: PaginatorState.handler,
  [CONNECTOR_STATE_PROPERTY.FILTER]: FilterState.handler,
  [CONNECTOR_STATE_PROPERTY.SORTER]: SorterState.handler,
  [CONNECTOR_STATE_PROPERTY.EDITOR_DIALOG]: EditorDialogState.handler,
  [CONNECTOR_STATE_PROPERTY.CONFIRM_DIALOG]: ConfirmDialogState.handler,
  [CONNECTOR_STATE_PROPERTY.SNACKBAR]: ClosableSnackbarState.handler,
})
