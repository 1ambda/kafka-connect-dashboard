import { NODE_ENV, } from '../constants/Config'

export function isLoggerDisabled() {
  return (NODE_ENV === 'test')
}

export const Tag = {
  ERROR: '[ERROR]',
  WARN: '[WARN]',
  INFO: '[INFO]',
}

export function error(message, error) {
  if (isLoggerDisabled()) return

  /* eslint-disable no-console */
  console.error(`${Tag.ERROR}: ${message}`)

  if (error !== void 0) console.error(error.stack)
  /* eslint-enable no-console */
}

export function warn(message) {
  if (isLoggerDisabled()) return

  /* eslint-disable no-console */
  console.warn(`${Tag.WARN}: ${message}`)
  /* eslint-enable no-console */
}

export function info(message) {
  if (isLoggerDisabled()) return

  /* eslint-disable no-console */
  console.info(`${Tag.INFO}: ${message}`)
  /* eslint-enable no-console */
}
