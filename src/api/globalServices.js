import requestWithToken from './requestWithToken'
import request from './request'

export const fetchCountries = async()=> {
    const countries = localStorage.getItem('countries')
    if(!!countries){
        return JSON.parse(countries)
    }else{
        const res = await requestWithToken({
            url: '/api/v1/utility/public/countries/',
            method: 'GET'
        })
        localStorage.setItem('countries', JSON.stringify(res))
        return res
    }
}


export const  fetchStatesByCountryId = id => {
    return requestWithToken({
        url: '/api/v1/utility/public/countries/' + id,
        method: 'GET'
    })
}


export const fetchCurrencies = async () => {
    const currencies = localStorage.getItem('currencies')
    if(!!currencies){
        return JSON.parse(currencies)
    }else{
        const res = await requestWithToken({
            url: '/api/v1/utility/public/currencies/',
            method: 'GET'
        })
        localStorage.setItem('currencies', JSON.stringify(res))
        return res
    }
}

export const currentExchangeRate = async (base, current) => {
    return requestWithToken({
        url: `/api/v1/utility/exchangerate?base=${base}&current=${current}`,
        method: "GET"
    });
};

export const verifyRegister = (data) => {
    return request({
        url: `/api/v2/auth/email/verification`,
        method: "POST",
        data
    })
}

export const verifyInvitation = (search) => {
    return request({
        url: `/api/v1/invitation/verifyinvitation${search}`,
        method: "GET"
    })
}

export const setUserThemeMode = data => {
    return requestWithToken({
        url: `/api/v1/users/themeMode`,
        method: "PATCH",
        data
    })
}

export const resendVerifyEmail = async (data) => {
    return request({
        url: `/api/v2/auth/resend-email`,
        method: "POST",
        data
    })
}
