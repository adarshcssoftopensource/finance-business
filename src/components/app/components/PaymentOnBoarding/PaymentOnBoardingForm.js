import { Component } from "react";
import Stepper from "./onBoarding/Stepper";
import OnBoarding from "./onBoarding";
import React from "react";
import { connect } from "react-redux";
import bindActionCreators from "react-redux/es/utils/bindActionCreators";
import {
  addBodyToPayment,
  fetchPayPalOnBoardingUrl,
  getOnboardingStatus, skipStepOnboarding, updateStatusStepThree
} from "../../../../actions/paymentAction";
import { openGlobalSnackbar } from "../../../../actions/snackBarAction";
import { fetchPaymentSettings } from "../../../../actions/paymentSettings";
import { getBusinessMcc } from "../../../../actions/utilityAction";
import PaymentService from "../../../../api/paymentService";
import history from '../../../../customHistory'
import { Alert } from "reactstrap";

class PaymentOnBoardingForm extends Component {
constructor(props) {
  super(props);
  this.state = {
    activeStep: 0,
    isReadOnly: false,
    isOnload: true,
    onBoardingData: {},
    stepperData: [],
    newOwnerflag: false,
    formData: {},
    additionaFieldData: [],
    visitedStep: [],
    currentStep: "",
    onboardingStatus: "",
    remarks: "",
  }
}

  async componentDidMount() {
    const { data } = this.props.paymemntSettings;
    if (data.onboardingStatus === "rejected") {
      this.checkStage();
    } else {
      if (!data.isVerified.payment && !data.isSetupDone && data.isConnected) {
        this.checkStage();
      } else {
        history.push("/app/payments");
      }
    }
    this.setState(prevState => ({
      ...prevState,
      visitedStep: [...prevState.visitedStep, 1]
    }));
    this.setState({
      onboardingStatus: data.onboardingStatus,
      currentStep: 1
    });

    const onBoardingStepData = await PaymentService.fetchPaymentOnboardingSteps(1);

    if (onBoardingStepData.data) {
      this.setState({
        onBoardingData: onBoardingStepData.data.stepSchema,
        formData: onBoardingStepData.data.formData,
        stepperData: onBoardingStepData.data.metaData.titleNew || onBoardingStepData.data.metaData.title
      });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.onboardingBody !== this.props.onboardingBody) {
      this.setState({
        remarks: this.props.onboardingBody.remarks || ""
      });
    }
  }

  checkStage = async () => {
    try {
      this.setState({ isReadOnly: false });
      await this.props.fetchOnBoarding();
    } catch (error) {
    }
  };

  onShowSnackbar = message => {
    this.props.showSnackbar(message, true);
  };

  disablestep = () => {
    history.push("/app/payments/");
    window.location.reload(true);
    this.setState({
      visitedStep: []
    });
  };

  handleSteps = async (activeStep) => {
    this.setState({
      currentStep: activeStep + 1
    });
    const onBoardingStepData = await PaymentService.fetchPaymentOnboardingSteps(activeStep + 1);
    if (!(this.state.visitedStep.includes(activeStep + 1))) {
      this.setState(prevState => ({
        visitedStep: [...prevState.visitedStep, activeStep + 1]
      }));
    }
    if (this.state.visitedStep.includes(activeStep + 1)) {
      this.setState({
        formData: onBoardingStepData.data.formData
      });
    }

    if (onBoardingStepData && onBoardingStepData.data) {
      this.setState({
        onBoardingData: onBoardingStepData.data.stepSchema,
        stepperData: onBoardingStepData.data.metaData.titleNew || onBoardingStepData.data.metaData.title
      });
    }
    this.setState({
      activeStep,
      isOnload: false
    });
  };

  render() {
    const { activeStep, isReadOnly } = this.state;
    return (
      <>
        {this.state.onboardingStatus === "rejected" && this.state.remarks !== "" ? (
          <div className="d-flex text-center mb-5">
            <Alert color="danger"
                   className="alertReciept alert-action alert-danger justify-content-start">
              <div className="alert-icon">
                <svg
                  viewBox="0 0 20 20"
                  className="Icon__M me-2"
                  id="info"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 19a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-2a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm0-11a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 3a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0v-4a1 1 0 0 1 1-1z" />
                </svg>
              </div>
              <div className="alert-content">
                <div className="alert-desc">{this.state.remarks}</div>
              </div>
            </Alert>
          </div>
        ) : ""}
        <div className="col-md-3 px-2">
          <Stepper
            activeStep={activeStep}
            handleSteps={this.handleSteps}
            stepperData={this.state.stepperData}
            visitedStep={this.state.visitedStep}
            currentStep={this.state.currentStep}
          />
        </div>
        <div className="col-md-9 px-2">
          <div className="content">
            <div className="payment__onboarding__container">
              <div className="payment__onboarding__content text-center">
                <OnBoarding
                  handleSteps={this.handleSteps}
                  activeStep={activeStep}
                  formData={this.state.formData}
                  isReadOnly={isReadOnly}
                  stepperData={this.state.stepperData}
                  additionaFieldData={this.state.additionaFieldData}
                  onShowSnackbar={this.onShowSnackbar}
                  onBoardingData={this.state.onBoardingData}
                  checkStage={this.props.getPaymentSettings}
                  newOwnerflag={this.state.newOwnerflag}
                  disablestep={this.disablestep}
                  {...this.props} />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    onboardingBody: state.paymentReducer.onboardingBody,
    selectedBusiness: state.businessReducer.selectedBusiness,
    loading: state.paymentReducer.loading,
    paymemntSettings: state.paymentSettings,
    getAllMCC: state.getAllMCC,
    payPalSignUpPayload: state.paymentReducer.payPalSignUpPayload,
    isLoading: state.paymentReducer.loading,
    availableProvider: state.paymentReducer.availableProvider,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    patchOnboarding: bindActionCreators(addBodyToPayment, dispatch),
    fetchOnBoarding: () => {
      dispatch(getOnboardingStatus());
    },
    fetchPaypalOnBoarding: () => {
      dispatch(fetchPayPalOnBoardingUrl());
    },
    showSnackbar: (message, error) => {
      dispatch(openGlobalSnackbar(message, error));
    },
    getPaymentSettings: body => {
      dispatch(fetchPaymentSettings(body));
    },
    getBusinessMcc: body => {
      dispatch(getBusinessMcc());
    },
    skipStep: body => {
      dispatch(skipStepOnboarding());
    },
    updateStepThree: body => {
      dispatch(updateStatusStepThree());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PaymentOnBoardingForm);
