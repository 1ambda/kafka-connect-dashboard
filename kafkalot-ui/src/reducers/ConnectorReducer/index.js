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

import { CONNECTOR, } from '../../constants/state'

export default combineReducers({
  [CONNECTOR.CONTAINER_SELECTOR]: ContainerSelectorState.handler,
  [CONNECTOR.ITEMS]: ItemState.handler,
  [CONNECTOR.PAGINATOR]: PaginatorState.handler,
  [CONNECTOR.FILTER]: FilterState.handler,
  [CONNECTOR.SORTER]: SorterState.handler,
  [CONNECTOR.EDITOR_DIALOG]: EditorDialogState.handler,
  [CONNECTOR.CONFIRM_DIALOG]: ConfirmDialogState.handler,
  [CONNECTOR.SNACKBAR]: ClosableSnackbarState.handler,
})
