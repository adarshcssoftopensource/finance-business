import React, { Component, Fragment } from 'react'
import {
  getAmountToDisplay,
  toMoney
} from '../../../../../utils/GlobalFunctions'
import {
  EstimateBillToComponent,
  RenderShippingAddress
} from '../../Estimates/components/EstimateInvoiceComponent'
import TotalCalculation from './../../../../common/TotalCalculation'
// import { InvoiceInfoComponent } from './InvoicePreview';
import InvoiceInfoComponent from '../common/InvoiceInfoComponent';
import ModernInvoiceItemHeader from '../common/ModernInvoiceItemHeader';
import ModernInvoiceItemBody from '../common/ModernInvoiceItemBody';
import ModernInvoicePreviewFooter from '../common/ModernInvoicePreviewFooter';

class InvoicePreviewModern extends Component {
  constructor(props){
    super(props);
    this.daerkRef = React.createRef()
    this.softRef = React.createRef()
  }

  componentDidMount(){
    const borderColour = this.props.userSettings.accentColour
    this.daerkRef.current.style.setProperty('background-color', borderColour, "important")
    this.softRef.current.style.setProperty('background-color', borderColour, "important")
  }
  render() {
    const { invoiceData, userSettings, payments, showPayment } = this.props
    // const borderColor = userSettings.accentColour
    // const borderColorDarker = `darken(${borderColor},30%)`
    const businessInfo =
      typeof invoiceData.businessId === 'object'
        ? invoiceData.businessId
        : this.props.businessInfo
    let ship = invoiceData.customer && invoiceData.customer.addressShipping
    const sign = invoiceData.currency ? invoiceData.currency.symbol : ''
    return (
      <div className="pdf-preview-box" >
        <div className="invoice-preview__body">
          <div className="modern-template">
            <div className="modern-template__header">
              <div
                className="modern-template__header__label"
                ref={this.daerkRef}
                style={{
                  color: 'rgb(255, 255, 255)'
                }}
              >
                <span className="modern-template__header__label__valign_wrapper">
                  <div className="modern-template__header__label__title">
                    {invoiceData.title
                      ? invoiceData.title.substr(0, 99).toUpperCase()
                      : invoiceData.name
                      ? invoiceData.name.substr(0, 99).toUpperCase()
                      : ''}
                  </div>
                  <div
                    className="modern-template__header__label__subtitle"
                    style={{ color: '#fff' }}
                  >
                    {(invoiceData && !!invoiceData.subTitle) ? invoiceData.subTitle.substr(0, 99) :
                      !!invoiceData.subheading ? invoiceData.subheading.substr(0, 99) : ''}
                  </div>
                </span>
              </div>
              <div
                className="modern-template__header__amount-due"
                ref={this.softRef}
                style={{
                  color: 'rgb(255, 255, 255)',
                  opacity: '0.8'
                }}
              >
                <span className="modern-template__header__amount-due__valign_wrapper">
                  <div>
                    {showPayment ? 'Amount Due' : 'Grand Total'} (
                    {invoiceData.currency && invoiceData.currency.code})
                  </div>
                  <div className="modern-template__header__amount-due__value">
                    {invoiceData
                      ? getAmountToDisplay(
                          invoiceData.currency,
                          showPayment
                            ? invoiceData.dueAmount
                            : invoiceData.totalAmount
                        )
                      : ''}
                  </div>
                </span>
              </div>
            </div>
            <section className="modern-template__metadata">
              <EstimateBillToComponent
                estimateKeys={invoiceData && invoiceData.customer}
              />
              <RenderShippingAddress
                addressShipping={
                  invoiceData.customer && invoiceData.customer.addressShipping
                }
                isShipping={invoiceData.customer && invoiceData.customer.isShipping}
              />
              <InvoiceInfoComponent
                estimateKeys={invoiceData}
                sign={
                  invoiceData &&
                  invoiceData.currency &&
                  invoiceData.currency.symbol
                }
                showPayment={showPayment}
                from="modern"
              />
            </section>
            <div className="modern-template__items">
              <table className="py-table">
                <thead className="py-table__header">
                <ModernInvoiceItemHeader
                  invoiceData={invoiceData}
                />
                </thead>
                <ModernInvoiceItemBody
                  invoiceData={invoiceData}
                  sign={sign}
                />
              </table>
            </div>
            <TotalCalculation
              data={invoiceData}
              sign={invoiceData.currency}
              payments={payments}
              showPayment={showPayment}
              from={!showPayment && 'estimate'}
            />
            {invoiceData.notes ? (
              <div className="modern-template__memo">
                <div className="py-text py-text--small">
                  <strong className="py-text--strong">Notes</strong>
                </div>
                <div className="py-text py-text--small" dangerouslySetInnerHTML={{ __html: invoiceData.notes }} />
              </div>
            ) : (
              invoiceData.memo && (
                <div className="modern-template__memo">
                  <div className="py-text py-text--small">
                    <strong className="py-text--strong">Notes</strong>
                  </div>
                  <div className="py-text py-text--small" dangerouslySetInnerHTML={{ __html: invoiceData.memo }} />
                </div>
              )
            )}

            <ModernInvoicePreviewFooter
              invoiceData={invoiceData}
              userSettings={userSettings}
              businessInfo={businessInfo}
            />

          </div>
        </div>
      </div>
    )
  }
}

const RenderInvoiceItems = props => {
  const { sign, invoiceItems } = props
  const { itemHeading } = invoiceItems
  return (
    <tbody>
      {invoiceItems.length > 0 ? (
        invoiceItems.map((item, key) => {
          return (
            <tr key={key}>
              <td className="py-table__cell" colSpan="4">
                {!itemHeading.hideItem && (
                  <span className="text-strong">{item.column1}</span>
                )}
                {!itemHeading.hideDescription && (
                  <p className="invoice-product-description">{item.column2}</p>
                )}
              </td>
              {!itemHeading.hideQuantity && (
                <td className="py-table__cell" colSpan="1">
                  <span>{item.column3}</span>
                </td>
              )}
              {!itemHeading.hidePrice && (
                <td className="py-table__cell" colSpan="1">
                  <span>{`${sign}${toMoney(item.column4)}`}</span>
                </td>
              )}
              {!itemHeading.hideAmount && (
                <td className="py-table__cell" colSpan="1">
                  <span>{`${sign}${toMoney(
                    item.column3 * item.column4
                  )}`}</span>
                </td>
              )}
            </tr>
          )
        })
      ) : (
        <tr className="py-table__row">
          <td colSpan="7" className="text-center">
            You have not added any items.
          </td>
        </tr>
      )}
    </tbody>
  )
}

const InvoiceItemsHeader = props => {
  const { itemHeading } = props.invoiceInfo
  return (
    <thead>
      <tr>
        {!itemHeading.hideItem && (
          <th width="800">{itemHeading.column1.name}</th>
        )}
        {!itemHeading.hideQuantity && (
          <th width="200">{itemHeading.column2.name}</th>
        )}
        {!itemHeading.hidePrice && (
          <th width="200">{itemHeading.column3.name}</th>
        )}
        {!itemHeading.hideAmount && (
          <th width="200">{itemHeading.column4.name}</th>
        )}
      </tr>
    </thead>
  )
}

export const InvoiceItems = props => {
  return (
    <div className="contemporary-template__items">
      <table className="table">
        <InvoiceItemsHeader invoiceInfo={props.invoiceInfo} />
        <RenderInvoiceItems
          invoiceInfo={props.invoiceInfo}
          invoiceItems={props.invoiceItems}
          sign={props.sign}
        />
      </table>
    </div>
  )
}

// const InvoiceTaxes = props => {
//   return props.invoiceItems.length > 0
//     ? props.invoiceItems.map((tax, index) => {
//       return (
//         <Fragment key={"taxtotal" + index}>
//           <div className="template-totals-amounts-line">
//             <div className="template-totals-amounts-line-label">
//               <span>
//                 {typeof (tax.taxName) === 'object' ?
//                   `${tax.taxName.abbreviation} ${tax.rate}% ${tax.taxName.other.showTaxNumber ? `(${tax.taxName.taxNumber})` : ''}`
//                   : `${tax.taxName}`
//                 }</span>
//               {"  "}
//             </div>
//             <div className="template-totals-amounts-line-amount">
//               <span>{`${props.sign}${toMoney(tax.amount)}`}</span>
//             </div>
//           </div>
//         </Fragment>
//       );
//     })
//     : "";
// };

export default InvoicePreviewModern
