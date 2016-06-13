import { createAction, handleActions, } from 'redux-actions'

import * as URL from '../../middlewares/Url'

export const ActionType = {
  SET_STORAGE: 'SET_STORAGE',
}

export const Payload = {
  STORAGE: 'storage',
}

export const Property = {
  SELECTED_STORAGE: 'selectedStorage',
  AVAILABLE_STORAGES: 'availableStorages',
}

export const PrivateAction = {
  setStorage: createAction(ActionType.SET_STORAGE),
}

export const INITIAL_STATE = {
  [Property.SELECTED_STORAGE]: URL.INITIAL_STORAGE_NAME,
  [Property.AVAILABLE_STORAGES]: URL.STORAGE_NAMES,
}

export const handler = handleActions({
  [ActionType.SET_STORAGE]: (state, { payload, }) => {
    return Object.assign({}, state, { [Property.SELECTED_STORAGE]: payload[Payload.STORAGE], })
  },

}, INITIAL_STATE)
