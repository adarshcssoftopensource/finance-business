import React, { Component } from 'react';
import * as PaymentIcon from '../../../../../global/PaymentIcon'
import {
  getAmountToDisplay,
  _showPaymentText,
  _showExchangeRate,
  _showAmount,
  _calculateExchangeRate,
  _downloadPDF,
  _paymentMethodDisplay
} from '../../../../../utils/GlobalFunctions'
import { _displayDate } from '../../../../../utils/globalMomentDateFunc';

export default class RenderPaymentMethods extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    let {
      invoiceData, sign, payments
    } = this.props;
    let payment = payments && payments.length > 0
      ? payments.map((item, i) => {
        return (
          <div
            className="py-invoice-template__row py-invoice-template__history"
            key={i}
          >
            <div className="py-invoice-template__row-label">
              {item.method === 'card' ? (
                <span>
                  {item.type === 'refund' ? 'Refunded' : 'Payment'} on {_displayDate(item.paymentDate, 'MMMM DD, YYYY')} using&nbsp;
                  {
                    !!item.card && !!item.card.type ? (
                      <img
                        src={
                          process.env.REACT_APP_WEB_URL.includes('localhost')
                            ? `/${PaymentIcon[item.card.type]}`
                            : `${PaymentIcon[item.card.type]}`
                        }
                        style={{
                          height: '24px',
                          width: '38px',
                          marginBottom: '5px'
                        }}
                      />
                    ) : ''
                  }
                  {!!item.card && !!item.card.number ? ` ending in ${item.card.number}:` : 'card'}
                </span>
              ) : item.method === 'bank' ? (
                <span>
                  {item.type === 'refund' ? 'Refunded' : 'Payment'} on {_displayDate(item.paymentDate, 'MMMM DD, YYYY')} using&nbsp;
                  <img
                    src={
                      process.env.REACT_APP_WEB_URL.includes('localhost')
                        ? `/${PaymentIcon['bank']}`
                        : `${PaymentIcon['bank']}`
                    }
                    style={{
                      height: '24px',
                      width: '38px',
                      marginBottom: '5px'
                    }}
                  />&nbsp;
                    (<span className="text-capitalization">{item.bank && item.bank.name}</span>
                  {!!item.bank && !!item.bank.number ? ` ••• ${item.bank.number}` : ''}):
                </span>
              ) : (
                    <span>
                      {item.type === 'refund' ? 'Refunded' : 'Payment'} on {_displayDate(item.paymentDate, 'MMMM DD, YYYY')}
                      {_paymentMethodDisplay(item.methodToDisplay)}:
                    </span>
                  )}
            </div>
            <div className="py-invoice-template__row-amount monospace">
              <span>
                {/* {item.type === 'refund'
                  ? `(${getAmountToDisplay(
                    invoiceData.currency,
                    item.amount
                  )})`
                  : `${getAmountToDisplay(invoiceData.currency, item.amount)}`} */}
                {getAmountToDisplay(invoiceData.currency, item.amount)}
              </span>
            </div>
          </div>
        )
      })
      : '';

    return (<div>
      {payment}
    </div>)
  }
}

