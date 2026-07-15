import requestWithToken from "./requestWithToken";

export const fetchAllBanners = () => {
  return requestWithToken({
    url: `/api/v1/banner`,
    method: 'GET'
  });
}

export const updateBannerStatus = (id, data) => {
  return requestWithToken({
    url: `/api/v1/banner/${id}`,
    method: 'PATCH',
    data
  });
}

const BannerService = {
  fetchAllBanners,
  updateBannerStatus
}

export default BannerService;