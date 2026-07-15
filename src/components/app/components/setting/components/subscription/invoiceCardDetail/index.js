import React from 'react';
import { Link } from 'react-router-dom';
import { _displayDate} from '../../../../../../../utils/globalMomentDateFunc'
import * as PaymentIcon from '../../../../../../../global/PaymentIcon'
function index({ plan }) {
 return (
    <div className="upcoming-invoice-box">
         <div className="title">Upcoming Invoice</div>
         {plan.nextInvoiceDate && 
         <>
             <div className="footer-info">Invoice will be generated on <span className="date">{_displayDate(plan.nextInvoiceDate, 'MMMM DD, YYYY')}</span>
             </div>
         </>
         }
         <div className="footer-info mt-auto">using card ending with</div>
        <div className="d-flex justify-content-between ">
            <div className="card-dt">
                 <span className="card-logo" ><img src={PaymentIcon[plan.card.brand]} alt={plan.card.brand} /></span>
                 <span className="card-number" >•••• {plan.card.cardNumber}</span>
            </div>
            <Link className="btn btn-primary" to={`/app/setting/update-card/${plan._id}`} >Update credit card</Link>
        </div>
    </div>
 );
}

export default index;