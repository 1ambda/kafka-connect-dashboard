import { expect, } from 'chai'
import { take, put, call, fork, select, } from 'redux-saga/effects'

import { Action as SorterAction, } from '../../reducers/ConnectorReducer/SorterState'
import { Action as ConnectorItemAction, }from '../../reducers/ConnectorReducer/ItemState'
import { Action as ContainerSelectorAction, } from '../../reducers/ConnectorReducer/ContainerSelectorState'

import * as SagaAction from '../SagaAction'
import * as Selector from '../../reducers/ConnectorReducer/selector'
import * as API from '../api'
import * as Handler from '../handler'

describe('handler', () => {

  describe('utils', () => {

    describe('callFetchAll', () => {

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

      const gen = Handler.callFetchAll()

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

  })

  describe('handlers', () => {

    describe('handleOpenEditorDialogToEdit', () => {

    }) /** end handleOpenEditorDialogToEdit */

  }) /** end describe watchers */
})
