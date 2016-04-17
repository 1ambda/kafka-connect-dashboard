import React, { PropTypes, } from 'react'
import RaisedButton from 'material-ui/lib/raised-button'
import Popover from 'material-ui/lib/popover/popover'
import PopoverAnimationFromTop from 'material-ui/lib/popover/popover-animation-from-top'
import DropDownMenu from 'material-ui/lib/DropDownMenu'
import MenuItem from 'material-ui/lib/menus/menu-item'

import Filter from '../../Common/Filter'
import Selector from '../../Common/Selector'
import * as style from './style'

import * as JobSortingStrategies from '../../../reducers/ConnectorReducer/SorterState'
import { ITEM_PROPERTY, isRunning, } from '../../../reducers/ConnectorReducer/ItemState'
import * as URL from '../../../middlewares/url'
import * as Page from '../../../constants/page'

export default class ConnectorHeader extends React.Component {
  static propTypes = {
    sortingStrategy: PropTypes.object.isRequired,
    containerSelector: PropTypes.object.isRequired,
    connectors: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired,
  }

  static createSummaryDOM(connectors, createButton) {
    const totalJobCount = connectors.length
    const runningJobCount = connectors.filter(connector => isRunning(connector)).length

    return (
      <div style={style.summaryContainer}>
        <span>Running</span>
        <span style={style.summaryRunningConnector}> {runningJobCount}</span>
        <span> of {totalJobCount} Connectors</span>
        <span style={style.buttonContainer}> {createButton} </span>
      </div>
    )
  }

  constructor(props) {
    super(props)
  }

  handleCreateJob() {
    const { actions, } = this.props

    actions.openEditorDialogToCreate()
  }

  handleFilterChange(filterKeyword) {
    const { actions, } = this.props
    const payload = { filterKeyword, }

    actions.filter(payload)
  }

  handleSorterChange(strategy) {
    const { actions, } = this.props
    const payload = { strategy, }

    actions.sort(payload)
  }

  handleContainerSelectorChange(container) {
    const { actions, } = this.props
    const payload = { container, }

     actions.changeContainer(payload)
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
