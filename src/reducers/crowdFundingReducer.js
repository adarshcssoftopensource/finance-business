import {
  START_FUNDING_ORDERS_LOADING,
  STOP_FUNDING_ORDERS_LOADING,
  SET_FUNDING_ORDERS, SET_FUNDING_ORDERS_ERROR_STATE
} from "../constants/ActionTypes";

const initialAccount = {
  fundingOrderList: [],
  isFundingOrderLoading: false,
  isError: false,
  errorMessage: ''
}

const crowdFundingReducer = (state = initialAccount, action) => {
  switch (action.type) {
    case START_FUNDING_ORDERS_LOADING: {
      return {
        ...state,
        isError: false,
        isFundingOrderLoading: true
      };
    }
    case STOP_FUNDING_ORDERS_LOADING: {
      return {
        ...state,
        isFundingOrderLoading: false
      };
    }
    case SET_FUNDING_ORDERS_ERROR_STATE:
      return {
        ...state,
        isError: true,
        errorMessage: action.message
      };
    case SET_FUNDING_ORDERS:
      return {
        ...state,
        isError:false,
        fundingOrderList: action.payload,
        errorMessage: action.message
      };
    default:
      return state;
  }
}
export default crowdFundingReducer;
