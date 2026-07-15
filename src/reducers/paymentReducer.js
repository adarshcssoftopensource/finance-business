import {
  GET_ALL_PAYMENT_RECORDS,
  GET_PAYMENT_INTERMEDIATE_DATA,
  GET_ALL_REFUND_RECORDS,
  POST_REFUND,
  GET_PAYMENT_BY_ID,
  GET_REFUND_BY_ID,
  CHARGE_CARD_ERROR,
  CHARGE_CARD_LOADING,
  CHARGE_CARD_SUCCESS,
  GET_REFUND_BY_PAYMENT_ID,
  UPDATE_PAYMENT_STATUS,
  STOP_PAYMENT_LOADING,
  GET_ALL_PAYMENT_LOADING,
  GET_ALL_REFUND_LOADING,
  GET_PAYOUT_BALANCE_LOADING,
  GET_PAYOUT_BALANCE_RECORDS,
  SET_PAYPAL_SIGN_UP_PAYLOAD,
  FETCH_PAYPAL_SIGN_UP_PAYLOAD,
  ERROR_PAYPAL_SIGN_UP_PROCESS,
  GET_AVAILABLE_PROVIDER,
  GET_AVAILABLE_PROVIDER_SUCCESS,
  GET_AVAILABLE_PROVIDER_ERROR,
  PAYMENT_SCREEN_LOADING,
  SET_SELECTED_PROVIDER_ERROR,
  SET_SELECTED_PROVIDER_SUCCESS
} from "../constants/ActionTypes";

const initialState = {
  onboardingBody: {},
  verified: false,
  paymentRecords: [],
  paymentData: null,
  paymentIntermediateData: null,
  paymentDataLoaded: false,
  statusCode: 200,
  payPalSignUpPayload: null,
  loading: false,
  availableProvider: [],
  error: "",
  onBoardingSchemaLoading: false,
  providerDataLoading: false
}

const paymentReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_PAYMENT_LOADING':
      return {
        ...state,
        loading: true
      }
      break
    case STOP_PAYMENT_LOADING:
      return {
        ...state,
        loading: false
      }
      break
    case 'FETCH_PAYMENT_STATE':
      return {
        ...state,
        loading: false,
        onboardingBody: action.data ? action.data.business : {}
      }
      break
    case 'VERIFY_ONBOARDING':
      return {
        ...state,
        tosAcceptance: action.data ? action.data : {},
        verified: true,
        error: false
      }
      break
    case 'VERIFY_ONBOARDING_ERROR':
      return {
        ...state,
        tosAcceptance: action.data ? action.data : {},
        verified: false,
        error: true
      }
      break
    case 'GET_ALL_PAYMENT_ERROR':
      return {
        statusCode: action.statusCode ? action.statusCode : 200,
        paymentRecords: null,
        paymentDataLoaded: true,
        message: action.message ? action.message : ''
      }
      break
    case GET_ALL_PAYMENT_LOADING:
      return {
        ...state,
        paymentDataLoaded: false
      }
      break
    case GET_ALL_PAYMENT_RECORDS:
      return {
        ...state,
        paymentRecords:
          action.data && action.data.payments ? action.data.payments : [],
        paymentData: action.data,
        statusCode: action.statusCode ? action.statusCode : 200,
        verified:
          action.data &&
            action.data.verification &&
            action.data.verification.isVerified
            ? true
            : false,
        paymentDataLoaded: true,
        message: action.message ? action.message : ''
      }
      break
    case GET_PAYMENT_INTERMEDIATE_DATA:
      return {
        ...state,
        paymentIntermediateData: action.data,
        paymentDataLoaded: true
      }
      break
    case GET_ALL_REFUND_LOADING:
      return {
        ...state,
        paymentDataLoaded: false
      }
      break
    case GET_ALL_REFUND_RECORDS:
      return {
        ...state,
        refundRecords: action.data.refunds ? action.data.refunds : [],
        refundMeta: action.data.meta,
        paymentDataLoaded:true
      }
      break
    case POST_REFUND:
      return {
        ...state,
        refundInfo: action.data
      }
      break
    case GET_PAYMENT_BY_ID:
      return {
        paymentInfo: action.data.payment
      }
      break
    case GET_REFUND_BY_ID:
      return {
        refundInfo: action.data.refund
      }
      break
    case CHARGE_CARD_SUCCESS:
      return {
        loading: false,
        success: true,
        error: false,
        data: action.payload,
        message: action.message
      }
      break
    case CHARGE_CARD_LOADING:
      return {
        loading: true,
        success: false,
        error: false,
        data: null,
        message: 'loading'
      }
      break
    case CHARGE_CARD_ERROR:
      return {
        loading: false,
        success: false,
        error: true,
        data: action.payload,
        message: action.message
      }
      break
    case GET_REFUND_BY_PAYMENT_ID:
      return {
        loading: false,
        success: true,
        error: false,
        data: action.data,
        refundList: action.data.refunds
      }
    case UPDATE_PAYMENT_STATUS:
      return {
        loading: false,
        success: true,
        error: false,
        updatePayment: action.payload
      }
    case GET_PAYOUT_BALANCE_LOADING:
      return {
        ...state,
        paymentDataLoaded: false
      }
      break
    case GET_PAYOUT_BALANCE_RECORDS:
      return {
        ...state,
        payoutBalance: action.data.balances ? action.data.balances : [],
        paymentDataLoaded:true
      }
      break
    case FETCH_PAYPAL_SIGN_UP_PAYLOAD:
      return {
        ...state,
        onBoardingSchemaLoading: true,
        payPalSignUpPayload: null
      };
      break;
    case SET_PAYPAL_SIGN_UP_PAYLOAD: {
      return {
        ...state,
        onBoardingSchemaLoading: false,
        error: false,
        payPalSignUpPayload: action.payload
      };
      break;
    }
    case ERROR_PAYPAL_SIGN_UP_PROCESS:
      return {
        ...state,
        onBoardingSchemaLoading: false,
        error: action.payload,
        payPalSignUpPayload: null
      };
      break;
    case GET_AVAILABLE_PROVIDER: {
      return {
        ...state,
        loading: true
      };
    }
    case GET_AVAILABLE_PROVIDER_SUCCESS: {
      return {
        ...state,
        availableProvider: action.payload,
        loading: false
      };
    }
    case GET_AVAILABLE_PROVIDER_ERROR: {
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    }
    case PAYMENT_SCREEN_LOADING: {
      return {
        ...state,
        loading: action.payload
      };
    }
    case SET_SELECTED_PROVIDER_SUCCESS:{
      return {
        ...state,
        selectedProvider: action.payload,
        loading: false
      }
    }
    case SET_SELECTED_PROVIDER_ERROR: {
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    }
    default:
      return {
        ...state
      }
      break
  }
}

export default paymentReducer
