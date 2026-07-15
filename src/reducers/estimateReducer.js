import * as actionTypes from '../constants/ActionTypes';

const initialState = {
    type: actionTypes.FETCH_ESTIMATE_LOADING,
    data: null
}

const estimateReducer = (state = initialState, {type, payload}) => {
    switch(type) {
        case actionTypes.FETCH_ESTIMATE_LOADING:
            return {
                ...state,
                type,
                data: payload
            };
        case actionTypes.FETCH_ESTIMATE_SUCCESS:
            return {
                ...state,
                type,
                data: payload
            }
        case actionTypes.FETCH_ESTIMATE_ERROR:
            return {
                ...state,
                type,
                data: payload
            }
        default:
            return state
    }
}

export default estimateReducer