import requestWithToken from './requestWithToken';
import request from './request'
import requestWithTokenBlob from './requestWithTokenBlob';

function patchPayment(data) {
  return requestWithToken({
    url: '/api/v2/payments/onboarding',
    method: 'PATCH',
    data: { data },
  });
}

function createPerson(data) {
  return requestWithToken({
    url: '/api/v2/payments/stripe/create-person',
    method: 'POST',
    data,
  });
}

function addBusinessInLegals() {
  return requestWithToken({
    url: '/api/v2/payments/add-business-legals',
    method: 'POST',
  });
}

function fetchPayment(data) {
  return requestWithToken({
    url: '/api/v1/payments/onboarding',
    method: 'GET',
  });
}

function verify(data) {
  return requestWithToken({
    url: '/api/v1/payments/verify',
    method: 'POST',
    data,
  });
}

function getPaymentById(id) {
  return requestWithToken({
    url: `/api/v1/payments/${id}`,
    method: 'GET',
  });
}

function getAllPayments(data) {
  const pData = JSON.parse(localStorage.getItem('paginationData'))
  let url = `/api/v1/payments?pageNo=${data.pageNo}&pageSize=${pData && pData.limit ? pData.limit : 10}`;
  if (data && data.checkoutId) {
    url = `${url}&checkoutId=${data.checkoutId}`;
  }else if(data && data.peymeId){
    url = `${url}&peymeId=${data.peymeId}`;
  } else if (data && data.fundingId) {
    url = `${url}&fundingId=${data.fundingId}`;
  } else if (data.startDate || data.endDate || data.text) {
    url = `${url}${
      data.startDate ? `&startDate=${data.startDate}` : ''
      }${data.endDate ? `&endDate=${data.endDate}` : ''}${
      data.text ? `&text=${data.text}` : ''
      }`;
  }
  if(data.type){
    url = `${url}&status=${data.type}`
  }
  return requestWithToken({
    url,
    method: 'GET',
    data: data,
  });
}

function getRefundById(id) {
  return requestWithToken({
    url: `/api/v1/refunds/${id}`,
    method: 'GET',
  });
}

function getRefundByPaymentId(id) {
  return requestWithToken({
    url: `/api/v1/refunds/payments/${id}`,
    method: 'GET',
  });
}

function getAllRefunds(data) {
  const pData = JSON.parse(localStorage.getItem('paginationData'))
  let url = `/api/v1/refunds?pageNo=${data.pageNo}&pageSize=${pData && pData.limit ? pData.limit : 10}`;
  if (data.startDate || data.endDate || data.text) {
    url = `${url}${
      data.startDate ? `&startDate=${data.startDate}` : ''
      }${data.endDate ? `&endDate=${data.endDate}` : ''}${
      data.text ? `&text=${data.text}` : ''
      }`;
  }
  return requestWithToken({
    url,
    method: 'GET',
    data
  });
}

function createRefund(data) {
  return requestWithToken({
    url: '/api/v3/refunds',
    method: 'POST',
    data,
  });
}

function doCheckoutPayment(data) {
  return requestWithToken({
    url: '/api/v2/payments/invoice/charge',
    method: 'POST',
    data,
  });
}

function chargeCardService(data) {
  return requestWithToken({
    url: '/api/v2/payments/invoice/charge',
    method: 'POST',
    data,
  });
}

function chargeEmailService(data) {
  return request({
    url: '/api/v2/payments/invoice/charge/public',
    method: 'POST',
    data,
  });
}

function attachCard(data) {
  return requestWithToken({
    url: '/api/v2/payments/public/attach-card',
    method: 'POST',
    data,
  });
}
function turnOnPayments() {
  return requestWithToken({
    url: '/api/v2/payments/turn-on-payments',
    method: 'PUT',
  });
}

function updatePaymentStatus(data, paymentId) {
  return requestWithToken({
    url: `/api/v2/payments/${paymentId}/update-status`,
    method: 'POST',
    data,
  });
}
function updatePaymentStatusPid(paymentId) {
  return requestWithToken({
    url: `/api/v2/payments/payment-status-by-intent/${paymentId}`,
    method: 'GET',
  });
}

function fetchPlaidLinkToken(data = {}) {
  return requestWithToken({
    url: '/api/v2/payments/onboarding/plaid/link-token',
    method: 'POST',
    data,
  });
}

function connectBank(token) {
  return requestWithToken({
    url: '/api/v2/payments/onboarding/connect-bank',
    method: 'POST',
    data: {
      publicToken: token,
    },
  });
}

function getKycUrl() {
  return requestWithToken({
    url: '/api/v2/payments/create-onboarding-link',
    method: 'POST',
    data: {},
  });
}

function skipStep() {
  return requestWithToken({
    url: '/api/v2/payments/onboarding/skip-banking',
    method: 'PATCH',
    data: {},
  });
}

function updateOnboardingStepStatus() {
  return requestWithToken({
    url: '/api/v2/payments/onboarding/update-status',
    method: 'PATCH',
    data: {},
  });
}

function addPerson(data) {
  return requestWithToken({
    url: '/api/v2/payments/onboarding/create-person',
    method: 'POST',
    data,
  });
}

function deletePerson(personId) {
  return requestWithToken({
    url: `/api/v2/payments/onboarding/${personId}/delete-person`,
    method: 'Delete',
    data: {},
  });
}

function getPayoutBalance() {
  return requestWithToken({
    url: `/api/v1/payout/balance`,
    method: 'GET',
  });
}

export const transferAmountToBank = (data) => {
	return requestWithToken({
		url: `api/v1/payout/transfertobank`,
		method: 'POST',
		data
	})
}

export const fetchPaymentOnboardingSteps = (step) => {
  return requestWithToken({
		url: `api/v1/payment-onboarding/?step=${step}`,
		method: 'GET'
	})
}

export const submitData = (data) => {
 return requestWithToken({
  url: `api/v1/payment-onboarding/`,
  method: 'POST',
  data : {data}
 })
}

export const exportPaymentItems = async (filter) => {
	let url = `api/v1/payments/export?${filter}`;
	return requestWithTokenBlob({
		url,
		method: 'GET'
	})
}

export const requestPayPalSignUp = (data) => {
  return requestWithToken({
    url: `api/v1/payment-paypal-onboarding/`,
    method: 'GET',
  })
}

export const requestAvailableProvider = (businessId) => {
  return requestWithToken({
    url: `/api/v1/payment-onboarding/${businessId}/providers`,
    method: "GET"
  });
};

export const setSelectedProvider = (data) => {
  return requestWithToken({
    url: `/api/v1/payment-onboarding/${data.businessId}/providers`,
    method: "POST",
    data
  });
};

export const submitPayByBankOnboarding = (data) => {
  return requestWithToken({
    url: '/api/v1/pay-by-bank/onboarding',
    method: 'POST',
    data
  });
};

export const submitBnplOnboarding = (data) => {
  return requestWithToken({
    url: '/api/v1/bnpl/onboarding',
    method: 'POST',
    data
  });
};

const PaymentService = {
  patchPayment,
  fetchPayment,
  verify,
  createPerson,
  getAllPayments,
  getPaymentById,
  getAllRefunds,
  getRefundById,
  getRefundByPaymentId,
  createRefund,
  doCheckoutPayment,
  chargeCardService,
  updatePaymentStatus,
  updatePaymentStatusPid,
  attachCard,
  chargeEmailService,
  addBusinessInLegals,
  turnOnPayments,
  connectBank,
  fetchPlaidLinkToken,
  getKycUrl,
  skipStep,
  addPerson,
  updateOnboardingStepStatus,
  deletePerson,
  getPayoutBalance,
  transferAmountToBank,
  fetchPaymentOnboardingSteps,
  submitData,
  exportPaymentItems,
  requestPayPalSignUp,
  requestAvailableProvider,
  setSelectedProvider,
  submitPayByBankOnboarding,
  submitBnplOnboarding
};

export default PaymentService;
