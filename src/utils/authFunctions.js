import decode from 'jwt-decode'

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
  return user
}

export const _setToken = (data) => {
  const user = _getUser(data.accessToken)
  localStorage.setItem('token', data.accessToken)
  localStorage.setItem('refreshToken', data.refreshToken)
  localStorage.setItem('expiryToken', data.accessTokenExpiresAt)
  localStorage.setItem('user.id', user._id)
  localStorage.setItem('user.email', user.primaryEmail)
}
