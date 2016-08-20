import React, { PropTypes, } from 'react'

export class ListItemLastColumn extends React.Component {
  render() {
    return (<div style={{clear: 'both',}} />)
  }
}

export class ListItemColumn extends React.Component {
  static propTypes = {
    style: PropTypes.object,
    children: PropTypes.node,
  }

  static defaultStyle = {
    display: 'inline-block',
    verticalAlign: 'middle',
    fontWeight: 300,
    fontSize: 15,
  }

  render() {
    const { style, children, } = this.props
    const mergedStyle = (style) ?
      Object.assign({}, ListItemColumn.defaultStyle, style) : ListItemColumn.defaultStyle

    return (
      <span style={mergedStyle}>{children}</span>
    )
  }
}