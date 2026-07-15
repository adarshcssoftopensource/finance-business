import axios from 'axios';

/**
 * Download a report PDF from template service.
 * @param {Object} params
 * @param {string} params.reportType - The report type (e.g. 'cashflow', 'sales').
 * @param {Object} params.salesSetting - Settings including the template name.
 * @param {Object} params.businessData - Business data.
 * @param {Object} params.userData - User data.
 * @param {Object} params.reportData - The report content to render in PDF.
 * @returns {Promise<Blob>} - A PDF Blob if successful.
 */
export function downloadPDFBlob({
  reportType,
  salesSetting,
  businessData,
  userData,
  reportData,
}) {
  const url = `${process.env.REACT_APP_TEMPLATE_SERVICE_URL}/template-service/${reportType}.${salesSetting.template}/pdf`;

  const payload = {
    salesSetting,
    businessId: businessData,
    userInfo: userData,
    report: { ...reportData, type: reportType }
  };

  return axios.post(url, payload, {
    responseType: 'arraybuffer',
    headers: { Accept: 'application/pdf' }
  });
}

/**
 * Triggers download of a PDF blob.
 * @param {BlobPart} blobData - The blob data (ArrayBuffer or Uint8Array).
 * @param {string} fileNamePrefix - Prefix for the downloaded file name.
 */
export function downloadBlobAsPDF(blobData, fileNamePrefix) {
  const blob = new Blob([blobData], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `${fileNamePrefix}_${date}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
