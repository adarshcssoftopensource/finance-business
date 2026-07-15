import React from 'react'
import {
  injectStripe,
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
} from 'react-stripe-elements'
import { Input,
  InputGroupText,
  InputGroup, Spinner, Button, Row, Col, Label } from 'reactstrap'
import {Form, FormGroup } from 'react-bootstrap'
import paymentService from '../../../../../api/paymentService'
import SweetAlertSuccess from '../../../../../global/SweetAlertSuccess'
import {
  getAmountToDisplay,
  _setCurrency,
  checkEmptyCardForm,
  handleAclPermissions
} from '../../../../../utils/GlobalFunctions'
import * as PaymentActions from '../../../../../actions/paymentAction'
import * as CustomerActions from '../../../../../actions/CustomerActions'
import { addCard } from '../../../../../api/CardsService'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
const style = {
  row: {
    paddingTop: '14px'
  },
  row2: {
    marginLeft: 'auto',
    padding: '14px 0 0'
  },
  row3: {
    margin: '0 auto',
    maxWidth: '250px',
    paddingTop: '14px'
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

class InvoiceCardPayout extends React.Component {
  state = {
    cardInfo: {},
    saveCard: false,
    successPaid: false,
    paidAmount: null,
    isEditAmount: false,
    cardHolderName: '',
    loading: false,
    isSubmitDisabled: true,
    postalCode:"",
    emptyError: {
      cardNumber: true,
      cardExpiry: true,
      cardCvc: true,
      postalCode: true,
      cardHolderNameEmpty: true
    }
  }

  componentDidMount() {
    const { invoiceData } = this.props
    const { paidAmount } = this.state
    const isSubmitDisabled = checkEmptyCardForm(this.state.emptyError)
    this.setState({ isSubmitDisabled })
    this.setState({
      paidAmount: paidAmount
        ? parseFloat(paidAmount).toFixed(2)
        : parseFloat(invoiceData.dueAmount).toFixed(2)
    })
  }
  onChange = e => {
    const { emptyError } = this.state
    emptyError[e.elementType] = e.empty
    const isSubmitDisabled = checkEmptyCardForm(emptyError)
    this.setState({ emptyError, isSubmitDisabled })
  }
  handleSubmit = async ev => {
    ev.preventDefault()
    if (handleAclPermissions(['Viewer','Editor'])) {
      this.props.showSnackbar(process.env.REACT_APP_PERMISSION_MSG, true)
    }else{
    const isSubmitDisabled = checkEmptyCardForm(this.state.emptyError)
    this.setState({ loading: true, isSubmitDisabled })
    let cardInfo = {}
    cardInfo.isSaveCard = { allowed: this.state.saveCard }
    try {
      this.props.stripe
        .createToken()
        .then(res => {
          const { token } = res
          if (typeof res.error === 'object') {
            if (res.error.hasOwnProperty('message')) {
              this.props.showSnackbar(res.error.message, true)
              this.setState({ loading: false })
            }
          } else {
            this.proceedToPay(token)
          }
        })
        .catch(err => {
          this.props.showSnackbar(err.message, true)
          this.setState({ loading: false })
        })
    } catch (error) {
      this.props.showSnackbar(error.message, true)
      this.setState({ loading: false })
    }
  }
  }

  proceedToPay = tokenBody => {
    const { invoiceData } = this.props
    const { paidAmount, saveCard, cardHolderName } = this.state

    const _amount = paidAmount ? paidAmount : invoiceData.dueAmount

    let paymentBody = {
      paymentInput: {
        uuid: invoiceData.uuid,
        token: tokenBody.id,
        method: 'card',
        amount: parseFloat(_amount),
        saveCard: saveCard,
        cardHolderName: cardHolderName,
        rawResponse: JSON.stringify(tokenBody)
      }
    }
    this.paymentCallback(paymentBody, tokenBody)
  }

  paymentCallback = async (_checkoutPayment, token) => {
    try {
      // const { invoiceData } = this.props
      const response = await paymentService.doCheckoutPayment(_checkoutPayment)
      if (response.statusCode === 200) {
        // this.props.stripe
        //   .confirmCardPayment(response.data.paymentIntent.client_secret, {
        //     save_payment_method: response.data.shouldCardSave,
        //     payment_method: {
        //       card: {
        //         token: token.id
        //       },
        //       billing_details: {
        //         name: this.state.cardHolderName
        //       }
        //     }
        //   })
        //   .then(async data => {
        //     if (data.error) {
        //       throw Error(data.error.message)
        //     }
        //     const payload = {
        //       status: 'SUCCESS',
        //       paymentMethodId: data.paymentIntent.payment_method,
        //       invoiceId: invoiceData._id,
        //       customerId: invoiceData.customer.id,
        //       amount: _checkoutPayment.paymentInput.amount,
        //       cardSave: response.data.shouldCardSave
        //     }
        //     let res = null;
        //     let time = setInterval(async () => {
        //       res = await paymentService.updatePaymentStatusPid(
        //         response.data.paymentIntent.id
        //       )
        //       if (!!res && res.data && res.data.status !== 'PENDING') {
        //         response.data.paymentResponse.status = res.data.status
        //         clearInterval(time)
        //         this.props.openAlert(response.data.paymentResponse, 0)
        //         this.props.refreshData()
        //       }
        //     }, 5000)
        //     // await this.props.actions.updatePaymentStatusPid(
        //     //   response.data.paymentIntent.id
        //     // )
        //     this.setState({ successPaid: true, loading: false })
        //     this.props.openAlert(response.data.paymentResponse, 0)
        //   })
        //   .catch(err => {
        //     this.setState({ loading: false })
        //     this.props.showSnackbar(err.message, true)
        //   })
        this.setState({ successPaid: true, loading: false })
        this.props.openAlert(response.data.paymentResponse.status, 0)
      } else {
        this.setState({ loading: false })
        this.props.showSnackbar(response.mesage, true)
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
    this.setState({ saveCard: e.target.checked })
  }

  togglEditAmount = evt => {
    this.setState({
      isEditAmount: true
    })
  }

  handleAmountChange = event => {
    const { value } = event.target
    this.setState({ paidAmount: value })
  }

  _setAmount = e => {
    const { name, value } = e.target
    this.setState({
      paidAmount: parseFloat(value).toFixed(2)
    })
  }

  render() {
    let stripeStyle = {
      base: {
        fontSize: '16px',
        color: this.props.themeMode === "dark-mode" ? '#9ea7b9' : '#41494f',
        fontFamily: "'Finance Grotesk', sans-serif",
        fontSmoothing: 'antialiased',

        '::placeholder': {
          color: this.props.themeMode === "dark-mode" ? '#9ea7b9' : 'rgba(40, 21, 64, 0.3)',
        }
      }
    }
    
    const { invoiceData, receipt, receiptIndex, businessInfo } = this.props
    const { successPaid, paidAmount } = this.state
    if (!successPaid) {
      return (
        <Form className="invoice__record__modal__content">
          <Row>
            <Col>
              <div className="box-symble-field mb-3" hidden={!this.state.isEditAmount}>
                <InputGroup size="normal">
                  <InputGroupText
                    className="prependAddon-input-card"
                  >
                    {
                      _setCurrency(
                        invoiceData.currency && invoiceData.currency,
                        businessInfo.currency
                      ).symbol
                    }
                  </InputGroupText>
                  <Input
                    type="type"
                    value={paidAmount}
                    step="any"
                    onChange={this.handleAmountChange}
                    name="dueAmount"
                    id="recAmoutn2"
                    placeholder="Amount"
                    className="border-left-no stripe-control text-strong"
                    onBlur={this._setAmount.bind(this)}
                  />
                <label htmlFor="recAmoutn2" className="edit-icon" ><i className="fa fa-pen" ></i></label>
                </InputGroup>
              </div>
            </Col>
          </Row>
          <Row hidden={this.state.isEditAmount} className="mb-3 align-items-center" >
            <Col sm="6">
              <label className="py-text--strong">
                <span className="d-block text-muted">Amount</span>
                <span className="h3">
                  {getAmountToDisplay(
                    _setCurrency(
                      invoiceData.currency && invoiceData.currency,
                      businessInfo.currency
                    ),
                    paidAmount
                  )}
                </span>
              </label>
            </Col>
            <Col sm="6 text-end">
              <Button type="button" size="sm" color="primary" outline onClick={this.togglEditAmount} >Edit</Button>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <FormGroup>
                <Input
                  type="text"
                  placeholder="Cardholder's name"
                  className="py-stripe__element w-100 m-0"
                  onChange={({ target: { value } }) => {
                    let isSubmitDisabled = checkEmptyCardForm(
                      this.state.emptyError
                    )
                    if (value == '') {
                      isSubmitDisabled = true
                    }
                    this.setState({
                      cardHolderName: value,
                      emptyError: {
                        ...this.state.emptyError,
                        cardHolderNameEmpty: false
                      },
                      isSubmitDisabled
                    })
                  }}
                />
              </FormGroup>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <FormGroup>
                <div className="payment-view__card-number">
                  <div className="py-stripe__element">
                    <CardNumberElement
                      style={stripeStyle}
                      placeholder="Card number"
                      onChange={this.onChange}
                    />
                  </div>
                </div>
              </FormGroup>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col sm="4">
              <div className="payment-view__expire-date">
                <div className="py-stripe__element">
                  <CardExpiryElement
                    style={stripeStyle}
                    onChange={this.onChange}
                    placeholder={'MM/YY'}
                  />
                </div>
              </div>
            </Col>
            <Col sm="4"> 
              <div className="payment-view__cvc">
                <div className="py-stripe__element">
                  <CardCVCElement
                    style={stripeStyle}
                    onChange={this.onChange}
                  />
                </div>
              </div>         
            </Col>
            <Col sm="4"> 
              <div className="payment-view__zip-postal">
                <Input
                    autocomplete="nope"
                    type="zip"
                    name="postalCode"
                    placeholder="Postal code"
                    minLength={2}
                    maxLength={10}
                    className="py-stripe__element my-0"
                    onChange={({ target: { value } }) => {
                      let isSubmitDisabled = checkEmptyCardForm(
                          this.state.emptyError
                      )
                      if (value == '') {
                        isSubmitDisabled = true
                      }
                      this.setState({
                        postalCode: value,
                        emptyError: {
                          ...this.state.emptyError,
                          postalCode: false
                        },
                        isSubmitDisabled
                      })
                    }}
                />
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
            <FormGroup>
              <Input 
                type="checkbox"
                onChange={this.onSaveSelect}
              />
              {' '}
              <Label>
                Save this card for future payments.
              </Label>
            </FormGroup>
            </Col>
          </Row>
          <div className="d-flex justify-content-between mt-5">
            <Button
                type="button"
                color="primary"
                outline
                onClick={this.props.onBack}
            >Back</Button>
            <Button
              type="submit"
              color="primary"
              disabled={this.state.loading || this.state.isSubmitDisabled}
              onClick={this.handleSubmit}
            >{this.state.loading ? (
                <Spinner size="sm" color="light" />
              ) : (
                  'Record payment'
                )}</Button>
          </div>
        </Form>
      )
    } else {
      return (
        <SweetAlertSuccess
          showAlert={true}
          title="Record a payment"
          message="The payment was recorded."
          receipt={receipt}
          receiptIndex={receiptIndex}
          onConfirm={this.props.onOpenReceiptMail}
          onCancel={this.onCloseAlert}
        />
      )
    }
  }
}
const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators(PaymentActions, dispatch),
    customerActions: bindActionCreators(CustomerActions, dispatch)
  }
}
const mapStateToProps = state => {
  return {
    paymentStatus: state.paymentReducer,
    themeMode: state.themeReducer.themeMode
  }
}
export default injectStripe(
  connect(mapStateToProps, mapDispatchToProps)(InvoiceCardPayout)
)
