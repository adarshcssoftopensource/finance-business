import * as types from "../constants/ActionTypes";
import * as SecurityServices from "../api/2FASecurityServices";
import {openGlobalSnackbar} from "./snackBarAction";
import {TOTP_SET_UP_DONE, TOTP_SET_UP_LOADING, USER_DATA} from "../constants/ActionTypes";
import {refreshToken} from "./authAction";

export const createSecrets = data => {
    return (dispatch, getState) => {
        try {
            return SecurityServices.createSecrets();
        } catch (err) {
            return false;
        }
    }
}

export const verifySecretCode = (code) => {
    return (dispatch, getState) => {
        try {
            dispatch({type: TOTP_SET_UP_LOADING, payload: true})
            return SecurityServices.verifySecrets(code).then((response) => {
                const {userData: {user}} = getState();
                if (response.data) {
                    dispatch(openGlobalSnackbar(response.message));
                    dispatch({type: USER_DATA, payload: {...user, twoFAuth: {TOTP: true, enabled: true}}})
                }
                dispatch({type: TOTP_SET_UP_LOADING, payload: false})
                refreshToken(true)
            }).catch((error) => {
                dispatch(openGlobalSnackbar(error.message, error));
                dispatch({type: TOTP_SET_UP_LOADING, payload: false})
                console.error(error)
            });
        } catch (err) {
            dispatch(openGlobalSnackbar(err.message, err));
            dispatch({type: TOTP_SET_UP_LOADING, payload: false})
            console.error(err)
            return false;
        }
    }
}

export const removeAuthenticator = (code) => {
    return (dispatch, getState) => {
        try {
            dispatch({type: TOTP_SET_UP_LOADING, payload: true})
            return SecurityServices.removeAuthenticator(code).then((response) => {
                const {userData: {user}} = getState();
                if (response.data) {
                    dispatch(openGlobalSnackbar(response.message));
                    dispatch({type: USER_DATA, payload: {...user, twoFAuth: {TOTP: false, enabled: false}}})
                }
                dispatch({type: TOTP_SET_UP_LOADING, payload: false})
                refreshToken()
            }).catch((error) => {
                dispatch(openGlobalSnackbar(error.message, error));
                dispatch({type: TOTP_SET_UP_LOADING, payload: false})
                console.error(error)
            });
        } catch (err) {
            dispatch(openGlobalSnackbar(err.message, err));
            dispatch({type: TOTP_SET_UP_LOADING, payload: false})
            console.error(err)
            return false;
        }
    }
}