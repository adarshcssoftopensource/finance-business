import * as types from "../../actions/bankingActions/transactionTypes"


const initialState = {
    type: null,
    data: null,
    message: null,
    allBusinesTransData: null,
    saveImportData: null
}

export const transactionReducer = (state = initialState, { type, payload, message }) => {
    switch(type) {
        case types.GET_TRANSACTIONS_DATA_LOADING:
            return {
                ...state,
                type,
                allBusinesTransData: payload,
                message
            };
        case types.GET_TRANSACTIONS_DATA_SUCCESS:
            return {
                ...state,
                type,
                allBusinesTransData: payload,
                message
            };
        case types.GET_TRANSACTIONS_DATA_ERROR:
            return {
                ...state,
                type,
                allBusinesTransData: payload,
                message
            };
        case types.SAVE_TRANSACTIONS_LOADING:
            return {
                ...state,
                type,
                saveImportData: payload,
                message
            };
        case types.SAVE_TRANSACTIONS_SUCCESS:
            return {
                ...state,
                type,
                saveImportData: payload,
                message
            };
        case types.SAVE_TRANSACTIONS_ERROR:
            return {
                ...state,
                type,
                saveImportData: payload,
                message
            };
        default:
            return state;
    }
}