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

      const handler = Handler.handleOpenEditorDialogToEdit

      it(`should
        - select Selector.getSelectedContainer
        - call fetchJobConfig with (container, name)
        - put fetchJobConfigSucceeded with { name, readonly, job: updatedJob }
        `, () => {

        const [name, readonly,] = [ 'job01', false, ]
        const payload = { [ITEM_PROPERTY.name]: name, readonly, }
        const action = { payload, }
        const updatedJob = { [ITEM_PROPERTY.name]: name, }
        const container = 'container'

        const gen = handler(action)

        expect(gen.next().value).to.deep.equal(
          select(Selector.getSelectedContainer)
        )

        expect(gen.next(container).value).to.deep.equal(
          call(API.fetchConfig, container, name)
        )

        expect(gen.next(updatedJob).value).to.deep.equal(
          put(EditorDialogState.Action.updateEditorDialogConfig(
              { [ITEM_PROPERTY.name]: name, readonly, job: updatedJob, }
            )
          )
        )
      })

      it(`should
        - select Selector.getSelectedContainer
        - call fetchJobConfig with (container, name)
        - if exception is occurred,
          put openErrorSnackbar with { message, error, }
        `, () => {

        const [name, readonly,] = [ 'job01', false, ]
        const payload = { [ITEM_PROPERTY.name]: name, readonly, }
        const action = { payload, }
        const container = 'container'

        const gen = handler(action)

        expect(gen.next().value).to.deep.equal(
          select(Selector.getSelectedContainer)
        )

        expect(gen.next(container).value).to.deep.equal(
          call(API.fetchConfig, container, name)
        )

        const error = new Error('error01')
        expect(gen.throw(error).value).to.deep.equal(
          put(
            ClosableSnackBarState.Action.openErrorSnackbar(
              { message: `Failed to fetch job '${container}/${name}`, error, })
          )
        )
      })
    })

    describe('handleUpdate', () => {

      const handler = Handler.handleUpdate

      it(`should
        - select Selector.getSelectedContainer
        - call updateJobConfig with (container, name, job)
        - put updatedJobSucceeded with { name, job: updatedJob }
        `, () => {

        const name = 'job01'
        const job = {[ITEM_PROPERTY.name]: name, [ITEM_PROPERTY.tags]: [],}
        const payload = {[ITEM_PROPERTY.name]: name, job,}
        const action = { payload, }
        const updatedJob = {[ITEM_PROPERTY.name]: name, [ITEM_PROPERTY.tags]: ['tag01', ],}
        const container = 'container01'

        const gen = handler(action)

        expect(gen.next().value).to.deep.equal(
          select(Selector.getSelectedContainer)
        )

        expect(gen.next(container).value).to.deep.equal(
          call(API.updateConfig, container, name, job) /** call api */
        )

        expect(gen.next(updatedJob).value).to.deep.equal(
          put(ItemState.Action.update({[ITEM_PROPERTY.name]: name, job: updatedJob,}))
        )

        expect(gen.next().value).to.deep.equal(
          put(
            ClosableSnackBarState.Action.openInfoSnackbar(
              { message: `${container}/${name} was updated`, }
            )
          )
        )
      })

      it(`should
        - select Selector.getSelectedContainer
        - call updateJobConfig with (container, name, job)
        - if exception is occurred,
          put openErrorSnackbar with { message, error, }
        `, () => {

        const name = 'job01'
        const job = { [ITEM_PROPERTY.name]: name, [ITEM_PROPERTY.tags]: [], }
        const payload = { [ITEM_PROPERTY.name]: name, job, }
        const action = { payload, }
        const container = 'container01'

        const gen = handler(action)

        expect(gen.next().value).to.deep.equal(
          select(Selector.getSelectedContainer)
        )

        expect(gen.next(container).value).to.deep.equal(
          call(API.updateConfig, container, name, job) /** call api */
        )

        const error = new Error('error01')
        expect(gen.throw(error).value).to.deep.equal(
          put(
            ClosableSnackBarState.Action.openErrorSnackbar(
              { message: `Failed to update job '${container}/${name}`, error, }
            )
          )
        )
      })

    }) /** end describe watchUpdate */

    describe('handleCreate', () => {
      const handler = Handler.handleCreate

      it(`should
        - select Selector.getSelectedContainer
        - select Selector.getJobItems
        - call createJob with (container, job)
        - call callFetchContainerJobs
        - put closeEditorDialog
        - put openInfoSnackbar
        `, () => {

        const name = 'job01'
        const job = {[ITEM_PROPERTY.name]: name, [ITEM_PROPERTY.tags]: [],}
        const payload = { job, }
        const action = { payload, }
        const existingJobs = []
        const container = 'container01'

        const gen = handler(action)

        expect(gen.next().value).to.deep.equal(
          select(Selector.getSelectedContainer)
        )

        expect(gen.next(container).value).to.deep.equal(
          select(Selector.getConnectorItems)
        )

        expect(gen.next(existingJobs).value).to.deep.equal(
          call(API.create, container, job) /** call API */
        )

        expect(gen.next().value).to.deep.equal(
          call(Handler.callFetchAll) /** fetch all jobs */
        )

        expect(gen.next().value).to.deep.equal(
          put(EditorDialogState.Action.closeEditorDialog())
        )

        expect(gen.next().value).to.deep.equal(
          put(
            ClosableSnackBarState.Action.openInfoSnackbar(
              { message: `${container}/${name} was created`, }
            )
          )
        )
      })

      it(`should
        - select Selector.getSelectedContainer
        - select Selector.getJobItems
        - if exception is occurred while validating job,
          put openErrorSnackbar with { message, error, }
        `, () => {

        const name = 'job01'
        const job = {[ITEM_PROPERTY.name]: name, [ITEM_PROPERTY.tags]: [],}
        const payload = { job, }
        const action = { payload, }
        const container = 'container01'

        const gen = handler(action)

        expect(gen.next().value).to.deep.equal(
          select(Selector.getSelectedContainer)
        )

        expect(gen.next(container).value).to.deep.equal(
          select(Selector.getConnectorItems) /** select exisintg jobs */
        )

        const error = new Error('VALIDATION FAILED')

        expect(gen.throw(error).value).to.deep.equal(
          put(
            ClosableSnackBarState.Action.openErrorSnackbar(
              { message: 'Failed to create job' , error, }
            )
          )
        )
      })

      it(`should
        - select Selector.getSelectedContainer
        - select Selector.getJobItems
        - call createJob with (container, job)
        - if exception is occurred while calling api,
          put openErrorSnackbar
        `, () => {

        const name = 'job01'
        const job = {[ITEM_PROPERTY.name]: name, [ITEM_PROPERTY.tags]: [],}
        const payload = { job, }
        const action = { payload, }
        const existingJobs = []
        const container = 'container01'

        const gen = handler(action)

        expect(gen.next().value).to.deep.equal(
          select(Selector.getSelectedContainer)
        )

        expect(gen.next(container).value).to.deep.equal(
          select(Selector.getConnectorItems) /** select exisintg jobs */
        )

        const error = new Error('VALIDATION FAILED')

        expect(gen.next(existingJobs).value).to.deep.equal(
          call(API.create, container, job) /** call API */
        )

        expect(gen.throw(error).value).to.deep.equal(
          put(
            ClosableSnackBarState.Action.openErrorSnackbar(
              { message: 'Failed to create job' , error, }
            )
          )
        )
      })

    }) /** end describe watchCreate */

    describe('handleRemove', () => {
      const handler = Handler.handleRemove

      it(`should
        - select Selector.getSelectedContainer
        - call removeJob with (name)
        - call callFetchContainerJobs
        - put openInfoSnackbar
        `, () => {

        const name = 'job01'
        const payload = { [ITEM_PROPERTY.name]: name, }
        const action = { payload, }
        const container = 'container01'

        const gen = handler(action)

        expect(gen.next().value).to.deep.equal(
          select(Selector.getSelectedContainer)
        )

        expect(gen.next(container).value).to.deep.equal(
          call(API.remove, container, name) /** call API */
        )

        expect(gen.next().value).to.deep.equal(
          call(Handler.callFetchAll) /** fetch all jobs */
        )

        expect(gen.next().value).to.deep.equal(
          put(
            ClosableSnackBarState.Action.openInfoSnackbar(
              { message: `${container}/${name} was removed`, }
            )
          )
        )
      })

      it(`should
        - select Selector.getSelectedContainer
        - call removeJob with (name)
        - if exception is occurred while calling api,
          put openErrorSnackbar
        `, () => {

        const name = 'job01'
        const payload = { [ITEM_PROPERTY.name]: name, }
        const action = { payload, }
        const container = 'container01'

        const gen = handler(action)

        expect(gen.next().value).to.deep.equal(
          select(Selector.getSelectedContainer)
        )

        expect(gen.next(container).value).to.deep.equal(
          call(API.remove, container, name) /** call API */
        )

        const error = new Error('REMOVE JOB FAILED')

        expect(gen.throw(error).value).to.deep.equal(
          put(ClosableSnackBarState.Action.openErrorSnackbar(
              { message: `Failed to remove job '${container}/${name}'` , error, }
            )
          )
        )
      })

    }) /** end describe watchRemove */

    describe('handleSetReadonly', () => {
      const handler = Handler.handleSetReadonly

      it(`should
        - select Selector.getSelectedContainer
        - call setReadonly with (name)
        - put updatedJobSucceeded with { name, job }
        `, () => {

        const name = 'job01'
        const payload = { [ITEM_PROPERTY.name]: name, }
        const action = { payload, }
        const updatedJob = { [ITEM_PROPERTY.name]: name, [SERVER_JOB_PROPERTY.enabled]: false, }
        const container = 'container01'

        const gen = handler(action)

        expect(gen.next().value).to.deep.equal(
          select(Selector.getSelectedContainer)
        )

        expect(gen.next(container).value).to.deep.equal(
          call(API.setReadonly, container, name) /** call API */
        )

        expect(gen.next(updatedJob).value).to.deep.equal(
          put(ItemState.Action.update({ [ITEM_PROPERTY.name]: name, job: updatedJob, }))
        )
      })

      it(`should
        - select Selector.getSelectedContainer
        - call setReadonly with (name)
        - if exception is occurred while calling api,
          put openErrorSnackbar
        `, () => {

        const name = 'job01'
        const payload = { [ITEM_PROPERTY.name]: name, }
        const action = { payload, }
        const container = 'container01'

        const gen = handler(action)

        expect(gen.next().value).to.deep.equal(
          select(Selector.getSelectedContainer)
        )

        expect(gen.next(container).value).to.deep.equal(
          call(API.setReadonly, container, name) /** call API */
        )

        const error = new Error('SET READONLY FAILED')

        expect(gen.throw(error).value).to.deep.equal(
          put(
            ClosableSnackBarState.Action.openErrorSnackbar(
              { message: `Failed to set readonly '${container}/${name}'` , error, }
            )
          )
        )
      })

    }) /** end describe watchSetReadonly */

    describe('handleUnsetReadonly', () => {
      const handler = Handler.handleUnsetReadonly

      it(`should
        - select Selector.getSelectedContainer
        - call unsetReadonly with (name)
        - put updateJobSucceeded with { name, job }
        `, () => {

        const name = 'job01'
        const payload = { [ITEM_PROPERTY.name]: name, }
        const action = { payload, }
        const updatedJob = { [ITEM_PROPERTY.name]: name, [SERVER_JOB_PROPERTY.enabled]: true, }
        const container = 'container01'

        const gen = handler(action)

        expect(gen.next().value).to.deep.equal(
          select(Selector.getSelectedContainer)
        )

        expect(gen.next(container).value).to.deep.equal(
          call(API.unsetReadonly, container, name) /** call API */
        )

        expect(gen.next(updatedJob).value).to.deep.equal(
          put(ItemState.Action.update({ [ITEM_PROPERTY.name]: name, connector: updatedJob, }))
        )
      })

      it(`should
        - select Selector.getSelectedContainer
        - call API.unsetReadonly with (name)
        - if exception is occurred while calling api,
          put openErrorSnackbar
        `, () => {

        const name = 'job01'
        const payload = { [ITEM_PROPERTY.name]: name, }
        const action = { payload, }
        const container = 'container01'

        const gen = handler(action)

        expect(gen.next().value).to.deep.equal(
          select(Selector.getSelectedContainer)
        )

        expect(gen.next(container).value).to.deep.equal(
          call(API.unsetReadonly, container, name) /** call API */
        )

        const error = new Error('UNSET READONLY FAILED')

        expect(gen.throw(error).value).to.deep.equal(
          put(
            ClosableSnackBarState.Action.openErrorSnackbar(
              { message: `Failed to unset readonly '${container}/${name}'` , error, }
            )
          )
        )
      })

    }) /** end describe watchSetReadonly */

    describe('handleStart', () => {
      const handler = Handler.handleStart

      it(`should
        - select Selector.getSelectedContainer
        - call startJob with (name)
        - put update with { name, connector, }
        `, () => {

        const name = 'job01'
        const payload = { [ITEM_PROPERTY.name]: name, }
        const action = { payload, }
        const updated = { [ITEM_PROPERTY.name]: name, [SERVER_JOB_PROPERTY.active]: true, }
        const container = 'container01'

        const gen = handler(action)

        expect(gen.next().value).to.deep.equal(
          select(Selector.getSelectedContainer)
        )

        expect(gen.next(container).value).to.deep.equal(
          put(ItemState.Action.startSwitching({ name, }))
        )

        expect(gen.next().value).to.deep.equal(
          call(API.start, container, name) /** call API */
        )

        expect(gen.next(updated).value).to.deep.equal(
          call(API.delay, Handler.JOB_TRANSITION_DELAY) /** wait */
        )

        expect(gen.next().value).to.deep.equal(
          put(ItemState.Action.update({ [ITEM_PROPERTY.name]: name, connector: updated, }))
        )

        expect(gen.next().value).to.deep.equal(
          put(ItemState.Action.endSwitching({ name, }))
        )
      })

      it(`should
        - select Selector.getSelectedContainer
        - put startSwitching with { name, }
        - call start with { container, name, }
        - if exception is occurred while calling api,
          put openErrorSnackbar
        - put endSwitching with { name }
        `, () => {

        const name = 'job01'
        const payload = { [ITEM_PROPERTY.name]: name, }
        const action = { payload, }
        const container = 'container01'

        const gen = handler(action)

        expect(gen.next().value).to.deep.equal(
          select(Selector.getSelectedContainer)
        )

        expect(gen.next(container).value).to.deep.equal(
          put(ItemState.Action.startSwitching({ name, }))
        )

        expect(gen.next().value).to.deep.equal(
          call(API.start, container, name) /** call API */
        )

        const error = new Error('START FAILED')

        expect(gen.throw(error).value).to.deep.equal(
          put(
            ClosableSnackBarState.Action.openErrorSnackbar(
              { message: `Failed to start job '${container}/${name}'` , error, }
            )
          )
        )

        expect(gen.next().value).to.deep.equal(
          put(ItemState.Action.endSwitching({ name, }))
        )
      })

    }) /** end describe watchStart */

    describe('handleStop', () => {
      const handler = Handler.handleStop

      it(`should
        - select Selector.getSelectedContainer
        - put startSwitching with { name, }
        - call stop with (name)
        - put update with { name, connector, }
        - put endSwitching with { name, }
        `, () => {

        const name = 'job01'
        const payload = { [ITEM_PROPERTY.name]: name, }
        const action = { payload, }
        const updated = { [ITEM_PROPERTY.name]: name, [SERVER_JOB_PROPERTY.active]: false, }
        const container = 'container01'

        const gen = handler(action)

        expect(gen.next().value).to.deep.equal(
          select(Selector.getSelectedContainer)
        )

        expect(gen.next(container).value).to.deep.equal(
          put(ItemState.Action.startSwitching({ name, }))
        )

        expect(gen.next().value).to.deep.equal(
          call(API.stop, container, name) /** call API */
        )

        expect(gen.next(updated).value).to.deep.equal(
          call(API.delay, Handler.JOB_TRANSITION_DELAY) /** wait */
        )

        expect(gen.next().value).to.deep.equal(
          put(ItemState.Action.update({ [ITEM_PROPERTY.name]: name, connector: updated, }))
        )

        expect(gen.next().value).to.deep.equal(
          put(ItemState.Action.endSwitching({ name, }))
        )
      })

      it(`should
        - select Selector.getSelectedContainer
        - put startSwitching with { name, }
        - call stopJob with (name)
        - if exception is occurred while calling api,
          put openErrorSnackbar
        - put endSwitching with { name, }
        `, () => {

        const name = 'job01'
        const payload = { [ITEM_PROPERTY.name]: name, }
        const action = { payload, }
        const container = 'container01'

        const gen = handler(action)

        expect(gen.next().value).to.deep.equal(
          select(Selector.getSelectedContainer)
        )

        expect(gen.next(container).value).to.deep.equal(
          put(ItemState.Action.startSwitching({ name, }))
        )

        expect(gen.next().value).to.deep.equal(
          call(API.stop, container, name) /** call API */
        )

        const error = new Error('STOP FAILED')

        expect(gen.throw(error).value).to.deep.equal(
          put(
            ClosableSnackBarState.Action.openErrorSnackbar(
              { message: `Failed to stop job '${container}/${name}'` , error, }
            )
          )
        )

        expect(gen.next().value).to.deep.equal(
          put(ItemState.Action.endSwitching({ name, }))
        )
      })

    }) /** end describe watchStop */


    describe('handleChangeContainerSelector', () => {
      const handler = Handler.handleChangeContainerSelector

      it(`should
        - select currentSortStrategy
        - call fetchJobs with (name)
        - put fetchJobsSucceeded with { job }
        - put sortJob with { strategy, }
        - put selectContainer with { container, }
        `, () => {

        const name = 'job01'
        const container = 'container01'
        const payload = { [ITEM_PROPERTY.name]: name, container, }
        const action = { payload, }
        const jobs = []
        const strategy = 'strategy'

        const gen = handler(action)

        expect(gen.next().value).to.deep.equal(
          select(Selector.getCurrentSortStrategy)
        )

        expect(gen.next(strategy).value).to.deep.equal(
          call(API.fetchAll, container) /** call API */
        )

        expect(gen.next(jobs).value).to.deep.equal(
          put(ItemState.Action.updateAll({ jobs, }))
        )

        expect(gen.next().value).to.deep.equal(
          put(SorterState.Action.sort({ strategy, }))
        )

        expect(gen.next().value).to.deep.equal(
          put(ContainerSelectorState.Action.selectContainer({ container, }))
        )
      })

      it(`should
        - select currentSortStrategy
        - call fetchJobs with (name)
        - if exception is occurred while calling api,
          put openErrorSnackbar
        `, () => {

        const name = 'job01'
        const container = 'container01'
        const payload = { [ITEM_PROPERTY.name]: name, container, }
        const action = { payload, }
        const strategy = 'strategy'

        const gen = handler(action)

        expect(gen.next().value).to.deep.equal(
          select(Selector.getCurrentSortStrategy)
        )

        expect(gen.next(strategy).value).to.deep.equal(
          call(API.fetchAll, container) /** call API */
        )

        const error = new Error('FETCH JOBS FAILED')

        expect(gen.throw(error).value).to.deep.equal(
          put(
            ClosableSnackBarState.Action.openErrorSnackbar(
              { message: `Failed to fetch jobs from '${container}'`, error, }
            )
          )
        )
      })

    }) /** end describe watchStop */

  }) /** end describe watchers */
})
