import { BILLING_LOADING, FETCH_ACTIVE_PLAN, FETCH_BILLING_HISTORY, SUBSCRIPTION_LOADING } from '../constants/ActionTypes';

const initialState = {
  subscriptionLoading: false,
  activeSubscription: {},
  billingLoading: false,
  billing: {}
}

const subscriptionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUBSCRIPTION_LOADING:
      return {
        ...state,
        subscriptionLoading: true,
      }
    case FETCH_ACTIVE_PLAN:
      return {
        ...state,
        activeSubscription: action.payload,
        subscriptionLoading: false,
      }
    case BILLING_LOADING:
      return {
        ...state,
        billingLoading: true,
      }
    case FETCH_BILLING_HISTORY:
      return {
        ...state,
        billing: action.payload,
        billingLoading: false
      }
    default:
      return state;
  }
}

export default subscriptionReducer