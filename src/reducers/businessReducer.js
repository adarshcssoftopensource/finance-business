import * as actionTypes from '../constants/ActionTypes';

const initialSettings = {
    business: [],
    errorMessage:''

};
const businessReducer = (state = initialSettings, action) => {
    switch (action.type) {
        case actionTypes.FETCH_BUSINESS:
            return {
                ...state,
                business: action.payload,
                errorMessage:''
            }
            case actionTypes.SELECTED_BUSINESS:
            return{
                ...state,
                selectedBusiness:action.selectedBusiness,
                errorMessage:''
            }
            case actionTypes.BUSINESS_FAILED:
            return{
                ...state,
                errorMessage:action.errorMessage

            }
            case actionTypes.LEGAL_DETAILS_LOADING:
                return {
                    ...state,
                    type: action.type,
                }
            case actionTypes.LEGAL_DETAILS_SUCCESS:
                return {
                    ...state,
                    type: action.type,
                    legalDetails: action.payload
                }
            case actionTypes.LEGAL_DETAILS_ERROR:
                return {
                    ...state,
                    type: action.type,
                    legalDetails: action.payload
                }
            case actionTypes.ONBOARDING_RULES:
                return {
                    ...state,
                    onboardingRules: action.onboardingRules,
                    errorMessage:''
                }
        default:
            return state;
    }
};

export default businessReducer;
