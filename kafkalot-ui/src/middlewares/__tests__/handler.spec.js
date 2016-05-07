import { expect, } from 'chai'
import { take, put, call, fork, select, } from 'redux-saga/effects'

import { Action as SorterAction, } from '../../reducers/ConnectorReducer/SorterState'
import { Action as ConnectorItemAction, }from '../../reducers/ConnectorReducer/ItemState'
import { Action as StorageSelectorAction, } from '../../reducers/ConnectorReducer/StorageSelectorState'

import * as Selector from '../../reducers/ConnectorReducer/selector'
import * as API from '../api'
import * as Handler from '../handler'

describe('Handler', () => {

  describe('utils', () => {

  }) /** end describe for utils */

  describe('handlers', () => {

    describe('handleOpenEditorDialogToEdit', () => {

    }) /** end handleOpenEditorDialogToEdit */

    describe('handleSetReadonly', () => {

    }) /** end handleSetReadonly */


  }) /** end describe for handlers */
})
