import React, { PureComponent, Fragment } from 'react';
import { Container, Row, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import history from '../../customHistory'
import { openGlobalSnackbar } from '../../actions/snackBarAction';
import { forgotPassword } from '../../api/LoginService';
import { generateResetLink } from '../../actions/authAction';
import CenterSpinner from '../../global/CenterSpinner';
import { NavLink } from 'react-router-dom';
import FormValidationError from '../../global/FormValidationError';
import { _isValidEmail } from '../../utils/GlobalFunctions';
import { Helmet } from 'react-helmet';
import Icon from '../common/Icon';
import { getLogoURL } from '../../utils/GlobalFunctions';
import symbolsIcon from "../../assets/icons/product/symbols.svg";
import anime1Png from "../../assets/images/anime/anime-1.png"
import anime2Png from "../../assets/images/anime/anime-2.png"
import anime3Png from "../../assets/images/anime/anime-3.png"
import anime4Png from "../../assets/images/anime/anime-4.png"
import anime5Png from "../../assets/images/anime/anime-5.png"
import anime6Png from "../../assets/images/anime/anime-6.png"
import anime7Png from "../../assets/images/anime/anime-7.png"
import anime8Png from "../../assets/images/anime/anime-8.png"
import FinanceBusinessLogo from '../common/FinanceBusinessLogo';


class ForgotPassword extends PureComponent {
    state = {
        email: '',
        emailSent: false,
        errors: {}
    }
    componentDidMount() {
        document.title = "Finance - Password Reset"
    }

    handleText = e => {
        const { name, value } = e.target
        this.setState({ [name]: value, errors: {} })
    }

    sendEMail = async (e) => {
        e.preventDefault()
        const basicAuthToken = localStorage.getItem('basicAuthToken')
        localStorage.clear();
        localStorage.setItem('basicAuthToken', basicAuthToken)

        try {
            const { email } = this.state
            if (!email) {
                this.setState({
                    ...this.state,
                    errors: {
                        emailErr: true,
                        emailText: 'This field is required'
                    }
                })
            } else if (email && !_isValidEmail(email)) {
                this.setState({
                    ...this.state,
                    errors: {
                        emailErr: true,
                        emailText: 'Valid email is required'
                    }
                })
            } else {
                const payload = { email }
                this.props.generateResetLink(payload)
                this.setState({ emailSent: true })
                this.props.openGlobalSnackbar("Reset instructions has been sent.", false)
            }
        } catch (error) {
            // history.push('/login')
            this.props.openGlobalSnackbar("Something went wrong, please try again later.", true)
        }
    }

    render() {
        const { email, emailSent, errors } = this.state
        const { data, loading } = this.props.resetLink;
        let url = new URL(window.location.href);
        return (
            <div fluid className="py-page__auth">
                <Helmet>
                    <meta charSet="utf-8" />
                    <title>Finance - Forgot your password</title>
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
                    <Col xl="6"  lg="8" md="12" className="d-flex flex-column align-items-center justify-content-center log-form-box" >
                        {emailSent ?
                            loading ? (<CenterSpinner className="text-left" />) : (<Fragment>
                                {/* Finance Logo At Header */}
                                <div className="text-center mb-5 mt-5" >
                                    <a href={`${process.env.REACT_APP_ROOT_URL}`} className="step-logo" ><FinanceBusinessLogo height={36} /></a>
                                </div>
                                <div className="py-page__login text-center mb-5">
                                    {/* Form Heading Title */}
                                    <div className="row mx-n2">
                                        <div className="col-sm-12 mb-3 mb-lg-4 pb-1 px-2">
                                            <h1 className="py-heading--title mb-0">Check Your Email</h1>
                                        </div>
                                    </div>
                                    <div className="row mx-n2">
                                        <div className="col-sm-12 px-2">
                                            <p className="text-typo-1 mb-2">{data && !!data.messageToDisplay ? (<div dangerouslySetInnerHTML={{ __html: data.messageToDisplay }} />) : (<div>Internal Server Error</div>)}</p>
                                        </div>
                                    </div>
                                    <div className="row mx-n2">
                                        <div className="col-sm-12 px-2">
                                            <p className="text-typo-1 mb-0" >If you don't receive the email, check your spam folder or <a href={`${process.env.REACT_APP_ROOT_URL}#contact-section`} target="_blank">contact us</a>. Or try password reset using a <a href="javascript: void(0)" onClick={() => this.setState({ emailSent: false, email: "" })}>different email address</a>.</p>
                                        </div>
                                    </div>
                                </div>
                            </Fragment>)
                            : (<Fragment>
                                <div className="text-center mb-5 mt-5" >
                                    <a href={`${process.env.REACT_APP_ROOT_URL}`} className="step-logo"><FinanceBusinessLogo height={36} /></a>
                                </div>
                                <div className="py-page__login mb-5">
                                    {/* Form Heading Title */}
                                    <div className="row mx-n2">
                                        <div className="col-sm-12 mb-3 mb-lg-4 pb-1 px-2">
                                            <h1 className="py-heading--title mb-0">Forgot your password?</h1>
                                        </div>
                                    </div>
                                    <Form className="login-form" onSubmit={this.sendEMail}>
                                        {/* Email Address Field */}
                                        <div className="row mx-n2 mb-3">
                                            <div className="col-sm-12 px-2">
                                                <div className="icon-input" >
                                                    <Label for="AccountReset__Email" className="input-icon-label sr-only" >
                                                        <Icon
                                                            className="Icon"
                                                            xlinkHref={`${symbolsIcon}#envelope`}
                                                        />
                                                    </Label>
                                                    <Input
                                                        type="text"
                                                        className=""
                                                        name="email"
                                                        value={email}
                                                        id="AccountReset__Email"
                                                        placeholder="Email address"
                                                        onChange={this.handleText}
                                                    />
                                                    <div className="text-left">
                                                        <FormValidationError showError={errors.emailErr} message={errors.emailText ? errors.emailText : ''} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Login link pera  */}
                                        <div className="row mx-n2">
                                            <div className="col-sm-12 px-2 text-left">
                                                <p className="text-typo-1 mb-4">
                                                    Enter your primary email address and we’ll send you instructions on how to reset your password. The primary email address is the email you originally used to register for Finance, or the email where you receive Finance email notifications. It may be different from your usual business or personal email.
                                                </p>
                                            </div>
                                        </div>
                                        {/* Form Submit Button */}
                                        <div className="row mx-n2 mb-4">
                                            <div className="col-sm-12 px-2">
                                                <Button type="submit" color="primary" block className="btn-sq" disabled={loading} >Send Instruction</Button>
                                            </div>
                                        </div>
                                        {/* Register link pera  */}
                                        {!url.searchParams.get('mobile') && <div className="row mx-n2">
                                            <div className="col-sm-12 px-2 text-center">
                                                <NavLink to='/signin' className="btn-primary btn-primary-light btn-block btn-sq">Back to sign in</NavLink>
                                            </div>
                                        </div>}
                                        {/* </div> */}
                                    </Form>
                                </div>
                            </Fragment>)
                        }
                    </Col>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        resetLink: state.getResetLink
    }
}
export default connect(mapStateToProps, { openGlobalSnackbar, generateResetLink })(ForgotPassword);
