import React, { PropTypes, } from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import {Popover, PopoverAnimationVertical,} from 'material-ui/Popover'

import { Payload as ConnectorListPayload, } from '../../../reducers/ConnectorReducer/ConnectorListState'
import { AvailableSorters, } from '../../../constants/Sorter'
import * as Page from '../../../constants/Page'

import Filter from '../../Common/Filter'
import Selector from '../../Common/Selector'
import * as style from './style'

export default class ConnectorHeader extends React.Component {
  static propTypes = {
    connectors: PropTypes.array.isRequired,
    startConnector: PropTypes.func.isRequired,
    stopConnector: PropTypes.func.isRequired,
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

    this.handleFilterChange = this.handleFilterChange.bind(this)
    this.handleSorterChange = this.handleSorterChange.bind(this)
    this.handleCreate = this.handleCreate.bind(this)
    this.handleRemove = this.handleRemove.bind(this)
    this.handleStart = this.handleStart.bind(this)
    this.handleStop = this.handleStop.bind(this)
  }

  handleStart() {
    const { startConnector, } = this.props
    startConnector()
  }
  
  handleStop() {
    const { stopConnector, } = this.props
    stopConnector()
  }
  
  handleRemove() {
    
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

    return (
      <div style={style.CommandButton.Container}>

        <RaisedButton style={style.CommandButton.StartStopButton}
                      backgroundColor={style.CommandButton.StartStopButtonColor}
                      labelStyle={style.CommandButton.ButotnLabel} label={"START"}
                      onTouchTap={this.handleStart} />

        <RaisedButton style={style.CommandButton.StartStopButton} secondary
                      labelStyle={style.CommandButton.ButotnLabel} label={"STOP"}
                      onTouchTap={this.handleStop} />

        <RaisedButton style={style.CommandButton.RightButton} secondary
                      labelStyle={style.CommandButton.ButotnLabel} label={"REMOVE"}
                      onTouchTap={openRemoveDialog} />

        <RaisedButton style={style.CommandButton.RightButton} primary
                      labelStyle={style.CommandButton.ButotnLabel} label={"CREATE"}
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
