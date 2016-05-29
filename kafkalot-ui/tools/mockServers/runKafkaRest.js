import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import * as Resource from './resource'
import * as Middleware from './middleware'
import * as Util from './util'

const db = Resource.REST_DB

const app = express()

app.set('port', process.env.KAFKA_REST_PORT || 3002)

/** add CORS support */
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}))

/** add bodyParser */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false, }))

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

app.post(`/${Resource.KEY_CONNECTORS}`,
  Middleware.checkDuplicatedConnector(db),
  (req, res) => {
    const connector = req.body
    const config = connector[Resource.KEY_CONFIG]

    if (config === void 0 || config === null || Util.isEmptyObject(config)) {
      return Util.sendErrorMessage(res, 400, `Invalid '${Resource.KEY_CONFIG}' field`)
    }

    db(Resource.KEY_CONNECTORS)
      .push(connector)

    res.status(201).json(connector)
  }
)

app.delete(`/${Resource.KEY_CONNECTORS}/:${Resource.KEY_NAME}`,
  Middleware.checkConnectorExists(db),
  (req, res) => {
    const name = req.params[Resource.KEY_NAME]

    const connector = db(Resource.KEY_CONNECTORS)
      .remove({ [Resource.KEY_NAME]: name, })

    res.status(200).json(connector)
  }
)

app.listen(app.get('port'), () => {
  console.log(`Mock container server is running on PORT ${app.get('port')}!`) //
})
