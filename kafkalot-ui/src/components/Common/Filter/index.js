import React, { PropTypes, } from 'react'
import TextField from 'material-ui/lib/text-field'

export default class Filter extends React.Component {

  static propTypes = {
    style: PropTypes.object,
    handler: PropTypes.func.isRequired,
    floatingLabel: PropTypes.string.isRequired,
  }

  handleFilterChange(event) {
    const { handler, } = this.props
    const filterKeyword = event.target.value.trim()

    if (handler) handler(filterKeyword)
  }

  render() {
    const { floatingLabel, style, } = this.props

    return (
      <TextField inputStyle={style}
                 onEnterKeyDown={this.handleFilterChange.bind(this)}
                 floatingLabelText={floatingLabel || 'Insert Filter'} />
    )
  }
}

