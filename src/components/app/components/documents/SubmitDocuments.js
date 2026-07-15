import React, { useEffect, useState } from 'react'
import { get as _get, isEmpty } from 'lodash'
import { Button, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Input, Spinner, Label } from 'reactstrap';
import { getAllDocuments } from '../../../../actions/documentActions';
import { openGlobalSnackbar } from '../../../../actions/snackBarAction';
import { submitDocument, fetchSignedUrl, uploadDocumentToS3 } from '../../../../api/documentService';
import { PROVIDER_NAME } from '../../../../utils/Provider.const'
import SelectBox from "../../../../utils/formWrapper/SelectBox";

const SubmitDocuments = ({
  documentId, selectedDocumentName, selectedDocumentType, handleCloseModal, selectedCurrentDocumentType,
  handleCurrentSelectedDocumentType, documentFor, providerDocumentConfig, selectedDocumentSides
}) => {
  const dispatch = useDispatch();
  const selectedBusiness = useSelector(state => state?.businessReducer?.selectedBusiness);
  const providerName = useSelector(state => state?.paymentSettings?.data?.providerName);
  const legalEntityId = selectedBusiness?.legalEntityId;
  const [loading, setLoading] = useState(false);
  const [selectedDocumentFile, setDocumentFile] = useState({});
  const [selectedBackDocumentFile, setBackDocumentFile] = useState(null);
  const [currentProviderDocumentConfig, setCurrentProviderDocumentConfig] = useState({});
  const [isEmptyProviderDocumentConfig, setIsEmptyProviderDocumentConfig] = useState(false);
  const [isBackFileRequired, setIsBackFileRequired] = useState(false);
  const [isMultipleFileEnabled, setIsMultipleFileEnabled] = useState(false);
  const [selectedMultipleFile, setSelectedMultipleFile] = useState({});

  useEffect(() => {
    switch (providerName) {
      case PROVIDER_NAME.PROVIDER_WEPAY:
        const myAppId = process.env.REACT_APP_WE_PAY_APP_ID || "872295";
        const apiVersion = "3.0";
        const error = window.WePay.configure(process.env.REACT_APP_WE_PAY_ENV || "stage", myAppId, apiVersion);
        if (error) {
          console.log(error);
        }
        break;
      default:
        break;
    }
    setCurrentProviderDocumentConfig(providerDocumentConfig?.[documentFor] || {})
    setIsEmptyProviderDocumentConfig(isEmpty(providerDocumentConfig?.[documentFor]?.documentTypes))
    const isBackFile = isEmpty(providerDocumentConfig?.[documentFor]?.documentTypes) ? !!selectedDocumentSides?.includes('back') : !!selectedCurrentDocumentType?.side?.includes('back')
    setIsBackFileRequired(isBackFile)
    const isMultipleFile = isEmpty(providerDocumentConfig?.[documentFor]?.documentTypes) ? !!selectedDocumentSides?.includes('multiple') : !!selectedCurrentDocumentType?.side?.includes('multiple')
    setIsMultipleFileEnabled(isMultipleFile);
  }, [providerName]);

  const submitVerificationDocuments = async (documentId, formData) => {
    if (selectedCurrentDocumentType && !isEmpty(selectedCurrentDocumentType)) {
      formData.append('documentName', selectedCurrentDocumentType?.label);
      formData.append('type', selectedCurrentDocumentType?.type);
      formData.append('documentSides', JSON.stringify(selectedCurrentDocumentType?.side));
    } else {
      formData.append('documentName', selectedDocumentName);
      formData.append('type', selectedDocumentType);
      formData.append('documentSides',  JSON.stringify(selectedDocumentSides));
    }
    setLoading(true);
    const response = await submitDocument(documentId, formData);
    if (response.statusCode === 200) {
      setLoading(false);
      dispatch(openGlobalSnackbar("Document has been submitted successfully."));
      dispatch(getAllDocuments());
      handleCloseModal();
      window.location.reload();
    } else {
      setLoading(false);
      dispatch(openGlobalSnackbar("Error while uploading documents", true));
    }
  }

  const handleUploadDocuments = event => {
    if (isMultipleFileEnabled) {
      const keys = Object.keys(event.target.files)
      setSelectedMultipleFile(event.target.files)
      setDocumentFile({ name: keys.map(key => event.target.files[key].name).join(", "), size: keys.map(key => event.target.files[key].size).reduce((prev, next) => prev + next, 0) })
    } else {
      setDocumentFile(event.target.files[0])
    }
  }

  const handleUploadBackDocuments = event => {
    setBackDocumentFile(event.target.files[0])
  }

  const handleDocumentSide = (event) => {
    setIsBackFileRequired(!!event?.side?.includes('back'))
  }

  const validateBeforeSubmit = async () => {
    let isValid = true;
    const MAXIMUM_SIZE = (currentProviderDocumentConfig?.maximumSize || 10) * 1024 // In MB
    if (isEmpty(selectedDocumentFile?.name)) {
      isValid = false
      dispatch(openGlobalSnackbar("Select File", true));
    } else if (isBackFileRequired && isEmpty(selectedBackDocumentFile?.name)) {
      dispatch(openGlobalSnackbar("Select back file", true));
      isValid = false
    } else if ((selectedDocumentFile?.size / 1024) > MAXIMUM_SIZE) {
      dispatch(openGlobalSnackbar(`Selected file size must be ${currentProviderDocumentConfig?.maximumSize || 10}MB`, true));
      isValid = false
    } else if (isBackFileRequired && (selectedBackDocumentFile?.size / 1024) > MAXIMUM_SIZE) {
      dispatch(openGlobalSnackbar(`Selected back file size must be ${currentProviderDocumentConfig?.maximumSize || 10}MB`, true));
      isValid = false
    }
    return isValid;
  }

  const handleWepaySubmitDocument = async () => {
    const body = {
      type: selectedDocumentType,
      legal_entity_id: legalEntityId,
      file: selectedDocumentFile
    }
    window.WePay.documents.create(body, {}, async (res) => {
      try {
        const isValid = await validateBeforeSubmit();
        if (!isValid) {
          return false;
        }
        const formData = new FormData();
        if (res?.id) {
          formData.append('documentId', res?.id);
        } else {
          dispatch(openGlobalSnackbar(res?.details?.[0]?.message || "Something went wrong while uploading document.", true));
          return false
        }
        formData.append('documentFile', selectedDocumentFile)
        if (selectedBackDocumentFile) {
          formData.append('documentFileBack', selectedBackDocumentFile)
        }
        await submitVerificationDocuments(documentId, formData);
      } catch (error) {
        dispatch(openGlobalSnackbar("Something went wrong while uploading document.", error));
        handleCloseModal();
      }
    })
  }

  const getSignedUrl = async (file) => {
    try {
      setLoading(true);
      const payload = {
        s3Input: {
          contentType: file.type,
          fileName: file.name,
          uploadType: 'verifications',
        },
      }
      const response = await fetchSignedUrl(payload)
      const { sUrl, pUrl } = response.data.signedUrl
      if (sUrl) {
        await uploadDocumentToS3(sUrl, file, file.type)
        return pUrl
      }
    } catch (error) {
      setLoading(false);
      dispatch(openGlobalSnackbar("Something went wrong while uploading document.", error));
    }
  }

  const handleCheckoutSubmitDocument = async () => {
    try {
      const isValid = await validateBeforeSubmit();
      if (!isValid) {
        return false;
      }
      const formData = new FormData();
      formData.append('documentFile', selectedDocumentFile)
      if (selectedBackDocumentFile) {
        formData.append('documentFileBack', selectedBackDocumentFile)
      }
      await submitVerificationDocuments(documentId, formData);
    } catch (error) {
      dispatch(openGlobalSnackbar("Something went wrong while uploading document.", error));
      handleCloseModal();
    }
  }

  const getFileObject = async (singleFile) => {
    const fileUrl = await getSignedUrl(singleFile);
    return {
      filename: singleFile?.name,
      fileType: singleFile?.type,
      size: singleFile?.size,
      fileUrl,
    }
  }

  const handlePayArcSubmitDocument = async () => {
    try {
      const isValid = await validateBeforeSubmit();
      if (!isValid) {
        return false;
      }
      const formData = new FormData();
      const s3Files = [];
      if (isMultipleFileEnabled) {
        if (Object.keys(selectedMultipleFile)?.length > 5) {
          dispatch(openGlobalSnackbar("You can upload maximum 5 files", true));
          return false
        }
        for(let index = 0; index < selectedMultipleFile?.length; index++) {
          const singleFile = selectedMultipleFile[index];
          const fileObject = await getFileObject(singleFile);
          s3Files.push(fileObject);
        }
      } else {
        const fileObject = await getFileObject(selectedDocumentFile);
        s3Files.push(fileObject);
      }
      if (selectedBackDocumentFile) {
        formData.append('documentFileBack', selectedBackDocumentFile)
      }
      formData.append("documentS3Files", JSON.stringify(s3Files));
      await submitVerificationDocuments(documentId, formData);
    } catch (error) {
      dispatch(openGlobalSnackbar("Something went wrong while uploading document.", error));
      handleCloseModal();
    }
  }

  const handleJustifiSubmitDocument = async () => {
    try {
      const isValid = await validateBeforeSubmit();
      if (!isValid) {
        return false;
      }
      const formData = new FormData();
      const s3Files = [];
      if (isMultipleFileEnabled) {
        if (Object.keys(selectedMultipleFile)?.length > 5) {
          dispatch(openGlobalSnackbar("You can upload maximum 5 files", true));
          return false
        }
        for(let index = 0; index < selectedMultipleFile?.length; index++) {
          const singleFile = selectedMultipleFile[index];
          const fileObject = await getFileObject(singleFile);
          s3Files.push(fileObject);
        }
      } else {
        const fileObject = await getFileObject(selectedDocumentFile);
        s3Files.push(fileObject);
      }
      if (selectedBackDocumentFile) {
        formData.append('documentFileBack', selectedBackDocumentFile)
      }
      formData.append("documentS3Files", JSON.stringify(s3Files));
      await submitVerificationDocuments(documentId, formData);
    } catch (error) {
      dispatch(openGlobalSnackbar("Something went wrong while uploading document.", error));
      handleCloseModal();
    }
  }

  const handlePayyitSubmitDocument = async () => {
    try {
      const isValid = await validateBeforeSubmit();
      if (!isValid) {
        return false;
      }
      const formData = new FormData();
      const s3Files = [];
      const fileObject = await getFileObject(selectedDocumentFile);
      s3Files.push(fileObject);
      // formData.append('documentFile', selectedDocumentFile)
      if (selectedBackDocumentFile) {
        const backFileObject = await getFileObject(selectedBackDocumentFile);
        s3Files.push(backFileObject);
        // formData.append('documentFileBack', selectedBackDocumentFile)
      }
      formData.append("documentS3Files", JSON.stringify(s3Files));
      await submitVerificationDocuments(documentId, formData);
    } catch (error) {
      dispatch(openGlobalSnackbar("Something went wrong while uploading document.", error));
      handleCloseModal();
    }
  }

  const handleSubmitDocument = async e => {
    e.preventDefault();
    switch (providerName) {
      case PROVIDER_NAME.PROVIDER_WEPAY:
        await handleWepaySubmitDocument();
        break;

      case PROVIDER_NAME.PROVIDER_CHECKOUT:
        await handleCheckoutSubmitDocument();
        break;

      case PROVIDER_NAME.PROVIDER_PAYYIT:
        await handlePayyitSubmitDocument();
        break;

      case PROVIDER_NAME.PROVIDER_TILLED:
        await handlePayyitSubmitDocument();
        break;

      case PROVIDER_NAME.PROVIDER_PAYPAL:
        await handlePayyitSubmitDocument();
        break;

      case PROVIDER_NAME.PORVIDER_STRIPE:
        await handlePayyitSubmitDocument();
        break;

      case PROVIDER_NAME.PROVIDER_PAYARC:
        await handlePayArcSubmitDocument();
        break;
      case PROVIDER_NAME.PROVIDER_JUSTIFI:
        await handleJustifiSubmitDocument();
        break;
      default:
        dispatch(openGlobalSnackbar("Provider not supported to upload document"));
        break;
    }
  }

  return (
    <>
      <div className='d-flex justify-content-center'>
        <Col className="m-4" sm={8}>
          {
            !isEmptyProviderDocumentConfig ?
              <div className="py-form-field">
                <Label htmlFor="documentType" className="py-form-field__label is-required">
                  Document Type
                </Label>
                <div className="py-form-field__element">
                  <div className="py-select--native">
                    <SelectBox
                      id="documentType"
                      className="select-empty"
                      getOptionLabel={(value)=>(value["label"])}
                      getOptionValue={(value)=>(value["type"])}
                      value={selectedCurrentDocumentType}
                      onChange={e => {
                        handleCurrentSelectedDocumentType(e)
                        handleDocumentSide(e)
                      }}
                      placeholder="Select a province/state"
                      options={currentProviderDocumentConfig?.documentTypes || []}
                      clearable={false}
                    />
                  </div>
                </div>
              </div>
            : null
          }
          <div className="py-form-field">
            <Label
              className="py-form-field__label is-required"
              htmlFor="Front File">
              {isBackFileRequired ? 'Front' : ''} File
            </Label>

            <div className="uploader-zone">
              <span className="upload-icon" ><i className="fal fa-upload"></i></span>
              <div className="py-text--browse text-capitalize">
                Required Document: {selectedCurrentDocumentType?.label ? selectedCurrentDocumentType?.label : selectedDocumentName?.replaceAll('_', ' ')}
              </div>
              {selectedDocumentFile?.name &&
                <div>
                  Uploaded File: {selectedDocumentFile?.name}
                </div>
              }
              <div className="py-text--hint">
                {' '}
                Maximum {currentProviderDocumentConfig?.maximumSize ? currentProviderDocumentConfig?.maximumSize : 10}MB in size. <br />
                {currentProviderDocumentConfig?.supportedFormat?.length ? currentProviderDocumentConfig?.supportedFormat?.join(", ").toUpperCase() : 'JPG, PNG, JPEG, PDF' } formats.
              </div>
              <Input
                className={loading ? "cursor-none" : ""}
                type='file'
                multiple={isMultipleFileEnabled}
                onChange={handleUploadDocuments}
                accept={`${ currentProviderDocumentConfig?.supportedFormat?.length ? `.${currentProviderDocumentConfig?.supportedFormat?.join(",.")}` : ".jpg,.png,.jpeg,.pdf"}`}
              />
            </div>
          </div>
          {
            isBackFileRequired ?
              <div className="py-form-field">
                <Label
                  className="py-form-field__label is-required"
                  htmlFor="Front File">
                  Back File
                </Label>
                <div className="uploader-zone">
                  <span className="upload-icon" ><i className="fal fa-upload"></i></span>
                  <div className="py-text--browse text-capitalize">
                    Required Document: {selectedCurrentDocumentType?.label ? selectedCurrentDocumentType?.label : selectedDocumentName?.replaceAll('_', ' ')}
                  </div>
                  {selectedBackDocumentFile?.name &&
                    <div>
                      Uploaded File: {selectedBackDocumentFile?.name}
                    </div>
                  }
                  <div className="py-text--hint">
                    {' '}
                    Maximum {currentProviderDocumentConfig?.maximumSize ? currentProviderDocumentConfig?.maximumSize : 10}MB in size. <br />
                    {currentProviderDocumentConfig?.supportedFormat?.length ? currentProviderDocumentConfig?.supportedFormat?.join(", ").toUpperCase() : 'JPG, PNG, JPEG, PDF' } formats.
                  </div>
                  <Input
                    className={loading ? "cursor-none" : ""}
                    type='file'
                    onChange={handleUploadBackDocuments}
                    accept={`${ currentProviderDocumentConfig?.supportedFormat?.length ? `.${currentProviderDocumentConfig?.supportedFormat?.join(",.")}` : ".jpg,.png,.jpeg,.pdf"}`}
                  />
                </div>
              </div>
            : null
          }
          <Button
            disabled={loading}
            className='mt-4 w-100'
            variant='primary'
            onClick={handleSubmitDocument}
          >
            {loading ? <Spinner /> : 'Submit' }
          </Button>
        </Col>
      </div>
    </>
  )
}

export default SubmitDocuments
