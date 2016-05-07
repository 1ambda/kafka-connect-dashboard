import { expect, } from 'chai'
import { fork, take, call, put, select, } from 'redux-saga/effects'
import { takeEvery, } from 'redux-saga'

import * as ClosableSnackBarState from '../../reducers/ConnectorReducer/ClosableSnackbarState'
import * as Selector from '../../reducers/ConnectorReducer/selector'
import * as API from '../api'
import * as Handler from '../handler'
import RootSaga, { ActionType as SagaActionType, Action as SagaAction, } from '../sagas'
import * as Watcher from '../sagas'

describe('sagas', () => {

  describe('SagaAction', () => {
    const payload = 'payload'
    const PROP_NAME_TYPE = 'type'
    const PROP_NAME_PAYLOAD = 'payload'

    const EXPECTED_ACTIONS = [
      { name: 'create', type: SagaActionType.CREATE, },
      { name: 'remove', type: SagaActionType.REMOVE, },
      { name: 'update', type: SagaActionType.UPDATE, },

      { name: 'changeStorage', type: SagaActionType.CHANGE_STORAGE, },

      { name: 'unsetReadonly', type: SagaActionType.UNSET_READONLY, },
      { name: 'setReadonly', type: SagaActionType.SET_READONLY, },
      { name: 'start', type: SagaActionType.START, },
      { name: 'stop', type: SagaActionType.STOP, },

      { name: 'openEditorDialogToEdit', type: SagaActionType.OPEN_EDITOR_DIALOG_TO_EDIT, },
    ]

    EXPECTED_ACTIONS.map(({ name, type, }) => {
      it(`should provide ${name} which return ${type} type`, () => {
        const result = SagaAction[name](payload)
        expect(result[PROP_NAME_PAYLOAD]).to.equal(payload)
        expect(result[PROP_NAME_TYPE]).to.equal(type)
      })
    })
  })

  const takeEveryWatcherProps = [
    {
      actionType: SagaActionType.OPEN_EDITOR_DIALOG_TO_EDIT,
      watcher: Watcher.watchOpenEditorDialogToEdit,
      handler: Handler.handleOpenEditorDialogToEdit,
    },
  ]

  takeEveryWatcherProps.map(watcherProp => {
    describe('watchOpenEditorDialogToEdit', () => {
      const actionType = watcherProp.actionType
      const watcher = watcherProp.watcher
      const handler = watcherProp.handler
      it(`should
        - take (${actionType}
        - call ${handler.name})`, () => {

        const gen = watcher()
        const action = { payload: {}, }

        expect(gen.next().value).to.deep.equal(
          take(actionType)
        )

        expect(gen.next(action).value).to.deep.equal(
          fork(handler, action)
        )
      })
    })
  })

  describe('RootSaga', () => {
    it(`should
        - fork Handler.initialize
        - fork other watchers
        `, () => {

      const gen = RootSaga()

      expect(gen.next().value).to.deep.equal( [
          fork(Handler.initialize),
          fork(Watcher.watchOpenEditorDialogToEdit),
          fork(Watcher.watchSetReadonly),
          fork(Watcher.watchUnsetReadonly),
          fork(Watcher.watchCreate),
          fork(Watcher.watchUpdate),
          fork(Watcher.watchRemove),
        ]
      )
    })
  })

})
