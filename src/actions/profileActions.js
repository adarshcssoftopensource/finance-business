import history from '../customHistory';
import profileServices from '../api/profileService';
import * as actionTypes from '../constants/ActionTypes';

import { errorHandle } from './errorHandling';
import { openGlobalSnackbar } from './snackBarAction';
import LoginService from '../api/LoginService';

export const updateUser = (userInput) => {
    let id = localStorage.getItem('user.id');
    return async (dispatch) => {
        try {
            let response = await profileServices.updateUser(userInput, id)
            if (response.statusCode === 200) {
                dispatch({
                    type: actionTypes.UPDATE_USER, data: response.data
                });
                response.data.user.message = response.message
                return response.data.user
            } else {
                return response
            }
        } catch (error) {
            dispatch(openGlobalSnackbar(error.message, true))
            return error
        }
    }
}

export const changePass = (data) => {
    let id = localStorage.getItem('user.id');
    return async (dispatch) => {
        try {
            let response = await profileServices.changePass(data)
            if (response.statusCode === 200) {
                dispatch({
                    type: actionTypes.CHANGE_PASS, data: response.data
                });
                return response
            } else {
                dispatch({
                    type: actionTypes.CHANGE_PASS_ERROR, data: response.data
                });
                return response
            }
        } catch (err) {
            dispatch(openGlobalSnackbar('Something went worng, please try again', true))
            dispatch({
                type: actionTypes.CHANGE_PASS_ERROR, data: err
            });
            return err
        }
    }
}

export const inviteUserAct = data => {
    return async dispatch => {
        dispatch({
            type: actionTypes.INVITE_USER_LOADING
        })
        try {
            const response = await LoginService.inviteUser(data);
            if (response.statusCode === 201) {
                dispatch(openGlobalSnackbar(response.message, false));
                dispatch({
                    type: actionTypes.INVITE_USER_SUCCESS, data: response.data
                })
            } else {
                dispatch(openGlobalSnackbar(response.message, true));
                dispatch({
                    type: actionTypes.INVITE_USER_ERROR, data: response.data
                })
            }
            return response;
        } catch (err) {
            dispatch(openGlobalSnackbar(err.message, true));
            dispatch({
                type: actionTypes.INVITE_USER_ERROR, data: err
            })
            return err;
        }
    }
}

export const updateUserAct = (data, id) => {
    return async dispatch => {
        dispatch({
            type: actionTypes.UPDATE_USER_LOADING
        })
        try {
            const response = await LoginService.updateUser(data, id);
            if (response.statusCode === 200) {
                dispatch(openGlobalSnackbar(response.message, false));
                dispatch({
                    type: actionTypes.UPDATE_USER_SUCCESS, data: response.data
                })
            } else {
                dispatch(openGlobalSnackbar(response.message, true));
                dispatch({
                    type: actionTypes.UPDATE_USER_ERROR, data: response.data
                })
            }
            return response;
        } catch (err) {
            dispatch(openGlobalSnackbar(err.message, true));
            dispatch({
                type: actionTypes.UPDATE_USER_ERROR, data: err
            })
            return err;
        }
    }
}

export const deleteUserAct = id => {
    return async dispatch => {
        dispatch({
            type: actionTypes.DELETE_DELEGATE_LOADING
        })
        try {
            const response = await LoginService.deleteDelegateUser(id);
            if (response.statusCode === 200) {
                dispatch(openGlobalSnackbar(response.message, false));
                dispatch({
                    type: actionTypes.DELETE_DELEGATE_SUCCESS, data: response.data
                })
            } else {
                dispatch(openGlobalSnackbar(response.message, true));
                dispatch({
                    type: actionTypes.DELETE_DELEGATE_ERROR, data: response.data
                })
            }
            return response;
        } catch (err) {
            dispatch(openGlobalSnackbar(err.message, true));
            dispatch({
                type: actionTypes.DELETE_DELEGATE_ERROR, data: err
            })
            return err;
        }
    }
}

export function googleEmailConnects(queryString, callback) {
    return async (dispatch) => {
        try {
            const response = await profileServices.googleEmailConnects(queryString);
            callback(response);
        } catch (error) {
            callback(error);
        }
    };
}