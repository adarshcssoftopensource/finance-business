import React, { Component } from "react";
import {
  fetchPayPalOnBoardingUrl, getAvailableProviders, setSelectedProvider
} from "../../../../../actions/paymentAction";
import { connect } from "react-redux";
import _ from "lodash";
import { bindActionCreators } from "redux";
import CenterSpinner from "../../../../../global/CenterSpinner";
import { Button } from "reactstrap";
import history from "../../../../../customHistory";
import Main_Logo from "../../../../../assets/logo/finance-logo.png"

class PayPalOnBoardingScreens extends Component {
  state = {};

  componentDidMount() {
    const {
      actions,
      paymentSettings
    } = this.props;
    if (paymentSettings.isVerified.payment && paymentSettings.isSetupDone && paymentSettings.isConnected) {
      history.push("/app/payments");
    }
    actions.fetchPayPalOnBoardingUrl();
  }

  componentDidUpdate(prevProps, prevState) {
    const { payPalSignUpPayload: prevPayPalSignUpPayload } = prevProps;
    const { payPalSignUpPayload } = this.props;
    if (!_.isEqual(payPalSignUpPayload, prevPayPalSignUpPayload)) {
      if (payPalSignUpPayload?.paypalSignUplink && !payPalSignUpPayload.alreadyInitiated) {
        window.open(payPalSignUpPayload.paypalSignUplink, "_blank");
      }
    }
  }

  render() {
    const {
      payPalSignUpPayload,
      isLoading,
      error,
      paymentSettings
    } = this.props;

    if (isLoading) {
      return (<CenterSpinner />);
    }
    if (error) {
      return (
        <div
          className="content-wrapper__main__fixed text-center vh-100 d-flex align-items-center">
          <div className="py-status-page">
            <div className="py-box">
              <div className="py-box--content">
                <h1 className="py-heading--title mb-4">This service is not available at the moment.
                  Please try again after some time.</h1>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div>
        <div
          className="content-wrapper__main__fixed text-center vh-100 d-flex align-items-center">
          <div className="py-status-page">
            <div className="py-box">
              <div className="py-box--content">
                <div className="provider-icon" style={{
                  width: "50%",
                  margin: "0 auto"
                }}>
                  <img src={`${Main_Logo}`}
                       alt="paypal" />
                </div>
                <h1 className="py-heading--title mb-4">
                  {paymentSettings.onboardingStatus === "awaiting_approval" || paymentSettings.onboardingStatus === "blocked" ? <>You
                      currently cannot receive payments due to restrictions on your PayPal account.
                      Please reach out to PayPal Customer Support or visit <a
                        href="https://www.paypal.com" target={"_blank"}>https://www.paypal.com</a> for more
                      information.</>
                    : paymentSettings.onboardingStatus === "need_verification" && paymentSettings.isRevoked ? <>Connection
                        of Finance with PayPal has been revoked. Please connect it again</>
                      : !paymentSettings?.isVerified?.payment && payPalSignUpPayload?.merchantId ? "Your application to connect your PayPal account to Finance has been received.\n" +
                        "Check your email to complete the activation for Payments by Finance with PayPal." : payPalSignUpPayload?.alreadyInitiated ? "Your application for Payments by Finance with PayPal is not complete.\n" +
                        "Would you like to get started?" : `You are being redirected to PayPal to complete onboarding for Payments by Finance with PayPal.`}
                  {paymentSettings.onboardingStatus !== "blocked" && paymentSettings.onboardingStatus !== "awaiting_approval" ? <>
                    <br />Please refresh the
                    page after you have completed the onboarding.</> : ""}
                </h1>
                {(!(!paymentSettings?.isVerified?.payment && payPalSignUpPayload?.merchantId) || paymentSettings.onboardingStatus === "need_verification") && !!payPalSignUpPayload && (paymentSettings.onboardingStatus !== "awaiting_approval" && paymentSettings.onboardingStatus !== "blocked") ?
                  <Button type="button" color="primary" data-paypal-button="true"
                          onClick={() => {
                            window.open(`${payPalSignUpPayload.paypalSignUplink}&displayMode=minibrowser`, "_blank");
                          }}>Connect with PayPal</Button> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    payPalSignUpPayload: state.paymentReducer.payPalSignUpPayload,
    isLoading: state.paymentReducer.onBoardingSchemaLoading,
    error: state.paymentReducer.error,
    legalDetails: state.businessReducer?.legalDetails?.business,
    paymentSettings: state.paymentSettings?.data
  };
};

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({
      fetchPayPalOnBoardingUrl
    }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PayPalOnBoardingScreens);
