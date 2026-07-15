import React from 'react';
import { getAmountToDisplay } from '../../../../../../../utils/GlobalFunctions';
function TotalAmount({ data }) {
 return (
  <React.Fragment>
   {data.available.map((blnc, idx) => (
    <div className="row mx-n2" key={idx}>
     <div className="col-6 px-2">
      <div className="card shadow-sm" >
        <div className="card-body">
          <p className="text-muted">Available Balance</p>
          <h5 className="card-title">{getAmountToDisplay(blnc.currency, blnc.amount)}</h5>
        </div>
      </div>
     </div>
     <div className="col-6 px-2">
      <div className="card shadow-sm" >
        <div className="card-body">
          <p className="text-muted">Pending Balance</p>
          <h5 className="card-title">{getAmountToDisplay(data.pending[idx].currency, data.pending[idx].amount)}</h5>
        </div>
      </div>
     </div>
    </div>
   ))}
  </React.Fragment>
 );
}

export default TotalAmount;