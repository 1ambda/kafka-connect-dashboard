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
import { Payload as StorageSelectorPayload, } from '../../../reducers/ConnectorReducer/StorageSelectorState'
import * as URL from '../../../middlewares/url'
import * as Page from '../../../constants/page'

export default class ConnectorHeader extends React.Component {
  static propTypes = {
    sortingStrategy: PropTypes.object.isRequired,
    storageSelector: PropTypes.object.isRequired,
    connectors: PropTypes.array.isRequired,
    openEditorDialogToCreate: PropTypes.func.isRequired,
    filterConnector: PropTypes.func.isRequired,
    filterKeyword: PropTypes.string.isRequired,
    sortConnector: PropTypes.func.isRequired,
    changeStorage: PropTypes.func.isRequired,
  }

  static createSummaryDOM(connectors, createButton) {
    const totalJobCount = connectors.length
    const runningJobCount = connectors.filter(connector => isRunning(connector)).length

    return (
      <div style={style.summaryStorage}>
        <span>Running</span>
        <span style={style.summaryRunningConnector}> {runningJobCount}</span>
        <span> of {totalJobCount}</span>
        <span style={style.buttonStorage}> {createButton} </span>
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

  handleStorageSelectorChange(storage) {
    const { changeStorage, } = this.props
    const payload = { [StorageSelectorPayload.STORAGE]: storage, }

     changeStorage(payload)
  }

  render() {
    const {
      sortingStrategy, storageSelector,
      connectors, filterKeyword, } = this.props

    /** 1. create `CREATE` button */
    const createButton = (
      <RaisedButton labelStyle={style.buttonLabel}
                    secondary label={"CREATE"}
                    onTouchTap={this.handleCreateJob.bind(this)} />)

    /** 2. draw summary */
    const summaryWithPopover = ConnectorHeader.createSummaryDOM(connectors, createButton)

    /** 3. filter label */
    const filterLabel = (filterKeyword !== '') ?
      `filtered by '${filterKeyword}'` : 'Insert Filter'

    return (
      <div>
        <div style={style.title}>
          {Page.ConnectorPageTitle}
        </div>
        <div>
          <Filter handler={this.handleFilterChange.bind(this)}
                  floatingLabel={filterLabel}
                  style={style.filterInput} />
          <Selector handler={this.handleStorageSelectorChange.bind(this)}
                    style={style.storageSelector}
                    labelStyle={style.storageSelectorLabel}
                    floatingLabel="Storage"
                    floatingLabelStyle={style.selectorFloatingLabel}
                    strategies={storageSelector.availableStorages}
                    currentStrategy={storageSelector.selectedStorage} />
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
