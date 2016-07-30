import React, { PropTypes, } from 'react'

import CircularProgress from 'material-ui/CircularProgress'
import FlatButton from 'material-ui/FlatButton'
import Popover from 'material-ui/Popover'
import TextField from 'material-ui/TextField'
import { grey400, darkBlack, lightBlack, } from 'material-ui/styles/colors'
import { List, ListItem, } from 'material-ui/List'

import { ListItemColumn, ListItemLastColumn, } from './ListItemColumn'

import {
  isRunningState, isUnassignedState, isPausedState,
  isFailedState, isRegisteredState,
  ConnectorProperty, ConnectorTaskProperty,
} from '../../../reducers/ConnectorReducer/ConnectorListState'

import * as style from './style'
import * as Theme from '../../../constants/Theme'

export class ConnectorTask extends React.Component {
  static propTypes = {
    connectorName: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    worker_id: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
    trace: PropTypes.string, /** optional */

    restartTask: PropTypes.func.isRequired,
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

  constructor(props) {
    super(props)

    this.state = { tracePopoverOpened: false, }

    this.handleRestartButtonClicked = this.handleRestartButtonClicked.bind(this)
    this.handleTraceButtonClicked = this.handleTraceButtonClicked.bind(this)
    this.handleTracePopoverClose = this.handleTracePopoverClose.bind(this)
  }

  handleRestartButtonClicked() {
    const { connectorName, id, restartTask, } = this.props

    restartTask({
      [ConnectorProperty.NAME]: connectorName,
      [ConnectorTaskProperty.ID]: id,
    })
  }

  handleTraceButtonClicked(event) {
    event.preventDefault()

    this.setState({
      tracePopoverOpened: true,
      tracePopoverOpenedAnchorEl: event.currentTarget,
    })
  }

  handleTracePopoverClose() {
    this.setState({ tracePopoverOpened: false, })
  }

  render() {
    const { id, worker_id, state, trace, } = this.props
    const { tracePopoverOpened, tracePopoverOpenedAnchorEl, } = this.state

    const stateIcon = ConnectorTask.createStateIcon(state)
    const traceButtonActive = (trace && trace.length > 0)

    return (
      <ListItem key={id} disabled style={style.TaskColumn.container}>
        <ListItemColumn style={style.TaskColumn.taskId}>{id}</ListItemColumn>
        <ListItemColumn style={style.TaskColumn.stateIcon}>{stateIcon}</ListItemColumn>
        <ListItemColumn style={style.TaskColumn.stateText}>{state}</ListItemColumn>
        <ListItemColumn style={style.TaskColumn.workerId}>{worker_id}</ListItemColumn>
        <ListItemColumn style={style.TaskColumn.commandButtons}>
          <FlatButton onClick={this.handleRestartButtonClicked}
                      label="restart" labelStyle={style.ItemBodyColumn.commandButtonLabel}
                      style={style.ItemBodyColumn.commandButton} secondary />
          <FlatButton onClick={this.handleTraceButtonClicked}
                      disabled={!traceButtonActive}
                      label="trace" labelStyle={style.ItemBodyColumn.commandButtonLabel}
                      style={style.TaskColumn.traceButton} />
          <Popover
            open={tracePopoverOpened}
            anchorEl={tracePopoverOpenedAnchorEl}
            anchorOrigin={{horizontal: 'left', vertical: 'bottom',}}
            targetOrigin={{horizontal: 'left', vertical: 'top',}}
            onRequestClose={this.handleTracePopoverClose}
          >
            <div style={style.TaskTracePopover.contentContainer}>
              <TextField value={trace} multiLine />
            </div>
          </Popover>
        </ListItemColumn>
        <ListItemLastColumn />
      </ListItem>
    )
  }
}