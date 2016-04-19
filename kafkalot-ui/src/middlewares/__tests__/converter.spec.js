import { expect, } from 'chai'

import {
  INITIAL_ITEM_STATE as INITIAL_CONNECTOR_ITEM_STATE,
  ItemProperty as CONNECTOR_PROPERTY,
  State as CONNECTOR_STATE,
  EMPTY_CONNECTOR,
} from '../../reducers/ConnectorReducer/ItemState'
import * as Converter from '../converter'

describe('converter', () => {
  describe('createConnectorState', () => {
    const connectorName = 'connector01'

    it(`should return ${CONNECTOR_STATE.RUNNING} when given connector is running and enabled`, () => {
      expect(Converter.createConnectorState(connectorName, true, true))
        .to.equal(CONNECTOR_STATE.RUNNING)
    })

    it(`should return ${CONNECTOR_STATE.WAITING} when given connector is not running but enabled`, () => {
      expect(Converter.createConnectorState(connectorName, false, true))
        .to.equal(CONNECTOR_STATE.WAITING)
    })

    it(`should return ${CONNECTOR_STATE.STOPPED} when given connector is not running and not enabled`, () => {
      expect(Converter.createConnectorState(connectorName, false, false))
        .to.equal(CONNECTOR_STATE.STOPPED)
    })

    it('should throw an error when given connector is not running and not enabled', () => {
      expect(() => Converter.createConnectorState(connectorName, true, false))
        .to.throw(Error)
    })
  })

  describe('createClientConnector', () => {
    it(`should return ${EMPTY_CONNECTOR} if exception is occurred`, () => {
      expect(Converter.createClientConnector(null, null, null))
        .to.deep.equal(EMPTY_CONNECTOR)
    })
  })
})
