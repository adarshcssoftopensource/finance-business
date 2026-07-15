import requestWithToken from "./requestWithToken";
import request from "./request";
import { HTTP_GET, HTTP_PUT, HTTP_POST, HTTP_DELETE } from "../components/app/components/Estimates/components/constant";
import requestWithBlob from "./requestWithBlob";

export const addEstimate = data => {
    return requestWithToken({
        url: `/api/v1/estimates`,
        method: HTTP_POST,
        data
    });
};
export const cloneEstimate = (id) => {
    return requestWithToken({
        url: `/api/v1/estimates/cloneestimate/` + id,
        method: HTTP_PUT
    });
};

export const fetchEstimates = (queryString) => {
    if (queryString) {
        return requestWithToken({
            url: `/api/v1/estimates?${queryString}`,
            method: HTTP_GET
        });
    }
    return requestWithToken({
        url: "/api/v1/estimates",
        method: HTTP_GET
    });
};

export const deleteEstimate = id => {
    return requestWithToken({
        url: "/api/v1/estimates/" + id,
        method: HTTP_DELETE
    });
};

export const fetchEstimateById = estimateId => {
    return requestWithToken({
        url: "/api/v1/estimates/" + estimateId,
        method: HTTP_GET
    });
};

export const updateEstimate = (estimateId, data) => {
    return requestWithToken({
        url: `/api/v1/estimates/${estimateId}`,
        method: HTTP_PUT,
        data
    });
};

export const createLatestEstimateNumber = () => {
    return requestWithToken({
        url: "/api/v1/estimates/createestimatenumber",
        method: HTTP_GET
    });
};

export const fetchLatestEstimateNumber = () => {
    return requestWithToken({
        url: "/api/v1/estimates/nextestimatenumber",
        method: HTTP_GET
    });
};

export const checkEstimateNumberExist = (estimateNumber) => {
    return requestWithToken({
        url: "/api/v1/estimates/checkestimatenumber/" + estimateNumber,
        method: HTTP_GET
    });
}

export const fetchEstimateByUUID = (uuid, isUser) => {
    return request({
        url: `/api/v1/estimates/public/share/${uuid}?isUser=${isUser}`,
        method: HTTP_GET
    });
};

export const fetchUsersEmails = id => {
    return requestWithToken({
        url: `/api/v2/users/me/emails`,
        method: HTTP_GET
    });
};

export const convertEstimateToInvoice = estimateId => {
    return requestWithToken({
        url: `/api/v1/estimates/${estimateId}/convert`,
        method: HTTP_POST
    });
};

export const mailEstimate = (estimateId, data) => {
    return requestWithToken({
        url: `/api/v1/estimates/${estimateId}/mail`,
        method: HTTP_POST,
        data
    });
};
