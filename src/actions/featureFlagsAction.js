import _ from 'lodash';
const { FETCH_FEATURE_FLAG_SUCCESS } = require("../constants/ActionTypes");
const { getFlags } = require("../api/FeatureFlagService");

export const requestFeatureFlags = () => {
  return async (dispatch, getState) => {
    try {
      const response = await getFlags();
      if (response.statusCode === 200) {
        const { settings } = getState();
        if (!_.isEqual(response.data, settings?.featureFlags)) {
          dispatch({
            type: FETCH_FEATURE_FLAG_SUCCESS,
            payload: response.data
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
};
