import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import * as Resource from './resource'
import * as Middleware from './middleware'
import * as Util from './util'

const db = Resource.STORAGE_DB
const app = express()

app.set('port', process.env.STORAGE_PORT || 3003);

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
    res.json(db(Resource.KEY_CONNECTORS))
  }
)

app.get(`/${Resource.KEY_CONNECTORS}/:${Resource.KEY_NAME}`,
  Middleware.checkConnectorExists(db),
  (req, res) => {

    res.json(req[Resource.KEY_CONNECTOR])
  }
)

/** create new connector */
app.post(`/${Resource.KEY_CONNECTORS}`,
  Middleware.checkDuplicatedConnector(db),
  Middleware.checkStorageMeta,
  Middleware.checkConfig,
  (req, res) => {

    const connector = req.body

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
      .find({ [Resource.KEY_NAME]: name, })

    db(Resource.KEY_CONNECTORS)
      .remove({[Resource.KEY_NAME]: name,})

    res.status(200).json(connector) /** return removed connector */
  }
)

/** update existing connector */
app.put(`/${Resource.KEY_CONNECTORS}/:${Resource.KEY_NAME}`,
  Middleware.checkConnectorExists(db),
  (req, res) => {

    const name = req.params[Resource.KEY_NAME]
    const connector = req.body

    /** name field in connector object */
    const connectorName = connector[Resource.KEY_NAME]

    if (name !== connectorName) {
      return Util.sendErrorMessage(
        res,
        400,
        `Cannot updated connector due to inconsistency in '${Resource.KEY_NAME}' fields`)
    }

    db(Resource.KEY_CONNECTORS)
      .remove({[Resource.KEY_NAME]: name,})

    db(Resource.KEY_CONNECTORS)
      .push(connector)

    res.status(200).json(connector) /** return updated connector */
  }
)

/** update existing connector meta */
app.put(`/${Resource.KEY_CONNECTORS}/:${Resource.KEY_NAME}/${Resource.KEY_STORAGE_META}`,
  Middleware.checkConnectorExists(db),
  Middleware.checkValidStorageMeta,
  (req, res) => {

    const name = req.params[Resource.KEY_NAME]
    const meta = req.body

    const connector = db(Resource.KEY_CONNECTORS)
      .find({ [Resource.KEY_NAME]: name, })

    connector[Resource.KEY_STORAGE_META] = meta

    res.status(200).json(connector) /** return updated connector */
  }
)

app.listen(app.get('port'), () => {
  console.log(`Mock storage server is running on PORT ${app.get('port')}!`)
})

