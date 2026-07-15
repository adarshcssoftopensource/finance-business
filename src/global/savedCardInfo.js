import React, { useState } from 'react';
import { Tooltip } from 'reactstrap';
const SavedCardInfo = (props) => {
 const [tooltipOpen, setTooltipOpen] = useState(false);
 const toggle = () => setTooltipOpen(!tooltipOpen);
 return (
  <div className="alert-action alert-info mb-4">
   <div className="alert-content">
    <div className="alert-desc" >If you’re using Saved Payment Methods to charge your customers manually, you’ll pay a slightly higher fee per transaction than usual when a stored card is used to pay an invoice.<a className="tip--icon ms-2" href="javascript:void(0)" id="cardInfoMsg"><i className="fal fa-info-circle"></i></a>
    </div>
    <Tooltip placement="bottom" isOpen={tooltipOpen} style={{ width: "550px", maxWidth: "550px", padding: "15px" }} target="cardInfoMsg" toggle={toggle}>The higher fee for transactions using Saved Payment Methods will be an additional 0.5% per transaction. The higher fee is due to a greater security risk involved with these payments, as the cardholder did not physically process the payment. These transactions are automatically protected by our Chargeback Insurance, protecting your business from fraud disputes.</Tooltip>
   </div>
  </div>
 );
}
export default SavedCardInfo;