import { ConnectorPageColors, } from '../../../constants/theme'

export const title = {
  fontSize: 30,
  fontWeight: 100,
  marginTop: 10,
}

export const summaryContainer = {
  fontSize: 15,
  fontWeight: 300,
  marginTop: 20,
  marginBottom: 25,
}

export const summaryRunningConnector = {
  fontWeight: 500,
}

export const buttonContainer = {
  float: 'right',
  marginLeft: 10,
}

export const buttonLabel = {
  fontWeight: 300,
}

export const popover = {
  padding: 20,
  backgroundColor: ConnectorPageColors.popoverBackground,
}

export const selector = {
  float: 'right',
  width: 100,
  marginRight: 15,
}

export const selectorLabel = {
  fontWeight: 300,
  fontSize: 14,
}

export const containerSelector = Object.assign({}, selector, {
  width: 120,
})

export const containerSelectorLabel = Object.assign({}, selectorLabel, {
  fontSize: 14,
})

export const dropdown = {
  float: 'right',
  marginTop: 20,
  paddingTop: 30,
  width: 130,
}

export const filterInput= {
  fontWeight: 300,
  fontSize: 14,
}

export const selectorFloatingLabel= {
  color: 'red',
}
