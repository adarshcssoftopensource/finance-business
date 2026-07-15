import * as types from '../constants/ActionTypes';
import { initialState } from './initialValues';

export const getEventTimeline = (state = initialState, { type, payload, message, id }) => {
  switch (type) {
    case types.GET_TIME_LINE_SUCCESS:
      return {
        ...state,
        success: true,
        loading: false,
        error: false,
        data: payload,
        id,
        message
      };
    case types.GET_TIME_LINE_FAILED:
      return {
        ...state,
        success: false,
        loading: false,
        error: true,
        data: payload,
        message
      };
    case types.GET_TIME_LINE_LOADER:
      return {
        ...state,
        loading: true,
        success: false,
        error: false,
        message
      };
    default:
      return state;
  }
};