import { expect, } from 'chai'

import * as URL from '../url'

describe('middlewares/url', () => {
  /** fixtures */
  const containers = [
    { [URL.STORAGE_PROPERTY.name]: 'container01', [URL.STORAGE_PROPERTY.address]: 'address01', },
    { [URL.STORAGE_PROPERTY.name]: 'container02', [URL.STORAGE_PROPERTY.address]: 'address02', },
    { [URL.STORAGE_PROPERTY.name]: 'container03', [URL.STORAGE_PROPERTY.address]: '', },
    { [URL.STORAGE_PROPERTY.name]: 'container04', [URL.STORAGE_PROPERTY.address]: 'address04', },
    { [URL.STORAGE_PROPERTY.name]: 'container04', [URL.STORAGE_PROPERTY.address]: 'address05', },
  ]
})

