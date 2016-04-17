import { expect, } from 'chai'
import { fork, take, call, put, select, } from 'redux-saga/effects'

import * as API from '../api'
import * as Converter from '../converter'

describe('api', () => {
  // TODO, how to test `getContainerConnectorConfigUrl`?

  describe('High-level APIs', () => {

    describe(`${API.start.name}`, () => {
      it(`should call ${API.patchState.name} passing ${Converter.SERVER_JOB_PROPERTY.active} field only`, () => {
        const container = 'container01'
        const jobId = 'job01'
        const gen = API.start(container, jobId)
        expect(gen.next().value).to.deep.equal(
          call(API.patchState, container, jobId, Converter.createStateToStartJob())
        )
      })
    })

    describe(`${API.stop.name}`, () => {
      it(`should call ${API.patchState.name} passing ${Converter.SERVER_JOB_PROPERTY.active} field only`, () => {
        const container = 'container01'
        const jobId = 'job01'
        const gen = API.stop(container, jobId)
        expect(gen.next().value).to.deep.equal(
          call(API.patchState, container, jobId, Converter.createStateToStopJob())
        )
      })
    })

    describe(`${API.setReadonly.name}`, () => {
      it(`should call ${API.patchConfig.name} passing ${Converter.SERVER_JOB_PROPERTY.enabled} field only`, () => {
        const container = 'container01'
        const jobId = 'job01'
        const gen = API.setReadonly(container, jobId)
        expect(gen.next().value).to.deep.equal(
          call(API.patchConfig, container, jobId, Converter.createConfigToSetReadonly())
        )
      })
    })

    describe(`${API.unsetReadonly.name}`, () => {
      it(`should call ${API.patchConfig.name} passing ${Converter.SERVER_JOB_PROPERTY.enabled} field only`, () => {
        const container = 'container01'
        const jobId = 'job01'
        const gen = API.unsetReadonly(container, jobId)
        expect(gen.next().value).to.deep.equal(
          call(API.patchConfig, container, jobId, Converter.createConfigToUnsetReadonly())
        )
      })
    })

  })
})
