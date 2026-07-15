import React, { PureComponent, Fragment } from 'react'
import IdleTimer from 'react-idle-timer'
import withRouter from 'react-router/withRouter'

const { REACT_APP_LOGOUT_TIME } = process.env

class AppIdleTimer extends PureComponent {
  onIdle = () => {
    // Static demo: no idle redirect to /signin
  }

  renderComponentOnRouteCheck = () => {
    const { pathname } = this.props.location
    return (
      pathname !== '/signin' &&
      !pathname.includes('public') && (
        <IdleTimer
          debounce={250}
          onIdle={this.onIdle}
          timeout={1000 * 60 * LOGOUT_TIME}
        />
      )
    )
  }

  render() {
    return <Fragment>{this.renderComponentOnRouteCheck()}</Fragment>
  }
}

export default withRouter(AppIdleTimer)
