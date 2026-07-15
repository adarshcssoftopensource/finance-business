import requestWithToken from "./requestWithToken";
import request from "./request";

export const initiateCard = id => {
  return requestWithToken({
    url: `/api/v2/customers/${id}/cards/initiate`,
    method: "POST"
  });
};

export const initiatePublicCard = () => {
  return request({
    url: `/api/v2/customers/cards/initiate/public`,
    method: "GET"
  });
};

export const addCard = (id, data) => {
  return requestWithToken({
    url: `/api/v2/customers/${id}/cards`,
    method: "POST",
    data
  });
};

export const addCardAfterPayment = (id, data) => {
  return requestWithToken({
    url: `/api/v2/customers/public/${id}/add-card`,
    method: "POST",
    data
  });
};
