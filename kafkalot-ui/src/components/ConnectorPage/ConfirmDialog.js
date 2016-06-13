import React, { PropTypes, } from 'react'

import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'

import { ConnectorProperty, } from '../../reducers/ConnectorReducer/ConnectorListState'
import {
  CONFIRM_DIALOG_MODE, Property as DialogProperty,
} from '../../reducers/ConnectorReducer/ConfirmDialogState'

const dialogStyle = {
  title: {
    fontWeight: 300,
    fontSize: 18,
    padding: '50px 0px 0px 20px',
  },

  name: {
    fontWeight: 500,
    color: '#1e88e5',
  },

  button: {
    marginRight: 15,
    marginBottom: 15,
  },

  buttonLabel: {
    fontWeight: 300,
  },
}

export default class ConfirmDialog extends React.Component {
  static propTypes = {
    connector: PropTypes.object.isRequired,
    dialogMode: PropTypes.string.isRequired,
    closeConfirmDialog: PropTypes.func.isRequired,
    submitEnable: PropTypes.bool.isRequired,
    submitHandler: PropTypes.func.isRequired,
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
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleClose() {
    const { closeConfirmDialog, } = this.props
    closeConfirmDialog()
  }

  handleSubmit() {
    const { removeConnector, connector, closeConfirmDialog, } = this.props

    removeConnector({ [DialogProperty.CONNECTOR]: connector, })
    closeConfirmDialog()
  }

  render() {
    const { connector, dialogMode, } = this.props

    const submitButton = (CONFIRM_DIALOG_MODE.REMOVE === dialogMode) ?
      (<FlatButton
          style={dialogStyle.button} labelStyle={dialogStyle.buttonLabel}
          key="submit" label="Submit"
          primary onTouchTap={this.handleRemove} />) : null


    const buttons = [
      <FlatButton
        style={dialogStyle.button} labelStyle={dialogStyle.buttonLabel}
        secondary key="cancel" label="Cancel"
        onTouchTap={this.handleClose} />,
      submitButton,
    ]

    const title = ConfirmDialog.createTitle(connector[ConnectorProperty.NAME])

    return (
      <Dialog
        title={title}
        actions={buttons}
        open modal={false}
        onRequestClose={this.handleClose} />
    )
  }
}
