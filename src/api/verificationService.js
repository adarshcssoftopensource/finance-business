import { HTTP_POST } from '../components/app/components/Estimates/components/constant'
import requestWithToken from './requestWithToken'

const initiateVerification = data => {
  return requestWithToken({
    url: `/api/v1/veriff/initiate`,
    method: HTTP_POST,
    data
  })
}

const VerificationService = {
  initiateVerification
}

export default VerificationService;