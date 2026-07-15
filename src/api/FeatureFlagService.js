import { HTTP_GET } from "../components/app/components/Estimates/components/constant";
import request from "./request";

export const getFlags = data => {
  return request({
    url: `/api/v1/feature-flags`,
    method: HTTP_GET,
    data
  });
};
