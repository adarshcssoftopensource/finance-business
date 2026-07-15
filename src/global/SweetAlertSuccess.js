import React, { Component } from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader, Spinner, Button, Table } from "reactstrap";
import SuccessSvg from './SuccessSvg';
import ProcessSvg from './ProcessSvg';
import FailedSvg from './FailedSvg';

class SweetAlertSuccess extends Component {
  onConfirmClick = (e) => {
    const { receipt, receiptIndex, onConfirm } = this.props;
    onConfirm(receipt, receiptIndex)
  };

  showSweetAlert = (receipt) => {
    const { onCancel, message, showAlert, title, from, load , existingCustomers = []  } = this.props;
    return (
      <Modal
        className={'modalSweet-alert modal-add'}
        centered
        toggle={onCancel}
        isOpen={showAlert}
      >
        <ModalHeader>
          <h4 className={'text-left'}>{title}</h4>
        </ModalHeader>
        <ModalBody>
        {existingCustomers.length > 0 && (
              <div className="mt-4">
                <h6 className="text-danger">Duplicate Records Found:</h6>
                <p className="text-muted mt-2">These records were not imported because they already exist in your system.</p>
                <div className="table-responsive">
                  <Table striped size="sm">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {existingCustomers.map((record, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{`${record.firstName || ''} ${record.lastName || ''}`.trim()}</td>
                          <td>{record.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              
              </div>

            )}
  
          {existingCustomers.length === 0 && (
          <div className="sweetAlert-modal-content">
            <div className={"sweetAlert-modal-success__check"}>
              {(!!receipt && !!receipt.status) ? receipt.status === 'SUCCESS' ? <SuccessSvg/> :
              receipt.status === 'WAITING' || receipt.status === 'INITIATED' || receipt.status === 'PENDING' ? <ProcessSvg/> : <FailedSvg/> : <SuccessSvg/>}
            </div>
            <div className="sweetAlert-modal__heading">
              <div className="sweetAlert-modal__heading-title">
                {(!!receipt && !!receipt.status) ? receipt.status === 'SUCCESS' ? message : receipt.status === 'INITIATED' || receipt.status === 'PENDING' || receipt.status === 'WAITING' ? 'Please wait we are verifying your payment...' : "Failed" : message}
              </div>
            </div>
          </div>
          )}
        </ModalBody>
        <ModalFooter>
          <div className="sweetAlert-modal-footer__btn-wrapper">
            <Button outline color="primary" className="me-2" onClick={onCancel} id="dropItemClose">Close</Button>
            {
              from === 'invoice' || from === "Receipt" ? ""
              : <Button color="primary"
                onClick={this.onConfirmClick.bind(this)} id="dropItemConfirm" disabled={ load || !!receipt && !!receipt.status && (receipt.status === 'INITIATED' || receipt.status === 'PENDING'|| receipt.status === 'WAITING')}
              >{load ? <Spinner size="sm" color="default" /> : from === "Invoice" || from === "Receipt" ? 'Send a receipt' : 'Done'}</Button>
            }
          </div>
        </ModalFooter>
      </Modal>
    )
  };
  render() {
    const { showAlert, receipt } = this.props;
    return (
      showAlert ? this.showSweetAlert(receipt) : ""
    );
  }
}


export default SweetAlertSuccess
