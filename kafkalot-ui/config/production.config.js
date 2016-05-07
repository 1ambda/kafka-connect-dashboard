const envStorages = process.env.KAFKALOT_STORAGES
const envTitle = process.env.KAFKALOT_TITLE
const envPaginatorItemCount = process.env.KAFKALOT_PAGINATOR_ITEM_COUNT

/** exposed variables, should be stringified if it is string */
export const STORAGES = (envStorages === void 0) ?
  JSON.stringify([
    { name: 'kafka-rest', address: 'http://localhost:8081', },
  ]) : envStorages /** envContainer is already stringified */


export const TITLE = (envTitle === void 0) ?
  JSON.stringify('Kafkalot') : JSON.stringify(envTitle)

export const PAGINATOR_ITEM_COUNT = (envPaginatorItemCount === void 0) ?
    10 : parseInt(envPaginatorItemCount)
