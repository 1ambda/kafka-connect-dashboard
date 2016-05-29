import React, { PropTypes, } from 'react'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'

export default class Sorter extends React.Component {

  static propTypes = {
    handler: PropTypes.func.isRequired,
    strategies: PropTypes.array.isRequired,
    currentStrategy: PropTypes.string.isRequired,
    style: PropTypes.object,
    labelStyle: PropTypes.object,
    floatingLabel: PropTypes.string,
    floatingLabelStyle: PropTypes.object,
  }

  constructor(props) {
    super(props)

    this.handleSorterChange = this.handleSorterChange.bind(this)
  }

  handleSorterChange(event, selectedIndex) {
    const { handler, strategies, } = this.props

    if (handler) handler(strategies[selectedIndex])
  }

  render() {
    const {
      style, strategies, currentStrategy,
      labelStyle, floatingLabel, floatingLabelStyle,
      } = this.props

    const strategyElems = strategies.reduce((acc, s) => {
      acc.push(<MenuItem key={s} value={s} primaryText={s} />)
        return acc
    }, [])

    return (
      <SelectField value={currentStrategy}
                   style={style || {}}
                   onChange={this.handleSorterChange}
                   labelStyle={labelStyle || {}}
                   floatingLabelText={floatingLabel || 'Sort by'}
                   floatingLabelStyle={floatingLabelStyle || {}} >
        {strategyElems}
      </SelectField>
    )
  }
}
