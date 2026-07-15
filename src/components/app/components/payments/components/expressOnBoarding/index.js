import React, { PureComponent } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

//Redux and APi 
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import { openGlobalSnackbar } from '../../../../../../actions/snackBarAction'
import {
    addBodyToPayment,
    getOnboardingStatus,
    skipStepOnboarding
} from '../../../../../../actions/paymentAction';
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
        isOnload: true,
        isUpdated: false
    }
    // Component Init Call
    async componentDidMount() {
        await this.props.getPaymentSettings();
    }

    componentDidUpdate() {
        if (!this.state.isUpdated) {
            const { data } = this.props.paymemntSettings;
            if (!data.isSetupDone && data.isConnected && data.isOnboardingApplicable) {
                this.setState({
                    activeStep: data.isVerified.payment ? 1 : 0
                })
                this.checkStage();
            } else {
                history.push('/app/payments')
            }
            this.setState({ isUpdated: true })
        }
    }

    checkStage = async () => {
        try {
            await this.props.fetchOnBoarding();
        } catch (error) { }
    }

    onSubmit = async (data) => {
        this.setState({ isOnload: false });
        try {
            if (data == "skip") {
                await this.props.skipStep();
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
        skipStep: body => {
            dispatch(skipStepOnboarding())
        },
        getPaymentSettings: body => {
            dispatch(fetchPaymentSettings(body))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(index);