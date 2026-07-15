import * as PaymentIcon from '../../global/PaymentIcon';
import { groupBy } from "lodash";
import React, { Component, Fragment } from 'react';
import {  getAmountToDisplay, _paymentMethodDisplay, toMoney } from "../../utils/GlobalFunctions";
import { ACCOUNT } from '../app/components/invoice/components/InvoicePayment';
import { _displayDate } from '../../utils/globalMomentDateFunc';

class TotalCalculation extends Component {
  render() {
    const { sign, data, payments, from } = this.props;
    const invoicePayments = payments && payments.length > 0 && payments || data.payments;
    let pMethods = groupBy(ACCOUNT, 'value');

    return (
        <div className="py-invoice-template__totals">
          <div className="py-space-blank">
          </div>
          <div className="py-invoice-template__totals-amounts">
            {
              data.amountBreakup.taxTotal.length > 0 &&  data.amountBreakup.taxTotal[0].rate > 0 ?
                <div className="py-invoice-template__row py-invoice-template__subtotal">
                  <div className="py-invoice-template__row-label"><strong className="py-text--strong">Subtotal:</strong></div>
                  <div className="py-invoice-template__row-amount"><span className="py-text py-text--body monospace">{getAmountToDisplay(data.currency, data.amountBreakup.subTotal)}</span></div>
                </div>
                : ""
            }
            <TaxCalculation
              invoiceItems={data.amountBreakup.taxTotal}
              sign={sign}
            />

            {/* start :: spacer */}
            
            {/* end :: spacer */}

            <div className="py-invoice-template__row py-invoice-template__total">
              <div className="py-invoice-template__row-label"><strong className="py-text--strong">Total:</strong></div>
              <div className="py-invoice-template__row-amount"><span className="py-text py-text--body monospace">{getAmountToDisplay(data.currency, data.totalAmount)}</span></div>
            </div>
            {/* <tr> */}
            {
              invoicePayments && invoicePayments.length > 0 ?
                invoicePayments.map((item, i) => {
                  return (
                    <div className="py-invoice-template__row py-invoice-template__history" key={`payment ${i}`}>
                      {
                        item.method === 'card'
                          ? <div className="py-invoice-template__row-label">Payment on {_displayDate(item.paymentDate, 'MMMM DD, YYYY')} using {!!!!item.card && !!item.card.type ? <img src={process.env.REACT_APP_WEB_URL.includes('localhost') ? `/${PaymentIcon[item.card.type]}` : `${PaymentIcon[item.card.type]}`} style={{ height: '24px', width: '38px', marginBottom: '5px' }} /> : ''} {!!item.card && !!item.card.number ? ` ending in ${item.card.number}:` : 'card'}</div>
                          : item.method === 'bank' ?
                            <div className="py-invoice-template__row-label">Payment on {_displayDate(item.paymentDate, 'MMMM DD, YYYY')} using <img src={process.env.REACT_APP_WEB_URL.includes('localhost') ? `/${PaymentIcon['bank']}` : `${PaymentIcon['bank']}`} style={{ height: '24px', width: '38px', marginBottom: '5px' }} />
                            (<span className="text-capitalization">{item.bank && item.bank.name}</span>{item.bank && !!item.bank.number ? ` ••• ${item.bank.number}` : ''}):</div>
                            : <div className="py-invoice-template__row-label">Payment
                          on {_displayDate(item.paymentDate, 'MMMM DD, YYYY')} {_paymentMethodDisplay(item.methodToDisplay)}:</div>
                      }
                      {/* <td className="py-invoice-template__row-label">Payment on {_displayDate(item.paymentDate, 'MMMM DD, YYYY')} using  {pMethods[item.methodToDisplay] && pMethods[item.methodToDisplay][0] && pMethods[item.methodToDisplay][0].label}:</td> */}
                      <div className="py-invoice-template__row-amount monospace">{item.type === 'refund' ? `(${getAmountToDisplay(sign, item.amount)})` : getAmountToDisplay(sign, item.amount)}</div>
                    </div>
                    // <div className="py-invoice-template__row py-invoice-template__history" key={i}>
                    //     <div className="py-invoice-template__row-label">
                    //     <span>Payment on {_displayDate(item.paymentDate, 'MMMM DD, YYYY')} using a {pMethods[item.methodToDisplay] && pMethods[item.methodToDisplay][0] && pMethods[item.methodToDisplay][0].label} :</span>
                    //     </div>
                    //     <div className="py-invoice-template__row-amount">
                    //     <span>{`${sign} ${toMoney(item.amount)}`}</span>
                    //     </div>
                    // </div>
                  )
                })
                : ""
            }
            {/* <RenderPaymentMethods invoiceData={data} sign={data.currency && data.currency.symbol} />
                        </tr> */}

            {/* spacer */}
            {data.shouldAskProcessingFee ? 
                <div>
                   <div className="py-divider-thin"></div>
                  <div className="classic-template__totals__amounts__line">
                    <div className="classic-template__totals__amounts__line__label">
                      <strong className="py-text py-text--body">Processing Fees:</strong>
                    </div>
                    <div className="classic-template__totals__amounts__line__amount">
                      <span className="py-text py-text--body monospace">
                        {getAmountToDisplay(data.currency, data.amountBreakup.fee)}
                      </span>
                    </div>
                  </div>
                </div> : ""}
           

            <div className="py-divider-thick">
            </div>

            {/* Amount due */}
            <div className="classic-template__totals__amounts__line">
              <div className="classic-template__totals__amounts__line__label">
                <strong className="py-text--strong">{`${from === 'estimate' ? 'Grand Total' : 'Amount Due'} (${data && data.currency ? data.currency.code : sign}):`} </strong>
              </div>
              <div className="classic-template__totals__amounts__line__amount word-break">
                <strong className="py-text--strong monospace">{
                  data ? getAmountToDisplay(data.currency, from === 'estimate' ? data.totalAmount : data.dueAmount || data.dueAmount) : ''
                }</strong>
              </div>
            </div>
          </div>
        </div>
    );
  }
}

const TaxCalculation = props => {
  return props.invoiceItems.length > 0
    ? props.invoiceItems.map((tax, index) => {
      if (tax.rate > 0) {
        return (
          <Fragment key={"taxtotal" + index}>
            <div className="py-invoice-template__row py-invoice-template__taxes">
              <div className="py-invoice-template__row-label">
                <span>{typeof (tax.taxName) === 'object' ?
                  `${tax.taxName.abbreviation} ${tax.rate}%${tax.taxName.other.showTaxNumber ? `(${tax.taxName.taxNumber}):` : ':'}`
                  : `${tax.taxName} ${tax.rate}%`
                }</span>
                {"  "}
              </div>
              <div className="py-invoice-template__row-amount monospace">
                <span>{`${getAmountToDisplay(props.sign, tax.amount)}`}</span>
              </div>
            </div>
            <div className="py-divider-thin">
            </div>
          </Fragment>
        );
      }
    })
    : "";
};

export default TotalCalculation;
