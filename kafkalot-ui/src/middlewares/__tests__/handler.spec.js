import { expect, } from 'chai'
import { take, put, call, fork, select, } from 'redux-saga/effects'

import { Action as SorterAction, } from '../../reducers/ConnectorReducer/SorterState'
import { Action as ConnectorItemAction, }from '../../reducers/ConnectorReducer/ItemState'
import { Action as ContainerSelectorAction, } from '../../reducers/ConnectorReducer/ContainerSelectorState'

import * as Selector from '../../reducers/ConnectorReducer/selector'
import * as API from '../api'
import * as Handler from '../handler'

describe('Handler', () => {

  describe('utils', () => {

    describe('fetchAndUpdateAll', () => {

      it(`should
          - select Selector.getSelectedContainer
          - select Selector.getCurrentStarategy
          - call fetchContainerJobs with { container, }
          - put fetchContainerJobSucceeded with { jobs }
          - put sortJob { strategy, }
          - put selectContainer { container, }
        `)

      const container = 'container01'
      const sortStrategy = 'strategy'
      const jobs = []

      const gen = Handler.fetchAndUpdateAll()

      expect(gen.next().value).to.deep.equal(
        select(Selector.getSelectedContainer)
      )

      expect(gen.next(container).value).to.deep.equal(
        select(Selector.getCurrentSortStrategy)
      )

      expect(gen.next(sortStrategy).value).to.deep.equal(
        call(API.fetchAll, container)
      )

      expect(gen.next(jobs).value).to.deep.equal(
        put(ConnectorItemAction.updateAll({ connectors: jobs, }))
      )

      expect(gen.next().value).to.deep.equal(
        put(SorterAction.sort({ strategy: sortStrategy, }))
      )

      expect(gen.next().value).to.deep.equal(
        put(ContainerSelectorAction.selectContainer({ container, }))
      )
    })

  }) /** end describe for utils */

  describe('handlers', () => {

    describe('handleOpenEditorDialogToEdit', () => {

    }) /** end handleOpenEditorDialogToEdit */

    describe('handleSetReadonly', () => {

    }) /** end handleSetReadonly */

    //describe('initialize', () => {
    //  it('should fetchAndUpdateAll', () => {
    //    const gen = Sagas.initialize()
    //    expect(gen.next().value).to.deep.equal(
    //      call(Handler.fetchAndUpdateAll)
    //    )
    //
    //    expect(gen.next().done).to.deep.equal(true)
    //  })
    //
    //  it(`should callFetchJobs
    //    - if exception is occurred,
    //      put(openErrorSnackbar with { message, error }`, () => {
    //    const gen = Sagas.initialize()
    //
    //    expect(gen.next().value).to.deep.equal(
    //      call(Handler.fetchAndUpdateAll)
    //    )
    //
    //    const error = new Error('error')
    //    expect(gen.throw(error).value).to.deep.equal(
    //      put(ClosableSnackBarState.Action.openErrorSnackbar({ message: 'Failed to fetch all connectors', error, }))
    //    )
    //  })
    //})



  }) /** end describe for handlers */
})
