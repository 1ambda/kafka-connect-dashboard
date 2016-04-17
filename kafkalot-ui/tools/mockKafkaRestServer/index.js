import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import db, * as Res from './db'

const app = express()

app.set('port', process.env.PORT || 3002);

/** add CORS support */
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}))

/** add bodyParser */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false, }));

function checkConnectorExists(req, res, next) {
  const name = req.params[Res.KEY_NAME]

  const connector = db(Res.KEY_CONNECTORS)
    .find({ [Res.KEY_NAME]: name, })

  if (connector === void 0) {
    res.status(404).json({
      "error_code": 404,
      "message": `Connector ${name} not found`
    })
  } else {
    req[Res.KEY_CONNECTOR] = connector
    next()
  }
}

app.get(`/${Res.KEY_CONNECTORS}`,
  (req, res) => {
    res.json(db(Res.KEY_CONNECTORS).map(connector => connector.name))
  }
)

app.get(`/${Res.KEY_CONNECTORS}/:${Res.KEY_NAME}`,
  checkConnectorExists,
  (req, res) => {

    res.json(req[Res.KEY_CONNECTOR])
  }
)

app.get(`/${Res.KEY_CONNECTORS}/:${Res.KEY_NAME}/${Res.KEY_CONFIG}`,
  checkConnectorExists,
  (req, res) => {

    res.json(req[Res.KEY_CONNECTOR][Res.KEY_CONFIG])
  }
)

app.get(`/${Res.KEY_CONNECTORS}/:${Res.KEY_NAME}/${Res.KEY_TASKS}`,
  checkConnectorExists,
  (req, res) => {
    const connector = req[Res.KEY_CONNECTOR]
    const config = connector[Res.KEY_CONFIG]

    const tasks = connector[Res.KEY_TASKS].map(task => {
      return Object.assign({}, {
        [Res.KEY_ID]: task,
        [Res.KEY_CONFIG]: {
          ...config,
          [Res.KEY_TASK_CLASS]: config[Res.KEY_CONNECTOR_CLASS],
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
