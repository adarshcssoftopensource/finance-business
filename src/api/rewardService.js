import requestWithToken from "./requestWithToken";

export const getRewardBalance = () => {
  return requestWithToken({
    url: `/api/v1/rewards/balance`,
    method: 'GET',
  });
};

export const getEarnRewardHistory = (queryString) => {
  return requestWithToken({
    url: `/api/v1/rewards?${queryString}`,
    method: 'GET',
  });
};


const RewardService = {
  getRewardBalance,
  getEarnRewardHistory,
};

export default RewardService;