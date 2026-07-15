import { googleLogin, login } from '../../actions/loginAction'
import history from '../../customHistory'
import React, { PureComponent, Fragment } from 'react'
import { withGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { connect } from 'react-redux'
import CenterSpinner from '../../global/CenterSpinner'
import { withRouter } from 'react-router-dom'
import {
  Button,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Row,
  Spinner,
  Modal,
  Container,
  TabContent,
  TabPane,
} from 'reactstrap'
import SnakeBar from '../../global/SnakeBar'
import { _documentTitle } from '../../utils/GlobalFunctions'
import { Helmet } from 'react-helmet'
import CommonModal from '../common/CommonModal'
import queryString from 'query-string'
import VideoModal from '../../utils/PopupModal/VideoModal'
import { _isValidEmail } from '../../utils/GlobalFunctions'
import FormValidationError from '../../global/FormValidationError'
import { openGlobalSnackbar } from '../../actions/snackBarAction'
import { assumeUserRefreshToken } from '../../actions/authAction'
import { setSelectedBussiness } from '../../actions/businessAction'
import Animation1 from '../../assets/images/anime/anime-1.png'
import Animation2 from '../../assets/images/anime/anime-2.png'
import Animation3 from '../../assets/images/anime/anime-3.png'
import Animation4 from '../../assets/images/anime/anime-4.png'
import Animation5 from '../../assets/images/anime/anime-5.png'
import Animation6 from '../../assets/images/anime/anime-6.png'
import Animation7 from '../../assets/images/anime/anime-7.png'
import Animation8 from '../../assets/images/anime/anime-8.png'
import { getDeviceInfo } from '../../utils/common'
import FinanceBusinessLogo from '../common/FinanceBusinessLogo'
import Icon from '../common/Icon'
import symbolsIcon from '../../assets/icons/product/symbols.svg'

class Login extends PureComponent {
  state = {
    email: '',
    password: '',
    validate: {
      emailState: '',
    },
    showPassword: false,
    isError: false,
    isAuthenticated: false,
    user: null,
    token: '',
    gToken: null,
    showInactiveModal: false,
    loading: false,
    isLoading: false,
    errors: {},
    captchaToken: '',
    formTab: '1',
    isRememberMe: false,
  }

  async componentDidMount() {
    if (this.props.location.hash !== '') {
      const basicAuthToken = localStorage.getItem('basicAuthToken')
      localStorage.clear()
      localStorage.setItem('basicAuthToken', basicAuthToken)
      localStorage.setItem('assumeUser', true)
      const refreshToken = this.props.location.hash.substring(1)
      if (refreshToken) {
        await this.props.assumeUser({ refreshToken }, (res) => {
          if (res.error) {
            history.push('/signin')
          } else {
            this.props.setSelectedBussiness(
              localStorage.getItem('businessId'),
              localStorage.getItem('refreshToken')
            )
          }
        })
      } else {
        history.push('/signin')
      }
    } else {
      _documentTitle({}, 'Login')
      this.checkShowInactiveModal()
      let authCheck = localStorage.getItem('token')
      if (!!authCheck) {
        // if (this.props.location && this.props.location.state && this.props.location.state.from) {
        //   return history.push(this.props.location.state.from)
        // }
        history.push('/app/dashboard')
      } else if (this.props.location.search.includes('code=')) {
        this.setState({ isLoading: true })
        const urlParams = new URLSearchParams(this.props.location.search)
        const code = urlParams.get('code')
        await this.props.googleLogin({ code }, (res) => {
          this.setState({ isLoading: false })
          if (res && res.data && res.data.statusCode == 500) {
            history.push('/signin')
            this.props.showSnackbar(
              'Google authentication failed. Try again!',
              true
            )
          } else {
            this.props.showSnackbar('Google authentication success', false)
          }
        })
      }
    }
  }

  checkShowInactiveModal = () => {
    if (this.props.location.state) {
      this.setState({
        showInactiveModal: this.props.location.state.showInactiveModal,
      })
    }
  }
  _createAccountRedirect = (_) => {
    const { search } = this.props.location
    if (search.includes('uuid') && search.includes('token')) {
      history.push(`/signup${search}`)
    } else {
      history.push('/signup')
    }
  }

  validateForm = (data) => {
    let isValid = true
    let errors = {}
    if (!data.email) {
      isValid = false
      errors = {
        emailErr: true,
        emailText: 'This field is required',
      }
    } else if (data.email && !_isValidEmail(data.email)) {
      isValid = false
      errors = {
        emailErr: true,
        emailText: 'Valid email is required',
      }
    } else if (!data.password) {
      isValid = false
      errors = {
        passErr: true,
      }
    }
    this.setState({ errors })
    return isValid
  }

  loginFormSubmit = async (event) => {
    event.preventDefault()
    const { OTP, formTab } = this.state
    let payload =
      formTab === '1'
        ? {
            email: this.state.email,
            password: this.state.password,
          }
        : {
            email: this.state.email,
            password: this.state.password,
            OTP,
          }
    payload.deviceInfo = await getDeviceInfo()
    payload.isRememberMe = this.state.isRememberMe
    const { search } = this.props.location
    if (search.includes('uuid') && search.includes('token')) {
      const { token, uuid } = queryString.parse(search)
      payload.invitationToken = token
      payload.businessUuid = uuid
    }
    if (search.includes('redirect')) {
      payload.redirectUrl = '/app/payyitme'
    }
    if (this.state.captchaToken) {
      payload.reCaptchaToken = this.state.captchaToken
    }
    try {
      if (this.validateForm(payload)) {
        this.setState({ loading: true, isError: false })
        await this.props.login(payload, (res) => {
          this.setState({ loading: false })
          if (res?.data?.verificationCodeRequired) {
            this.setState((prevState) => ({ ...prevState, formTab: '2' }))
          } else if (res.statusCode == 200) {
            if (res && res.message) {
              this.props.showSnackbar(res.message, false)
            }
          } else {
            if (res && res.data && res.data.message) {
              this.props.showSnackbar(res.data.message, true)
            } else if (res && res.message) {
              this.props.showSnackbar(res.message, true)
            }
          }
        })
      }
    } catch (err) {
      this.setState({ loading: false })
      if (err && err.message) {
        this.props.showSnackbar(err.message, true)
      }
    }
  }

  showPasswordMethod = (e) => {
    this.setState({ showPassword: !this.state.showPassword })
  }

  handleTextField = (event) => {
    const { name, value } = event.target

    this.setState((prev) => {
      const updatedErrors = { ...prev.errors }

      if (name === 'email') {
        delete updatedErrors.emailErr
        delete updatedErrors.emailText
      }

      if (name === 'password') {
        delete updatedErrors.passErr
      }

      if (name === 'OTP') {
        delete updatedErrors.otpErr
        delete updatedErrors.otpText
      }

      return {
        [name]: value,
        errors: updatedErrors,
      }
    })
  }

  onChange = (value) => {
    this.setState({
      gToken: value,
      errors: {
        gTokenErr: false,
      },
    })
  }

  sendGtaEvent = () => {
    window.gtag('event', 'login', {
      event_label: 'SignIn Completed',
      event_category: 'auth',
    })
    window.gtag('send', 'login')
  }

  handleVerifyRecaptcha = async (e) => {
    e.preventDefault()
    const { executeRecaptcha } = this.props.googleReCaptchaProps

    if (!executeRecaptcha) {
      console.log('Recaptcha has not been loaded')

      return
    }

    const captchaToken = await executeRecaptcha('login')
    this.setState({ captchaToken })

    if (captchaToken) {
      this.loginFormSubmit(e)
    } else {
      this.props.showSnackbar('Recaptcha token generated!', true)
    }
  }

  render() {
    const { showInactiveModal, loading, errors, formTab, showPassword } =
      this.state
    const { search } = this.props.location
    if (this.props.location.hash !== '') {
      return (
        <Container
          className="text-center"
          style={{ height: '100vh', width: '100%', overflow: 'hidden' }}
        >
          <div style={{ marginTop: '18%' }}>
            <CenterSpinner />
          </div>
        </Container>
      )
    } else {
      return (
        <Fragment>
          <Helmet>
            <meta charSet="utf-8" />
            <title>Finance - Sign In</title>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
          </Helmet>
          <div class="top-banner">
            <div class="container">
              <div class="row">
                <div class="col">
                  Having trouble signing up or logging in? Text +1 (855)
                  601-4451 to connect with customer support.{' '}
                </div>
              </div>
            </div>
          </div>
          <Modal className="business-loader" isOpen={this.state.isLoading}>
            <CenterSpinner />
          </Modal>
          <div className="py-page__auth">
            <div className="anime-content">
              <div className="anime-item one">
                <img src={Animation1} alt="Animation" />{' '}
              </div>
              <div className="anime-item two">
                <img src={Animation2} alt="Animation" />{' '}
              </div>
              <div className="anime-item three">
                <img src={Animation3} alt="Animation" />{' '}
              </div>
              <div className="anime-item four">
                <img src={Animation4} alt="Animation" />{' '}
              </div>
              <div className="anime-item five">
                <img src={Animation5} alt="Animation" />{' '}
              </div>
              <div className="anime-item six">
                <img src={Animation6} alt="Animation" />{' '}
              </div>
              <div className="anime-item seven">
                <img src={Animation7} alt="Animation" />{' '}
              </div>
              <div className="anime-item eight">
                <img src={Animation8} alt="Animation" />{' '}
              </div>
            </div>
            <Row className="no-gutters d-flex align-items-center my-auto">
              <Col
                xl="6"
                lg="8"
                md="12"
                className="d-flex flex-column align-items-center justify-content-center log-form-box"
              >
                <SnakeBar isAuth={false} />
                {/* Finance Logo At Header */}
                <div className="text-center">
                  <a
                    href={`${process.env.REACT_APP_ROOT_URL}`}
                    className="step-logo"
                  >
                    <FinanceBusinessLogo height={36} />
                  </a>
                </div>
                <div className="py-page__login mb-5">
                  {/* Form Heading Title */}
                  <div className="row mx-n2">
                    <div className="col-sm-12 mb-3 mb-lg-4 pb-1 px-2">
                      <h1 className="py-heading--title mb-0">
                        {formTab === '2'
                          ? 'Two-Step Authentication'
                          : 'Sign in'}
                      </h1>
                    </div>
                  </div>
                  {/* Form Fields */}
                  <Form
                    className="login-form"
                    role="form"
                    onSubmit={this.handleVerifyRecaptcha}
                  >
                    {/* Form Email Address Field */}
                    <TabContent activeTab={formTab}>
                      <TabPane tabId={'1'}>
                        <div className="row mx-n2">
                          <div className="col-sm-12 px-2">
                            <FormGroup className="mb-3 text-left icon-input">
                              <Label
                                for="AccountLogin__Email"
                                className="label is-required"
                              >
                                Email address
                              </Label>
                              <Input
                                autoFocus
                                onChange={(e) => {
                                  const value = e.target.value.replace(
                                    /\s/g,
                                    ''
                                  )
                                  this.handleTextField({
                                    target: { name: 'email', value },
                                  })
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === ' ') e.preventDefault()
                                }}
                                type="email"
                                name="email"
                                id="AccountLogin__Email"
                                placeholder="Email address"
                              />
                              <FormValidationError
                                showError={errors.emailErr}
                                message={
                                  errors.emailText ? errors.emailText : ''
                                }
                              />
                            </FormGroup>
                          </div>
                        </div>
                        {/* Form Password Field */}
                        <div className="row mx-n2">
                          <div className="col-sm-12 px-2">
                            <FormGroup className="d-flex flex-column align-items-start icon-input mb-0">
                              <Label
                                for="AccountLogin__Password"
                                className="label is-required"
                              >
                                Password
                              </Label>
                              <Input
                                onChange={this.handleTextField}
                                id="AccountLogin__Password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Password"
                              />
                              <div className="align-self-start">
                                <FormValidationError
                                  showError={errors.passErr}
                                />
                              </div>
                              <FormValidationError
                                showError={errors.password}
                              />
                              <div className="hide-show-eye">
                                <a
                                  href="javascript: void(0)"
                                  onClick={this.showPasswordMethod}
                                >
                                  <Icon
                                    className="Icon"
                                    xlinkHref={`${symbolsIcon}#eye2`}
                                  />
                                </a>
                              </div>
                              <div className="text-right w-100">
                                <a
                                  className="login-link"
                                  href="javascript:void(0)"
                                  onClick={() =>
                                    history.push('/forgotyourpassword')
                                  }
                                >
                                  Forgot your password?
                                </a>
                              </div>
                            </FormGroup>
                          </div>
                        </div>
                        <div>
                          <div className="py-form-field__element">
                            <Label className="py-checkbox">
                              <input
                                type="checkbox"
                                name="agreement"
                                value={this.state.isRememberMe}
                                onChange={(event) => {
                                  this.setState({
                                    isRememberMe: event.target.checked,
                                  })
                                }}
                                checked={this.state.isRememberMe}
                              />
                              <span className="py-form__element__faux" />
                              <span className="py-form__element__label">
                                Remember this browser
                              </span>
                            </Label>
                          </div>
                        </div>
                      </TabPane>
                      <TabPane tabId={'2'}>
                        <div className="row mx-n2">
                          <div className="col-sm-12 px-2">
                            <FormGroup className="mb-3 text-left icon-input">
                              <Label
                                for="AccountLogin__Email"
                                className="label is-required"
                              >
                                One-time passcode
                              </Label>
                              <Input
                                autoFocus
                                onChange={this.handleTextField}
                                type="number"
                                name="OTP"
                                id="AccountLogin__VerificationCode"
                                placeholder="One-time passcode"
                              />
                              <FormValidationError
                                showError={errors.emailErr}
                                message={
                                  errors.emailText ? errors.emailText : ''
                                }
                              />
                            </FormGroup>
                          </div>
                        </div>
                      </TabPane>
                    </TabContent>
                    {/* <div className="row mx-n2">
                      <div className="col-sm-12 px-2 pt-2">
                        <Recaptcha
                          errors={errors}
                          onChange={this.onChange}
                        />
                      </div>
                    </div> */}

                    {/* Form Submit Button */}
                    <div className="row mx-n2">
                      <div className="col-sm-12 px-2">
                        <Button
                          type="submit"
                          color="primary"
                          block
                          className="btn-sq mt-4"
                          disabled={loading}
                        >
                          {formTab === '2' ? 'Verify' : 'Sign In'}{' '}
                          {loading && <Spinner size="md" color="default" />}
                        </Button>
                      </div>
                    </div>
                  </Form>
                  {!search.includes('uuid') && !search.includes('token') && (
                    <React.Fragment>
                      {/* Register link pera  */}
                      {/* <div className="row mx-n2">
                      <div className="col-sm-12 px-2 text-center">
                        <p className="py-text mb-0 reg-redirect-msg mt-5 mb-3">or sign in with</p>
                      </div>
                    </div> */}
                      {/* Google Login Button */}
                      {/* <div className="row mx-n2">
                      <div className="col-sm-12 px-2 text-center">
                        <a className="btn btn-social--google" disabled={loading} href={`${process.env.API_URL}/api/v2/auth/login/google`}>Google</a>
                      </div>
                    </div> */}
                    </React.Fragment>
                  )}
                  {/* Register link pera  */}
                  <div className="row mx-n2">
                    <div className="col-sm-12 px-2 text-center">
                      <p className="py-text mb-0 mt-4 pt-2 reg-redirect-msg">
                        Don't have an account?{' '}
                        <a
                          href="javascript:void(0)"
                          className="py-text--link ms-1"
                          onClick={this._createAccountRedirect}
                        >
                          Sign Up
                        </a>
                      </p>
                      <p className="py-text mt-4 suggest-info">
                        To experience the full power of Finance, please sign in
                        from a computer or tablet
                      </p>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
          <CommonModal
            toggle={() => this.setState({ showInactiveModal: false })}
            isOpen={showInactiveModal}
            buttonLabel="Ok"
            modalBody="We have logged you out becuase you were inactive for 30 minutes."
            modalTitle="Busy on other stuffs?"
          />
          <VideoModal
            isOpen={this.state.videoModal}
            toggle={() => this.setState({ videoModal: !this.state.videoModal })}
          />
        </Fragment>
      )
    }
  }
}

const mapStateToProps = (state) => {
  return {
    errorMessage: state.appUserReducer.errorMessage,
  }
}

const mapDispatchToProps = (dispatch) => ({
  login: (data, cb) => {
    dispatch(login(data, cb))
  },
  showSnackbar: (message, error) => {
    dispatch(openGlobalSnackbar(message, error))
  },
  assumeUser: (token, cb) => {
    dispatch(assumeUserRefreshToken(token, cb))
  },
  googleLogin: (data, cb) => {
    dispatch(googleLogin(data, cb))
  },
  setSelectedBussiness: (id, token) => {
    dispatch(setSelectedBussiness(id, token))
  },
})

const firstHOC = withGoogleReCaptcha(
  connect(mapStateToProps, mapDispatchToProps)(Login)
)
const secondHOC = withRouter(firstHOC)

export default secondHOC
