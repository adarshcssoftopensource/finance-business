import {
  HTTP_GET,
  HTTP_PATCH,
  HTTP_POST
} from '../components/app/components/Estimates/components/constant'
import requestWithToken from './requestWithToken'

export const addSalesSetting = data => {
  if (data.salesSettingInput) {
    if (data.salesSettingInput.userId) {
      delete data.salesSettingInput.userId
    }
    if (data.salesSettingInput.businessId) {
      delete data.salesSettingInput.businessId
    }
  }
  return requestWithToken({
    url: `/api/v1/settings/sales`,
    method: HTTP_POST,
    data
  })
}

export const fetchSalesSetting = () => {
  return requestWithToken({
    url: '/api/v1/settings/sales',
    method: HTTP_GET
  })
}

export const patchSalesSetting = data => {
  if (data.salesSettingInput) {
    if (data.salesSettingInput.userId) {
      delete data.salesSettingInput.userId
    }
    if (data.salesSettingInput.businessId) {
      delete data.salesSettingInput.businessId
    }
  }
  return requestWithToken({
    url: '/api/v1/settings/sales',
    method: HTTP_PATCH,
    data
  })
}

export const fetchPurchaseSetting = () => {
  return requestWithToken({
    url: '/api/v1/settings/purchase',
    method: HTTP_GET
  })
}

export const savePurchaseSetting = data => {
  return requestWithToken({
    url: `/api/v1/settings/purchase`,
    method: HTTP_PATCH,
    data
  })
}

export const fetchPaymentSetting = () => {
  return requestWithToken({
    url: '/api/v1/settings/payment',
    method: HTTP_GET
  })
}

export const savePaymentSetting = data => {
  return requestWithToken({
    url: `/api/v1/settings/payment`,
    method: HTTP_PATCH,
    data
  })
}

export const savePaymentSettingForce = data => {
  return requestWithToken({
    url: `/api/v1/settings/payment/force`,
    method: HTTP_PATCH,
    data
  })
}

export const fetchProcessingFee = () => {
  return requestWithToken({
    url: '/api/v1/settings/payment/processing-fee',
    method: HTTP_GET
  })
}

export const updatePassFee = data => {
  return requestWithToken({
    url: '/api/v1/settings/payment/pass-fee',
    method: HTTP_PATCH,
    data
  })
}

export const resetPassFee = () => {
  return requestWithToken({
    url: '/api/v1/settings/payment/pass-fee/reset',
    method: HTTP_POST
  })
}


export const changeStatementDescriptors = data => {
  return requestWithToken({
    url: `/api/v1/settings/payment/legals`,
    method: HTTP_PATCH,
    data
  })
}

export const saveBankAutoTransferSetting = data => {
  return requestWithToken({
    url: `/api/v1/settings/payout`,
    method: HTTP_PATCH,
    data
  })
}

export const sendOnBoardingOTP = data => {
  return requestWithToken({
    url: `/api/v1/settings/otp/send`,
    method: HTTP_POST,
    data
  })
}

export const verifyOnBoardingOTP = data => {
  return requestWithToken({
    url: `/api/v1/settings/otp/verify`,
    method: HTTP_POST,
    data
  })
}

const SettingsService = {
  sendOnBoardingOTP,
  verifyOnBoardingOTP
}

export default SettingsService;