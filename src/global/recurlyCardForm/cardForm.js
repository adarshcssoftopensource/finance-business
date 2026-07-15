import React, { useEffect, useState } from 'react'
import { CardElement, ThreeDSecureAction, useRecurly } from '@recurly/react-recurly';
import { Spinner, Button } from 'reactstrap'
import { Link } from 'react-router-dom'
import FormValidationError from '../FormValidationError'
import { terms, privacyPolicy } from '../../utils/GlobalFunctions';
import Summary from './summary'
import { connect } from 'react-redux'
import { fetchCountries } from '../../actions/CustomerActions';
import './index.scss'

const CardForm = props => {
  const [cardNumberErr, setCardNumberErr] = useState({
    msg: 'Enter valid card number.',
    isError: false
  })
  const [cardExpiryErr, setCardExpiryErr] = useState({
    msg: 'Invalid expiration date.',
    isError: false,
  })

  const [billingAddressErr, setBillingAddressError] = useState({})
  const [threeDActionResultToken, setThreeDActionResultToken] = useState('')
  const [threeDError, setThreeDError] = useState(false)
  const [paymentToken, setPaymentToken] = useState('')
  const [firstNameErr, setFirstNameErr] = useState(false)
  const [lastNameErr, setLastNameErr] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [countries, setCountries] = useState([]);
  const [billingAddress, setBillingAddress] = useState({
    address1: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  const allBillingFields = [
    { name: 'address1', label: 'Address' },
    { name: 'city', label: 'City' },
    { name: 'state', label: 'State' },
    { name: 'postalCode', label: 'Postal Code', recurlyName: 'postal_code' },
    { name: 'country', label: 'Country', inputType: 'select' },
  ];

  const [couponCode, setCouponCode] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const formRef = React.useRef();
  const recurly = useRecurly();

  useEffect(() => {
    const fetchAllCountries = async () => {
      const countriesList = await fetchCountries();
      const countryNames = countriesList.map(country => country.name);
      setCountries(countryNames);
      setBillingAddress({
        ...billingAddress,
        country: countryNames?.[0]
      })
    }
    fetchAllCountries();
  }, []);

  const handleFirstName = e => {
    setFirstName(e.target.value)
  }

  const handleLastName = e => {
    setLastName(e.target.value)
  }

  const handleBillingAddress = (e) => {
    setBillingAddress({
      ...billingAddress,
      [e.target.name]: e.target.value
    })
  }

  const resetError = () => {
    setFirstNameErr(false)
    setLastNameErr(false)
    setCardNumberErr({ msg: '', isError: false })
    setCardExpiryErr({ msg: '', isError: false })
    setBillingAddressError({})
  }

  const handleError = (error) => {
    const { fields, code, message } = error
    if (fields?.length) {
      if (code === 'validation') {
        if (code === 'validation') {
          if (fields.includes('month') || fields.includes('year')) {
            setCardExpiryErr({ ...cardExpiryErr, isError: true })
          } else {
            setCardExpiryErr({ msg: '', isError: false }) // Clear expiry if not in fields
          }
        }
        if (fields.includes('number')) {
          setCardNumberErr({
            ...cardNumberErr,
            isError: true,
          })
        } else {
          setCardNumberErr({ msg: '', isError: false }) // Clear card number if not in fields
        }
      } else if (code === 'invalid-parameter') {
        setCardNumberErr({ msg: message, isError: true })
      } else {
        setCardNumberErr({ isError: false })
        props.showMessage(error.message, true)
      }
    }
  }

  const handleSubmit = async event => {
    event.preventDefault();
    resetError();
    if (!firstName) {
      setFirstNameErr(true)
    }
    if (!lastName) {
      setLastNameErr(true)
    }

    let billingAddressErrObj = {};
    allBillingFields?.map(field => {
      if (!billingAddress[field.name]) {
        billingAddressErrObj = {
          ...billingAddressErrObj,
          [field.name]: `Enter valid ${[field.label]}.`
        }
      }
    });
    setBillingAddressError(billingAddressErrObj)

    setIsLoading(true)
    if (threeDActionResultToken) {
      try {
        await props.getCardDetails({
          cardHolderName: firstName + ' ' + lastName,
          couponCode,
          paymentMethodId: paymentToken,
          threeDSecureToken: threeDActionResultToken
        })
        setIsLoading(false)
      } catch (error) {
        console.log("CHECK ERROR 98", error)
        setIsLoading(false)
        props.showMessage(error.message, true)
      }
      return;
    }
    recurly.token(formRef.current, (err, token) => {
      if (err) {
        setIsLoading(false)
        console.log("Err", err)
        handleError(err)
      } else {
        try {
          setPaymentToken(token?.id)
          props.getCardDetails({
            cardHolderName: firstName + ' ' + lastName,
            couponCode,
            paymentMethodId: token?.id,
          })
          setIsLoading(false)
        } catch (error) {
          console.log("CHECK ERROR 119", error)
          setIsLoading(false)
          props.showMessage(error.message, true)
        }
      }
    });
  }

  const setCoupon = (couponCode) => {
    setCouponCode(couponCode)
  }

  const hideAuthenticationView = () => {
    if (document?.getElementById('threeDSContainer')) {
      document.getElementById('threeDSContainer').style.display = 'none'
    }
  }

  const handle3DToken = threeDActionResultToken => {
    setThreeDActionResultToken(threeDActionResultToken?.id);
    hideAuthenticationView();
  }

  const handle3DError = err => {
    if (err?.message) {
      hideAuthenticationView();
      setThreeDError(true);
      props.showMessage(err?.message, true);
    }
  }

  const buttonLabel = props.buttonText || 'Buy Credits';

  return (
    <form ref={formRef} className="billing-details-form" onSubmit={handleSubmit}>
      {/* We might need to show this later when we turn on SAVED CARDs feature again. */}
      {/* {props.cards &&
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
        )} */}
      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="form-group mb-0">
            <label
              htmlFor="firstName"
              className="py-form-field__label is-required"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              data-recurly="first_name"
              name="firstName"
              placeholder="First Name"
              className="form-control"
              value={firstName}
              onChange={handleFirstName}
            />
            <FormValidationError showError={firstNameErr} message='Enter first name.' />
          </div>
        </div>
        <div className="col-lg-6 mb-4">
          <div className="form-group mb-0">
            <label
              htmlFor="lastName"
              className="py-form-field__label is-required"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              data-recurly="last_name"
              name="lastName"
              placeholder="Last Name"
              className="form-control"
              value={lastName}
              onChange={handleLastName}
            />
            <FormValidationError showError={lastNameErr} message='Enter last name.' />
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
            <CardElement />
            {props?.threeDActionTokenId &&
              <ThreeDSecureAction
                id='threeDSContainer'
                actionTokenId={props?.threeDActionTokenId}
                onToken={handle3DToken}
                onError={handle3DError}
              />
            }
            <FormValidationError
              showError={cardNumberErr.isError || cardExpiryErr.isError}
              message={cardNumberErr.msg || cardExpiryErr.msg}
            />
          </div>
        </div>
        {allBillingFields?.map(field => (
          <div className={`col-sm-${field.name.startsWith('address') ? '12' : '6'} mb-4`}>
            <div className="form-group mb-0">
              <label
                forhtml={field.name}
                className="py-form-field__label is-required"
              >
                {field.label}
              </label>
              {field?.inputType === 'select' ?
                <select
                  name={field.name}
                  placeholder={`Select a ${field.label}`}
                  data-recurly={field?.recurlyName || field?.name}
                  value={billingAddress[field.name]}
                  className="form-control stripe-form-control mb-0"
                  onChange={handleBillingAddress}
                >
                  {countries?.map(country => (
                    <option value={country}>{country}</option>
                  ))}
                </select>
                :
                <input
                  type="text"
                  name={field.name}
                  data-recurly={field?.recurlyName || field?.name}
                  placeholder={field.label}
                  className="form-control stripe-form-control mb-0"
                  value={billingAddress[field.name]}
                  onChange={handleBillingAddress}
                />
              }
              <FormValidationError
                showError={billingAddressErr[field.name]}
                message={billingAddressErr[field.name]}
              />
            </div>
          </div>
        ))}

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
            disabled={props.isLoading || isLoading || (props?.threeDActionTokenId && !threeDActionResultToken && !threeDError)}
            type="submit"
          >
            {buttonLabel}
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

export default connect(mapStateToProps, {})(CardForm);