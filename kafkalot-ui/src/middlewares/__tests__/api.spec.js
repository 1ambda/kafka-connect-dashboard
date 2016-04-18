import { expect, } from 'chai'
import { fork, take, call, put, select, } from 'redux-saga/effects'

import * as API from '../api'
import * as Converter from '../converter'

describe('api', () => {
  describe('High-level APIs', () => {

    //describe(`${API.start.name}`, () => {
    //  it(`should call ${API.patchState.name} passing ${Converter.SERVER_JOB_PROPERTY.active} field only`, () => {
    //    const container = 'container01'
    //    const connectorName = 'job01'
    //    const gen = API.start(container, connectorName)
    //    expect(gen.next().value).to.deep.equal(
    //      call(API.patchState, container, connectorName, Converter.createStateToStartJob())
    //    )
    //  })
    //})

  })
})
