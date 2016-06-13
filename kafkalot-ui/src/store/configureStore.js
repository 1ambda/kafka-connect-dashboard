import { NODE_ENV, ENV_PROD, } from '../constants/Config'

if (NODE_ENV === ENV_PROD) { module.exports = require('./configureStore.prod') }
else { module.exports = require('./configureStore.dev') }
