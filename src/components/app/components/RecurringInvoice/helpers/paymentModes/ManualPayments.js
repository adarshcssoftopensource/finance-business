import React, { PureComponent } from 'react'
import rWarning from '../../../../../../assets/r-warning.svg'

class ManualPayments extends PureComponent {
  render() {
    const { currencyCode, payManual, isPayManual, isKycIssue, isBusinessEnabled, invoiceData: { businessId } } = this.props
    return (
      <div className="invoice-steps-card__content mt-3 ms-4 me-2 ps-5">
        {currencyCode !== businessId.currency.code && (
          <div className="py-notify py-notify--warning mt-3">
            <div className="py-notify__icon-holder">
              <img src={rWarning} />
            </div>
            <div className="py-notify__content-wrapper">
              <div className="py-notify__content">
                <div className="py-text--strong py-text--capitalize">
                  Credit Card payment can't be accepted
                </div>
                <p>
                  Online payment is disabled for this invoice as the currency of this invoice&nbsp;
                  <span className="py-text--strong">({currencyCode})</span>&nbsp;
                  is not supported.
                </p>
                <p>
                  Credit card payments can be enabled only for invoices created
                  in ({businessId.currency.code || 'USD'}).
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="py-box is-active mt-3">
          <div className="d-flex align-items-center justify-content-start">
            <div className="py-decor-icon">
              <img src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/decor--record-payments.png`} />
            </div>
            <div className="ps-3">
              <strong className="py-text--strong">Manual payments </strong>
              <p className="m-0">
                {' '}
                Your customer will have to pay for each invoice manually.
              </p>
            </div>
          </div>
        </div>
        {currencyCode === businessId.currency.code && (<div className="toggle-handle">
          <div className={`switch`}>
            <input
              type="checkbox"
              id="card"
              disabled={isBusinessEnabled === false || currencyCode !== businessId.currency.code}
              checked={currencyCode !== businessId.currency.code ? false : payManual}
              value={payManual}
              onChange={isPayManual}
            />
            <label htmlFor="card">
              <span className="round-btn"></span>
            </label>
          </div>
          <span className="txt">
            {' '}
            Allow my customer to pay each invoice via credit card or bank
            payment
          </span>
        </div>)}
      </div>
    )
  }
}

export default ManualPayments
