import React, { PureComponent, Fragment } from 'react'
import IdleTimer from 'react-idle-timer'
import withRouter from 'react-router/withRouter'

const { REACT_APP_LOGOUT_TIME } = process.env

class AppIdleTimer extends PureComponent {
  onIdle = () => {
    const basicAuthToken = localStorage.getItem('basicAuthToken')
    localStorage.clear();
    localStorage.setItem('basicAuthToken', basicAuthToken)
    this.props.history.push({
      pathname: '/signin',
      state: { showInactiveModal: true }
    })
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
