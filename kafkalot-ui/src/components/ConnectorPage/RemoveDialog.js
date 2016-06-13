import React, { PropTypes, } from 'react'

import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'
import {List, ListItem, } from 'material-ui/List'

import { Property as RemoveDialogProperty, } from '../../reducers/ConnectorReducer/RemoveDialogState'

const dialogStyle = {
  title: { fontWeight: 300, fontSize: 18, padding: '50px 0px 0px 20px', },
  list: { marginTop: 30, marginBottom: 30, },
  button: { marginRight: 15, marginBottom: 15, },
  buttonLabel: { fontWeight: 300, },
}

export default class RemoveDialog extends React.Component {
  static propTypes = {
    connectorNames: PropTypes.array.isRequired,
    closeRemoveDialog: PropTypes.func.isRequired,
    removeConnector: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)

    this.handleRemove = this.handleRemove.bind(this)
  }

  handleRemove() {
    const { connectorNames, removeConnector, } = this.props

    removeConnector({
      [RemoveDialogProperty.CONNECTOR_NAMES]: connectorNames,
    })
  }
  
  createTitle() {
    const { connectorNames, } = this.props

    const connectorCountToBeRemoved = connectorNames.length
    const postfix = (connectorCountToBeRemoved < 2) ? '' : 's'
    const titleText = `Remove ${connectorCountToBeRemoved} connector${postfix}`

    return (
      <div style={dialogStyle.title}>{titleText}</div>
    )
  }

  createConnectorList() {
    const { connectorNames, } = this.props

    const items = []
    for (let i = 0; i < connectorNames.length; i ++) {
      items.push(<ListItem primaryText={connectorNames[i]} />)
    }

    return (<List style={dialogStyle.list}> {items} </List>)
  }

  render() {
    const { closeRemoveDialog, } = this.props

    const buttons = [
      <FlatButton
        style={dialogStyle.button} labelStyle={dialogStyle.buttonLabel}
        secondary key="cancel" label="Cancel"
        onTouchTap={closeRemoveDialog} />,
      <FlatButton
        style={dialogStyle.button} labelStyle={dialogStyle.buttonLabel}
        key="remove" label="Remove"
        primary onTouchTap={this.handleRemove} />,
    ]

    return (
      <Dialog
        title={this.createTitle()}
        actions={buttons}
        autoScrollBodyContent
        open modal={false}
        onRequestClose={closeRemoveDialog}>
        {this.createConnectorList()}
      </Dialog>
    )
  }
}
