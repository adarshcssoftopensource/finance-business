import * as types from './transactionTypes';
import { getTransactionsData, saveTransactions, disableTransactions, editTransactions } from '../../api/bankingServices';

export const getAllTransactionsData = _ => {
    return async dispatch => {
        dispatch({type: types.GET_TRANSACTIONS_DATA_LOADING, message: 'Loading'})
        try{
            const transRes = await getTransactionsData()
            if(transRes.statusCode === 200){
                return dispatch({type: types.GET_TRANSACTIONS_DATA_SUCCESS, payload: transRes.data, message: transRes.message})
            }else{
                return dispatch({type: types.GET_TRANSACTIONS_DATA_ERROR, payload: transRes.data, message: transRes.message})
            }
        }catch(err){
            if(!!err && !!err.response && !!err.response.data && !!err.response.data.message){
                return dispatch({type: types.GET_TRANSACTIONS_DATA_ERROR, payload: err.response.data, message: err.response.data.message})
            }else{
                return dispatch({type: types.GET_TRANSACTIONS_DATA_ERROR, payload: err, message: 'Something went wrong, please try again later.'})
            }
        }
    }
}

export const saveTransactionsImport = (id, data) => {
    return async dispatch => {
        dispatch({type: types.SAVE_TRANSACTIONS_LOADING, message: 'Loading'})
        try{
            const transImportRes = await saveTransactions(id, data)
            if(transImportRes.statusCode === 200 || transImportRes.statusCode === 201){
                return dispatch({type: types.SAVE_TRANSACTIONS_SUCCESS, payload: transImportRes.data, message: transImportRes.message})
            }else{
                return dispatch({type: types.SAVE_TRANSACTIONS_ERROR, payload: transImportRes.data, message: transImportRes.message})
            }
        }catch(err){
            if(!!err && !!err.response && !!err.response.data && !!err.response.data.message){
                return dispatch({type: types.SAVE_TRANSACTIONS_ERROR, payload: err.response.data, message: err.response.data.message})
            }else{
                return dispatch({type: types.SAVE_TRANSACTIONS_ERROR, payload: err, message: 'Something went wrong, please try again later.'})
            }
        }
    }
}

export const disableTransactionsImport = (id, data) => {
    return async dispatch => {
        dispatch({type: types.SAVE_TRANSACTIONS_LOADING, message: 'Loading'})
        try{
            const transDisableImportRes = await disableTransactions(id, data)
            if(transDisableImportRes.statusCode === 200){
                return dispatch({type: types.SAVE_TRANSACTIONS_SUCCESS, payload: transDisableImportRes.data, message: transDisableImportRes.message})
            }else{
                return dispatch({type: types.SAVE_TRANSACTIONS_ERROR, payload: transDisableImportRes.data, message: transDisableImportRes.message})
            }
        }catch(err){
            if(!!err && !!err.response && !!err.response.data && !!err.response.data.message){
                return dispatch({type: types.SAVE_TRANSACTIONS_ERROR, payload: err.response.data, message: err.response.data.message})
            }else{
                return dispatch({type: types.SAVE_TRANSACTIONS_ERROR, payload: err, message: 'Something went wrong, please try again later.'})
            }
        }
    }
}

export const editTransactionsImport = (id, data) => {
    return async dispatch => {
        dispatch({type: types.SAVE_TRANSACTIONS_LOADING, message: 'Loading'})
        try{
            const transDisableImportRes = await editTransactions(id, data)
            if(transDisableImportRes.statusCode === 200){
                return dispatch({type: types.SAVE_TRANSACTIONS_SUCCESS, payload: transDisableImportRes.data, message: transDisableImportRes.message})
            }else{
                return dispatch({type: types.SAVE_TRANSACTIONS_ERROR, payload: transDisableImportRes.data, message: transDisableImportRes.message})
            }
        }catch(err){
            if(!!err && !!err.response && !!err.response.data && !!err.response.data.message){
                return dispatch({type: types.SAVE_TRANSACTIONS_ERROR, payload: err.response.data, message: err.response.data.message})
            }else{
                return dispatch({type: types.SAVE_TRANSACTIONS_ERROR, payload: err, message: 'Something went wrong, please try again later.'})
            }
        }
    }
}