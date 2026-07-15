import React from 'react';
import { Link } from "react-router-dom";
import { useSelector } from 'react-redux';
import BrowserTabTitle from '../../../../global/browserTabTitle'

const Index = () => {
  const activeSubscription = useSelector(state => state.subscriptionReducer.activeSubscription);
  return (
    <div className="subscribe-upgrade-page">
      <BrowserTabTitle title="Upgrade Subscription" />
      <div className="content-wrapper__main__fixed" >
        <div className="upgrade-plan-content col-9">
          <h2 className="title" >Uh oh, we have a problem</h2>
          <div className="desc">
            <p>You are currently subscribed to the {activeSubscription?.current?.planId?.title || 'Starter'} plan. <br /> Unfortunately, this feature is not available in the {activeSubscription?.current?.planId?.title || 'Starter'} plan. <br /> Please upgrade your subscription to access this feature.</p>
            <p>Would you like to upgrade your account?</p>
          </div>
          <Link to="/app/setting/subscription-plans" className="btn btn-primary" >Yes, let’s upgrade now</Link>
        </div>
      </div>
    </div>
  );
}

export default Index;