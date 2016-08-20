import React, { PropTypes, } from 'react'
import { connect, } from 'react-redux'
import { bindActionCreators, } from 'redux'

import FontIcon from 'material-ui/FontIcon'
import RaisedButton from 'material-ui/RaisedButton'

import * as style from './style'

/** responsible for drawing job summary */
class MainPage extends React.Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
  }


  render() {

    const title = (
      <div style={style.title}>
        Kafkalot
      </div>
    )

    const subTitle = (
      <div style={style.subTitle}>
        Kafka Connect, Stream Dashboard
      </div>
    )

    const button = (
      <RaisedButton
        style={style.githubButton}
        label="Github Link" primary
        linkButton href="https://github.com/1ambda/kafka-connect-dashboard"
        icon={<FontIcon className="fa fa-github"/>}
        />
    )

    return (
      <div className="center" style={style.container}>
        <div style={style.subContainer}>
          {title}
          {subTitle}
          {button}
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return { /** nothing to map */ }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({}, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainPage)
