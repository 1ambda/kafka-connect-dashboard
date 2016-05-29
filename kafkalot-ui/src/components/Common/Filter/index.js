import React, { PropTypes, } from 'react'
import TextField from 'material-ui/TextField'
import keycode from 'keycode'

export default class Filter extends React.Component {

  static propTypes = {
    style: PropTypes.object,
    handler: PropTypes.func.isRequired,
    floatingLabel: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props)

    this.handleFilterChange = this.handleFilterChange.bind(this)
  }

  handleFilterChange(event) {
    const { handler, } = this.props
    const filterKeyword = event.target.value.trim()

    if (handler && (keycode(event) === 'enter')) handler(filterKeyword)
  }

  render() {
    const { floatingLabel, style, } = this.props

    return (
      <TextField inputStyle={style}
                 onKeyDown={this.handleFilterChange}
                 floatingLabelText={floatingLabel || 'Insert Filter'} />
    )
  }
}

