import requestWithToken from './requestWithToken'
import request from './request';
export const HTTP_POST = "POST";
export const HTTP_GET = "GET";
export const HTTP_PUT = "PUT";
export const HTTP_DELETE = "DELETE";
export const HTTP_PATCH = "PATCH";

const checkoutServices = {
    addCheckout,
    fetchCheckouts,
    fetchCheckoutById,
    fetchCheckoutByUUID,
    deleteCheckout,
    doCheckoutPayment,
    checkUserInBussiness,
    fetchCheckoutPayment,
    sendCheckoutReceiptMail
}

function addCheckout(data) {
    return requestWithToken({
        url: '/api/v1/checkouts',
        method: 'POST',
        data
    });
}

function fetchCheckoutById(checkoutId) {
    return requestWithToken({
        url: '/api/v1/checkouts/' + checkoutId,
        method: 'GET'
    })
}

function fetchCheckoutByUUID(uuid) {
    return request({
        url: '/api/v1/checkouts/' + uuid + '/public',
        method: 'GET'
    })
}

export const cloneCheckout = id => {
    return requestWithToken({
      url: `/api/v1/checkouts/${id}/clone`,
      method: 'GET'
    });
  };

function fetchCheckouts(query) {
    return requestWithToken({
        url: `/api/v1/checkouts${!!query ? `?${query}`: ""}`,
        method: 'GET'
    })
}

export const updateCheckoutById = (checkoutId, updateData) => {
    return requestWithToken({
        url: `/api/v1/checkouts/${checkoutId}`,
        method: HTTP_PUT,
        data: updateData
    });
};


function deleteCheckout (checkoutId) {
    return requestWithToken({
        url: `api/v1/checkouts/${checkoutId}`,
        method: "DELETE"
    })
}

function doCheckoutPayment(data) {
    return request({
        url: '/api/v2/payments/checkout/charge/public',
        method: 'POST',
        data: data
    });
}

function checkUserInBussiness(bussinessId,userEmail) {
    return requestWithToken({
        url: `/api/v2/payments/bussiness/${bussinessId}/check-user/?email=${userEmail}`,
        method: 'GET',
    });
}

function fetchCheckoutPayment(checkoutUuid) {
    return requestWithToken({
      url: `/api/v1/checkouts/payment/${checkoutUuid}`,
      method: "GET",
    });
}

function sendCheckoutReceiptMail (checkoutId, paymentId, data) {
    return requestWithToken({
      url: `/api/v1/checkouts/${checkoutId}/receipt/${paymentId}`,
      method: HTTP_POST,
      data
    })
}

export const fetchBusinessCheckoutFee = () => {
    return requestWithToken({
        url: `/api/v1/checkouts/businessFee`,
        method: 'GET',
    });
};

export default checkoutServices;
