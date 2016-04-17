import { createStore, applyMiddleware, compose, combineReducers, } from 'redux'
import { routerReducer, } from 'react-router-redux'
import createSagaMiddleware from 'redux-saga'

import RootReducer from '../reducers'
import sagas from '../middlewares/sagas'
const sagaMiddleware = createSagaMiddleware(sagas)

const middlewares = [sagaMiddleware,]

export default function configureStore(initialState) {
  let store
  if (window.devToolsExtension) {
    store = createStore(
      RootReducer,
      initialState,
      compose(
        applyMiddleware(...middlewares),
        window.devToolsExtension ? window.devToolsExtension() : f => f
      ))
  } else {
    store = createStore(
      RootReducer,
      initialState,
      applyMiddleware(...middlewares)
    )
  }

  if (module.hot) {
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers')
      store.replaceReducer(nextReducer)
    })
  }

  return store
}
