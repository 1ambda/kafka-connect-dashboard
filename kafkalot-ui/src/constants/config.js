/** injected by webpack, see also `tools/config.js` */

export const ENV_DEV = process.env.ENV_DEV || ''
export const ENV_PROD = process.env.ENV_PROD || ''
export const NODE_ENV = process.env.NODE_ENV || ''

const envContainers = process.env.CONTAINERS
export const CONTAINERS = (envContainers === void 0) ? [] : envContainers
export const TITLE = process.env.TITLE || ''

const envStorage = process.env.STORAGE
export const STORAGE = (envStorage === void 0) ? '' : envStorage

const envPaginatorItemCount = process.env.PAGINATOR_ITEM_COUNT
export const PAGINATOR_ITEM_COUNT_PER_PAGE =
  (envPaginatorItemCount  === void 0) ? 6 : parseInt(envPaginatorItemCount)
