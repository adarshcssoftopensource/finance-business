import React, { PureComponent } from 'react'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { connect } from 'react-redux'
import { get } from 'lodash'
import SignUp from './index'
import JoinWaitList from '../joinWaitList/index'

class SignUpForm extends PureComponent {
  render() {
    const { isRegisterEnabled } = this.props
    return (
      <GoogleReCaptchaProvider
        reCaptchaKey={process.env.REACT_APP_RECAPTCHA_CLIENT_KEY}
      >
        {isRegisterEnabled ? <SignUp /> : <JoinWaitList />}
      </GoogleReCaptchaProvider>
    )
  }
}

const mapStateToProps = ({ settings: { featureFlags } = {} }) => {
  const isRegisterEnabled = get(featureFlags, 'auth.register', 'true') === 'true'
  return { isRegisterEnabled }
}

export default connect(mapStateToProps)(SignUpForm);
