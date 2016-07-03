const CommandButtonLeftMargin = 15

export const CommandButton = {
  RightButton: { marginLeft: CommandButtonLeftMargin, float: 'right', },
  ExecuteButton: { marginLeft: CommandButtonLeftMargin, },
  ExecuteButtonColor: '#546e7a',
  ButtonLabel: { fontWeight: 300, color: '#f5f5f5', },
  Container: { fontSize: 15, fontWeight: 300, marginTop: 30, },
  Selector: { width: 100, top: 5, },
}

export const title = { fontSize: 30, fontWeight: 100, marginTop: 10, }
export const selector = { float: 'right', width: 100, marginRight: 15, }
export const selectorLabel = { fontWeight: 300, fontSize: 14, }
export const storageSelector = Object.assign({}, selector, { width: 120, })
export const dropdown = { float: 'right', marginTop: 20, paddingTop: 30, width: 130, }
export const filterInput= { fontWeight: 300, fontSize: 14, }
export const selectorFloatingLabel= { color: 'red', }
