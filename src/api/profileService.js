import { HTTP_PUT } from '../components/app/components/Estimates/components/constant';
import requestWithToken from './requestWithToken'
import requestWithTokenWithoutBusiness from './requestWithTokenWithoutBusiness';

const profileServices = {
  updateUser,
  changePass,
  deletePass,
  getUserById,
  getUserNotifications,
  updateUserNotifications,
  updateProfileEmailSetting,
  getConnectedAccounts,
  getConnectedEmails,
  addConnectedEmail,
  addConnectedAccount,
  setPrimaryEmail,
  deleteConnectedEmail,
  deleteConnectedAccount,
  fetchRoles,
  fetchDeligateUsers,
  resendverification,
  googleEmailConnects,
  setPrimaryEmailForBusiness
};

function updateUser(data, id) {
  return requestWithToken({
    url: `/api/v1/users/${id}`,
    method: HTTP_PUT,
    data
  });
}

function updateProfileEmailSetting(userId, data) {
  return requestWithToken({
    url: `/api/v1/users/me/email-setting`,
    method: 'PUT',
    data
  });
}

function changePass(data) {
  return requestWithToken({
    url: `/api/v1/authenticate/changepassword`,
    method: 'POST',
    data
  });
}

function deletePass(id) {
  return requestWithToken({
    url: `/api/v1/users/${id}`,
    method: 'DELETE'
  });
}

export function getUserById(id) {
  return requestWithToken({
    url: `/api/v1/users/${id}`,
    method: 'GET'
  });
}

function resendverification(id) {
  return requestWithToken({
    url: `/api/v2/users/me/emails/${id}/resend`,
    method: 'GET'
  });
}

function getUserNotifications(id) {
  return requestWithToken({
    url: `/api/v1/users/${id}/notifications`,
    method: 'GET'
  });
}

function updateUserNotifications(id, data) {
  return requestWithToken({
    url: `/api/v1/users/${id}/notifications`,
    method: 'PATCH',
    data,
  });
}

function getConnectedAccounts(id) {
  return requestWithToken({
    url: `/api/v1/users/${id}/accounts`,
    method: 'GET'
  });
}

function getConnectedEmails(id) {
  return requestWithToken({
    url: `/api/v2/users/me/emails`,
    method: 'GET'
  });
}

function addConnectedEmail(id, data) {
  return requestWithToken({
    url: `/api/v2/users/me/emails`,
    method: 'POST',
    data,
  });
}

function addConnectedAccount(id, data) {
  return requestWithToken({
    url: `/api/v1/users/${id}/accounts`,
    method: 'POST',
    data,
  });
}

function deleteConnectedEmail(id, email) {
  return requestWithToken({
    url: `/api/v2/users/me/emails/${email}`,
    method: 'DELETE',
  });
}

function deleteConnectedAccount(id, accountId) {
  return requestWithToken({
    url: `/api/v1/users/${id}/accounts/${accountId}`,
    method: 'DELETE',
  });
}

function setPrimaryEmail(id, emailId) {
  return requestWithToken({
    url: `/api/v2/users/me/emails/${emailId}`,
    method: 'PUT',
  });
}

function setPrimaryEmailForBusiness(emailId, businessId) {
  return requestWithToken({
    url: `/api/v2/users/me/emails/${emailId}/set-primary`,
    method: 'PUT',
    data: {
      businessId
    }
  });
}

async function fetchRoles() {
  const res = await requestWithTokenWithoutBusiness({
    url: `/api/v1/roles`,
    method: 'GET',
  });
  return res
}

function fetchDeligateUsers() {
  return requestWithToken({
    url: `/api/v1/delegate`,
    method: 'GET',
  });
}

function googleEmailConnects(queryString) {
  return requestWithToken({
    url: `/api/v2/users/me/emails/google/callback${queryString}`,
    method: 'GET',
  });
}

export default profileServices;
