import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { _displayDate, _getDiffDate } from '../../../../../../../utils/globalMomentDateFunc'
import * as PaymentIcon from '../../../../../../../global/PaymentIcon'
function index({ plan }) {
  return (
    <div className="upcoming-invoice-box">
      <div className="title">Upcoming Plan</div>
      <div className="footer-info">{plan.planId.title} plan will start on <span className="date" >
        {_getDiffDate(plan.upcomingActivationDate) == 0 ? 'today' : _displayDate(plan.upcomingActivationDate, 'MMMM DD, YYYY')}
      </span>
      </div>
      {/* Hide if Plan is starter*/}
      {plan.planLevel !== 1 ? <Fragment>
        <div className="footer-info mt-auto mb-2">using card ending with</div>
        <div className="d-flex justify-content-between ">
          <div className="card-dt">
            <span className="card-logo" ><img src={PaymentIcon[plan.card.brand]} alt={plan.card.brand} /></span>
            <span className="card-number monospace" >•••• {plan.card.cardNumber}</span>
          </div>
          <Link className="btn btn-primary" to={`/app/setting/update-card/${plan._id}`} >Update credit card</Link>
        </div>
      </Fragment> :
        null
      }
    </div>
  );
}

export default index;