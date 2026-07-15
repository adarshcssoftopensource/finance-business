import React, { PureComponent, Fragment } from 'react'
import { Container, Row, Col, Button } from 'reactstrap'
import AddCardToRecurring from '../AddCardToRecurring'
import ListOfCard from '../ListOfCard'
import { StripeProvider, Elements } from 'react-stripe-elements'
import { getStripeKey } from '../../../../../../utils/common'
import rWarning from "../../../../../../assets/r-warning.svg"

class AutomaticPayments extends PureComponent {
  render() {
    const {
      currencyCode,
      switchToManual,
      showEnterCard,
      customerId,
      showSnackBar,
      cardsData,
      invoiceId,
      refreshData,
      fetchCards,
      preAuthorized,
      invoiceData
    } = this.props

    const imgOriginPath = `${process.env.REACT_APP_CDN_URL}/static/web-assets/`
    return (
      <div className="invoice-steps-card__content mt-3 ms-4 me-2 ps-5">
        {currencyCode !== invoiceData.businessId.currency.code && (
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
                  Online payment is disabled for this invoice as the currency of this invoice  <span className="py-text--strong">({currencyCode})</span> is not supported
                </p>
                <p>
                  Credit card payments can be enabled only for invoices created
                  in <span className="py-text--strong">({invoiceData.businessId.currency.code || 'USD'})</span>.
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="py-box is-active mt-3">
          <div className="d-flex align-items-center justify-content-start">
            <div className="py-decor-icon">
              <img src={`${imgOriginPath}decor--record-payments.png`} />
            </div>
            <div className="ps-3">
              <strong className="py-text--strong">Automatic payments </strong>
              <p className="m-0">
                {' '}
                Finance will send a credit/debit card pre-authorization request to the customer
              </p>
            </div>
          </div>
        </div>

        {!showEnterCard && (!!invoiceData.paymentModeSetting.preAuthorized) ? (
          <div>
            <Container>
              <Row>
                <Col xs="12" md="6">
                  <img
                    src={`${imgOriginPath}automatic-payments-preview.png`}
                    className="img-fluid mx-auto"
                  />
                </Col>
                <Col
                  xs="12"
                  md="6"
                  className="automatic_payment_customer-points"
                >
                  <p>The customer:</p>
                  <ul>
                    <li>
                      Sees amount to be charged per invoice, frequency and
                      duration
                    </li>
                    <li>
                      Has the option to pay for individual invoices manually
                    </li>
                  </ul>
                </Col>
              </Row>
            </Container>
          </div>
        ) : (
            <Fragment>
              <div className="automatic_payment_addCard-heading">
                <span>
                  Enter your customer's credit card details to continue:
              </span>
              </div>
              {cardsData[0] == null ? (
                <StripeProvider apiKey={getStripeKey()}>
                  <Elements>
                    <AddCardToRecurring
                      invoiceId={invoiceId}
                      id={customerId}
                      refreshData={refreshData}
                      fetchCards={fetchCards}
                      showSnackBar={showSnackBar}
                      invoiceData={invoiceData}
                    />
                  </Elements>
                </StripeProvider>
              ) : (
                  <ListOfCard allCards={cardsData} />
                )}
            </Fragment>
          )}
        <p className="automatic_payment_warning mb-0">
          Don't want to automate your customer's payments?
          <Button color="link" onClick={switchToManual}>
            Switch to manual payments.
          </Button>
        </p>
      </div>
    )
  }
}

export default AutomaticPayments
