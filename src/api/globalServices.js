import requestWithToken from './requestWithToken'
import request from './request'

export const fetchCountries = async()=> {
    const countries = localStorage.getItem('countries')
    if (!!countries) {
        try {
            const parsed = JSON.parse(countries)
            if (parsed && Array.isArray(parsed.countries) && parsed.countries.length > 0) {
                return parsed
            }
        } catch (e) {
            /* ignore bad cache */
        }
        localStorage.removeItem('countries')
    }
    const res = await requestWithToken({
        url: '/api/v1/utility/public/countries/',
        method: 'GET'
    })
    const normalized = Array.isArray(res?.countries)
        ? res
        : Array.isArray(res?.data?.countries)
            ? { ...res, countries: res.data.countries }
            : { countries: Array.isArray(res) ? res : [] }
    localStorage.setItem('countries', JSON.stringify(normalized))
    return normalized
}


export const  fetchStatesByCountryId = id => {
    return requestWithToken({
        url: '/api/v1/utility/public/countries/' + id,
        method: 'GET'
    })
}


export const fetchCurrencies = async () => {
    const currencies = localStorage.getItem('currencies')
    if (!!currencies) {
        try {
            const parsed = JSON.parse(currencies)
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed
            }
        } catch (e) {
            /* ignore bad cache */
        }
        localStorage.removeItem('currencies')
    }
    const res = await requestWithToken({
        url: '/api/v1/utility/public/currencies/',
        method: 'GET'
    })
    const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.countries)
                ? res.countries
                : Array.isArray(res?.data?.countries)
                    ? res.data.countries
                    : []
    localStorage.setItem('currencies', JSON.stringify(list))
    return list
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
