import React, { useState, useEffect } from 'react'
import { connect, useDispatch, useSelector } from 'react-redux'
import { getPlans } from '../../api/plansService'
import {
  createCustomerAndSubscription,
  updateSubscription,
  applyCoupon
} from '../../api/subscriptionService'
import { getPaymentCards } from '../../api/subscriptionService'
import CenterSpinner from '../../global/CenterSpinner'
import BrowserTabTitle from '../../global/browserTabTitle'
import { openGlobalSnackbar } from '../../actions/snackBarAction'
import { setSelectedBussiness } from '../../actions/businessAction'
import RecurlyCardForm from '../recurlyCardForm'
import PlanDetails from './planDetails'
import ActiveCard from './activeCard'
import history from '../../customHistory'
import { getActiveSubscriptionPlan } from '../../actions/subscriptionActions'
import { useLocation } from 'react-router-dom'

const Index = ({
  from = null,
  planId = null,
  businessInfo,
  showSnackbar,
  setSelectedBussiness,
  planType = null
}) => {
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const subscription = useSelector(state => state?.subscriptionReducer)
  const currentPlanLevel = subscription?.activeSubscription?.current?.planLevel;
  const currentSubscriptionId = subscription?.activeSubscription?.current?._id;
  const [plans, setPlans] = useState(null)
  const [threeDActionTokenId, setThreeDActionTokenId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('Premium Pro')
  const [planPeriod, setPlanPeriod] = useState('monthly')
  const [activeCard, setActiveCard] = useState(false)
  const [cards, setCards] = useState(null)
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem('businessId')) {
      initialFun()
    } else {
      history.push('signin')
    }
  }, [planPeriod])

  const handleDifferentCard = () => {
    setActiveCard(!activeCard)
  }

  const initialFun = async () => {
    if (planId) {
      const getCards = await getPaymentCards()
      setCards(getCards.data)
      if (getCards.data.length > 0) {
        setActiveCard(true)
      }
    }

    const plansResponse = await getPlans(planPeriod)
    setPlans(plansResponse.data)
  }

  const getSelectedPlan = data => {
    setSelectedPlan(data)
  }

  const handleSubscribe = async (data = null) => {
    setIsLoading(true)
    try {
      if (selectedPlan?.planLevel === 1 && !history?.location?.pathname.includes("/subscription-update/")) {
        history.push('thankyou')
        return;
      }
      const dataObj = {
        paymentMethodId: data.paymentMethodId || 'Starter',
        cardHolderName: data.cardHolderName || 'Starter',
        planId: selectedPlan._id,
        businessId: localStorage.getItem('businessId'),
        userId: localStorage.getItem('user.id'),
        couponCode: data.couponCode ? data.couponCode : null,
      }

      if (data?.threeDSecureToken) {
        dataObj.threeDSecureToken = data?.threeDSecureToken
      }
      let response

      const shouldUpdatePlan = planId && currentPlanLevel > 1
      // Check if planId for update subscription
      if (shouldUpdatePlan) {
        dataObj['cardHolderName'] = data.cardHolderName
          ? data.cardHolderName
          : ''
        dataObj['paymentMethodId'] = data.paymentMethodId
          ? data.paymentMethodId
          : ''
        dataObj['subscriptionId'] = currentSubscriptionId
        delete dataObj.businessId
        response = await updateSubscription(dataObj)
      } else {
        // create subscription
        response = await createCustomerAndSubscription(dataObj)
        setTimeout(() => {
          dispatch(getActiveSubscriptionPlan());
        }, 3000);
      }

      if (response.statusCode === 201 || response.statusCode === 200) {
        if (planId) {
          const authToken = localStorage.getItem('token')
          setSelectedBussiness(
            localStorage.getItem('businessId'),
            authToken,
            false
          )
          setTimeout(() => {
            showSnackbar(response.message, false)
            history.push({
              pathname: '/app/setting/subscription-history',
              state: 'update'
            })
            setIsLoading(false)
          }, 3000);
        } else {
          history.push('thankyou')
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
        showSnackbar(response.message, false)
        throw Error(response.message)
      }
    } catch (error) {
      const errorMessage = error?.message || error?.data?.message;
      if (errorMessage) {
        if (errorMessage?.startsWith('three_d_secure_action_required')) {
          setThreeDActionTokenId(errorMessage?.split(':')?.[1])
        }
      }
      setIsLoading(false)
      showSnackbar(errorMessage, true)
    }
  }

  const handleChange = (e) => {
    const getChangedPlan = plans.find((plan) => plan.title === e.target.value)
    getSelectedPlan(getChangedPlan)
    setSelectedPlan(getChangedPlan)
  }

  const handleMessage = (data, type) => {
    showSnackbar(data, type)
  }

  return (
    <div className={`${from == 'update' ? '' : 'subs-checkout'}`}>
      <BrowserTabTitle title="Subscription" />
      {plans ? (
        <React.Fragment>
          <div className="row mb-3 mb-lg-4">
            <div class="py-header--title mt-0 col-12">
              <h2 class="py-heading--title text-center">Subscription details</h2>
            </div>
          </div>
          <div className='text-center'>
            <div className='subscription-select-option'>
              {plans && !planId && selectedPlan && plans.map((plan) => (<label kye={plan._id} class="select-button">
                <input type="radio" name="pricePlan" checked={selectedPlan.title === plan.title} onChange={handleChange} value={plan.title} />
                <span class="select-check"></span>
                <span class="select-title">{plan.title}</span>
              </label>))}
            </div>
          </div>
          <div className="row mx-n4">
            <div
              className={`${selectedPlan?.planLevel === 1
                  ? 'col-lg-12 mx-auto'
                  : 'col-lg-5'
                } px-4 mb-4`}
            >
              <PlanDetails
                plans={plans}
                getSelectedPlan={getSelectedPlan}
                selectedPlan={selectedPlan}
                isLoading={isLoading}
                getCardDetails={handleSubscribe}
                planId={planId}
                buttonText={from == 'update' ? 'Modify Plan' : 'Get Started'}
                businessInfo={businessInfo}
                planType={planType}
                planPeriod={planPeriod}
                setPlanPeriod={setPlanPeriod}
                from={from}
              />
            </div>
            <div
              className={`col-lg-7 px-4 ${selectedPlan?.planLevel !== 1
                  ? 'd-block mt-5 mt-lg-0'
                  : 'd-none'
                }`}
            >
             
                  <RecurlyCardForm
                    type="subscribe"
                    buttonText={
                      from == 'update' ? 'Modify Plan' : 'Subscribe now'
                    }
                    showDisclaimer={true}
                    isLoading={isLoading}
                    cards={cards}
                    planDetails={selectedPlan}
                    showMessage={handleMessage}
                    handleDifferentCard={handleDifferentCard}
                    getCardDetails={data => handleSubscribe(data)}
                    threeDActionTokenId={threeDActionTokenId}
                  />
                {/* )} */}
            </div>
          </div>
        </React.Fragment>
      ) : (
          <div className="mx-auto py-5">
            <CenterSpinner />
          </div>
        )}
    </div>
  )
}

const mapPropsToState = ({ businessReducer }) => ({
  businessInfo: businessReducer.selectedBusiness
})

const mapDispatchToProps = dispatch => {
  return {
    showSnackbar: (message, error) => {
      dispatch(openGlobalSnackbar(message, error))
    },
    setSelectedBussiness: (data, token, redirect) => {
      dispatch(setSelectedBussiness(data, token, redirect))
    }
  }
}
export default connect(mapPropsToState, mapDispatchToProps)(Index)
