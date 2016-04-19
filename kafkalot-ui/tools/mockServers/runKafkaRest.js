import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import * as Resource from './resource'
import * as Middleware from './middleware'

const db = Resource.REST_DB

const app = express()

app.set('port', process.env.KAFKA_REST_PORT || 3002);

/** add CORS support */
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}))

/** add bodyParser */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false, }));

app.get(`/${Resource.KEY_CONNECTORS}`,
  (req, res) => {
    res.json(db(Resource.KEY_CONNECTORS).map(connector => connector.name))
  }
)

app.get(`/${Resource.KEY_CONNECTORS}/:${Resource.KEY_NAME}`,
  Middleware.checkConnectorExists(db),
  (req, res) => {

    res.json(req[Resource.KEY_CONNECTOR])
  }
)

app.get(`/${Resource.KEY_CONNECTORS}/:${Resource.KEY_NAME}/${Resource.KEY_CONFIG}`,
  Middleware.checkConnectorExists(db),
  (req, res) => {

    res.json(req[Resource.KEY_CONNECTOR][Resource.KEY_CONFIG])
  }
)

app.get(`/${Resource.KEY_CONNECTORS}/:${Resource.KEY_NAME}/${Resource.KEY_TASKS}`,
  Middleware.checkConnectorExists(db),
  (req, res) => {
    const connector = req[Resource.KEY_CONNECTOR]
    const config = connector[Resource.KEY_CONFIG]

    const tasks = connector[Resource.KEY_TASKS].map(task => {
      return Object.assign({}, {
        [Resource.KEY_ID]: task,
        [Resource.KEY_CONFIG]: {
          ...config,
          [Resource.KEY_TASK_CLASS]: config[Resource.KEY_CONNECTOR_CLASS],
        },
      })
    })

    res.json(tasks)
  }
)

app.listen(app.get('port'), () => {
  console.log(`Mock server is running on PORT ${app.get('port')}!`)
})

/**
 *  Ref - http://kafka.apache.org/documentation.html#connect
 *
 *  GET /connectors - return a list of active connectors
 *  GET /connectors/{name} - get information about a specific connector
 *  GET /connectors/{name}/config - get the configuration parameters for a specific connector
 *  GET /connectors/{name}/tasks - get a list of tasks currently running for a connector
 *
 *  POST /connectors - create a new connector; the request body should be a JSON object containing a string name field and a object config field with the connector configuration parameters
 *  DELETE /connectors/{name} - delete a connector, halting all tasks and deleting its configuration
 *  PUT /connectors/{name}/config - update the configuration parameters for a specific connector
 */

/**
 *
 * example of `GET: /connectors`
 *
 *  [
 *    "console-sink1"
 *  ]
 */

/**
 *
 * example of `GET: /connectors/:name`
 *
 *  {
 *    "name":"console-sink1",
 *    "config":{
 *      "connector.class":"io.github.lambda.ConsoleSinkConnector",
 *      "tasks.max":"4",
 *      "topics":"test-p4-1",
 *      "name":"console-sink1",
 *      "id":"console-connector-id"
 *    },
 *    "tasks":[
 *      {  "connector":"console-sink1", "task":0  },
 *      {  "connector":"console-sink1", "task":1  },
 *      {  "connector":"console-sink1", "task":2  },
 *      {  "connector":"console-sink1", "task":3  }
 *    ]
 *  }
 */

/**
 *
 * example of `GET: /connectors/:name/config`
 *
 *  {
 *    "connector.class":"io.github.lambda.ConsoleSinkConnector",
 *    "tasks.max":"4",
 *    "topics":"test-p4-1",
 *    "name":"console-sink-1",
 *    "id":"console-connector-id"
 *  }
 */

/**
 *
 * example of `GET: /connectors/:name/tasks`
 *
 *  [
 *   {
 *     "id":{
 *       "connector":"console-sink1",
 *       "task":0
 *     },
 *     "config":{
 *       "connector.class":"io.github.lambda.ConsoleSinkConnector",
 *       "name":"console-sink1",
 *       "id":"console-connector-id",
 *       "task.class":"io.github.lambda.ConsoleSinkTask",
 *       "tasks.max":"4",
 *       "topics":"test-p4-1"
 *     }
 *   },
 *   {
 *     "id":{
 *       "connector":"console-sink1",
 *       "task":1
 *     },
 *     "config":{
 *       "connector.class":"io.github.lambda.ConsoleSinkConnector",
 *       "name":"console-sink1",
 *       "id":"console-connector-id",
 *       "task.class":"io.github.lambda.ConsoleSinkTask",
 *       "tasks.max":"4",
 *       "topics":"test-p4-1"
 *     }
 *   },
 *   {
 *     "id":{
 *       "connector":"console-sink1",
 *       "task":2
 *     },
 *     "config":{
 *       "connector.class":"io.github.lambda.ConsoleSinkConnector",
 *       "name":"console-sink1",
 *       "id":"console-connector-id",
 *       "task.class":"io.github.lambda.ConsoleSinkTask",
 *       "tasks.max":"4",
 *       "topics":"test-p4-1"
 *     }
 *   },
 *   {
 *     "id":{
 *       "connector":"console-sink1",
 *       "task":3
 *     },
 *     "config":{
 *       "connector.class":"io.github.lambda.ConsoleSinkConnector",
 *       "name":"console-sink1",
 *       "id":"console-connector-id",
 *       "task.class":"io.github.lambda.ConsoleSinkTask",
 *       "tasks.max":"4",
 *       "topics":"test-p4-1"
 *     }
 *   }
 *  ]
 */
