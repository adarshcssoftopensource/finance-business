import {
  HTTP_DELETE,
  HTTP_GET,
  HTTP_PUT,
  HTTP_POST
} from "../components/app/components/Estimates/components/constant";
import requestWithToken from "./requestWithToken";

const PaymeServices = {
  fetchPeymeLink,
  updatePeymeImage,
  validatePeymeLink,
  peymeLinkSuggestions,
  addPeymeLink,
  sendPeyMeReceiptMail,
  fetchPeyMePayment,
};

function updatePeymeImage(data) {
  return requestWithToken({
    url: `/api/v1/peyme`,
    method: "PATCH",
    data
  });
}

function addPeymeLink(data) {
  return requestWithToken({
    url: `/api/v1/peyme`,
    method: "POST",
    data
  });
}

function fetchPeymeLink() {
  return requestWithToken({
    url: `/api/v1/peyme`,
    method: "GET",
  });
}

function validatePeymeLink(id) {
  return requestWithToken({
    url: `/api/v1/peyme/${id}/validate`,
    method: "GET",
  });
}

function peymeLinkSuggestions() {
  return requestWithToken({
    url: `/api/v1/peyme/suggestions`,
    method: "GET",
  });
}

function fetchPeyMePayment(paymentUuid) {
  return requestWithToken({
    url: `/api/v1/peyme/${paymentUuid}`,
    method: "GET",
  });
}

function sendPeyMeReceiptMail (peymeId, paymentId, data) {
  return requestWithToken({
    url: `/api/v1/peyme/${peymeId}/receipt/${paymentId}`,
    method: HTTP_POST,
    data
  });
};


export default PaymeServices;
