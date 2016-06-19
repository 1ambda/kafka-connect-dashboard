import fs from 'fs-extra'
import cheerio from 'cheerio'
import colors from 'colors'

import { OUTPUT_DIR, } from './buildConfig'
const ENCODING = 'utf8'

/** copy bower_component dir to dist dir */
const bowerDir = JSON.parse(fs.readFileSync('./.bowerrc', ENCODING)).directory
const bowerDirName = bowerDir.substring(bowerDir.lastIndexOf('/') + 1, bowerDir.length)
const outputBowerDir = `${OUTPUT_DIR}/${bowerDirName}`

console.log(`copying ${bowerDir} to ${outputBowerDir}`.green) // eslint-disable-line no-console
fs.copySync(bowerDir, outputBowerDir)

/** write index.html */
const html = fs.readFileSync('src/index.html', ENCODING)
const $ = cheerio.load(html)

console.log(`index.html written to ${OUTPUT_DIR}`.green) // eslint-disable-line no-console
fs.writeFileSync(`${OUTPUT_DIR}/index.html`, $.html(), ENCODING)
