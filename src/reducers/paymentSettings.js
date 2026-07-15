import {
  GET_PAYMENT_SETTINGS_SUCCESS,
  SET_PAYMENT_SETTINGS_SUCCESS,
  SET_PAYMENT_STATEMENT_DESCRIPTOR,
  SET_PAYMENT_SETTINGS_LOADING,
  GET_PROCESSING_FEE_SUCCESS,
  SET_PASS_FEE_SUCCESS
} from '../constants/ActionTypes';

const initialSettings = {
  loading: false,
  data: {
    accept_card: false,
    accept_bank: false,
    preferred_mode: false,
    enabled: false,
  },
  statement_descriptor: "",
  processingFee: [],
};

const settings = (state = initialSettings, action) => {
  switch (action.type) {
    case GET_PAYMENT_SETTINGS_SUCCESS:
      return {
        ...state,
        data: {
          ...state.data,
          ...action.data,
        },
        loading: false,
      };
    case SET_PAYMENT_SETTINGS_SUCCESS:
      return {
        ...state,
        data: {
          ...state.data,
          ...action.data,
        },
        loading: false,
      };
    case SET_PAYMENT_STATEMENT_DESCRIPTOR:
      return {
        ...state,
        statement_descriptor: action.data,
      };
    case SET_PAYMENT_SETTINGS_LOADING:
      return {
        ...state,
        loading: action.data,
      };
    case GET_PROCESSING_FEE_SUCCESS:
      return {
        ...state,
        processingFee: action.data,
        loading: false,
      };
    case SET_PASS_FEE_SUCCESS:
      return {
        ...state,
        processingFee: action.data,
        loading: false,
      };
    default:
      return state;
  }
};

export default settings;
