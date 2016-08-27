import moment from 'moment'
import colors from 'colors'

const prefix = 'KAFKALOT-UI'

function getNow() {
  return moment().format("YYYY-MM-DD HH:mm:ss:SSS")
}

export function info(tag, message) {
  const now = getNow()

  const TAG = (tag === '' || tag === void 0) ? '': `${tag.magenta}|`
  console.log(`[${prefix.blue}|${TAG}${now.cyan}] (${'INFO'.green})  ${message}`) // eslint-disable-line no-console
}

export function warn(tag, message) {
  const now = getNow()

  const TAG = (tag === '' || tag === void 0) ? '': `${tag.magenta}|`
  console.log(`[${prefix.blue}|${TAG}${now.cyan}] (${'WARN'.yellow})  ${message}`) // eslint-disable-line no-console
}

export function error(tag, message) {
  const now = getNow()
  const TAG = (tag === '' || tag === void 0) ? '': `${tag.magenta}|`

  console.log(`[${prefix.blue}|${TAG}${now.cyan}] (${'ERROR'.red}) ${message}`) // eslint-disable-line no-console
}
