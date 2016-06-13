import { combineReducers, } from 'redux'
import { routerReducer, } from 'react-router-redux'

import { ROOT, } from '../constants/State'
import ConnectorReducer from './ConnectorReducer'

const rootReducer = combineReducers({
  [ROOT.CONNECTOR]: ConnectorReducer,
  [ROOT.ROUTING]: routerReducer,
})

export default rootReducer


