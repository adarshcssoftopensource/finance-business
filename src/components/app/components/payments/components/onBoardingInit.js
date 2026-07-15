import React, { Component } from 'react'
import { Row, Col } from 'react-bootstrap';
import { Button, UncontrolledTooltip } from 'reactstrap'
import { withRouter } from 'react-router-dom';
import { connect } from "react-redux";
import { get as _get } from "lodash";
import CreditCards from '../../../../../global/creditCards';
import { help, InfoIcon, isDisableHelpButtonForStarterPlan, customerSupportTooltipText } from '../../../../../utils/GlobalFunctions';
import TurnOnPayments from '../../../../../global/turnOnPayments'
import InformationAlert from '../../../../../global/InformationAlert'
import { _getUser } from '../../../../../utils/authFunctions';
import { openGlobalSnackbar } from '../../../../../actions/snackBarAction';
import { bindActionCreators } from 'redux';
import * as BusinessAction from "../../../../../actions/businessAction";
import MobileOtpVerify from '../../../../../global/MobileVerify';
import { getAllCountryPrices } from '../../../../../api/utilityServices';

class PaymentInit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openPhoneModal: false,
      userData:{},
      prices: [],
    }
  }

  async componentDidMount() {
    const token = localStorage.getItem('token')
    const user = _getUser(token);
    const response = await getAllCountryPrices();
    this.setState({
        userData: user,
        prices: response?.data?.countryPrice
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

  render() {
    const { paymemntSettings, selectedBusiness } = this.props;
    const activeSubscription =  _get(selectedBusiness, "subscription.planLevel", 1);
    const isHelpButtonDisable = isDisableHelpButtonForStarterPlan(activeSubscription);
    const { openPhoneModal, userData } = this.state;
    const selectedBusinessCountryId = selectedBusiness?.country?.id;
    const selectedBusinessCountryPrices = this.state.prices?.find(price => price?.countryId == selectedBusinessCountryId && price?.isOnboardingApplicable);
    const domesticFee = selectedBusinessCountryPrices?.public?.domestic;
    const internationalFee = selectedBusinessCountryPrices?.public?.international;
    return (
      <div className="content-wrapper__main__fixed">
        <header className="py-header py-header--page text-center">
          <div className="py-header--title">
            <h5 className="text-primary">Payments by Finance</h5>
            <div className="py-heading--title mb-3">
              Your customers can pay you online.
            </div>
            <CreditCards
              style={{ width: '54px', border: '0px', marginRight: '8px' }}
              cards={['cc-visa', 'cc-mastercard', 'cc-amex', 'cc-discover', 'cc-bank']} />
          </div>
        </header>

        <div className="text-center">

          <div className="py-heading--subtitle mt-0">
            Get paid by your customers using:
          </div>

          <Row className="justify-content-center">
            <Col md={10}>
              <Row className="justify-content-center">
                <Col md={4} className="d-flex">
                  <a
                    className="card card-body card-hover p-4 justify-content-start align-items-center"
                    onClick={() => {
                      this.props.history.push('/app/invoices')
                    }}
                  >
                    <img
                      src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/invoices.png`}
                      style={{ maxWidth: '48px' }}
                      className="mb-3"
                    />
                    <h5>Invoices</h5>
                    <div>Faster payments means better cash flow.</div>
                  </a>
                </Col>
                <Col md={4} className="d-flex">
                  <a
                    className="card card-body card-hover p-4 justify-content-start align-items-center"
                    onClick={() => {
                      this.props.history.push('/app/recurring')
                    }}
                  >
                    <img
                      src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/recuring.png`}
                      style={{ maxWidth: '48px' }}
                      className="mb-3"
                    />
                    <h5>Recurring Invoices</h5>
                    <div>Get paid automatically from repeat customers.</div>
                  </a>
                </Col>
                <Col md={4} className="d-flex">
                  <a
                    className="card card-body card-hover p-4 justify-content-start align-items-center"
                    onClick={() => {
                      this.props.history.push('/app/sales/checkouts')
                    }}
                  >
                    <img
                      src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/checkout.png`}
                      style={{ maxWidth: '48px' }}
                      className="mb-3"
                    />
                    <h5>Checkouts</h5>
                    <div>
                         from your website. No coding
                      required.
                    </div>
                  </a>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
        <div className="text-center w-75 mx-auto mt-4">
          <div>
            <img
              src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/payout.png`}
              className="mb-3"
              style={{ height: '70px', width: '70px' }}
            />
            <h5>Want to get your first payout even faster?</h5>
            <p className="w-75 mx-auto">
              You can verify your identity and tell us where to deposit your
              money even before receiving your first payment.</p>
          </div>
        </div>
        <div className='justify-content-center row'>
          <div className="col-md-10 text-center">
            {
              paymemntSettings.data.isOnboardingApplicable ?
                paymemntSettings.data.isOnboardingAllowed ?
                <TurnOnPayments isRedirect={true} /> : 
                  <InformationAlert varient="info">
                    { InfoIcon() }
                    <div className="alert-content">
                      <div className="alert-desc" >
                        To activate Payments by Finance, please contact customer support
                      </div>
                    </div>
                    <div className="alert-button ms-auto">
                      {
                        isHelpButtonDisable ? 
                          <UncontrolledTooltip 
                            placement="top" 
                            target="chat_with_us"
                          >
                            {customerSupportTooltipText(activeSubscription)}
                          </UncontrolledTooltip>
                        : null
                      }
                      <div id="chat_with_us">
                        <Button outline onClick={() => help()} disabled={isHelpButtonDisable}>
                          <span>Chat with Us</span>
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
                : <InformationAlert varient="danger">
                    { InfoIcon() }
                    <div className="alert-content">
                      <div className="alert-desc" >
                        Payments by Finance is not available in your country yet.
                      </div>
                    </div>
                  </InformationAlert>
            }
          </div>
        </div>

        <div class="row justify-content-center mt-5">
          <div class="col-lg-8">
            <div class="row">
              <div class="col-sm-12 mb-4">
                <div class="price-box-calc large-box">
                  <div class="title bg-pink">Domestic &amp; International <span>pass-fee enabled</span>
                  </div>
                  <div class="single-calc">
                    <div class="card-name text-muted"></div>
                    <h4 class="value text-pink">0%</h4>
                    <div class="card-name">Credit &amp; Debit Cards with <br />Chargeback Insurance <button type="button" class="info-ic" >
                        {/* <i class="fal fa-info-circle"></i> */}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-sm-12">
                <h2 class="text-divider">
                  <span>OR</span>
                </h2>
              </div>
            </div>
            <div class="row">
              <div class="col-sm-6 mt-4">
                <div class="price-box-calc" id="domestic">
                  <div class="title bg-success">Domestic <span>pass-fee disabled</span>
                  </div>
                  <div class="single-calc">
                    <div class="card-name text-muted"></div>
                    <h4 class="value text-success">{domesticFee?.[1]?.fee || domesticFee?.[0]?.fee}</h4>
                    <div class="card-name">
                      {domesticFee?.[1]?.title || domesticFee?.[0]?.title}
                      <button id="price-info" type="button" class="info-ic">
                        {/* <i class="fal fa-info-circle"></i> */}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-sm-6 mt-4">
                <div class="price-box-calc" id="internaional">
                  <div class="title bg-primary">International <span>pass-fee disabled</span>
                  </div>
                  <div class="single-calc">
                    <div class="card-name text-muted"></div>
                    <h4 class="value text-primary">{internationalFee?.[1]?.fee || internationalFee?.[0]?.fee}</h4>
                    <div class="card-name">
                      {internationalFee?.[1]?.title || internationalFee?.[0]?.title}
                      <button id="price-info" type="button" class="info-ic" >
                        {/* <i class="fal fa-info-circle"></i> */}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PaymentInit));
