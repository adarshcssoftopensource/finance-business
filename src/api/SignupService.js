import request from './request'

function registration(data) {
  return request({
    url: '/api/v2/auth/register/web',
    method: 'POST',
    data
  });
}

function waitListRegistration(data) {
  return request({
    url: '/api/v2/auth/register/wait-list',
    method: 'POST',
    data
  });
}



// function emailVerify(data) {
//   return request({
//     url: '/users/activate/' + uuid + '/' + token,
//     method: 'GET'
//   });
// }

const SignupService = {
  registration,
  waitListRegistration
  // emailVerif
}

export default SignupService;



