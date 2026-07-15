import {
  THEME_MODE
} from '../constants/ActionTypes';

const initialTheme = {
  themeMode: ''
}

export const getThemeMode = (state = initialTheme, action) => {
  switch (action.type) {
    case THEME_MODE: return {
          ...state,
          themeMode: action.data
      }
      default:
          return state;
  }
}