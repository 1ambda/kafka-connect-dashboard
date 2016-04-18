import { createAction, } from 'redux-actions'

import * as EditorDialogState from '../reducers/ConnectorReducer/EditorDialogState'
import * as FilterState from '../reducers/ConnectorReducer/FilterState'
import * as SorterState from '../reducers/ConnectorReducer/SorterState'
import * as PaginatorState from '../reducers/ConnectorReducer/PaginatorState'
import * as ItemState from '../reducers/ConnectorReducer/ItemState'
import * as ConfirmDialogState from '../reducers/ConnectorReducer/ConfirmDialogState'
import * as ClosableSnackBarState from '../reducers/ConnectorReducer/ClosableSnackbarState'

import * as SagaAction from '../middlewares/SagaAction'

/**
 * for documentation, enumerate all actions
 */
export default Object.assign({},
  { /** Component Actions */

    /** items */
    startSwitching: ItemState.Action.startSwitching,
    endSwitching: ItemState.Action.endSwitching,

    /** sorter, containerSelector, filter, paginator */
    filter: FilterState.Action.filter,
    initializeFilter: FilterState.Action.initializeFilter,
    sort: SorterState.Action.sort,
    changePageOffset: PaginatorState.Action.changePageOffset,

    /** for dialogs, snackbar */
    openEditorDialogToCreate: EditorDialogState.Action.openEditorDialogToCreate,
    openEditorDialogToEdit: EditorDialogState.Action.openEditorDialogToEdit,
    closeEditorDialog: EditorDialogState.Action.closeEditorDialog,
    openConfirmDialogToRemove: ConfirmDialogState.Action.openConfirmDialogToRemove,
    closeConfirmDialog: ConfirmDialogState.Action.closeConfirmDialog,

    openInfoSnackbar: ClosableSnackBarState.Action.openInfoSnackbar,
    openErrorSnackbar: ClosableSnackBarState.Action.openErrorSnackbar,
    closeSnackbar: ClosableSnackBarState.Action.closeSnackbar,
  },

  { /** API Actions */
    unsetReadonly: SagaAction.Action.unsetReadonly,
    setReadonly: SagaAction.Action.setReadonly,
    start: SagaAction.Action.start,
    stop: SagaAction.Action.stop,

    create: SagaAction.Action.create,
    remove: SagaAction.Action.remove,
    update: SagaAction.Action.update,

    changeContainer: SagaAction.Action.changeContainer,
    openEditorDialogToEdit: SagaAction.Action.openEditorDialogToEdit,
  }
)
