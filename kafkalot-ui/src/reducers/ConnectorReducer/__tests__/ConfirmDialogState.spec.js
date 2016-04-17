import { expect, } from 'chai'

import * as ConfirmDialogState from '../ConfirmDialogState'

describe('ConfirmDialogState', () => {
  const payload = 'payload'
  const PROP_NAME_TYPE = 'type'
  const PROP_NAME_PAYLOAD = 'payload'

  const EXPECTED_ACTIONS = [
    { name: 'openConfirmDialogToRemove', type: ConfirmDialogState.ActionType.OPEN_CONFIRM_DIALOG_TO_REMOVE, },
    { name: 'closeConfirmDialog', type: ConfirmDialogState.ActionType.CLOSE_CONFIRM_DIALOG, },
  ]

  EXPECTED_ACTIONS.map(({ name, type, }) => {
    it(`should provide ${name} which return ${type} type`, () => {
      const result = ConfirmDialogState.Action[name](payload)
      expect(result[PROP_NAME_PAYLOAD]).to.equal(payload)
      expect(result[PROP_NAME_TYPE]).to.equal(type)
    })
  })
})
