import { ConnectorState, } from './ConnectorState'

export const SorterType = {
  CHECKED: 'CHECKED',  
  UNCHECKED: 'UNCHECKED', 
}

export const AvailableSorters = [
  ConnectorState.RUNNING,
  ConnectorState.UNASSIGNED,
  ConnectorState.PAUSED,
  ConnectorState.FAILED,
  ConnectorState.REGISTERED,
  ConnectorState.DISABLED,
  SorterType.CHECKED,
  SorterType.UNCHECKED,
]
