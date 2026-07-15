import decode from 'jwt-decode'
import {
  STATIC_BUSINESS_ID,
  STATIC_LOGIN_EMAIL,
  STATIC_USER,
  isStaticLoginEmail,
} from './static-auth'

export const _readToken = (token) => {
  if (!token) return { data: { user: {} } }
  try {
    const tokenData = decode(token)
    return tokenData
  } catch (e) {
    console.error('Token decoding failed for token:', token, e)
    return { data: { user: {} } }
  }
}

export const _getUser = (token) => {
  const {
    data: { user },
  } = _readToken(token)
  if (!user) return {}
  // Demo/static sessions: always expose full sidebar ACL
  if (isStaticLoginEmail(user.primaryEmail) || !user.acl?.permissions?.length) {
    return {
      ...STATIC_USER,
      ...user,
      acl: STATIC_USER.acl,
      primaryBusiness: user.primaryBusiness || STATIC_BUSINESS_ID,
      businessIds: user.businessIds?.length ? user.businessIds : [STATIC_BUSINESS_ID],
      primaryEmail: user.primaryEmail || STATIC_LOGIN_EMAIL,
    }
  }
  return user
}

export const _setToken = (data) => {
  const user = _getUser(data.accessToken)
  localStorage.setItem('token', data.accessToken)
  localStorage.setItem('refreshToken', data.refreshToken)
  localStorage.setItem('expiryToken', data.accessTokenExpiresAt)
  localStorage.setItem('user.id', user._id || STATIC_USER._id)
  localStorage.setItem(
    'user.email',
    user.primaryEmail || user.email || STATIC_LOGIN_EMAIL,
  )
  if (!localStorage.getItem('businessId')) {
    localStorage.setItem(
      'businessId',
      user.primaryBusiness || STATIC_BUSINESS_ID,
    )
  }
}
