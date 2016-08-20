/** injected by webpack, see also `tools/config.js` */

export const ENV_DEV = process.env.ENV_DEV || ''
export const ENV_PROD = process.env.ENV_PROD || ''
export const NODE_ENV = process.env.NODE_ENV || ''

const envStorages = process.env.STORAGES
export const STORAGES = (envStorages === void 0) ? [] : envStorages
export const TITLE = process.env.TITLE || ''

