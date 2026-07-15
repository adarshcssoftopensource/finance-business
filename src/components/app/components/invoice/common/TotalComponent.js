import React, { Component, Fragment } from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import SelectBox from '../../../../../utils/formWrapper/SelectBox'

class TotalComponent extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let {
      getAmountToDisplay,
      invoiceInput,
      businessInfo,
      showExchange,
      currencies,
      grandTotal,
      shouldAskProcessingFee,
      toggleGrandTotal,
      handleCurrency,
      type
    } = this.props;
    // const processingFee = shouldAskProcessingFee ? invoiceInput.amountBreakup.fee : '';
    const totalWithoutFee = invoiceInput.totalAmount;
    return (
      <section className="invoice-add-totals__totals">
        <div className="invoice-add-totals__totals__amounts">
          <div className="invoice-add-totals__totals__amounts__line">
            <div className="invoice-add-totals__totals__amounts__line__label">
              Subtotal</div>
            <div className="invoice-add-totals__totals__amounts__line__amount">
              {getAmountToDisplay(
                invoiceInput.currency,
                invoiceInput.amountBreakup.subTotal
              )}
            </div>
          </div>
          {invoiceInput.amountBreakup.taxTotal.length &&
            invoiceInput.amountBreakup.taxTotal[0].amount != 0
            ? invoiceInput.amountBreakup.taxTotal.map(
              (item, index) => {
                return (
                  <Fragment key={index}>
                    <div className="invoice-add-totals__totals__amounts__line">
                      <div className="invoice-add-totals__totals__amounts__line__label">
                        {typeof item.taxName === 'object'
                          ? `${
                          item.taxName.abbreviation
                          } ${
                          item.rate > 0
                            ? `${item.rate}%`
                            : ''
                          } ${
                          item.taxName.other
                            .showTaxNumber
                            ? item.taxName.taxNumber
                              ? `(${item.taxName.taxNumber})`
                              : ''
                            : ''
                          }`
                          : `${item.taxName}`}
                      </div>
                      <div className="invoice-add-totals__totals__amounts__line__amount">
                        {getAmountToDisplay(
                          invoiceInput.currency,
                          item.amount
                        )}
                      </div>
                    </div>
                  </Fragment>
                )
              }
            )
            : null}

          <div className="invoice-add-totals__totals__amounts__line">
            <div className="invoice-add-totals__totals__amounts__line__label__currency-select">
              <strong className="py-text--strong">
                Total{' '}
              </strong>
              <SelectBox
                getOptionLabel={(value)=>(value["displayName"])}
                getOptionValue={(value)=>(value["code"])}
                value={(!!(invoiceInput?.currency?.code ?? "") ? invoiceInput.currency
                    : !!(businessInfo?.currency?.code ?? "") ?
                        businessInfo.currency : "" )}
                onChange={handleCurrency}
                options={currencies}
                className="d-inline-block ms-3 mt-3 text-left py-select--medium"
                clearable={false}
              />
            </div>
            <div className="invoice-add-totals__totals__amounts__line__amount">
              <strong>
                {getAmountToDisplay(
                  invoiceInput.currency,
                  totalWithoutFee
                )}
              </strong>
            </div>
            {}
          </div>
          <div className="invoice-add-totals__totals__amounts__line mt-2">
            {type === "estimation" ? "" :
              <div className="invoice-add-totals__totals__amounts__line__label">
                <div className="py-table__cell p-0">
                  <label for="shouldAskProcessingFee" className="py-switch mb-1 mt-1">
                    <UncontrolledTooltip placement="top" target="fees_toltip" style={{ "min-width": "280px" }} >By enabling this feature, you can pass your credit/debit card processing fees on to your customers. The line item will show as a “Convenience/Technology Fee” on your invoices and/or checkouts, when enabled. Please note, in some jurisdictions, charging processing fees to your customers is prohibited by law. It is your responsibility to act in accordance with applicable law.</UncontrolledTooltip>
                    <b className="py-toggle__title me-2">
                      Apply fees to customer&nbsp;
                      <button className="btn p-0 m-0" id="fees_toltip">
                        <i className="fal fa-info-circle"></i>
                      </button>
                    </b>
                    <input
                      type="checkbox"
                      id="shouldAskProcessingFee"
                      name="shouldAskProcessingFee"
                      className="py-toggle__checkbox"
                      checked={shouldAskProcessingFee}
                      onChange={toggleGrandTotal}
                    />
                    <span className="py-toggle__handle"></span>
                  </label>
                </div>
              </div>
            }
            <div className="invoice-add-totals__totals__amounts__line__amount">
              {/*{shouldAskProcessingFee &&
                <p>
                  {getAmountToDisplay(
                    invoiceInput.currency,
                    processingFee
                  )}
                </p>
              }*/}
            </div>
          </div>
          {shouldAskProcessingFee &&
            <div className="invoice-add-totals__totals__amounts__line mt-3">
              <div className="invoice-add-totals__totals__amounts__line__label">
                <strong>Grand Total</strong>
              </div>
              <div className="invoice-add-totals__totals__amounts__line__amount">
                <strong>
                  {getAmountToDisplay(
                    invoiceInput.currency,
                    grandTotal
                  )}
                </strong>
              </div>
            </div>
          }
          {showExchange && (
            <div className="invoice-add-totals__totals__amounts__line">
              <div className="">Currency conversion:&nbsp;</div>
              <div className="">
                {` ${getAmountToDisplay(
                  businessInfo.currency,
                  invoiceInput.totalAmountInHomeCurrency
                )} (${businessInfo.currency.code}) at ${
                  invoiceInput.exchangeRate
                  }`}
              </div>
            </div>
          )}
        </div>
      </section>
    )
  }
}


export default TotalComponent;