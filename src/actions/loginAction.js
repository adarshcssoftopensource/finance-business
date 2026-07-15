import history from '../customHistory'
import { get as _get, isEmpty } from 'lodash';

import LoginService from '../api/LoginService'
import * as types from '../constants/ActionTypes'
import { setSelectedBussiness } from './businessAction'
import { openGlobalSnackbar } from './snackBarAction';
import { _setToken, _getUser } from '../utils/authFunctions';
import { colormode, setupRefreshTimer } from '../utils/GlobalFunctions';
import { checkVerifiedEmail } from '../constants';
import { getAllFeatureFlags } from '../api/utilityServices';

/**
 * Action used for authenticate user
 * @param {*} loginPayload
 */
export function login(loginPayload, callback) {
  return async (dispatch, getState) => {
    try {
      const response = await LoginService.authenticate(loginPayload);
      let res
      if(response?.data?.verificationCodeRequired) {
        res = response;
      } else {
        res = await handleResponse(dispatch, response, loginPayload.redirectUrl);
      }

      callback(res);
    } catch (error) {
      callback(error);
      console.log(error);
      
      // dispatch(setErrorMessage(error && error.data ? error.data.message : error.message))
      // dispatch(openGlobalSnackbar(error && error.data ? error.data.message : error.message, true, 20000))
    }
  };
}


export function googleLogin(googleLoginPayload, callback) {
  return async (dispatch) => {
    try {
      const response = await LoginService.googleAuth(googleLoginPayload);
      const res = await handleResponse(dispatch, response);
      callback(res);
    } catch (error) {
      callback(error);
    }
  };
}

/**
 * Action used after login success
 * @param {*} responseLogin
 */
export function loginSuccess(token) {
  return { type: types.LOGIN_SUCCESS, token };
}

export const setUserSettings = (payload) => {
  return { type: types.USER_SETTINGS, payload }
};

export function loadLogin() {
  return history.push(`/signin`)
}
export const setErrorMessage = (errorMessage) => {
  return { type: types.LOGIN_FAILED, errorMessage }
};

export const fetchFeatureFlags = async () => {
  const featureFlags = await getAllFeatureFlags();
  const flags = featureFlags?.data || featureFlags;
  if (flags && !isEmpty(flags)) {
    localStorage.setItem('featureFlags', JSON.stringify(flags));
  }
  return flags;
}

export const fetchMe = async (isCheckVerifiedEmail) => {
  const me = await LoginService.callMe();
  if (me && me.data && me.data.user && me.data.user.themeMode) {
    if (isCheckVerifiedEmail) {
      checkVerifiedEmail();
    }
    colormode(me.data.user.themeMode)
  }
  await fetchFeatureFlags();
  if (me?.data?.selectedBusiness?.subscription) {
    localStorage.setItem('currentPlan', JSON.stringify(me?.data?.selectedBusiness?.subscription));
  }
  return me
}

const handleResponse = async (dispatch, response, redirectUrl) => {
  if (response.statusCode === 200) {
    const userData = _getUser(response.data.accessToken);
    dispatch(loginSuccess(response.data));
    _setToken(response.data)
    setupRefreshTimer();
    if (!!localStorage.getItem('redirectTo') && !!localStorage.getItem('token')) {
      const me = await fetchMe();
      const getQueryParam = localStorage.getItem('redirectTo').split('?')[1]
      const urlParams = new URLSearchParams(getQueryParam);
      const selectedBusinessId = urlParams.get('selectedBusiness')
      const businessList = me.data.businesses
      const businessExist = businessList.filter(business => business._id === selectedBusinessId)
      if (businessExist.length > 0) {
        dispatch(setSelectedBussiness(selectedBusinessId))
      } else {
        history.push(`/need-to-talk`)
      }
    }
    else if (!!userData.primaryBusiness) {
      const redirect = redirectUrl ? false : true
      dispatch(setSelectedBussiness(userData.primaryBusiness, response.data.accessToken, redirect,redirectUrl));
    } else {
      if (!!userData.businessIds && userData.businessIds.length > 0) {
        const me = await fetchMe();
        const businessList = _get(me, "data.businesses", [])
        if (!!businessList && businessList.length > 0) {
          const redirect = redirectUrl ? false : true
          dispatch(setSelectedBussiness(businessList[0]._id,"", redirect, redirectUrl));
        } else {
          history.push(`/onboarding`)
        }
      } else {
        history.push(`/onboarding`)
      }
    }
    return response
  } else {
    return response
  }
}
