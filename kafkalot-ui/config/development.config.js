export const defaultStorages = [
  { name: 'kafka-storage', address: 'http://localhost:3003', },
]

/** exposed variables, should be stringified if it is string */
export const STORAGES = JSON.stringify(defaultStorages)
export const TITLE = JSON.stringify('Kafkalot')
