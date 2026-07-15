import React, { useEffect, useState } from 'react';
import profileServices from '../../../../../../api/profileService';
import BusinessService from '../../../../../../api/businessService';
import { UncontrolledTooltip, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { openGlobalSnackbar } from "../../../../../../actions/snackBarAction";

const EmailSenderSettings = () => {
  const [emails, setEmails] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const userId = localStorage.getItem("user.id");

  useEffect(() => {
    fetchEmails();
    fetchBusinesses();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const { data: { emails = [] } = {} } = await profileServices.getConnectedEmails();
      const verifiedEmails = emails.filter(email => email.status === 'Verified' && email.provider === 'local');
      setEmails(verifiedEmails);
    } catch (err) {
      console.error('Error fetching emails:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const { data } = await BusinessService.fetchBusiness();
      const businessArray = data?.businesses?.ownerAccess || [];
      setBusinesses(businessArray);
    } catch (err) {
      console.error('Error fetching businesses:', err);
    }
  };

  const toggleConfirmModal = () => setConfirmModal(!confirmModal);
  const toggleSuccessModal = () => setSuccessModal(!successModal);

  const handleEmailSelect = (emailId) => {
    const emailObj = emails.find(e => e._id === emailId);
    setSelectedEmail(emailObj);
  };

  const handleBusinessSelect = (businessId) => {
    const businessObj = businesses.find(b => b._id === businessId);
    setSelectedBusiness(businessObj);
  };


  const handleSave = () => {
    if (!selectedEmail || !selectedBusiness) {
      openGlobalSnackbar('Please select both email and business', 'error');
      return;
    }
    setConfirmModal(true);
  };

  const confirmSave = async () => {
    setConfirmModal(false);
    if (!selectedEmail || !selectedBusiness) return;

    try {
      setLoading(true);

      const { statusCode, message } = await profileServices.setPrimaryEmailForBusiness(
        selectedEmail._id,
        selectedBusiness._id
      );

      setLoading(false);

      if (statusCode === 200 || statusCode === 201) {
        setModalMessage(
          `Sender email "${selectedEmail.email}" has been set as primary for business "${selectedBusiness.organizationName}".`
        );
        setSuccessModal(true);
        openGlobalSnackbar(message || 'Sender email updated successfully!', 'success');

        fetchBusinesses();
        return;
      }

      openGlobalSnackbar(message || 'Failed to update sender email', 'error');
    } catch (err) {
      setLoading(false);
      console.error(err);
      openGlobalSnackbar(err.message || 'Failed to update sender email', 'error');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="p-5 bg-white rounded-4 shadow-sm border border-light" style={{ width: '100%', maxWidth: '700px' }}>
        <div className="d-flex align-items-center mb-4">
          <h3 className="fw-bold mb-0 me-3 fs-2">Email Sender Settings</h3>
          <span id="emailTooltip" className="text-secondary fs-5" style={{ cursor: 'pointer' }}>
            <i className="fas fa-info-circle" />
          </span>
          <UncontrolledTooltip placement="right" target="emailTooltip">
            Select a verified email and assign it to a business profile. This email will be used to send invoices and receipts for that business.
          </UncontrolledTooltip>
        </div>

        <div className="mb-4">
          <label htmlFor="senderEmail" className="form-label fw-semibold text-dark mb-2 fs-5">
            Email
          </label>
          <div className="position-relative">
            <i className="fas fa-envelope text-muted position-absolute" style={{ top: 12, left: 12 }}></i>
            <select
              id="senderEmail"
              className="form-select ps-5 py-2 border-1 shadow-sm rounded-3 fs-5"
              value={selectedEmail?._id || ''}
              onChange={(e) => handleEmailSelect(e.target.value)}
            >
              <option value="">-- Select Verified Email --</option>
              {emails.map(email => (
                <option key={email._id} value={email._id}>
                  {email.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="businessSelect" className="form-label fw-semibold text-dark mb-2 fs-5">
            Business
          </label>
          <div className="position-relative">
            <i className="fas fa-building text-muted position-absolute" style={{ top: 12, left: 12 }}></i>
            <select
              id="businessSelect"
              className="form-select ps-5 py-2 border-1 shadow-sm rounded-3 fs-5"
              value={selectedBusiness?._id || ''}
              onChange={(e) => handleBusinessSelect(e.target.value)}
            >
              <option value="">-- Select Business --</option>
              {businesses.map(b => (
                <option key={b._id} value={b._id}>
                  {b.organizationName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          className="btn btn-primary w-100 rounded-pill py-2 fw-semibold shadow-sm fs-5 mb-3"
          onClick={handleSave}
          disabled={!selectedEmail || !selectedBusiness || loading}
          style={{ opacity: !selectedEmail || !selectedBusiness || loading ? 0.7 : 1 }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" />
              Saving...
            </>
          ) : (
            'Save'
          )}
        </button>

        <Modal isOpen={confirmModal} toggle={toggleConfirmModal}>
          <ModalHeader toggle={toggleConfirmModal}>Confirm</ModalHeader>
          <ModalBody>
            Are you sure you want to set <strong>{selectedEmail?.email}</strong> as primary for business{' '}
            <strong>{selectedBusiness?.organizationName}</strong>?
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={toggleConfirmModal}>Cancel</Button>
            <Button color="primary" onClick={confirmSave}>Yes, Confirm</Button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={successModal} toggle={toggleSuccessModal}>
          <ModalHeader toggle={toggleSuccessModal}>Success</ModalHeader>
          <ModalBody>{modalMessage}</ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={toggleSuccessModal}>OK</Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
};

export default EmailSenderSettings;
