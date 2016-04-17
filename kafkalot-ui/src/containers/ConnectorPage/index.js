import React, { PropTypes, } from 'react'
import { Link, } from 'react-router'
import { connect, } from 'react-redux'
import { bindActionCreators, } from 'redux'

import ConnectorList from '../../components/ConnectorPage/ConnectorList'
import ConnectorHeader from '../../components/ConnectorPage/ConnectorHeader'
import Paginator from '../../components/Common/Paginator'
import EditorDialog, { EDITOR_DIALOG_MODE, } from '../../components/Common/EditorDialog'
import ConfirmDialog, { CONFIRM_DIALOG_MODE, } from '../../components/Common/ConfirmDialog'
import Snackbar, { CLOSABLE_SNACKBAR_MODE, } from '../../components/Common/ClosableSnackbar'

import { ITEM_PROPERTY, } from '../../reducers/ConnectorReducer/ItemState'
import { REDUCER_STATE_PROPERTY, } from '../../constants/state'
import { CONNECTOR_STATE_PROPERTY, } from '../../reducers/ConnectorReducer'

import Actions, { ACTION_SELECTOR, } from '../../actions'
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
    containerSelector: PropTypes.object.isRequired,
  }

  handlePageOffsetChange(newPageOffset) {
    const { actions, } = this.props
    const payload = { newPageOffset, }
    actions.changePageOffset(payload)
  }

  render() {
    const {
      actions, connectors, paginator, filterKeyword,
      sortingStrategy, containerSelector,
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
      (<EditorDialog {...editorDialog} actions={actions} />) : null

    const confirmDialogDOM = (CONFIRM_DIALOG_MODE.CLOSE !== confirmDialog.dialogMode) ?
      (<ConfirmDialog {...confirmDialog} actions={actions} />) : null

    const snackbarDOM = (CLOSABLE_SNACKBAR_MODE.CLOSE !== snackbar.snackbarMode) ?
      (<Snackbar {...snackbar} closeHandler={actions.closeSnackbar} />) : null

    return (
      <div>
        <ConnectorHeader sortingStrategy={sortingStrategy}
                         containerSelector={containerSelector}
                         connectors={filtered}
                         actions={actions} />
        <ConnectorList connectors={sliced} actions={actions} />
        <div className="center" style={style.paginator}>
          <Paginator itemCountPerPage={itemCountPerPage}
                     currentPageOffset={currentPageOffset}
                     currentItemOffset={currentItemOffset}
                     totalItemCount={filtered.length}
                     handler={this.handlePageOffsetChange.bind(this)} />
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
    connectors: state[REDUCER_STATE_PROPERTY.CONNECTOR][CONNECTOR_STATE_PROPERTY.ITEMS],
    paginator: state[REDUCER_STATE_PROPERTY.CONNECTOR][CONNECTOR_STATE_PROPERTY.PAGINATOR],
    filterKeyword: state[REDUCER_STATE_PROPERTY.CONNECTOR][CONNECTOR_STATE_PROPERTY.FILTER],
    editorDialog: state[REDUCER_STATE_PROPERTY.CONNECTOR][CONNECTOR_STATE_PROPERTY.EDITOR_DIALOG],
    confirmDialog: state[REDUCER_STATE_PROPERTY.CONNECTOR][CONNECTOR_STATE_PROPERTY.CONFIRM_DIALOG],
    snackbar: state[REDUCER_STATE_PROPERTY.CONNECTOR][CONNECTOR_STATE_PROPERTY.SNACKBAR],
    sortingStrategy: state[REDUCER_STATE_PROPERTY.CONNECTOR][CONNECTOR_STATE_PROPERTY.SORTER],
    containerSelector: state[REDUCER_STATE_PROPERTY.CONNECTOR][CONNECTOR_STATE_PROPERTY.CONTAINER_SELECTOR],
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Actions[REDUCER_STATE_PROPERTY.CONNECTOR], dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectorPage)

