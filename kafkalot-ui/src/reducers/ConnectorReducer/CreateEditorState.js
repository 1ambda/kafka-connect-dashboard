import { createAction, handleActions, } from 'redux-actions'

export const ActionType = {
  OPEN_CREATE_EDITOR: 'OPEN_CREATE_EDITOR',
  CLOSE_CREATE_EDITOR: 'CLOSE_CREATE_EDITOR',
}

export const Action = {
  openCreateEditor: createAction(ActionType.OPEN_CREATE_EDITOR),
  closeCreateEditor: createAction(ActionType.CLOSE_CREATE_EDITOR),
}

export const Payload = {
  OPENED: 'opened',
}

export const INITIAL_STATE = {
  [Payload.OPENED]: false,
}

export const handler = handleActions({
  /** open editor dialog to edit */
  [ActionType.OPEN_CREATE_EDITOR]: (state, { payload, }) =>
    Object.assign({}, INITIAL_STATE, {
      [Payload.OPENED]: true,
    }),

  [ActionType.CLOSE_CREATE_EDITOR]: (state) =>
    Object.assign({}, INITIAL_STATE, {
      [Payload.OPENED]: false,
    }),
}, INITIAL_STATE)

