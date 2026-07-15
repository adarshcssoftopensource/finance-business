import React, { Fragment } from 'react'
import { injectStripe } from 'react-stripe-elements'
import { Row, Form } from 'react-bootstrap'
import paymentService from '../../../../../../api/paymentService'
import * as PaymentIcon from '../../../../../../global/PaymentIcon'
import InvoiceCardSection from './InvoiceCardSection'
import InformationAlert from '../../../../../../global/InformationAlert'
import {
  toMoney,
  checkEmptyCardForm,
  getAmountToDisplay,
  terms
} from '../../../../../../utils/GlobalFunctions'
import { Spinner, FormGroup, Input, FormText, Button } from 'reactstrap'
import { addCard, initiatePublicCard } from '../../../../../../api/CardsService'
import { addCardPublic, addPaymentInRecurring } from '../../../../../../api/RecurringService'

const style = {
  row: {
    maxWidth: '500px',
    marginRight: 'auto',
    marginLeft: 'auto',
    marginBottom: '0px',
    // paddingTop: '17px',
    textAlign: 'left'
  },
  col: {
    padding: '2px'
  },
  input: {
    borderColor: '#b2c2cd'
  },
  button: {
    color: '#fff',
    background: '#136acd',
    border: '1px solid transparent',
    padding: '6px 20px',
    textAlign: 'center',
    minWidth: '100%',
    borderRadius: '500px',
    display: 'inline-block',
    boxSizing: 'border-box',
    verticalAlign: 'middle',
    outline: 0,
    '&:hover': {
      background: '#0b59b1'
    }
  }
}

class CardPayoutForm extends React.Component {
  state = {
    cardInfo: {},
    isAuthorizaionSuccess: false,
    saveCard: false,
    successPaid: false,
    paidAmount: null,
    loading: false,
    isSubmitDisabled: true,
    postalCode: "",
    emptyError: {
      cardNumber: true,
      cardExpiry: true,
      cardCvc: true,
      postalCode: true,
      cardHolderNameEmpty: true
    }
  }

  componentDidMount() {
    const isSubmitDisabled = checkEmptyCardForm(this.state.emptyError)
    this.setState({ isSubmitDisabled })
    this._setAmount({ target: { value: null, name: null } })
  }

  onChange = e => {
    const { emptyError } = this.state
    emptyError[e.elementType] = e.empty
    const isSubmitDisabled = checkEmptyCardForm(emptyError)
    this.setState({ emptyError, isSubmitDisabled })
  }

  handleSubmit = ev => {
    ev.preventDefault()
    const isSubmitDisabled = checkEmptyCardForm(this.state.emptyError)
    this.setState({ loading: true, isSubmitDisabled })
    let cardInfo = {}
    cardInfo.isSaveCard = { allowed: this.state.saveCard }

    this.props.stripe
      .createToken(cardInfo)
      .then(({ token }) => {
        if (!!this.props.recurring) {
          this.preAuthorizeCallBack(token)
        } else {
          this.proceedToPay(token)
        }
      })
      .catch(err => {
        this.props.showSnackbar(err.message, true)
        this.setState({ loading: false })
      })
  }

  proceedToPay = tokenBody => {
    const { invoiceData } = this.props
    const { paidAmount } = this.state
    if (!!tokenBody && !!tokenBody.id) {
      let paymentBody = {
        paymentInput: {
          uuid: invoiceData.uuid,
          stripeToken: tokenBody.id,
          amount: paidAmount
            ? parseFloat(paidAmount).toFixed(2)
            : invoiceData.dueAmount,
          rawElementResponse: JSON.stringify(tokenBody),
          method: 'card',
          saveCard: this.state.saveCard,
          cardHolderName: this.state.cardHolderName
        }
      }
      this.paymentCallback(paymentBody, tokenBody)
    } else {
      this.props.showSnackbar(
        'Failed to establish secure connection for payment. Please try again.',
        true
      )
      this.setState({ loading: false })
    }
  }

  preAuthorizeCallBack = async (token) => {
    try {
      const stripeClientSecret = await initiatePublicCard()
      if (stripeClientSecret.error) {
        throw Error('Card is invalid')
      }
      try {
        this.props.stripe
          .confirmCardSetup(
            stripeClientSecret.data.initiateResponse.clientSecret,
            {
              payment_method: {
                metadata: {
                  user_id: this.props.invoiceData.customer.uuid
                },
                billing_details: {
                  name: this.state.cardHolderName,
                  address: { postal_code: this.state.postalCode }
                },
                card: {
                  token: token.id
                }
              }
            }
          )
          .then(response => {
            if (typeof response.error === 'object') {
              if (response.error.hasOwnProperty('message')) {
                this.props.showSnackbar(response.error.message, true)
                this.setState({ loading: false })
              }
            } else {
              this._proceedToPay(response.setupIntent.payment_method)
            }
          })
          .catch(err => {
            this.props.showSnackbar(err.message, true)
            this.setState({ loading: false })
          })
      } catch (err) {
        this.setState({ loading: false })
        this.props.showSnackbar(err.message, true)
      }
    } catch (err) {
      this.setState({ loading: false })
      this.props.showSnackbar(err.message, true)
    }
  }

  _proceedToPay = async cardData => {
    const { recurring, refreshData } = this.props
    const input = {
      cardInput: {
        cardHolderName: this.state.cardHolderName,
        paymentMethodId: cardData
      },
      signature: this.state.signature
    }
    try {
      const addCardResponse = await addCardPublic(recurring.uuid, input)
      if (addCardResponse.error) {
        this.props.showSnackbar(addCardResponse.message, true)
        this.setState({ loading: false })
      } else {
        this.props.showSnackbar(addCardResponse.message, false)
        this.setState({ loading: false })
        if (this.props.preAuthorize) {
          this.setState({ isAuthorizaionSuccess: true })
        } else {
          refreshData()
        }

        // this.props.fetchCards()
      }
    } catch (err) {
      this.props.showSnackbar(err.message, true)
      this.setState({ loading: false })
    }
  }

  paymentCallback = async (_checkoutPayment, token) => {
    try {
      const { invoiceData, preAuthorize } = this.props
      let response = await paymentService.chargeEmailService(_checkoutPayment)
      if (response.statusCode === 200) {
        this.props.stripe
          .confirmCardPayment(response.data.paymentIntent.client_secret, {
            save_payment_method: response.data.shouldCardSave,
            payment_method: {
              card: {
                token: token.id
              },
              billing_details: {
                name: this.state.cardHolderName
              }
            }
          })
          .then(async data => {
            try {
              if (data.error) {
                throw Error(data.error.message)
              }
              const payload = {
                cardInput: {
                  cardHolderName: this.state.cardHolderName,
                  paymentMethodId: data.paymentIntent.payment_method
                },
                signature: this.state.signature
              }
              let res = null;
              if (!!preAuthorize) {
                const preData = await addCardPublic(invoiceData.uuid, payload)
              }
              let time = setInterval(async () => {
                res = await paymentService.updatePaymentStatusPid(
                  response.data.paymentIntent.id
                )
                if (!!res && res.data && res.data.status !== 'PENDING') {
                  response.data.paymentResponse.status = res.data.status
                  clearInterval(time)
                  this.props.refreshData()
                  this.props.openAlert(response.data.paymentResponse, 0)
                }
              }, 5000)
              this.setState({ successPaid: true, loading: false })
              this.props.openAlert(response.data.paymentResponse, 0)
              this.props.refreshData()
            } catch (error) {
              this.setState({ loading: false })
              this.props.showSnackbar(error.message, true)
            }
          })
      } else {
        this.setState({ loading: false })
        this.props.showSnackbar(response.message, true)
      }
    } catch (error) {
      this.setState({ loading: false })
      this.props.showSnackbar(error.message, true)
    }
  }

  onFormValChange = (name, value) => {
    let cardInfo = this.state.cardInfo
    cardInfo[name] = value
    this.setState({ cardInfo: cardInfo })
  }

  onSaveSelect = e => {
    this.setState({ saveCard: !this.state.saveCard })
  }

  _setAmount = e => {
    const { name, value } = e.target
    const { invoiceData } = this.props
    this.setState({
      paidAmount: !!value ? parseFloat(value).toFixed(2) : toMoney(invoiceData.dueAmount, false)
    })
  }

  showRepeatOn = data => {
    switch (data.unit) {
      case 'daily':
        return 'Every day of the week'
      case 'weekly':
        return `Every ${data.dayOfWeek}`
      case 'monthly':
        return `On the ${data.dayofMonth < 2 || data.dayofMonth === "1" ? 'first' : data.dayofMonth} day of each month`
      case 'yearly':
        return `Every ${data.monthOfYear} on the ${data.dayofMonth < 2 || data.dayofMonth === "1" ? 'first' : data.dayofMonth} day of the month`
      case 'custom':
        return `Every ${data.interval} ${data.subUnit} in ${data.monthOfYear} on the ${data.dayofMonth < 2 || data.dayofMonth === "1" ? 'first' : data.dayofMonth} day of the month`
    }
  }

  render() {
    const { invoiceData, preAuthorize, recurring, changeManual } = this.props
    const { successPaid, paidAmount, signErr, isAuthorizaionSuccess } = this.state
    if (!successPaid) {
      return (
        <React.Fragment>
          {isAuthorizaionSuccess ? (<InformationAlert varient="info">
            <div className="alert-icon">
              <svg className="Icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 19a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-2a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm0-11a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 3a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0v-4a1 1 0 0 1 1-1z"></path></svg>
            </div>
            <div className="alert-content">
              <div className="alert-desc" >
                Your card details have been saved successfully and will be charged on due date
              </div>
            </div>
          </InformationAlert>)
            :
            <form onSubmit={this.handleSubmit}>
              <div className="py-box py-box--large no-border">
                <div className="d-flex flex-column align-items-center mb-4 text-center">
                  <ul className="list-inline m-0 card-item-list">
                    <li className="list-inline-item">
                      {' '}
                      <img
                        src={`${PaymentIcon.visa}`}
                        width="52px"
                      />
                    </li>
                    <li className="list-inline-item">
                      {' '}
                      <img
                        src={`${PaymentIcon.master}`}
                        width="52px"
                      />
                    </li>
                    <li className="list-inline-item">
                      {' '}
                      <img
                        src={`${PaymentIcon.amex}`}
                        width="52px"
                      />
                    </li>
                    <li className="list-inline-item">
                      {' '}
                      <img
                        src={`${PaymentIcon.discover}`}
                        width="52px"
                      />
                    </li>
                  </ul>
                  <span className="py-text--small py-text--hint">
                    Credit, Debit and Prepaid Cards
              </span>
                </div>
                <Row style={style.row}>
                  <InvoiceCardSection
                      _handleCardHolder={({target: {value, name}}) => {
                        let isSubmitDisabled = checkEmptyCardForm(
                            this.state.emptyError
                        )
                        const customName = name === "firstName" ? "cardHolderName" : name;
                        if (value == '') {
                          isSubmitDisabled = true
                        }
                        this.setState({
                          [customName]: value,
                          emptyError: {
                            ...this.state.emptyError,
                            [customName]: false
                          },
                          isSubmitDisabled
                        })
                      }}
                    sign={
                      invoiceData &&
                      invoiceData.currency &&
                      invoiceData.currency.symbol
                    }
                    amount={paidAmount}
                    _handleAmountChange={e => {
                      this.setState({ paidAmount: e.target.value })
                    }
                    }
                    onChange={this.onChange}
                    _setAmount={e => this._setAmount(e)}
                    recurring={recurring}
                    changeManual={changeManual}
                  />
                </Row>
                <Row style={style.row}>
                  {
                    !!preAuthorize ? (
                      <Fragment>
                        <div className="text-center authorize-text">
                          <p>
                            I authorize <b>{invoiceData.businessId.organizationName}</b> to automatically charge this credit card <b>{this.showRepeatOn(recurring.recurrence)}</b>.
                        A receipt for each payment will be sent upon successful processing. By entering my name I agree with the <a href={terms()} target="_blank" className="py-text--strong py-text--link">Terms of Use</a>.
                      </p>
                        </div>
                        <FormGroup className="text-center" style={{ maxWidth: '420px', margin: '0 auto 32px auto' }}>
                          <Input type="text" name="signature" id="signature"
                            autoComplete={'off'}
                            className="border-left-no border-right-no border-top-no text-center bankSign p-0"
                            onChange={e => this.setState({ signature: e.target.value })}
                            placeholder="Enter your full name here"
                          ></Input>
                          {
                            signErr ?
                              <FormText><span className="err color-red">Please sign above</span></FormText>
                              : ""
                          }
                          <div className="mt-1">Card Holder Signature</div>
                        </FormGroup>
                      </Fragment>
                    )
                      : (
                        <Form.Group controlId="formBasicChecbox">
                          <Form.Check
                            type="checkbox"
                            label={
                              ' Save this credit card and allow ' +
                              invoiceData.businessId.organizationName +
                              ' to automatically charge it for future invoices'
                            }
                            onChange={this.onSaveSelect}
                            className="cardSave-check"
                          />
                        </Form.Group>
                      )
                  }
                </Row>
                {

                }
                <Row style={style.row}>
                  <Button
                    color="primary" block
                    disabled={this.state.loading || this.state.isSubmitDisabled}
                  ><i className="fal fa-lock me-2" />{' '}{this.state.loading ? (<Spinner size="sm" color="light" />) : (
                    preAuthorize ? 'Authorize' : `Pay ${getAmountToDisplay(invoiceData.currency, !!paidAmount ? paidAmount : invoiceData.dueAmount)}`)}
                  </Button>
                </Row>
              </div>
            </form>}
        </React.Fragment>
      )
    } else {
      return (
        <div style={{ width: '100%', textAlign: 'center' }}>
          <h1> Success </h1>
        </div>
      )
    }
  }
}

export default injectStripe(CardPayoutForm)