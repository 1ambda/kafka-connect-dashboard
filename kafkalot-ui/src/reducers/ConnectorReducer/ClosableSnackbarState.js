import { createAction, handleActions, } from 'redux-actions'

import * as Logger from '../../util/Logger'

import { CLOSABLE_SNACKBAR_MODE, } from '../../components/Common/ClosableSnackbar'


export const Property = {
  MESSAGE: 'message',
  SNACKBAR_MODE: 'snackbarMode',
}

export const Payload = {
  ERROR: 'error',
  MESSAGE: 'message',
}

export const ActionType = {
  OPEN_INFO_SNACKBAR: 'CONNECTOR/SNACKBAR/OPEN_INFOS',
  OPEN_ERROR_SNACKBAR: 'CONNECTOR/SNACKBAR/OPEN_ERROR',
  CLOSE_SNACKBAR: 'CONNECTOR/SNACKBAR/CLOSE',
}

export const Action = {
  openInfoSnackbar: createAction(ActionType.OPEN_INFO_SNACKBAR),
  openErrorSnackbar: createAction(ActionType.OPEN_ERROR_SNACKBAR),
  closeSnackbar: createAction(ActionType.CLOSE_SNACKBAR),
}

export const INITIAL_STATE = {
  [Property.MESSAGE]: '',
  [Property.SNACKBAR_MODE]: CLOSABLE_SNACKBAR_MODE.CLOSE,
}

export const handler = handleActions({
  /** snackbar related */
  [ActionType.CLOSE_SNACKBAR]: (state) =>
    Object.assign({}, state, { snackbarMode: CLOSABLE_SNACKBAR_MODE.CLOSE, }),

  [ActionType.OPEN_ERROR_SNACKBAR]: (state, { payload, }) => {

    const message = payload[Payload.MESSAGE]
    const error = payload[Payload.ERROR]

    Logger.error(message, error)

    return Object.assign({}, state, {
      [Property.MESSAGE]: error.message,
      [Property.SNACKBAR_MODE]: CLOSABLE_SNACKBAR_MODE.OPEN,
    })
  },

  [ActionType.OPEN_INFO_SNACKBAR]: (state, { payload, }) => {

    const message = payload[Payload.MESSAGE]

    Logger.info(message)

    return Object.assign({}, state, {
      [Property.MESSAGE]: message,
      [Property.SNACKBAR_MODE]: CLOSABLE_SNACKBAR_MODE.OPEN,
    })
  },

}, INITIAL_STATE)

