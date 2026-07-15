import React, { Component } from 'react';
import {
  getAmountToDisplay,
  _paymentMethodDisplay,
} from '../../../../../utils/GlobalFunctions'
import { _displayDate, _addDate } from '../../../../../utils/globalMomentDateFunc';

class InvoiceInfoComponent extends Component {
  constructor(props) {
    super(props);
  }

  calculateRecurringDueDate=()=>{
    const { estimateKeys } = this.props
    if (estimateKeys.notifyStatus.key ==='on'){
      return _displayDate( estimateKeys.nextInvoiceDate, 'MMMM DD, YYYY')
    }else {
      return _displayDate(_addDate(estimateKeys.nextInvoiceDate, estimateKeys.notifyStatus.key ), 'MMMM DD, YYYY')
    }
  }

  render() {
    const { estimateKeys, showPayment } = this.props
    return (
      <div className="invoice-template-details">
        <table className="table py-table--plain">
          <tbody>
            <tr>
              <td>
                <strong className="text-strong">
                  {estimateKeys.invoiceNumber || window.location.pathname.includes('/app/recurring') ? 'Invoice' : 'Estimate'} Number:
                    </strong>
              </td>
              <td>
                {window.location.pathname.includes('/app/recurring') ? (
                  'Auto-generated'
                ) : (
                    <span>
                      {estimateKeys
                        ? estimateKeys.invoiceNumber
                          ? estimateKeys.invoiceNumber
                          : estimateKeys.estimateNumber
                        : 0}
                    </span>
                  )}
              </td>
            </tr>
            {/* <tr>
                  <td>
                    <strong className="text-strong">P.O./S.O. Number :</strong>
                  </td>
                  <td>
                    <span>{estimateKeys ? estimateKeys.invoiceNumber : 0}</span>
                  </td>
                </tr> */}
            {estimateKeys && estimateKeys.purchaseOrder && (
              <tr>
                <td>
                  <strong className="text-strong">P.O./S.O. Number:</strong>
                </td>
                <td>
                  <span>{estimateKeys ? estimateKeys.purchaseOrder : 0}</span>
                </td>
              </tr>
            )}
            <tr>
              <td>
                <strong className="text-strong">
                  {showPayment || !!estimateKeys.invoiceDate ? 'Invoice' : 'Estimate'} Date:
                    </strong>
              </td>
              <td>
                {estimateKeys &&
                  !estimateKeys.invoiceDate &&
                  !estimateKeys.estimateDate ? (
                    estimateKeys.nextInvoiceDate ? <span>
                      {_displayDate(
                        estimateKeys.nextInvoiceDate, 'MMMM DD, YYYY'
                      )}
                    </span>: 'Auto-generated'
                  ) : (
                    <span>
                      {_displayDate(
                        estimateKeys.invoiceDate || estimateKeys.estimateDate, 'MMMM DD, YYYY'
                      )}
                    </span>
                  )}
              </td>
            </tr>
            <tr>
              <td>
                <strong className="text-strong">
                  {showPayment || !!estimateKeys.dueDate ? 'Payment Due' : 'Expires On'}:
                    </strong>
              </td>
              <td>
                {((estimateKeys &&
                  !estimateKeys.dueDate &&
                  !estimateKeys.expiryDate) || window.location.pathname.includes('/app/recurring/view')) ? (
                    estimateKeys.nextInvoiceDate ? <span>
                      {this.calculateRecurringDueDate()}
                    </span> : 'Auto-generated'
                  ) : (
                    <span>
                      {_displayDate(
                        estimateKeys.dueDate || estimateKeys.expiryDate, 'MMMM DD, YYYY'
                      )}
                    </span>
                  )}
              </td>
            </tr>
            {this.props.from !== 'modern' && (
              <tr>
                <td className="table-cell-first">
                  <span className="text-strong">
                    <strong>
                      {showPayment || !!estimateKeys.invoiceDate
                        ? `Amount Due (${
                        estimateKeys && estimateKeys.currency
                          ? estimateKeys.currency.code
                          : ''
                        }):`
                        : `Grand Total (${
                        estimateKeys && estimateKeys.currency
                          ? estimateKeys.currency.code
                          : ''
                        }):`}
                    </strong>
                  </span>
                </td>
                <td className="table-cell-second monospace">
                  <span className="text-strong">
                    {estimateKeys
                      ? getAmountToDisplay(
                        estimateKeys.currency,
                        showPayment
                          ? estimateKeys.dueAmount
                          : estimateKeys.totalAmount
                      )
                      : ''}
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }
}

export default InvoiceInfoComponent;