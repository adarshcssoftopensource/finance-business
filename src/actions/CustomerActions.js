import * as actionTypes from "../constants/ActionTypes";
import { openGlobalSnackbar } from "./snackBarAction";
import { logger } from "../utils/GlobalFunctions";
import customerServices from "../api/CustomerServices";

export const addCustomer = customerInfo => {
  return async dispatch => {
    try {
      let response = await customerServices.addCustomer(customerInfo);
      if (response.statusCode === 201) {
        dispatch({
          type: actionTypes.ADD_CUSTOMER,
          payload: response.data
        });
        response.data.customer.statusCode = response.statusCode
        response.data.customer.message = response.message
        return response.data.customer;
      }
    } catch (error) {
      logger.error("Error in customer add", error)
      dispatch(
        openGlobalSnackbar(error.message, true)
      );
      return error;
    }
  };
};

export const purchaseCreditsAction = (pkgOrSku, paymentMethodId) => {
  return async (dispatch) => {
    try {
      const sku = typeof pkgOrSku === 'string' ? pkgOrSku : pkgOrSku.sku;

      if (!paymentMethodId) throw new Error('Payment method is required');

      const response = await customerServices.purchaseCredits({
        sku,
        paymentMethodId
      });

      if (response.success) {
        dispatch(openGlobalSnackbar('Purchase initiated successfully!', false));
      } else {
        dispatch(openGlobalSnackbar(response.message || 'Failed to purchase credits', true));
      }

      return response;
    } catch (err) {
      dispatch(openGlobalSnackbar(err.message, true));
      return err;
    }
  };
};

export const fetchCreditPacksAction = () => {
  return async dispatch => {
    try {
      const response = await customerServices.fetchCreditPacks();
      if (response.success) {
        dispatch({
          type: actionTypes.SET_CREDIT_PACKS,
          payload: response.packs
        });
      }
      return response;
    } catch (err) {
      dispatch(openGlobalSnackbar(err.message, true));
      return err;
    }
  }
}

export const blockCustomer = (customerId) => {
  return async dispatch => {
    try {
      const response = await customerServices.blockCustomer(customerId);
      if (response.statusCode === 200) {
        dispatch({ type: actionTypes.BLOCK_CUSTOMER, payload: response.data.customer });
        dispatch(openGlobalSnackbar(response.message, false));
      }
      return response;
    } catch (error) {
      dispatch(openGlobalSnackbar(error.message, true));
      return error;
    }
  };
};

export const unblockCustomer = (customerId) => {
  return async dispatch => {
    try {
      const response = await customerServices.unblockCustomer(customerId);
      if (response.statusCode === 200) {
        dispatch({ type: actionTypes.UNBLOCK_CUSTOMER, payload: response.data.customer });
        dispatch(openGlobalSnackbar(response.message, false));
      }
      return response;
    } catch (error) {
      dispatch(openGlobalSnackbar(error.message, true));
      return error;
    }
  };
};

export const massMessage = (payload) => {
  return async dispatch => {
    try {
      const response = await customerServices.sendMassMessage(payload);
      if (response.statusCode === 200) {
        dispatch({
          type: actionTypes.SET_REWARD_BALANCE,
          payload: response.data?.balance?.availablePoints || 0
        });
        dispatch(openGlobalSnackbar(response.message, false));
      }
      return response;
    } catch (error) {
      dispatch(openGlobalSnackbar(error.message, true));
      return error;
    }
  };
};

export const fetchMessageRequestsAction = (query) => {
  return async dispatch => {
    try {
      const response = await customerServices.fetchMessageRequests(query);
      if (response.statusCode === 200) {
        dispatch({
          type: actionTypes.FETCH_MESSAGE_REQUESTS,
          payload: response.data
        });
      }
      return response;
    } catch (error) {
      dispatch(openGlobalSnackbar(error.message, true));
      return error;
    }
  };
};

export const fetchRewardBalance = (businessId) => {
  return async dispatch => {
    try {
      const response = await customerServices.getRewardBalance(businessId);
      if (response.statusCode === 200) {
        dispatch({
          type: actionTypes.SET_REWARD_BALANCE,
          payload: response.data.availablePoints
        });
        dispatch(openGlobalSnackbar(response.message, false));
      }
      return response;
    } catch (error) {
      dispatch(openGlobalSnackbar(error.message, true));
      return error;
    }
  };
};

export const resetAddCustomer = () => {
  return async dispatch => {
    return dispatch({
      type: actionTypes.RESET_ADD_CUSTOMER
    });
  };
};

export const updateCustomer = (customerId, customerInfo) => {
  return async dispatch => {
    try {
      const response = await customerServices.updateCustomerById(
        customerId,
        customerInfo
      );
      if (response.statusCode === 200) {
        dispatch({
          type: actionTypes.UPDATE_CUSTOMER,
          payload: response.data
        });
        response.data.customer.statusCode = response.statusCode
        response.data.customer.message = response.message
        return response.data.customer;
      }
    } catch (error) {
      logger.error("Update customer", error)
      dispatch(
        openGlobalSnackbar(error.message, true)
      );
      return error
    }
  };
};

export const deleteCustomer = id => {
  return async dispatch => {
    try {
      const response = await customerServices.deleteCustomer(id);
      dispatch(
        openGlobalSnackbar(response.message, !response.statusCode === 200)
      );
      return { message: response.message, statusCode: response.statusCode };
    } catch (error) {
      dispatch(
        openGlobalSnackbar(error.message, true)
      );
    }
  };
};

export const fetchCustomers = (query) => {
  return async dispatch => {
    try {
      let response = await customerServices.fetchCustomers(query);
      if (response.statusCode === 200) {
        return dispatch({
          type: actionTypes.FETCH_CUSTOMERS,
          payload: response.data
        });
      }
    } catch (error) {
      dispatch(
        openGlobalSnackbar(error.message, true)
      );
    }
  };
};

export const setSelectedCustomer = customer => {
  return {
    type: actionTypes.FETCH_CUSTOMER_BY_ID,
    selectedCustomer: customer
  };
};

export const setCountry = country => {
  return {
    type: actionTypes.SET_COUNTRY,
    payload: country
  };
};

export const setCountrytStates = selectedCountryStates => {
  return {
    type: actionTypes.SET_STATES,
    payload: selectedCountryStates
  };
};

export const setCountrytStatesForShipping = selectedCountryStates => {
  return {
    type: actionTypes.SET_STATES_FOR_SHIPPING,
    payload: selectedCountryStates
  };
};

export const resetCountrytStates = selectedCountryStates => {
  return {
    type: actionTypes.RESET_STATES
  };
};

// export function seCountrytStates(selectedCountryStates) {
//     return function (dispatch) {
//         return dispatch({
//             type: actionTypes.SET_STATES,
//             payload: selectedCountryStates
//         });
//     }
// }

export const fetchCustomerById = customerId => {
  return async dispatch => {
    try {
      const response = await customerServices.fetchCustomerById(customerId);
      if (response.statusCode === 200) {
        return dispatch(setSelectedCustomer(response.data.customer));
      }
    } catch (error) {
      dispatch(
        openGlobalSnackbar(error.message, true)
      );
    }
  };
};

export const fetchCountries = async () => {
  try {
    const response = await customerServices.fetchCountries();
    if (response) {
      return response.countries;
    }
  } catch (error) {
  }
};

export const fetchCurrencies = async () => {
  try {
    const response = await customerServices.fetchCurrencies();
    if (response) {
      return response;
    }
  } catch (error) {
    return error;
  }
};

export const fetchStatesByCountryId = async id => {
  try {
    const response = await customerServices.fetchStatesByCountryId(id);
    if (response) {
      return response;
    }
  } catch (error) {
    return error;
  }
};

export const fetchAllCustomerCards = id => {
  return async (dispatch, getState) => {
    dispatch({
      type: actionTypes.GET_ALL_CUSTOMER_CARDS_LOADING,
      payload: null,
      message: "Loading"
    });
    try {
      const response = await customerServices.fetchCustomerCards(id);
      if (response.statusCode === 200) {
        return dispatch({
          type: actionTypes.GET_ALL_CUSTOMER_CARDS_SUCCESS,
          payload: response.data,
          message: response.message
        });
      } else {
        return dispatch({
          type: actionTypes.GET_ALL_CUSTOMER_CARDS_ERROR,
          payload: response.data,
          message: response.message
        });
      }
    } catch (err) {
      return dispatch({
        type: actionTypes.GET_ALL_CUSTOMER_CARDS_ERROR,
        payload: err,
        message: err.message
      });
    }
  };
};

export const deleteCustomerCard = (id, paymentMethodId) => {
  return async (dispatch, getState) => {
    dispatch({
      type: actionTypes.DELETE_CUSTOMER_CARDS_LOADING,
      payload: null,
      message: "Loading"
    });
    try {
      const response = await customerServices.deleteCustomerCards(
        id,
        paymentMethodId
      );
      if (response.statusCode === 200) {
        return dispatch({
          type: actionTypes.DELETE_CUSTOMER_CARDS_SUCCESS,
          payload: response.data,
          message: response.message
        });
      } else {
        return dispatch({
          type: actionTypes.DELETE_CUSTOMER_CARDS_ERROR,
          payload: response.data,
          message: response.message
        });
      }
    } catch (err) {
      return dispatch({
        type: actionTypes.DELETE_CUSTOMER_CARDS_ERROR,
        payload: err,
        message: err.message
      });
    }
  };
};


export const attachCardToCustomer = (data) => async dispatch => {
  try {
    await customerServices.attachCard(data)
  }
  catch (error) {
    dispatch(openGlobalSnackbar(error.message, true))
  }
}