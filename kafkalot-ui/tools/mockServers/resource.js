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
export const KEY_STORAGE_META = '_meta'
export const KEY_ENABLED = 'enabled'
export const KEY_RUNNING = 'running'
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
    "_meta": {
      "enabled": true,
      "running": true,
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
    "_meta": {
      "enabled": true,
      "running": true,
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
    "_meta": {
      "enabled": true,
      "running": false,
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
    "_meta": {
      "enabled": false,
      "running": false,
      "tags": ["file",],
    }
  },
]

/** initialize databases */
connectors
  .filter(c => c[KEY_TASKS] !== void 0)
  .filter(c => c[KEY_NAME] !== WAITING_CONNECTOR_NAME)
  .map(c => {
    /** connectors running on kafka doesn't have '_meta` field */
    const refined = Object.assign({}, c, { [KEY_STORAGE_META]: undefined, })
    restDB(KEY_CONNECTORS).push(refined)
  })

connectors
  .map(c => {
    if (c[KEY_STORAGE_META][KEY_RUNNING] === false) {
      const refined = Object.assign({}, c, {
        [KEY_TASKS]: undefined,
      })
      storageDB(KEY_CONNECTORS).push(refined)
    } else
      storageDB(KEY_CONNECTORS).push(c)
  })

export const REST_DB = restDB
export const STORAGE_DB = storageDB

