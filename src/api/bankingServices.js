import request from "./request";
import requestWithToken from "./requestWithToken";


//Banking Services

export const getAllBanks = (pageNo, pageSize, text) => {
  return requestWithToken({
    url: `/api/v1/banks/search?pageno=${pageNo}&pagesize=${pageSize}&keyword=${text}`,
    method: 'GET',
  });
};

export const fetchPlaidLinkToken = (data = {}) => {
  return requestWithToken({
    url: '/api/v1/banks/plaid/link-token',
    method: 'POST',
    data,
  });
};

export const saveBank = (token) => {
  return requestWithToken({
    url: `/api/v1/banks`,
    method: 'POST',
    data: {
      "plaidPublicToken": token
    }
  })
}

export const getConnectedBanks = () => {
  return requestWithToken({
    url: `/api/v1/banks`,
    method: 'GET',
  });
}

export const deleteConnectedBank = (id) => {
  return requestWithToken({
    url: `/api/v1/banks/${id}`,
    method: 'DELETE',
  });
}

export const updateBankBalance = (id) => {
  return requestWithToken({
    url: `/api/v1/banks/${id}`,
    method: 'GET',
  });
}


//Transaction Services//

export const getTransactionsData = _ => {
  return requestWithToken({
    url: `/api/v1/banks/trasactionsimport`,
    method: 'GET',
  });
}

export const saveTransactions= (id, data) => {
  return requestWithToken({
    url: `/api/v1/banks/${id}/trasactionsimport`,
    method: 'POST',
    data
  })
}

export const disableTransactions= (id, data) => {
  return requestWithToken({
    url: `/api/v1/banks/${id}/trasactionsimport`,
    method: 'PATCH',
    data
  })
}

export const editTransactions= (id, data) => {
  return requestWithToken({
    url: `/api/v1/banks/account/${id}`,
    method: 'PATCH',
    data
  })
}

export const getUpdatedPlaidToken = id => {
  return requestWithToken({
    url: `/api/v1/banks/${id}/getpublictoken`,
    method: 'GET'
  })
}