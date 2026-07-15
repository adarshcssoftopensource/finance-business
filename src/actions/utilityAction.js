import * as utilityServices from "../api/utilityServices";
import * as ipService from "../api/ipInfo";
import * as actionTypes from "../constants/ActionTypes";
import BannerService from "../api/bannerService.js";

export const getBusinessMcc = () => {
    return async (dispatch, getState) => {
        dispatch({ type: actionTypes.FETCH_MCC_LOADING, payload: null, message: 'Loading' });
        try {
            let allMcc = await utilityServices.getMccWithBusinessCategory();
            if (allMcc.statusCode === 200) {
                return dispatch({ type: actionTypes.FETCH_MCC_SUCCESS, message: allMcc.message, payload: allMcc.data.mcc })
            } else {
                return dispatch({ type: actionTypes.FETCH_MCC_ERROR, payload: allMcc.data, message: allMcc.message })
            }
        } catch (err) {
            return dispatch({ type: actionTypes.FETCH_MCC_ERROR, payload: err, message: 'Something Went Wrong!' })
        }
    }
};


export const getIP = () => {
    return async (dispatch, getState) => {
        dispatch({ type: actionTypes.FETCH_IPINFO_LOADING, payload: null, message: 'Loading' });
        try {
            let res = await ipService.getLocationIP();
            return dispatch({ type: actionTypes.FETCH_IPINFO_SUCCESS, message: '', payload: res })
        } catch (err) {
            return dispatch({ type: actionTypes.FETCH_IPINFO_ERROR, payload: err, message: 'Something Went Wrong!' })
        }
    }
};


export const getIp = () => {
    return async (dispatch, getState) => {
        dispatch({ type: actionTypes.FETCH_MCC_LOADING, payload: null, message: 'Loading' });
        try {
            let allMcc = await utilityServices.getMccWithBusinessCategory();
            if (allMcc.statusCode === 200) {
                return dispatch({ type: actionTypes.FETCH_MCC_SUCCESS, message: allMcc.message, payload: allMcc.data })
            } else {
                return dispatch({ type: actionTypes.FETCH_MCC_ERROR, payload: allMcc.data, message: allMcc.message })
            }
        } catch (err) {
            return dispatch({ type: actionTypes.FETCH_MCC_ERROR, payload: err, message: 'Something Went Wrong!' })
        }
    }
};

export const fetchAllBannerList = () => {
    return async (dispatch) => {
    dispatch({ type: actionTypes.GET_ALL_BANNER_LIST_LOADER, payload: null, message: 'Loading' });
    try {
      const res = await BannerService.fetchAllBanners();
      if (res.statusCode === 200) {
        return dispatch({ type: actionTypes.GET_ALL_BANNER_LIST_SUCCESS, message: res.message, payload: res.data })
      }
        return dispatch({ type: actionTypes.GET_ALL_BANNER_LIST_FAILED, payload: res.data, message: res.message })
    } catch (err) {
      return dispatch({ type: actionTypes.GET_ALL_BANNER_LIST_FAILED, payload: err, message: err.message })
    }
  }
}


