const envContainers = process.env.KAFKALOT_CONTAINERS
export const defaultContainers = [
    { name: 'local', address: 'http://localhost:8083', },
  ]
export const title = process.env.KAFKALOT_TITLE || 'Kafkalot'
const envPaginatorItemCount = process.env.KAFKALOT_PAGINATOR_ITEM_COUNT

/** exposed variables, should be stringified if it is string */
export const CONTAINERS = (envContainers === void 0) ?
  JSON.stringify(defaultContainers) : envContainers /** envContainer is already stringified */

export const TITLE = JSON.stringify(title)
export const PAGINATOR_ITEM_COUNT = (envPaginatorItemCount === void 0) ?
    10 : parseInt(envPaginatorItemCount)
