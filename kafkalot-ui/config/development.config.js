export const defaultContainers = [
  { name: 'kafka-rest', address: 'http://localhost:3002', },
]

export const defaultStorage = 'http://localhost:3003'

/** exposed variables, should be stringified if it is string */
export const CONTAINERS = JSON.stringify(defaultContainers)
export const STORAGE = JSON.stringify(defaultStorage)
export const TITLE = JSON.stringify('Kafkalot')
export const PAGINATOR_ITEM_COUNT = 5
