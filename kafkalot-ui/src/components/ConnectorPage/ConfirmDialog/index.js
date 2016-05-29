import React, { PropTypes, } from 'react'

import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'

import { ItemProperty, } from '../../../reducers/ConnectorReducer/ItemState'
import { CONFIRM_DIALOG_MODE, Property as DialogProperty, } from '../../../reducers/ConnectorReducer/ConfirmDialogState'
import * as dialogStyle from './style'

export default class ConfirmDialog extends React.Component {
  static propTypes = {
    connector: PropTypes.object.isRequired,
    dialogMode: PropTypes.string.isRequired,
    closeConfirmDialog: PropTypes.func.isRequired,
    removeConnector: PropTypes.func.isRequired,
  }

  static createTitle(element) {
    return (
      <div className="center" style={dialogStyle.title}>
        <span>Remove</span>
        <span style={dialogStyle.name}> {element}</span>
      </div>
    )
  }

  constructor(props) {
    super(props)

    this.handleClose = this.handleClose.bind(this)
    this.handleRemove = this.handleRemove.bind(this)
  }

  handleClose() {
    const { closeConfirmDialog, } = this.props
    closeConfirmDialog()
  }

  handleRemove() {
    const { removeConnector, connector, closeConfirmDialog, } = this.props

    removeConnector({ [DialogProperty.CONNECTOR]: connector, })
    closeConfirmDialog()
  }

  render() {
    const { connector, dialogMode, } = this.props

    const submitButton = (CONFIRM_DIALOG_MODE.REMOVE === dialogMode) ?
      (<FlatButton
          style={dialogStyle.button} labelStyle={dialogStyle.buttonLabel}
          key="remove" label="Remove"
          primary onTouchTap={this.handleRemove} />) : null


    const buttons = [
      <FlatButton
        style={dialogStyle.button} labelStyle={dialogStyle.buttonLabel}
        secondary key="cancel" label="Cancel"
        onTouchTap={this.handleClose} />,
      submitButton,
    ]

    const title = ConfirmDialog.createTitle(connector[ItemProperty.name])

    return (
      <Dialog
        title={title}
        actions={buttons}
        open modal={false}
        onRequestClose={this.handleClose} />
    )
  }
}
