import requestWithToken from "./requestWithToken";

export const getAllDisputes = (pageNo, pageSize) => {
  return requestWithToken({
    url: `/api/v1/disputes/?pageNo=${pageNo}&pageSize=${pageSize}`,
    method: 'GET',
  });
};

export const getDispute = (id) => {
  return requestWithToken({
    url: `/api/v1/disputes/${id}`,
    method: 'GET',
  });
};

export const getDisputeDocuments = () => {
  return requestWithToken({
    url: `/api/v1/disputes/helpers/documents`,
    method: 'GET',
  });
};

export const manageDispute = (id, data) => {
  return requestWithToken({
    url: `/api/v1/disputes/${id}`,
    method: 'PATCH',
    data
  });
};

const DisputeService = {
  getAllDisputes,
  getDispute,
  getDisputeDocuments,
  manageDispute,
};

export default DisputeService;