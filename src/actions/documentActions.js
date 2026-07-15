import * as documentServices from "../api/documentService";
import * as actionTypes from "../constants/ActionTypes";

export const getAllDocuments = () => {
  return async (dispatch) => {
    dispatch({ type: actionTypes.GET_ALL_DOCUMENTS_LOADING, payload: null, message: 'Loading' });
    try {
      let allDocuments = await documentServices.fetchAllDocuments();
      if (allDocuments.statusCode === 200) {
        return dispatch({ type: actionTypes.GET_ALL_DOCUMENTS_SUCCESS, payload: allDocuments.data })
      } else {
        return dispatch({ type: actionTypes.GET_ALL_DOCUMENTS_ERROR, payload: allDocuments.data })
      }
    } catch (err) {
      return dispatch({ type: actionTypes.GET_ALL_DOCUMENTS_ERROR, payload: err, message: err.message })
    }
  }
};
