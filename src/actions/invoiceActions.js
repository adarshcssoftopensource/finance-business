import * as invoiceServices from "../api/InvoiceService";
import * as actionTypes from "../constants/ActionTypes";

export const getBankAccounts = data => {
    return async (dispatch, getState) => {
      dispatch({ type: actionTypes.GET_ALL_ACCOUNTS_LOADING, payload: null, message: 'Loading' });
        try{
            let allACCOUNTS = await invoiceServices.getBankAccounts(data);
            if(allACCOUNTS.statusCode === 200){
                return dispatch({type: actionTypes.GET_ALL_ACCOUNTS_SUCCESS, message: allACCOUNTS.message, payload: allACCOUNTS.data})
            }else{
                return dispatch({type: actionTypes.GET_ALL_ACCOUNTS_ERROR, payload: allACCOUNTS.data, message: allACCOUNTS.message})
            }
        }catch(err){
            return dispatch({type: actionTypes.GET_ALL_ACCOUNTS_ERROR, payload: err, message: 'Something Went Wrong!'})
        }
    }
};

export const getInvoicePayments = id => {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.GET_ALL_INVOICE_PAYMENTS_LOADING, payload: null, message: 'Loading' });
    try {
      let allPayments = await invoiceServices.getInvoicePayments(id);
      if (allPayments.statusCode === 200) {
        return dispatch({
          type: actionTypes.GET_ALL_INVOICE_PAYMENTS_SUCCESS,
          message: allPayments.message,
          payload: allPayments.data
        })
      } else {
        return dispatch({
          type: actionTypes.GET_ALL_INVOICE_PAYMENTS_ERROR,
          payload: allPayments.data,
          message: allPayments.message
        })
      }
    } catch (err) {
      return dispatch({
        type: actionTypes.GET_ALL_INVOICE_PAYMENTS_ERROR,
        payload: err,
        message: 'Something Went Wrong!'
      })
    }
  }
};

export const getInvoices = query => {
    return async (dispatch, getState) => {
        const { invoice } = getState()
        let pageNo = 1, pageSize = 10;
        if(!!invoice.data && !!invoice.data.meta){
            pageNo = invoice.data.meta.pageNo
            pageSize = invoice.data.meta.pageSize
        }
      dispatch({ type: actionTypes.FETCH_INVOICE_LOADING});
        try{
            let res = await invoiceServices.getInvoices(!!query ? query : `pageNo=${pageNo}&pageSize=${pageSize}`);
            if(res.statusCode === 200){
                return dispatch({type: actionTypes.FETCH_INVOICE_SUCCESS,  payload: res.data})
            }else{
                return dispatch({type: actionTypes.FETCH_INVOICE_ERROR, payload: res.data})
            }
        }catch(err){
            return dispatch({type: actionTypes.FETCH_INVOICE_ERROR, payload: err})
        }
    }
};
