import React, { Component, Fragment } from 'react';
import RenderPaymentMethods from './RenderPaymentMethods';
import InvoiceTaxes from './InvoiceTaxes';

class InvoiceAmountPreview extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    let { invoiceData, getAmountToDisplay, showPayment, payments } = this.props;
    return (
      <section className="contemporary-template__totals">
        <div className="contemporary-template__totals-blank" />
        <div className="contemporary-template__totals-amounts">
          {invoiceData.amountBreakup.taxTotal.length > 0 &&
          invoiceData.amountBreakup.taxTotal[0].amount !== 0 ? (
            <Fragment>
              <div className="py-invoice-template__row py-invoice-template__history">
                <div className="py-invoice-template__row-label text-right">
                  <strong>Subtotal:</strong>
                </div>
                <div className="py-invoice-template__row-amount monospace">
                  <span>
                    {getAmountToDisplay(
                      invoiceData.currency,
                      invoiceData.amountBreakup.subTotal
                    )}
                  </span>
                </div>
              </div>
              <InvoiceTaxes
                invoiceItems={invoiceData.amountBreakup.taxTotal}
                invoiceData={invoiceData}
              />
              <div className="template-divider template-divider-small-margin" />
            </Fragment>
          ) : (
            ''
          )}
          <div className="py-invoice-template__row py-invoice-template__history total-amount">
            <div className="py-invoice-template__row-label text-right">
              <strong>Total:</strong>
            </div>
            <div className="py-invoice-template__row-amount monospace">
              <span>
                {getAmountToDisplay(
                  invoiceData.currency,
                  invoiceData.amountBreakup.total
                )}
              </span>
            </div>
          </div>
          {showPayment && (
            <RenderPaymentMethods
              invoiceData={invoiceData} 
              sign={
                invoiceData &&
                invoiceData.currency &&
                invoiceData.currency.symbol
              }
              payments={payments}
            />
          )}
          {invoiceData.shouldAskProcessingFee ? 
          <div>
          <div className="template-divider template-divider-small-margin" />
          <div className="py-invoice-template__row py-invoice-template__history total-amount">
            <div className="py-invoice-template__row-label text-right">
              <strong>Processing Fees:</strong>
            </div>
            <div className="py-invoice-template__row-amount monospace">
              <span>
                {getAmountToDisplay(
                  invoiceData.currency,
                  invoiceData.amountBreakup.fee
                )}
              </span>
            </div>
          </div>
          </div>
          :""}
          <div className="template-divider-bold template-divider-small-margin" />
          <div className="py-invoice-template__row py-invoice-template__history">
            <div className="py-invoice-template__row-label text-right">
              <span className="text-strong">
                <strong>
                  {showPayment
                    ? `Amount Due (${
                        invoiceData && invoiceData.currency
                          ? invoiceData.currency.code
                          : ''
                      }):`
                    : `Grand Total (${
                        invoiceData && invoiceData.currency
                          ? invoiceData.currency.code
                          : ''
                      }):`}
                </strong>
              </span>
            </div>
            <div className="py-invoice-template__row-amount text-strong monospace">
              <span>
                {invoiceData
                  ? getAmountToDisplay(
                      invoiceData.currency,
                      showPayment
                        ? invoiceData.dueAmount
                        : invoiceData.totalAmount
                    )
                  : ''}
              </span>
            </div>
          </div>
        </div>
      </section>
    )
  }
}





export default InvoiceAmountPreview
