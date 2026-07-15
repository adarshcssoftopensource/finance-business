import React, { Component } from 'react'
import { Button, Col, Row } from 'reactstrap';
import history from '../../customHistory';
import { withRouter } from 'react-router-dom';
import { connect } from "react-redux";
import { get as _get } from "lodash";
import { UncontrolledTooltip } from 'reactstrap'
import { ShowPaymentIcons } from '../../global/ShowPaymentIcons';
import TurnOnPayments from '../../global/turnOnPayments'
import InformationAlert from '../../global/InformationAlert'
import { help, InfoIcon, isDisableHelpButtonForStarterPlan, customerSupportTooltipText } from '../../utils/GlobalFunctions';
import { bindActionCreators } from 'redux';
import { openGlobalSnackbar } from '../../actions/snackBarAction';
import * as BusinessAction from "../../actions/businessAction";
import MobileOtpVerify from '../../global/MobileVerify';
import { _getUser } from '../../utils/authFunctions';
import noPeymySvg from "../../assets/no-peymy.svg"
import applePaySvg from "../../assets/cards/applepay.svg"
import googlePaySvg from "../../assets/cards/googlepay.svg"
import aliPaySvg from "../../assets/cards/alipay.svg"
import wechatPaySvg from "../../assets/cards/wechatpay.svg"


class NoCheckouts extends Component {
    constructor(props){
        super(props);
        this.state = {
            openPhoneModal: false,
            userData: {},
            showChatWithSupport : true
        }
    }

    componentDidMount() {
        const token = localStorage.getItem('token')
        const user = _getUser(token);
        this.setState({
            userData: user,
        })
    }

    checkUserMobileValidation = () => {
        const user = this.state.userData;
        if(user && user.securityCheck && !user.securityCheck.mobileVerified) {
            this.setState({
                openPhoneModal: true
            })
        } if(user && user.securityCheck && !user.securityCheck.emailVerified){
            this.props.showSnackbar("Please verify your email, to use this feature", true)
        } else {
            help();
        }
    }

    closePhoneModal = () => {
        this.setState({
            openPhoneModal: false
        })
    }

    handleVerifyOtp = () => {
        const token = localStorage.getItem('token')
        const user = _getUser(token);
        this.setState({
            userData: user
        })
        help();
    }

    goToPayments = () => {
        history.push('/app/payments')
    }

    render() {
        const { paymentSettings, type, isViewer, selectedBusiness } = this.props
        const activeSubscription =  _get(selectedBusiness, "subscription.planLevel", 1);
        const isHelpButtonDisable = isDisableHelpButtonForStarterPlan(activeSubscription);
        const {openPhoneModal, userData} = this.state
        return (
            <div>
                <Row className="card-body pd0 no-checkouts">
                    <Col xs={6} sm={6} md={6} lg={6}>
                        {type ?
                            <img src={noPeymySvg} className="img-fluid mrR0" alt="" />
                         :
                            <img src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/no-checkouts.svg`} className="img-fluid mrR0" alt="" />
                         }

                    </Col>
                    <Col xs={6} sm={6} md={6} lg={6} className="mrT50">
                        <h5 className="text-primary mrB30">{type === 'peyme' ? "Finance.Me Lynk" : type === 'funding' ? 'Give' : 'CHECKOUTS'}</h5>
                        <h2 className="">
                            {
                                type  === 'peyme'
                                ? "Instantly collect payments from customers, friends, & family with one dedicated link"
                                : type === 'funding'
                                ? "Instantly collect payments from customers, friends, & family with one dedicated link"
                                : "Accept payments directly from your website."
                            }
                        </h2>
                        <h4 className="">
                            {type ? "" : "No coding required."}
                        </h4>
                        {isViewer ? <div className="checkout-not-availale mrT50 mrB30">
                                <h5 className="mrT10 error-text"> You have not permission to setup {type === 'peyme' ? "Finance.Me" : type === 'funding' ? 'Give' : "Checkout"} </h5>
                                <span class="py-text py-text--hint">Please contact your admin to setup {type === 'peyme' ? "Finance.Me" : type === 'funding' ? 'Give' : "Checkout"}.</span>
                            </div> : <div>
                            {
                                paymentSettings.isOnboardingApplicable || paymentSettings.isStripeSupported ?
                                    <h4 className="text-secondry mt-5 mb-4">{!!paymentSettings.charges ? paymentSettings.charges.card_charge_message : ''}</h4>
                                : null
                            }
                            <div className="payment__cards__list__item-big mb-4">
                                {/* <ShowPaymentIcons
                                    icons={['visa', 'master', 'amex', 'discover']}
                                    className="icon big-icon"
                                /> */}
                            </div>
                            <div className="payment__cards__list__item-big mb-4">
                                <div className="icon big-icon">
                                    <img src={applePaySvg} alt="Apple Pay" />
                                    <img src={googlePaySvg} alt="Apple Pay" />
                                    <img src={aliPaySvg} alt="Apple Pay" />
                                    <img src={wechatPaySvg} alt="Apple Pay" />
                                </div>
                            </div>
                            {
                                paymentSettings.isOnboardingApplicable && paymentSettings.isStripeSupported && !paymentSettings.isSetupDone && !paymentSettings?.legalData?.isPayByBankEnabled 
                                && !paymentSettings?.legalData?.isBnplEnabled ?
                                    <TurnOnPayments />
                                : <div></div>
                            }
                        </div>}
                    </Col>
                    {!type &&
                    <Col xs={12} sm={12} md={12} lg={12} className="mt-5 text-center">
                        <Button
                            hidden={!(paymentSettings.isSetupDone || paymentSettings?.legalData?.isPayByBankEnabled || paymentSettings?.legalData?.isBnplEnabled) || isViewer}
                            onClick={() => history.push('/app/sales/checkouts/add')}
                            color="primary"
                        >Create new checkout</Button>
                    </Col>
                    }
                </Row>
                    <Row className="justify-content-center">
                        <Col xs={12} sm={12} md={12} lg={type ? '7' : '6' } className="mrT10 text-center">
                            <div className="checkouts-inline-payments-provision__terms-footer">
                                <span className="py-text py-text--hint mb-0">
                                {type === 'peyme'
                                    ? "Add your dedicated Finance.Me Lynk to your digital business card, blog, website, and social media profile to allow anyone to pay you anytime and anywhere."
                                    : type === 'funding'
                                    ? "Add your dedicated Give link to your digital business card, blog, website, and social media profile to allow anyone to pay you anytime and anywhere."
                                    : "Add a checkout link on your blog or social media profile so your customers may pay you any time, even without an invoice."
                                }
                                </span>
                                {!type &&
                                    <span className="py-text py-text--hint mt-0">
                                        Create your first checkout.
                                    </span>
                                }
                            </div>
                        </Col>
                    </Row>
                    <div className='content-wrapper__main__fixed'>
                        <div className='justify-content-center row'>
                            <div className="col-md-12 col-lg-12 text-center">
                                { !isViewer && paymentSettings?.onboardingStatus !== 'verified' && paymentSettings.isOnboardingApplicable && !paymentSettings.isStripeSupported && !paymentSettings?.legalData?.isPayByBankEnabled && !paymentSettings?.legalData?.isBnplEnabled ?
                                    <InformationAlert varient="info">
                                        { InfoIcon() }
                                        <div className="alert-content">
                                            <div className="alert-desc">
                                                {
                                                    type === 'peyme'
                                                    ? "To create your dedicated Finance.Me Lynk, please activate payments on your account."
                                                    : type === 'funding'
                                                    ? "To create your dedicated Give link, please activate payments on your account."
                                                    : "To activate Checkouts on your account, please contact customer support"
                                                }
                                            </div>
                                        </div>
                                        <div className="alert-button ms-auto">
                                            <div id="chat_with_us">
                                                <Button outline onClick={this.goToPayments}>
                                                    <span>Activate Payments</span>
                                                </Button>
                                            </div>
                                            <MobileOtpVerify
                                                openPhoneModal={openPhoneModal}
                                                closePhoneModal= {this.closePhoneModal}
                                                data={userData}
                                                handleVerifyOtp={this.handleVerifyOtp}
                                                showSnackbar={this.props.showSnackbar}
                                            />
                                        </div>
                                    </InformationAlert>
                                    : !paymentSettings.isOnboardingApplicable && !paymentSettings.isStripeSupported ?
                                        <InformationAlert varient="danger">
                                            { InfoIcon() }
                                            <div className="alert-content">
                                                <div className="alert-desc" >
                                                    Payments by Finance is not available in your country yet.
                                                </div>
                                            </div>
                                        </InformationAlert>
                                    : null
                                }
                            </div>
                        </div>
                    </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        selectedBusiness: state.businessReducer.selectedBusiness,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        actions: bindActionCreators(BusinessAction, dispatch),
        showSnackbar: (message, error) => {
            dispatch(openGlobalSnackbar(message, error))
        },
    };
};


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NoCheckouts));
