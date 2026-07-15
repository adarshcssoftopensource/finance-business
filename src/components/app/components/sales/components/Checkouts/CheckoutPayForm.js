import React, { Fragment } from 'react'
import { injectStripe } from 'react-stripe-elements'
import { Spinner, FormGroup, Button } from 'reactstrap'
import { connect } from 'react-redux'
import checkoutServices from '../../../../../../api/CheckoutService'
import * as PaymentActions from '../../../../../../actions/paymentAction'
import { bindActionCreators } from 'redux'
import { getAmountToDisplay } from '../../../../../../utils/GlobalFunctions'
import CardSection from './CardSection'
import visaPng from "../../../../../../assets/images/payments/visa.png"
import mastercardPng from "../../../../../../assets/images/payments/mastercard.png"
import amexPng from "../../../../../../assets/images/payments/amex.png"
import discoverPng from "../../../../../../assets/images/payments/discover.png"

const initialCheckout = (state, isEditMode) => {
  let data = {
    id: (state && state._id) || '',
    userId: (state && state.userId) || '',
    businessId:
      (state && state.businessId) || '',
    firstName: (state && state.firstName) || '',
    lastName: (state && state.lastName) || '',
    email: (state && state.email) || '',
    phone: (state && state.phone) || '',
    address: (state && state.address) || '',
    address2: (state && state.address2) || '',
    country: (state && state.country) || '',
    region: (state && state.region) || '',
    city: (state && state.city) || '',
    postal: (state && state.postal) || '',
    cardNumber: (state && state.cardNumber) || '4242424242424242',
    cardExpiryDate: (state && state.expiryDate) || '',
    cvv: (state && state.cvv) || '488',
    cardHolderName: (state && state.cardHolderName) || 'Test',
    cardZip: (state && state.cardZip) || '395004',
    isSaveCard: state ? state.isSaveCard : { allowed: false },
    saveCard: state ? state.saveCard : false
  }
  if (!isEditMode) {
    delete data.id
  }
  return data
}

class CheckoutPayForm extends React.Component {
  constructor() {
    super()
    this.state = {
      previewCheckoutModel: initialCheckout(),
      checkoutDetails: {},
      inprogressPayment: false,
      isValid: false,
      isChanged: false,
      saveCard: false
    }
  }

  setInProgressStatus = value => {
    this.setState({
      inprogressPayment: value
    })
  }

  doPayment = async env => {
    const {
      previewModel,
      checkoutDetails,
      selectedCheckout,
      actions,
      handleFormError,
      isPublic
    } = this.props
    const obj = {
      firstName: previewModel.firstName,
      lastName: previewModel.lastName,
      email: previewModel.email,
      address: previewModel.address,
      country: !!previewModel.country.id ? previewModel.country.id : "",
      region: !!previewModel.region.id ? previewModel.region.id : "",
      postal: previewModel.postal,
      city: previewModel.city,
      phone: checkoutDetails.fields.phone && previewModel.phone ? previewModel.phone : ''
    }
    let err = false
    if (!!previewModel) {
      Object.keys(obj).map(item => {
        if (item == 'firstName' || item == "lastName" || item == 'email') {
          if (!previewModel[item]) {
            handleFormError(item, previewModel[item])
            err = true
          }
        }
        if (checkoutDetails.fields.phone && item == 'phone') {
          if (!previewModel[item]) {
            handleFormError(item, previewModel[item])
            err = true
          }
        }
        if (!!checkoutDetails.fields.address) {
          if (item == 'country' || item == "region") {
            if (!previewModel[item].id) {
              handleFormError(item, previewModel[item].id)
              err = true
            }
          } else if (item == 'city' || item == "address") {
            if (!previewModel[item]) {
              handleFormError(item, previewModel[item])
              err = true
            }
          }
        }
      })

    }
    if (!err) {

      if (!isPublic) {
        this.props.showSnackbar("checkout payment can't be done from internal previewCard", true)
      } else {

        this.setInProgressStatus(true)
        this.setState({
          isChanged: true
        })

        let _card = {
          country: 'US',
          currency: checkoutDetails.currency ? checkoutDetails.currency.code : 'usd',
        }

        this.props.showError(false)
        this.props.stripe
          .createToken(_card)
          .then(({ token }) => {
            if (!token) {
              this.setInProgressStatus(false)
              this.props.showSnackbar('Card details missing', true)
            } else if (
              !previewModel ||
              !previewModel.firstName ||
              !previewModel.lastName ||
              !previewModel.email
            ) {
              this.props.showError(true)
              this.props.showSnackbar('Missing contact details', true)
              this.setInProgressStatus(false)
            } else if (
              !checkoutDetails.fields &&
              checkoutDetails.fields.address &&
              (!previewModel ||
                !previewModel.address ||
                !previewModel.country.id ||
                !previewModel.state.id ||
                !previewModel.postal ||
                !previewModel.city)
            ) {
              this.props.showError(true)
              this.props.showSnackbar('Address details missing', true)
              this.setInProgressStatus(false)
            } else if (!checkoutDetails) {
              this.props.showError(false)
              this.props.showSnackbar('Checkout details missing', true)
              this.setInProgressStatus(false)
            } else {
              token['card']['brand'] = 'visa'
              const { userExist } = this.props
              let _checkoutPayment = {
                checkoutInput: {
                  uuid:
                    selectedCheckout && selectedCheckout.uuid
                      ? selectedCheckout.uuid
                      : checkoutDetails.uuid,
                  stripeToken: token.id,
                  method: 'card',
                  customer: {
                    firstName: previewModel.firstName,
                    lastName: previewModel.lastName,
                    email: previewModel.email,
                    phone: previewModel.phone
                  },
                  address: {
                    addressLine1: previewModel.address,
                    addressLine2: previewModel.address2,
                    country: previewModel.country,
                    state: previewModel.region,
                    city: previewModel.city,
                    postal: previewModel.postal
                  },
                  cardHolderName: previewModel.customerName,
                  rawElementResponse: JSON.stringify(token),
                  saveCard: this.state.saveCard,
                  cardHolderName: previewModel.customerName
                }
              }
              this.paymentCallback(_checkoutPayment, token)
            }
          })
          .catch(err => {
            this.setInProgressStatus(false)
          })
      }
    }
  }

  paymentCallback = async (_checkoutPayment, token) => {
    try {
      const response = await checkoutServices.doCheckoutPayment(
        _checkoutPayment
      )
      if (response.statusCode === 200) {
        this.props.stripe
          .confirmCardPayment(response.data.paymentIntent.client_secret, {
            save_payment_method: response.data.shouldCardSave,
            payment_method: {
              card: {
                token: token.id
              },
              billing_details: {
                name: this.props.previewModel.customerName
              }
            }
          })
          .then(async data => {
            if (data.error) {
              throw Error(data.error.message)
            }
            if (response.data.shouldCardSave) {
              const attachCardPayload = {
                paymentMethodId: data.paymentIntent.payment_method,
                businessId: response.data.paymentResponse.businessId,
                email: this.props.previewModel.email
              }
              await this.props.customerActions.attachCardToCustomer(
                attachCardPayload
              )
            }
            this.props.showSnackbar(
              'Payment has been processed successfully',
              false
            )
            this.props.onPayment(true)
            this.setInProgressStatus(false)
          })
          .catch(e => {
            this.props.showSnackbar(
              e.message || 'Something went wrong, please try again.',
              true
            )
            this.setInProgressStatus(false)
          })
      } else {
        this.props.showSnackbar(
          response.message || 'Something went wrong, please try again.',
          true
        )
      }
    } catch (error) {
      if (
        error.data.message ==
        'Seems this checkout is not available at the moment. Please contact business owner.'
      ) {
        this.setInProgressStatus(false)
        this.props.onTurnOff(true)
        //  this.props.showSnackbar(error.message, true)
      } else {
        this.setInProgressStatus(false)
        this.props.showSnackbar(error.data.message || 'Something went wrong', true)
      }
    }

  }

  validateElement = data => { }

  handleText = event => {
    const target = event.target
    const { name, value } = event.target
    const { previewModel, selectedCheckout, checkoutDetails } = this.props
    let modal = previewModel
    if (target.type === 'checkbox') {
      if (name === 'saveCard') {
        modal.isSaveCard = { allowed: !previewModel.isSaveCard }
        modal.saveCard = !modal.saveCard
      } else if (name === 'sell') {
        modal.sell.allowed = !modal.sell.allowed
        modal.sell.account = ''
      } else {
        modal.buy.allowed = !modal.buy.allowed
        modal.buy.account = ''
      }
      this.setState({
        previewCheckoutModel: modal
      })
    } else if (name === 'taxes') {
      modal.taxes.push(value)
    } else {
      this.setState({
        previewCheckoutModel: {
          ...this.state.previewCheckoutModel,
          [name]: value
        }
      })
    }
  }
  onSaveSelect = e => {
    this.setState({ saveCard: e.target.checked })
  }

  render() {
    const { checkoutDetails } = this.props
    const { inprogressPayment, isChanged } = this.state
    return (
      <div>
        <div className="row mb-3 mx-n2">
          <div className="col-sm-6 px-2 text-xs-center">
            <h4 className="py-heading--section-title mt-0">Payment details</h4>
          </div>
          <div className="col-sm-6 px-2 text-xs-center text-right">
            <ul className="list-inline m-0 card-item-list">
              <li className="list-inline-item">
                <img
                  src={visaPng}
                  width="32"
                  className="me-1"
                />
              </li>
              <li className="list-inline-item">
                <img
                  src={mastercardPng}
                  width="32"
                  className="me-1"
                />
              </li>
              <li className="list-inline-item">
                <img
                  src={amexPng}
                  width="32"
                  className="me-1"
                />
              </li>
              <li className="list-inline-item">
                <img
                  src={discoverPng}
                  width="32"
                  className="m-0"
                />
              </li>
            </ul>
            <div className="py-text--xsmall py-text--hint">
              Credit, Debit and Prepaid Cards
          </div>
          </div>
        </div>
        <CardSection
          handleText={e => this.props.handleText(e)}
          validateElement={data => this.validateElement(data)}
          isChanged={isChanged}
        />
        <div className="row mx-n2" >
          <div className="col-sm-12 px-2 mb-2" >
            <FormGroup>
              <label className="py-checkbox">
                <input
                  type="checkbox"
                  className="py-form__element"
                  onChange={this.onSaveSelect}
                />
                <span className="py-form__element__faux"></span>
                <span className="py-form__element__label">
                  Save this card for future payments.
                </span>
              </label>
            </FormGroup>
          </div>
        </div>
        <Button
          disabled={inprogressPayment}
            block color="primary"
          className="d-inline-flex align-items-center justify-content-center text-nowrap"
          onClick={this.doPayment}
        >{inprogressPayment ? <Spinner size="sm" color="light" /> : (
          <Fragment>
            <span className="d-flex align-items-center" >
              <i className="fal fa-lock Icon--small me-2" />
              <span>Pay {checkoutDetails.total >= 0.51 ? getAmountToDisplay(checkoutDetails.currency, checkoutDetails.total) : getAmountToDisplay(checkoutDetails.currency, '0.51')}</span>
            </span>
          </Fragment>
          )}
        </Button>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    customerActions: bindActionCreators(PaymentActions, dispatch)
  }
}

const mapStateToProps = state => {
  return { userExist: state.checkoutReducer.userExist }
}

export default injectStripe(
  connect(mapStateToProps, mapDispatchToProps)(CheckoutPayForm)
)
