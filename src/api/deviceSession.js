import requestWithToken from "./requestWithToken";

export const getMySession = (queryString) => {
  return requestWithToken({
    url: `api/v2/auth/me/session/${localStorage.getItem("refreshToken")}?${queryString}`,
    method: "GET",
  });
};

export const signOutSession = (id, data) => {
  return requestWithToken({
    url: `api/v2/auth/me/session/${id}`,
    method: "patch",
    data
  });
};
