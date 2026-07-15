
import React, { PureComponent } from 'react';
import history from '../../customHistory'
import { connect } from 'react-redux'
import { withRouter, NavLink } from 'react-router-dom'
import { Form, Label, Input, Spinner, Button } from 'reactstrap';
import { openGlobalSnackbar } from "../../actions/snackBarAction";
import { Helmet } from 'react-helmet'
import FormValidationError from '../../global/FormValidationError';
import SnakeBar from '../../global/SnakeBar';
import { getLogoURL, _isValidEmail } from '../../utils/GlobalFunctions';
import { resendVerifyEmail } from '../../api/globalServices'
import anime1Png from "../../assets/images/anime/anime-1.png"
import anime2Png from "../../assets/images/anime/anime-2.png"
import anime3Png from "../../assets/images/anime/anime-3.png"
import anime4Png from "../../assets/images/anime/anime-4.png"
import anime5Png from "../../assets/images/anime/anime-5.png"
import anime6Png from "../../assets/images/anime/anime-6.png"
import anime7Png from "../../assets/images/anime/anime-7.png"
import anime8Png from "../../assets/images/anime/anime-8.png"


class notifyEmailVerification extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      isResendEmail: false,
      resendEmail: '',
      resendEmailError: '',
      btnLoad: false
    };
  }

  componentDidMount() {
    document.title = "Finance - Email Verification";
    const authToken = localStorage.getItem("token");
    if (!authToken) {
      history.push('/signin');
      window.location.reload(true);
      return
    } else {
      localStorage.removeItem("token");
    }
  }

  handleText = (event) => {
    const { value } = event.target
    this.setState({
      resendEmailError: '',
      resendEmail: value
    })
  }

  handleResendEmail = () => {
    this.setState({ isResendEmail: true });
  }

  resendConfirmation = async (email) => {
    const { showSnackbar } = this.props;
    try {
      this.setState({ btnLoad: true });
      const response = await resendVerifyEmail({email});
      this.setState({ btnLoad: false });
      if (response.statusCode === 200) {
        showSnackbar(response.message, false);
        this.setState({ isResendEmail: false, resendEmail: '', resendEmailError: '' });
      } else {
        showSnackbar(response.message, true);
      }
    } catch (e) {
      this.setState({ btnLoad: false });
      showSnackbar(e.message || e.data.message, true);
    }
  };

  handleVerifyResendEmail = async (event) => {
    event.preventDefault();
    if (!this.state.resendEmail) {
      this.setState({ resendEmailError: 'Email required' })
    } else if (this.state.resendEmail && !_isValidEmail(this.state.resendEmail)) {
      this.setState({ resendEmailError: 'valid email required' })
    } else {
      this.resendConfirmation(this.state.resendEmail);
    }
  }

  render() {
    return (
      <div className="py-page__auth">
        <Helmet>
          <meta charSet="utf-8" />
          <title>Finance - Onboarding</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Helmet>
        {/* Animation-Content */}
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


        <div className="row no-gutters d-flex align-items-center my-auto">
          <div className="col-lg-8 col-xl-6 col-md-12 d-flex flex-column align-items-center justify-content-center log-form-box">
            <SnakeBar isAuth={false} />
            {/* Finance Logo At Header */}
            <div className="text-center mb-5 mt-5" >
              <a href={`${process.env.REACT_APP_ROOT_URL}`} className="step-logo"><img src={getLogoURL()} alt="Paymynt" /></a>
            </div>
            <div className="py-page__login mb-5">
              {/* Form Heading Title */}
              {
                !this.state.isResendEmail ?
                  <div className="row mx-n2 text-center">
                    <div className="col-sm-12 mb-3 mb-lg-4 pb-1 px-2">
                      <h1 className="py-heading--title mb-0">Email Verification</h1>
                    </div>
                    <div className="col-sm-12 text-center">
                    Please verify your email to proceed. If you did not receive the verification email,&nbsp;
                      <a href="javascript: void(0);" onClick={this.handleResendEmail}>click here to resend.</a>
                    </div>
                    <div className="row mx-n2 mt-4 pt-2" >
                      <div className="col-sm-12 px-2 text-center">
                        <p className="py-text mb-0">Verification complete on another device? <NavLink to={'/signin'} className="py-text--link">Sign In</NavLink></p>
                      </div>
                    </div>
                  </div>
                :
                <div className="row mx-n2">
                  <div className="col-sm-12 mb-3 mb-lg-4 pb-1 px-2 text-center">
                    <h1 className="py-heading--title mb-0">Resend Email</h1>
                  </div>
                  <Form className="login-form col-sm-12" onSubmit={this.handleVerifyResendEmail}>
                    <div className="row mx-n3">
                      <div className="col-sm-12 px-3 mb-3">
                        <div className="icon-input" >
                          <Label for="resendEmail" className="label is-required" >Email address</Label>
                          <Input
                            type="text"
                            name="resendEmail"
                            id="resendEmail"
                            placeholder="What's your email address?"
                            value={this.state.resendEmail}
                            onChange={this.handleText}
                          />
                          <FormValidationError showError={this.state.resendEmailError} message={this.state.resendEmailError ? this.state.resendEmailError : ''} />
                        </div>
                      </div>
                    </div>
                    <div className="row mx-n2">
                      <div className="col-sm-12 px-2 mt-4">
                        <Button type="submit" block color="primary" className="btn-sq" disabled={this.state.btnLoad}>
                          {this.state.btnLoad ? <Spinner color="default" size="sm" /> : 'Resend Email'}
                        </Button>
                      </div>
                    </div>
                    <div className="row mx-n2 mt-4 pt-2" >
                      <div className="col-sm-12 px-2 text-center">
                        <p className="py-text mb-0">Verification complete on another device? <NavLink to={'/signin'} className="py-text--link">Sign In</NavLink></p>
                      </div>
                    </div>
                  </Form>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    showSnackbar: (message, error) => {
      dispatch(openGlobalSnackbar(message, error))
    }
  };
};


export default withRouter(
  connect(
    null,
    mapDispatchToProps
  )(notifyEmailVerification)
);
