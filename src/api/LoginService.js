import {
  STATIC_AUTH_TOKEN,
  STATIC_BUSINESS,
  STATIC_BUSINESS_ID,
  STATIC_BUSINESS_NAME,
  STATIC_USER,
  STATIC_USER_NAME,
  isValidStaticLogin,
} from '../utils/static-auth'

const mockResponse = (data = {}, extra = {}) =>
  Promise.resolve({ statusCode: 200, data, status: 200, ...extra })

const mockError = (message, statusCode = 401) =>
  Promise.resolve({
    statusCode,
    status: statusCode,
    message,
    data: { message },
  })

function authPayload(email) {
  return {
    accessToken: STATIC_AUTH_TOKEN,
    refreshToken: STATIC_AUTH_TOKEN,
    accessTokenExpiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
    user: {
      name: STATIC_USER_NAME,
      email: email || STATIC_USER.email,
      primaryEmail: STATIC_USER.email,
    },
  }
}

function authenticate(data = {}) {
  if (!isValidStaticLogin(data)) {
    return mockError('Invalid email or password.')
  }
  // Password OK without OTP; if OTP tab is used, isValidStaticLogin already checked it
  return mockResponse(authPayload(data.email))
}

function googleAuth() {
  return mockResponse(authPayload(STATIC_USER.email))
}

export const forgotPassword = () => mockResponse({ success: true })

const generateResetLink = () => mockResponse({ success: true })

const resetPassword = () => mockResponse({ success: true })

const verifyResetLink = () => mockResponse({ success: true })

const assumeUser = () => mockResponse({ accessToken: STATIC_AUTH_TOKEN, refreshToken: STATIC_AUTH_TOKEN })

const refreshToken = () =>
  mockResponse({
    accessToken: STATIC_AUTH_TOKEN,
    refreshToken: STATIC_AUTH_TOKEN,
    accessTokenExpiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
  })

const callMe = () =>
  mockResponse({
    user: STATIC_USER,
    businesses: [{ ...STATIC_BUSINESS }],
    selectedBusiness: { ...STATIC_BUSINESS, _id: STATIC_BUSINESS_ID },
    onBoardingRules: {
      isDisputeEnabled: true,
      isPaymentsEnabled: true,
    },
  })

const inviteUser = () => mockResponse({ success: true })

const updateUser = () => mockResponse({ user: STATIC_USER })

const deleteDelegateUser = () => mockResponse({ success: true })

const LoginService = {
  authenticate,
  googleAuth,
  generateResetLink,
  verifyResetLink,
  assumeUser,
  resetPassword,
  refreshToken,
  callMe,
  inviteUser,
  deleteDelegateUser,
  updateUser,
}

export default LoginService

// re-export for tests / UI hints
export { STATIC_BUSINESS_NAME, STATIC_BUSINESS_ID }
