import React, { useState, useEffect } from 'react'
import { useStripe } from '@stripe/react-stripe-js'
import paymentService from '../../../../../../api/paymentService'
import WalletButtons from '../../../../../../global/WalletButtons';
// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const WalletOption = props => {
  const { invoiceData, refreshData, showSnackbar, openAlert, salesSetting } = props
  const stripe = useStripe()
  const [paymentRequest, setPaymentRequest] = useState(null)
  const [tooltipAppleOpen, setTooltipAppleOpen] = useState(false);
  const [tooltipGoogleOpen, setTooltipGoogleOpen] = useState(false);
  const [applePay, setapplePay]= useState(false);
  const toggleApple = () => setTooltipAppleOpen(!tooltipAppleOpen);
  const toggleGoogle = () => setTooltipGoogleOpen(!tooltipGoogleOpen);
  const proceedToPay = event => {
    const { token } = event
    if (!!token && !!token.id) {
      let paymentBody = {
        paymentInput: {
          uuid: invoiceData.uuid,
          stripeToken: token.id,
          amount: invoiceData.dueAmount,
          rawElementResponse: JSON.stringify(token),
          method: 'card',
          saveCard: false,
          cardHolderName: token.card.name
        }
      }
      paymentCallback(paymentBody, token, event)
    } else {
      props.showSnackbar(
        'Failed to establish secure connection for payment. Please try again.',
        true
      )
    }
  }

  const paymentCallback = async (_checkoutPayment, token, event) => {
    try {
      let response = await paymentService.chargeEmailService(_checkoutPayment)
      if (response.statusCode === 200) {
        stripe
          .confirmCardPayment(response.data.paymentIntent.client_secret, {
            save_payment_method: response.data.shouldCardSave,
            payment_method: {
              card: {
                token: token.id
              },
              billing_details: {
                name: token.card.name
              }
            }
          })
          .then(async data => {
            try {
              if (data.error) {
                throw Error(data.error.message)
              }
              let res = null
              let time = setInterval(async () => {
                res = await paymentService.updatePaymentStatusPid(
                  response.data.paymentIntent.id
                )
                if (!!res && res.data && res.data.status !== 'PENDING') {
                  event.complete('success')
                  response.data.paymentResponse.status = res.data.status
                  clearInterval(time)
                  refreshData()
                  openAlert(response.data.paymentResponse, 0)
                }
              }, 5000)
              // this.setState({ successPaid: true, loading: false })
              event.complete('success')
              openAlert(response.data.paymentResponse, 0)
              refreshData()
            } catch (error) {
              showSnackbar(error.message, true)
            }
          })
      } else {
        event.complete('fail')
        showSnackbar(response.message, true)
      }
    } catch (error) {
      event.complete('fail')
      showSnackbar(error.message, true)
    }
  }

  useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: invoiceData.stripeCountry,
        currency: invoiceData.currency.code.toLowerCase(),
        total: {
          label: ` ${salesSetting.invoiceSetting.defaultTitle ? salesSetting.invoiceSetting.defaultTitle :"Invoice"  +" "+ invoiceData.invoiceNumber}`,
          amount: parseInt(invoiceData.dueAmount * 100)
        },
        requestPayerName: true,
        requestPayerEmail: true
      })

      // Check the availability of the Payment Request API.
      pr.canMakePayment().then(result => {
        if (result) {
          setapplePay(result.applePay);
          setPaymentRequest(pr)
        }
      })
      pr.on('token', async event => {
        // event.token is available
        if (event.token) {
          proceedToPay(event)
        }
      })
    }
  }, [stripe])

  if (paymentRequest){   
// Use a traditional checkout form.
  return (
    <WalletButtons
    applePay={applePay} paymentRequest={paymentRequest} tooltipAppleOpen={tooltipAppleOpen} toggleApple={toggleApple} tooltipGoogleOpen={tooltipGoogleOpen} toggleGoogle={toggleGoogle}
    />
    )
  } else {
  // Use a traditional checkout form.
  return ( <WalletButtons
    applePay={applePay} paymentRequest={paymentRequest} tooltipAppleOpen={tooltipAppleOpen} toggleApple={toggleApple} tooltipGoogleOpen={tooltipGoogleOpen} toggleGoogle={toggleGoogle}
    />)
  }

}

export default WalletOption;