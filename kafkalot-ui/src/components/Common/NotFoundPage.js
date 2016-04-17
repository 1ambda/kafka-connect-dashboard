import React from 'react'
import { Link, } from 'react-router'

export default class NotFoundPage extends React.Component {
  render() {
    return (
      <div>
        <h4>
          404 Page Not Found
        </h4>
        <Link to="/"> Go back to homepage </Link>
      </div>
    )
  }
}
