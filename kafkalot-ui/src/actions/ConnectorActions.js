import { createAction, } from 'redux-actions'

import { Action as PaginatorAction, } from '../reducers/ConnectorReducer/PaginatorState'
import { Action as ConfigEditorAction, } from '../reducers/ConnectorReducer/ConfigEditorState'
import { Action as CreateEditorAction, } from '../reducers/ConnectorReducer/CreateEditorState'
import { Action as RemoveDialogAction, } from '../reducers/ConnectorReducer/RemoveDialogState'
import { Action as ClosableSnackbarAction, } from '../reducers/ConnectorReducer/ClosableSnackbarState'
import { Action as ConnectorAction, } from '../reducers/ConnectorReducer/ConnectorListState'
import { Action as SagaAction, } from '../middlewares/Saga'

export default Object.assign({}, {
    /** Component Actions */
  ...ConfigEditorAction,
  ...CreateEditorAction,
  ...RemoveDialogAction,
  ...ClosableSnackbarAction,
  ...ConnectorAction,
  ...PaginatorAction,
  }, {
    /** API Actions */
  ...SagaAction,
  }
)
