import {
  HTTP_GET,
  HTTP_PATCH,
  HTTP_POST,
  HTTP_PUT
} from '../components/app/components/Estimates/components/constant';
import requestWithToken from './requestWithToken';

function updateCrowdFundingImage(data) {
  return requestWithToken({
    url: `/api/v1/funding`,
    method: HTTP_PATCH,
    data
  });
}

function addCrowdFundingLink(data) {
  return requestWithToken({
    url: `/api/v1/funding`,
    method: HTTP_POST,
    data
  });
}

function fetchCrowdFundingLink() {
  return requestWithToken({
    url: `/api/v1/funding`,
    method: HTTP_GET,
  });
}

function validateCrowdFundingLink(id) {
  return requestWithToken({
    url: `/api/v1/funding/${id}/validate`,
    method: HTTP_GET,
  });
}

function crowdFundingLinkSuggestions() {
  return requestWithToken({
    url: `/api/v1/funding/suggestions`,
    method: HTTP_GET,
  });
}

function fetchCrowdFundingPayment(paymentUuid) {
  return requestWithToken({
    url: `/api/v1/funding/${paymentUuid}`,
    method: HTTP_GET,
  });
}

function sendCrowdFundingReceiptMail (peymeId, paymentId, data) {
  return requestWithToken({
    url: `/api/v1/funding/${peymeId}/receipt/${paymentId}`,
    method: HTTP_POST,
    data
  });
};

function addCrowdFundingItem (data) {
  return requestWithToken({
    url: `/api/v1/funding/items`,
    method: HTTP_POST,
    data
  });
};

function updateCrowdFundingItem (itemId, data, isStatusUpdate) {
  return requestWithToken({
    url: `/api/v1/funding/items/${itemId}`,
    method: isStatusUpdate ? HTTP_PATCH : HTTP_PUT,
    data
  });
};

function getCrowdFundingOrderItems(crowdFundingID,queryParams) {
  return requestWithToken({
    url: `/api/v1/funding/${crowdFundingID}/orders` + queryParams,
    method: HTTP_GET,
  })
};

function updateCrowdFundingOrderItems(crowdFundingID, orderId, data) {
  return requestWithToken({
    url: `/api/v1/funding/${crowdFundingID}/orders/${orderId}`,
    method: HTTP_PATCH,
  });
};

const CrowdFundingServices = {
  fetchCrowdFundingLink,
  updateCrowdFundingImage,
  validateCrowdFundingLink,
  crowdFundingLinkSuggestions,
  addCrowdFundingLink,
  sendCrowdFundingReceiptMail,
  fetchCrowdFundingPayment,
  addCrowdFundingItem,
  updateCrowdFundingItem,
  getCrowdFundingOrderItems,
  updateCrowdFundingOrderItems,
}

export default CrowdFundingServices;
