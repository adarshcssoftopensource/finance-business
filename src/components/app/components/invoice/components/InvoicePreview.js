import React, { Component, Fragment } from 'react';
import {
  getAmountToDisplay,
  _paymentMethodDisplay,
} from '../../../../../utils/GlobalFunctions';
import {
  EstimateBillToComponent,
  RenderShippingAddress
} from '../../Estimates/components/EstimateInvoiceComponent';
import InvoiceAmountPreview from '../common/InvoiceAmountPreview';
import InvoiceItems from '../common/InvoiceItems';
import InvoiceInfoComponent from '../common/InvoiceInfoComponent';
import InVoicePreviewHeader from '../common/InVoicePreviewHeader';

class InvoicePreview extends Component {
  render() {
    const {
      selectedCustomer,
      invoiceData,
      userSettings,
      payments,
      showPayment
    } = this.props;

    const businessInfo =
      typeof invoiceData.businessId === 'object'
        ? invoiceData.businessId
        : this.props.businessInfo
    return (
      <div className="pdf-preview-box" >
        <div className="invoice-preview__body">
          <div className="contemporary-template">
            <div className="contemporary-template__header">
              {userSettings && !!userSettings.companyLogo ? (
                <div className="contemporary-template__header__logo invoiceLogo">
                  <img
                    src={userSettings.companyLogo || ''}
                    content-height="100%"
                    scaling="uniform"
                  />
                </div>
              ) : (
                <div className="contemporary-template__header__logo"></div>
              )}

                <InVoicePreviewHeader
                invoiceData={invoiceData}
                businessInfo={businessInfo}
                />

            </div>
            <hr />
            <div className="contemporary-template__metadata">
              <Fragment>
                <div className="contemporary-template__metadata__customer">
                  <EstimateBillToComponent estimateKeys={invoiceData.customer} />
                </div>
                {invoiceData &&
                  invoiceData.customer &&
                  invoiceData.customer.addressShipping && (
                    <div className="contemporary-template__metadata__customer">
                      <RenderShippingAddress
                        addressShipping={invoiceData.customer.addressShipping}
                        isShipping={invoiceData.customer && invoiceData.customer.isShipping}
                      />
                    </div>
                )}
                <InvoiceInfoComponent
                  estimateKeys={invoiceData}
                  showPayment={showPayment}
                  from="contemporary"
                />
              </Fragment>
            </div>
            <InvoiceItems
              invoiceInfo={invoiceData}
              invoiceItems={invoiceData.items}
              userSettings={userSettings}
            />
            <br />

            <InvoiceAmountPreview
              invoiceData={invoiceData}
              getAmountToDisplay={getAmountToDisplay}
              showPayment={showPayment}
              payments={payments}
            />

            {invoiceData.notes ? (
              <div className="notes">
                <strong>Notes</strong>
                <br />
                <div
                  className="word-break"
                  dangerouslySetInnerHTML={{ __html: invoiceData.notes }}
                />
              </div>
            ) : (
              invoiceData.memo && (
                <div className="notes">
                  <strong>Notes</strong>
                  <br />
                  <div
                    className="word-break"
                    dangerouslySetInnerHTML={{ __html: invoiceData.memo }}
                  />
                </div>
              )
            )}
            <div className="text-center contemporary-template__footer word-break">
              {invoiceData.footer}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default InvoicePreview
