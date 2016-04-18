import { expect, } from 'chai'
import { fork, take, call, put, select, } from 'redux-saga/effects'
import { takeEvery, } from 'redux-saga'

import * as ClosableSnackBarState from '../../reducers/ConnectorReducer/ClosableSnackbarState'
import * as SagaAction from '../SagaAction'

import * as Selector from '../../reducers/ConnectorReducer/selector'

import * as API from '../api'
import * as Handler from '../handler'
import rootSaga, * as Sagas from '../sagas'

describe('sagas', () => {

  const takeEveryWatcherProps = [
    {
      actionType: SagaAction.ActionType.OPEN_EDITOR_DIALOG_TO_EDIT,
      watcher: Sagas.watchOpenEditorDialogToEdit,
      handler: Handler.handleOpenEditorDialogToEdit,
    },
    {
      actionType: SagaAction.ActionType.UPDATE,
      watcher: Sagas.watchUpdate,
      handler: Handler.handleUpdate,
    },
    {
      actionType: SagaAction.ActionType.CREATE,
      watcher: Sagas.watchCreate,
      handler: Handler.handleCreate,
    },
    {
      actionType: SagaAction.ActionType.REMOVE,
      watcher: Sagas.watchRemove,
      handler: Handler.handleRemove,
    },
    {
      actionType: SagaAction.ActionType.SET_READONLY,
      watcher: Sagas.watchSetReadonly,
      handler: Handler.handleSetReadonly,
    },
    {
      actionType: SagaAction.ActionType.UNSET_READONLY,
      watcher: Sagas.watchUnsetReadonly,
      handler: Handler.handleUnsetReadonly,
    },
    {
      actionType: SagaAction.ActionType.START,
      watcher: Sagas.watchStart,
      handler: Handler.handleStart,
    },
    {
      actionType: SagaAction.ActionType.STOP,
      watcher: Sagas.watchStop,
      handler: Handler.handleStop,
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

  describe('initialize', () => {
    it('should callFetchAll', () => {
      const gen = Sagas.initialize()
      expect(gen.next().value).to.deep.equal(
        call(Handler.callFetchAll)
      )

      expect(gen.next().done).to.deep.equal(true)
    })

    it(`should callFetchJobs
        - if exception is occurred,
          put(openErrorSnackbar with { message, error }`, () => {
      const gen = Sagas.initialize()

      expect(gen.next().value).to.deep.equal(
        call(Handler.callFetchAll)
      )

      const error = new Error('error')
      expect(gen.throw(error).value).to.deep.equal(
        put(ClosableSnackBarState.Action.openErrorSnackbar({ message: 'Failed to fetch all connectors', error, }))
      )
    })
  })

  describe('RootSaga', () => {
    it(`should
        - fork callFetchJobs to initialize
        - fork other watchers
        `, () => {

      const gen = rootSaga()

      /** initialize */
      expect(gen.next().value).to.deep.equal( [
          fork(Sagas.initialize),
          fork(Sagas.watchOpenEditorDialogToEdit),
          fork(Sagas.watchUpdate),
          fork(Sagas.watchRemove),
          fork(Sagas.watchCreate),
          fork(Sagas.watchSetReadonly),
          fork(Sagas.watchUnsetReadonly),
          fork(Sagas.watchStart),
          fork(Sagas.watchStop),
          fork(Sagas.watchChangeContainer),
        ]
      )
    })
  })

})
