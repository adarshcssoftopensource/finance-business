
import * as Services from "../api/payoutServices";
import * as actionTypes from "../constants/ActionTypes";

export const getAllPayout = (query) => {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.GET_ALL_PAYOUT_LOADING, payload: null, message: 'Loading' });
    try {
      let res = await Services.getAllPayout(query);
      if (res.statusCode === 200) {
        return dispatch({ type: actionTypes.GET_ALL_PAYOUT_SUCCESS, message: res.message, payload: res.data })
      } else {
        return dispatch({ type: actionTypes.GET_ALL_PAYOUT_ERROR, payload: res.data, message: res.message })
      }
    } catch (err) {
      return dispatch({ type: actionTypes.GET_ALL_PAYOUT_ERROR, payload: err, message: err.message })
    }
  }
};

export const getPayoutDetailsByID = (query) => {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.GET_ALL_PAYOUT_LOADING, payload: null, message: 'Loading' });
    try {
      let res = await Services.getSinglePayoutById(query);
      if (res.statusCode === 200) {
        return dispatch({ type: actionTypes.GET_SINGLE_PAYOUT_SUCCESS, message: res.message, payload: res.data })
      } else {
        return dispatch({ type: actionTypes.GET_SINGLE_PAYOUT_ERROR, payload: res.data, message: res.message })
      }
    } catch (err) {
      return dispatch({ type: actionTypes.GET_SINGLE_PAYOUT_ERROR, payload: err, message: err.message })
    }
  }
};
