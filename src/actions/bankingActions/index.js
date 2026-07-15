import { SEARCH_BANKS_LOADING, SEARCH_BANKS_SUCCESS, SEARCH_BANKS_ERROR,
     GET_BANKS_ERROR, GET_BANKS_SUCCESS, GET_BANKS_LOADING,
     GET_CONNECTED_BANKS_ERROR, GET_CONNECTED_BANKS_LOADING, GET_CONNECTED_BANKS_SUCCESS,
     DELETED_BANKS_ERROR, DELETED_BANKS_LOADING, DELETED_BANKS_SUCCESS,
     UPDATE_BALANCE_ERROR, UPDATE_BALANCE_LOADING, UPDATE_BALANCE_SUCCESS
    } from "./bankingTypes"
import { getAllBanks, getConnectedBanks, deleteConnectedBank, updateBankBalance } from "../../api/bankingServices"

export const searchBanks = (page, pageSize, text) => {
    return async dispatch => {
        dispatch({type: SEARCH_BANKS_LOADING, message: 'Loading'})
        try{
            const searchRes = await getAllBanks(page, pageSize, text)
            if(searchRes.statusCode === 200){
                return dispatch({type: SEARCH_BANKS_SUCCESS, payload: searchRes.data, message: searchRes.data.message})
            }else{
                return dispatch({type: SEARCH_BANKS_ERROR, payload: searchRes.data, message: searchRes.data.message})
            }
        }catch(err){
            if(!!err && !!err.response && !!err.response.data && !!err.response.data.message){
                return dispatch({type: SEARCH_BANKS_ERROR, payload: err.response.data, message: err.response.data.message})
            }else{
                return dispatch({type: SEARCH_BANKS_ERROR, payload: err, message: 'Something went wrong, please try again later.'})
            }
        }
    }
}

export const getAllBank = (page, pageSize, text) => {
    return async dispatch => {
        dispatch({type: GET_BANKS_LOADING, message: 'Loading'})
        try{
            const searchRes = await getAllBanks(page, pageSize, text)
            if(searchRes.statusCode === 200){
                return dispatch({type: GET_BANKS_SUCCESS, payload: searchRes.data, message: searchRes.data.message})
            }else{
                return dispatch({type: GET_BANKS_ERROR, payload: searchRes.data, message: searchRes.data.message})
            }
        }catch(err){
            if(!!err && !!err.response && !!err.response.data && !!err.response.data.message){
                return dispatch({type: GET_BANKS_ERROR, payload: err.response.data, message: err.response.data.message})
            }else{
                return dispatch({type: GET_BANKS_ERROR, payload: err, message: 'Something went wrong, please try again later.'})
            }
        }
    }
}

export const getAllConnectedBank = _ => {
    return async dispatch => {
        dispatch({type: GET_CONNECTED_BANKS_LOADING, message: 'Loading'})
        try{
            const connectedRes = await getConnectedBanks()
            if(connectedRes.statusCode === 200){
                return dispatch({type: GET_CONNECTED_BANKS_SUCCESS, payload: connectedRes.data, message: connectedRes.data.message})
            }else{
                return dispatch({type: GET_CONNECTED_BANKS_ERROR, payload: connectedRes.data, message: connectedRes.data.message})
            }
        }catch(err){
            if(!!err && !!err.response && !!err.response.data && !!err.response.data.message){
                return dispatch({type: GET_CONNECTED_BANKS_ERROR, payload: err.response.data, message: err.response.data.message})
            }else{
                return dispatch({type: GET_CONNECTED_BANKS_ERROR, payload: err, message: 'Something went wrong, please try again later.'})
            }
        }
    }
}

export const deleteBank = id => {
    return async dispatch => {
        dispatch({type: DELETED_BANKS_LOADING, message: 'Loading'})
        try{
            const connectedRes = await deleteConnectedBank(id)
            if(connectedRes.statusCode === 200){
                return dispatch({type: DELETED_BANKS_SUCCESS, payload: connectedRes.data, message: connectedRes.message})
            }else{
                return dispatch({type: DELETED_BANKS_ERROR, payload: connectedRes.data, message: connectedRes.message})
            }
        }catch(err){
            if(!!err && !!err.response && !!err.response.data && !!err.response.data.message){
                return dispatch({type: DELETED_BANKS_ERROR, payload: err.response.data, message: err.response.data.message})
            }else{
                return dispatch({type: DELETED_BANKS_ERROR, payload: err, message: 'Something went wrong, please try again later.'})
            }
        }
    }
}

export const updateBalance = id => {
    return async dispatch => {
        dispatch({type: UPDATE_BALANCE_LOADING, message: 'Loading'})
        try{
            const updateRes = await updateBankBalance(id)
            if(updateRes.statusCode === 200){
                return dispatch({type: UPDATE_BALANCE_SUCCESS, payload: updateRes.data, message: updateRes.message})
            }else{
                return dispatch({type: UPDATE_BALANCE_ERROR, payload: updateRes.data, message: updateRes.message})
            }
        }catch(err){
            if(!!err && !!err.response && !!err.response.data && !!err.response.data.message){
                return dispatch({type: UPDATE_BALANCE_ERROR, payload: err.response.data, message: err.response.data.message})
            }else{
                return dispatch({type: UPDATE_BALANCE_ERROR, payload: err, message: 'Something went wrong, please try again later.'})
            }
        }
    }
}