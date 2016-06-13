import React, { PropTypes, } from 'react'

import 'jsoneditor/dist/jsoneditor.min.css'
import JSONEditor from 'jsoneditor/dist/jsoneditor.min.js'

import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'

import { JsonEditorMode, } from '../../constants/EditorMode'
import { ConnectorProperty, } from '../../reducers/ConnectorReducer/ConnectorListState'

const dialogStyle = {
  editor: { height: 450, },
  title : { fontWeight: 300, },
  button : { marginRight: 15, marginBottom: 15, },
  buttonLabel : { fontWeight: 300, },
}

const ELEM_ID_EDITOR_DIALOG = 'config-editor'

export function getDefaultEditorMode (readonly) {
  return (readonly) ? JsonEditorMode.VIEW : JsonEditorMode.TREE
}

export function getAvailableEditorModes (readonly) {
  return (readonly) ? [JsonEditorMode.VIEW, JsonEditorMode.CODE, ] :
    [JsonEditorMode.TREE, JsonEditorMode.CODE,]
}

export function isEditorJSONChanged(initial, updated) {
  return !(JSON.stringify(initial) === JSON.stringify(updated))
}

export default class ConnectorConfigEditor extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    config: PropTypes.object.isRequired,
    readonly: PropTypes.bool.isRequired,
    close: PropTypes.func.isRequired,
    update: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)

    /**
     * to avoid re-drawing the whole page whenever JSON is updated,
     * EditorDialog manages editor as it's state
     */
    this.state = { editor: null, isJSONChanged: false, }

    this.handleClose = this.handleClose.bind(this)
    this.handleUpdate = this.handleUpdate.bind(this)
    this.handleEditorError = this.handleEditorError.bind(this)
    this.handleEditorJSONChanged = this.handleEditorJSONChanged.bind(this)
  }

  /** component life-cycle */
  componentDidMount() {
    const { config, readonly, } = this.props
    const initialJSON = config

    const defaultMode = getDefaultEditorMode(readonly)
    const availableModes = getAvailableEditorModes(readonly)

    const onChangeHandler = this.handleEditorJSONChanged
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

    if (defaultMode !== JsonEditorMode.CODE) editor.expandAll()

    this.setState({ editor, }) // eslint-disable-line react/no-did-mount-set-state,react/no-set-state
  }

  /** component life-cycle */
  componentWillReceiveProps(nextProps) {
    const { config: currentJSON, } = this.props
    const { config: nextJSON, } = nextProps

    /** if JSON is not changed, then disable `UPDATE` button */
    this.setState({ isJSONChanged: isEditorJSONChanged(currentJSON, nextJSON), }) // eslint-disable-line react/no-set-state
  }

  getEditorJSONValue() {
    const { editor, } = this.state
    return editor.get()
  }

  handleEditorJSONChanged() {
    const { config: prevJSON, } = this.props

    const updatedJSON = this.getEditorJSONValue()
    this.setState({ isJSONChanged: isEditorJSONChanged(prevJSON, updatedJSON), }) // eslint-disable-line react/no-set-state
  }

  handleEditorError(err) {
    console.error(`JSONEditor: ${err}`) /** TODO 500 page */
  }

  handleClose() {
    const { close, } = this.props
    close()
  }

  handleUpdate() {
    const { update, name, } = this.props
    const { isJSONChanged, } = this.state
  
    if (isJSONChanged) {
      update({
        [ConnectorProperty.NAME]: name,
        [ConnectorProperty.CONFIG]: this.getEditorJSONValue(),
      })
    }
  }

  render() {
    const { readonly, name, } = this.props
    const { isJSONChanged, } = this.state

    const buttons = [
      <FlatButton labelStyle={dialogStyle.buttonLabel}
                  style={dialogStyle.button}
                  primary disabled={readonly === true || !isJSONChanged}
                  key="update" label="Update"
                  onTouchTap={this.handleUpdate} />,
      <FlatButton
        style={dialogStyle.button} labelStyle={dialogStyle.buttonLabel}
        secondary key="cancel" label="Cancel"
        onTouchTap={this.handleClose} />,
    ]

    return (
      <Dialog
        title={`Configuration for ${name}`} titleStyle={dialogStyle.title}
        actions={buttons}
        autoScrollBodyContent
        open modal={false}
        onRequestClose={this.handleClose}>
        <div id={ELEM_ID_EDITOR_DIALOG} style={dialogStyle.editor} />
      </Dialog>
    )
  }
}
