import fs from 'fs-extra'
import cheerio from 'cheerio'

import * as Logger from './BuildLogger'
import { OUTPUT_DIR, } from './BuildConfig'

const ENCODING = 'utf8'
const TAG = 'BuildHtml'

/** copy bower_component dir to dist dir */
const bowerDir = JSON.parse(fs.readFileSync('./.bowerrc', ENCODING)).directory
const bowerDirName = bowerDir.substring(bowerDir.lastIndexOf('/') + 1, bowerDir.length)
const outputBowerDir = `${OUTPUT_DIR}/${bowerDirName}`

Logger.info(TAG, `copying ${bowerDir} to ${outputBowerDir}`)
fs.copySync(bowerDir, outputBowerDir)

/** write index.html */
const html = fs.readFileSync('src/index.html', ENCODING)
const $ = cheerio.load(html)

Logger.info(TAG, `index.html written to ${OUTPUT_DIR}`)
fs.writeFileSync(`${OUTPUT_DIR}/index.html`, $.html(), ENCODING)
