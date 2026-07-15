import { openGlobalSnackbar } from './snackBarAction';
import VerificationService from '../api/verificationService';
import { GET_VERIFICATION_SUCCESS, SET_VERIFICATION_LOADING, SET_VERIFICATION_SUCCESS } from "../constants/ActionTypes";

export function getVerification(data) {
  return {
    type: GET_VERIFICATION_SUCCESS,
    data,
  };
}

export function setVerification(data) {
  return {
    type: SET_VERIFICATION_SUCCESS,
    data,
  };
}

export function setVerificationLoading(loading = true) {
  return {
    type: SET_VERIFICATION_LOADING,
    data: loading,
  };
}

export function initiateVerification(payload) {
  return async (dispatch) => {
    dispatch(setVerificationLoading());
    const response = await VerificationService.initiateVerification(payload);
    try {
      if (response.statusCode === 200) {
        dispatch(setVerification(response.data.paymentSetting));
      } else {
        dispatch(setVerificationLoading(false));
        dispatch(openGlobalSnackbar(response.message, true));
      }
    } catch (error) {
      dispatch(setVerificationLoading(false));
      dispatch(openGlobalSnackbar(error.message, true));
    }
  };
}