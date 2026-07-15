import * as types from '../constants/ActionTypes';
import { initialState } from './initialValues';

export const documentsReducer = (state = initialState, { type, payload, message }) => {
  switch (type) {
    case types.GET_ALL_DOCUMENTS_SUCCESS:
      return {
        ...state,
        success: true,
        loading: false,
        error: false,
        data: payload,
        message
      };
    case types.GET_ALL_DOCUMENTS_ERROR:
      return {
        ...state,
        success: false,
        loading: false,
        error: true,
        data: payload,
        message
      };
    case types.GET_ALL_DOCUMENTS_LOADING:
      return {
        ...state,
        loading: true,
        success: false,
        error: false,
        data: payload,
        message
      };
    default:
      return state;
  }
};
