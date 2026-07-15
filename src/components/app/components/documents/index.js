import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { UncontrolledTooltip } from 'reactstrap';
import moment from 'moment';
import { getAllDocuments } from '../../../../actions/documentActions';
import UploadDocumentModal from '../../../common/UploadDocumentModal';
import CenterSpinner from '../../../../global/CenterSpinner';
import SubmitDocuments from './SubmitDocuments';
import { PROVIDER_NAME } from '../../../../utils/Provider.const'
import { isArray } from 'lodash';

const STATUSES = {
  pending: 'Pending',
  submitted: 'Submitted',
  review: "Under Review",
  verified: 'Approved',
  rejected: 'Not Accepted',
  archive: 'Archived',
}

const STATUS_BADGES = {
  pending: 'warning',
  submitted: 'info',
  review: "info",
  verified: 'success',
  rejected: 'danger',
  archive: 'danger',
}

const Documents = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState(false);
  const [selectedDocumentName, setSelectedDocumentName] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState('');
  const [selectedDocumentFor, setSelectedDocumentFor] = useState('');
  const [selectedCurrentDocumentType, setSelectedCurrentDocumentType] = useState({});
  const [selectedDocumentSides, setSelectedDocumentSides] = useState(['front'])
  const loading = useSelector(state => state?.documents?.loading);
  const documents = useSelector(state => state?.documents?.data?.documents);
  const providerDocumentConfig = useSelector(state => state?.documents?.data?.providerDocumentConfig);
  const shouldStartPolling = false // isArray(documents) && documents?.some(document => document.status === 'submitted');

  useEffect(() => {
    dispatch(getAllDocuments());
  }, []);

  useEffect(() => {
    let timer;
    if (shouldStartPolling) {
      timer = setInterval(() => {
        dispatch(getAllDocuments())
      }, 5000);
    } else {
      return () => clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [shouldStartPolling]);

  const handleOpenModal = (document) => {
    if (document?.status === 'pending') {
      setIsOpen(true)
      setSelectedDocumentType(document?.type)
      setSelectedDocumentName(document?.documentName)
      setSelectedDocumentId(document?._id)
      setSelectedDocumentFor(document?.documentFor)
      setSelectedDocumentSides(document?.documentSides)
      const documentConfig = (providerDocumentConfig?.[document?.documentFor]?.documentTypes || [])?.find(config => config?.type === document?.type);
      if (documentConfig) {
        setSelectedCurrentDocumentType(documentConfig)
      }
    }
  }

  const handleCurrentSelectedDocumentType = (event) => {
    setSelectedCurrentDocumentType(event);
  }

  const handleCloseModal = () => {
    setIsOpen(false)
  }

  const downloadFile = async (url) => {
    const image = await fetch(url)
    const imageBlog = await image.blob()
    const imageURL = URL.createObjectURL(imageBlog)

    const link = document.createElement('a')
    link.href = imageURL
    link.download = 'Download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="content-wrapper__main payoutdetails">
      <header className="py-header--page flex">
        <div className="py-header--title">
          <h1 className="py-heading--title">Verification Center</h1>
        </div>
      </header>
      <div className="documents-table-contents">
        <table className="table">
          <thead>
            <tr>
              <th>
                Document Name
              </th>
              <th>
                Date
              </th>
              <th>
                Message
              </th>
              <th>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              <tr>
                <td colSpan={5}>
                  <CenterSpinner />
                </td>
              </tr>
            }
            {!loading && documents?.length === 0 &&
              <tr className='text-center'>
                <td colSpan={5} style={{ height: '100vh', padding: '25%' }}>
                  <h6>No documents requested</h6>
                </td>
              </tr>
            }
            {!loading && isArray(documents) && documents?.map((document, index) => (
              <tr className={`table-row ${document?.status === 'pending' ? 'cursor-pointer' : ''}`} key={index} onClick={() => handleOpenModal(document)}>
                <td className='text-capitalize'>
                  {document?.documentName?.replaceAll('_', ' ')}
                  {document?.status !== 'pending' && document?.documentIds?.length ?
                    (document?.documentIds || []).map((item) => {
                      return (
                        <span className='downloadArea'>
                          <UncontrolledTooltip className='text-capitalize' placement="top" target={`${item?.fileType}_file`}>
                            {item?.fileType}
                          </UncontrolledTooltip>
                          <i className="fal fa-download" id={`${item?.fileType}_file`} aria-hidden="true" onClick={() => downloadFile(item?.fileUrl)} />
                        </span>
                      )
                    })
                    : null
                  }
                  {/* {document?.type &&
                    <span className="py-text--hint">for: {document?.type?.replaceAll('_', ' ')}</span>
                  } */}
                </td>
                <td>
                  {document?.createdAt && <div><span className="py-text--hint d-inline-block" >Requested:</span> {moment(document?.createdAt).format('MMM DD, YYYY')}</div>}
                  {document?.submittedAt && <div><span className="py-text--hint d-inline-block" >Submitted:</span> {moment(document?.submittedAt).format('MMM DD, YYYY')}</div>}
                  {document?.finalisedAt &&
                    <div>
                      <span className="py-text--hint d-inline-block" >Reviewed: &nbsp;</span> {moment(document?.finalisedAt).format('MMM DD, YYYY')}
                    </div>
                  }
                </td>
                <td className='document-message'>
                  <span className='text-capitalize'>
                    {document?.message}
                  </span>
                  {document?.status === 'rejected' && document?.rejectionReason && <div className="py-text--hint">Rejection reason: {document?.rejectionReason?.message}</div>}
                </td>
                <td className='text-capitalize'>
                  <span className={`badge badge-${STATUS_BADGES[document?.status]}`}>{STATUSES[document?.status]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <UploadDocumentModal
        isOpen={isOpen}
        handleClose={handleCloseModal}
      >
        <SubmitDocuments
          documentId={selectedDocumentId}
          selectedDocumentType={selectedDocumentType}
          selectedDocumentName={selectedDocumentName}
          handleCloseModal={handleCloseModal}
          documentFor={selectedDocumentFor}
          providerDocumentConfig={providerDocumentConfig}
          handleCurrentSelectedDocumentType={handleCurrentSelectedDocumentType}
          selectedCurrentDocumentType={selectedCurrentDocumentType}
          selectedDocumentSides={selectedDocumentSides}
        />
      </UploadDocumentModal>
    </div>
  )
}

export default Documents