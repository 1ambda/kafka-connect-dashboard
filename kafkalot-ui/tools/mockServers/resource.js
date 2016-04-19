import low from 'lowdb'
import storage from 'lowdb/file-async'

/** DB for kafka-rest */
const restDB = low( /** in memory */ )

/** DB for storage */
const storageDB = low( /** in memory */)

export const KEY_CONNECTORS = 'connectors'
export const KEY_CONNECTOR = 'connector'
export const KEY_NAME = 'name'
export const KEY_CONFIG = 'config'
export const KEY_TASKS = 'tasks'
export const KEY_ID = 'id'
export const KEY_TASK_CLASS = 'task.class'
export const KEY_CONNECTOR_CLASS = 'connector.class'
export const KEY_STORAGE_META = '_storage_meta'
export const KEY_ENABLED = 'enabled'
export const KEY_TAGS = 'tags'

const WAITING_CONNECTOR_NAME = 'file-sink-1'

const connectors = [
  {
    "name": "console-sink-1",
    "config": {
      "connector.class": "io.github.lambda.ConsoleSinkConnector",
      "tasks.max": "4",
      "topics": "test-1-replicated4",
      "name": "console-sink-1",
    },
    "tasks": [
      { "connector": "console-sink-1", "task": 0 },
      { "connector": "console-sink-1", "task": 1 },
      { "connector": "console-sink-1", "task": 2 },
      { "connector": "console-sink-1", "task": 3 },
    ],
    "_storage_meta": {
      "enabled": true,
      "tags": ["console",],
    }
  },
  {
    "name": "console-sink-2",
    "config": {
      "connector.class": "io.github.lambda.ConsoleSinkConnector",
      "tasks.max": "1",
      "topics": "test-1-replicated4",
      "name": "console-sink-2",
    },
    "tasks": [
      { "connector": "console-sink-2", "task": 0 },
    ],
    "_storage_meta": {
      "enabled": true,
      "tags": ["console",],
    }
  },
  {
    "name": WAITING_CONNECTOR_NAME,
    "config": {
      "connector.class": "io.github.lambda.FileSinkConnector",
      "tasks.max": "2",
      "topics": "test-2-replicated4",
      "name": "file-sink-1",
    },
    "tasks": [
      { "connector": "file-sink-1", "task": 0 },
      { "connector": "file-sink-1", "task": 1 },
    ],
    "_storage_meta": {
      "enabled": true,
      "tags": ["file",],
    }
  },
  {
    "name": "file-sink-2",
    "config": {
      "connector.class": "io.github.lambda.FileSinkConnector",
      "tasks.max": "4",
      "topics": "test-2-replicated2",
      "name": "file-sink-2",
    },
    "_storage_meta": {
      "enabled": false,
      "tags": ["file",],
    }
  },
]

/** initialize databases */
connectors
  .filter(c => c[KEY_TASKS] !== void 0)
  .filter(c => c[KEY_NAME] !== WAITING_CONNECTOR_NAME)
  .map(c => {
    /** connectors running on kafka doesn't have '_storage_meta` field */
    const refined = Object.assign({}, c, { [KEY_STORAGE_META]: undefined, })
    restDB(KEY_CONNECTORS).push(refined)
  })

connectors
  .map(c => {
    /** connector configs persisted in storage db doesn't have `tasks` field */
    const refined = Object.assign({}, c, { [KEY_TASKS]: undefined, })
    storageDB(KEY_CONNECTORS).push(refined)
  })

export const REST_DB = restDB
export const STORAGE_DB = storageDB

