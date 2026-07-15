import { GET_VERIFICATION_SUCCESS } from '../constants/ActionTypes';

const initialState = {
  verification: ''
}

const verificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_VERIFICATION_SUCCESS:
      return {
        ...state,
        verification: action.payload,
      }
    default:
      return state;
  }
}

export default verificationReducer