import * as Logger from './Logger'
import { Code as ErrorCode, } from '../constants/Error'

export function extractConnectorClassFromConfig(name, config) {
  let connectorClass = undefined

  try {
    connectorClass = config['connector.class']
  } catch (error) {
    Logger.warn(`${ErrorCode.CONNECTOR_CONFIG_HAS_NO_CONNECTOR_CLASS_FIELD} (${name}`)
  }

  return connectorClass
}

export const InitialConnectorConfig = {
  'connector.class': 'io.github.1ambda.ExampleSinkConnector',
  'tasks.max': '4',
  'topics': 'example-topic',
  'name': 'example-connector',
}

export const defaultConnectorConfigSchema = {
  '$schema': 'http://json-schema.org/draft-04/schema#',
  'title': 'Default Schema for Connector',
  'description': 'Default Schema for Connector',
  'type': 'object',
  'properties': {
    'name': { 'type': 'string', },
    'connector.class': { 'type': 'string', },
    'topics': { 'type': 'string', },
    'tasks.max': {'type': 'string', },
  },
  'required': [ 'name', 'connector.class', 'topics', 'tasks.max', ],
}

export function createConnectorClassSchemaInCreateDialog(configSchema) {
  const title = configSchema.title
  const $schema = configSchema.$schema
  const description = configSchema.description

  delete configSchema.title
  delete configSchema.$schema
  delete configSchema.description

  let schema = {
    'title': title,
    '$schema': $schema,
    'description': description,
    'type': 'object',
    properties: {
      'name': { 'type': 'string', },
      'config': configSchema,
    },
    'required': [ 'name', 'config', ],
  }

  return schema
}
