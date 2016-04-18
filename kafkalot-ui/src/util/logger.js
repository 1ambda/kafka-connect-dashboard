
import { NODE_ENV, } from '../constants/config'

export function isLoggerDisabled() {
  return (NODE_ENV === 'test')
}

export function error(message) {
  if (isLoggerDisabled()) return

  /* eslint-disable no-console */
  console.error(message)
  /* eslint-enable no-console */
}

export function warn(message) {
  if (isLoggerDisabled()) return

  /* eslint-disable no-console */
  console.warn(message)
  /* eslint-enable no-console */
}

export function info(message) {
  if (isLoggerDisabled()) return

  /* eslint-disable no-console */
  console.info(message)
  /* eslint-enable no-console */
}
