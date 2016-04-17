import React from 'react'
import { Route, IndexRoute, } from 'react-router'

import App from './components/Common/App'
import * as Page from './constants/page'
import MainPage from './containers/MainPage'
import ConnectorPage from './containers/ConnectorPage'
import NotFoundPage from './components/Common/NotFoundPage'

export default (
  <Route path="/" component={App}>
    <IndexRoute component={ConnectorPage} />
    <Route path={Page.MainPageRouting} component={MainPage}/>
    <Route path={Page.ConnectorPageRouting} component={ConnectorPage}/>
    <Route path="*" component={NotFoundPage} />
  </Route>
)
