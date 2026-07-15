import {
  SET_FUNDING_ORDERS,
  SET_FUNDING_ORDERS_ERROR_STATE,
  START_FUNDING_ORDERS_LOADING,
  STOP_FUNDING_ORDERS_LOADING
} from '../constants/ActionTypes';
import CrowdFundingServices from '../api/CrowdFundingServices';

export function getFundingOrdersItems(fundingUUid, showOnlyActive) {
  return async (dispatch) => {
    dispatch({ type: START_FUNDING_ORDERS_LOADING });
    let queryParams = ""
    if(!showOnlyActive) {
      queryParams = "?status=all"
    }
    return CrowdFundingServices.getCrowdFundingOrderItems(fundingUUid, queryParams)
      .then((statementResponse) => {
        if (statementResponse.statusCode === 200) {
          dispatch({
            type: SET_FUNDING_ORDERS,
            payload: statementResponse.data
          });
          dispatch({ type: STOP_FUNDING_ORDERS_LOADING });
          return statementResponse;
        }
        dispatch({ type: STOP_FUNDING_ORDERS_LOADING });
      })
      .catch((error) => {
        dispatch({
          type: SET_FUNDING_ORDERS_ERROR_STATE,
          message: error.message
        });
        dispatch({ type: STOP_FUNDING_ORDERS_LOADING });
      });
  };
}

export function cancelOrderPayments(fundingUUid, orderUUid, showOnlyActive) {
  return async (dispatch) => {
    dispatch({ type: START_FUNDING_ORDERS_LOADING });
    return CrowdFundingServices.updateCrowdFundingOrderItems(fundingUUid, orderUUid)
      .then((statementResponse) => {
        if (statementResponse.statusCode === 200) {
          dispatch(getFundingOrdersItems(fundingUUid, showOnlyActive));
          // dispatch({ type: STOP_FUNDING_ORDERS_LOADING });
          return statementResponse;
        }
        dispatch({ type: STOP_FUNDING_ORDERS_LOADING });
      })
      .catch((error) => {
        dispatch({
          type: SET_FUNDING_ORDERS_ERROR_STATE,
          message: error.message
        });
        dispatch({ type: STOP_FUNDING_ORDERS_LOADING });
      });
  };
}
