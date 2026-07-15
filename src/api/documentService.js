import axios from 'axios'
import requestWithToken from "./requestWithToken";

export function fetchAllDocuments() {
  return requestWithToken({
    url: `/api/v1/documents`,
    method: 'GET'
  });
}

export function submitDocument(documentId, data) {
  return requestWithToken({
    url: `/api/v1/documents/${documentId}`,
    method: 'PUT',
    data
  });
}

export const fetchSignedUrl = (data) => {
  return requestWithToken({
    url: '/api/v1/aws/signedurl',
    method: 'POST',
    data
  })
}

export const uploadDocumentToS3 = (url, data, contentType) => {
  return axios({
    method: 'put',
    url: url,
    headers: { 'Content-Type': contentType },
    data
  });
}