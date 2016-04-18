import { expect, } from 'chai'
import { take, put, call, fork, select, } from 'redux-saga/effects'

import * as FilterState from '../../reducers/ConnectorReducer/FilterState'
import * as SorterState from '../../reducers/ConnectorReducer/SorterState'
import * as PaginatorState from '../../reducers/ConnectorReducer/PaginatorState'
import * as ItemState from '../../reducers/ConnectorReducer/ItemState'
import * as ContainerSelectorState from '../../reducers/ConnectorReducer/ContainerSelectorState'
import * as EditorDialogState from '../../reducers/ConnectorReducer/EditorDialogState'
import * as ConfirmDialogState from '../../reducers/ConnectorReducer/ConfirmDialogState'
import * as ClosableSnackBarState from '../../reducers/ConnectorReducer/ClosableSnackbarState'

import * as SagaAction from '../SagaAction'

import { ITEM_PROPERTY, } from '../../reducers/ConnectorReducer/ItemState'
import { SERVER_JOB_PROPERTY, } from '../../middlewares/converter'
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
        put(ItemState.Action.updateAll({ connectors: jobs, }))
      )

      expect(gen.next().value).to.deep.equal(
        put(SorterState.Action.sort({ strategy: sortStrategy, }))
      )

      expect(gen.next().value).to.deep.equal(
        put(ContainerSelectorState.Action.selectContainer({ container, }))
      )
    })

  })

  describe('handlers', () => {

    describe('handleOpenEditorDialogToEdit', () => {

    }) /** end handleOpenEditorDialogToEdit */

  }) /** end describe watchers */
})
