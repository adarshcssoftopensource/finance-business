import React, { PureComponent } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

//Redux and APi 
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import { openGlobalSnackbar } from '../../../../../../actions/snackBarAction'
import {
    addBodyToPayment,
    getOnboardingStatus,
    skipStepOnboarding,
    updateStatusStepThree
} from '../../../../../../actions/paymentAction';
import {
    getBusinessMcc
} from '../../../../../../actions/utilityAction';
import { fetchPaymentSettings } from '../../../../../../actions/paymentSettings';
import CenterSpinner from '../../../../../../global/CenterSpinner';
import history from '../../../../../../customHistory'
// import child component
import Stepper from './Stepper';
import StepForm from './stepForm';

class index extends PureComponent {
    state = {
        statesOptions: [],
        activeStep: 0,
        isReadOnly: false,
        isOnload: true
    }
    // Component Init Call
    componentDidMount() {
        const { data } = this.props.paymemntSettings;
        if (!data.isVerified.payment && !data.isSetupDone && data.isConnected && data.isOnboardingApplicable) {
            this.checkStage();
        } else {
            history.push('/app/payments')
        }
    }

    checkStage = async () => {
        try {
            this.setState({isReadOnly:false})
            await this.props.fetchOnBoarding();
        } catch (error) { }
    }

    onSubmit = async (data) => {
        this.setState({ isOnload: false });
        try {
            if (data == "skip") {
                await this.props.skipStep();
            } else if (data == "step3") {
                await this.props.updateStepThree();
            } else {
                await this.props.patchOnboarding(data);
            }
            this.setState({ activeStep: this.state.activeStep + 1 });
        } catch (error) {
            throw Error(error.message)
        }
    }

    onShowSnackbar = message => {
        this.props.showSnackbar(message, true)
    }

    handleSteps = (activeStep) => {
        const { step } = this.props.onboardingBody;
        if (activeStep <= step) {
            this.setState({ activeStep, isOnload: false })
        }
    }

    componentDidUpdate(prevProps) {
        if (this.state.isOnload) {
            const { step } = this.props.onboardingBody;
            if (step == 'NA') {
                this.setState({ activeStep: 0, isReadOnly:false });
            } else {
                this.setState({
                    activeStep: parseInt(step),
                    isReadOnly: parseInt(step) >= 3 ? true : false
                });
            }
        } else if (this.props.onboardingBody.step >= 3) {
            const { step } = this.props.onboardingBody;
            this.setState({
                isReadOnly: parseInt(step) >= 3 ? true : false
            })
        } else {
            return true
        }
    }

    render() {
        const { activeStep, isReadOnly } = this.state;
        const { onboardingBody } = this.props;

        return (
            <div id="Onboarding" className="content-wrapper__main">
                <div className="container">
                    <div className="row mx-n2">
                        <div className="col-md-3 px-2">
                            <Stepper
                                activeStep={activeStep}
                                handleSteps={this.handleSteps}
                            />
                        </div>
                        <div className="col-md-9 px-2">
                            <div className="content">
                                <div className="payment__onboarding__container">
                                    <div className="payment__onboarding__content text-center">
                                        {onboardingBody && onboardingBody.step ?
                                            <StepForm
                                                handleSteps={this.handleSteps}
                                                activeStep={activeStep}
                                                data={onboardingBody}
                                                onSubmit={this.onSubmit}
                                                isReadOnly={isReadOnly}
                                                {...this.props}
                                                onShowSnackbar={this.onShowSnackbar}
                                            /> : <CenterSpinner />}
                                    </div>
                                </div>
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
        onboardingBody: state.paymentReducer.onboardingBody,
        selectedBusiness: state.businessReducer.selectedBusiness,
        loading: state.paymentReducer.loading,
        paymemntSettings: state.paymentSettings,
        userData: state.userData,
        getAllMCC: state.getAllMCC,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        patchOnboarding: bindActionCreators(addBodyToPayment, dispatch),
        fetchOnBoarding: () => {
            dispatch(getOnboardingStatus())
        },
        showSnackbar: (message, error) => {
            dispatch(openGlobalSnackbar(message, error))
        },
        getOnboardingStatus: body => {
            dispatch(fetchPaymentSettings(body))
        },
        getBusinessMcc: body => {
            dispatch(getBusinessMcc())
        },
        skipStep: body => {
            dispatch(skipStepOnboarding())
        },
        updateStepThree: body => {
            dispatch(updateStatusStepThree())
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(index);