import * as types from '../constants/ActionTypes'

import history from '../customHistory'

import LoginService from '../api/LoginService'
import { _setToken } from '../utils/authFunctions'
import { verifyRegister, verifyInvitation } from '../api/globalServices'
import { openGlobalSnackbar } from './snackBarAction'
import { getDeviceInfo } from "../utils/common";

export const generateResetLink = data => {
    return async (dispatch, getState) => {
        dispatch({type: types.GENERATE_RESET_LINK_LOADING});
        try{
            const res = await LoginService.generateResetLink(data);
            if(res.statusCode === 200){
                if(!!res.data && !!res.data.publicToken){
                    localStorage.setItem('reset-publicToken', res.data.publicToken)
                }
                return dispatch({type: types.GENERATE_RESET_LINK_SUCCESS, payload: res.data})
            }else{
                return dispatch({type: types.GENERATE_RESET_LINK_ERROR, payload: res.data})
            }
        }catch(err){
            return dispatch({type: types.GENERATE_RESET_LINK_ERROR, payload: err})
        }
    }
}

export const resetPassword = data => {
    return async (dispatch, getState) => {
        dispatch({type: types.RESET_PASSWORD_LOADING});
        try{
            const res = await LoginService.resetPassword(data);
            if(res.statusCode === 200){
                return dispatch({type: types.RESET_PASSWORD_SUCCESS, payload: res.data})
            }else{
                return dispatch({type: types.RESET_PASSWORD_ERROR, payload: res.data})
            }
        }catch(err){
            return dispatch({type: types.RESET_PASSWORD_ERROR, payload: err})
        }
    }
}

export const verifyLink = token => {
    return async (dispatch, getState) => {
        dispatch({type: types.VERIFY_LINK_LOADING});
        try{
            const res = await LoginService.verifyResetLink(token);
            if(res.statusCode === 200){
                return dispatch({type: types.VERIFY_LINK_SUCCESS, payload: res.data})
            }else{
                return dispatch({type: types.VERIFY_LINK_ERROR, payload: res.data})
            }
        }catch(err){
            return dispatch({type: types.VERIFY_LINK_ERROR, payload: err})
        }
    }
}

export const registerVerify = (mail, token) => {
    return async (dispatch, getState) => {
        dispatch({type: types.REGISTER_VERIFY_LOADING});
        try{
            const res = await verifyRegister({email: mail, token: token});
            if(res.statusCode === 200){
                dispatch(openGlobalSnackbar('Email Verified Successfully'))
                return dispatch({type: types.REGISTER_VERIFY_SUCCESS, payload: res.data})
            }else{
                // dispatch(openGlobalSnackbar('Token has expired, please contact your admin.'))
                history.push('/token-expire')
                return dispatch({type: types.REGISTER_VERIFY_ERROR, payload: res.data})
            }
        }catch(err){
            // dispatch(openGlobalSnackbar(err.data.message, true))
            history.push('/token-expire')
            return dispatch({type: types.REGISTER_VERIFY_ERROR, payload: err})
        }
    }
}

export const invitationVerify = (search) => {
    return async (dispatch, getState) => {
        // dispatch({type: types.REGISTER_VERIFY_LOADING});
        try{
            const res = await verifyInvitation(search);
            if(res.statusCode === 200){
                return dispatch({type: types.REGISTER_VERIFY_SUCCESS, payload: res.data})
            }else{
                dispatch(openGlobalSnackbar('Token has expired, please contact your admin.'))
                history.push('/token-expire')
                return dispatch({type: types.REGISTER_VERIFY_ERROR, payload: res.data})
            }
        }catch(err){
            dispatch(openGlobalSnackbar('Token has expired, please contact your admin.'))
            history.push('/token-expire')
            return dispatch({type: types.REGISTER_VERIFY_ERROR, payload: err})
        }
    }
}

export const refreshToken = async (createNewRefreshToken = false) => {
    try {
        const deviceInfo = await getDeviceInfo();
        const refreshData = await (LoginService.refreshToken({
            accessToken: localStorage.getItem("token"),
            refreshToken: localStorage.getItem("refreshToken"),
            createNewRefreshToken,
            deviceInfo
        }));
        if (refreshData.statusCode === 200 || refreshData.statusCode === 201) {
            const payload = refreshData.data || refreshData
            _setToken(payload)
            return payload;
        }
        // Static demo: keep existing session instead of logging out
        return {
            accessToken: localStorage.getItem('token'),
            refreshToken: localStorage.getItem('refreshToken'),
        };
    } catch (e) {
        return {
            accessToken: localStorage.getItem('token'),
            refreshToken: localStorage.getItem('refreshToken'),
        };
    }
}

export function assumeUserRefreshToken(token, callback){
    return async (dispatch) => {
        try {
            const refreshData = await (LoginService.assumeUser({ refreshToken: token.refreshToken}))
            if(refreshData.statusCode === 200){
                _setToken(refreshData.data)
                callback(refreshData.data);
            }
        } catch (error) {
          callback(error);
        }
      };
}
