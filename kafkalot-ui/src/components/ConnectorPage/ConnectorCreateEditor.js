import React, { PropTypes, } from 'react'

import 'jsoneditor/dist/jsoneditor.min.css'
import JSONEditor from 'jsoneditor/dist/jsoneditor.min.js'

import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'

import { JsonEditorMode, } from '../../constants/EditorMode'
import { Payload as ConnectorPayload, } from '../../reducers/ConnectorReducer/ConnectorListState'

const dialogStyle = {
  editor: { height: 450, },
  title : { fontWeight: 300, },
  button : { marginRight: 15, marginBottom: 15, },
  buttonLabel : { fontWeight: 300, },
}

const ELEM_ID = 'create-editor'

const INITIAL_CREATE_EDITOR_VALUE = {
  'name': 'example-connector',
  'config': {
    'connector.class': 'io.github.lambda.ExampleConnector',
    'tasks.max': '4',
    'topics': 'example-topic',
    'name': 'example-connector' // eslint-disable-line comma-dangle
  } // eslint-disable-line comma-dangle
}

export function getDefaultEditorMode() {
  return JsonEditorMode.CODE
}

export function getAvailableEditorModes() {
  return [
    JsonEditorMode.CODE, JsonEditorMode.VIEW, JsonEditorMode.TREE,
  ]
}

export default class ConnectorCreateEditor extends React.Component {
  static propTypes = {
    close: PropTypes.func.isRequired,
    create: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)

    /**
     * to avoid re-drawing the whole page whenever JSON is updated,
     * EditorDialog manages editor as it's state
     */
    this.state = { editor: null, }

    this.handleCreate = this.handleCreate.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleEditorError = this.handleEditorError.bind(this)
  }

  /** component life-cycle */
  componentDidMount() {
    const defaultMode = getDefaultEditorMode()
    const availableModes = getAvailableEditorModes()
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
    const editor = new JSONEditor(document.getElementById(ELEM_ID), options)
    editor.set(INITIAL_CREATE_EDITOR_VALUE)

    if (defaultMode !== JsonEditorMode.CODE) editor.expandAll()

    this.setState({ editor, }) // eslint-disable-line react/no-did-mount-set-state,react/no-set-state
  }

  handleEditorError(err) {
    console.error(`JSONEditor: ${err}`) /** TODO 500 page */
  }

  handleClose() {
    const { close, } = this.props
    close()
  }

  handleCreate() {
    const { create, } = this.props
    const { editor, } = this.state
    const connectorToBeCreated = editor.get()
    
    create({
      [ConnectorPayload.CONNECTOR]: connectorToBeCreated,
    })
  }

  render() {
    const buttons = [
      <FlatButton labelStyle={dialogStyle.buttonLabel}
                  style={dialogStyle.button}
                  primary
                  key="create" label="CREATE"
                  onTouchTap={this.handleCreate} />,
      <FlatButton
        style={dialogStyle.button} labelStyle={dialogStyle.buttonLabel}
        secondary key="cancel" label="CANCEL"
        onTouchTap={this.handleClose} />,
    ]

    return (
      <Dialog
        title="Create New Connector" titleStyle={dialogStyle.title}
        actions={buttons}
        open modal={false}
        autoScrollBodyContent
        onRequestClose={this.handleClose}>
        <div id={ELEM_ID} style={dialogStyle.editor} />
      </Dialog>
    )
  }
}
