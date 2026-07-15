import React, { PureComponent } from 'react'
import { Modal, ModalHeader, ModalBody } from 'reactstrap'

class UploadDocumentModal extends PureComponent {
  render() {
    const { modalTitle, children, handleClose, isOpen, className, headerClass } = this.props
    return (
      <div>
        <Modal isOpen={isOpen} modalTransition={{ timeout: 500 }} className={className}>
          <ModalHeader toggle={handleClose} className={headerClass}>
            {modalTitle}
          </ModalHeader>
          <ModalBody >
            {children}
          </ModalBody>
        </Modal>
      </div>
    )
  }
}

export default UploadDocumentModal
