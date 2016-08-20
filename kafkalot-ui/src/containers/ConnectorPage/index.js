import React, { PropTypes, } from 'react'
import { Link, } from 'react-router'
import { connect, } from 'react-redux'
import { bindActionCreators, } from 'redux'

import ConnectorList from '../../components/ConnectorPage/ConnectorList'
import ConnectorHeader from '../../components/ConnectorPage/ConnectorHeader'
import Paginator from '../../components/Common/Paginator'
import RemoveDialog from '../../components/ConnectorPage/RemoveDialog'
import { Property as PaginatorProperty, } from '../../reducers/ConnectorReducer/PaginatorState'
import Snackbar from '../../components/Common/ClosableSnackbar'

import { ConnectorProperty, ConnectorListProperty, } from '../../reducers/ConnectorReducer/ConnectorListState'

import ConfigEditor from '../../components/ConnectorPage/ConnectorConfigEditor'
import CreateEditor from '../../components/ConnectorPage/ConnectorCreateEditor'

import { ROOT, CONNECTOR, } from '../../constants/State'
import Actions from '../../actions'
import * as style from './style'

class ConnectorPage extends React.Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    connectors: PropTypes.array.isRequired,
    paginator: PropTypes.object.isRequired,
    filterKeyword: PropTypes.string.isRequired,
    sorter: PropTypes.string.isRequired,
    tableHeaderChecked: PropTypes.bool.isRequired,

    configSchema: PropTypes.object.isRequired,
    configEditor: PropTypes.object.isRequired,
    createEditor: PropTypes.object.isRequired,
    removeDialog: PropTypes.object.isRequired,
    snackbar: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)

    this.handlePageOffsetChange = this.handlePageOffsetChange.bind(this)
  }

  handlePageOffsetChange(newPageOffset) {
    const { actions, } = this.props
    const { changePageOffset, } = actions

    changePageOffset({ [PaginatorProperty.PAGE_OFFSET]: newPageOffset, })
  }

  createSnackbarAndDialogs() {
    const {
      actions, configSchema, configEditor, createEditor, removeDialog, snackbar,
    } = this.props

    /** 3. draw dialogs, snackbar */
    const configEditorDOM = (configEditor.opened) ?
      (<ConfigEditor close={actions.closeConfigEditor}
                     update={actions.updateConfig}
                     validateConnectorConfig={actions.validateConnectorConfig}
                     {...configEditor} {...configSchema} />) : null

    const createEditorDOM = (createEditor.opened) ?
      (<CreateEditor close={actions.closeCreateEditor}
                     create={actions.createConnector}
                     changeSelectedConnectorClass={actions.changeSelectedConnectorClass}
                     validateConnectorConfig={actions.validateConnectorConfig}
                     {...createEditor} {...configSchema} />) : null

    const removeDialogDOM = (removeDialog.opened) ?
      (<RemoveDialog removeConnector={actions.removeConnector}
                     closeRemoveDialog={actions.closeRemoveDialog}
                     {...removeDialog} />) : null

    const snackbarDOM = (<Snackbar {...snackbar} closeSnackbar={actions.closeSnackbar} />)

    return (
      <div>
        {configEditorDOM}
        {createEditorDOM}
        {removeDialogDOM}
        {snackbarDOM}
      </div>
    )
  }

  render() {
    const {
      actions, connectors, paginator, filterKeyword, sorter, tableHeaderChecked,
    } = this.props

    const {
      itemCountPerPage, pageOffset, itemOffset,
    } = paginator

    /** 1. filter connectors */
    const filtered = connectors.filter(connector => {
      if (filterKeyword === '') return true
      else if (connector[ConnectorProperty.CHECKED]) /** do not exclude checked connector to support incremental search */
        return true
      else {
        const searchArea = JSON.stringify(connector)
        console.log(searchArea, filterKeyword)
        console.log(searchArea.includes(filterKeyword))
        return (searchArea.includes(filterKeyword))
      }
    })

    /** 2. select connectors to be curated */
    const sliced = filtered.slice(itemOffset, itemOffset + itemCountPerPage)

    return (
      <div>
        <ConnectorHeader sorter={sorter}
                         connectors={filtered}
                         filterKeyword={filterKeyword}
                         {...paginator}


                         changeFilterKeyword={actions.changeFilterKeyword}
                         changeSorter={actions.changeSorter}
                         changePageItemCount={actions.changePageItemCount}

                         startConnector={actions.startConnector}
                         stopConnector={actions.stopConnector}
                         restartConnector={actions.restartConnector}
                         pauseConnector={actions.pauseConnector}
                         resumeConnector={actions.resumeConnector}
                         openCreateEditor={actions.openCreateEditor}
                         openRemoveDialog={actions.openRemoveDialog} />

        <ConnectorList connectors={sliced}
                       {...paginator}

                       actions={actions}
                       toggleCurrentPageCheckboxes={actions.toggleCurrentPageCheckboxes}
                       tableHeaderChecked={tableHeaderChecked} />

        <div className="center" style={style.paginator}>
          <Paginator itemCountPerPage={itemCountPerPage}
                     currentPageOffset={pageOffset}
                     currentItemOffset={itemOffset}
                     totalItemCount={filtered.length}
                     handler={this.handlePageOffsetChange} />
        </div>
        {this.createSnackbarAndDialogs()}
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    connectors: state[ROOT.CONNECTOR][CONNECTOR.CONNECTOR_LIST][ConnectorListProperty.CONNECTORS],
    filterKeyword: state[ROOT.CONNECTOR][CONNECTOR.CONNECTOR_LIST][ConnectorListProperty.FILTER_KEYWORD],
    sorter: state[ROOT.CONNECTOR][CONNECTOR.CONNECTOR_LIST][ConnectorListProperty.SORTER],
    tableHeaderChecked: state[ROOT.CONNECTOR][CONNECTOR.CONNECTOR_LIST][ConnectorListProperty.TABLE_HEADER_CHECKED],
    paginator: state[ROOT.CONNECTOR][CONNECTOR.PAGINATOR],

    snackbar: state[ROOT.CONNECTOR][CONNECTOR.SNACKBAR],
    configSchema: state[ROOT.CONNECTOR][CONNECTOR.CONFIG_SCHEMA],
    configEditor: state[ROOT.CONNECTOR][CONNECTOR.CONFIG_EDITOR],
    createEditor: state[ROOT.CONNECTOR][CONNECTOR.CREATE_EDITOR],
    removeDialog: state[ROOT.CONNECTOR][CONNECTOR.REMOVE_DIALOG],
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Actions[ROOT.CONNECTOR], dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectorPage)

