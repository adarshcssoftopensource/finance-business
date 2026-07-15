import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, UncontrolledTooltip } from 'reactstrap';
import history from '../../../../customHistory';
import { getAvailableProviders, setSelectedProvider } from '../../../../actions/paymentAction';
import PayPalOnBoardingScreens from './PayPalOnBoarding';
import PaymentOnBoardingForm from './PaymentOnBoardingForm';
import CenterSpinner from '../../../../global/CenterSpinner';
import { InfoIcon } from '../../../../utils/GlobalFunctions';
import InformationAlert from '../../../../global/InformationAlert';
import Logo from "../../../../assets/logo/finance-logo.png"
class PaymentOnBoarding extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedProvider: "",
    };
  }

  componentDidMount() {
    const {
      actions,
      selectedBusiness: {_id}
    } = this.props;

    actions.getAvailableProviders(_id);
  }

  selectPaymentOptions = (value) => {
    this.setState({
      ...this.state,
      selectedPaymentMethod: value
    });
  };

  selectProvider = (providerName) => {
    this.setState({
      ...this.state,
      selectedProvider: providerName
    });
  };

  saveSelectedPayment = () => {
    const { actions, selectedBusiness: {_id} } = this.props;
    const { selectedProvider } = this.state;
    actions.setSelectedProvider({
      provider: selectedProvider,
      businessId: _id
    });
  };

  getProviderCard = (provider) => {
    const { selectedProvider } = this.state;
    const {
      providerName,
      paymentsBy,
      poweredBy,
      logoPath,
      recommended,
      recommendedToolTip,
      footerText,
      footerTextToolTip,
      isComingSoon,
      isChargebackInsurance,
      chargebackInsuranceToolTip,
      phase,
      integratesWith,
    } = provider;


    const urlParams = new URLSearchParams(this.props.location.search);
    const isBeta = urlParams.get('beta') === 'true';

    return (
      <div className="col-md-4 mt-5">
        <div
          className={`provider-box ${isComingSoon && !isBeta ? "provider-coming-soon" : selectedProvider === providerName ? "selected-provider" : ""}`}
          onClick={() => {
            if (isComingSoon && !isBeta) return ;
            this.selectProvider(providerName);
          }}
        >
          {(!!phase?.trim() || isComingSoon) &&
          <span
            className="coming-soon-badge"
          >
              {!!phase?.trim() ? phase : (isComingSoon ? 'Coming soon' : '')}
            </span>
          }

          {isChargebackInsurance &&
            <span
              className="coming-soon-badge"
              id={`${providerName}-chargeback-insurance`}
            >
              Chargeback Insurance&nbsp;&nbsp;<i className="fas fa-info-circle" />
            </span>
          }
          {isChargebackInsurance && chargebackInsuranceToolTip ?
            <UncontrolledTooltip placement="top" target={`${providerName}-chargeback-insurance`}>
              {chargebackInsuranceToolTip}
            </UncontrolledTooltip> : null}

          <div className="provider-icon">
            <img  src={Logo} width={100} height={100}
                 alt={providerName} />
          </div>
          <h3 className="title">{'Payments by Finance'}</h3>
          {/* <p>{poweredBy}</p> */}
          <div className="recomended-badge mb-4">{recommended} {recommendedToolTip ?
            <i className="fas fa-info-circle"
               id={`${providerName}-recommended-info`} /> : null} </div>
          {recommendedToolTip ?
            <UncontrolledTooltip placement="top" target={`${providerName}-recommended-info`}>
              {recommendedToolTip}
            </UncontrolledTooltip> : null}
          <p style={{ 'height': '87px' }}>{footerText} {footerTextToolTip ?
            <i className="fas fa-info-circle text-primary"
               id={`${providerName}-tip`} /> : null}</p>
          {footerTextToolTip ?
            <UncontrolledTooltip placement="top"
                                 target={`${providerName}-tip`}
                                 style={{ minWidth: "500px" }}>{footerTextToolTip}</UncontrolledTooltip> : null}
          {
            integratesWith ?
              <div className="integrates-with-badge mb-4">
                {integratesWith}
              </div>
            : null
          }
        </div>
      </div>
    );
  };

  getCurrentPaymentComponent = () => {
    const {
      availableProvider,
      selectedProvider: propSelectedProvider
    } = this.props;
    const { selectedProvider } = this.state;

    const sortedAvailableProvider = availableProvider?.sort((a, b) => (a?.displayOrder ?? 0) - (b?.displayOrder ?? 0));

    if (this.props.paymemntSettings?.data?.isNonUsdCountry) {
      history.push("/app/payments?onBoarding=false")
    }

    if (!propSelectedProvider?.providerName && (!sortedAvailableProvider || !sortedAvailableProvider?.length)) {
      return (
        <InformationAlert varient="danger">
          { InfoIcon() }
          <div className="alert-content">
              <div className="alert-desc" >
                Payments by Finance is not available in your country yet, but contact customer support to request early access.
              </div>
          </div>
        </InformationAlert>
      )
    }

    return (
      <>
        {!propSelectedProvider?.providerName ? <div className="onboarding-form-wrapper mb-5">
          <div className="form-group field field-object undefined root">
            <label className="label">How would you like to get paid?</label>
            <div className="row">
              <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <fieldset id="root">
                  <legend id="root__title">How would you like to get paid?</legend>
                  <div
                    className="form-group field field-string undefined root_businesstype businesstype">
                    <div className="row g-4 justify-content-center">
                      {sortedAvailableProvider?.map((value) => {
                        return this.getProviderCard(value);
                      })}
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>
          </div>
          <div className="text-center mt-4" style={{ fontWeight: "bold" }}>As a Premium user, earn
            points for travel, cash
            back, & crypto when you collect payments with Finance.
          </div>
          <div className="text-center mt-4">
            <Button type="button" color="primary" disabled={!selectedProvider?.trim()}
                    onClick={this.saveSelectedPayment}>
              Save and continue
            </Button>
          </div>
        </div> : (
          propSelectedProvider?.isCustomSchema ?
            <PaymentOnBoardingForm /> : <PayPalOnBoardingScreens />
        )
        }
      </>
    );
  };

  render() {
    const { isLoading } = this.props;
    return (
      <div id="Onboarding" className="content-wrapper__main">
        <div className="container">
          <div className="row mx-n2">
            {isLoading ?
              <CenterSpinner /> : this.getCurrentPaymentComponent()}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    isLoading: state.paymentReducer.loading,
    availableProvider: state.paymentReducer.availableProvider,
    selectedBusiness: state.businessReducer.selectedBusiness,
    selectedProvider: state.paymentReducer.selectedProvider,
    legalDetails: state.businessReducer?.legalDetails?.business,
    paymemntSettings: state.paymentSettings,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({
      getAvailableProviders,
      setSelectedProvider
    }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PaymentOnBoarding);
