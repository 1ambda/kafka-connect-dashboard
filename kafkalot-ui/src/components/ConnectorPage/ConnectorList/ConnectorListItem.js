import React, { PropTypes, } from 'react'

import Divider from 'material-ui/Divider'
import CircularProgress from 'material-ui/CircularProgress'
import FlatButton from 'material-ui/FlatButton'
import Checkbox from 'material-ui/Checkbox'
import { grey400, darkBlack, lightBlack, } from 'material-ui/styles/colors'
import { List, ListItem, } from 'material-ui/List'

import {
  Payload as ConfigEditorPayload,
} from '../../../reducers/ConnectorReducer/ConfigEditorState'

import {
  isRunningTask, ConnectorProperty,
  isRunningState, isUnassignedState, 
  isPausedState, isFailedState, 
  isRegisteredState, isDisabledState, isWorkingState,
} from '../../../reducers/ConnectorReducer/ConnectorListState'

import * as style from './style'
import * as Theme from '../../../constants/Theme'
import { ConnectorTask, } from './ConnectorTask'
import { ListItemColumn, ListItemLastColumn, } from './ListItemColumn'

export class ConnectorListItem extends React.Component {
  
  static propTypes = {
    tasks: PropTypes.array.isRequired,
    name: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
    uptime: PropTypes.string.isRequired,
    tags: PropTypes.array.isRequired,
    checked: PropTypes.bool.isRequired,

    setConnectorChecked: PropTypes.func.isRequired,
    fetchConnector: PropTypes.func.isRequired,
    openConfigEditor: PropTypes.func.isRequired,
    disableConnector: PropTypes.func.isRequired,
    enableConnector: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)

    this.handleConfigButtonClick = this.handleConfigButtonClick.bind(this)
    this.handleCheckboxClick = this.handleCheckboxClick.bind(this)
    this.handleEnableButtonClick = this.handleEnableButtonClick.bind(this)
  }

  handleCheckboxClick() {
    const { name, checked, setConnectorChecked, } = this.props

    setConnectorChecked({
      [ConnectorProperty.NAME]: name,
      [ConnectorProperty.CHECKED]: !checked,
    })
  }

  handleConfigButtonClick() {
    const { name, openConfigEditor, } = this.props

    openConfigEditor({
      [ConfigEditorPayload.NAME]: name,
    })
  }

  handleEnableButtonClick() {
    const { name, state, enableConnector, disableConnector, } = this.props

    /** branch enable/disable button using `state` */
    if (isRegisteredState(state)) {
      disableConnector({ [ConnectorProperty.NAME]: name, })
    } else if (isDisabledState(state)) {
      enableConnector({ [ConnectorProperty.NAME]: name, })
    }
  }

  createStateIcon() {
    const { state: connectorState, } = this.props

    const workingOnConnector = (isWorkingState(connectorState))
    const mode = (workingOnConnector) ? 'indeterminate' : 'determinate'
    const value = (workingOnConnector) ? 0 : 100
    let color = Theme.ConnectorStateColor.Disabled

    if (isRunningState(connectorState))
      color = Theme.ConnectorStateColor.Running
    else if (isUnassignedState(connectorState))
      color = Theme.ConnectorStateColor.Unassigned
    else if (isPausedState(connectorState))
      color = Theme.ConnectorStateColor.Paused
    else if (isFailedState(connectorState))
      color = Theme.ConnectorStateColor.Failed
    else if (isRegisteredState(connectorState))
      color = Theme.ConnectorStateColor.Registered
    else
      color = Theme.ConnectorStateColor.Disabled

    return (
      <CircularProgress size={0.50} mode={mode} value={value} color={color} />
    )
  }

  createTaskText() {
    const { state: connectorState, tasks, } = this.props

    if (!isWorkingState(connectorState)) return ''
    else if (tasks.length === 0) return ''
    else {
      const maxTaskCount = tasks.length
      const runningTaskCount = tasks.reduce((acc, task) => {
        if (isRunningTask(task)) return acc + 1
        else return acc
      }, 0)
      return `${runningTaskCount} / ${maxTaskCount}`
    }
  }

  createEnableButton() {
    const { state, } = this.props

    const enableButtonActive = !isWorkingState(state)
    const enableButtonText = (isRegisteredState(state)) ? 'DISABLE' :
      (isDisabledState(state)) ? 'ENABLE' : ''

    const enableButtonDOM = (enableButtonActive) ? (
      <FlatButton onClick={this.handleEnableButtonClick}
                  label={enableButtonText}
                  labelStyle={style.ItemBodyColumn.commandButtonLabel}
                  style={style.ItemBodyColumn.commandButton}
                  secondary />
    ) : null

    return enableButtonDOM
  }


  render() {
    const { name, state, checked, tasks, uptime, } = this.props
    const taskElems = (!tasks) ? [] :
      tasks.reduce((elems, task) => {
        const elem = <ConnectorTask {...task} /> // TODO: key
        const divider = <Divider /> // TODO: key
        return elems.concat([ divider, elem, ])
      }, [])

    return (
      <ListItem disabled
                style={style.ItemBodyColumn.container}
                nestedItems={taskElems}>
        <ListItemColumn style={style.ItemBodyColumn.checkbox}>
          <Checkbox defaultChecked={checked} onCheck={this.handleCheckboxClick} />
        </ListItemColumn>
        <ListItemColumn style={style.ItemBodyColumn.stateIcon}> {this.createStateIcon()} </ListItemColumn>
        <ListItemColumn style={style.ItemBodyColumn.stateText}> {state} </ListItemColumn>
        <ListItemColumn style={style.ItemBodyColumn.taskText}> {this.createTaskText()} </ListItemColumn>
        <ListItemColumn style={style.ItemBodyColumn.name}> {name} </ListItemColumn>
        <ListItemColumn style={style.ItemBodyColumn.uptime}> {uptime} </ListItemColumn>
        <ListItemColumn style={style.ItemBodyColumn.commandButtons}>
          {this.createEnableButton()}
          <FlatButton onClick={this.handleConfigButtonClick}
                      label="config"
                      labelStyle={style.ItemBodyColumn.commandButtonLabel}
                      style={style.ItemBodyColumn.commandButton}
                      primary />
        </ListItemColumn>
        <ListItemLastColumn />
      </ListItem>
    )
  }
}

