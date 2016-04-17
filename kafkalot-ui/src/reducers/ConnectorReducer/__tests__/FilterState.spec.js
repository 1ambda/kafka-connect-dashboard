import { expect, } from 'chai'

import * as FilterState from '../FilterState'

describe('FilterState', () => {
  const payload = 'payload'
  const PROP_NAME_TYPE = 'type'
  const PROP_NAME_PAYLOAD = 'payload'

  const EXPECTED_ACTIONS = [
    { name: 'filter', type: FilterState.ActionType.FILTER, },
    { name: 'initializeFilter', type: FilterState.ActionType.INITIALIZE_FILTER, },
  ]

  EXPECTED_ACTIONS.map(({ name, type, }) => {
    it(`should provide ${name} which return ${type} type`, () => {
      const result = FilterState.Action[name](payload)
      expect(result[PROP_NAME_PAYLOAD]).to.equal(payload)
      expect(result[PROP_NAME_TYPE]).to.equal(type)
    })
  })
})
