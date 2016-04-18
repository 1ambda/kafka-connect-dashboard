import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import * as Res from './resource'

const db = Res.STORAGE_DB
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
    res.json(db(Res.KEY_CONNECTORS))
  }
)

app.get(`/${Res.KEY_CONNECTORS}/:${Res.KEY_NAME}`,
  checkConnectorExists,
  (req, res) => {

    res.json(req[Res.KEY_CONNECTOR])
  }
)

app.listen(app.get('port'), () => {
  console.log(`Mock server is running on PORT ${app.get('port')}!`)
})

