import React, { Component } from 'react';
import {
  getAmountToDisplay,
  _paymentMethodDisplay
} from '../../../../../utils/GlobalFunctions';

class RenderInvoiceItems extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { invoiceItems, invoiceInfo } = this.props
    const { itemHeading } = invoiceInfo
    return (
      <tbody>
        {invoiceItems.length > 0 ? (
          invoiceItems.map((item, key) => {
            return (
              <tr key={key} className="bodr_btm">
                <td width="500">
                  {!itemHeading.hideItem && (
                    <span className="text-strong">
                      {item.column1 || item.name}
                    </span>
                  )}
                  {!itemHeading.hideDescription && (
                    <p className="invoice-product-description">
                      {item.column2 || item.description}
                    </p>
                  )}
                </td>
                <td className="text-center" width="100">
                  {!itemHeading.hideQuantity && (
                      <span>{item.column3 || item.quantity}</span>
                  )}
                </td>
                <td width="150" className="monospace" >
                  {!itemHeading.hidePrice && (
                    <span>
                      {getAmountToDisplay(
                        invoiceInfo.currency,
                        item.column4 || item.price
                      )}
                    </span>
                  )}
                </td>
                <td width="150" className="monospace" >
                  {!itemHeading.hideAmount && (
                    <span>
                      {getAmountToDisplay(
                        invoiceInfo.currency,
                        (item.column3 || item.quantity) *
                          (item.column4 || item.price)
                      )}
                    </span>
                  )}
                </td>
              </tr>
            )
          })
        ) : (
          <tr className="bodr_btm">
            <td colSpan="7" className="text-center">
              You have not added any items.
            </td>
          </tr>
        )}
      </tbody>
    )
  }
}



export default RenderInvoiceItems
