import React, { PureComponent } from 'react';
import { withGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { Container, Row, Col, Button, Form, FormGroup, Label, Input, Spinner } from 'reactstrap';
import { withRouter } from 'react-router-dom'
import history from '../../customHistory'
import SignupService from '../../api/SignupService'
import { connect } from 'react-redux';
import { getLogoURL } from "../../utils/GlobalFunctions";
import { openGlobalSnackbar } from "../../actions/snackBarAction";
import SnakeBar from '../../global/SnakeBar';
import { NavLink } from 'react-router-dom';
import { _setToken, _getUser } from '../../utils/authFunctions'
import queryString from 'query-string'
import { REGISTER_VERIFY_SUCCESS } from '../../constants/ActionTypes';
import CenterSpinner from '../../global/CenterSpinner';
import { setSelectedBussiness } from '../../actions/businessAction';
import VideoModal from '../../utils/PopupModal/VideoModal';
import { _isValidEmail, _isValidPhone } from '../../utils/GlobalFunctions'
import FormValidationError from '../../global/FormValidationError';
import { Helmet } from 'react-helmet'
import anime1Png from "../../assets/images/anime/anime-1.png"
import anime2Png from "../../assets/images/anime/anime-2.png"
import anime3Png from "../../assets/images/anime/anime-3.png"
import anime4Png from "../../assets/images/anime/anime-4.png"
import anime5Png from "../../assets/images/anime/anime-5.png"
import anime6Png from "../../assets/images/anime/anime-6.png"
import anime7Png from "../../assets/images/anime/anime-7.png"
import anime8Png from "../../assets/images/anime/anime-8.png"

const setRegisterData = (state) => {
  const payload = {
    firstName: state && state.firstName || '',
    lastName: state && state.lastName || '',
    email: state && state.email || '',
    phone: state && state.phone || ''
  }
  return payload
}
class JoinWaitList extends PureComponent {

  state = {
    errorMessage: '',
    registerData: setRegisterData(),
    showPassword: false,
    showConfirmPassword: false,
    btnLoad: false,
    errors: {},
    captchaToken: ''
  }

  componentDidMount() {
    document.title = "Finance - WaitList"
  }

  handleText = (event) => {
    const { name, value } = event.target
    this.setState({
      errors: {},
      registerData: { ...this.state.registerData, [name]: value, }
    })
  }

  updateError = (key, value) => {
    this.setState(prevState => ({
      ...prevState, errors: {
        ...prevState.errors,
        [key]: value
      }
    }));
  }

  checkConfirmationPassword = (event) => {
    event.preventDefault();
    const registerData = this.state.registerData;
    const { firstName, lastName, email, phone } = registerData;
    if (!firstName) {
      this.updateError(`firstName`, true)
    }
    if (!lastName) {
      this.updateError(`lastName`, true)
    } if (!email) {
      this.updateError(`email`, true)
    } else if (email && !_isValidEmail(email)) {
      this.updateError(`emailText`, "valid email required")
    }
    if (!phone) {
      this.updateError(`phone`, true)
    } else if (phone && !_isValidPhone(phone)) {
      this.updateError(`phoneText`, "Valid phone number required")
    }
    if (phone && email && lastName && firstName) {
        this.signUpFormSubmit(registerData)
    }

  }

  signUpFormSubmit = async (registerData) => {
    try {
      // const { search } = this.props.location
      const user = {
        userInput: setRegisterData(registerData)
      }
      if(!Object.keys(this.state.errors).length){
        this.setState({ btnLoad: true })
        const response = await SignupService.waitListRegistration(user)
        if (!!response) {
          if (response.statusCode === 200) {
            this.setState({ btnLoad: false })
            history.push('/signin')
            this.props.showSnackbar('Thank you for joining the waitlist. We will contact you on or before July 18th.', false);
          }else {
            this.setState({ btnLoad: false })
            this.props.showSnackbar(response.data.message, true);
          }
        }else {
          this.setState({ btnLoad: false })
          this.props.showSnackbar('Something went wrong, please try again!', true);
        }
      }
    } catch (error) {
      if (!!error) {
        this.props.showSnackbar(error.data.message, true);
      }
      this.setState({  btnLoad: false })
    }
  }

  handleVerifyRecaptcha = async (e) => {
    e.preventDefault();
      this.checkConfirmationPassword(e);
  }

  render() {
    const { registerData, showPassword, showConfirmPassword, loading, btnLoad, errors } = this.state
    const { location: { pathname, search }, registerVerification } = this.props
    const { token, uuid } = queryString.parse(search)
    return (
      <div className="py-page__auth">
        <Helmet>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Helmet>
        <div className="anime-content" >
          <div className="anime-item one"><img src={anime1Png} alt="Animation" /> </div>
          <div className="anime-item two"><img src={anime2Png} alt="Animation" /> </div>
          <div className="anime-item three"><img src={anime3Png} alt="Animation" /> </div>
          <div className="anime-item four"><img src={anime4Png} alt="Animation" /> </div>
          <div className="anime-item five"><img src={anime5Png} alt="Animation" /> </div>
          <div className="anime-item six"><img src={anime6Png} alt="Animation" /> </div>
          <div className="anime-item seven"><img src={anime7Png} alt="Animation" /> </div>
          <div className="anime-item eight"><img src={anime8Png} alt="Animation" /> </div>
        </div>
        <Row className="no-gutters d-flex align-items-center my-auto">
          <Col xl="6"  lg="8" md="12" className="d-flex flex-column align-items-center justify-content-center log-form-box">
            <SnakeBar isAuth={false} />
            {
              loading ? <CenterSpinner /> : (
                <div>
                  {/* Finance Logo At Header */}
                  <div className="py-banner">
                      <div className="py-banner-desc text-center">
                          <p>Due to a large influx of new users, we have paused new users' sign ups. Join our waitlist to sign up with Finance. We will allow new users to onboard on or before November 30th. </p>
                      </div>
                  </div>
                  <div className="text-center mb-5 mt-5" >
                    <a href={`${process.env.REACT_APP_ROOT_URL}`} className="step-logo">
                      <img src={getLogoURL()} alt="Paymynt" />
                    </a>
                  </div>
                  <div className="py-page__login mb-5">
                    {/* Form Heading Title */}
                    <div className="row mx-n2">
                      <div className="col-sm-12 mb-3 mb-lg-4 pb-1 px-2">
                        <h1 className="py-heading--title mb-0">Join our waitlist</h1>
                      </div>
                    </div>
                    <Form className="login-form" onSubmit={this.handleVerifyRecaptcha}>
                      {/* First Name And Last Name */}
                      <div className="row mx-n3">
                        <div className="col-md-6 px-3 mb-3">
                          <div className="icon-input" >
                            <Label for="AccountSignup__Firstname" className="label is-required" >First name</Label>
                            <Input
                              value={registerData.firstName}
                              type="text"
                              name="firstName"
                              className="me-2"
                              id="AccountSignup__Firstname"
                              placeholder="First name"
                              onChange={this.handleText}
                            />
                            <FormValidationError showError={errors.firstName} />
                          </div>
                        </div>
                        <div className="col-md-6 px-3 mb-3">
                          <div className="icon-input" >
                            <Label for="AccountSignup__Lastname" className="label is-required" >Last name</Label>
                            <Input
                              type="text"
                              name="lastName"
                              id="AccountSignup__Lastname"
                              placeholder="Last name"
                              value={registerData.lastName}
                              onChange={this.handleText}
                            />
                            <FormValidationError showError={errors.lastName} />
                          </div>
                        </div>
                      </div>

                      {/* Email Address Field */}
                      <div className="row mx-n3">
                        <div className="col-sm-12 px-3 mb-3">
                          <div className="icon-input" >
                            <Label for="AccountSignup__Email" className="label is-required" >Email address</Label>
                            <Input
                              type="text"
                              name="email"
                              id="AccountSignup__Email"
                              placeholder="Email address"
                              value={registerData.email}
                              onChange={this.handleText}
                              disabled={!!uuid && !!token}
                            />
                            <FormValidationError showError={errors.email} />
                            <FormValidationError showError={errors.emailText} message={errors.emailText ? errors.emailText : ''} />
                          </div>
                        </div>
                      </div>

                      {/* Password Field */}
                      <div className="row mx-n3">
                        <div className="col-sm-12 px-3 mb-3">
                          <div className="icon-input" >
                            <Label for="AccountSignup__Phone" className="label is-required" >Phone number</Label>
                            <Input
                              type="text"
                              name="phone"
                              id="AccountSignup__Phone"
                              placeholder="Phone Number"
                              value={registerData.phone}
                              onChange={this.handleText}
                            />
                            <FormValidationError showError={errors.phone} />
                            <FormValidationError showError={errors.phoneText} message={errors.phoneText ? errors.phoneText : ''} />
                          </div>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="row mx-n2">
                        <div className="col-sm-12 px-2 mt-4">
                          <Button type="submit" block color="primary" className="btn-sq" disabled={btnLoad} >{btnLoad ? <Spinner color="default" size="sm" /> : 'Confirm'}</Button>
                        </div>
                      </div>
                    </Form>

                    {/* Login link pera  */}
                    <div className="row mx-n2 mt-4 pt-2" >
                      <div className="col-sm-12 px-2 text-center" >
                        <p className="py-text mb-0">Have an account? <NavLink to={!!uuid && !!token ? `/signin${search}` : '/signin'} className="py-text--link">Sign In</NavLink></p>
                        <p className="py-text mt-4 suggest-info" >To experience the full power of Finance, please sign up from a computer or tablet</p>
                    </div>
                  </div>
                </div>
                </div>
              )
            }
          </Col>
        </Row>
      <VideoModal isOpen={this.state.videoModal} toggle={() => this.setState({ videoModal: !this.state.videoModal })} />
      </div >
    );
  }
}


const mapDispatchToProps = (dispatch) => ({
  showSnackbar: (message, error) => {
    dispatch(openGlobalSnackbar(message, error))
  },
})


const firstHOC = withGoogleReCaptcha(connect(null, mapDispatchToProps)(JoinWaitList))
const secondHOC = withRouter(firstHOC);

export default secondHOC;
