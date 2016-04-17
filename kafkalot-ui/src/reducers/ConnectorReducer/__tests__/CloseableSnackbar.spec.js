import { expect, } from 'chai'

import * as ClosableSnackbarState from '../ClosableSnackbarState'

describe('ClosableSnackbarState', () => {
  const payload = 'payload'
  const PROP_NAME_TYPE = 'type'
  const PROP_NAME_PAYLOAD = 'payload'

  const EXPECTED_ACTIONS = [
    { name: 'openInfoSnackbar', type: ClosableSnackbarState.ActionType.OPEN_INFO_SNACKBAR, },
    { name: 'openErrorSnackbar', type: ClosableSnackbarState.ActionType.OPEN_ERROR_SNACKBAR, },
    { name: 'closeSnackbar', type: ClosableSnackbarState.ActionType.CLOSE_SNACKBAR, },
  ]

  EXPECTED_ACTIONS.map(({ name, type, }) => {
    it(`should provide ${name} which return ${type} type`, () => {
      const result = ClosableSnackbarState.Action[name](payload)
      expect(result[PROP_NAME_PAYLOAD]).to.equal(payload)
      expect(result[PROP_NAME_TYPE]).to.equal(type)
    })
  })
})
