import { expect, } from 'chai'

import * as SagaAction from '../SagaAction'

describe('SagaAction', () => {
  const payload = 'payload'
  const PROP_NAME_TYPE = 'type'
  const PROP_NAME_PAYLOAD = 'payload'

  const EXPECTED_ACTIONS = [

    /** job items */
    { name: 'create', type: SagaAction.ActionType.CREATE, },
    { name: 'remove', type: SagaAction.ActionType.REMOVE, },
    { name: 'update', type: SagaAction.ActionType.UPDATE, },
    { name: 'changeContainer', type: SagaAction.ActionType.CHANGE_CONTAINER, },

    { name: 'unsetReadonly', type: SagaAction.ActionType.UNSET_READONLY, },
    { name: 'setReadonly', type: SagaAction.ActionType.SET_READONLY, },
    { name: 'start', type: SagaAction.ActionType.START, },
    { name: 'stop', type: SagaAction.ActionType.STOP, },

    /** dialog */
    { name: 'openEditorDialogToEdit', type: SagaAction.ActionType.OPEN_EDITOR_DIALOG_TO_EDIT, },
  ]

  EXPECTED_ACTIONS.map(({ name, type, }) => {
    it(`should provide ${name} which return ${type} type`, () => {
      const result = SagaAction.Action[name](payload)
      expect(result[PROP_NAME_PAYLOAD]).to.equal(payload)
      expect(result[PROP_NAME_TYPE]).to.equal(type)
    })
  })
})
