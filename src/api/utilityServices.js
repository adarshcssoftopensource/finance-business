import request from './request';
import requestWithToken from './requestWithToken'

export const getMccWithBusinessCategory=()=> {
    return requestWithToken({
        url: `/api/v1/utility/public/mcc`,
        method: 'GET'
    });
}

export const getAllCountryPrices=()=> {
    return requestWithToken({
        url: `/api/v1/utility/public/all-country-price`,
        method: 'GET'
    });
}

export const removeCard = (data) => {
    return request({
        url: `/api/v1/utility/public`,
        method: 'POST',
        data
    });
}

export const getAllFeatureFlags = () => {
    return request({
        url: '/api/v1/utility/public/globals',
        method: 'GET'
    });
}
