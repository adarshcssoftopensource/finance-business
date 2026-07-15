import { getMySession, signOutSession } from "../api/deviceSession";
import {
  SET_SESSION_ERROR_STATE,
  SET_MY_DEVICE_SESSION,
  START_DEVICE_SESSION_LOADING,
  STOP_DEVICE_SESSION_LOADING
} from "../constants/ActionTypes";

export function getSession(queryString) {
  return async dispatch => {
    dispatch({ type: START_DEVICE_SESSION_LOADING });
    return getMySession(queryString)
      .then(statementResponse => {
        if (statementResponse.statusCode === 200) {
          const sessions = statementResponse.data?.allUserSession
          const userId = localStorage.getItem("user.id")
          // Demo/static: empty session list must not wipe the login (mock APIs often return [])
          if (
            userId &&
            Array.isArray(sessions) &&
            sessions.length > 0 &&
            !sessions.some(session => session.userId === userId || session.userId === String(userId))
          ) {
            console.log("User session invalid. Logging out...");
            localStorage.clear();
            return;
          }
          dispatch({
            type: SET_MY_DEVICE_SESSION,
            payload: statementResponse.data
          });
          dispatch({ type: STOP_DEVICE_SESSION_LOADING });
          return statementResponse;
        }
        dispatch({ type: STOP_DEVICE_SESSION_LOADING });
      })
      .catch(error => {
        dispatch({
          type: SET_SESSION_ERROR_STATE,
          message: error.message
        });
        dispatch({ type: STOP_DEVICE_SESSION_LOADING });
      });
  };
}

export function signOutSelectedSession(id, payload, fetchSession = false, queryString) {
  return async (dispatch) => {
    dispatch({ type: START_DEVICE_SESSION_LOADING });
    return signOutSession(id, payload)
      .then((res) => {
        if (res.statusCode === 200 && fetchSession) {
          dispatch(getSession(queryString));
        }
      })
      .catch((error) => {
        dispatch({
          type: SET_SESSION_ERROR_STATE,
          message: error.message
        });
        dispatch({ type: STOP_DEVICE_SESSION_LOADING });
      });
  }
}
