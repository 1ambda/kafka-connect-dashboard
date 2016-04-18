import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import * as Resource from './resource'

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

function sendErrorMessage(res, status, message) {
  res.status(status).json({
    "error_code": status,
    "message": message,
  })
}

function isBoolean(variable) {
  return typeof variable === 'boolean'
}

function checkConnectorExists(req, res, next) {
  const name = req.params[Resource.KEY_NAME]

  const connector = db(Resource.KEY_CONNECTORS)
    .find({ [Resource.KEY_NAME]: name, })

  if (connector === void 0) {
    sendErrorMessage(res, 404, `Can't found connector ${name}`)
  } else {
    req[Resource.KEY_CONNECTOR] = connector
    next()
  }
}

app.get(`/${Resource.KEY_CONNECTORS}`,
  (req, res) => {
    res.json(db(Resource.KEY_CONNECTORS))
  }
)

app.get(`/${Resource.KEY_CONNECTORS}/:${Resource.KEY_NAME}`,
  checkConnectorExists,
  (req, res) => {

    res.json(req[Resource.KEY_CONNECTOR])
  }
)

app.patch(`/${Resource.KEY_CONNECTORS}/:${Resource.KEY_NAME}`,
  checkConnectorExists,
  (req, res) => {

    const connector = req[Resource.KEY_CONNECTOR]
    const requestedMeta = req.body[Resource.KEY_STORAGE_META]

    try {
      let currentMeta = connector[Resource.KEY_STORAGE_META]
      connector[Resource.KEY_STORAGE_META] = Object.assign({}, currentMeta, requestedMeta)
      res.json(connector)
    } catch (error) {
      console.error(error)
      sendErrorMessage(res, 400, `Failed to patch connector (${error.message})`)
    }
  }
)

app.listen(app.get('port'), () => {
  console.log(`Mock server is running on PORT ${app.get('port')}!`)
})

