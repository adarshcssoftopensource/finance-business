/** Demo auth — no backend. Login only for this email + password (+ OTP if prompted). */

export const STATIC_LOGIN_EMAIL = 'finance@gmail.com'
export const STATIC_PASSWORD = 'fiance@123'
export const STATIC_OTP = '1234'

export const STATIC_BUSINESS_ID = 'biz1'
export const STATIC_BUSINESS_NAME = 'Finance Studio'
export const STATIC_USER_NAME = 'Alex Morgan'

const ACL_PERMISSIONS = [
  { resource: '*', allowed: true, scope: ['read', 'write'] },
  { resource: 'invoices', allowed: true, scope: ['read', 'write'] },
  { resource: 'payments', allowed: true, scope: ['read', 'write'] },
  { resource: 'customers', allowed: true, scope: ['read', 'write'] },
  { resource: 'banking', allowed: true, scope: ['read', 'write'] },
  { resource: 'estimates', allowed: true, scope: ['read', 'write'] },
  { resource: 'products', allowed: true, scope: ['read', 'write'] },
  { resource: 'bills', allowed: true, scope: ['read', 'write'] },
  { resource: 'receipts', allowed: true, scope: ['read', 'write'] },
  { resource: 'vendors', allowed: true, scope: ['read', 'write'] },
  { resource: 'reports', allowed: true, scope: ['read', 'write'] },
  { resource: 'checkout', allowed: true, scope: ['read', 'write'] },
  { resource: 'peyme', allowed: true, scope: ['read', 'write'] },
  { resource: 'crowdfunding', allowed: true, scope: ['read', 'write'] },
]

/** Valid JWT shape so jwt-decode accepts it (signature not verified). */
export const STATIC_AUTH_TOKEN =
  'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJkYXRhIjp7InVzZXIiOnsiX2lkIjoiYml6LXVzZXItZmluYW5jZSIsInByaW1hcnlFbWFpbCI6ImZpbmFuY2VAZ21haWwuY29tIiwicHJpbWFyeUJ1c2luZXNzIjoiYml6MSIsImJ1c2luZXNzSWRzIjpbImJpejEiXSwiYWNsIjp7InBlcm1pc3Npb25zIjpbeyJyZXNvdXJjZSI6IioiLCJhbGxvd2VkIjp0cnVlLCJzY29wZSI6WyJyZWFkIiwid3JpdGUiXX0seyJyZXNvdXJjZSI6Imludm9pY2VzIiwiYWxsb3dlZCI6dHJ1ZSwic2NvcGUiOlsicmVhZCIsIndyaXRlIl19LHsicmVzb3VyY2UiOiJwYXltZW50cyIsImFsbG93ZWQiOnRydWUsInNjb3BlIjpbInJlYWQiLCJ3cml0ZSJdfSx7InJlc291cmNlIjoiY3VzdG9tZXJzIiwiYWxsb3dlZCI6dHJ1ZSwic2NvcGUiOlsicmVhZCIsIndyaXRlIl19LHsicmVzb3VyY2UiOiJiYW5raW5nIiwiYWxsb3dlZCI6dHJ1ZSwic2NvcGUiOlsicmVhZCIsIndyaXRlIl19LHsicmVzb3VyY2UiOiJlc3RpbWF0ZXMiLCJhbGxvd2VkIjp0cnVlLCJzY29wZSI6WyJyZWFkIiwid3JpdGUiXX0seyJyZXNvdXJjZSI6InByb2R1Y3RzIiwiYWxsb3dlZCI6dHJ1ZSwic2NvcGUiOlsicmVhZCIsIndyaXRlIl19LHsicmVzb3VyY2UiOiJiaWxscyIsImFsbG93ZWQiOnRydWUsInNjb3BlIjpbInJlYWQiLCJ3cml0ZSJdfSx7InJlc291cmNlIjoicmVjZWlwdHMiLCJhbGxvd2VkIjp0cnVlLCJzY29wZSI6WyJyZWFkIiwid3JpdGUiXX0seyJyZXNvdXJjZSI6InZlbmRvcnMiLCJhbGxvd2VkIjp0cnVlLCJzY29wZSI6WyJyZWFkIiwid3JpdGUiXX0seyJyZXNvdXJjZSI6InJlcG9ydHMiLCJhbGxvd2VkIjp0cnVlLCJzY29wZSI6WyJyZWFkIiwid3JpdGUiXX0seyJyZXNvdXJjZSI6ImNoZWNrb3V0IiwiYWxsb3dlZCI6dHJ1ZSwic2NvcGUiOlsicmVhZCIsIndyaXRlIl19LHsicmVzb3VyY2UiOiJwZXltZSIsImFsbG93ZWQiOnRydWUsInNjb3BlIjpbInJlYWQiLCJ3cml0ZSJdfSx7InJlc291cmNlIjoiY3Jvd2RmdW5kaW5nIiwiYWxsb3dlZCI6dHJ1ZSwic2NvcGUiOlsicmVhZCIsIndyaXRlIl19XX19fSwiZXhwIjo5OTk5OTk5OTk5fQ.'

export const STATIC_BUSINESS = {
  _id: STATIC_BUSINESS_ID,
  name: STATIC_BUSINESS_NAME,
  organizationName: STATIC_BUSINESS_NAME,
  role: 'Owner',
  isPrimary: true,
  isSubscribed: true,
  country: { id: '231', name: 'United States', code: 'US' },
  currency: { code: 'USD', symbol: '$', decimalPlaces: 2 },
  meta: {
    invoice: { firstVisit: false },
    recurring: { firstVisit: false },
    estimate: { firstVisit: false },
    bill: { firstVisit: false },
  },
  subscription: {
    title: 'Growth',
    planLevel: 2,
    name: 'Growth',
    isSubscribed: true,
  },
}

export const STATIC_USER = {
  _id: 'biz-user-finance',
  name: STATIC_USER_NAME,
  firstName: 'Alex',
  lastName: 'Morgan',
  email: STATIC_LOGIN_EMAIL,
  primaryEmail: STATIC_LOGIN_EMAIL,
  themeMode: 'light',
  acl: { permissions: ACL_PERMISSIONS },
}

export function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase()
}

export function isStaticLoginEmail(email) {
  return normalizeEmail(email) === STATIC_LOGIN_EMAIL
}

export function isStaticPassword(password) {
  return String(password || '') === STATIC_PASSWORD
}

export function isStaticOtp(otp) {
  return String(otp || '').trim() === STATIC_OTP
}

export function isValidStaticLogin({ email, password, OTP } = {}) {
  if (!isStaticLoginEmail(email) || !isStaticPassword(password)) {
    return false
  }
  if (OTP != null && String(OTP).length > 0 && !isStaticOtp(OTP)) {
    return false
  }
  return true
}
