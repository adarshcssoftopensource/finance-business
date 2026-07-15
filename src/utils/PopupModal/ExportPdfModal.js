import React, { Component } from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Spinner } from 'reactstrap';
import pdfSvg from "../../assets/pdf.svg"

export default class ExportPdfModal extends Component {
    render() {
        const { openModal, onClose, onConfirm, loading, from, btnLoading } = this.props;
        return (
            <Modal isOpen={openModal} toggle={onClose} id="addEmailModal" className="modal-add modal-confirm" centered>
                <ModalHeader>Export to PDF</ModalHeader>
                <ModalBody className="text-center">
                    <div style={{width: "20%", margin: "0 auto"}}>
                        <img src={pdfSvg} className="full-width mrB30"/>
                    </div>
                    <div>Your {from} {loading ? 'is getting ready as PDF.' : btnLoading ? 'Failed to generate PDF at the moment. Please try after sometime.' : 'is ready to be downloaded.'} </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" outline onClick={onClose}>Cancel</Button>
                    <Button color="primary" outline disabled={loading || btnLoading} onClick={onConfirm}>
                        {loading ? <Spinner size="sm"/> : " Download PDF"}
                    </Button>
                </ModalFooter>
            </Modal>
        )
    }
}
