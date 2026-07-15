import React from 'react';
import { Button } from 'reactstrap';
import { _displayDate } from '../../../../../utils/globalMomentDateFunc';

const RecurringStep5 = props =>{
  const { approveRecurringInvoice, invoiceData, isViwer} = props
    return (
        <div className="py-box py-box--large is-highlighted">
          <div className="recurring-invoice-view-activate-section">
            <div className="recurring-invoice-view-activate-section__box__title pt-2 pb-2">
              <div className="py-heading--title">You're almost set! </div>
            </div>
            <div className="recurring-invoice-view-activate-section__box__subtitle pt-2 pb-2">
              <div className="py-heading--subtitle">
                Review the details of your recurring invoice above and approve it when you're ready.
              </div>
            </div>
            <div className="pt-2 pb-4">
              <strong className="py-text--strong">{`Once approved, your first invoice will be created ${_displayDate(invoiceData.recurrence.startDate, "MMMM DD, YYYY")}.`}</strong>
            </div>
  {!isViwer && <div className="recurring-invoice-view-activate-section__start-button">
              <Button type="button" onClick={e=>approveRecurringInvoice('approve')} color="primary" >Approve and start recurring invoice</Button>
            </div>}
          </div>
        </div>
    )
}

export default RecurringStep5;