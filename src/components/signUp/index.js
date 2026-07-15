import React, { PureComponent } from 'react'
import { withGoogleReCaptcha } from 'react-google-recaptcha-v3'
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Spinner,
} from 'reactstrap'
import { withRouter } from 'react-router-dom'
import history from '../../customHistory'
import SignupService from '../../api/SignupService'
import { login, googleLogin } from '../../actions/loginAction'
import { connect } from 'react-redux'
import {
  privacyPolicy,
  terms,
  setupRefreshTimer,
  logout,
  getLogoURL,
  _isValidPhone,
} from '../../utils/GlobalFunctions'
import { openGlobalSnackbar } from '../../actions/snackBarAction'
import SnakeBar from '../../global/SnakeBar'
import { NavLink } from 'react-router-dom'
import { _setToken, _getUser } from '../../utils/authFunctions'
import queryString from 'query-string'
import { registerVerify, invitationVerify } from '../../actions/authAction'
import { REGISTER_VERIFY_SUCCESS } from '../../constants/ActionTypes'
import CenterSpinner from '../../global/CenterSpinner'
import { setSelectedBussiness } from '../../actions/businessAction'
import { fetchMe } from '../../actions/loginAction'
import VideoModal from '../../utils/PopupModal/VideoModal'
import { _isValidEmail } from '../../utils/GlobalFunctions'
import FormValidationError from '../../global/FormValidationError'
import { Helmet } from 'react-helmet'
import Icon from '../common/Icon'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import MobileVerification from './mobileVerification'
import OtpServices from '../../api/otpService'
import symbolsIcon from '../../assets/icons/product/symbols.svg'
import anime1Png from '../../assets/images/anime/anime-1.png'
import anime2Png from '../../assets/images/anime/anime-2.png'
import anime3Png from '../../assets/images/anime/anime-3.png'
import anime4Png from '../../assets/images/anime/anime-4.png'
import anime5Png from '../../assets/images/anime/anime-5.png'
import anime6Png from '../../assets/images/anime/anime-6.png'
import anime7Png from '../../assets/images/anime/anime-7.png'
import anime8Png from '../../assets/images/anime/anime-8.png'
import { getDeviceInfo } from '../../utils/common'
import FinanceBusinessLogo from '../common/FinanceBusinessLogo'

const setRegisterData = (state) => {
  const payload = {
    firstName: (state && state.firstName) || '',
    lastName: (state && state.lastName) || '',
    email: (state && state.email) || '',
    password: (state && state.password) || '',
    isPromotionalChecked: (state && state.isPromotionalChecked) || false,
    isTermsAndPrivacyChecked:
      (state && state.isTermsAndPrivacyChecked) || false,
    mobileNumber: (state && state.mobileNumber) || '',
  }
  return payload
}
class SignUp extends PureComponent {
  state = {
    errorMessage: '',
    registerData: setRegisterData(),
    showPassword: false,
    showConfirmPassword: false,
    btnLoad: false,
    errors: {},
    captchaToken: '',
    mobileSelectedCountry: {},
    mobileVerification: false,
    otpRequestId: '',
    isPromotionalChecked: false,
    isTermsAndPrivacyChecked: false,
  }

  componentDidMount() {
    document.title = 'Finance - Sign Up'
    if (this.props.location.search.includes('code=')) {
      const urlParams = new URLSearchParams(this.props.location.search)
      const code = urlParams.get('code')
      this.props.googleLogin({ code })
    } else {
      const { email, token, uuid } = queryString.parse(
        this.props.location.search
      )
      //Check for login state
      if (!!localStorage.getItem('token')) {
        logout(this.props.location.search, 'signup')
      }

      //setting email id
      if (!!email) {
        this.setState({
          registerData: {
            ...this.state.registerData,
            email: email,
          },
        })
      }

      //Verifying if user is owner
      if (!!email && !!token) {
        this.setState({ loading: true })
        this.props.registerVerify(email, token)
      }

      //Verifying if user came from role based management
      if (!!uuid && !!token) {
        this.setState({ loading: true })
        document.title =
          'Finance - Accept the invitation to collaborate at Finance'
        // this.props.registerVerify(email, token)
        this.props.invitationVerify(this.props.location.search)
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.registerVerification !== nextProps.registerVerification) {
      if (
        !!nextProps.registerVerification &&
        nextProps.registerVerification.type === REGISTER_VERIFY_SUCCESS
      ) {
        this.setState({
          loading: false,
          registerData: {
            ...this.state.registerData,
            email: !!nextProps.registerVerification.data
              ? !!nextProps.registerVerification.data.invitation
                ? nextProps.registerVerification.data.invitation.email
                : ''
              : '',
          },
        })
      }
    }
  }

  // handleText = (event) => {
  //   const { name, value } = event.target
  //   this.setState({
  //     errors: {},
  //     registerData: { ...this.state.registerData, [name]: value },
  //   })
  // }
  handleText = (e) => {
    const { name, value } = e.target
    let cleaned = value.replace(/\s+/g, ' ').trimStart()

    if (cleaned.trim() === '') cleaned = ''

    const newErrors = { ...this.state.errors, [name]: '' }

    if (name === 'password') {
      const passLength =
        cleaned.length >= 8 ? '' : 'Password must be at least 8 characters'
      const hasLetter = /[a-zA-Z]/.test(cleaned)
        ? ''
        : 'Password must contain at least one letter'
      const hasNumber = /\d/.test(cleaned)
        ? ''
        : 'Password must contain at least one number'
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(cleaned)
        ? ''
        : 'Password must contain at least one special character'

      // If any of these fail, show the first error
      newErrors.passLength = passLength || hasLetter || hasNumber || hasSpecial
      newErrors.password = '' // clear generic password error
    }

    this.setState((prev) => ({
      registerData: {
        ...prev.registerData,
        [name]: cleaned,
      },
      errors: newErrors,
    }))
  }

  handleMobileText = (val, country) => {
    this.setState((prev) => ({
      registerData: {
        ...prev.registerData,
        mobileNumber: val, // update phone value
      },
      errors: {
        ...prev.errors,
        mobileNumber: '', // clear the main error
        mobileNumberText: '', // clear any secondary error if exists
      },
    }))
  }

  // googleResponse = async (response) => {
  //   const tokenBlob = new Blob([JSON.stringify({ access_token: response.accessToken }, null, 2)], { type: 'application/json' });
  //   this.props.googleLogin(response);
  // };
  updateError = (key, value) => {
    this.setState((prevState) => ({
      ...prevState,
      errors: {
        ...prevState.errors,
        [key]: value,
      },
    }))
  }

  checkConfirmationPassword = (event) => {
    event.preventDefault()
    const registerData = this.state.registerData
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      mobileNumber,
    } = registerData
    let hasError = false
    if (!firstName) {
      this.updateError(`firstName`, true)
      hasError = true
    }
    if (!lastName) {
      this.updateError(`lastName`, true)
      hasError = true
    }
    if (!email) {
      this.updateError(`email`, true)
      hasError = true
    } else if (email && !_isValidEmail(email)) {
      hasError = true
      this.updateError(`emailText`, 'valid email required')
    }
    if (!mobileNumber) {
      this.updateError(`mobileNumber`, true)
      hasError = true
    } else if (mobileNumber && !_isValidPhone(`+${mobileNumber}`)) {
      this.updateError(`mobileNumberText`, 'Valid phone number required')
      hasError = true
    }
    if (!password) {
      this.updateError(`password`, true)
      hasError = true
    }
    if (password && password.length < 8) {
      this.updateError(
        `passLength`,
        'at least 8 characters, but longer is better'
      )
      hasError = true
    }
    if (!confirmPassword) {
      this.updateError(`confirmPassword`, true)
      hasError = true
    }

    if (hasError) return

    if (
      confirmPassword &&
      password &&
      email &&
      lastName &&
      firstName &&
      password.length >= 8
    ) {
      if (password != confirmPassword) {
        this.updateError(`cpassText`, 'password does not match')
      } else {
        this.handleSendVerificationCode('verify_user')
        // this.signUpFormSubmit(registerData)
      }
    }
  }

  handleSendVerificationCode = async (verificationType, captchaToken) => {
    this.setState({ btnLoad: true })
    const data = {
      purpose: 'verify_user',
      type: verificationType,
      mobile: {
        to: [`+${this.state.registerData.mobileNumber}`],
        countryCodeData: this.state.mobileSelectedCountry.dialCode,
      },
      email: this.state.registerData.email,
      reCaptchaToken: captchaToken ? captchaToken : this.state.captchaToken,
    }
    if (this.state.otpRequestId) {
      data.requestId = this.state.otpRequestId
    }
    try {
      const result = await OtpServices.send(data).catch((error) => {
        return error?.data
      })
      if (result.statusCode === 200) {
        this.props.showSnackbar(
          result?.message || 'Otp Sent successfully!',
          false
        )
        this.setState({
          mobileVerification: true,
          btnLoad: false,
          otpRequestId: result.data.requestId || '',
        })
      } else {
        this.props.showSnackbar(result.message, true)
        this.setState({ btnLoad: false })
      }
    } catch (error) {
      this.props.showSnackbar(error.message, true)
      this.setState({ btnLoad: false })
    }
  }

  handleBackNavigation = () => {
    this.setState({ mobileVerification: false })
  }

  handleResendOtp = async (verificationType) => {
    const { executeRecaptcha } = this.props.googleReCaptchaProps
    if (!executeRecaptcha) {
      console.log('Recaptcha has not been loaded')
      return
    }
    const captchaToken = await executeRecaptcha('signup')
    this.setState({ captchaToken })
    this.handleSendVerificationCode(verificationType, captchaToken)
  }

  handleVerifyOtp = async (otpCode, emailOtpData) => {
    const { executeRecaptcha } = this.props.googleReCaptchaProps

    if (!executeRecaptcha) {
      console.log('Recaptcha has not been loaded')

      return
    }

    const captchaToken = await executeRecaptcha('signup')

    const registerData = this.state.registerData
    if (otpCode && emailOtpData) {
      const data = {
        code: otpCode || false,
        emailOtpCode: emailOtpData || false,
        requestId: this.state.otpRequestId,
      }
      const result = await OtpServices.verify(data)
      if (result.statusCode === 200) {
        this.props.showSnackbar('Mobile Verified!', false)
        this.setState({ btnLoad: false, captchaToken })
        this.signUpFormSubmit(registerData)
      } else {
        this.props.showSnackbar(result.message, true)
        this.setState({ btnLoad: false })
      }
    } else {
      this.props.showSnackbar('Please add Otp code!', true)
    }
  }

  handleLogin = async (user) => {
    const { executeRecaptcha } = this.props.googleReCaptchaProps

    if (!executeRecaptcha) {
      console.log('Recaptcha has not been loaded')

      return
    }

    const captchaToken = await executeRecaptcha('login')
    const deviceInfo = await getDeviceInfo()
    await this.props.login(
      {
        email: user.userInput.email,
        password: user.userInput.password,
        reCaptchaToken: captchaToken,
        deviceInfo,
      },
      (res) => {
        this.setState({ btnLoad: false })
        if (res.statusCode == 200) {
          if (res && res.message) {
            openGlobalSnackbar(res.message, false)
          }
        } else {
          if (res && res.data && res.data.message) {
            openGlobalSnackbar(res.data.message, true)
          } else if (res && res.message) {
            openGlobalSnackbar(res.message, true)
          }
        }
      }
    )
  }

  signUpFormSubmit = async (registerData) => {
    try {
      const { search } = this.props.location
      const user = {
        userInput: setRegisterData(registerData),
      }
      if (search.includes('uuid') || search.includes('token')) {
        const { token, uuid } = queryString.parse(search)
        if (!!uuid) {
          user.userInput.businessUuid = uuid
        }
        if (!!token) {
          user.userInput.invitationToken = token
        }
      }
      if (this.state.captchaToken) {
        user.reCaptchaToken = this.state.captchaToken
      }
      this.setState({ btnLoad: true })
      const response = await SignupService.registration(user)
      if (!!response) {
        if (response.statusCode === 200) {
          _setToken(response.data)
          setupRefreshTimer()
          this.setState({ btnLoad: false })
          this.props.showSnackbar('Signed up successfully', false)
          const userData = _getUser(response.data.accessToken)
          if (!!userData.primaryBusiness) {
            this.props.setSelectedBussiness(
              userData.primaryBusiness,
              response.data.accessToken
            )
          } else {
            if (!!userData.businessIds && userData.businessIds.length > 0) {
              //For collaborator
              const me = await fetchMe()
              const businessList = me.data.businesses
              if (!!businessList && businessList.length > 0) {
                this.props.setSelectedBussiness(businessList[0]._id)
              } else {
                openGlobalSnackbar(
                  'Something went wrong, please try again in some time.',
                  true
                )
                return false
              }
              this.setState({ btnLoad: false })
            } else if (
              userData?.securityCheck?.emailVerified &&
              userData?.securityCheck?.mobileVerified
            ) {
              await this.handleLogin(user)
            } else {
              this.setState({ btnLoad: false })
              const { search } = this.props.location
              const url = search.includes('planType')
                ? `/email-verification${search}`
                : '/email-verification'
              history.push(url)
            }
          }
        } else {
          this.setState({ btnLoad: false })
          this.props.showSnackbar(response.data.message, true)
        }
      } else {
        this.setState({ btnLoad: false })
        this.props.showSnackbar('Something went wrong, please try again!', true)
      }
    } catch (error) {
      if (!!error) {
        this.props.showSnackbar(error.data.message, true)
      }
      this.setState({ btnLoad: false })
    }
  }
  showPasswordMethod = (e) => {
    this.setState({ showPassword: !this.state.showPassword })
  }
  showConfirmPasswordMethod = (e) => {
    this.setState({ showConfirmPassword: !this.state.showConfirmPassword })
  }
  handleVerifyRecaptcha = async (e) => {
    e.preventDefault()
    const { executeRecaptcha } = this.props.googleReCaptchaProps

    if (!executeRecaptcha) {
      console.log('Recaptcha has not been loaded')

      return
    }

    const captchaToken = await executeRecaptcha('signup')
    this.setState({ captchaToken })
    if (captchaToken) {
      this.checkConfirmationPassword(e)
    } else {
      this.props.showSnackbar('Recaptcha token generated!', true)
    }
  }

  render() {
    const {
      registerData,
      showPassword,
      showConfirmPassword,
      loading,
      btnLoad,
      errors,
      mobileVerification,
    } = this.state
    const {
      location: { pathname, search },
      registerVerification,
    } = this.props
    const { token, uuid } = queryString.parse(search)
    return (
      <div className="py-page__auth">
        <Helmet>
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </Helmet>
        {/* Top-Banner-End */}
        <div className="anime-content">
          <div className="anime-item one">
            <img src={anime1Png} alt="Animation" />{' '}
          </div>
          <div className="anime-item two">
            <img src={anime2Png} alt="Animation" />{' '}
          </div>
          <div className="anime-item three">
            <img src={anime3Png} alt="Animation" />{' '}
          </div>
          <div className="anime-item four">
            <img src={anime4Png} alt="Animation" />{' '}
          </div>
          <div className="anime-item five">
            <img src={anime5Png} alt="Animation" />{' '}
          </div>
          <div className="anime-item six">
            <img src={anime6Png} alt="Animation" />{' '}
          </div>
          <div className="anime-item seven">
            <img src={anime7Png} alt="Animation" />{' '}
          </div>
          <div className="anime-item eight">
            <img src={anime8Png} alt="Animation" />{' '}
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
            {loading ? (
              <CenterSpinner />
            ) : (
              <div>
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
                        {mobileVerification
                          ? 'Phone & email verification'
                          : 'Sign up'}
                      </h1>
                    </div>
                  </div>
                  {mobileVerification ? (
                    <MobileVerification
                      mobileNumber={registerData.mobileNumber}
                      handleBackNavigation={this.handleBackNavigation}
                      handleResendOtp={this.handleResendOtp}
                      btnLoad={btnLoad}
                      handleVerifyOtp={this.handleVerifyOtp}
                      email={registerData.email}
                    />
                  ) : null}
                  {!mobileVerification && (
                    <div>
                      <Form
                        className="login-form"
                        onSubmit={this.handleVerifyRecaptcha}
                      >
                        {/* First Name And Last Name */}
                        <div className="row mx-n3">
                          <div className="col-md-6 px-3 mb-3">
                            <div className="icon-input">
                              <Label
                                for="AccountSignup__Firstname"
                                className="label is-required"
                              >
                                First name
                              </Label>
                              <Input
                                value={registerData.firstName}
                                type="text"
                                name="firstName"
                                className="me-2"
                                id="AccountSignup__Firstname"
                                placeholder="First name"
                                onChange={(e) => {
                                  let value = e.target.value

                                  value = value.replace(/\s+/g, ' ')

                                  if (value.trim() === '') {
                                    value = ''
                                  }

                                  value = value.trimStart()

                                  this.setState((prev) => ({
                                    registerData: {
                                      ...prev.registerData,
                                      firstName: value,
                                    },
                                    errors: {
                                      ...prev.errors,
                                      firstName: '', // 👈 clears only this field's error
                                    },
                                  }))
                                }}
                              />

                              <FormValidationError
                                showError={errors.firstName}
                              />
                            </div>
                          </div>
                          <div className="col-md-6 px-3 mb-3">
                            <div className="icon-input">
                              <Label
                                for="AccountSignup__Lastname"
                                className="label is-required"
                              >
                                Last name
                              </Label>
                              <Input
                                type="text"
                                name="lastName"
                                id="AccountSignup__Lastname"
                                placeholder="Last name"
                                value={registerData.lastName}
                                onChange={this.handleText}
                              />
                              <FormValidationError
                                showError={errors.lastName}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Email Address Field */}
                        <div className="row mx-n3">
                          <div className="col-sm-12 px-3 mb-3">
                            <div className="icon-input">
                              <Label
                                for="AccountSignup__Email"
                                className="label is-required"
                              >
                                Email address
                              </Label>
                              <Input
                                type="text"
                                name="email"
                                id="AccountSignup__Email"
                                placeholder="Email address"
                                value={registerData.email}
                                onChange={(e) => {
                                  const noSpaces = e.target.value.replace(
                                    /\s/g,
                                    ''
                                  )
                                  this.handleText({
                                    target: { name: 'email', value: noSpaces },
                                  })
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === ' ') {
                                    e.preventDefault() // stop typing space
                                  }
                                }}
                                disabled={!!uuid && !!token}
                              />

                              <FormValidationError showError={errors.email} />
                              <FormValidationError
                                showError={errors.emailText}
                                message={
                                  errors.emailText ? errors.emailText : ''
                                }
                              />
                            </div>
                          </div>
                        </div>

                        {/* Phone number Field */}
                        <div className="row mx-n3">
                          <div className="col-sm-12 px-3 mb-3">
                            <div className="icon-input">
                              <Label
                                for="AccountSignup__Mobile"
                                className="label is-required"
                              >
                                Mobile phone number
                              </Label>
                              <PhoneInput
                                disableSearchIcon
                                name="phone"
                                country="us"
                                countryCodeEditable={false}
                                enableSearch
                                value={registerData.mobileNumber}
                                id="signup_user_phone"
                                inputClass="feild-height w-100"
                                containerClass="custom-select-div signup_form_phone"
                                onChange={(val, country) =>
                                  this.handleMobileText(val, country)
                                }
                              />
                              <FormValidationError
                                showError={errors.mobileNumber}
                              />
                              <FormValidationError
                                showError={errors.mobileNumberText}
                                message={
                                  errors.mobileNumberText
                                    ? errors.mobileNumberText
                                    : ''
                                }
                              />
                            </div>
                          </div>
                        </div>

                        {/* Password Field */}
                        <div className="row mx-n3">
                          <div className="col-sm-6 px-3 mb-3">
                            <div className="icon-input">
                              <Label
                                for="AccountSignup__Password"
                                className="label is-required"
                              >
                                Password
                              </Label>
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                id="AccountSignup__Password"
                                placeholder="Password"
                                value={registerData.password}
                                onChange={this.handleText}
                              />

                              <FormValidationError
                                showError={errors.passLength}
                                message={errors.passLength}
                              />
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
                            </div>
                          </div>

                          {/* Confirm Password Field */}
                          <div className="col-sm-6 px-3">
                            <div className="icon-input">
                              <Label
                                for="AccountSignup__ConfirmPassword"
                                className="label is-required"
                              >
                                Confirm password
                              </Label>
                              <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                id="AccountSignup__ConfirmPassword"
                                placeholder="Confirm password"
                                value={registerData.confirmPassword}
                                onChange={(e) => {
                                  // Remove all whitespace (space, tab, etc.)
                                  const cleaned = e.target.value.replace(
                                    /\s/g,
                                    ''
                                  )

                                  this.setState((prev) => ({
                                    registerData: {
                                      ...prev.registerData,
                                      confirmPassword: cleaned,
                                    },
                                    errors: {
                                      ...prev.errors,
                                      confirmPassword: '', // clear confirm password error
                                      cpassText: '', // clear cpassText error
                                    },
                                  }))
                                }}
                                autoComplete="password"
                              />

                              <FormValidationError
                                showError={errors.confirmPassword}
                              />
                              <FormValidationError
                                showError={errors.cpassText}
                                message={
                                  errors.cpassText ? errors.cpassText : ''
                                }
                              />

                              <div className="hide-show-eye">
                                <a
                                  href="javascript: void(0)"
                                  onClick={this.showConfirmPasswordMethod}
                                >
                                  <Icon
                                    className="Icon"
                                    xlinkHref={`${symbolsIcon}#eye2`}
                                  />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="py-form-field__element">
                            <Label className="py-checkbox">
                              <input
                                type="checkbox"
                                name="pramotional"
                                value={
                                  this.state.registerData.isPromotionalChecked
                                }
                                required={true}
                                onChange={(event) => {
                                  this.setState({
                                    registerData: {
                                      ...this.state.registerData,
                                      isPromotionalChecked:
                                        event.target.checked,
                                    },
                                  })
                                }}
                                checked={
                                  this.state.registerData.isPromotionalChecked
                                }
                              />
                              <span className="py-form__element__faux" />
                              <span className="py-form__element__label">
                                I consent to receiving notifications from Finance
                                via phone, email, or SMS about account activity,
                                platform changes, and security updates.
                              </span>
                            </Label>
                          </div>
                        </div>
                        <div>
                          <div className="py-form-field__element">
                            <Label className="py-checkbox">
                              <input
                                type="checkbox"
                                name="agreement"
                                value={
                                  this.state.registerData
                                    .isTermsAndPrivacyChecked
                                }
                                required={true}
                                onChange={(event) => {
                                  this.setState({
                                    registerData: {
                                      ...this.state.registerData,
                                      isTermsAndPrivacyChecked:
                                        event.target.checked,
                                    },
                                  })
                                }}
                                checked={
                                  this.state.registerData
                                    .isTermsAndPrivacyChecked
                                }
                              />
                              <span className="py-form__element__faux" />
                              <span className="py-form__element__label">
                                I also agree to the
                                {/* <a target='_blank' href='https://payyit.com/terms.html'> Terms of Service </a>  */}
                                {/* and <a target='_blank' href='https://payyit.com/privacy-policy.html'> Privacy Policy. </a> */}
                                <a target="_blank"> Terms of Service </a>
                                and <a target="_blank"> Privacy Policy. </a>
                              </span>
                            </Label>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="row mx-n2">
                          <div className="col-sm-12 px-2 mt-4">
                            <Button
                              type="submit"
                              block
                              color="primary"
                              className="btn-sq"
                              disabled={
                                btnLoad ||
                                !this.state.registerData
                                  .isTermsAndPrivacyChecked ||
                                !this.state.registerData.isPromotionalChecked
                              }
                            >
                              {btnLoad ? (
                                <Spinner color="default" size="sm" />
                              ) : (
                                'Sign Up'
                              )}
                            </Button>
                          </div>
                        </div>
                      </Form>

                      {/* {!uuid && !token &&  <React.Fragment>
                    <div className="row mx-n2 mt-5 mb-3" >
                      <div className="col-sm-12 px-2 text-center" >
                        <p className="py-text mb-0">or sign up with</p>
                      </div>
                    </div>
                    <div className="row mx-n2">
                      <div className="col-sm-12 px-2 text-center" >
                        <a className="btn btn-social--google" disabled={loading} href={`${process.env.API_URL}/api/v2/auth/login/google`}>Google</a>
                      </div>
                    </div>
                    </React.Fragment>} */}
                      {/* Login link pera  */}
                      <div className="row mx-n2 mt-4 pt-2">
                        <div className="col-sm-12 px-2 text-center">
                          <p className="py-text mb-0">
                            Have an account?{' '}
                            <NavLink
                              to={
                                !!uuid && !!token
                                  ? `/signin${search}`
                                  : '/signin'
                              }
                              className="py-text--link"
                            >
                              Sign In
                            </NavLink>
                          </p>
                          <p className="py-text mt-4 suggest-info">
                            To experience the full power of Finance, please sign
                            up from a computer or tablet
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Col>
        </Row>
        <VideoModal
          isOpen={this.state.videoModal}
          toggle={() => this.setState({ videoModal: !this.state.videoModal })}
        />
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  login: (data) => {
    dispatch(login(data))
  },
  googleLogin: (data) => {
    dispatch(googleLogin(data))
  },
  showSnackbar: (message, error) => {
    dispatch(openGlobalSnackbar(message, error))
  },
  registerVerify: (email, token) => {
    dispatch(registerVerify(email, token))
  },
  invitationVerify: (search) => {
    dispatch(invitationVerify(search))
  },
  setSelectedBussiness: (id, token) => {
    dispatch(setSelectedBussiness(id, token))
  },
})

const mapStateToProps = (state) => {
  return {
    registerVerification: state.registerVerify,
  }
}

const firstHOC = withGoogleReCaptcha(
  connect(mapStateToProps, mapDispatchToProps)(SignUp)
)
const secondHOC = withRouter(firstHOC)

export default secondHOC
