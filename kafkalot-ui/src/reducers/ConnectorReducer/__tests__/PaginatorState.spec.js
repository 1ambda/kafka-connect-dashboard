import { expect, } from 'chai'

import * as PaginatorState from '../PaginatorState'

describe('PaginatorState', () => {
  const payload = 'payload'
  const PROP_NAME_TYPE = 'type'
  const PROP_NAME_PAYLOAD = 'payload'

  const EXPECTED_ACTIONS = [
    { name: 'changePageOffset', type: PaginatorState.ActionType.CHANGE_PAGE_OFFSET, },
  ]

  EXPECTED_ACTIONS.map(({ name, type, }) => {
    it(`should provide ${name} which return ${type} type`, () => {
      const result = PaginatorState.Action[name](payload)
      expect(result[PROP_NAME_PAYLOAD]).to.equal(payload)
      expect(result[PROP_NAME_TYPE]).to.equal(type)
    })
  })
})
