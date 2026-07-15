import {
  START_DEVICE_SESSION_LOADING,
  STOP_DEVICE_SESSION_LOADING,
  SET_SESSION_ERROR_STATE, SET_MY_DEVICE_SESSION

} from "../constants/ActionTypes";

const initialAccount = {
  sessions: [],
  isLoading: false,
  isError: false,
  errorMessage: ''
}

const deviceSessionReducer = (state = initialAccount, action) => {
  switch (action.type) {
    case START_DEVICE_SESSION_LOADING: {
      return {
        ...state,
        isError: false,
        isLoading: true
      };
    }
    case STOP_DEVICE_SESSION_LOADING: {
      return {
        ...state,
        isLoading: false
      };
    }
    case SET_SESSION_ERROR_STATE:
      return {
        ...state,
        isError: true,
        errorMessage: action.message
      };
    case SET_MY_DEVICE_SESSION:
      return {
        ...state,
        isError:false,
        sessions: action.payload,
        errorMessage: action.message
      };
    default:
      return state;
  }
}


export default deviceSessionReducer
