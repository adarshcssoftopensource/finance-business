import { HTTP_GET } from "../components/app/components/purchase/Components/bills/constants/BillFormConstants";
import request from "./request";

// Get list of all plans
export const getPlans = async (planType) => {
  return request({
    url: `/api/v1/plans${planType ? `?recurring=${planType}` : ''}`,
    method: HTTP_GET
  });
}