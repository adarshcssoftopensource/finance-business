import { isEmpty } from 'lodash'
import PaymentServices from '../api/paymentService'
import * as actionTypes from '../constants/ActionTypes'
import { openGlobalSnackbar } from './snackBarAction'
import history from '../customHistory'
import { fetchPaymentSettings, getPaymentSettings } from "./paymentSettings";
import { fetchPaymentSetting } from "../api/SettingService";
import BannerService from '../api/bannerService'
import { ERROR_PAYPAL_SIGN_UP_PROCESS } from "../constants/ActionTypes";
import { fetchAllBannerList } from './utilityAction'

export const addBodyToPayment = data => async dispatch => {
  dispatch({ type: actionTypes.ADD_PAYMENT_LOADING, payload: null })
  try {
    let response = await PaymentServices.patchPayment(data)
    dispatch({ type: actionTypes.STOP_PAYMENT_LOADING, payload: null })
    if (response.statusCode !== 200) {
      throw Error(response.message)
    } else {
      if (!isEmpty(response.data)) {
        dispatch({
          type: actionTypes.FETCH_PAYMENT_STATE,
          data: response.data
        })
      }
      return response
    }
  } catch (error) {
    dispatch(openGlobalSnackbar(error.message, true))
    dispatch({ type: actionTypes.STOP_PAYMENT_LOADING, payload: null })
    throw Error(error.message)
  }
}

export function getOnboardingStatus() {
  return function(dispatch, getState) {
    return PaymentServices.fetchPayment()
      .then(addOnboardingResponse => {
        if (addOnboardingResponse.statusCode === 200) {
          return dispatch({
            type: actionTypes.FETCH_PAYMENT_STATE,
            data: addOnboardingResponse.data
          })
        } else if (
          !addOnboardingResponse ||
          addOnboardingResponse.statusCode === 351
        ) {
          return dispatch({
            type: actionTypes.FETCH_PAYMENT_STATE,
            data: []
          })
        }
      })
      .catch(errorResposne => {
        return errorResposne.data
      })
  }
}

export const verifyPaymentOnboarding = tos_args => {
  return async dispatch => {
    dispatch({ type: actionTypes.ADD_PAYMENT_LOADING, payload: null })
    try {
      let response = await PaymentServices.verify(tos_args)
      if (response.statusCode === 200) {
        return dispatch({
          type: actionTypes.VERIFY_ONBOARDING,
          data: response.data
        })
      } else {
        dispatch(openGlobalSnackbar(response.error.message, true))
        return dispatch({
          type: actionTypes.VERIFY_ONBOARDING_ERROR,
          data: response.data
        })
      }
    } catch (errorResposne) {
      dispatch(openGlobalSnackbar(errorResposne.message, true))
      return dispatch({
        type: actionTypes.VERIFY_ONBOARDING_ERROR,
        data: errorResposne
      })
    }
  }
}

export function getPaymentById(id) {
  return function(dispatch, getState) {
    return PaymentServices.getPaymentById(id)
      .then(paymentResponse => {
        if (paymentResponse.statusCode === 200) {
          return dispatch({
            type: actionTypes.GET_PAYMENT_BY_ID,
            data: paymentResponse.data
          })
        } else if (paymentResponse.statusCode === 400) {
          history.push(`${process.env.REACT_APP_WEB_URL}/app/400`)
        } else {
          history.push(`${process.env.REACT_APP_WEB_URL}/app/error/500`)
        }
      })
      .catch(errorResposne => {})
  }
}

export function getAllPayments(dataObj) {
  return function(dispatch, getState) {
    dispatch({
      type: actionTypes.GET_ALL_PAYMENT_LOADING,
      payload: null
    })
    return PaymentServices.getAllPayments(dataObj)
      .then(paymentResponse => {
        if (paymentResponse.statusCode === 200) {
          return dispatch({
            type: actionTypes.GET_ALL_PAYMENT_RECORDS,
            data: paymentResponse.data,
            message: paymentResponse.message,
            statusCode: paymentResponse.statusCode
          })
        } else if (paymentResponse.statusCode === 351) {
          return dispatch({
            type: 'GET_ALL_PAYMENT_ERROR',
            data: [],
            message: paymentResponse.message,
            statusCode: paymentResponse.statusCode
          })
        } else if (paymentResponse.statusCode === 351) {
          return dispatch({
            type: 'GET_ALL_PAYMENT_ERROR',
            data: [],
            message: paymentResponse.message,
            statusCode: paymentResponse.statusCode
          })
        }
      })
      .catch(errorResposne => {
        return dispatch({
          type: 'GET_ALL_PAYMENT_ERROR',
          data: errorResposne,
          message: 'No Data',
          statusCode: errorResposne.statusCode
        })
      })
  }
}

export function getRefundById(id) {
  return function(dispatch, getState) {
    return PaymentServices.getRefundById(id)
      .then(refundResponse => {
        if (refundResponse.statusCode === 200) {
          return dispatch({
            type: actionTypes.GET_REFUND_BY_ID,
            data: refundResponse.data
          })
        }
      })
      .catch(errorResposne => {})
  }
}

export function getRefundByPaymentId(id) {
  return function(dispatch, getState) {
    return PaymentServices.getRefundByPaymentId(id)
      .then(refundResponse => {
        if (refundResponse.statusCode === 200) {
          return dispatch({
            type: actionTypes.GET_REFUND_BY_PAYMENT_ID,
            data: refundResponse.data
          })
        }
      })
      .catch(errorResposne => {})
  }
}

export function getAllRefunds(tos_args) {
  return function(dispatch, getState) {
    dispatch({
      type: actionTypes.GET_ALL_REFUND_LOADING,
      payload: null
    })
    return PaymentServices.getAllRefunds(tos_args)
      .then(refundResponse => {
        if (refundResponse.statusCode === 200) {
          return dispatch({
            type: actionTypes.GET_ALL_REFUND_RECORDS,
            data: refundResponse.data
          })
        }
      })
      .catch(errorResposne => {})
  }
}

export function getPayoutBalance() {
  return function(dispatch, getState) {
    dispatch({
      type: actionTypes.GET_PAYOUT_BALANCE_LOADING,
      payload: null
    })
    return PaymentServices.getPayoutBalance()
      .then(payoutBalanceResponse => {
        if (payoutBalanceResponse.statusCode === 200) {
          return dispatch({
            type: actionTypes.GET_PAYOUT_BALANCE_RECORDS,
            data: payoutBalanceResponse.data
          })
        }
      })
      .catch(errorResposne => {})
  }
}

export function postNewRefund(body) {
  return function(dispatch, getState) {
    return PaymentServices.createRefund(body)
      .then(refundResponse => {
        if (refundResponse.statusCode === 200) {
          dispatch(
            openGlobalSnackbar('Refund has been initiated successfully', false)
          )
          dispatch({
            type: actionTypes.POST_REFUND,
            data: refundResponse.data
          })
          return refundResponse;
        }
      })
      .catch(errorResposne => {
        dispatch(openGlobalSnackbar(errorResposne.message, true))
        return errorResposne
      })
  }
}

export const chargeCard = body => {
  return async dispatch => {
    dispatch({ type: actionTypes.CHARGE_CARD_LOADING })
    try {
      let chargeCardRes = await PaymentServices.chargeCardService(body)
      if (chargeCardRes.statusCode === 200) {
        return dispatch({
          type: actionTypes.CHARGE_CARD_SUCCESS,
          payload: chargeCardRes.data,
          message: chargeCardRes.message
        })
      } else {
        return dispatch({
          type: actionTypes.CHARGE_CARD_ERROR,
          payload: chargeCardRes.data,
          message: chargeCardRes.message
        })
      }
    } catch (err) {
      return dispatch({
        type: actionTypes.CHARGE_CARD_ERROR,
        payload: err,
        message: 'Something went wrong.'
      })
    }
  }
}

export const updatePaymentStatus = (data, paymentId) => async dispatch => {
  try {
    const updatePayment = await PaymentServices.updatePaymentStatus(
      data,
      paymentId
    )
    if (updatePaymentStatus === 200) {
      dispatch({
        type: actionTypes.UPDATE_PAYMENT_STATUS,
        payload: updatePayment.data
      })
    }
  } catch (error) {
    dispatch(openGlobalSnackbar(error.message, true))
  }
}

export const updatePaymentStatusPid = paymentId => async dispatch => {
  try {
    const updatePayment = await PaymentServices.updatePaymentStatusPid(
      paymentId
    )
    if (updatePaymentStatus === 200) {
      dispatch({
        type: actionTypes.UPDATE_PAYMENT_STATUS,
        payload: updatePayment.data
      })
    }
  } catch (error) {
    dispatch(openGlobalSnackbar(error.message, true))
  }
}

export const attachCardToCustomer = data => async dispatch => {
  try {
    const response = await PaymentServices.attachCard(data)
    if (response.statusCode !== 200) {
      throw Error(data.message)
    }
  } catch (error) {
    dispatch(openGlobalSnackbar(error.message, true))
    throw Error(error.message)
  }
}

export const turnOnPaymentsForBussiness = () => async dispatch => {
  try {
    const response = await PaymentServices.turnOnPayments()
    if (response.statusCode !== 200) {
      throw Error(response.message)
      return response.statusCode
    }
    return response
  } catch (error) {
    dispatch(openGlobalSnackbar(error.message, true))
    throw Error(error.message)
  }
}

export const addBusinessinLegal = () => async dispatch => {
  try {
    const data = await PaymentServices.addBusinessInLegals()
    if (data.statusCode !== 200) {
      throw Error(data.message)
    }
  } catch (error) {
    dispatch(openGlobalSnackbar(error.message, true))
    throw Error(error.message)
  }
}

export const createPersonInStripe = data => async dispatch => {
  try {
    const data = await PaymentServices.createPerson(data)
    if (data.statusCode !== 200) {
      throw Error(data.message)
    }
  } catch (error) {
    dispatch(openGlobalSnackbar(error.message, true))
    throw Error(error.message)
  }
}

export function fetchKycUrl(callback) {
  return async dispatch => {
    try {
      const response = await PaymentServices.getKycUrl()
      callback(response)
    } catch (e) {
      callback(e)
    }
  }
}

export const skipStepOnboarding = () => async dispatch => {
  dispatch({ type: actionTypes.ADD_PAYMENT_LOADING, payload: null })
  try {
    const res = await PaymentServices.skipStep()
    if (res.statusCode == 200) {
      return dispatch({
        type: actionTypes.FETCH_PAYMENT_STATE,
        data: res.data
      })
    }
  } catch (error) {
    dispatch(openGlobalSnackbar(error.message, true))
    throw Error(error.message)
  }
}

export const updateStatusStepThree = () => async dispatch => {
  dispatch({ type: actionTypes.ADD_PAYMENT_LOADING, payload: null })
  try {
    const res = await PaymentServices.updateOnboardingStepStatus()
    if (res.statusCode == 200) {
      return dispatch({
        type: actionTypes.FETCH_PAYMENT_STATE,
        data: res.data
      })
    }
  } catch (error) {
    dispatch(openGlobalSnackbar(error.message, true))
    throw Error(error.message)
  }
}

export const fetchPayPalOnBoardingUrl = () => {
  return async (dispatch) => {
    dispatch({ type: actionTypes.FETCH_PAYPAL_SIGN_UP_PAYLOAD, payload: null })
    try {
      const res = await PaymentServices.requestPayPalSignUp();
      if (res.statusCode == 200) {
        return dispatch({
          type: actionTypes.SET_PAYPAL_SIGN_UP_PAYLOAD,
          payload: res.data
        })
      }
    } catch (error) {
      dispatch(openGlobalSnackbar(error.message, true))
      dispatch({
        type:actionTypes.ERROR_PAYPAL_SIGN_UP_PROCESS,
        payload: error.message
      });
      // throw Error(error.message)
    }
  }
}

export const getAvailableProviders = (businessId) => {
  return async (dispatch) => {
    try {
      dispatch({
        type: actionTypes.GET_AVAILABLE_PROVIDER
      });
      const res = await PaymentServices.requestAvailableProvider(businessId);
      if (res?.statusCode === 203) {
        if (res?.data?.providerName) {
          return dispatch({
            type: actionTypes.SET_SELECTED_PROVIDER_SUCCESS,
            payload: res?.data ?? {}
          });
        }
      } else if (res?.statusCode === 200) {
        return dispatch({
          type: actionTypes.GET_AVAILABLE_PROVIDER_SUCCESS,
          payload: res?.data ?? []
        });
      }
      dispatch(openGlobalSnackbar(res?.message, true))
      dispatch({
        type: actionTypes.GET_AVAILABLE_PROVIDER_ERROR,
        payload: res?.message ?? ""
      });
    } catch (error) {
      dispatch(openGlobalSnackbar(error.message, true))
      dispatch({
        type: actionTypes.GET_AVAILABLE_PROVIDER_ERROR,
        payload: error?.message ?? ""
      });
    }
  };
};

export const setSelectedProvider = (provider) => {
  return async (dispatch) => {
    try {
      dispatch({
        type: actionTypes.PAYMENT_SCREEN_LOADING,
        payload: true
      });
      const res = await PaymentServices.setSelectedProvider({ ...provider });
      const response = await fetchPaymentSetting();
      if (response.statusCode === 200) {
        dispatch(getPaymentSettings(response.data.paymentSetting));
      }
      if (res?.statusCode === 200) {
        dispatch(fetchPaymentSettings());
        dispatch(getAvailableProviders(provider.businessId));

        const bannersResponse = await BannerService.fetchAllBanners()
        if (bannersResponse && bannersResponse.statusCode === 200 && bannersResponse.data) {
          dispatch({ type: actionTypes.GET_ALL_BANNER_LIST_SUCCESS, message: bannersResponse.message, payload: bannersResponse.data })
        }

        return dispatch({
          type: actionTypes.PAYMENT_SCREEN_LOADING,
          payload: false
        });
      }
      dispatch(openGlobalSnackbar(res.message, true))
      dispatch({
        type: actionTypes.SET_SELECTED_PROVIDER_ERROR,
        payload: res?.message ?? ""
      });
    } catch (error) {
      dispatch(openGlobalSnackbar(error.message, true));
      dispatch({
        type: actionTypes.SET_SELECTED_PROVIDER_ERROR,
        payload: e?.message ?? ""
      });
    }
  };
};

export const resetProviderData = () => {
  return (dispatch) => {
    dispatch({
      type: actionTypes.GET_AVAILABLE_PROVIDER_SUCCESS,
      payload: []
    });
    dispatch({
      type: actionTypes.SET_SELECTED_PROVIDER_SUCCESS,
      payload: {}
    });
  };
};

export const submitPayByBankOnboarding = (payload) => {
  return async (dispatch) => {
    dispatch({ 
      type: actionTypes.SUBMIT_PAYBYBANK_ONBOARDING_LOADING, 
      payload: true 
    });

    try {
      const response = await PaymentServices.submitPayByBankOnboarding(payload);
      if (response.statusCode === 200) {
        if (response.data?.bankAccount?.error) {
          // Handle bank account error case
          const errorMessage = response.data.bankAccount.error.providerError?.message || 
                           response.data.bankAccount.error.message || 
                           'Bank account validation failed';
          dispatch({
            type: actionTypes.SUBMIT_PAYBYBANK_ONBOARDING_ERROR,
            payload: errorMessage
          });
          dispatch(openGlobalSnackbar(errorMessage, true));
          return { 
            success: false, 
            error: response.data.bankAccount.error,
            message: errorMessage,
            business: response.data.business 
          };
        }

        // Handle success case
        dispatch({
          type: actionTypes.SUBMIT_PAYBYBANK_ONBOARDING_SUCCESS,
          payload: response.data
        });
        dispatch(fetchAllBannerList())
        dispatch(openGlobalSnackbar('Onboarding completed successfully', false));
        dispatch(fetchPaymentSettings());
        // history.push("/app/payments");
        return { success: true, data: response.data };
      } else {
        // Handle other error cases
        dispatch({
          type: actionTypes.SUBMIT_PAYBYBANK_ONBOARDING_ERROR,
          payload: response.message
        });
        dispatch(openGlobalSnackbar(response.message || 'Something went wrong', true));
        return { success: false };
      }
    } catch (error) {
      dispatch({
        type: actionTypes.SUBMIT_PAYBYBANK_ONBOARDING_ERROR,
        payload: error.message
      });
      dispatch(openGlobalSnackbar(error.message || 'Something went wrong', true));
      return { success: false };
    } finally {
      dispatch({ 
        type: actionTypes.SUBMIT_PAYBYBANK_ONBOARDING_LOADING, 
        payload: false 
      });
    }
  };
};

export const submitBnplOnboarding = (payload) => {
  return async (dispatch) => {
    dispatch({ 
      type: actionTypes.SUBMIT_BNPL_ONBOARDING_LOADING, 
      payload: true 
    });

    try {
      const response = await PaymentServices.submitBnplOnboarding(payload);
      if (response.statusCode === 200) {
        dispatch({
          type: actionTypes.SUBMIT_BNPL_ONBOARDING_SUCCESS,
          payload: response.data
        });
        dispatch(openGlobalSnackbar('BNPL Onboarding completed successfully', false));
        dispatch(fetchPaymentSettings());
        dispatch(fetchAllBannerList())
        history.push("/app/payments");
        return { success: true, data: response.data };
      } else {
        dispatch({
          type: actionTypes.SUBMIT_BNPL_ONBOARDING_ERROR,
          payload: response.message
        });
        dispatch(openGlobalSnackbar(response.message || 'Something went wrong', true));
        return { success: false };
      }
    } catch (error) {
      dispatch({
        type: actionTypes.SUBMIT_BNPL_ONBOARDING_ERROR,
        payload: error.message
      });
      dispatch(openGlobalSnackbar(error.message || 'Something went wrong', true));
      return { success: false };
    } finally {
      dispatch({ 
        type: actionTypes.SUBMIT_BNPL_ONBOARDING_LOADING, 
        payload: false 
      });
    }
  };
};
