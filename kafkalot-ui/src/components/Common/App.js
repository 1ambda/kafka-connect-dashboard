import React, { PropTypes, } from 'react'

import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import NavBar from './NavBar'

class App extends React.Component {
  static propTypes = {
    children: PropTypes.element,
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <div>
          <NavBar />
          <br/>
          <div className="row">
            <div className="col s12 m10 l10 offset-m1 offset-l1">
              {this.props.children}
            </div>
          </div>
        </div>
      </MuiThemeProvider>
    )
  }
}

export default App
