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

app.get(`/${Res.KEY_CONNECTORS}`,
  (req, res) => {
    res.json(db(Res.KEY_CONNECTORS))
  }
)

app.listen(app.get('port'), () => {
  console.log(`Mock server is running on PORT ${app.get('port')}!`)
})

