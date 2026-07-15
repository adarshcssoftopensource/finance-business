import { PureComponent } from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'

import Login from './index';

class LoginForm extends PureComponent {
  state = {
    auth_login: true
  }

  render() {
    return (
      <GoogleReCaptchaProvider reCaptchaKey={process.env.REACT_APP_RECAPTCHA_CLIENT_KEY}>
        {this.state.auth_login ? <Login /> : ""}
      </GoogleReCaptchaProvider>
    )
  }
}

export default LoginForm;
