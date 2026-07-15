import React, { Component, Fragment } from "react";
// import { InvoiceInfoComponent } from "./InvoicePreview";
import { RenderShippingAddress, EstimateBillToComponent } from "../../Estimates/components/EstimateInvoiceComponent";
import { toMoney, getAmountToDisplay } from "../../../../../utils/GlobalFunctions";
// import { RenderPaymentMethods } from '../common/RenderPaymentMethods';
// import { InvoiceTaxes } from '../common/InvoiceTaxes';
import InvoiceInfoComponent from '../common/InvoiceInfoComponent';
import * as PaymentIcon from '../../../../../global/PaymentIcon'
import {
  _showPaymentText,
  _showExchangeRate,
  _showAmount,
  _calculateExchangeRate,
  _downloadPDF,
  _paymentMethodDisplay
} from '../../../../../utils/GlobalFunctions'
import { _formatDate, _displayDate } from "../../../../../utils/globalMomentDateFunc";
class InvoicePreviewClassic extends Component {
  constructor(props) {
    super(props);
    this.leftSvg = React.createRef();
    this.classicRef = React.createRef()
    this.seperef = React.createRef()
    this.sepHeaderRef = React.createRef()
    this.sepHeaderRef2 = React.createRef()
    this.strokeRef = React.createRef()
    this.strokeRef2 = React.createRef()
    this.headRef = React.createRef()
  }

  componentDidMount() {
    const borderColor = this.props.userSettings.accentColour;
    this.classicRef.current.style.setProperty(`border`, `10px solid ${borderColor}`, 'important')
    this.seperef.current.style.setProperty(`border-color`, `${borderColor}`, 'important')
    this.sepHeaderRef.current.style.setProperty(`border-color`, `${borderColor}`, 'important')
    this.sepHeaderRef2.current.style.setProperty(`border-color`, `${borderColor}`, 'important')
    this.strokeRef.current.style.setProperty(`stroke`, `${borderColor}`, 'important')
    this.strokeRef2.current.style.setProperty(`stroke`, `${borderColor}`, 'important')
    this.headRef.current.style.setProperty(`color`, `${borderColor}`, 'important')
  }
  render() {
    const { invoiceData, userSettings, payments, showPayment } = this.props;
    const borderColor = userSettings.accentColour;
    const businessInfo = this.props.businessInfo;
    let country =
      !!businessInfo && businessInfo.address && businessInfo.address.country
        ? businessInfo.address.country.name
        : "";
    let ship = invoiceData.customer && invoiceData.customer.addressShipping;
    let state =
      !!businessInfo && businessInfo.address && businessInfo.address.state
        ? businessInfo.address.state.name
        : "";
    const sign = invoiceData.currency ? invoiceData.currency.symbol : "";
    return (
      <Fragment className="pdf-preview-box" >
        <div className="invoice-preview__body">
          <div className="classic-template" ref={this.classicRef} >
            <div className="classic-template__header">
              {userSettings && userSettings.companyLogo ? (
                <div className="classic-template__header__logo invoiceLogo">
                  <img src={userSettings.companyLogo} alt="Company Logo" />
                </div>
              ) : (
                  <div className="classic-template__header__logo invoiceLogo"></div>
                )}

              <div className="classic-template__header__info">
                <strong className="py-text--strong">
                  {!!businessInfo && businessInfo.organizationName ? businessInfo.organizationName : ''}
                </strong>
                <div className="address">
                  {!!businessInfo && !!businessInfo.address &&
                    businessInfo.address.addressLine1 && (<div className="address__field">
                      <span className="py-text py-text--body">
                        {businessInfo.address.addressLine1}
                      </span>
                    </div>
                    )}
                  {!!businessInfo && !!businessInfo.address &&
                    businessInfo.address.addressLine2 && (
                      <div className="address__field">
                        <span className="py-text py-text--body">
                          {businessInfo.address.addressLine2}
                        </span>
                      </div>
                    )}
                  <div className="address__field" />
                  <div className="address__field">
                    {`${!!businessInfo && !!businessInfo.address && !!businessInfo.address.city ? `${businessInfo.address.city},` : ""}`}{" "}
                    {!!businessInfo && businessInfo.address &&
                      businessInfo.address.state &&
                      businessInfo.address.state.name}{" "}
                    {!!businessInfo && !!businessInfo.address && businessInfo.address.postal}
                  </div>
                </div>
                <div className="address">
                  <div className="address__field">
                    <span className="py-text py-text--body"> {country} </span>
                  </div>
                </div>
                {/* <br /> */}
                {!!businessInfo && businessInfo.communication && (
                  <div className="con-temp-address">
                    {businessInfo.communication.phone && (<div className="address__field"> Phone: {businessInfo.communication.phone}</div>)}
                    {businessInfo.communication.fax && (<div className="address__field">Fax: {businessInfo.communication.fax}</div>)}
                    {businessInfo.communication.mobile && (<div className="address__field"> Mobile: {businessInfo.communication.mobile}</div>)}
                    {businessInfo.communication.tollFree && (<div className="address__field">
                      {" "}
                      Toll-Free: {businessInfo.communication.tollFree}
                    </div>)}
                    {businessInfo.communication.website && (<div className="address__field">{businessInfo.communication.website}</div>)}
                  </div>
                )}
              </div>
            </div>
            <div className="classic-template__separator">
              <div className="classic-template__separator__header">
                <div
                  className="classic-template__separator__header__right_divider"
                  ref={this.seperef}
                >
                </div>
                <div className="classic-template__separator__header__frame">

                  <svg height="72" viewBox="0 0 120 72" width="120" ref={r => (this.leftSvg = r)}>
                    <g fill="none" ref={this.strokeRef} strokeWidth="2">
                      <path d="M183 57.038v-42.076c-.33.025-.664.038-1 .038-7.18 0-13-5.82-13-13 0-.336.013-.67.038-1h-154.076c.025.33.038.664.038 1 0 7.18-5.82 13-13 13-.336 0-.67-.013-1-.038v42.076c.33-.025.664-.038 1-.038 7.18 0 13 5.82 13 13 0 .336-.013.67-.038 1h154.076c-.025-.33-.038-.664-.038-1 0-7.18 5.82-13 13-13 .336 0 .67.013 1 .038z" />
                      <path d="M177 51.503v-31.007c-.33.024-.664.037-1 .037-7.18 0-13-5.626-13-12.567 0-.325.013-.648.038-.967h-142.076c.025.319.038.641.038.967 0 6.94-5.82 12.567-13 12.567-.336 0-.67-.012-1-.037v31.007c.33-.024.664-.037 1-.037 7.18 0 13 5.626 13 12.567 0 .325-.013.648-.038.967h142.076c-.025-.319-.038-.641-.038-.967 0-6.94 5.82-12.567 13-12.567.336 0 .67.012 1 .037z" />
                    </g>
                  </svg>
                  <div
                    className="classic-template__separator__header__frame__text"
                    ref={this.sepHeaderRef}
                    style={{ borderTopColor: `${borderColor}` }}
                  >
                    <div
                      className="py-heading--title"
                      ref={this.headRef}
                    >
                      {invoiceData.title ? invoiceData.title : invoiceData.name ? invoiceData.name : ""}
                    </div>
                  </div>

                  <svg height="72" viewBox="0 0 2 72" width="55">
                    <g fill="none" strokeWidth="2" ref={this.strokeRef2}>
                      <path d="M27 57.038v-42.076c-.33.025-.664.038-1 .038-7.18 0-13-5.82-13-13 0-.336.013-.67.038-1h-154.076c.025.33.038.664.038 1 0 7.18-5.82 13-13 13-.336 0-.67-.013-1-.038v42.076c.33-.025.664-.038 1-.038 7.18 0 13 5.82 13 13 0 .336-.013.67-.038 1h154.076c-.025-.33-.038-.664-.038-1 0-7.18 5.82-13 13-13 .336 0 .67.013 1 .038z" />
                      <path d="M21 51.503v-31.007c-.33.024-.664.037-1 .037-7.18 0-13-5.626-13-12.567 0-.325.013-.648.038-.967h-142.076c.025.319.038.641.038.967 0 6.94-5.82 12.567-13 12.567-.336 0-.67-.012-1-.037v31.007c.33-.024.664-.037 1-.037 7.18 0 13 5.626 13 12.567 0 .325-.013.648-.038.967h142.076c-.025-.319-.038-.641-.038-.967 0-6.94 5.82-12.567 13-12.567.336 0 .67.012 1 .037z" />
                    </g>
                  </svg>

                </div>
                <div
                  className="classic-template__separator__header__right_divider"
                  ref={this.sepHeaderRef2}
                >
                </div>
              </div>
              <div className="classic-template__separator__subheader">
                <div className="py-heading--subtitle">{invoiceData.subTitle || invoiceData.subheading}</div>
              </div>
            </div>
            <div className="classic-template__metadata">
              <EstimateBillToComponent estimateKeys={invoiceData.customer} />
              <RenderShippingAddress
                addressShipping={invoiceData.customer && invoiceData.customer.addressShipping}
                isShipping={invoiceData.customer && invoiceData.customer.isShipping}
              />
              <InvoiceInfoComponent estimateKeys={invoiceData} sign={invoiceData && invoiceData.currency && invoiceData.currency.symbol} showPayment={showPayment} from="classic" />
            </div>
            <div className="classic-template__items mrT25">
              <table className="py-table">
                <thead className="py-table__header">
                  <tr className="py-table__row">
                    <th colSpan="4" className="py-table__cell">
                      {invoiceData.itemHeading.column1.name}
                    </th>
                    {!invoiceData.itemHeading.hideQuantity && (
                      <th colSpan="1" className="py-table__cell-amount text-center classic-template__items__column--center py-text--strong">
                        {invoiceData.itemHeading.column2.name}
                      </th>
                    )}
                    {!invoiceData.itemHeading.hidePrice && (
                      <th colSpan="1" className="py-table__cell">
                        {invoiceData.itemHeading.column3.name}
                      </th>
                    )}
                    {!invoiceData.itemHeading.hideAmount && (
                      <th colSpan="1" className="py-table__cell-amount">
                        {invoiceData.itemHeading.column4.name}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="py-table__body">
                  {invoiceData.items.length > 0 ? invoiceData.items.map((item, key) => {
                    return (
                      <tr className="py-table__row" key={key}>
                        <td colSpan="4" className="py-table__cell">
                          {!invoiceData.itemHeading.hideItem && (
                            <span className="text-strong">{item.column1 || item.name}</span>
                          )}
                          {!invoiceData.itemHeading.hideDescription && (
                            <div className="">
                              {item.column2 || item.description}
                            </div>
                          )}
                        </td>
                        {!invoiceData.itemHeading.hideQuantity && (
                          <td colSpan="1" className="py-table__cell text-center py-table__cell-amount">{item.column3 || item.quantity}</td>
                        )}
                        {!invoiceData.itemHeading.hidePrice && (
                          <td colSpan="1" className="py-table__cell py-table__cell-amount monospace">{getAmountToDisplay(invoiceData.currency, item.column4 || item.price)}</td>
                        )}
                        {!invoiceData.itemHeading.hideAmount && (
                          <td colSpan="1" className="py-table__cell py-table__cell-amount monospace">{getAmountToDisplay(invoiceData.currency, (item.column3 || item.quantity) * (item.column4 || item.price))}</td>
                        )}
                      </tr>
                    );
                  }) : (<tr className="py-table__row">
                    <td colSpan="7" className="py-table__cell text-center py-table__cell-amount">You have not added any items.</td>
                  </tr>)}
                </tbody>
              </table>
            </div>
            <section className="py-invoice-template__totals">
              <div className="py-space-blank" />
              <div className="py-invoice-template__totals-amounts">
                <span className="classic-template__totals__taxes">
                  <div className="invoice-template-taxes">
                    {
                      invoiceData.amountBreakup.taxTotal.length > 0 ?
                        (
                          <Fragment>
                            <div className="py-invoice-template__row py-invoice-template__taxes">
                              <div className="py-invoice-template__row-label">
                                <strong className="py-text--strong">Subtotal:</strong>
                              </div>
                              <div className="classic-template__totals__amounts__line__amount">
                                <span className="py-text py-text--body mr0 monospace">
                                  {" "}
                                  {getAmountToDisplay(invoiceData.currency, invoiceData.amountBreakup.subTotal)}
                                </span>
                              </div>
                            </div>
                            <InvoiceTaxes
                              invoiceItems={invoiceData.amountBreakup.taxTotal}
                              currency={invoiceData.currency}
                            />
                            <div className="invoice-template-taxes__divider--small-margin">
                              <div className="py-divider" />
                            </div>
                          </Fragment>
                        ) : ""
                    }
                  </div>
                </span>
                <div className="classic-template__totals__amounts__line">
                  <div className="classic-template__totals__amounts__line__label">
                    <strong className="py-text--strong">Total:</strong>
                  </div>
                  <div className="classic-template__totals__amounts__line__amount">
                    <span className="py-text py-text--body monospace">
                      {getAmountToDisplay(invoiceData.currency, invoiceData.totalAmount)}
                    </span>
                  </div>
                </div>
                {
                  showPayment ? (
                    <RenderPaymentMethods invoiceData={invoiceData}
                      sign={invoiceData && invoiceData.currency && invoiceData.currency.symbol}
                      payments={payments} />
                  ) : null
                }
                {invoiceData.shouldAskProcessingFee ? 
                <div>
                  <div className="invoice-template-taxes__divider--small-margin">
                    <div className="py-divider" />
                  </div>
                  <div className="classic-template__totals__amounts__line">
                    <div className="classic-template__totals__amounts__line__label">
                      <strong className="py-text py-text--body">Processing Fees:</strong>
                    </div>
                    <div className="classic-template__totals__amounts__line__amount">
                      <span className="py-text py-text--body monospace">
                        {getAmountToDisplay(invoiceData.currency, invoiceData.amountBreakup.fee)}
                      </span>
                    </div>
                  </div>
                </div> : ""}
                <hr className="classic-template__hr-double" />

                <div className="classic-template__totals__amounts__line">
                  <div className="classic-template__totals__amounts__line__label">
                    <strong className="py-text--strong">
                      {
                        showPayment ? `Amount Due (
                          ${!!businessInfo && !!businessInfo.currency && businessInfo.currency.code}):` :
                          `Grand Total (${!!businessInfo && !!businessInfo.currency && businessInfo.currency.code}):`
                      }
                    </strong>
                  </div>
                  <div className="classic-template__totals__amounts__line__amount word-break">
                    <strong className="py-text--strong monospace">
                      {invoiceData ? getAmountToDisplay(invoiceData.currency, showPayment ? invoiceData.dueAmount : invoiceData.totalAmount) : ''}
                    </strong>
                  </div>
                </div>
              </div>
            </section>

            {invoiceData.notes ? (
              <div className="py-invoice-template__memo">
                <div className="py-text py-text--small">
                  <strong className="py-text--strong">Notes</strong>
                </div>
                <div className="py-text py-text--small word-break" dangerouslySetInnerHTML={{ __html: invoiceData.notes }} />
              </div>
            ) : invoiceData.memo && (
              <div className="py-invoice-template__memo">
                <div className="py-text py-text--small">
                  <strong className="py-text--strong">Notes</strong>
                </div>
                <div className="py-text py-text--small word-break" dangerouslySetInnerHTML={{ __html: invoiceData.memo }} />
              </div>
            )}

            <div className="classic-template__footer print_footer">
              <span className="py-text py-text--fine-print word-break">
                {invoiceData && invoiceData.footer}
              </span>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

const RenderInvoiceItems = props => {
  const { sign, invoiceItems } = props;
  return (
    <tbody>
      {invoiceItems.map((item, key) => {
        return (
          <tr key={key}>
            <td className="py-table__cell">
              <span className="text-strong">{item.column1 || item.name}</span>
              <p className="">{item.column2 || item.description}</p>
            </td>
            <td className="py-table__cell">
              <span>{item.column3 || item.quantity}</span>
            </td>
            <td className="py-table__cell">
              <span>{`${sign}${toMoney(item.column4 || item.price)}`}</span>
            </td>
            <td className="py-table__cell">
              <span>{`${sign}${toMoney((item.column3 || item.quantity) * (item.column4 || item.price))}`}</span>
            </td>
          </tr>
        );
      })}
    </tbody>
  );
};

const InvoiceItemsHeader = () => {
  return (
    <thead>
      <tr>
        <th width="400">Items</th>
        <th width="200">Quantity</th>
        <th width="200">Price</th>
        <th width="100">Amount</th>
      </tr>
    </thead>
  );
};

export const InvoiceItems = props => {
  return (
    <div className="its-not">
      <table className="table">
        <InvoiceItemsHeader />
        <RenderInvoiceItems
          invoiceItems={props.invoiceItems}
          sign={props.sign}
        />
      </table>
    </div>
  );
};

const InvoiceTaxes = props => {
  return props.invoiceItems.length > 0
    ? props.invoiceItems.map((tax, index) => {
      return (
        <Fragment key={"taxtotal" + index}>
          <div className="classic-template__totals__amounts__line">
            <div className="classic-template__totals__amounts__line__label">
              <span>
                {typeof (tax.taxName) === 'object' ?
                  `${tax.taxName.abbreviation} ${tax.rate}%${tax.taxName.other.showTaxNumber ? ` (${tax.taxName.taxNumber}):` : ':'}`
                  : `${tax.taxName}:`
                }
              </span>
              {"  "}
            </div>
            <div className="classic-template__totals__amounts__line__amount monospace">
              <span>{getAmountToDisplay(props.currency, tax.amount)}</span>
            </div>
          </div>
        </Fragment>
      );
    })
    : "";
};


const RenderPaymentMethods = (invoiceData, sign) => {
  return invoiceData.payments && invoiceData.payments.length > 0
    ? invoiceData.payments.map((item, i) => {
      return (
        <div
          className="py-invoice-template__row py-invoice-template__history"
          key={i}
        >
          <div className="py-invoice-template__row-label">
            {item.method === 'card' ? (
              <span>
                {item.type === 'refund' ? 'Refunded' : 'Payment'} on {_formatDate(item.paymentDate, 'MMMM DD, YYYY')} using&nbsp;
                {
                  !!item.card.type ? (
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
                }{!!item.card.number ? ` ending in ${item.card.number}:` : ' card'}
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
                    {item.type === 'refund' ? 'Refunded' : 'Payment'} on {_displayDate(item.paymentDate, 'MMMM DD, YYYY')}&nbsp;
                    {_paymentMethodDisplay(item.methodToDisplay)}:
                  </span>
                )}
          </div>
          <div className="py-invoice-template__row-amount monospace">
            <span>
              {/* {item.type === 'refund'
                ? `(${getAmountToDisplay(
                  invoiceData.invoiceData.currency,
                  invoiceData.invoiceData.amount
                )})`
                : */}
              {getAmountToDisplay(invoiceData.invoiceData.currency, item.amount)}
              {/* `}*/}
            </span>
          </div>
        </div>
      )
    })
    : '';
};

export default InvoicePreviewClassic;
