import fs from 'fs-extra'
import colors from 'colors'
import cheerio from 'cheerio'

//import mainBowerFiles from 'main-bower-files'
//const files = mainBowerFiles()
//console.log(files)

const ENCODING = 'utf8'

/** copy bower_component dir to dist dir */
const bowerDir = JSON.parse(fs.readFileSync('./.bowerrc', ENCODING)).directory
const bowerDirName = bowerDir.substring(bowerDir.lastIndexOf('/') + 1, bowerDir.length)
console.log(`copying ${bowerDir} to ${bowerDirName}`.green) // eslint-disable-line no-console
fs.copySync(bowerDir, `dist/${bowerDirName}`)

/** write index.html */
const html = fs.readFileSync('src/index.html', ENCODING)
const $ = cheerio.load(html)
// $('head').prepend('<link rel="stylesheet" href="styles.css">')

fs.writeFileSync('dist/index.html', $.html(), ENCODING)

console.log('index.html written to /dist'.green) // eslint-disable-line no-console
