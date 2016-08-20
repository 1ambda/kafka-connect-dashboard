import React, { PropTypes, } from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import {Popover, PopoverAnimationVertical,} from 'material-ui/Popover'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'

import { Payload as ConnectorListPayload, ConnectorProperty, } from '../../../reducers/ConnectorReducer/ConnectorListState'
import { Property as PaginatorProperty, } from '../../../reducers/ConnectorReducer/PaginatorState'
import { AvailableSorters, } from '../../../constants/Sorter'
import * as Page from '../../../constants/Page'

import { ConnectorCommand, } from '../../../constants/ConnectorCommand'

import Filter from '../../Common/Filter'
import Selector from '../../Common/Selector'
import * as style from './style'

export default class ConnectorHeader extends React.Component {
  static propTypes = {
    connectors: PropTypes.array.isRequired,
    sorter: PropTypes.string.isRequired,
    filterKeyword: PropTypes.string.isRequired,
    itemCountPerPage: PropTypes.number.isRequired,
    availableItemCountsPerPage: PropTypes.array.isRequired,

    changeSorter: PropTypes.func.isRequired,
    changeFilterKeyword: PropTypes.func.isRequired,
    changePageItemCount: PropTypes.func.isRequired,

    startConnector: PropTypes.func.isRequired,
    stopConnector: PropTypes.func.isRequired,
    restartConnector: PropTypes.func.isRequired,
    pauseConnector: PropTypes.func.isRequired,
    resumeConnector: PropTypes.func.isRequired,
    openCreateEditor: PropTypes.func.isRequired,
    openRemoveDialog: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      currentCommand: ConnectorCommand.START,
    }

    this.handleFilterChange = this.handleFilterChange.bind(this)
    this.handleSorterChange = this.handleSorterChange.bind(this)
    this.handlePageItemCountChange = this.handlePageItemCountChange.bind(this)
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

    changeSorter({ [ConnectorListPayload.SORTER]: strategy, })
  }

  handlePageItemCountChange(event, key, payload) {
    const { changePageItemCount, } = this.props

    changePageItemCount({ [PaginatorProperty.ITEM_COUNT_PER_PAGE]: payload, })
  }

  createCommandButtonsDOM() {
    const { openRemoveDialog, } = this.props
    const { currentCommand, } = this.state

    return (
      <div style={style.CommandButton.Container}>
        <SelectField style={style.CommandButton.Selector}
                     floatingLabelText="Command"
                     value={currentCommand}
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

        <div style={{clear: 'both',}} />

      </div>
    )
  }

  createSelectorDOM() {
    const {
      sorter, filterKeyword, connectors,
      itemCountPerPage, availableItemCountsPerPage,
    } = this.props

    const checkedConnectorCount = connectors.filter(c => c[ConnectorProperty.CHECKED]).length

    const filterLabel = (filterKeyword !== ``) ?
      `Filter: ${filterKeyword} (${checkedConnectorCount} selected)` :
      `Insert filter (${checkedConnectorCount} selected)`

    const itemCountPerPageMenuItems = availableItemCountsPerPage.reduce((acc, i) => {
      return acc.concat([
        <MenuItem value={i} primaryText={i} key={i} />,
      ])
    }, [])

    return (
      <div>
        <Filter handler={this.handleFilterChange}
                floatingLabel={filterLabel}
                style={style.Selector.FilterInput} />

        <SelectField style={style.Selector.PageItemCountSelector}
                     floatingLabelText="Item Count"
                     floatingLabelStyle={style.Selector.SelectorFloatingLabel}
                     labelStyle={style.Selector.SelectorLabel}
                     value={itemCountPerPage}
                     onChange={this.handlePageItemCountChange}>
          {itemCountPerPageMenuItems}
        </SelectField>

        <Selector handler={this.handleSorterChange}
                  style={style.Selector.ConnectorSelector}
                  labelStyle={style.Selector.SelectorLabel}
                  floatingLabel="Sort by"
                  floatingLabelStyle={style.Selector.SelectorFloatingLabel}
                  strategies={AvailableSorters}
                  currentStrategy={sorter} />

        <div style={{clear: 'both',}} />
      </div>
    )
  }

  render() {
    /** filter, paginator count selector, sorter, */
    const selectorDOM = this.createSelectorDOM()

    /** command buttons */
    const commandButtonsDOM = this.createCommandButtonsDOM()

    return (
      <div>
        <div style={style.title}> {Page.ConnectorPageTitle} </div>
        {selectorDOM}
        {commandButtonsDOM}
      </div>
    )
  }
}
