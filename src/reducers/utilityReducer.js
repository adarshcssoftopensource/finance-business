import * as actionTypes from '../constants/ActionTypes';

const initialState = {
    loading: false,
    success: false,
    error: false,
    data: null,
    message: '',
}


export const getAllMCC = (state = initialState, { type, payload, message }) => {
    switch (type) {
        case actionTypes.FETCH_MCC_SUCCESS:
            return {
                ...state,
                success: true,
                loading: false,
                error: false,
                data: payload,
                message
            };
        case actionTypes.FETCH_MCC_ERROR:
            return {
                ...state,
                success: false,
                loading: false,
                error: true,
                data: payload,
                message
            };
        case actionTypes.FETCH_MCC_LOADING:
            return {
                ...state,
                loading: true,
                success: false,
                error: false,
                data: payload,
                message
            };
        case actionTypes.GET_ALL_BANNER_LIST:
            return {
                ...state,
                loading: true,
                success: false,
                error: false,
                data: payload,
                message
            };
        default:
            return state;
    }
};

const initialState1 = {
    loading: false,
    success: false,
    error: false,
    data: null,
    message: '',
}
export const IpInfo = (state = initialState1, { type, payload, message }) => {
    switch (type) {
        case actionTypes.FETCH_IPINFO_SUCCESS:
            return {
                ...state,
                success: true,
                loading: false,
                error: false,
                data: payload,
                message
            };
        case actionTypes.FETCH_IPINFO_ERROR:
            return {
                ...state,
                success: false,
                loading: false,
                error: true,
                data: payload,
                message
            };
        case actionTypes.FETCH_IPINFO_LOADING:
            return {
                ...state,
                loading: true,
                success: false,
                error: false,
                data: payload,
                message
            };
        default:
            return state;
    }
};

const bannerInitialState = {
    loading: false,
    success: false,
    error: false,
    data: null,
    message: '',
}
export const BannerList = (state = bannerInitialState, { type, payload, message }) => {
    switch (type) {
        case actionTypes.GET_ALL_BANNER_LIST_SUCCESS:
            return {
                ...state,
                success: true,
                loading: false,
                error: false,
                data: payload,
                message
            };
        case actionTypes.GET_ALL_BANNER_LIST_FAILED:
            return {
                ...state,
                success: false,
                loading: false,
                error: true,
                data: payload,
                message
            };
        case actionTypes.GET_ALL_BANNER_LIST_LOADER:
            return {
                ...state,
                loading: true,
                success: false,
                error: false,
                data: payload,
                message
            };
        default:
            return state;
    }
};