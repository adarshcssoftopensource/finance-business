import history from '../customHistory';
import BusinessService from '../api/businessService';
import * as actionTypes from '../constants/ActionTypes';
import profileServices from '../api/profileService';
import { fetchPaymentSettings } from './paymentSettings';
import { _setToken } from '../utils/authFunctions';
import { openGlobalSnackbar } from './snackBarAction';
import { refreshToken } from './authAction';
import { logout } from '../utils/GlobalFunctions';
import { fetchAllBannerList } from './utilityAction';
import { fetchMe } from './loginAction';
import { getSession } from "./deviceSessionAction";

export const businessError = (errorMessage) => {
    return { type: actionTypes.BUSINESS_FAILED, errorMessage }
}

export const setBusinessList = (business) => {
    return {
        type: actionTypes.FETCH_BUSINESS,
        payload: business
    }
}
let counter = 0;
export const setSelectedBussiness = (id, accessToken, redirect = true, redirectUrl) => {
    if (counter > 2) {
        // For infinite loop in business list.
        openGlobalSnackbar('Something went wrong, please login again.', true);
        logout();
        return false;
    }
        if (id) {
            localStorage.setItem('businessId', id)
        }
        return async (dispatch, getState) => {
            let refreshTok = accessToken;
            if (!refreshTok) {
                const res = await refreshToken();
                _setToken(res)
                refreshTok = res.accessToken
            }
            try {
                dispatch({ type: actionTypes.START_USER_DATA_LOADING })
                const isCheckVerifiedEmail = true;
                const me = await fetchMe(isCheckVerifiedEmail);
                const businessList = me.data.businesses
                if (!!businessList && businessList.length > 0) {
                    let selected = null;
                    if (!!me && !!me.data && !!me.data.selectedBusiness && !!id) {
                        selected = me.data.selectedBusiness
                        selected._id = id
                        counter = 0;
                    } else if(localStorage.getItem("assumeUser")) {
                        selected = me.data.selectedBusiness || businessList.find(item => item.isPrimary === true)
                        setSelectedBussiness(!!selected ? selected._id : businessList[0]._id, accessToken ? accessToken : null);
                        counter = 0;
                    } else {
                        counter++;
                        selected = businessList.find(item => item.isPrimary === true)
                        setSelectedBussiness(!!selected ? selected._id : businessList[0]._id, accessToken ? accessToken : null);
                    }
                    dispatch(getSession(localStorage.getItem("refreshToken")));
                    dispatch(setBusinessList(businessList));
                    dispatch(fetchPaymentSettings())
                    dispatch(fetchAllBannerList())
                    dispatch({ type: "GET_ACCOUNT_TYPE_SUCCESS", message: "", data: null })
                    dispatch({ type: "GET_ALL_TRANSACTION_SUCCESS", message: "", data: null, count: 0 })
                    dispatch({ type: "GET_ALL_TRANSACTION_BALANCE_SUCCESS", message: null, data: null })
                    if (!!redirect) {
                        if (!!localStorage.getItem('redirectTo')) {
                            const redirectTo = localStorage.getItem("redirectTo")
                            localStorage.removeItem("redirectTo")
                            history.replace(redirectTo)
                            window.location.reload()
                        } else  if(redirectUrl){
                            history.push(`/app/payyitme`)
                        }else {
                            if (history.location && history.location.state && history.location.state.from) {
                            return history.push(history.location.state.from)
                            }
                            history.push(`/app/dashboard`)
                        }
                    } else {
                        if(redirectUrl){
                            history.push(`/app/payyitme`)
                        }
                    }
                    dispatch({
                        type: actionTypes.SELECTED_BUSINESS,
                        selectedBusiness: selected
                    })
                    dispatch({
                        type: actionTypes.ONBOARDING_RULES,
                        onboardingRules: me.data?.onBoardingRules
                    })
                    dispatch({
                        type: actionTypes.USER_DATA,
                        payload: me.data.user
                    })
                    return {
                        type: actionTypes.SELECTED_BUSINESS,
                        selectedBusiness: selected
                    };
                } if (!!id) {
                    history.push(`/need-to-talk`)
                } else {
                    if (!!redirect) {
                        history.push(`/onboarding`)
                    }
                }
            } catch (error) {
                if (!!id && error.message === "Current user can't access this business") {
                    history.push(`/need-to-talk`)
                }
            }
        }

}
export function fetchBusiness() {
    return async (dispatch, getState) => {
        try {
            const response = await BusinessService.fetchBusiness();
            if (response.statusCode === 200) {
                const businessList = response.data.businesses.ownerAccess
                if (businessList.length > 0) {
                    const businessId = localStorage.getItem('businessId')
                    const selected = businessList.find(item => {
                        return item._id === businessId
                    })
                    // let selectedBusiness = getState().businessReducer.selectedBusiness
                    // const selectedBusiness = !!selected ? selected : businessList[0]
                    // dispatch(setSelectedBussiness(selectedBusiness))
                    // const payload = await fetchSalesSetting()
                    // dispatch(setUserSettings(payload.data.salesSetting));
                    return dispatch(setBusinessList(businessList));
                }
            }

        } catch (error) {
            dispatch(businessError(error.errorMessage))
        }
    }
}


export const setPrimaryBussiness = (selectedBusiness, id) => {
    return async (dispatch, getState) => {
        try {
            const response = await profileServices.updateUser({ userInput: { primaryBusiness: selectedBusiness._id } }, id);
            if (response.statusCode === 200) {
                // dispatch(setSelectedBussiness(selectedBusiness));
                // const payload = await fetchSalesSetting()
                // dispatch(setUserSettings(payload.data.salesSetting));
                // window.location.href = '/'
            }
        } catch (err) {
        }
    }
}

export const getBusinessLegalAct = _ => {
    return async (dispatch, getState) => {
        dispatch({ type: actionTypes.LEGAL_DETAILS_LOADING });
        try {
            const response = await BusinessService.getLegalDetails();
            if (response.statusCode === 200) {
                dispatch({ type: actionTypes.LEGAL_DETAILS_SUCCESS, payload: response.data });
                // const payload = await fetchSalesSetting()
                // dispatch(setUserSettings(payload.data.salesSetting));
                // window.location.href = '/'
            } else {
                dispatch({ type: actionTypes.LEGAL_DETAILS_ERROR, payload: response.data });
            }
        } catch (err) {
            dispatch({ type: actionTypes.LEGAL_DETAILS_ERROR, payload: err });
        }
    }
}

export const restoreBusiness = (id) => {
    return async (dispatch, getState) => {
        try {
            const response = await BusinessService.restoreBusiness(id);
            if (response.statusCode === 200) {
                // dispatch(setSelectedBussiness(selectedBusiness));
                // dispatch(setUserSettings(payload.data.salesSetting));
                // window.location.href = '/'
            }
        } catch (err) {
        }
    }
}
