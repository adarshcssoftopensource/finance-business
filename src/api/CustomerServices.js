import {
  HTTP_DELETE,
  HTTP_GET,
  HTTP_PUT,
  HTTP_POST
} from "../components/app/components/Estimates/components/constant";
import requestWithToken from "./requestWithToken";

function addCustomer(data) {
  return requestWithToken({
    url: "/api/v1/customers",
    method: "POST",
    data
  });
}

function csvUploadForCustomers(data) {
  return requestWithToken({
    url: "/api/v1/customers/import",
    method: "POST",
    data
  });
}

function fetchCustomers(query) {
  return requestWithToken({
    url: `/api/v1/customers${!!query ? `?${query}` : ''}`,
    method: "GET"
  });
}

function fetchCustomersSlim() {
  return requestWithToken({
    url: `/api/v1/customers/slim`,
    method: "GET"
  });
}

function getRewardBalance() {
  return requestWithToken({
    url: `/api/v1/rewards/balance`,
    method: 'GET',
  });
};

function sendMassMessage(payload) {
  return requestWithToken({
    url: `/api/v1/customers/submit-message-approval`,
    method: HTTP_POST,
    data: payload
  });
};

function fetchMessageRequests(query) {
  return requestWithToken({
    url: `/api/v1/customers/message-requests${!!query ? `?${query}` : ''}`,
    method: HTTP_GET
  });
}

function purchaseCredits({ sku, paymentMethodId }) {
  if (!sku || !paymentMethodId) throw new Error('Credit pack and payment method are required');

  return requestWithToken({
    url: "/api/v1/customers/purchase-credits",
    method: HTTP_POST,
    data: { sku, paymentMethodId }
  });
}

function fetchCreditPacks() {
  return requestWithToken({
    url: "/api/v1/customers/credit-packs",
    method: "GET",
  });
}

function blockCustomer(customerId) {
  return requestWithToken({
    url: "/api/v1/customers/block",
    method: HTTP_POST,
    data: { customerId }
  });
}

function unblockCustomer(customerId) {
  return requestWithToken({
    url: "/api/v1/customers/unblock",
    method: HTTP_POST,
    data: { customerId }
  });
}

function deleteCustomer(id) {
  return requestWithToken({
    url: "/api/v1/customers/" + id,
    method: "DELETE"
  });
}

function fetchCustomerById(customerId) {
  return requestWithToken({
    url: "/api/v1/customers/" + customerId,
    method: "GET"
  });
}

function updateCustomerById(customerId, data) {
  return requestWithToken({
    url: `/api/v1/customers/${customerId}`,
    method: HTTP_PUT,
    data
  });
}

function fetchCountries() {
  return requestWithToken({
    url: "/api/v1/utility/public/countries/",
    method: "GET"
  });
}

export const fetchStatesByCountryId = id => {
  return requestWithToken({
    url: "/api/v1/utility/public/countries/" + id,
    method: "GET"
  });
};

export const fetchCurrencies = async () => {
  const currencies = localStorage.getItem('currencies')
  if (!!currencies) {
    return JSON.parse(currencies)
  } else {
    const res = await requestWithToken({
      url: '/api/v1/utility/public/currencies/',
      method: 'GET'
    })
    localStorage.setItem('currencies', JSON.stringify(res))
    return res
  }
}

function fetchCustomerCards(id) {
  return requestWithToken({
    url: `/api/v2/customers/${id}/cards`,
    method: HTTP_GET
  });
}

function deleteCustomerCards(id, paymentMethodId) {
  return requestWithToken({
    url: `/api/v2/customers/${id}/cards/${paymentMethodId}`,
    method: HTTP_DELETE
  });
}


function attachCard(data) {
  return requestWithToken({
    url: `/api/v2/customers/attach-card`,
    method: HTTP_POST,
    data
  })
}

const customerServices = {
  addCustomer,
  purchaseCredits,
  fetchCustomers,
  fetchCustomersSlim,
  deleteCustomer,
  fetchCustomerById,
  getRewardBalance,
  fetchCreditPacks,
  updateCustomerById,
  sendMassMessage,
  fetchMessageRequests,
  fetchCountries,
  fetchCurrencies,
  csvUploadForCustomers,
  fetchCustomerCards,
  deleteCustomerCards,
  blockCustomer,
  unblockCustomer,
  attachCard
};

export default customerServices;
