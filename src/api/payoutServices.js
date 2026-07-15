import requestWithToken from "./requestWithToken";

//Payout Services

export const getAllPayout = (data) => {
  return requestWithToken({
    url: `/api/v1/payout?${data}`,
    method: 'GET',
  });
};

export const getSinglePayoutById = (id) => {
  return requestWithToken({
    url: `/api/v1/payout/${id}`,
    method: 'GET',
  });
};
