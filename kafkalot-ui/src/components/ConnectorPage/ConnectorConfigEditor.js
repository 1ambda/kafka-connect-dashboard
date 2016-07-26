import React, { PropTypes, } from 'react'

import 'jsoneditor/dist/jsoneditor.min.css'
import JSONEditor from 'jsoneditor/dist/jsoneditor.min.js'

import Chip from 'material-ui/Chip'
import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'

import { ConnectorEditor as EditorTheme, } from '../../constants/Theme'
import { JsonEditorMode, } from '../../constants/EditorMode'
import { ConnectorProperty, } from '../../reducers/ConnectorReducer/ConnectorListState'
import { Payload as ConfigSchemaPayload, } from '../../reducers/ConnectorReducer/ConfigSchemaState'

const dialogStyle = {
  editorContainer: { paddingTop: 20, },
  editor: { height: 450, },
  button : { marginRight: 15, marginBottom: 15, },
  buttonLabel : { fontWeight: 300, },
  validateButtonLabel: { fontWeight: 300, color: EditorTheme.validationButton, },
  disabledValidateButtonLabel: { fontWeight: 300, color: EditorTheme.disabledValidationButton, },
  title: { float: 'left', fontWeight: 300, fontSize: 20, },
  titleChipLabel: { fontWeight: 300, fontSize: 13, },
  titleChip: { float: 'left', marginLeft: 10, },
}

const ELEM_ID_EDITOR_DIALOG = 'config-editor'

export function getDefaultEditorMode (readonly) {
  return (readonly) ? JsonEditorMode.CODE: JsonEditorMode.CODE
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
    close: PropTypes.func.isRequired,
    update: PropTypes.func.isRequired,
    validateConnectorConfig: PropTypes.func.isRequired,

    name: PropTypes.string.isRequired,
    config: PropTypes.object.isRequired,
    configSchema: PropTypes.object, /** optional */
    errorMessages: PropTypes.array.isRequired,
    readonly: PropTypes.bool.isRequired,
  }

  constructor(props) {
    super(props)

    /**
     * to avoid re-drawing the whole page whenever JSON is updated,
     * EditorDialog manages editor as it's state
     */
    this.state = { editor: null, isJSONChanged: false, }

    this.handleValidateConfig = this.handleValidateConfig.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleUpdate = this.handleUpdate.bind(this)
    this.handleEditorError = this.handleEditorError.bind(this)
    this.handleEditorContentChange = this.handleEditorContentChange.bind(this)
  }

  /** component life-cycle */
  componentDidMount() {
    const { config, configSchema, readonly, } = this.props
    const initialJSON = config

    const defaultMode = getDefaultEditorMode(readonly)
    const availableModes = getAvailableEditorModes(readonly)

    const onChangeHandler = this.handleEditorContentChange
    const onErrorHandler = this.handleEditorError

    const options = {
      search: false, // TODO: fix search width
      mode: defaultMode,
      schema: configSchema,
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
    const { config: nextJSON, configSchema, } = nextProps
    const { editor, } = this.state

    /** if JSON is not changed, then disable `UPDATE` button */
    this.setState({ isJSONChanged: isEditorJSONChanged(currentJSON, nextJSON), }) // eslint-disable-line react/no-set-state
    if (editor) editor.setSchema(configSchema)
  }

  getEditorJSONValue() {
    const { editor, } = this.state
    return editor.get()
  }

  handleEditorContentChange() {
    const { config: prevJSON, } = this.props

    const updatedJSON = this.getEditorJSONValue()
    this.setState({ isJSONChanged: isEditorJSONChanged(prevJSON, updatedJSON), }) // eslint-disable-line react/no-set-state
  }

  handleEditorError(err) {
    console.error(`JSONEditor: ${err}`) /** TODO 500 page */
  }

  handleValidateConfig() {
    const { validateConnectorConfig, } = this.props
    const { editor, } = this.state

    const connectorConfig = editor.get()

    const connectorClass = connectorConfig['connector.class']

    validateConnectorConfig({
      [ConfigSchemaPayload.CONNECTOR_CLASS]: connectorClass,
      [ConfigSchemaPayload.CONNECTOR_CONFIG]: connectorConfig,
    })
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

  handleClose() {
    const { close, } = this.props
    close()
  }

  createDialogTitle() {
    const { name, configSchema, errorMessages, } = this.props

    const emptySchema = configSchema === void 0
    const noError = errorMessages.length === 0

    const schemaChipLabel = (emptySchema) ? 'INVALID CLASS' : 'SCHEMA VALIDATION'
    const schemaChipLabelColor = (emptySchema) ?
      EditorTheme.titleNoSchemaChipLabelColor : EditorTheme.titleSchemaChipLabelColor
    const schemaChipBgColor = (emptySchema) ?
      EditorTheme.titleNoSchemaChipBgColor : EditorTheme.titleSchemaChipBgColor

    const errorChipLabel = (noError) ? 'NO ERROR' : `ERROR (${errorMessages.length})`
    const errorChipLabelColor = (noError) ?
      EditorTheme.titleNoErrorChipLabelColor : EditorTheme.titleErrorChipLabelColor
    const errorChipBgColor = (noError) ?
      EditorTheme.titleNoErrorChipBgColor : EditorTheme.titleErrorChipBgColor

    const errorChip = (emptySchema) ? null : (
      <Chip labelStyle={dialogStyle.titleChipLabel}
            style={dialogStyle.titleChip}
            backgroundColor={errorChipBgColor}
            labelColor={errorChipLabelColor} >
        {errorChipLabel}
      </Chip>
    )

    return (
      <div>
        <span style={dialogStyle.title}>{name}</span>
        <Chip labelStyle={dialogStyle.titleChipLabel}
              style={dialogStyle.titleChip}
              backgroundColor={schemaChipBgColor}
              labelColor={schemaChipLabelColor} >
          {schemaChipLabel}
        </Chip>
        {errorChip}
        <div style={{clear: 'both', }}></div>
      </div>
    )
  }

  render() {
    const { configSchema, readonly, } = this.props
    const { isJSONChanged, } = this.state

    const validationButtonDisabled = (configSchema === void 0)
    const validationButtonLabelStyle = (configSchema === void 0) ?
      dialogStyle.disabledValidateButtonLabel : dialogStyle.validateButtonLabel

    let buttons = [
      <FlatButton
        style={dialogStyle.button}
        labelStyle={validationButtonLabelStyle}
        disabled={validationButtonDisabled}
        key="validate" label="Validate"
        onTouchTap={this.handleValidateConfig} />,
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
        title={this.createDialogTitle()}
        actions={buttons}
        autoScrollBodyContent
        open modal={false}
        onRequestClose={this.handleClose}>
        <div style={dialogStyle.editorContainer}>
          <div id={ELEM_ID_EDITOR_DIALOG} style={dialogStyle.editor} />
        </div>
      </Dialog>
    )
  }
}
