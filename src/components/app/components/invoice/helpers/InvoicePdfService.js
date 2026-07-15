import axios from 'axios';

export const generateInvoicePDF = async (invoiceData) => {
    const template = invoiceData.salesSetting.template || 'modern';
    const url = `${process.env.REACT_APP_TEMPLATE_SERVICE_URL}/template-service/invoice.${template}/pdf`;

    const response = await axios.post(url, invoiceData, {
        headers: {
            Accept: 'application/pdf',
        },
    });

    return response.data; // base64 encoded PDF
};

export const downloadBase64PDF = (base64String, fileName = 'Invoice.pdf') => {
    const blobUrl = `data:application/pdf;base64,${base64String}`;
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
