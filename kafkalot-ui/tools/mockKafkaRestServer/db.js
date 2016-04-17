import low from 'lowdb'
import storage from 'lowdb/file-async'

const db = low( /** in memory */ )

export const KEY_CONNECTORS = 'connectors'
export const KEY_CONNECTOR = 'connector'
export const KEY_NAME = 'name'
export const KEY_CONFIG = 'config'
export const KEY_TASKS = 'tasks'
export const KEY_ID = 'id'
export const KEY_TASK_CLASS = 'task.class'
export const KEY_CONNECTOR_CLASS = 'connector.class'

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
  },
  {
    "name": "file-sink-1",
    "config": {
      "connector.class": "io.github.lambda.FileSinkConnector",
      "tasks.max": "2",
      "topics": "test-1-replicated4",
      "name": "file-sink-1",
    },
    "tasks": [
      { "connector": "file-sink-1", "task": 0 },
      { "connector": "file-sink-1", "task": 1 },
    ],
  },
]

/** initialize database */
connectors.map(c => { db(KEY_CONNECTORS).push(c) })

export default db
