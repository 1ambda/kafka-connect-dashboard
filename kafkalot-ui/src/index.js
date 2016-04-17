import React from 'react'

/** initialize */
import 'isomorphic-fetch'
import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

import ReactDOM from 'react-dom'
import { Provider, } from 'react-redux'
import { Router, Route, browserHistory, } from 'react-router'
import { syncHistoryWithStore, routerReducer, } from 'react-router-redux'

import routes from './routes'
import configureStore from './store/configureStore'

/** import global css (element only, not class) */
import './styles/styles.css'

const store = configureStore()
const history = syncHistoryWithStore(browserHistory, store)

ReactDOM.render(
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>, document.getElementById('app')
)
