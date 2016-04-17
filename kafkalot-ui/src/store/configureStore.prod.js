import { createStore, applyMiddleware, combineReducers, } from 'redux'
import { routerReducer, } from 'react-router-redux'
import createSagaMiddleware from 'redux-saga'

import RootReducer from '../reducers'
import sagas from '../middlewares/sagas'
const sagaMiddleware = createSagaMiddleware(sagas)

const middlewares = [sagaMiddleware,]

export default function configureStore(initialState) {
  return createStore(
    RootReducer,
    initialState,
    applyMiddleware(...middlewares)
  )
}
