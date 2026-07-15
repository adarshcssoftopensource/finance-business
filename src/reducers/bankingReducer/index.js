import { SEARCH_BANKS_LOADING, SEARCH_BANKS_SUCCESS, SEARCH_BANKS_ERROR,
    GET_BANKS_ERROR, GET_BANKS_SUCCESS, GET_BANKS_LOADING,
    GET_CONNECTED_BANKS_ERROR, GET_CONNECTED_BANKS_LOADING, GET_CONNECTED_BANKS_SUCCESS,
    DELETED_BANKS_ERROR, DELETED_BANKS_LOADING, DELETED_BANKS_SUCCESS,
    UPDATE_BALANCE_ERROR, UPDATE_BALANCE_LOADING, UPDATE_BALANCE_SUCCESS
} from "../../actions/bankingActions/bankingTypes"
const initialState = {
    type: null,
    data: null,
    message: null,
    searchData: null,
    connectedData: null,
    updateBalanceData: null
}

export const bankingReducer = (state = initialState, { type, message, payload }) => {
    switch(type) {
        case SEARCH_BANKS_LOADING:
            return {
                ...state,
                type,
                message,
                searchData: payload
            };
        case SEARCH_BANKS_SUCCESS:
            return {
                ...state,
                type,
                message,
                searchData: payload
            }
        case SEARCH_BANKS_ERROR:
            return {
                ...state,
                type,
                message,
                searchData: payload
            }
        case GET_BANKS_LOADING:
            return {
                ...state,
                type,
                message,
                data: payload
            };
        case GET_BANKS_SUCCESS:
            return {
                ...state,
                type,
                message,
                data: payload
            }
        case GET_BANKS_ERROR:
            return {
                ...state,
                type,
                message,
                data: payload
            }
        case GET_CONNECTED_BANKS_LOADING:
            return {
                ...state,
                type,
                message,
                connectedData: payload
            };
        case GET_CONNECTED_BANKS_SUCCESS:
            return {
                ...state,
                type,
                message,
                connectedData: payload
            }
        case GET_CONNECTED_BANKS_ERROR:
            return {
                ...state,
                type,
                message,
                connectedData: payload
            }
        case DELETED_BANKS_LOADING:
            return {
                ...state,
                type,
                message,
            };
        case DELETED_BANKS_SUCCESS:
            return {
                ...state,
                type,
                message,
            }
        case DELETED_BANKS_ERROR:
            return {
                ...state,
                type,
                message,
            }
        case UPDATE_BALANCE_LOADING:
            return {
                ...state,
                type,
                message,
                updateBalanceData: payload
            };
        case UPDATE_BALANCE_SUCCESS:
            return {
                ...state,
                type,
                message,
                updateBalanceData: payload
            }
        case UPDATE_BALANCE_ERROR:
            return {
                ...state,
                type,
                message,
                updateBalanceData: payload
            }
        default:
            return state;
    }
}