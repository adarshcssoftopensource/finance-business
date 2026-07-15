const mockResponse = (data = {}) => Promise.resolve({ statusCode: 200, data, status: 200 });

const validJWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjogeyJ1c2VyIjogeyJfaWQiOiAic3RhdGljLXVzZXItMTIzIiwgInByaW1hcnlFbWFpbCI6ICJ1c2VyQGZpbmFuY2UuY29tIn19fQ.ZHVtbXk";

function authenticate(data) {
  return mockResponse({ accessToken: validJWT, refreshToken: validJWT, user: { name: 'Static User', email: data.email } });
}

function googleAuth(data) {
  return mockResponse({ accessToken: validJWT, refreshToken: validJWT, user: { name: 'Static User' } });
}

export const forgotPassword = (data) => mockResponse();

const generateResetLink = (data) => mockResponse();

const resetPassword = (data) => mockResponse();

const verifyResetLink = (token) => mockResponse();

const assumeUser = (token) => mockResponse({ accessToken: validJWT });

const refreshToken = (data) => mockResponse({ accessToken: validJWT });

const callMe = (_) => mockResponse({ 
  user: { name: 'Static User', themeMode: 'light', email: 'user@finance.com' }, 
  businesses: [{ _id: 'biz1', name: 'Static Business' }],
  selectedBusiness: { _id: 'biz1', name: 'Static Business' } 
});

const inviteUser = (data) => mockResponse();

const updateUser = (data, id) => mockResponse();

const deleteDelegateUser = (id) => mockResponse();

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
  updateUser
};

export default LoginService;
