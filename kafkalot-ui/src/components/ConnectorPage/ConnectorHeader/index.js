import React, { PropTypes, } from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import {Popover, PopoverAnimationVertical,} from 'material-ui/Popover'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'

import { Payload as ConnectorListPayload, } from '../../../reducers/ConnectorReducer/ConnectorListState'
import { AvailableSorters, } from '../../../constants/Sorter'
import * as Page from '../../../constants/Page'

import { ConnectorCommand, } from '../../../constants/ConnectorCommand'

import Filter from '../../Common/Filter'
import Selector from '../../Common/Selector'
import * as style from './style'

export default class ConnectorHeader extends React.Component {
  static propTypes = {
    connectors: PropTypes.array.isRequired,
    startConnector: PropTypes.func.isRequired,
    stopConnector: PropTypes.func.isRequired,
    restartConnector: PropTypes.func.isRequired,
    pauseConnector: PropTypes.func.isRequired,
    resumeConnector: PropTypes.func.isRequired,
    openCreateEditor: PropTypes.func.isRequired,
    openRemoveDialog: PropTypes.func.isRequired,

    sorter: PropTypes.string.isRequired,
    changeSorter: PropTypes.func.isRequired,
    changeFilterKeyword: PropTypes.func.isRequired,
    filterKeyword: PropTypes.string.isRequired,
  }

  static createSelectorDOM(filterHandler, filterLabel,
                           sorterHandler, sorter, availableSorters) {

    return (
      <div>
        <Filter handler={filterHandler}
                floatingLabel={filterLabel}
                style={style.filterInput} />
        <Selector handler={sorterHandler}
                  style={style.selector}
                  labelStyle={style.selectorLabel}
                  floatingLabel="Sort by"
                  floatingLabelStyle={style.selectorFloatingLabel}
                  strategies={availableSorters}
                  currentStrategy={sorter} />
      </div>
    )
  }

  constructor(props) {
    super(props)

    this.state = { currentCommand: ConnectorCommand.START, }

    this.handleFilterChange = this.handleFilterChange.bind(this)
    this.handleSorterChange = this.handleSorterChange.bind(this)
    this.handleCreate = this.handleCreate.bind(this)
    
    this.handleCommandChange = this.handleCommandChange.bind(this)
    this.handleCommandExecute = this.handleCommandExecute.bind(this)
  }

  handleCommandChange(event, key, payload) {
    this.setState({ currentCommand: payload,}) // eslint-disable-line react/no-set-state
  }

  handleCommandExecute() {
    const { 
      startConnector, 
      stopConnector,
      restartConnector,
      pauseConnector,
      resumeConnector, 
    } = this.props
    const { currentCommand, } = this.state

    switch (currentCommand) {
      case ConnectorCommand.START: startConnector(); break
      case ConnectorCommand.STOP: stopConnector(); break
      case ConnectorCommand.RESTART: restartConnector(); break
      case ConnectorCommand.PAUSE: pauseConnector(); break
      case ConnectorCommand.RESUME: resumeConnector();  break
      default:
    }
  }
  
  handleCreate() {
    const { openCreateEditor, } = this.props
    openCreateEditor()
  }

  handleFilterChange(filterKeyword) {
    const { changeFilterKeyword, } = this.props
    const payload = { [ConnectorListPayload.FILTER_KEYWORD]: filterKeyword, }
    changeFilterKeyword(payload)
  }

  handleSorterChange(strategy) {
    const { changeSorter, } = this.props

    changeSorter({
      [ConnectorListPayload.SORTER]: strategy,
    })
  }

  createCommandButtonsDOM() {
    const { openRemoveDialog, } = this.props
    const { currentCommand, } = this.state

    return (
      <div style={style.CommandButton.Container}>
        <SelectField value={currentCommand} style={style.CommandButton.Selector}
                     onChange={this.handleCommandChange}>
          <MenuItem value={ConnectorCommand.START} primaryText={ConnectorCommand.START} />
          <MenuItem value={ConnectorCommand.STOP} primaryText={ConnectorCommand.STOP} />
          <MenuItem value={ConnectorCommand.RESTART} primaryText={ConnectorCommand.RESTART} />
          <MenuItem value={ConnectorCommand.PAUSE} primaryText={ConnectorCommand.PAUSE} />
          <MenuItem value={ConnectorCommand.RESUME} primaryText={ConnectorCommand.RESUME} />
        </SelectField>

        <RaisedButton style={style.CommandButton.ExecuteButton}
                      backgroundColor={style.CommandButton.ExecuteButtonColor}
                      labelStyle={style.CommandButton.ButtonLabel} label={"EXECUTE"}
                      onTouchTap={this.handleCommandExecute} />

        <RaisedButton style={style.CommandButton.RightButton} secondary
                      labelStyle={style.CommandButton.ButtonLabel} label={"REMOVE"}
                      onTouchTap={openRemoveDialog} />

        <RaisedButton style={style.CommandButton.RightButton} primary
                      labelStyle={style.CommandButton.ButtonLabel} label={"CREATE"}
                      onTouchTap={this.handleCreate} />

        <div style={{clear: 'both',}}></div>

      </div>
    )
  }

  render() {
    const { sorter, filterKeyword, } = this.props

    /** 1. command buttons */
    const commandButtonsDOM = this.createCommandButtonsDOM()

    /** 2. filter, sorter row */
    const filterLabel = (filterKeyword !== '') ? `filtered by '${filterKeyword}'` : 'Insert Filter'
    const selectorDOM = ConnectorHeader.createSelectorDOM(
      this.handleFilterChange, filterLabel,
      this.handleSorterChange, sorter, AvailableSorters
    )

    return (
      <div>
        <div style={style.title}> {Page.ConnectorPageTitle} </div>
        {selectorDOM}
        {commandButtonsDOM}
      </div>
    )
  }
}
