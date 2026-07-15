import * as estimateServices from "../api/EstimateServices";
import * as actionTypes from "../constants/ActionTypes";

export const getEstimates = query => {
    return async (dispatch, getState) => {
        const { estimateReducer } = getState()
        let pageNo = 1, pageSize = 10;
        if(!!estimateReducer.data && !!estimateReducer.data.meta){
            pageNo = estimateReducer.data.meta.pageNo
            pageSize = estimateReducer.data.meta.pageSize
        }
      dispatch({ type: actionTypes.FETCH_ESTIMATE_LOADING});
        try{
            let res = await estimateServices.fetchEstimates(!!query ? query : `pageNo=${pageNo}&pageSize=${pageSize}`);
            if(res.statusCode === 200){
                return dispatch({type: actionTypes.FETCH_ESTIMATE_SUCCESS,  payload: res.data})
            }else{
                return dispatch({type: actionTypes.FETCH_ESTIMATE_ERROR, payload: res.data})
            }
        }catch(err){
            return dispatch({type: actionTypes.FETCH_ESTIMATE_ERROR, payload: err})
        }
    }
};