import requestWithToken from "./requestWithToken";
import queryString from 'query-string';

export function fetchBankAccounts(limit) {
  return requestWithToken({
    url: `api/v2/dashboard/bank/accounts${!!limit ? `?limit=${limit}` : ""}`,
    method: 'GET',
  })
}

export function fetchBankAccountsById(insitueId) {
  return requestWithToken({
    url: `api/v2/dashboard/bank/accounts/${insitueId}`,
    method: 'GET',
  })
}

export function fetchPayableInvoices(limit = 5) {
  return requestWithToken({
    url: `api/v2/dashboard/payable/invoices?limit=${limit}`,
    method: 'GET',
  })
}

export function fetchOwingBills(limit = 5) {
  return requestWithToken({
    url: `api/v2/dashboard/owing/bills?limit=${limit}`,
    method: 'GET',
  })
}

export function fetchNetIncome(limit) {
  return requestWithToken({
    url: `api/v2/dashboard/income?limit=${limit}`,
    method: 'GET',
  })
}

export function fetchOverdueInvoices(limit=5) {
  return requestWithToken({
    url: `api/v2/dashboard/overdue/invoices?limit=${limit}`,
    method: 'GET',
  })
}

export function fetchOverdueBills(limit=5) {
  return requestWithToken({
    url: `api/v2/dashboard/overdue/bills?limit=${limit}`,
    method: 'GET',
  })
}

export function fetchExpenseBreakdown(limit) {
  return requestWithToken({
    url: `api/v1/dashboard/expense/category?limit=${limit}`,
    method: 'GET',
  })
}

export function fetchCashFlow(limit = 12, startDate, endDate) {
  let qs = {};
  if (limit) {
    qs.limit = limit
  }
  if (startDate) {
    qs.startDate = startDate
  }
  if (endDate) {
    qs.endDate = endDate
  }
  const query = queryString.stringify(qs)
  return requestWithToken({
    url: `api/v2/dashboard/cashflow?${query}`,
    method: 'GET',
  })
}

export function fetchIncomeByCustomers(startDate, endDate) {
  let qs = {};
  if (startDate) {
    qs.startDate = startDate
  }
  if (endDate) {
    qs.endDate = endDate
  }
  const query = queryString.stringify(qs)
  return requestWithToken({
    url: `api/v2/dashboard/customers-income?${query}`,
    method: 'GET',
  })
}

export function fetchPurchaseByVendors(startDate, endDate) {
  let qs = {};
  if (startDate) {
    qs.startDate = startDate
  }
  if (endDate) {
    qs.endDate = endDate
  }
  const query = queryString.stringify(qs)
  return requestWithToken({
    url: `api/v2/dashboard/vendor-purchases?${query}`,
    method: 'GET',
  })
}

export function fetchAgedReceivables(date) {
  let qs = {};
  if (date) {
    qs.date = date
  }
  const query = queryString.stringify(qs)
  return requestWithToken({
    url: `api/v2/dashboard/aged-receivables?${query}`,
    method: 'GET',
  })
}

export function fetchAgedPayables(date) {
  let qs = {};
  if (date) {
    qs.date = date
  }
  const query = queryString.stringify(qs)
  return requestWithToken({
    url: `api/v2/dashboard/aged-payables?${query}`,
    method: 'GET',
  })
}

export function fetchProfitAndLoss(limit = 12) {
  return requestWithToken({
    url: `api/v2/dashboard/profit?limit=${limit}`,
    method: 'GET',
  })
}
