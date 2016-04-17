import React, { PropTypes, } from 'react'
import Snackbar from 'material-ui/lib/snackbar'
import RaisedButton from 'material-ui/lib/raised-button'

import * as style from './style'

export const CLOSABLE_SNACKBAR_MODE = {
  OPEN: 'OPEN',
  CLOSE: 'CLOSE',
}

export default class ClosableSnackbar extends React.Component {

  static propTypes = {
    snackbarMode: PropTypes.string.isRequired,
    closeHandler: PropTypes.func.isRequired,
    message: PropTypes.node.isRequired,
  }

  render() {
    const { snackbarMode, message, closeHandler, } = this.props

    return (
      <Snackbar
        style={style.snackbar}
        bodyStyle={style.body}
        open={CLOSABLE_SNACKBAR_MODE.OPEN === snackbarMode}
        action="CLOSE"
        onActionTouchTap={closeHandler}
        message={message}
        onRequestClose={closeHandler} />
    )
  }
}
