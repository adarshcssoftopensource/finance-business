import * as recurringService from '../api/RecurringService'
import * as actionTypes from '../constants/ActionTypes'

export const getAllRecurringInvoices = query => {
  return async (dispatch, getState) => {
    dispatch({
      type: actionTypes.GET_ALL_RECURRING_LOADING,
      payload: null,
      message: 'Loading'
    })
    try {
      // const { getAllRecurring } = getState()
      //    let pageNo = 1, pageSize = 10;
      // if (!!getAllRecurring.data && !!getAllRecurring.data.meta) {
      //   pageNo = getAllRecurring.data.meta.pageNo
      //   pageSize = getAllRecurring.data.meta.pageSize
      // }
      let allRecurringData = await recurringService.getRecurringInvoices(query)
      if (allRecurringData.statusCode === 200) {
        return dispatch({
          type: actionTypes.GET_ALL_RECURRING_SUCCESS,
          message: allRecurringData.message,
          payload: allRecurringData.data
        })
      } else {
        return dispatch({
          type: actionTypes.GET_ALL_RECURRING_ERROR,
          payload: allRecurringData.data,
          message: allRecurringData.message
        })
      }
    } catch (err) {
      return dispatch({
        type: actionTypes.GET_ALL_RECURRING_ERROR,
        payload: err,
        message: 'Something Went Wrong!'
      })
    }
  }
}

export const getRecurringCounts = (query=null) => {
  return async (dispatch, getState) => {
    dispatch({
      type: actionTypes.GET_ALL_RECURRING_COUNT_LOADING,
      payload: null,
      message: 'Loading'
    })
    try {
      const { getAllRecurring } = getState()
      let pageNo = 1, pageSize = 10;
      if (!!getAllRecurring.data && !!getAllRecurring.data.meta) {
        pageNo = getAllRecurring.data.meta.pageNo
        pageSize = getAllRecurring.data.meta.pageSize
      }
      let allRecurringCount = await recurringService.getRecurringInvoicesCount(
        !!query ? query : ``
      )
      if (allRecurringCount.statusCode === 200) {
        return dispatch({
          type: actionTypes.GET_ALL_RECURRING_COUNT_SUCCESS,
          message: allRecurringCount.message,
          payload: allRecurringCount.data
        })
      } else {
        return dispatch({
          type: actionTypes.GET_ALL_RECURRING_COUNT_ERROR,
          payload: allRecurringCount.data,
          message: allRecurringCount.message
        })
      }
    } catch (err) {
      return dispatch({
        type: actionTypes.GET_ALL_RECURRING_COUNT_ERROR,
        payload: err,
        message: 'Something Went Wrong!'
      })
    }
  }
}

export const addPaymentInInvoice = (id, data) => {
  return async dispatch => {
    const cardsData = await recurringService.addPaymentInRecurring(id, data)
    if (cardsData.statusCode === 200) {
      return dispatch({
        type: actionTypes.ADD_CARDS,
        payload: cardsData.data
      })
    }
  }
}

export const getRecurringCards = (id) => {
  return async dispatch => {
    const cardsData = await recurringService.getInvoicePaymentMethods(id);
    if (cardsData.statusCode === 200) {
      return dispatch({
        type: actionTypes.GET_RECURRING_CARDS,
        payload: cardsData.data.card
      })
    }
  }
}