import React, { useState } from 'react'
import {
  injectStripe,
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
} from 'react-stripe-elements'
import { Spinner, Button, Input } from 'reactstrap'
import { Link } from 'react-router-dom'
import { initateAddCardIntent } from '../../api/subscriptionService'
import FormValidationError from '../FormValidationError'
import { terms, privacyPolicy } from '../../utils/GlobalFunctions';
import Summary from './summary'
import { connect } from 'react-redux'

const CardForm = props => {
  const [cardHolderErr, setCardHolderErr] = useState(false)
  const [cardNumberErr, setCardNumberErr] = useState({
    msg: '',
    isError: false
  })
  const [cardDateErr, setCardDateErr] = useState({ msg: '', isError: false })
  const [cardCvvErr, setCardCvvErr] = useState({ msg: '', isError: false })
  const [cardPostalErr, setCardPostalErr] = useState({
    msg: '',
    isError: false
  })
  const [postalCodeErr, setPostalCodeErrErr] = useState(false)
  const [cardHolderName, setCardHolderName] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [couponCode, setCouponCode] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCardHolderChange = e => {
    setCardHolderName(e.target.value)
    if (e.target.value) {
      setCardHolderErr(false)
    } else {
      setCardHolderErr(true)
    }
  }

  const handleCardPostalChange = e => {
    setPostalCode(e.target.value)
    if (e.target.value) {
      setPostalCodeErrErr(false)
    } else {
      setPostalCodeErrErr(true)
    }
  }

  const resetError = () => {
    setCardNumberErr({ msg: '', isError: false })
    setCardDateErr({ msg: '', isError: false })
    setCardCvvErr({ msg: '', isError: false })
    setCardPostalErr({ msg: '', isError: false })
  }
  const handleError = error => {
    const { code } = error
    if (code === 'incomplete_number' || code === 'invalid_number') {
      setCardNumberErr({ msg: error.message, isError: true })
    } else if (
      code === 'incomplete_expiry' ||
      code === 'invalid_expiry_year' ||
      code === 'invalid_expiry_year_past'
    ) {
      setCardDateErr({ msg: error.message, isError: true })
    } else if (code === 'incomplete_cvc') {
      setCardCvvErr({ msg: error.message, isError: true })
    } else if (code === 'incomplete_zip') {
      setCardPostalErr({ msg: error.message, isError: true })
    } else {
      props.showMessage(error.message, true)
    }
  }
  const handleSubmit = async evt => {
    evt.preventDefault()
    resetError()
    if (!cardHolderName) {
      setCardHolderErr(true)
    } else if (props.stripe) {
      try {
        // Setup Payment Intent
        setIsLoading(true)
        const stripeClientSecret = await initateAddCardIntent()
        if (stripeClientSecret.error) {
          throw new Error('Card is invalid')
        } else {
          // Create Token
          const getToken = await props.stripe.createToken()
          //handle stripe card error
          if (!getToken.token) {
            setIsLoading(false)
            handleError(getToken.error)
          } else {
            // Confirmed Token with Payment Intent
            const confirmCardSetupResponse = await props.stripe.confirmCardSetup(
              stripeClientSecret.data.initiateResponse.clientSecret,
              {
                payment_method: {
                  metadata: {
                    source: 'subscription'
                  },
                  billing_details: {
                    name: cardHolderName,
                    address: { postal_code: postalCode }
                  },
                  card: {
                    token: getToken.token.id
                  }
                }
              }
            )
            if (typeof confirmCardSetupResponse.error === 'object') {
              if (confirmCardSetupResponse.error.hasOwnProperty('message')) {
                throw Error(confirmCardSetupResponse.error.message)
              }
            } else {
              setIsLoading(false)
              await props.getCardDetails({
                ...getToken,
                cardHolderName,
                couponCode,
                paymentMethodId:
                  confirmCardSetupResponse.setupIntent.payment_method
              })
            }
          }
        }
      } catch (error) {
        setIsLoading(false)
        props.showMessage(error.message, true)
      }
    } else {
      props.showMessage("stripe.js hasn't loaded yet.", true)
    }
  }

  const setCoupon = (couponCode) => {
    setCouponCode(couponCode)
  }

  const createOptions = () => {
    return {
      style: {
        base: {
          fontSize: '16px',
          fontWeight: '400',
          color: props.themeMode === "dark-mode" ? '#8f9bb3' : '#1c252c',
          letterSpacing: '0.025em',
          lineHeight: '36px',
          height: '36px',
          '::placeholder': {
            color: props.themeMode === "dark-mode" ? '#9ea7b9' : '#B2C2CD',
          },
        },
        invalid: {
          color: '#fa755a',
          caretColor: '#1c252c'
        },
      },
    };
  };
  return (
    <form className="billing-details-form" onSubmit={handleSubmit}>
      {props.cards &&
        props.cards.length > 0 &&
        window.location.pathname.includes(
          '/app/setting/subscription-update'
        ) && (
          <div className="row mb-4">
            <div className="col-md-12">
              <Button
                className="btn-save-card"
                onClick={props.handleDifferentCard}
                color="primary"
                block
                outline
              >
                Use Saved Credit Card
              </Button>
            </div>
          </div>
        )}
      <div className="row">
        <div className="col-lg-12 mb-4">
          <div className="form-group mb-0">
            <label
              forhtml="fullName"
              className="py-form-field__label is-required"
            >
              Cardholder’s name
            </label>
            <input
              type="text"
              id="fullName"
              name="cardHolderName"
              placeholder=""
              className="form-control"
              value={cardHolderName}
              onChange={handleCardHolderChange}
            />
            <FormValidationError showError={cardHolderErr} />
          </div>
        </div>
        <div className="col-12 mb-3">
          <div className="form-group mb-0">
            <label
              forhtml="cardNumber"
              className="py-form-field__label is-required"
            >
              Card number
            </label>
            <div
              id="cardNumber"
              className="form-control stripe-form-control mb-0"
            >
              <CardNumberElement placeholder="" {...createOptions()} />
            </div>
            <FormValidationError
              showError={cardNumberErr.isError}
              message={cardNumberErr.msg}
            />
          </div>
        </div>
        <div className="col-sm-4 mb-4">
          <div className="form-group mb-0">
            <label
              forhtml="expiryDate"
              className="py-form-field__label is-required"
            >
              Expiry date
            </label>
            <div
              id="expiryDate"
              className="form-control stripe-form-control mb-0"
            >
              <CardExpiryElement placeholder="" {...createOptions()} />
            </div>
            <FormValidationError
              showError={cardDateErr.isError}
              message={cardDateErr.msg}
            />
          </div>
        </div>
        <div className="col-sm-4 mb-4">
          <div className="form-group mb-0">
            <label
              forhtml="cvcCode"
              className="py-form-field__label is-required"
            >
              CVC
            </label>
            <div id="cvcCode" className="form-control stripe-form-control mb-0">
              <CardCVCElement placeholder="" {...createOptions()} />
            </div>
            <FormValidationError
              showError={cardCvvErr.isError}
              message={cardCvvErr.msg}
            />
          </div>
        </div>
        <div className="col-sm-4 mb-4">
          <div className="form-group mb-0">
            <label
              forhtml="postalCode"
              className="py-form-field__label is-required"
            >
              Postal code
            </label>
            <input
              type="zip"
              name="postalCode"
              minLength={2}
              maxLength={10}
              className="form-control stripe-form-control mb-0"
              value={postalCode}
              onChange={(e) => handleCardPostalChange(e)}
            />
            <FormValidationError showError={postalCodeErr} />
            <FormValidationError
              showError={cardPostalErr.isError}
              message={cardPostalErr.msg}
            />
          </div>
        </div>

        {props.planDetails && <Summary selectedPlan={props.planDetails} setCoupon={setCoupon} />}

        {props.showDisclaimer && (
          <div className="col-12 py-text mt-0 mb-3 text-center">
            <p>By clicking {props.buttonText}, you agree to our{' '} <a href={terms()} target="_blank">Terms of Use</a>{' '}and have read and acknowledge our{' '}<a href={privacyPolicy()} target="_blank">Privacy Policy</a>
              .
            </p>
          </div>
        )}
        {props.type === 'updateCard' && (
          <div className="col-4 mt-3">
            <Link to="/app/setting/subscription-history">
              <Button color="default" block type="reset">
                Cancel
              </Button>
            </Link>
          </div>
        )}
        <div
          className={`${props.type === 'updateCard' ? 'col-8' : 'col-12'} mt-3`}
        >
          <Button
            color="primary"
            block
            disabled={props.isLoading || isLoading}
            type="submit"
          >
            {props.buttonText}{' '}
            {(props.isLoading || isLoading) && (
              <Spinner size="sm" color="default" />
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}

const mapStateToProps = state => {
  return { themeMode: state.themeReducer.themeMode }
}

export default injectStripe(connect(mapStateToProps, {})(CardForm));