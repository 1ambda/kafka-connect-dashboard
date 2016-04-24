import React, { PropTypes, } from 'react'

import ListItem from 'material-ui/lib/lists/list-item'
import Divider from 'material-ui/lib/divider'
import Checkbox from 'material-ui/lib/checkbox'
import Toggle from 'material-ui/lib/toggle'
import FontIcon from 'material-ui/lib/font-icon'
import Delete from 'material-ui/lib/svg-icons/action/delete'

import * as style from './style'
import { ConnectorItemColors, } from '../../../constants/theme'

import {
  ItemProperty as ConnectorProperty,
  Payload as ConnectorItemPayload,
  isRunning, isStopped, isWaiting, isSwitching,
} from '../../../reducers/ConnectorReducer/ItemState'
import { Payload as EditorDialogPayload, } from '../../../reducers/ConnectorReducer/EditorDialogState'
import { Payload as ConfirmDialogPayload, } from '../../../reducers/ConnectorReducer/ConfirmDialogState'

/** extract getInactiveState functions for testability */
export function isReadonly(connector) {
  return isSwitching(connector) || isStopped(connector) || isRunning(connector)
}

export function isReadonlyToggleDisabled(connector) {
  return isSwitching(connector) || isRunning(connector)
}
export function isReadonlyToggleDefaultToggled(connector) {
  return isStopped(connector)
}

export function isRunningToggleDisabled(connector) {
  return isSwitching(connector) || isStopped(connector)
}
export function isRunningToggleDefaultToggled(connector) {
  return isRunning(connector)
}

export default class ConnectorItem extends React.Component {
  static propTypes = {
    connector: PropTypes.object.isRequired,
    openConfirmDialogToRemove: PropTypes.func.isRequired,
    openEditorDialogToEdit: PropTypes.func.isRequired,
    setReadonly: PropTypes.func.isRequired,
    unsetReadonly: PropTypes.func.isRequired,
    startConnector: PropTypes.func.isRequired,
    stopConnector: PropTypes.func.isRequired,
  }

  static getCommandColor(inactive) {
    return (inactive) ?
      ConnectorItemColors.inactiveJobCommandColor : ConnectorItemColors.activeJobCommandColor
  }

  static createRemoveButton(index, readonly, handler) {

    /**
     * since updating inline-style does't update DOM element,
     * we have to create <Delete /> every time to update remove icon color
     */
    const removeIcon = (readonly) ?
      (<Delete color={ConnectorItemColors.inactiveRemoveIcon} />) :
      (<Delete color={ConnectorItemColors.activeRemoveIcon} />)

    const commandColor = ConnectorItem.getCommandColor(readonly)

    return (
      <ListItem key={index}
                style={{color: commandColor, fontWeight: style.fontWeight,}}
                disabled={readonly}
                primaryText="Remove"
                rightIcon={removeIcon}
                onClick={handler} />
    )
  }

  static createReadonlyToggle(index, inactive, toggled, handler) {

    const readonlyToggle = (<Toggle onToggle={handler}
                                   disabled={inactive}
                                   defaultToggled={toggled} />)


    const commandColor = ConnectorItem.getCommandColor(inactive)

    return (
      <ListItem key={index}
                style={{color: commandColor, fontWeight: style.fontWeight,}}
                primaryText="Readonly"
                rightToggle={readonlyToggle} />
    )
  }

  static createRunningToggle(index, inactive, toggled, handler) {

    const runningToggle = (<Toggle onToggle={handler}
                                   disabled={inactive}
                                   defaultToggled={toggled} />)

    const commandColor = ConnectorItem.getCommandColor(inactive)

    return (
      <ListItem key={index}
                style={{color: commandColor, fontWeight: style.fontWeight,}}
                primaryText="Running"
                rightToggle={runningToggle} />
    )
  }

  static createSpinIcon(connector) {


    return (isRunning(connector)) ? (<FontIcon style={{color: ConnectorItemColors.runningSpin,}} className="fa fa-circle-o-notch fa-spin" />) :
      (isWaiting(connector))  ? (<FontIcon style={{color: ConnectorItemColors.waitingSpin,}} className="fa fa-circle-o-notch" />) :
        (<FontIcon className="fa fa-circle-o-notch" />)
  }

  handleReadonlyToggleChange() {
    const { connector, setReadonly, unsetReadonly, } = this.props

    /**
     * since material-ui toggle doesn't property work, (0.14.4)
     * we rely on the redux state instead of passed params of this callback
     * to send actions
     */

    if (isReadonly(connector)) unsetReadonly({ [ConnectorItemPayload.CONNECTOR]: connector, })
    else setReadonly({ [ConnectorItemPayload.CONNECTOR]: connector, })
  }

  handleRunningToggleChange() {
    const { connector, stopConnector, startConnector, } = this.props

    /**
     * since material-ui toggle doesn't property work, (0.14.4)
     * we rely on the redux state instead of passed params of this callback
     * to send actions
     */

    if (isRunning(connector)) stopConnector({ [ConnectorItemPayload.CONNECTOR]: connector, })
    else startConnector({ [ConnectorItemPayload.CONNECTOR]: connector, })
  }

  handleRemoveButtonClick(event) {
    const { connector, openConfirmDialogToRemove, } = this.props

    if (isWaiting(connector)) openConfirmDialogToRemove({
      [ConfirmDialogPayload.CONNECTOR]: connector,
    })
  }

  handleItemClick(event) {
    const { openEditorDialogToEdit, connector, } = this.props

    /** check current connector is readonly */
    const readonly = isReadonly(connector)
    const payload = {
      [EditorDialogPayload.NAME]: connector[ConnectorProperty.name],
      [EditorDialogPayload.READONLY]: readonly,
    }

    /**
     * preventDefault hack
     *
     * since we can't control nestedListToggle event in current material-ui version (0.14.4)
     * we have to avoid opening dialog when nestedListToggle is clicked
     */
    if (event.dispatchMarker.includes('Text')) openEditorDialogToEdit(payload)
  }

  render() {
    const { connector, } = this.props
    const tags = connector[ConnectorProperty.tags]
    const name = connector[ConnectorProperty.name]

    /** 1. Remove Button */
    const readonly = isReadonly(connector)
    const removeButton = ConnectorItem.createRemoveButton(
      0, readonly, this.handleRemoveButtonClick.bind(this))

    /** 2. Disable Toggle */
    const readonlyToggleInactive = isReadonlyToggleDisabled(connector)
    const readonlyToggleDefaultToggled = isReadonlyToggleDefaultToggled(connector)

    const readonlyToggle = ConnectorItem.createReadonlyToggle(
      1, readonlyToggleInactive, readonlyToggleDefaultToggled,
      this.handleReadonlyToggleChange.bind(this))

    /** 3. Running Toggle */
    const runningToggleInactive = isRunningToggleDisabled(connector)
    const runningToggleDefaultToggled = isRunningToggleDefaultToggled(connector)

    const runningToggle = ConnectorItem.createRunningToggle(
      2, runningToggleInactive, runningToggleDefaultToggled,
      this.handleRunningToggleChange.bind(this))

    /** 4. spin */
    const spinIcon = ConnectorItem.createSpinIcon(connector)

    /** 5. tags */
    const tagString = (tags) ? tags.join(', ') : null

    return (
      <ListItem onClick={this.handleItemClick.bind(this)}
                primaryText={name}
                secondaryText={tagString}
                leftIcon={spinIcon}
                nestedItems={[runningToggle, readonlyToggle, removeButton,]} />
    )
  }
}
