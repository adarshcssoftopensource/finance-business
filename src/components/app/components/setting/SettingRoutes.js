import React from 'react'
import { Switch, Redirect } from 'react-router-dom'
import { get } from 'lodash';
import { connect } from 'react-redux';

import MainRoute from '../../../../components/app/MainRoute'
import InvoiceCustomization from './components/InvoiceCustomization'
import Receipts from './components/Receipts'
import Payments from './components/Payments';
import UserManagement from './components/UserManagement'
import Payouts from './components/Payouts'
import SubscriptionPlans from './components/subscriptionPlans'
import SubscriptionUpdate from './components/subscriptionUpdate'
import Subscription from './components/subscription'
import UpdateCard from './components/updateCard'
import Documents from '../documents'
import EmailSenderSettings from './components/Emails';

function SettingRoutes({ url, isSubscriptionCreateAllowed:propsIsSubscriptionCreateAllowed, isSubscriptionUpdateAllowed:propsIsSubscriptionUpdateAllowed }) {
  const currentPlanLevel = JSON.parse(
    localStorage.getItem('currentPlan')
  )?.planLevel
  const isSubscriptionCreateAllowed =
    propsIsSubscriptionCreateAllowed && currentPlanLevel === 1
  const isSubscriptionUpdateAllowed =
    propsIsSubscriptionUpdateAllowed && currentPlanLevel > 1
  const isModifyPlanAllowed =
    isSubscriptionCreateAllowed || isSubscriptionUpdateAllowed
  return (
    <Switch>
      <Redirect from="/app/setting" exact to="/app/setting/user-management" />
      <MainRoute exact path={`${url}/receipts`} component={Receipts} />
      <MainRoute exact path={`${url}/payouts`} component={Payouts} />
      <MainRoute
        exact
        path={`${url}/user-management`}
        component={UserManagement}
      />
      <MainRoute
        exact
        path={`${url}/invoice-customization`}
        component={InvoiceCustomization}
      />
      <MainRoute exact path={`${url}/payments`} component={Payments} />
      {isModifyPlanAllowed && (
        <MainRoute
          exact
          path={`${url}/subscription-plans`}
          component={SubscriptionPlans}
        />
      )}
      {isModifyPlanAllowed && (
        <MainRoute
          exact
          path={`${url}/subscription-update/:planId`}
          component={SubscriptionUpdate}
        />
      )}
      <MainRoute
        exact
        path={`${url}/subscription-history`}
        component={Subscription}
      />
      <MainRoute
        exact
        path={`${url}/update-card/:subscriptionId`}
        component={UpdateCard}
      />
      <MainRoute
        exact
        path={`${url}/verification-center`}
        component={Documents}
      />
       <MainRoute
        exact
        path={`${url}/emails`}
        component={EmailSenderSettings}
      />
    </Switch>
  )
}

const mapStateToProps = ({ settings: { featureFlags } = {} }) => {
  const isSubscriptionCreateAllowed = get(featureFlags, 'subscriptions.create', 'true') === 'true';
  const isSubscriptionUpdateAllowed = get(featureFlags, 'subscriptions.update', 'true') === 'true';
  return {
    isSubscriptionCreateAllowed,
    isSubscriptionUpdateAllowed
  }
}

export default connect(mapStateToProps)(SettingRoutes)
