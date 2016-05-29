import React, { PropTypes, } from 'react'

import 'jsoneditor/dist/jsoneditor.min.css'
import JSONEditor from 'jsoneditor/dist/jsoneditor.min.js'

import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'

import * as dialogStyle from './style'
import { ItemProperty, Payload as ConnectorItemPayload, } from '../../../reducers/ConnectorReducer/ItemState'
import {
  EDITOR_DIALOG_MODE, Payload as EditorDialogPayload,
} from '../../../reducers/ConnectorReducer/EditorDialogState'

const ELEM_ID_EDITOR_DIALOG = 'editor-dialog'

export const JSON_EDITOR_MODES = {
  TREE: 'tree', VIEW: 'view', CODE: 'code',
}

export function getDefaultEditorMode (readonly, dialogMode) {
  return (EDITOR_DIALOG_MODE.CREATE === dialogMode) ? JSON_EDITOR_MODES.CODE :
    (readonly) ? JSON_EDITOR_MODES.VIEW :
      JSON_EDITOR_MODES.TREE
}

export function getAvailableEditorModes (readonly, dialogMode) {
  return (EDITOR_DIALOG_MODE.CREATE === dialogMode) ? [JSON_EDITOR_MODES.CODE, JSON_EDITOR_MODES.TREE,] :
    (readonly) ? [JSON_EDITOR_MODES.VIEW, JSON_EDITOR_MODES.CODE, ] :
      [JSON_EDITOR_MODES.TREE, JSON_EDITOR_MODES.CODE,]
}

export function isEditorJSONChanged(initial, updated) {
  return !(JSON.stringify(initial) === JSON.stringify(updated))
}

export default class EditorDialog extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    connector: PropTypes.object.isRequired,
    readonly: PropTypes.bool.isRequired,
    dialogMode: PropTypes.string.isRequired, /** EDITOR_DIALOG_MODE */
    closeEditorDialog: PropTypes.func.isRequired,
    updateConnector: PropTypes.func.isRequired,
    createConnector: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)

    /**
     * to avoid re-drawing the whole page whenever JSON is updated,
     * EditorDialog manages editor as it's state
     */
    this.state = { editor: null, isJSONChanged: false, }

    this.handleClose = this.handleClose.bind(this)
    this.handleCreate = this.handleCreate.bind(this)
    this.handleUpdate = this.handleUpdate.bind(this)
    this.handleEditorError = this.handleEditorError.bind(this)
    this.handleEditorJSONChanged = this.handleEditorJSONChanged.bind(this)
  }

  /** component life-cycle */
  componentDidMount() {
    const { connector, readonly, dialogMode, } = this.props
    const initialJSON = connector

    const defaultMode = getDefaultEditorMode(readonly, dialogMode)
    const availableModes = getAvailableEditorModes(readonly, dialogMode)

    const onChangeHandler = (EDITOR_DIALOG_MODE.EDIT === dialogMode) ?
      this.handleEditorJSONChanged : undefined
    const onErrorHandler = this.handleEditorError

    const options = {
      search: false, // TODO: fix search width
      mode: defaultMode,
      modes: availableModes,
      onChange: onChangeHandler,
      onError: onErrorHandler,
    }

    /** external library which does not be managed by React */
    const editor = new JSONEditor(document.getElementById(ELEM_ID_EDITOR_DIALOG), options, initialJSON)

    if (defaultMode !== JSON_EDITOR_MODES.CODE) editor.expandAll()

    this.setState({ editor, }) // eslint-disable-line react/no-did-mount-set-state,react/no-set-state
  }

  /** component life-cycle */
  componentWillReceiveProps(nextProps) {
    const { connector: currentJSON, } = this.props
    const { connector: nextJSON, } = nextProps

    /** if JSON is not changed, then disable `UPDATE` button */
    this.setState({ isJSONChanged: isEditorJSONChanged(currentJSON, nextJSON), }) // eslint-disable-line react/no-set-state
  }

  getEditorJSONValue() {
    const { editor, } = this.state
    return editor.get()
  }

  handleEditorJSONChanged() {
    const { connector: prevJSON, } = this.props

    const updatedJSON = this.getEditorJSONValue()

    this.setState({ isJSONChanged: isEditorJSONChanged(prevJSON, updatedJSON), }) // eslint-disable-line react/no-set-state
  }

  handleEditorError(err) {
    console.error(`JSONEditor: ${err}`) /** TODO 500 page */
  }

  handleClose() {
    const { closeEditorDialog, } = this.props
    closeEditorDialog()
  }

  handleUpdate() {
    const { updateConnector, name, } = this.props
    const { isJSONChanged, } = this.state

    if (isJSONChanged) {
      updateConnector({
        [EditorDialogPayload.NAME]: name,
        [EditorDialogPayload.CONNECTOR]: this.getEditorJSONValue(),
      })
    }
  }

  handleCreate() {
    const { createConnector, } = this.props
    const connector = this.getEditorJSONValue()

    createConnector({
      [ConnectorItemPayload.CONNECTOR]: connector,
    })
  }

  render() {
    const { readonly, name, dialogMode, } = this.props
    const { isJSONChanged, } = this.state

    const submitButton = (EDITOR_DIALOG_MODE.EDIT === dialogMode) ?
      (<FlatButton labelStyle={dialogStyle.buttonLabel}
                    style={dialogStyle.button}
                    primary disabled={readonly || !isJSONChanged}
                    key="update" label="Update"
                    onTouchTap={this.handleUpdate} />) :
      (<FlatButton labelStyle={dialogStyle.buttonLabel}
                   style={dialogStyle.button}
                   primary
                   key="create" label="Create"
                   onTouchTap={this.handleCreate} /> )
    const buttons = [
      <FlatButton
        style={dialogStyle.button} labelStyle={dialogStyle.buttonLabel}
        secondary key="cancel" label="Cancel"
        onTouchTap={this.handleClose} />,
      submitButton,
    ]

    return (
      <Dialog
        title={name} titleStyle={dialogStyle.title}
        actions={buttons}
        open modal={false}
        onRequestClose={this.handleClose}>
        <div id={ELEM_ID_EDITOR_DIALOG} style={dialogStyle.editor} />
      </Dialog>
    )
  }
}
