import history from "../customHistory";
import CheckoutServices from "../api/CheckoutService";
import * as actionTypes from "../constants/ActionTypes";
import { errorHandle } from "../actions/errorHandling";
import { openGlobalSnackbar } from './snackBarAction';

export const checkoutError = errorMessage => {
    return { type: actionTypes.CHECKOUT_FAILED, errorMessage };
};

export const checkoutList = checkouts => {
    return {
        type: actionTypes.FETCH_CHECKOUTS,
        payload: checkouts
    };
};

export function resetAddCheckout() {
    return function (dispatch) {
        return dispatch({
            type: actionTypes.RESET_ADD_CHECKOUT
        });
    };
}

export const addCheckout = (checkoutInfo)=> {
    return async (dispatch) => {
        try {
            const response= await CheckoutServices.addCheckout(checkoutInfo)
            if(response.statusCode===201){
                 dispatch({
                    type: actionTypes.ADD_CHECKOUT
                });
                return response
            }
        } catch (error) {
            dispatch(openGlobalSnackbar('Something went worng, please try again', true))
            return error
        }

    }
}

export function fetchCheckouts(query) {
    return async (dispatch, getState) => {
        const { checkoutReducer } = getState()
        let pageNo = 1, pageSize = 10;
        if(!!checkoutReducer.checkouts && !!checkoutReducer.checkouts.meta){
            pageNo = checkoutReducer.checkouts.meta.pageNo
            pageSize = checkoutReducer.checkouts.meta.pageSize
        }
        return CheckoutServices.fetchCheckouts(!!query ? query : `pageNo=${pageNo}&pageSize=${pageSize}`)
            .then(checkoutsResponse => {
                if (checkoutsResponse.statusCode === 200) {
                    return dispatch(checkoutList(checkoutsResponse.data));
                } else if (checkoutsResponse.statusCode === 351) {
                    return dispatch(checkoutList([]));
                }
            })
            .catch(error => {
                return dispatch(checkoutList([]));
            });
    };
}

export function fetchCheckoutByUUID(uuid) {
    return async dispatch => {
        return CheckoutServices.fetchCheckoutByUUID(uuid)
            .then(checkoutsResponse => {
                if (checkoutsResponse.statusCode === 200) {
                    dispatch({
                        type: actionTypes.FETCH_CHECKOUT_BY_ID,
                        selectedCheckout: checkoutsResponse.data.checkout
                    });
                    return {
                        type: actionTypes.FETCH_CHECKOUT_BY_ID,
                        selectedCheckout: checkoutsResponse.data.checkout
                    }
                }
            })
            .catch(error => {
            });
    };
}

export function fetchCheckoutById(checkoutId) {
    return async dispatch => {
        try {
            const response = await CheckoutServices.fetchCheckoutById(checkoutId);
            if (response.statusCode === 200) {
                return dispatch({
                    type: actionTypes.FETCH_CHECKOUT_BY_ID,
                    selectedCheckout: response.data.checkout
                });
            }
        } catch (error) {
            dispatch(checkoutError(error));
        }
    };
}

export function deleteCheckout(id) {
    return function (dispatch) {
        return CheckoutServices.deleteCheckout(id)
            .then(checkoutResponse => {
                if (checkoutResponse.statusCode === 200) {
                    return { message: "success" };
                }
            })
            .catch(error => {
                return dispatch({
                    type: actionTypes.CHECKOUT_FAILED,
                    payload: error
                });
            });
    };
}

export function doCheckoutPayment(checkoutInfo) {
    return function (dispatch, getState) {
        return CheckoutServices.doCheckoutPaymentById(checkoutInfo)
            .then(checkoutPaymentResponse => {
                if (checkoutPaymentResponse.statusCode === 201) {
                    return dispatch({
                        type: actionTypes.CHECKOUT_PAYMENT
                    });
                }
            })
            .catch(errorResposne => {
                return dispatch({
                    error: errorResposne.data
                })
            });
    };
}
export function checkUserInBussiess(bussinessId,userEmail){
    return function(dispatch){
        return CheckoutServices.checkUserInBussiness(bussinessId,userEmail).then(response => {
            return dispatch({
                type: actionTypes.CHECK_USER,
                payload: response.data
            })
        })
    }
}