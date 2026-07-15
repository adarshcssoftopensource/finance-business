import React, { useEffect, useRef } from 'react';
import { connect, useDispatch } from 'react-redux';
import { get } from 'lodash';
import NotFound from './components/404';
import NoPermission from './components/401';
import InternalServerError from './components/500';
import { DashboardRoute } from './components/app/components/dashboard/DashboardRoute';
import { InvoiceRoutes } from './components/app/components/invoice/InvoiceRoutes';
import { PeymeRoutes } from './components/app/components/Peyme/PeymeRoutes';
import { CrowdFundingRoutes } from './components/app/components/CrowdFunding/CrowdFundingRoutes';
import { DebitCardRoutes } from './components/app/components/DebitCard/DebitCardRoutes';
import { AdvisorsRoutes } from './components/app/components/Advisors/AdvisorsRoutes';
import { RewardRoutes } from './components/app/components/Reward/RewardRoutes';
import ReportsRoutes from './components/app/components/Reports/ReportRoutes';
import LaunchpadRoutes from './components/app/components/Launchpad/routes';
import PaymentRoutes from './components/app/components/payments/PaymentRoutes';
import { SalesRoute } from './components/app/components/sales/SalesRoute';
import SettingRoutes from './components/app/components/setting/SettingRoutes';
import ForgotPassword from './components/forgotPassword';
import Login from './components/login/loginForm';
import ResetPassword from './components/resetPassword';
// import SignUp from './components/joinWaitList'
import SignUp from './components/signUp/signUpForm';
import EmailVerification from './components/signUp/notifyEmailVerification';
import ChooseSubscripton from './components/chooseSubscription';

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

import 'react-datepicker/dist/react-datepicker.css';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';
import './style/app.scss';
import { BusinessRoutes } from './components/app/components/BusinessInfo/BusinessRoutes';
import { EstimateRoute } from './components/app/components/Estimates/EstimateRoute';
import InvoiceCustomerView
  from './components/app/components/invoice/components/InvoiceCustomerView';
import MailPreview from './components/app/components/invoice/components/InvoiceForm/MailPreview';
import ReceiptPreview
  from './components/app/components/invoice/components/InvoiceForm/ReceiptPreview';
import PublicPayout from './components/app/components/invoice/components/Payout';
import CloseUserAccount from './components/app/components/profile/components/CloseUserAccount';
import { ProfileRoutes } from './components/app/components/profile/ProfileRoutes';
import { PurchaseRoute } from './components/app/components/purchase/PurchaseRoutes';
import { RecurringRoutes } from './components/app/components/RecurringInvoice/RecurringRoutes';

import StatementPreview
  from './components/app/components/sales/components/CustomerStatements/StatementPreview';
import Onboarding from './components/onboarding';
import ThankYou from './components/thankyou';
import NeedToTalk from './components/needToTalk';
import ReminderPreview from './components/openPages/ReminderPreview';

import './react-select.css';
import { Terms } from './global/Terms';
import { Policy } from './global/Policy';
import { Security } from './global/Security';

import { ComingSoonRoutes } from './components/app/components/ComingSoon/ComingSoonRoutes';
import { BankingRoutes } from './components/app/components/Banking/BankingRoutes';

import Verify from './components/openPages/Verify';
import PlaidOAuthReturn from './components/plaidOAuthReturn';
import { PaymentPlusRoutes } from './components/app/components/PaymentPlus/paymentPlusRoutes';
import GoogleAuthentication
  from './components/app/components/profile/components/GoogleAuthentication';
import { UpgradeSubscriptionRoute } from './components/app/components/upgradeSubscription/upgradeSubscriptionRoute';
import { PaymentOnBoardingRoutes } from './components/app/components/PaymentOnBoarding/OnBoardingRoutes';
import VerificationRoutes from './components/app/components/veriff/VerificationRoutes';
import RemoveCard from './components/removeCard/RemoveCard';
import BasicAuthModal from './components/401/BasicAuthModal';
import { requestFeatureFlags } from './actions/featureFlagsAction';
import { PayAsBankRoutes } from './components/app/components/PayAsBank/PayAsBankRoutes';
import { BuyNowPayLaterRoutes } from './components/app/components/BuyNowPayLater/BuyNowPayLater';
// import { callRefresh } from './utils/GlobalFunctions';
// import moment from 'moment';

const Main = (props) => {
  document.title = 'Finance';
  const dispatch = useDispatch();
  const flagFetchInterval = useRef();
  useEffect(() => {
    const Userback = window.Userback || {};
    if (Userback) {
      Userback.on_load = function () {
        Userback.hide()
      };
      Userback.on_close = function () {
        Userback.hide()
      };
    }
  }, [window.Userback])

  useEffect(() => {
    redirectUrl();
    const intervalTime = parseInt(process.env.REACT_APP_FEATURE_FLAG_SETTING_FETCH_INTERVAL) * 60000;
    dispatch(requestFeatureFlags());
    flagFetchInterval.current = setInterval(() => {
      try {
        dispatch(requestFeatureFlags());
      } catch (error) {
        console.error({ error });
        clearInterval(flagFetchInterval.current);
      }
    }, intervalTime);
    return () => {
      // clearInterval(flagFetchInterval.current);
    };
  }, []);

  const redirectUrl = () => {
    if(props.location.pathname.includes("/public/invoice")) {
      const pathArray = props.location.pathname.split('/')
      const itemId = pathArray[pathArray.length - 1]
      window.location.href = `${process.env.REACT_APP_PUBLIC_BASE_URL}/invoice/${itemId}`
    }
    if(props.location.pathname.includes("/public/checkout")) {
      const pathArray = props.location.pathname.split('/')
      const itemId = pathArray[pathArray.length - 1]
      window.location.href = `${process.env.REACT_APP_PUBLIC_BASE_URL}/checkout/${itemId}`
    }
    if(props.location.pathname.includes("/public/estimate")) {
      const pathArray = props.location.pathname.split('/')
      const itemId = pathArray[pathArray.length - 1]
      window.location.href = `${process.env.REACT_APP_PUBLIC_BASE_URL}/estimate/${itemId}`
    }
  }

  let basicAuthModel = false
  // if (process.env.REACT_APP_MY_ENVIRONMENT === 'development') {
  //   basicAuthModel = !localStorage.getItem('basicAuthToken')
  // }

  // Put all Feature Flag Constants together here if you want to disable complete route
  const isVeriffEnabled = props.isVeriffEnabled
  const isReportsEnabled = props.isReportsEnabled
  const isDebitCardEnabled = props.isDebitCardEnabled
  const isRewardEnabled = props.isRewardEnabled
  const isPayAsBankEnabled = props.isPayAsBankEnabled
  return <Switch>
     {basicAuthModel ? <BasicAuthModal isOpen={basicAuthModel} /> : null}
    <Redirect from="/" exact to="/app/dashboard" />
    <Redirect from="/app" exact to="/app/dashboard" />
    <Route exact path="/signin" component={Login} />
    <Route exact path="/signin/:redirect" component={Login} />
    <Route exact path="/subscription" component={ChooseSubscripton} />
    <Route exact path="/remove-card" component={RemoveCard} />
    <Route exact path="/password/reset/confirm/:token" component={ResetPassword} />
    <Route exact path='/email-verification' component={EmailVerification} />
    <Route path='/signup' component={SignUp} />
    <Route path='/forgotyourpassword' component={ForgotPassword} />
    <Route path='/reset-password' component={ResetPassword} />
    <Route path='/onboarding' component={Onboarding} />
    <Route path='/thankyou' component={ThankYou} />
    <Route path='/need-to-talk' component={NeedToTalk} />
    <Route path='/closeaccount' component={CloseUserAccount} />
    <Route path='/verify' component={Verify} />
    <Route exact path='/plaid/oauth' component={PlaidOAuthReturn} />
    {/* <Route path='/email/add/done/:email' component={ConfirmEmail} /> */}
    <Route
      path='/app/accounts/'
      render={({ match: { url, params } }) => (
        ProfileRoutes(url, params)
      )}
    />

    <Route
      path="/app/dashboard/"
      render={({ match: { url } }) => (
        DashboardRoute(url)
      )}
    />

    {isVeriffEnabled &&
      <Route
        path="/app/verification/"
        render={({ match: { url } }) => (
          VerificationRoutes(url)
        )}
      />
    }

    <Route
      path="/app/subscription/"
      render={({ match: { url } }) => (
        UpgradeSubscriptionRoute(url)
      )}
    />

    {/* <Route path='/business' component={AddBusiness} /> */}

    <Route
      path="/app/sales/"
      render={({ match: { url } }) => (
        SalesRoute(url)
      )}
    />

    <Route exact path="/app/statements/preview/:uuid" component={StatementPreview} />
    <Route exact path="/public/payout/:uuid" component={PublicPayout} />
    <Route exact path="/public/statements/preview/:uuid" component={StatementPreview} />
    <Route exact path="/public/userInvite" component={Verify} />

    <Route
      path="/app/setting/"
      render={({ match: { url } }) => (
        <SettingRoutes url={url} />
      )}
    />

    <Route
      path="/app/estimates/"
      render={({ match: { url } }) => (
        EstimateRoute(url)
      )}
    />

    <Route
      path="/app/invoices"
      render={({ match: { url } }) => (
        InvoiceRoutes(url)
      )}
    />

    <Route
      path="/app/payments"
      render={({ match: { url } }) => (
          <PaymentRoutes url={url}/>
      )}
    />

    <Route
      path="/app/recurring"
      render={({ match: { url } }) => (
        RecurringRoutes(url)
      )}
    />


    <Route
      path="/business/"
      render={({ match: { url } }) => (
        BusinessRoutes(url)
      )}
    />

    <Route
      path="/app/banking/"
      render={({ match: { url } }) => (
        BankingRoutes(url)
      )}
    />

    <Route
      path="/app/payyitme"
      render={({ match: { url } }) => (
        PeymeRoutes(url)
      )}
    />
    <Route
      path="/app/give"
      render={({ match: { url } }) => (
        CrowdFundingRoutes(url)
      )}
    />
    <Route
      path="/app/advisors"
      render={({ match: { url } }) => (
        AdvisorsRoutes(url)
      )}
    />
    {isRewardEnabled &&
      <Route
        path="/app/reward"
        render={({ match: { url } }) => (
          RewardRoutes(url)
        )}
      />
    }
    {isReportsEnabled &&
      <Route
        path="/app/reports"
        render={({ match: { url } }) => (
          <ReportsRoutes url={url} />
        )}
      />
    }
    {isDebitCardEnabled &&
      <Route
        path="/app/debitcard"
        render={({ match: { url } }) => (
          DebitCardRoutes(url)
        )}
      />
    }
    <Route
      path="/app/coming-soon/"
      render={({ match: { url } }) => (
        ComingSoonRoutes(url)
      )}
    />


    <Route
      path="/app/purchase/"
      render={({ match: { url } }) => (
        PurchaseRoute(url)
      )}
    />
    <Route
      path="/app/paymentPlus/"
      render={({ match: { url } }) => (
        PaymentPlusRoutes(url)
      )}
    />
    <Route
      path="/app/launchpad/"
      render={({ match: { url } }) => (
        <LaunchpadRoutes url={url} />
      )}
    />

  <Route
      path="/app/finix-payment-onboarding"
      render={({ match: { url } }) => (
        PaymentOnBoardingRoutes(url)
      )}
    />

    {isPayAsBankEnabled && (
      <Route
        path="/app/pay-by-bank/"
        render={({ match: { url } }) => (
          PayAsBankRoutes(url)
        )}
      />
    )}

    <Route
      path="/app/pay-by-financing/"
      render={({ match: { url } }) => (
        BuyNowPayLaterRoutes(url)
      )}
    />

    <Route exact path="/app/email-connected/google" component={GoogleAuthentication} />
    <Route exact path="/terms" component={Terms} />
    <Route exact path="/policy" component={Policy} />
    <Route exact path="/security" component={Security} />
    <Route exact path="/invoices-preview/:id" component={ReminderPreview} />
    <Route exact path="/invoices/readonly/:id" component={InvoiceCustomerView} />
    <Route exact path="/invoice/:id/public/reciept-view/readonly/:receiptId" component={ReceiptPreview} />
    <Route exact path="/invoices/:id/receipt-preview/:receiptId" component={ReceiptPreview} />
    <Route exact path="/invoices/:id/mail-preview" component={MailPreview} />
    <Route exact path="/recurring/:id/mail-preview" component={ReminderPreview} />
    <Route exact path="/estimate/:id/mail-preview" component={MailPreview} />
    <Route exact path="/peyme/:id/public/reciept-view/readonly/:receiptId" component={ReceiptPreview} />
    <Route exact path="/peyme/:id/receipt-preview/:receiptId" component={ReceiptPreview} />
    <Route exact path="/checkout/:id/public/reciept-view/readonly/:receiptId" component={ReceiptPreview} />
    <Route exact path="/checkout/:id/receipt-preview/:receiptId" component={ReceiptPreview} />
    <Route exact path="/funding/:id/public/reciept-view/readonly/:receiptId" component={ReceiptPreview} />
    <Route exact path="/funding/:id/receipt-preview/:receiptId" component={ReceiptPreview} />
    <Route exact path="/app/error/500" component={InternalServerError} />
    <Route exact path="/app/no-permission" component={NoPermission} />
    <Route exact path="/token-expire" component={NoPermission} />
    <Route component={NotFound} />

  </Switch>
};

const mapStateToProps = ({ settings: { featureFlags } = {} }) => {
  const isVeriffEnabled = get(featureFlags, 'settings.veriff', 'true') === 'true'
  const isMinimumOneReportEnabled = Object.values(
    get(featureFlags, 'reports', {})
  ).includes('true')
  const isReportsEnabled = (get(featureFlags, 'reports.enabled',"true") === "true")  && isMinimumOneReportEnabled;
  const isDebitCardEnabled = get(featureFlags, 'debitCard.enable',"true") === "true";
  const isRewardEnabled = get(featureFlags, 'reward.view',"true") === "true";
  const isPayAsBankEnabled = get(featureFlags, 'payAsBank.enabled', 'true') === 'true';
  
  return {
    isVeriffEnabled,
    isReportsEnabled,
    isDebitCardEnabled,
    isRewardEnabled,
    isPayAsBankEnabled,
  }
}

export default withRouter(connect(mapStateToProps)(Main))
