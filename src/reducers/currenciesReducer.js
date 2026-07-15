import {
    GET_ALL_CURRENCIES_SUCCESS,
    GET_ALL_CURRENCIES_FAILED,
} from '../constants/ActionTypes';

const initialAccount = {
    getAllCurrencies: [],
    errorMessage: ''
}

const getCurrencies = (state = initialAccount, action) => {
    switch (action.type) {
        case GET_ALL_CURRENCIES_SUCCESS: return {
            ...state,
            getAllCurrencies: action.data,
            errorMessage: action.message
        }
        case GET_ALL_CURRENCIES_FAILED: return {
            ...state,
            getAllCurrencies: [],
            errorMessage: action.message
        }
        default:
            return state;
    }
}


export default getCurrencies