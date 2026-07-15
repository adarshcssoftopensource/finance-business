import React from 'react'
import {Spinner, Button, Input} from 'reactstrap'
import {
  injectStripe,
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
} from 'react-stripe-elements'
import { initiateCard } from '../../../../../../../api/CardsService'
import { checkEmptyCardForm } from '../../../../../../../utils/GlobalFunctions'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

class StripePaymentForm extends React.Component {
  state = {
    loading: false,
    cardHolderName: '',
    postalCode: '',
    isSubmitDisabled: true,
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
  }

  onChange = e => {
    const { emptyError } = this.state
    emptyError[e.elementType] = e.empty
    const isSubmitDisabled = checkEmptyCardForm(emptyError)
    this.setState({ emptyError, isSubmitDisabled })
  }

  _handleSubmit = async ev => {
    ev.preventDefault()
    const { id } = this.props
    const { emptyError, postalCode } = this.state
    const { cardHolderName } = this.props
    const isSubmitDisabled = checkEmptyCardForm(emptyError)
    this.setState({ loading: true, isSubmitDisabled })
    let cardInfo = {}
    cardInfo.isSaveCard = { allowed: this.state.saveCard }
    try {
      const stripeClientSecret = await initiateCard(id)
      if (stripeClientSecret.error) {
        throw Error('Card is invalid')
      }
      this.props.stripe.createToken().then(async res => {
        const { token } = res
        try {
          this.props.stripe
            .confirmCardSetup(
              stripeClientSecret.data.initiateResponse.clientSecret,
              {
                payment_method: {
                  metadata: {
                    user_id: id
                  },
                  billing_details: {
                    name: cardHolderName,
                    address: { postal_code: postalCode }
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
                  this.props.showSnackBar(response.error.message, true)
                  this.setState({ loading: false })
                }
              } else {
                this.props._proceedToPay(response.setupIntent.payment_method, () => {
                  this.setState({ loading: false })
                })
              }
            })
            .catch(err => {
              this.props.showSnackBar(err.message, true)
              this.setState({ loading: false })
            })
        } catch (err) {
          this.setState({ loading: false })
          this.props.showSnackBar(err.message, true)
        }
      }).catch = err => {
        this.setState({ loading: false })
        this.props.showSnackBar(err.message, true)
      }
    } catch (err) {
      this.setState({ loading: false })
      this.props.showSnackBar(err.message, true)
    }
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

    return (
      <form className="col-md-7" onSubmit={this._handleSubmit.bind(this)}>
        <div className="row mx-n2">
          <div className="col-md-8 px-2 mb-3" >
            <CardNumberElement
              id="PaymentCard__Number"
              style={stripeStyle}
              onChange={this.onChange}
              className="py-stripe__element"
              placeholder="Card number"
            />
          </div>
          <div className="col-md-4 px-2 mb-3">
            <Input
                autocomplete="nope"
                type="zip"
                name="postalCode"
                placeholder="ZIP/Postal"
                minLength={2}
                maxLength={10}
                className="py-stripe__element form-control my-0"
                value={this.state.postalCode}
                onChange={({target: {value}}) => {
                  let isSubmitDisabled = checkEmptyCardForm(
                      this.state.emptyError
                  )
                  if (value === "") {
                    isSubmitDisabled = true
                  }
                  this.setState({
                    emptyError: {
                      ...this.state.emptyError,
                      postalCode: false
                    },
                    postalCode: value,
                    isSubmitDisabled
                  })
                }}
            />
          </div>
          <div className="col-md-6 px-2 mb-3" >
            <input
              type="text"
              className="py-stripe__element form-control my-0"
              placeholder="Cardholder's name"
              value={this.props.cardHolderName}
              onChange={({ target: { value } }) => {
                let isSubmitDisabled = checkEmptyCardForm(
                  this.state.emptyError
                )
                if (value == '') {
                  isSubmitDisabled = true
                }
                this.props.setCardHolderName(value)
                this.setState({
                  emptyError: {
                    ...this.state.emptyError,
                    cardHolderNameEmpty: false
                  },
                  isSubmitDisabled
                })
              }}
            />
          </div>
          <div className="col-md-3 px-2 mb-3">
            <CardExpiryElement
              style={stripeStyle}
              className="py-stripe__element"
              onChange={this.onChange}
              id="PaymentCard__ExpireDate"
            />
          </div>
          <div className="col-md-3 px-2 mb-3">
            <CardCVCElement
              style={stripeStyle}
              onChange={this.onChange}
              className="py-stripe__element"
              id="PaymentCard__CVV"
            />
          </div>
          
          <div className="col-md-12 px-2" >
            <Button
              type="submit"
              color="primary"
              block
              className="full-width"
              disabled={this.state.loading || this.state.isSubmitDisabled}
            >{this.state.loading && <Spinner size="sm" color="light" />}
              &nbsp;<i className="fal fa-lock" /> Save Card</Button>
          </div>
        </div>
      </form>
    )
  }
}

const mapStateToProps = state => {
  return { themeMode: state.themeReducer.themeMode }
}

const mapDispatchToProps = dispatch => {
  return {
    addCard: (id, data) => {
      dispatch(addPaymentInInvoice(id, data))
    }
  }
}
export default withRouter(
  injectStripe(connect(mapStateToProps, mapDispatchToProps)(StripePaymentForm))
)
