import { expect, } from 'chai'

import * as EditorDialogState from '../EditorDialogState'

describe('EditorDialogState', () => {
  const payload = 'payload'
  const PROP_NAME_TYPE = 'type'
  const PROP_NAME_PAYLOAD = 'payload'

  const EXPECTED_ACTIONS = [
    { name: 'openEditorDialogToCreate', type: EditorDialogState.ActionType.OPEN_EDITOR_DIALOG_TO_CREATE, },
    { name: 'closeEditorDialog', type: EditorDialogState.ActionType.CLOSE_EDITOR_DIALOG, },
  ]

  EXPECTED_ACTIONS.map(({ name, type, }) => {
    it(`should provide ${name} which return ${type} type`, () => {
      const result = EditorDialogState.Action[name](payload)
      expect(result[PROP_NAME_PAYLOAD]).to.equal(payload)
      expect(result[PROP_NAME_TYPE]).to.equal(type)
    })
  })
})
