import React, { PropTypes, } from 'react'

import List from 'material-ui/lib/lists/list'
import Divider from 'material-ui/lib/divider'

import * as style from './style'
import ConnectorItem from '../ConnectorItem'
import { ITEM_PROPERTY as CONNECTOR_PROPERTY } from '../../../reducers/ConnectorReducer/ItemState'

export default class ConnectorList extends React.Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    connectors: PropTypes.array.isRequired,
  }

  static createItem(connector, actions) {
    return (<ConnectorItem connector={connector}
                           key={connector[CONNECTOR_PROPERTY.name]}
                           actions={actions} />)
  }

  render() {
    const { connectors, actions, } = this.props

    const items = connectors
      .reduce((acc, connector) => {
        acc.push(ConnectorList.createItem(connector, actions))
        acc.push(<Divider key={`divider-${connector[CONNECTOR_PROPERTY.name]}`} />)
        return acc
      }, [])

    return (
      <List style={style.list}>
        <Divider />
        {items}
      </List>
    )
  }
}

