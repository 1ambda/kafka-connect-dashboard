import { combineReducers, } from 'redux'
import { routerReducer, } from 'react-router-redux'

import { REDUCER_STATE_PROPERTY, } from '../constants/state'
import ConnectorReducer from './ConnectorReducer'

const rootReducer = combineReducers({
  [REDUCER_STATE_PROPERTY.CONNECTOR]: ConnectorReducer,
  [REDUCER_STATE_PROPERTY.ROUTING]: routerReducer,
})

export default rootReducer


