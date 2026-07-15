
import * as Services from "../api/timelineServices";
import * as actionTypes from "../constants/ActionTypes";

export const getEventTimeLine = (entityId) => {
  return async (dispatch) => {
    dispatch({ type: actionTypes.GET_TIME_LINE_LOADER });
    try {
      let res = await Services.getTimeLine(entityId);
      if (res.statusCode === 200) {
        return dispatch({ type: actionTypes.GET_TIME_LINE_SUCCESS, message: res.message, payload: res.data, id: entityId })
      } else {
        return dispatch({ type: actionTypes.GET_TIME_LINE_FAILED, payload: res.data, message: res.message })
      }
    } catch (err) {
      return dispatch({ type: actionTypes.GET_TIME_LINE_FAILED, payload: err, message: err.message })
    }
  }
};