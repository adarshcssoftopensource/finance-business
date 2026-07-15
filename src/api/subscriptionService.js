import {
  HTTP_GET,
  HTTP_POST,
  HTTP_PUT
} from "../components/app/components/purchase/Components/bills/constants/BillFormConstants";
import request from "./request";
import requestWithToken from "./requestWithToken";
import requestWithTokenBlob from "./requestWithTokenBlob";
// Get active subscription
export const getActivePlan = async () => {
  return requestWithToken({
    url: `/api/v1/subscriptions/me/subscription`,
    method: HTTP_GET
  });
}

// Get  subscription billing history
export const getBillingHistory = async () => {
  return requestWithToken({
    url: `/api/v1/subscriptions/me/billings`,
    method: HTTP_GET
  });
}

// Get  subscription payments card
export const getPaymentCards = async () => {
  return requestWithToken({
    url: `/api/v1/subscriptions/me/cards`,
    method: HTTP_GET
  });
}

// Initiate Card Intent 
export const initateAddCardIntent = async (data) => {
  return request({
    url: `/api/v1/subscriptions/initateAddCardIntent`,
    method: HTTP_POST,
    data
  });
}

// Create Subscription 
export const createCustomerAndSubscription = async (data) => {
  return request({
    url: `/api/v1/subscriptions`,
    method: HTTP_POST,
    data
  });
}

// Apply Coupon 
export const applyCoupon = async (data) => {
  return request({
    url: `/api/v1/coupons/verify`,
    method: HTTP_POST,
    data
  });
}

export const updateCustomerCard = async (data) => {
  const subscriptionId = data.subscriptionId
  delete data.subscriptionId
  return requestWithToken({
    url: `/api/v1/subscriptions/${subscriptionId}/cards`,
    method: HTTP_PUT,
    data
  });
}

export const updateSubscription = async (data) => {
  const subscriptionId = data.subscriptionId
  delete data.subscriptionId
  return requestWithToken({
    url: `/api/v1/subscriptions/${subscriptionId}`,
    method: HTTP_PUT,
    data
  });
}

export const downloadSubscriptionPdf = async (data) => {
  return requestWithTokenBlob({
    url: `/api/v1/subscriptions/${data.subscriptionId}/payments/${data.paymentId}/export`,
    method: HTTP_GET
  });
}

