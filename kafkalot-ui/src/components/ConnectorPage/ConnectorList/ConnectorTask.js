import React, { PropTypes, } from 'react'

import CircularProgress from 'material-ui/CircularProgress'
import FlatButton from 'material-ui/FlatButton'
import { grey400, darkBlack, lightBlack, } from 'material-ui/styles/colors'
import { List, ListItem, } from 'material-ui/List'

import { ListItemColumn, ListItemLastColumn, } from './ListItemColumn'

import {
  isRunningState, isUnassignedState, isPausedState,
  isFailedState, isRegisteredState,
} from '../../../reducers/ConnectorReducer/ConnectorListState'

import * as style from './style'
import * as Theme from '../../../constants/Theme'

export class ConnectorTask extends React.Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    worker_id: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
  }

  static createStateIcon(taskState) {
    const isRunning = isRunningState(taskState)
    const mode = (isRunning) ? 'indeterminate' : 'determinate'
    const value = (isRunning) ? 0 : 100
    let color = Theme.ConnectorStateColor.Disabled

    if (isRunningState(taskState))
      color = Theme.ConnectorStateColor.Running
    else if (isUnassignedState(taskState))
      color = Theme.ConnectorStateColor.Unassigned
    else if (isPausedState(taskState))
      color = Theme.ConnectorStateColor.Paused
    else if (isFailedState(taskState))
      color = Theme.ConnectorStateColor.Failed
    else if (isRegisteredState(taskState))
      color = Theme.ConnectorStateColor.Registered
    else
      color = Theme.ConnectorStateColor.Disabled

    return (
      <CircularProgress size={0.4} color={color}
                        mode={mode} value={value} />
    )
  }

  render() {
    const { id, worker_id, state, } = this.props

    const stateIcon = ConnectorTask.createStateIcon(state)
    const traceButtonActive = isFailedState(state)

    // TODO button color

    return (
      <ListItem key={id} disabled style={style.TaskColumn.container}>
        <ListItemColumn style={style.TaskColumn.taskId}>{id}</ListItemColumn>
        <ListItemColumn style={style.TaskColumn.stateIcon}>{stateIcon}</ListItemColumn>
        <ListItemColumn style={style.TaskColumn.stateText}>{state}</ListItemColumn>
        <ListItemColumn style={style.TaskColumn.workerId}>{worker_id}</ListItemColumn>
        <ListItemColumn style={style.TaskColumn.commandButtons}>
          <FlatButton label="restart"
                      labelStyle={style.ItemBodyColumn.commandButtonLabel}
                      style={style.ItemBodyColumn.commandButton} secondary />
          <FlatButton label="trace" disabled={!traceButtonActive}
                      labelStyle={style.ItemBodyColumn.commandButtonLabel}
                      style={style.TaskColumn.traceButton} />
        </ListItemColumn>
        <ListItemLastColumn />
      </ListItem>
    )
  }
}