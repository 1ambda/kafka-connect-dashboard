import React, { PropTypes, } from 'react'
import { Link, IndexLink, } from 'react-router'

import FlatButton from 'material-ui/lib/flat-button'
import Toolbar from 'material-ui/lib/toolbar/toolbar'
import ToolbarGroup from 'material-ui/lib/toolbar/toolbar-group'
import ToolbarTitle from 'material-ui/lib/toolbar/toolbar-title'

import IconButton from 'material-ui/lib/icon-button'
import IconMenu from 'material-ui/lib/menus/icon-menu'
import MoreVertIcon from 'material-ui/lib/svg-icons/navigation/more-vert'
import MenuItem from 'material-ui/lib/menus/menu-item'

import * as Page from '../../../constants/page'
import * as style from './style.js'
import * as CONFIG from '../../../constants/config'

export default class NavBar extends React.Component {

  render() {

    return (
      <Toolbar style={style.navbar}>
        <ToolbarGroup firstChild float="left">
          <ToolbarTitle text={<Link to={`/${Page.MainPageRouting}`} style={style.text}>{CONFIG.TITLE}</Link>}
                        style={style.title} />
          <FlatButton disabled label={<IndexLink to={`/${Page.ConnectorPageRouting}`} style={style.text}>{Page.ConnectorPageTitle}</IndexLink>}
                      style={style.linkButton} />
        </ToolbarGroup>
        <ToolbarGroup float="right">
          <IconMenu
            style={style.iconMenu}
            iconButtonElement={<IconButton iconStyle={style.icon} ><MoreVertIcon /></IconButton>} >
            <MenuItem style={style.iconMenuItem} primaryText="Settings" />
            <MenuItem style={style.iconMenuItem} primaryText="Sign out" />
          </IconMenu>
        </ToolbarGroup>
      </Toolbar>
    )
  }
}


