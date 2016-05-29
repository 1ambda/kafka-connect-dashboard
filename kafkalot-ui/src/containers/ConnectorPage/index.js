import React, { PropTypes, } from 'react'
import { Link, } from 'react-router'
import { connect, } from 'react-redux'
import { bindActionCreators, } from 'redux'

import ConnectorList from '../../components/ConnectorPage/ConnectorList'
import ConnectorHeader from '../../components/ConnectorPage/ConnectorHeader'
import Paginator from '../../components/Common/Paginator'
import EditorDialog from '../../components/ConnectorPage/EditorDialog'
import { EDITOR_DIALOG_MODE, } from '../../reducers/ConnectorReducer/EditorDialogState'
import ConfirmDialog from '../../components/ConnectorPage/ConfirmDialog'
import { CONFIRM_DIALOG_MODE, } from '../../reducers/ConnectorReducer/ConfirmDialogState'
import { Payload as PaginatorPayload, } from '../../reducers/ConnectorReducer/PaginatorState'
import Snackbar, { CLOSABLE_SNACKBAR_MODE, } from '../../components/Common/ClosableSnackbar'

import { ROOT, CONNECTOR, } from '../../constants/state'
import Actions from '../../actions'
import * as style from './style'

class ConnectorPage extends React.Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    connectors: PropTypes.array.isRequired,
    paginator: PropTypes.object.isRequired,
    filterKeyword: PropTypes.string.isRequired,
    editorDialog: PropTypes.object.isRequired,
    confirmDialog: PropTypes.object.isRequired,
    snackbar: PropTypes.object.isRequired,
    sortingStrategy: PropTypes.object.isRequired,
    storageSelector: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)

    this.handlePageOffsetChange  = this.handlePageOffsetChange.bind(this)
  }

  handlePageOffsetChange(newPageOffset) {
    const { actions, } = this.props
    const payload = { [PaginatorPayload.NEW_PAGE_OFFSET]: newPageOffset, }

    actions.changePageOffset(payload)
  }

  render() {
    const {
      actions, connectors, paginator, filterKeyword,
      sortingStrategy, storageSelector,
      editorDialog, confirmDialog, snackbar, } = this.props

    const { itemCountPerPage, currentPageOffset, currentItemOffset, } = paginator

    /** 1. filter connectors */
    const filtered = connectors.filter(connector => {
      const searchArea = JSON.stringify(connector)
      return (searchArea.includes(filterKeyword))
    })

    /** 2. select connectors to be curated */
    const sliced = filtered.slice(currentItemOffset, currentItemOffset + itemCountPerPage)

    /** 3. draw dialogs, snackbar */
    const editorDialogDOM = (EDITOR_DIALOG_MODE.CLOSE !== editorDialog.dialogMode) ?
      (<EditorDialog closeEditorDialog={actions.closeEditorDialog}
                     createConnector={actions.create}
                     updateConnector={actions.update}
                     {...editorDialog} />) : null

    const confirmDialogDOM = (CONFIRM_DIALOG_MODE.CLOSE !== confirmDialog.dialogMode) ?
      (<ConfirmDialog removeConnector={actions.remove}
                      closeConfirmDialog={actions.closeConfirmDialog}
                      {...confirmDialog} />) : null

    const snackbarDOM = (CLOSABLE_SNACKBAR_MODE.CLOSE !== snackbar.snackbarMode) ?
      (<Snackbar {...snackbar} closeHandler={actions.closeSnackbar} />) : null

    return (
      <div>
        <ConnectorHeader sortingStrategy={sortingStrategy}
                         storageSelector={storageSelector}
                         connectors={filtered}
                         openEditorDialogToCreate={actions.openEditorDialogToCreate}
                         filterConnector={actions.filter}
                         filterKeyword={filterKeyword}
                         sortConnector={actions.sort}
                         changeStorage={actions.changeStorage}
          />
        <ConnectorList connectors={sliced} actions={actions} />
        <div className="center" style={style.paginator}>
          <Paginator itemCountPerPage={itemCountPerPage}
                     currentPageOffset={currentPageOffset}
                     currentItemOffset={currentItemOffset}
                     totalItemCount={filtered.length}
                     handler={this.handlePageOffsetChange} />
        </div>
        {editorDialogDOM}
        {confirmDialogDOM}
        {snackbarDOM}
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    connectors: state[ROOT.CONNECTOR][CONNECTOR.ITEMS],
    paginator: state[ROOT.CONNECTOR][CONNECTOR.PAGINATOR],
    filterKeyword: state[ROOT.CONNECTOR][CONNECTOR.FILTER],
    editorDialog: state[ROOT.CONNECTOR][CONNECTOR.EDITOR_DIALOG],
    confirmDialog: state[ROOT.CONNECTOR][CONNECTOR.CONFIRM_DIALOG],
    snackbar: state[ROOT.CONNECTOR][CONNECTOR.SNACKBAR],
    sortingStrategy: state[ROOT.CONNECTOR][CONNECTOR.SORTER],
    storageSelector: state[ROOT.CONNECTOR][CONNECTOR.STORAGE_SELECTOR],
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

