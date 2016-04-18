import React, { PropTypes, } from 'react'
import RaisedButton from 'material-ui/lib/raised-button'
import Popover from 'material-ui/lib/popover/popover'
import PopoverAnimationFromTop from 'material-ui/lib/popover/popover-animation-from-top'
import DropDownMenu from 'material-ui/lib/DropDownMenu'
import MenuItem from 'material-ui/lib/menus/menu-item'

import Filter from '../../Common/Filter'
import Selector from '../../Common/Selector'
import * as style from './style'

import { isRunning, } from '../../../reducers/ConnectorReducer/ItemState'
import { Payload as SorterPayload, } from '../../../reducers/ConnectorReducer/SorterState'
import { Payload as FilterPayload, } from '../../../reducers/ConnectorReducer/FilterState'
import { Payload as ContainerSelectorPayload, } from '../../../reducers/ConnectorReducer/ContainerSelectorState'
import * as URL from '../../../middlewares/url'
import * as Page from '../../../constants/page'

export default class ConnectorHeader extends React.Component {
  static propTypes = {
    sortingStrategy: PropTypes.object.isRequired,
    containerSelector: PropTypes.object.isRequired,
    connectors: PropTypes.array.isRequired,
    openEditorDialogToCreate: PropTypes.func.isRequired,
    filterConnector: PropTypes.func.isRequired,
    sortConnector: PropTypes.func.isRequired,
    changeContainer: PropTypes.func.isRequired,
  }

  static createSummaryDOM(connectors, createButton) {
    const totalJobCount = connectors.length
    const runningJobCount = connectors.filter(connector => isRunning(connector)).length

    return (
      <div style={style.summaryContainer}>
        <span>Running</span>
        <span style={style.summaryRunningConnector}> {runningJobCount}</span>
        <span> of {totalJobCount}</span>
        <span style={style.buttonContainer}> {createButton} </span>
      </div>
    )
  }

  constructor(props) {
    super(props)
  }

  handleCreateJob() {
    const { openEditorDialogToCreate, } = this.props
    openEditorDialogToCreate()
  }

  handleFilterChange(filterKeyword) {
    const { filterConnector, } = this.props
    const payload = { [FilterPayload.FILTER_KEYWORD]: filterKeyword, }
    filterConnector(payload)
  }

  handleSorterChange(strategy) {
    const { sortConnector, } = this.props
    const payload = { [SorterPayload.STRATEGY]: strategy, }

    sortConnector(payload)
  }

  handleContainerSelectorChange(container) {
    const { changeContainer, } = this.props
    const payload = { [ContainerSelectorPayload.CONTAINER]: container, }

     changeContainer(payload)
  }

  render() {
    const { sortingStrategy, containerSelector, connectors, } = this.props

    /** 1. create `CREATE` button */
    const createButton = (
      <RaisedButton labelStyle={style.buttonLabel}
                    secondary label={"CREATE"}
                    onTouchTap={this.handleCreateJob.bind(this)} />)

    /** 2. draw summary */
    const summaryWithPopover = ConnectorHeader.createSummaryDOM(connectors, createButton)

    return (
      <div>
        <div style={style.title}>
          {Page.ConnectorPageTitle}
        </div>
        <div>
          <Filter handler={this.handleFilterChange.bind(this)}
                  floatingLabel="Insert Filter"
                  style={style.filterInput} />
          <Selector handler={this.handleContainerSelectorChange.bind(this)}
                    style={style.containerSelector}
                    labelStyle={style.containerSelectorLabel}
                    floatingLabel="Container"
                    floatingLabelStyle={style.selectorFloatingLabel}
                    strategies={containerSelector.availableContainers}
                    currentStrategy={containerSelector.selectedContainer} />
          <Selector handler={this.handleSorterChange.bind(this)}
                  style={style.selector}
                  labelStyle={style.selectorLabel}
                  floatingLabel="Sort by"
                  floatingLabelStyle={style.selectorFloatingLabel}
                  strategies={sortingStrategy.availableStrategies}
                  currentStrategy={sortingStrategy.selectedStrategy} />
        </div>
        {summaryWithPopover}
      </div>
    )
  }
}
