import React, { Component } from 'react'
import {
    toMoney, getAmountToDisplay
  } from '../../../../../utils/GlobalFunctions'
class ModernInvoiceItemBody extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let { invoiceData , sign } = this.props
    return (
      <tbody className="py-table__body">
        {invoiceData.items.length ? (
          invoiceData.items.map((item, key) => {
            return (
              <tr className="py-table__row" key={key}>
                <td
                  colSpan="4"
                  className="py-table__cell modern-template__item"
                >
                  {!invoiceData.itemHeading.hideItem && (
                    <span className="text-strong">
                      {item.column1 || item.name}
                    </span>
                  )}
                  {!invoiceData.itemHeading.hideDescription && (
                    <p className="invoice-product-description mb-0">
                      {item.column2 || item.description}
                    </p>
                  )}
                </td>
                {!invoiceData.itemHeading.hideQuantity && (
                  <td
                    colSpan="1"
                    className="py-table__cell modern-template__item modern-template__cell-center"
                  >
                    {item.column3 || item.quantity}
                  </td>
                )}
                {!invoiceData.itemHeading.hidePrice && (
                  <td
                    colSpan="1"
                    className="py-table__cell modern-template__item py-table__cell-amount monospace"
                  >{getAmountToDisplay(invoiceData.currency, item.column4 || item.price)}</td>
                )}
                {!invoiceData.itemHeading.hideAmount && (
                  <td
                    colSpan="1"
                    className="py-table__cell modern-template__item py-table__cell-amount monospace"
                  >{getAmountToDisplay(invoiceData.currency, (item.column3 || item.quantity) *
                    (item.column4 || item.price))}</td>
                )}
              </tr>
            )
          })
        ) : (
          <tr className="py-table__row">
            <td colSpan={'7'} className="text-center">
              You have not added any items.
            </td>
          </tr>
        )}
      </tbody>
    )
  }
}

export default ModernInvoiceItemBody;
