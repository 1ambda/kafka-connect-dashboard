import React, { PropTypes, } from 'react'
import { Link, } from 'react-router'



const style = {
  title: {
    fontWeight: 300,
    fontSize: 25,
  },
}

export default class GlobalErrorPage extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
  }

  render() {
    const { title, message, } = this.props

    return (
      <div>
        <p style={style.title}> {title} </p>
        <p> {message} </p>
        <Link to="/"> Go back to homepage </Link>
      </div>
    )
  }
}
