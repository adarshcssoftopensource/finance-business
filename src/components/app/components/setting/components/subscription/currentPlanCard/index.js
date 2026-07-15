import React from 'react';
import { Link } from 'react-router-dom';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { _getDiffDate } from '../../../../../../../utils/globalMomentDateFunc';

function CurrentPlanCard({ plan, isSubscriptionCreateAllowed: propsIsSubscriptionCreateAllowed, isSubscriptionUpdateAllowed: propsIsSubscriptionUpdateAllowed }) {
  const isBasicPlan = plan?.planLevel === 1;
  const isSubscriptionCreateAllowed = propsIsSubscriptionCreateAllowed && isBasicPlan;
  const isSubscriptionUpdateAllowed = propsIsSubscriptionUpdateAllowed && !isBasicPlan;
  const isModifyPlanAllowed = isSubscriptionCreateAllowed || isSubscriptionUpdateAllowed;
  return (
    <div className="current-plan-box">
      <div className="plan-box-header" >
        <div className="card-badge pull-right"><img src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/subscription/current-plan-badge.png`} alt="Plan Badge" /></div>
        <div className="title">Your Current Plan</div>
        <div className="price"><span className='monospace'>${plan?.planId?.price}</span><small>/ {plan?.planId?.recurring}</small></div>
        <div className="plan-name">{plan?.planId?.title}</div>
      </div>
      <div className="plan-box-footer mt-auto pt-2" >
        {plan ?
          <>
            {isModifyPlanAllowed && <Link className="bttn-white" to="/app/setting/subscription-plans" >Modify plan</Link>}
            {plan.trial?.isTrial && <div className="footer-info pull-right"><strong>Trial</strong> ends {_getDiffDate(plan.trial.endDate) == 0 ? 'today' : `in ${_getDiffDate(plan.trial.endDate)} day(s)`} </div>}
            {plan.endDate && !plan.trial?.isTrial && <div className="footer-info pull-right"><strong>Plan</strong> ends {_getDiffDate(plan.endDate) == 0 ? 'today' : `in ${_getDiffDate(plan.endDate)} day(s)`} </div>}
          </>
          :
          <>
            <Link className="bttn-white" to="/app/setting/subscription-plans" >Modify plan</Link>
          </>
        }
      </div>
    </div>
  );
}

const mapStateToProps = ({ settings: { featureFlags } = {} }) => {
  const isSubscriptionCreateAllowed = get(featureFlags, 'subscriptions.create', 'true') === 'true';
  const isSubscriptionUpdateAllowed = get(featureFlags, 'subscriptions.update', 'true') === 'true';
  return {
    isSubscriptionCreateAllowed,
    isSubscriptionUpdateAllowed
  }
}

export default connect(mapStateToProps)(CurrentPlanCard);
