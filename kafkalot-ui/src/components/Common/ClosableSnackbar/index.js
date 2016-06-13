import React, { PropTypes, } from 'react'
import Snackbar from 'material-ui/Snackbar'

import * as style from './style'

export const CLOSABLE_SNACKBAR_MODE = {
  OPEN: 'OPEN',
  CLOSE: 'CLOSE',
}

export default class ClosableSnackbar extends React.Component {
  static propTypes = {
    snackbarMode: PropTypes.string.isRequired,
    message: PropTypes.node.isRequired,
    closeSnackbar: PropTypes.func.isRequired,
  }
  
  constructor(props) {
    super(props)
  }

  render() {
    const { snackbarMode, message, closeSnackbar, } = this.props

    return (
      <Snackbar
        style={style.snackbar}
        bodyStyle={style.body}
        open={CLOSABLE_SNACKBAR_MODE.OPEN === snackbarMode}
        message={message}
        action="CLOSE"
        onRequestClose={closeSnackbar}
        onActionTouchTap={closeSnackbar}
      />
    )
  }
}
