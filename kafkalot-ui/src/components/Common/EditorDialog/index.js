import React, { PropTypes, } from 'react'

import 'jsoneditor/dist/jsoneditor.min.css'
import JSONEditor from 'jsoneditor/dist/jsoneditor.min.js'

import RaisedButton from 'material-ui/lib/raised-button'
import FlatButton from 'material-ui/lib/flat-button'
import Dialog from 'material-ui/lib/dialog'

import { ITEM_PROPERTY, modifyProp, } from '../../../reducers/ConnectorReducer/ItemState'
import * as dialogStyle from './style'

const ELEM_ID_EDITOR_DIALOG = 'editor-dialog'

export const EDITOR_DIALOG_MODE = {
  EDIT: 'EDIT',
  CREATE: 'CREATE',
  CLOSE: 'CLOSE',
}

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
    job: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    readonly: PropTypes.bool.isRequired,
    dialogMode: PropTypes.string.isRequired, /** EDITOR_DIALOG_MODE */
  }

  constructor(props) {
    super(props)

    /**
     * to avoid re-drawing the whole page whenever JSON is updated,
     * EditorDialog manages editor as it's state
     */
    this.state = { editor: null, isJSONChanged: false, }
  }

  /** component life-cycle */
  componentDidMount() {
    const { job, readonly, dialogMode, } = this.props
    const initialJSON = job

    const defaultMode = getDefaultEditorMode(readonly, dialogMode)
    const availableModes = getAvailableEditorModes(readonly, dialogMode)

    const onChangeHandler = (EDITOR_DIALOG_MODE.EDIT === dialogMode) ?
      this.handleEditorJSONChanged.bind(this) : undefined
    const onErrorHandler = this.handleEditorError.bind(this)

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
    const { job: currentJSON, } = this.props
    const { job: nextJSON, } = nextProps

    /** if JSON is not changed, then disable `UPDATE` button */
    this.setState({ isJSONChanged: isEditorJSONChanged(currentJSON, nextJSON), }) // eslint-disable-line react/no-set-state
  }

  getEditorJSONValue() {
    const { editor, } = this.state
    return editor.get()
  }

  handleEditorJSONChanged() {
    const { job: prevJSON, } = this.props

    const updatedJSON = this.getEditorJSONValue()

    this.setState({ isJSONChanged: isEditorJSONChanged(prevJSON, updatedJSON), }) // eslint-disable-line react/no-set-state
  }

  handleEditorError(err) {
    console.error(`JSONEditor: ${err}`) /** TODO 500 page */
  }

  handleClose() {
    const { actions, } = this.props
    actions.closeEditorDialog()
  }

  handleUpdate() {
    const { actions, name, } = this.props
    const { isJSONChanged, } = this.state

    if (isJSONChanged) {
      actions.update({ name, job: this.getEditorJSONValue(), })
    }
  }

  handleCreate() {
    const { actions, } = this.props
    const job = this.getEditorJSONValue()

    actions.create({ job, })
  }

  render() {
    const { readonly, name, dialogMode, } = this.props
    const { isJSONChanged, } = this.state

    const submitButton = (EDITOR_DIALOG_MODE.EDIT === dialogMode) ?
      (<FlatButton labelStyle={dialogStyle.buttonLabel}
                    style={dialogStyle.button}
                    primary disabled={readonly || !isJSONChanged}
                    key="update" label="Update"
                    onTouchTap={this.handleUpdate.bind(this)} />) :
      (<FlatButton labelStyle={dialogStyle.buttonLabel}
                   style={dialogStyle.button}
                   primary
                   key="create" label="Create"
                   onTouchTap={this.handleCreate.bind(this)} /> )
    const buttons = [
      <FlatButton
        style={dialogStyle.button} labelStyle={dialogStyle.buttonLabel}
        secondary key="cancel" label="Cancel"
        onTouchTap={this.handleClose.bind(this)} />,
      submitButton,
    ]

    return (
      <Dialog
        title={name} titleStyle={dialogStyle.title}
        actions={buttons}
        open modal={false}
        onRequestClose={this.handleClose.bind(this)}>
        <div name={ELEM_ID_EDITOR_DIALOG} style={dialogStyle.editor} />
      </Dialog>
    )
  }
}
