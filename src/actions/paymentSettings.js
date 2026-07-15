import { openGlobalSnackbar } from './snackBarAction';
import { changeStatementDescriptors, fetchPaymentSetting, savePaymentSetting, savePaymentSettingForce, fetchProcessingFee, updatePassFee, resetPassFee } from '../api/SettingService';
import {
  GET_PAYMENT_SETTINGS_SUCCESS,
  SET_PAYMENT_SETTINGS_SUCCESS,
  SET_PAYMENT_SETTINGS_LOADING,
  SET_PAYMENT_STATEMENT_DESCRIPTOR,
  GET_PROCESSING_FEE_SUCCESS,
  SET_PASS_FEE_SUCCESS
} from '../constants/ActionTypes';

export function getPaymentSettings(data) {
  return {
    type: GET_PAYMENT_SETTINGS_SUCCESS,
    data,
  };
}

export function setPaymentSettings(data) {
  return {
    type: SET_PAYMENT_SETTINGS_SUCCESS,
    data,
  };
}

export function setPaymentLoading(loading = true) {
  return {
    type: SET_PAYMENT_SETTINGS_LOADING,
    data: loading,
  };
}

export function setStatementName(data) {
  return {
    type: SET_PAYMENT_STATEMENT_DESCRIPTOR,
    data
  };
}

export function getProcessingFeeSuccess(data) {
  return {
    type: GET_PROCESSING_FEE_SUCCESS,
    data
  }
}

export function setPassFeeSuccess(data) {
  return {
    type: SET_PASS_FEE_SUCCESS,
    data
  }
}

export function fetchPaymentSettings() {
  return async (dispatch) => {
    dispatch(setPaymentLoading());
    try {
      const response = await fetchPaymentSetting();
      if (response.statusCode === 200) {
        dispatch(getPaymentSettings(response.data.paymentSetting));
      } else {
        dispatch(setPaymentLoading(false));
        dispatch(openGlobalSnackbar(response.message, true));
      }
    } catch (error) {
      dispatch(setPaymentLoading(false));
      dispatch(openGlobalSnackbar(error.message, true));
    }
  };
}

export function savePaymentSettings(payload) {
  return async (dispatch) => {
    dispatch(setPaymentLoading());
    try {
      const response = await savePaymentSetting({ paymentSettingInput: payload });
      if (response.statusCode === 200) {
        dispatch(setPaymentSettings(response.data.paymentSetting));
      } else {
        dispatch(setPaymentLoading(false));
        dispatch(openGlobalSnackbar(response.message, true));
      }
    } catch (error) {
      dispatch(setPaymentLoading(false));
      dispatch(openGlobalSnackbar(error.message, true));
    }
  };
}

export function savePaymentSettingsForce(payload) {
  return async (dispatch) => {
    dispatch(setPaymentLoading());
    try {
      const response = await savePaymentSettingForce({ paymentSettingInput: payload });
      if (response.statusCode === 200) {
        dispatch(setPaymentSettings(response.data));
      } else {
        dispatch(setPaymentLoading(false));
        dispatch(openGlobalSnackbar(response.message, true));
      }
    } catch (error) {
      dispatch(setPaymentLoading(false));
      dispatch(openGlobalSnackbar(error.message, true));
    }
  };
}

export function changeStatementDescriptor(payload) {
  return async (dispatch) => {

    try {
      const response = await changeStatementDescriptors({ statement: { displayName: payload } })
      if (response.statusCode === 200) {
        dispatch(setStatementName(payload))
        dispatch(openGlobalSnackbar(response.message, false));
        return response
      } else {
        dispatch(openGlobalSnackbar(response.message, true));
      }
    } catch (error) {
      dispatch(openGlobalSnackbar(error.message, true));
      return error
    }
  };
}

export function fetchProcessingFees() {
  return async (dispatch) => {
    dispatch(setPaymentLoading());
    try {
      const response = await fetchProcessingFee();
      if (response.statusCode === 200) {
        dispatch(getProcessingFeeSuccess(response.data.processingFee));
      } else {
        dispatch(setPaymentLoading(false));
        dispatch(openGlobalSnackbar(response.message, true));
      }
    } catch (error) {
      dispatch(setPaymentLoading(false));
      dispatch(openGlobalSnackbar(error.message, true));
    }
  };
}

export function updateMerchantPassFee(payload) {
  return async (dispatch) => {
    dispatch(setPaymentLoading());
    try {
      const response = await updatePassFee({ feeUpdate: payload });
      if (response.statusCode === 200) {
        dispatch(setPassFeeSuccess(response.data.processingFee));
        dispatch(openGlobalSnackbar(response.message, false));
      } else {
        dispatch(setPaymentLoading(false));
        dispatch(openGlobalSnackbar(response.message, true));
      }
    } catch (error) {
      dispatch(setPaymentLoading(false));
      dispatch(openGlobalSnackbar(error.message, true));
    }
  };
}

export function resetMerchantPassFee() {
  return async (dispatch) => {
    dispatch(setPaymentLoading());
    try {
      const response = await resetPassFee();
      if (response.statusCode === 200) {
        dispatch(fetchProcessingFees());
        dispatch(openGlobalSnackbar(response.message, false));
      } else {
        dispatch(setPaymentLoading(false));
        dispatch(openGlobalSnackbar(response.message, true));
      }
    } catch (error) {
      dispatch(setPaymentLoading(false));
      dispatch(openGlobalSnackbar(error.message, true));
    }
  };
}

