import * as actionTypes from '../constants/ActionTypes';

const initialSettings = {
    data: null,
    type: ''
};

export const profileReducer = (state = initialSettings, {data, type}) => {
    switch(type) {
        case actionTypes.INVITE_USER_ERROR:
            return {
                ...state,
                data,
                type
            }
        case actionTypes.INVITE_USER_LOADING:
            return {
                ...state,
                data,
                type
            }
        case actionTypes.INVITE_USER_SUCCESS:
            return {
                ...state,
                data,
                type
            }
        case actionTypes.UPDATE_USER_ERROR:
            return {
                ...state,
                data,
                type
            }
        case actionTypes.UPDATE_USER_LOADING:
            return {
                ...state,
                data,
                type
            }
        case actionTypes.UPDATE_USER_SUCCESS:
            return {
                ...state,
                data,
                type
            }
        case actionTypes.DELETE_DELEGATE_ERROR:
            return {
                ...state,
                data,
                type
            }
        case actionTypes.DELETE_DELEGATE_LOADING:
            return {
                ...state,
                data,
                type
            }
        case actionTypes.DELETE_DELEGATE_SUCCESS:
            return {
                ...state,
                data,
                type
            }
        default:
            return state
    }
}