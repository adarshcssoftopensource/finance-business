import request from './request'

function send(data) {
  return request({
    url: '/api/v1/utility/otp/send',
    method: 'POST',
    data
  });
}

function verify(data) {
  return request({
    url: '/api/v1/utility/otp/verify',
    method: 'POST',
    data
  });
}

const OtpServices = {
  send,
  verify
}

export default OtpServices;



