import React, { PropTypes, } from 'react'

import JSONEditor from 'jsoneditor/dist/jsoneditor.min.js'

import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'
import SelectField from 'material-ui/SelectField'
import TextField from 'material-ui/TextField'
import MenuItem from 'material-ui/MenuItem'
import Chip from 'material-ui/Chip'

import { JsonEditorMode, } from '../../constants/EditorMode'
import { Payload as ConfigSchemaPayload, } from '../../reducers/ConnectorReducer/ConfigSchemaState'
import { Payload as CreateEditorPayload, } from '../../reducers/ConnectorReducer/CreateEditorState'
import { ConnectorEditor as EditorTheme, } from '../../constants/Theme'
import * as Logger from '../../util/Logger'
import * as SchemaUtil from '../../util/SchemaUtil'

const dialogStyle = {
  textFieldContainer: { marginTop: 5, },
  selectFieldContainer: {},
  editorContainer: { paddingTop: 5, },
  editor: { height: 350, },
  button : { marginRight: 15, marginBottom: 15, },
  buttonLabel : { fontWeight: 300, },
  validateButtonLabel: { fontWeight: 300, color: EditorTheme.validationButton, },
  disabledValidateButtonLabel: { fontWeight: 300, color: EditorTheme.disabledValidationButton, },
  title: { float: 'left', fontWeight: 300, fontSize: 20, },
  titleChipLabel: { fontWeight: 300, fontSize: 13, },
  titleChip: { float: 'left', marginLeft: 10, },
}

const ELEM_ID = 'create-editor'

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
    changeSelectedConnectorClass: PropTypes.func.isRequired,
    validateConnectorConfig: PropTypes.func.isRequired,

    availableConnectors: PropTypes.array.isRequired,
    selectedConnectorClass: PropTypes.string,
    configSchema: PropTypes.object, /** optional */
    errorMessages: PropTypes.array.isRequired,
  }

  constructor(props) {
    super(props)

    /**
     * to avoid re-drawing the whole page whenever JSON is updated,
     * EditorDialog manages editor as it's state
     */
    this.state = {
      editor: null,
      isValidConnectorClass: false,
      connectorName: '',
    }

    this.handleEditorError = this.handleEditorError.bind(this)
    this.handleCreate = this.handleCreate.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleValidateConfig = this.handleValidateConfig.bind(this)
    this.handleEditorContentChange = this.handleEditorContentChange.bind(this)
    this.handleSelectFieldChange = this.handleSelectFieldChange.bind(this)
    this.handleTextFieldChange = this.handleTextFieldChange.bind(this)
  }

  /** component life-cycle */
  componentDidMount() {
    const { configSchema, } = this.props

    const defaultMode = getDefaultEditorMode()
    const availableModes = getAvailableEditorModes()
    const onChangeHandler = this.handleEditorContentChange
    const onErrorHandler = this.handleEditorError

    const options = {
      search: false, // TODO: fix search width
      schema: configSchema,
      mode: defaultMode,
      modes: availableModes,
      onChange: onChangeHandler,
      onError: onErrorHandler,
    }

    /** external library which does not be managed by React */
    const editor = new JSONEditor(document.getElementById(ELEM_ID), options)
    editor.set(SchemaUtil.InitialConnectorConfig)

    if (defaultMode !== JsonEditorMode.CODE) editor.expandAll()

    this.setState({ editor, }) // eslint-disable-line react/no-did-mount-set-state,react/no-set-state
  }

  componentWillReceiveProps(nextProps) {
    const { configSchema, } = nextProps
    const { editor, } = this.state

    if (editor) editor.setSchema(configSchema)
  }

  handleEditorError(err) {
    console.error(`JSONEditor: ${err}`) /** TODO 500 page */
  }

  handleEditorContentChange() { /** do nothing */ }

  handleClose() {
    const { close, } = this.props
    close()
  }

  handleCreate() {
    const { create, } = this.props
    const { editor, connectorName, } = this.state
    const configToBeCreated = editor.get()
    
    create({
      [CreateEditorPayload.CONNECTOR_CONFIG]: configToBeCreated,
      [CreateEditorPayload.CONNECTOR_NAME]: connectorName,
    })
  }

  handleTextFieldChange(event) {
    this.setState({ connectorName: event.target.value, })
  }

  handleSelectFieldChange(event, key, value) {
    const { changeSelectedConnectorClass, } = this.props
    const { editor, } = this.state

    const connectorConfig = editor.get()

    if (connectorConfig && connectorConfig['connector.class']) {

      connectorConfig['connector.class'] = value
      editor.set(connectorConfig)
    }

    changeSelectedConnectorClass({
      [CreateEditorPayload.SELECTED_CONNECTOR_CLASS]: value,
    })
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

  createTextFieldForConnectorName() {
    const { connectorName, } = this.state

    let errorText = ''

    if (connectorName === '') errorText = 'required'

    return (<TextField
      id="text-field-controlled"
      value={connectorName}
      hintText="Connector Name"
      errorText={errorText}
      onChange={this.handleTextFieldChange}
      />)
  }

  createSelectFieldForConnectorClass() {
    const { availableConnectors, selectedConnectorClass, } = this.props

    const menuItems = availableConnectors.reduce((acc, c) => {
      return acc.concat([
        <MenuItem value={c} key={c} primaryText={c} />,
      ])
    }, [])

    return (
      <SelectField value={selectedConnectorClass}
                   autoWidth
                   onChange={this.handleSelectFieldChange}
                   floatingLabelText="Select Connector Class"
                   floatingLabelFixed
                   hintText="Available Connectors" >
        {menuItems}
      </SelectField>
    )
  }

  createDialogTitle() {
    const { configSchema, errorMessages, } = this.props

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
        <span style={dialogStyle.title}>Create New Connector</span>
        <Chip labelStyle={dialogStyle.titleChipLabel}
              style={dialogStyle.titleChip}
              backgroundColor={schemaChipBgColor}
              labelColor={schemaChipLabelColor} >
          {schemaChipLabel}
        </Chip>
        {errorChip}
        <div style={{clear: 'both', }} />
      </div>
    )
  }

  render() {
    const { configSchema, } = this.props

    const validationButtonDisabled = (configSchema === void 0)
    const validationButtonLabelStyle = (configSchema === void 0) ?
      dialogStyle.disabledValidateButtonLabel : dialogStyle.validateButtonLabel

    const buttons = [
      <FlatButton
        style={dialogStyle.button}
        labelStyle={validationButtonLabelStyle}
        disabled={validationButtonDisabled}
        key="validate" label="Validate"
        onTouchTap={this.handleValidateConfig} />,
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
        title={this.createDialogTitle()}
        actions={buttons}
        open modal={false}
        autoScrollBodyContent
        onRequestClose={this.handleClose}>
        <div style={dialogStyle.textFieldContainer}>
          {this.createTextFieldForConnectorName()}
        </div>
        <div style={dialogStyle.selectFieldContainer}>
          {this.createSelectFieldForConnectorClass()}
        </div>
        <div style={dialogStyle.editorContainer}>
          <div id={ELEM_ID} style={dialogStyle.editor} />
        </div>
      </Dialog>
    )
  }
}
