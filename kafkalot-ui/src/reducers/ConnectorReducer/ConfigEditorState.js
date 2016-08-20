import { createAction, handleActions, } from 'redux-actions'

export const ActionType = {
  SUCCEED_TO_OPEN_CONFIG_EDITOR: 'CONNECTOR/CONFIG_EDITOR/SUCCEED_TO_OPEN',
  CLOSE_CONFIG_EDITOR: 'CONNECTOR/CONFIG_EDITOR/CLOSE',
}

export const Action = {
  closeConfigEditor: createAction(ActionType.CLOSE_CONFIG_EDITOR),
}

export const PrivateAction = {
  succeededToOpenConfigEditor: createAction(ActionType.SUCCEED_TO_OPEN_CONFIG_EDITOR),
}

export const Payload = {
  NAME: 'name',
  READONLY: 'readonly',
  OPENED: 'opened',
  CONFIG: 'config',
}

export const INITIAL_STATE = {
  [Payload.NAME]: '',
  [Payload.OPENED]: false,
  [Payload.READONLY]: true,
  [Payload.CONFIG]: {},
}

export const handler = handleActions({
  /** open editor dialog to edit */
  [ActionType.SUCCEED_TO_OPEN_CONFIG_EDITOR]: (state, { payload, }) =>
    Object.assign({}, state, {
      [Payload.NAME]: payload[Payload.NAME],
      [Payload.OPENED]: true,
      [Payload.READONLY]: payload[Payload.READONLY],
      [Payload.CONFIG]: payload[Payload.CONFIG],
    }),

  [ActionType.CLOSE_CONFIG_EDITOR]: (state) =>
    Object.assign({}, INITIAL_STATE /** reset */, {
      [Payload.OPENED]: false,
    }),
}, INITIAL_STATE)

