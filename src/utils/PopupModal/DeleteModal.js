import React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from 'reactstrap';
import { renderCardNumber } from '../GlobalFunctions';

export const DeleteModal = props => {
  const { openModal, onDelete, onClose, message, number, btnLoad = false, btnText = 'Delete' } = props;
    return (
        <Modal isOpen={openModal} toggle={onClose} className="modal-add modal-confirm" centered>
            <ModalHeader className="delete" toggle={onClose}>
              {
                !!number ?
                `Delete Invoice #${number}`
                : "Confirmation"
              }
            </ModalHeader>
            <ModalBody className="text-center">
                {
                  !!number && (
                    <span>{`Invoice #${number}`}<br/></span>
                  )
                }
                {message}
            </ModalBody>
            <ModalFooter>
                <Button color="primary" outline onClick={onClose}>Close</Button>
                <Button color="danger" onClick={onDelete} disabled={btnLoad}>
                  {btnLoad ? <Spinner size="sm" color="default" /> : btnText}
               </Button>
            </ModalFooter>
        </Modal>
    )
};

export const CustomDeleteModal = props => {
  const { openModal, onDelete, onClose, btnText = 'Delete', title, btnLoad = false } = props;
    return (
        <Modal isOpen={openModal} toggle={onClose} className="modal-add modal-confirm" centered>
            <ModalHeader className="delete" toggle={onClose}>
              {title}
            </ModalHeader>
            <ModalBody className="text-center">
                {props.children}
            </ModalBody>
            <ModalFooter>
                <Button color="primary" outline onClick={onClose}>Close</Button>
                <Button color="danger" onClick={onDelete} disabled={btnLoad}>{btnLoad ? <Spinner size="sm" color="default" /> : btnText}</Button>
            </ModalFooter>
        </Modal>
    )
};

export const PaymentConfirmation = props => {
  const { openModal, onConfirm, onClose, payment, paymentData } = props;
    return (
        <Modal isOpen={openModal} toggle={onClose} className="modal-add modal-confirm" centered>
            <ModalHeader className="delete">Remove invoice payment</ModalHeader>
            <ModalBody className="text-center">
                <strong>
                  Payment for {paymentData.currency ? paymentData.currency.symbol : ''}{payment ? payment.amount : ""} using {payment ? payment.methodToDisplay : ''}.<br/>
                </strong>
                Are you sure you want to remove this invoice payment?
            </ModalBody>
            <ModalFooter>
                <Button color="primary" outline onClick={onClose}>Cancel</Button>
                <Button className="ms-2" color="danger" onClick={onConfirm}>Remove payment</Button>
            </ModalFooter>
        </Modal>
    )
};

export const PaymentMethodConfirmation = props => {
  const { openModal, onConfirm, onClose, payment, paymentData, cardNumber, btnLoad } = props;
  return (
    <Modal isOpen={openModal} toggle={onClose} className="modal-add modal-confirm" centered>
      <ModalHeader className="delete">Delete credit card</ModalHeader>
      <ModalBody>
        This card will be removed from associated recurring invoice, automatic payments may be affected. Are you sure
        you want to delete this credit card ({renderCardNumber(cardNumber.last4, cardNumber.brand)})?
      </ModalBody>
      <ModalFooter>
        <Button color="primary" outline onClick={onClose}>Cancel</Button>
        <Button type="button" color="danger" className="ms-2" onClick={onConfirm} disabled={btnLoad}>
          {btnLoad ? <Spinner size="sm" color="default" /> : 'Yes, delete'}
        </Button>
      </ModalFooter>
    </Modal>
  )
};
