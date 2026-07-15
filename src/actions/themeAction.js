import * as actionTypes from "../constants/ActionTypes";
import { setUserThemeMode } from "../api/globalServices";
import { openGlobalSnackbar } from "./snackBarAction";
import {errorHandle} from "./errorHandling";

export const setThemeMode = data => {
  return {
    type: actionTypes.THEME_MODE,
    data
  };
}

export const setThemeModeAction = (data) => {
  return async (dispatch, getState) => {
      try{
          const res = await setUserThemeMode({ themeMode: data });
          if(res.statusCode === 200){
              return dispatch(setThemeMode(data))
          }
      }catch(err){
        dispatch(openGlobalSnackbar(errorHandle(err), true))
        return Promise.reject(err);
      }
  }
}