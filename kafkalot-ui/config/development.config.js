export const defaultContainers = [
  { name: 'kafka-rest', address: 'http://localhost:3002', },
]

/** exposed variables, should be stringified if it is string */
export const CONTAINERS = JSON.stringify(defaultContainers)
export const TITLE = JSON.stringify('Kafkalot')
export const PAGINATOR_ITEM_COUNT = 5
