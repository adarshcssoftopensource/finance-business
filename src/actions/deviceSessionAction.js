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
          // If the session is expired, logout user session
          const { allUserSession } = statementResponse.data;
          const userId = localStorage.getItem("user.id"); // Get the user ID from localStorage
          if (userId) {
            const isSessionValid = allUserSession.some(session => session.userId === userId);
            if (!isSessionValid) {
              localStorage.clear();
              console.log("User session invalid. Logging out...");
              return; // Exit early to avoid setting invalid session data
            }
          }
          // If the session is valid, set the session data
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
