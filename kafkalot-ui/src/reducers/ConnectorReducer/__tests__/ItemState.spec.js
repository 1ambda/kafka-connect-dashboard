import { expect, } from 'chai'

import {
  ActionType, Action, State, ItemProperty, INITIAL_ITEM_STATE,
  isRunning, isStopped, isWaiting,
} from '../ItemState'
import * as SorterState from '../SorterState'

describe('ItemState', () => {
  const payload = 'payload'
  const PROP_NAME_TYPE = 'type'
  const PROP_NAME_PAYLOAD = 'payload'

  const EXPECTED_ACTIONS = [
    { name: 'startSwitching', type: ActionType.START_SWITCHING, },
    { name: 'endSwitching', type: ActionType.END_SWITCHING, },
    { name: 'updateAll', type: ActionType.UPDATE_ALL, },
    { name: 'update', type: ActionType.UPDATE, },
  ]

  EXPECTED_ACTIONS.map(({ name, type, }) => {
    it(`should provide ${name} which return ${type} type`, () => {
      const result = Action[name](payload)
      expect(result[PROP_NAME_PAYLOAD]).to.equal(payload)
      expect(result[PROP_NAME_TYPE]).to.equal(type)
    })
  })
})
