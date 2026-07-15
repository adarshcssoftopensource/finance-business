import requestWithToken from "./requestWithToken";

export const createSecrets = () => {
    return requestWithToken({
        url: `/api/v1/users/enableTOTP`,
        method: 'get',
    })
}

export const verifySecrets = (code) => {
    return requestWithToken({
        url: `/api/v1/users/verifyTOTPFactor`,
        method: 'post',
        data: {OTP: code}
    })
}
export const removeAuthenticator = (code) => {
    return requestWithToken({
        url: `/api/v1/users/removeTOTP`,
        method: 'post',
        data: {OTP: code}
    })
}