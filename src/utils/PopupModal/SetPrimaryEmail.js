import React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from 'reactstrap';


export default function SetPrimaryEmail({ email, onConfirm, onClose, primaryLoad }) {
  return (
    <Modal isOpen={!!email} toggle={onClose} id="setPrimaryEmailModal" className="modal-add modal-confirm"
      centered>
      <ModalHeader toggle={onClose}>Set primary email</ModalHeader>
      <ModalBody>
        <p className="text-center">
          Are you sure you want to set <strong>{!!email ? email.email : ""}</strong> as your primary email address?
        </p>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" outline onClick={onClose}>Cancel</Button>
        <Button color="primary" onClick={onConfirm} disabled={primaryLoad}>{ primaryLoad ? <Spinner color="default" size="sm" /> : 'Confirm'}</Button>
      </ModalFooter>
    </Modal>
  );
}
