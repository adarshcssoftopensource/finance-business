import * as types from '../constants/ActionTypes';
import { initialState } from './initialValues';

export const getAllPayout = (state = initialState, { type, payload, message }) => {
  switch (type) {
    case types.GET_ALL_PAYOUT_SUCCESS:
      return {
        ...state,
        success: true,
        loading: false,
        error: false,
        data: payload,
        message
      };
    case types.GET_ALL_PAYOUT_ERROR:
      return {
        ...state,
        success: false,
        loading: false,
        error: true,
        data: payload,
        message
      };
    case types.GET_ALL_PAYOUT_LOADING:
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

export const singlePayout = (state = initialState, { type, payload, message }) => {
  switch (type) {
    case types.GET_SINGLE_PAYOUT_SUCCESS:
      return {
        ...state,
        success: true,
        loading: false,
        error: false,
        data: payload,
        message
      };
    case types.GET_SINGLE_PAYOUT_ERROR:
      return {
        ...state,
        success: false,
        loading: false,
        error: true,
        data: payload,
        message
      };
    case types.GET_ALL_PAYOUT_LOADING:
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
