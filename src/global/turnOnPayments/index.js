/* eslint-disable react/destructuring-assignment */
import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Spinner } from 'reactstrap';
import { get } from 'lodash';
import history from '../../customHistory';
import * as PaymentActions from '../../actions/paymentAction';
import { openGlobalSnackbar } from '../../actions/snackBarAction';
import { fetchPaymentSettings } from '../../actions/paymentSettings';
import { InfoIcon } from '../../utils/GlobalFunctions';
import InformationAlert from '../../global/InformationAlert'

const Index = (props) => {
  const [isLoading, setIsLoading] = useState(false)
  const { isOnboardingAllowed, isNonUsdCountry } = props.paymemntSettings.data;

  const urlParams = new URLSearchParams(window.location.search);
  const isNotOnBoarding = urlParams.get('onBoarding') === 'false';

  const handleTurnOnPayment = () => {
    if (!isOnboardingAllowed) {
      props.showSnackbar("Please contact customer support to enable this feature for your business", true)
      return
    }

    history.push("/app/payments/onboarding")
  }

  const turnOnPayment = async () => {
    try {
      setIsLoading(true)
      const res = await props.actions.turnOnPaymentsForBussiness();
      if (res.statusCode == 200) {
        // if (props.isRedirect){
        const { charges } = props.paymemntSettings.data;
        if (charges.expressSupported && charges.expressEnabled) {
          await props.actions.fetchKycUrl((res) => {
            setIsLoading(false)
            if (res.data && res.data.urlInfo && res.data.urlInfo.url) {
              window.open(res.data.urlInfo.url, '_blank')
            } else {
              props.showSnackbar(res.message ? res.message : "Something went wrong", true)
            }
          })
        } else {
          setIsLoading(false)
          history.push('/app/payments/onboarding')
        }
        //  }else{
        //    props.getPaymentSettings()
        //    props.showSnackbar("Payments turned on successfully", false)
        //  }

      }
    } catch (error) {
      setIsLoading(false)
      props.showSnackbar(error.message || "Something went wrong", true)
    }
  }

  const isOnboardingAllowedFlag = props.isOnboardingAllowed;
  return (
    <Fragment>
      { isOnboardingAllowedFlag ? (
        props.isText ? <a href="javascript:void(0)" disabled={isLoading} onClick={handleTurnOnPayment}><b>Activate Payments</b> {isLoading && (<Spinner size="sm" color="default" style={{ height: '20px', width: '20px', borderWidth: '2px' }} />)}</a>
        :
        <Button color="primary" disabled={isLoading} onClick={handleTurnOnPayment}>Activate Payments {isLoading && (<Spinner size="sm" color="default" />)}</Button>)
        : null
      }

      {
        isNotOnBoarding && isNonUsdCountry ?
          <div className="mt-4">
            <InformationAlert varient="info">
              { InfoIcon() }
              <div className="alert-content">
                  <div className="alert-desc" >
                    To enable payments on your account, contact customer support for assistance.
                  </div>
              </div>
            </InformationAlert>
          </div>
        : null
      }

    </Fragment>
  )
}

const mapStateToProps = (state) => {
  const { settings: { featureFlags } = {} } = state
  const isOnboardingAllowed =
    get(featureFlags, 'settings.isOnboardingAllowed', 'true') === 'true'
  return {
    paymemntSettings: state.paymentSettings,
    isOnboardingAllowed,
  }
}
const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators(PaymentActions, dispatch),
    showSnackbar: (message, error) => {
      dispatch(openGlobalSnackbar(message, error))
    },
    getPaymentSettings: body => {
      dispatch(fetchPaymentSettings(body))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Index)
