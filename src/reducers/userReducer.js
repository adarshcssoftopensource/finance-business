import {START_USER_DATA_LOADING, TOTP_SET_UP_LOADING, USER_DATA} from '../constants/ActionTypes';

const initialState = {
  loading: false,
  user: {},
  userAuth:{},
}

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case START_USER_DATA_LOADING:
      return {
        ...state,
        loading: true,
      }
    case USER_DATA:
      return {
        ...state,
        user: action.payload,
        loading: false,
      }
    case TOTP_SET_UP_LOADING:
      return {
        ...state,
        userAuth:{
          ...state.userAuth,
          isLoading: action.payload
        }
      }
    default:
      return state;
  }
}

export default userReducer