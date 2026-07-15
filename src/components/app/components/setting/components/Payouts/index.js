import React, { Component } from 'react'
import { Button, Alert, Spinner } from 'reactstrap';
import BankCard from '../../../Banking/components/Payouts/Components/bankCard';
import { connect } from 'react-redux'
import { openGlobalSnackbar } from '../../../../../../actions/snackBarAction';
import { bindActionCreators } from 'redux'
import { get as _get } from 'lodash';
import {
  addBodyToPayment, getOnboardingStatus
} from '../../../../../../actions/paymentAction';
import { saveBankAutoTransferSetting } from '../../../../../../api/SettingService';
import CenterSpinner from '../../../../../../global/CenterSpinner';
import PlaidWrapper from '../../../../../../global/PlaidWrapper';
import AccountList from '../../../../../../global/PlaidWrapper/accountList';
import ManualBank from '../../../../../../global/PlaidWrapper/ManualBank';
import history from '../../../../../../customHistory';
import { checkVerifiedEmail } from '../../../../../../constants';
import SelectBox from "../../../../../../utils/formWrapper/SelectBox";

const PayoutFrequencies = [
  {
    label: "Daily",
    value: "daily"
  },{
    label: "Weekly",
    value: "weekly"
  },{
    label: "Monthly",
    value: "monthly"
  }
]

class Payouts extends Component {
  state = {
    plaidAccounts: null,
    plaidLoading: false,
    isManual: false,
    isBankAutoTransfer: null,
    isBlueVisaDebitAutoTransfer: null,
    checkMode:null,
    CheckIsWalletCreated:null,
    isVerifiedEmail: true,
    payoutFrequency: {
      label: "Daily",
      value: "daily"
    },
    payoutFrequencyLoading: false
  }

  componentDidMount() {
    const { paymemntSettings: { data }, businessInfo } = this.props;
    if (data && data.isSetupDone && data.isVerified.payment && data.isOnboardingApplicable) {
      const { businessInfo } = this.props;
      const payoutSchedule = _get(data, "payoutSetting.stripeSchedule.interval", "")
      checkVerifiedEmail(this.handleIsVerifiedEmail)
      if(data.transferSetting){
          this.setState({ 
            checkMode:data.transferSetting.transferMode,
            CheckIsWalletCreated:data.isWalletCreated,
            payoutFrequency: PayoutFrequencies.find((frequency) => frequency.value === data?.transferSetting?.schedule?.interval) || {
              label: "Daily",
              value: "daily"
            }
          })
      }

      this.setState({ isBlueVisaDebitAutoTransfer: _get(data, "isDebitCardAutoTransfer", false) });
      document.title = businessInfo ? `Finance - ${businessInfo.organizationName} - Payout Settings` : "Finance - Payout Settings";
      this.props.fetchOnBoarding();
    } else {
      history.push('/app/payments')
    }
  }

  handleIsVerifiedEmail = (status) => {
    this.setState({
      isVerifiedEmail : status
    })
  }

  handlePlaidAccounts = (plaidAccounts) => {
    this.setState({ plaidAccounts })
  }

  handlePlaidLoading = (plaidLoading) => {
    this.setState({ plaidLoading })
  }

  onSubmit = async (bankAccountId) => {
    let data = {
      step: 4,
      bankAccountId,
      isUpdateManually: true,
    }
    this.addAcount(data)
  }

  bankDetails = (bankDetail) => {
    let data = {
      step: 4,
      manualBankAccount: bankDetail,
      isUpdateManually: true,
    }
    this.addAcount(data)

  }

  addAcount = async (data) => {
    try {
      const response = await this.props.patchOnboarding(data);
      this.props.showSnackbar(response.message, false);
      this.setState({ plaidAccounts: null, isManual: false }, () => {
        this.props.fetchOnBoarding();
      })
    } catch (error) {
      this.props.showSnackbar(error.message, true);
    }
  }

  handleCancel = () => {
    this.setState({ plaidAccounts: null, isManual: false })
  }

  handleBankAutoTransferSetting = (e) => {
        this.setState({
            checkMode: e.target.checked ? 'bank' : 'manual'
        }, async () => {
            const requestParams = { transferMode: this.state.checkMode ? this.state.checkMode : 'manual' };
            await saveBankAutoTransferSetting(requestParams)
                .then(async response => {
                    if (response.statusCode === 200) {
                        this.props.showSnackbar(response.message);
                    } else {
                        this.props.showSnackbar(response.message, true);
                    }
                })
                .catch(error => {
                    this.props.showSnackbar(error.message, true)
                })
        })
    }
  
  handleBlueVisaDebitAutoTransferSetting = (e) => {
    this.setState({
      checkMode: e.target.checked ? 'wallet' : 'manual'
    }, async () => {
      const requestParams = { transferMode: this.state.checkMode };
      await saveBankAutoTransferSetting(requestParams)
        .then(async response => {
          if (response.statusCode === 200) {
            this.props.showSnackbar(response.message);
          } else {
            this.props.showSnackbar(response.message, true);
          }
        })
        .catch(error => {
          this.props.showSnackbar(error.message, true)
        })
    })
  }

  handlePayoutFrequency = (event) => {
    this.setState({
      payoutFrequency: event,
      payoutFrequencyLoading: true
  }, async () => {
      const requestParams = { transferMode: 'bank', frequency: event?.value };
      await saveBankAutoTransferSetting(requestParams)
        .then(async response => {
          this.setState({ payoutFrequencyLoading: false });
          if (response.statusCode === 200) {
            this.props.showSnackbar(response.message);
          } else {
            this.props.showSnackbar(response.message, true);
          }
        })
        .catch(error => {
          this.setState({ payoutFrequencyLoading: false });
          this.props.showSnackbar(error.message, true)
        })
  })
  }

  render() {
    const { plaidLoading, plaidAccounts, isManual } = this.state;
    const { loading, onboardingBody, businessInfo, paymemntSettings: { data } } = this.props;
    const { bankAccount, country, payoutChangeRequestExist } = onboardingBody || {};
    return (
      <div className="py-page__content">
        <div className="py-page__inner receipt_settings">
          <header className="py-header--page flex">
            <div className="py-header--title">
              <h4 className="py-heading--title">Payouts</h4>
            </div>
          </header>
          <p className="py-text">This is the bank account that will receive your bank payouts.</p>
          {
            payoutChangeRequestExist
            ? <Alert color="primary" className="alertReciept alert-action alert-primary justify-content-start">
                <div className="alert-icon">
                  <svg
                    viewBox="0 0 20 20"
                    className="Icon__M me-2"
                    id="info"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10 19a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-2a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm0-11a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 3a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0v-4a1 1 0 0 1 1-1z"/>
                  </svg>
                </div>
                <div className="alert-content">
                  <div className="alert-desc">Your payout account change request is in progress</div>
                </div>
              </Alert>
            : null
          }
          <div className="py-box">
          {!country || plaidLoading ? <CenterSpinner/> :
              <div className='mb-4'>
                {
                  (plaidAccounts || isManual) ?
                    isManual ?
                        (<ManualBank country={country} loading={loading} bankDetails={this.bankDetails}
                                     onCancel={this.handleCancel}/>) :
                        (<AccountList loading={loading} onSubmit={this.onSubmit} onCancel={this.handleCancel}
                                      accounts={plaidAccounts}/>)
                    :
                      (<div className="row align-items-center">
                        <div className="col-12 col-md-5">
                          <BankCard card={{
                            routing: bankAccount ? bankAccount.routing || bankAccount.routingNumber : null,
                            endingIn: bankAccount ? bankAccount.mask || bankAccount?.accountNumber.substr(-4) : null,
                            instituteName: bankAccount ? bankAccount.bankName || bankAccount.name || bankAccount.nickName : null
                          }}/>
                          {/* {bankAccount && <p className="py-text  m-0 mt-3">Account: <span className='monospace'>******{bankAccount.mask}</span></p>}
                      {bankAccount && bankAccount.routing && <p className="py-text  m-0 mt-3">Routing: <span className='monospace'>{bankAccount.routing}</span></p>} */}
                        </div>
                        <div className="col-12 col-md-7 pt-4 pt-md-1">
                          {
                            _get(data, "onBoardingRules.isPayoutDetailChangeEnabled", false) ?
                            <>
                              {/* {country && country == 'US' ?
                                  <div className="card-table-row-title-section--actions mb-4 payout-update">
                                    <PlaidWrapper buttonText="Update using Plaid" className="w-100"
                                                  countryCodes={country ? country : 'US'}
                                                  getAccounts={this.handlePlaidAccounts}
                                                  onShowSnackbar={this.props.showSnackbar}
                                                  handleLoading={this.handlePlaidLoading}
                                    />
                                  </div> : null} */}
                              <Button onClick={() => this.setState({isManual: true})} className="w-100 px-3" color="primary"
                                      outline>Update manually</Button>
                            </>
                            : null
                          }
                          {
                            _get(this.props.businessInfo, "currency.code", "") === "USD" && _get(this.props.paymemntSettings, "data.platformPayoutStatus", "") === "active" ?
                                <div className='d-flex justify-content-between px-3 d-none'>
                                  <label className="py-switch text-center mt-4" for="bankAutoPay">
                                  <span
                                      className="py-toggle__label m-0 font-weight-medium">Bank auto-transfer</span><br/>
                                    <input
                                        id="bankAutoPay"
                                        type="checkbox"
                                        disabled={!this.state.isVerifiedEmail}
                                        className="py-toggle__checkbox"
                                        checked={this.state.checkMode === 'bank' ? true : false}
                                        onChange={(e) => this.handleBankAutoTransferSetting(e)}
                                    />
                                    <span className="py-toggle__handle onoff"></span>
                                  </label>
                                  <label className="py-switch text-center mt-4" for="BVDAutoPay">
                                    <span className="py-toggle__label m-0 font-weight-medium">Blue Visa Debit auto-transfer</span><br/>
                                    <input
                                        id="BVDAutoPay"
                                        type="checkbox"
                                        disabled={this.state.CheckIsWalletCreated == false ? true : false}
                                        className="py-toggle__checkbox"
                                        checked={this.state.checkMode === 'wallet' ? true : false}
                                        onChange={(e) => this.handleBlueVisaDebitAutoTransferSetting(e)}
                                    />
                                    <span className="py-toggle__handle onoff"></span>
                                  </label>
                                </div>
                                : null
                          }
                        </div>
                      </div>)
                }
              </div>
          }
          {
            _get(data, "onBoardingRules.isSetPayoutFrequencyEnabled", false) ?
              <div>
                <div className="row align-items-center">
                  <div className="col-12 col-md-5">
                    <BankCard from="Payout Frequency" card={{
                      routing: bankAccount ? bankAccount.routing : null,
                      endingIn: bankAccount ? bankAccount.mask : null,
                      instituteName: bankAccount ? bankAccount.bankName || bankAccount.name : null
                    }}/>
                  </div>
                  <div className="col-12 col-md-7 pt-4 pt-md-1">
                      <SelectBox
                        id='PayoutFrequency'
                        getOptionValue={(value)=>(value["value"])}
                        getOptionLabel={(value)=>(value["label"])}
                        placeholder="Select Payout Frequency"
                        value={this.state.payoutFrequency}
                        onChange={e => this.handlePayoutFrequency(e)}
                        options={PayoutFrequencies || []}
                        clearable={false}
                        disabled={this.state.payoutFrequencyLoading}
                      />
                      {
                        this.state.payoutFrequencyLoading ?
                          <Spinner size="sm" style={{height:"18px",width:"18px"}} color="default" />
                        : null
                      }
                  </div>
                </div>
              </div>
            : null
          }
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    onboardingBody: state.paymentReducer.onboardingBody,
    paymemntSettings: state.paymentSettings,
    loading: state.paymentReducer.loading,
    businessInfo: state.businessReducer.selectedBusiness,
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

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Payouts);