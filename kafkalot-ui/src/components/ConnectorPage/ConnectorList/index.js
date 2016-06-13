import React, { PropTypes, } from 'react'

import Checkbox from 'material-ui/Checkbox'
import Divider from 'material-ui/Divider'
import Paper from 'material-ui/Paper'
import { List, ListItem, } from 'material-ui/List'

import { ListItemColumn, } from './ListItemColumn'
import { ConnectorListItem, } from './ConnectorListItem'
import { ConnectorListProperty, } from '../../../reducers/ConnectorReducer/ConnectorListState'

import * as style from './style'

export default class ConnectorList extends React.Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    
    connectors: PropTypes.array.isRequired,
    tableHeaderChecked: PropTypes.bool.isRequired,
    toggleCurrentPageCheckboxes: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)

    this.handleHeaderCheckboxClick = this.handleHeaderCheckboxClick.bind(this)
  }

  handleHeaderCheckboxClick() {
    const { toggleCurrentPageCheckboxes, tableHeaderChecked, } = this.props

    toggleCurrentPageCheckboxes({
      [ConnectorListProperty.TABLE_HEADER_CHECKED]: !tableHeaderChecked, /** invert */
    })
  }

  createTableHeader() {
    const { tableHeaderChecked, } = this.props

    return(
      <List style={style.HeaderContainer}>
        <ListItem disabled style={style.ItemHeaderColumn.container}>
          <ListItemColumn style={style.ItemHeaderColumn.checkbox}>
            <Checkbox onCheck={this.handleHeaderCheckboxClick}
                      defaultChecked={tableHeaderChecked} />
          </ListItemColumn>
          <ListItemColumn style={style.ItemHeaderColumn.stateIcon} />
          <ListItemColumn style={style.ItemHeaderColumn.stateText}>STATUS</ListItemColumn>
          <ListItemColumn style={style.ItemHeaderColumn.taskText}>TASKS</ListItemColumn>
          <ListItemColumn style={style.ItemHeaderColumn.name}>NAME</ListItemColumn>
          <ListItemColumn style={style.ItemHeaderColumn.uptime}>UPTIME</ListItemColumn>
        </ListItem>
      </List>
    )
  }

  createTableBody() {
    const { connectors, actions, } = this.props

    const items = []

    for (let i = 0; i < connectors.length; i++) {
      const connector = connectors[i]
      const item = (
        <ConnectorListItem key={connector.name}
                           disableConnector={actions.disableConnector}
                           enableConnector={actions.enableConnector}
                           fetchConnector={actions.fetchConnector}
                           openConfigEditor={actions.openConfigEditor}
                           setConnectorChecked={actions.setConnectorChecked} {...connector} />)

      items.push(item)

      if (i < connectors.length - 1)
        items.push(<Divider key={connector.name + '-div'} />)
    }

    return(
      <List style={style.BodyContainer}>
        {items}
      </List>
    )
  }

  render() {
    return (
      <Paper style={style.TableContainer}>
        {this.createTableHeader()}
        <Divider />
        {this.createTableBody()}
      </Paper>
    )
  }
}



