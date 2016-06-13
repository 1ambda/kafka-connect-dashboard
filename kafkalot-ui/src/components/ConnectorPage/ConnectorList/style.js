import * as Theme from '../../../constants/Theme'

export const list = { marginTop: 20, }
export const TableContainer = { marginTop: 30, marginBottom: 50, }
export const HeaderContainer = { background: Theme.ConnectorList.Header, }
export const BodyContainer = { paddingTop: 0, paddingBottom: 0, }

const HeaderFontWeight = 400

export const ItemHeaderColumn = {
  container: { padding: '10px 10px 10px 10px', },
  checkbox: { marginLeft: 15, },
  stateIcon: { width: 50, },
  stateText: { marginLeft: 15, width: 120, fontWeight: HeaderFontWeight, },
  taskText: { width: 120, fontWeight: HeaderFontWeight, },
  name: { width: 280, fontWeight: HeaderFontWeight, },
  uptime: { width: 150, fontWeight: HeaderFontWeight, },
}

const CommandButtonMarginLeft = 10

export const ItemBodyColumn = {
  container: { padding: '3px 13px 3px 13px', },
  checkbox: { marginLeft: 15, },
  stateIcon: { width: ItemHeaderColumn.stateIcon.width, textAlign: 'center', },
  stateText: { marginLeft: ItemHeaderColumn.stateText.marginLeft, width: ItemHeaderColumn.stateText.width, },
  taskText: { width: ItemHeaderColumn.taskText.width, },
  name: { width: ItemHeaderColumn.name.width, },
  uptime: { width: ItemHeaderColumn.uptime.width, },
  commandButtons: { marginTop: 8, marginRight: 35, float: 'right', },
  commandButtonLabel: { fontWeight: 300, },
  commandButton: { marginLeft: CommandButtonMarginLeft, },
}

export const TaskColumn = {
  container: { marginLeft: 55, padding: '2px 10px 2px 10px', },
  taskId: { width: 50, },
  stateIcon: { width: 50, textAlign: 'center', },
  stateText: { marginLeft: 20, width: 120, },
  workerId: { marginLeft: 30, width: 150, },
  commandButtons: { marginTop: 8, marginRight: 35, float: 'right', },
  traceButton: {
    marginLeft: CommandButtonMarginLeft,
    color: Theme.ConnectorTaskItem.TraceButton,
  },
}

