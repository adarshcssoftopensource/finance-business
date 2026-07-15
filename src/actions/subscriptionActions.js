import { getActivePlan, getBillingHistory } from "../api/subscriptionService";
import { openGlobalSnackbar } from "./snackBarAction";
import * as actionTypes from "../constants/ActionTypes";

export const getActiveSubscriptionPlan = () => {
  return async (dispatch) => {
    dispatch(setSubscriptionLoading());
    try {
      const response = await getActivePlan();
      if (response.statusCode === 200) {
        dispatch({
          type: actionTypes.FETCH_ACTIVE_PLAN,
          payload: response.data
        });
      }
    } catch (error) {
      dispatch(openGlobalSnackbar(error.message, true))
    }
  }
}

export const getSubscriptionBilling = () => {
  return async (dispatch) => {
    dispatch(setBillingLoading())
    try {
      const response = await getBillingHistory();
      if (response.statusCode === 200) {
        dispatch({
          type: actionTypes.FETCH_BILLING_HISTORY,
          payload: response.data
        });
      } else {
        dispatch(openGlobalSnackbar("Couldn't fetch billing history.", true))
      }
    } catch (error) {
      dispatch(openGlobalSnackbar(error.message, true))
    }
  }
}

const setSubscriptionLoading = () => dispatch => {
  dispatch({
    type: actionTypes.SUBSCRIPTION_LOADING
  })
}

const setBillingLoading = () => dispatch => {
  dispatch({
    type: actionTypes.BILLING_LOADING
  })
}