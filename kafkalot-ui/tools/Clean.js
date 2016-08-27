import { OUTPUT_DIR, } from './BuildConfig'

const mkdirp = require('mkdirp')
const rimraf = require('rimraf')

rimraf.sync(OUTPUT_DIR)
mkdirp.sync(OUTPUT_DIR)