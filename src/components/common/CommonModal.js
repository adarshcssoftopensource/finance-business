import React, { PureComponent } from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Spinner } from 'reactstrap'
import CenterSpinner from '../../global/CenterSpinner'

class CommonModal extends PureComponent {
  render() {
    const { modalTitle, modalBody, toggle, buttonLabel, isOpen, showPrimary = false, onConfirm, className, headerClass, primaryLabel = 'Delete', primaryLoading = false } = this.props
    return (
      <div>
        <Modal isOpen={isOpen} modalTransition={{ timeout: 700 }} className={className}>
          <ModalHeader toggle={toggle} className={headerClass}>{modalTitle}</ModalHeader>
          <ModalBody className="text-center" >{modalBody}</ModalBody>
          <ModalFooter>
            <Button color="primary" outline onClick={toggle}>{buttonLabel}</Button>
            {
              showPrimary && (
                <Button color="danger" onClick={onConfirm} disabled={primaryLoading}>{primaryLabel} {primaryLoading ? <Spinner color="default" size="sm" className="loader" /> : ""}</Button>
              )
            }
          </ModalFooter>
        </Modal>
      </div>
    )
  }
}

export default CommonModal
