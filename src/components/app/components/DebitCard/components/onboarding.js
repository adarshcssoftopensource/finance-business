import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Container } from 'reactstrap'
import {get} from "lodash"
import history from '../../../../../../src/customHistory'
import debitCardService from '../../../../../api/DebitCardServices'
import { openGlobalSnackbar } from '../../../../../actions/snackBarAction'
import { debitCardOnboarding } from './constant'
import CenterSpinner from '../../../../../global/CenterSpinner'

class OnBoarding extends Component {

    state = {
        debitCardOnboarding: debitCardOnboarding(),
        isOnBoardingApplicable: false,
        isLoading: false,
        debitCardCreationStatus: ""
    }

    componentDidMount() {
        this.isValidCountry()
    }

    isValidCountry = async () => {
        await debitCardService.checkPaymentOnBoarding()
        .then(res => {
            if (res.statusCode === 200) {
                const paymentSetting = res.data.paymentSetting
                if (paymentSetting.isOnboardingApplicable) {
                    this.setState({
                        isOnBoardingApplicable: true,
                    })
                }
                this.setState({ debitCardCreationStatus: paymentSetting.debitCardCreationStatus });
            }
        })
        .catch(err => {
            this.props.showSnackbar(err.message, true)
        })
    }


    debitCardOnBoarding = async (e) => {
        e.preventDefault();
        const {isCreateWalletEnabled} = this.props
        try {
            await debitCardService.checkPaymentOnBoarding()
            .then(async res => {
                if (res.statusCode === 200) {
                    const paymentSetting = res.data.paymentSetting
                    if (paymentSetting.isSetupDone) {
                        this.setState({ isLoading: true });
                        const payload = {
                            "cardType": "virtual"
                        }
                        const isFirstTime = true;
                        if (isCreateWalletEnabled) {
                            await debitCardService.generateDebitCardWallet(payload, isFirstTime)
                            .then(async res => {
                                this.setState({ isLoading: false });
                                if (res.statusCode === 200) {
                                    await debitCardService.updatePaymentSetting(this.state.debitCardOnboarding)
                                    this.props.showSnackbar(res.message, false)
                                    history.push(`/app/debitcard`)
                                } else {
                                    this.props.showSnackbar(res.message, true)
                                }
                            })
                            .catch(err => {
                                this.setState({ isLoading: false });
                                this.props.showSnackbar(err.message, true)
                            })
                        }
                    } else {
                        history.push(`/app/payments`)
                        this.props.showSnackbar("Please complete activation of payments on your account", true)
                    }
                } else {
                    this.props.showSnackbar(res.message, true)
                }
            })
            .catch(err => {
                this.props.showSnackbar(err.message, true)
            })
        } catch (error) {
            this.props.showSnackbar(error.error.raw.message, true)
        }
    }

    render() {
        return (
            <div className="debitcard_wrapper">
                { this.state.isLoading ?
                    <Container className="mrT50 text-center">
                        <CenterSpinner />
                    </Container> :
                    <div className="content-wrapper__main">
                        <main>
                            <div class="row align-items-center">
                                <div class="col-8"><figure className='debit-preview-image'><div className='overlaytext'>Preview</div><img src="../../../../../assets/images/debit-card/blue-debit-card-page.png" class="img-fluid" alt="" /></figure></div>
                            </div>
                            <div className='d-flex align-items-center flex-column'>
                                {
                                    this.state.debitCardCreationStatus === 'active' ?
                                        <div>
                                            {
                                                this.state.isOnBoardingApplicable ?
                                                <button type="button" class="btn btn-primary mb-3" onClick={this.debitCardOnBoarding}>Create my Blue Visa Debit</button>
                                                : <button type="button" class="btn btn-primary mb-3" disabled>Country not supported</button>
                                            }
                                        </div>
                                    : <button type="button" class="btn btn-primary mb-3" disabled>Create Blue Visa Debit disabled for this business</button>
                                }
                                <a href={`${process.env.REACT_APP_ROOT_URL}/debit-card`}  target={`_blank`} className='btn btn-link'>What is the Finance Blue Visa Debit?</a>
                                <div class="debit-card-footer text-center"><span class="py-text py-text--hint mb-0 px-4">The Finance Blue Visa Debit with next business day payouts and discounted instant payouts is exclusively available for Pro users.</span></div>
                            </div>
                        </main>
                    </div>
                }
            </div>
        )
    }
}

const mapStateProps = ({ settings: { featureFlags } = {} }) => {
  const isCreateWalletEnabled =
    get(featureFlags, 'debitCard.createWallet', 'true') === 'true'
  return {
    isCreateWalletEnabled,
  }
}

const mapDispatchToProps = dispatch => {
    return {
        showSnackbar: (message, error) => {
            dispatch(openGlobalSnackbar(message, error));
        }
    };
};

export default connect(mapStateProps, mapDispatchToProps)(OnBoarding)
