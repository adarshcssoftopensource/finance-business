
import React from 'react';
import { Route } from 'react-router-dom';
import Layout from './Layout';
import { requireAuth } from '../../index';
import { connect } from 'react-redux';
import history from '../../customHistory'
import RestrictedRoutes from '../../constants/planRestrictedAccount.json'

const MainRoute = ({ 'component': Component, params, ...rest }) => {

  // Route Restriction based on Subscription Plan
  const planRouteRestricted = () => {
    // Static demo mode: never blank subscribed-only modules
    if (process.env.REACT_APP_MY_ENVIRONMENT === 'development') {
      return true
    }

    const { selectedBusiness } = rest.state.businessReducer
    const activeSubscription = rest.state.subscriptionReducer?.activeSubscription;
    const planTitle = activeSubscription?.current?.planId?.title;
    const allowedPlans = ['Premium Ambassador', 'Premium Enterprise', 'premium-ambassador', 'premium-enterprise'];

    if (planTitle && allowedPlans.includes(planTitle)) {
      return true;
    }

    // Check Businesses if they are created before subscription plans implementation
    if (selectedBusiness && (!selectedBusiness.subscription || !selectedBusiness.subscription.isSubscribed)) {
      // Subscribed flag may live on business root in demo/static mode
      if (selectedBusiness.isSubscribed) {
        return true
      }
      const getRestrictedRoutes = RestrictedRoutes['Starter'].restrictedRoutes
      const pathParts = rest?.location?.pathname.split('/');
      const baseRoute = `/${pathParts[1]}/${pathParts[2]}`;
      if (getRestrictedRoutes.includes(baseRoute)) {
        redirectToUpgrade()
      }
      return !getRestrictedRoutes.includes(baseRoute)
    } else {
      return true
    }
  }

  const redirectToUpgrade = () => {
    history.push('/app/subscription/upgrade')
  }

  return (
    <Route {...rest} render={
       // Check if logged In
      requireAuth(rest.state, rest.path) ?
        // Check if routes module allowed in Subscription plan
        planRouteRestricted() ?
          matchProps => (
            <Layout reducer={rest.state}>
              <Component {...matchProps} params={params} url={rest.url} />
            </Layout>
          )
          : ''
        : ''
    } />
  );
};

const mapStateToProps = state => {
  return {
    'state': state
  };
};

export default connect(mapStateToProps, null)(MainRoute);
