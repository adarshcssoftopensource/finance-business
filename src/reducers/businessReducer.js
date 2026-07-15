import * as actionTypes from '../constants/ActionTypes';
import { STATIC_BUSINESS } from '../utils/static-auth';

const initialSettings = {
    business: [{ ...STATIC_BUSINESS }],
    errorMessage:'',
    selectedBusiness: { ...STATIC_BUSINESS },
};
const businessReducer = (state = initialSettings, action) => {
    switch (action.type) {
        case actionTypes.FETCH_BUSINESS: {
            const list = Array.isArray(action.payload)
              ? action.payload
              : Array.isArray(action.payload?.ownerAccess)
                ? action.payload.ownerAccess
                : [{ ...STATIC_BUSINESS }]
            return {
                ...state,
                business: list.length ? list : [{ ...STATIC_BUSINESS }],
                errorMessage:''
            }
        }
            case actionTypes.SELECTED_BUSINESS: {
            const selected = {
                  ...STATIC_BUSINESS,
                  ...(action.selectedBusiness || {}),
                  meta: {
                    ...STATIC_BUSINESS.meta,
                    ...(action.selectedBusiness?.meta || {}),
                    invoice: {
                      ...STATIC_BUSINESS.meta.invoice,
                      ...(action.selectedBusiness?.meta?.invoice || {}),
                    },
                    recurring: {
                      ...STATIC_BUSINESS.meta.recurring,
                      ...(action.selectedBusiness?.meta?.recurring || {}),
                    },
                  },
                  subscription: {
                    ...STATIC_BUSINESS.subscription,
                    ...(action.selectedBusiness?.subscription || {}),
                    isSubscribed: true,
                  },
                  isSubscribed: true,
                  organizationName:
                    action.selectedBusiness?.organizationName ||
                    action.selectedBusiness?.name ||
                    STATIC_BUSINESS.organizationName,
                }
            const existing = Array.isArray(state.business) ? state.business : []
            const inList = existing.some(b => b._id === selected._id)
            return{
                ...state,
                selectedBusiness: selected,
                business: inList ? existing : [selected, ...existing],
                errorMessage:''
            }
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
