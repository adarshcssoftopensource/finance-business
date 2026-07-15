import React, { PureComponent, Fragment } from 'react';
import { Container, Row, Col, Button, Form, FormText, FormGroup, Label, Input, Spinner } from 'reactstrap';
import { verifyLink, resetPassword } from '../../actions/authAction';
import { connect } from 'react-redux'
import history from '../../customHistory'
import CenterSpinner from '../../global/CenterSpinner';
import { openGlobalSnackbar } from '../../actions/snackBarAction';
import SnakeBar from '../../global/SnakeBar';
import FormValidationError from '../../global/FormValidationError';
import { Helmet } from 'react-helmet'
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


class ResetPassword extends PureComponent {
    state = {
        npassword: "",
        cpassword: "",
        inputType: true,
        errors: {}
    }
    componentDidMount() {
        const { token } = this.props.match.params;
        this.props.verifyLink(token);
    }

    _handleValues = ({ target: { name, value } }) => {
        this.setState({
            [name]: value
        })
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.passwordReset !== nextProps.passwordReset) {
            const { error, data, success } = nextProps.passwordReset;
            if (error) {
                this.props.openGlobalSnackbar(data.message, true)
            } else if (success) {
                this.props.openGlobalSnackbar("Password changed successfully", false);
                history.push('/signin')

            }

        }
    }

    _handleSubmit = e => {
        e.preventDefault()
        const { npassword, cpassword } = this.state;
        if (!npassword) {
            this.setState({
                ...this.state,
                errors: {
                    passErr: true,
                    passText: 'This field is required'
                }
            })
        } else if (npassword && npassword.length < 8) {
            this.setState({
                ...this.state,
                errors: {
                    passErr: true,
                    passText: 'at least 8 characters, but longer is better'
                }
            })
        } else if (!cpassword) {
            this.setState({
                ...this.state,
                errors: {
                    cpassErr: true,
                    cpassText: 'This field is required'
                }
            })
        } else if (npassword !== cpassword) {
            this.setState({
                ...this.state,
                errors: {
                    cpassErr: true,
                    cpassText: 'Confirm password should be same as new password'
                }
            })
        } else {
            let data = {
                password: npassword,
                privateToken: this.props.linkVerify && this.props.linkVerify.data && this.props.linkVerify.data.privateToken,
                publicToken: this.props.match.params.token
            }
            this.props.resetPassword(data);
        }
    }

    _handleShow = e => {
        this.setState({ inputType: !this.state.inputType })
    }
    render() {
        const { errors } = this.state;
        const { loading, data, success } = this.props.linkVerify;
        return (
            <div className="py-page__auth">
                <Helmet>
                    <meta charSet="utf-8" />
                    <title>Finance - Reset your password</title>
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
                <SnakeBar />

                <Row className="no-gutters d-flex align-items-center my-auto">
                    <Col xl="6"  lg="8" md="12" className="d-flex flex-column align-items-center justify-content-center log-form-box" >
                        {
                            loading ? <CenterSpinner /> :
                                success ? (<Fragment>

                                    {/* Finance Logo At Header */}
                                    <div className="text-center mb-5 mt-5" >
                                        <a href={`${process.env.REACT_APP_ROOT_URL}`} className="step-logo"><img src={getLogoURL()} alt="Paymynt" /></a>
                                    </div>
                                    <div className="py-page__login mb-5">
                                        <div className="login-form">

                                            {/* Form Heading Title */}
                                            <div className="row mx-n2">
                                                <div className="col-sm-12 mb-3 mb-lg-4 pb-1 px-2">
                                                    <h1 className="py-heading--title mb-1">Reset password</h1>
                                                    {/*<p>Add your new password to retrieve your account or &nbsp;<a href="javascript:void(0)" className="py-text--link" onClick={() => history.push('/signin')}>Login</a></p>*/}
                                                </div>
                                            </div>
                                            <Form className="login-form" onSubmit={this._handleSubmit.bind(this)}>
                                                <div className="row mx-n2">
                                                    <div className="col-sm-12 px-2">
                                                        <FormGroup className="mb-3 text-left icon-input">
                                                            <Label for="ResetNewPassword" className="input-icon-label sr-only" >
                                                                <Icon
                                                                    className="Icon"
                                                                    xlinkHref={`${symbolsIcon}#lock2`}
                                                                />
                                                            </Label>
                                                            <Input
                                                                id="ResetNewPassword"
                                                                type={this.state.inputType ? "password" : "text"}
                                                                name="npassword"
                                                                placeholder="New Password"
                                                                onChange={this._handleValues.bind(this)}
                                                            />
                                                            <span className="d-flex justify-content-between">
                                                                {errors && errors.passErr ? <FormValidationError showError={errors.passErr} message={errors.passText ? errors.passText : ''} /> :
                                                                    <span className="py-text--hint">At least 8 characters, but longer is better.</span>}
                                                                <a href="javascript:void(0)" className="py-text--small py-text--link" onClick={this._handleShow.bind(this)} >{this.state.inputType ? "Show" : "Hide"}</a>
                                                            </span>
                                                        </FormGroup>
                                                    </div>
                                                </div>
                                                <div className="row mx-n2">
                                                    <div className="col-sm-12 px-2">
                                                        <FormGroup className="mb-3 text-left icon-input">
                                                            <Label for="ResetConfirmPassword" className="input-icon-label sr-only" >
                                                                <Icon
                                                                    className="Icon"
                                                                    xlinkHref={`${symbolsIcon}#lock2`}
                                                                />
                                                            </Label>
                                                            <Input
                                                                className=""
                                                                type="password"
                                                                id="ResetConfirmPassword"
                                                                name="cpassword"
                                                                placeholder="Confirm Password"
                                                                onChange={this._handleValues.bind(this)}
                                                            />
                                                            <FormValidationError showError={errors.cpassErr} message={errors.cpassText ? errors.cpassText : ''} />
                                                        </FormGroup>
                                                    </div>
                                                </div>
                                                <div className="row mx-n2">
                                                    <div className="col-sm-12 px-2">
                                                        <Button type="submit" disabled={loading} color="primary" block className="btn-sq mt-1" >Reset Password &nbsp;{loading && (<Spinner size="md" color="default" />)}</Button>
                                                    </div>
                                                </div>

                                            </Form>
                                        </div>
                                    </div>
                                </Fragment>)
                                    :
                                    (<Fragment>
                                        {/* Finance Logo At Header */}
                                        <div className="text-center mb-5 mt-5" >
                                            <a href={`${process.env.REACT_APP_ROOT_URL}`} className="step-logo"><img src={getLogoURL()} alt="Paymynt" /></a>
                                        </div>
                                        {/* Form Heading Title */}
                                        <div className="py-page__login mb-5">
                                            <div className="login-form">
                                                <div className="row mx-n2">
                                                    <div className="col-sm-12 pb-0 px-2">
                                                        <h1 className="py-heading--title mb-1 color-red">Password Reset Unsuccessful</h1>
                                                        <p className="mb-1" >The password reset link was invalid, possibly because it has already been used. Please request another password reset.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Fragment>)
                        }

                    </Col>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        linkVerify: state.linkVerify,
        passwordReset: state.passwordReset
    }
}
export default connect(mapStateToProps, { verifyLink, resetPassword, openGlobalSnackbar })(ResetPassword);