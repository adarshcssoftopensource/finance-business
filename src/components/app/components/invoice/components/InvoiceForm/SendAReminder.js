import React, { Fragment } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input
} from "reactstrap";
import { connect } from "react-redux";

import { updateData, openGlobalSnackbar } from "../../../../../../actions/snackBarAction";
import { sendReminderMail } from "../../../../../../api/InvoiceService";
import unpaidPng from "../../../../../../assets/unpaid.png"

class SendAReminder extends React.Component {
  state = { customerEmail: "" }
  redirectToPreview = () => {
    const { invoiceData } = this.props
    window.open(`${process.env.REACT_APP_WEB_URL}/invoices-preview/${invoiceData._id}`)
  }

  sendInvoiceToCustomer = async () => {
    const { invoiceData, onClose } = this.props
    const {customer, _id } = invoiceData
    const payload = {
      emailInput: {
        from: localStorage.getItem("user.email"),
        to: [`${customer && customer.email ? customer.email : this.state.customerEmail}`],
        isReminder: true
      }
    }
    await sendReminderMail(_id, payload)
    onClose()
  }

  typeCustomerEmail = e => {
    const { name, value } = e.target
    this.setState({ [name]: value })
  }

  render() {
    const { invoiceData, openReminder, onClose } = this.props
    const { customerEmail } = this.state
    return (
      <Modal
        isOpen={openReminder}
        toggle={onClose}
        className="reminder-modal"
        centered
      >
        <ModalHeader>Send a payment reminder</ModalHeader>
        <ModalBody>
          <div className="reminder-modal">
            <div className="remainder-header">
              <div className="py-form-field">
                <label className="py-form-label">From:</label>
                <div className="py-form-email">{localStorage.getItem('user.email')}</div>
              </div>
              <div className="py-form-field">
                <label className="py-form-label">To:</label>
                {invoiceData.customer && invoiceData.customer.email ? <div className="py-form-email">{invoiceData.customer.email}</div> : <Input name={'customerEmail'} placeholder="Enter customer email" value={customerEmail} onChange={this.typeCustomerEmail} />}
              </div>
            </div>
            <div className="py-divider"> </div>
            <div className="remainder-body">
              <p className="text-center"> Below is an example of the email reminder that your customer will receive:</p>
              <div className="img-box">
                <img src={unpaidPng} />
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" outline onClick={onClose} >Cancel</Button>
          <Button onClick={this.redirectToPreview} color="primary" outline >Preview</Button>
          <Button color="primary" onClick={this.sendInvoiceToCustomer}>Send reminder</Button>
        </ModalFooter>
      </Modal>
    );
  }
}

const mapPropsToState = state => ({
  businessInfo: state.businessReducer.selectedBusiness
});

const mapDispatchToProps = dispatch => {
  return {
    refreshData: () => {
      dispatch(updateData());
    },
    showSnackbar: (message, error) => {
      dispatch(openGlobalSnackbar(message, error));
    }
  };
};

export default connect(
  mapPropsToState,
  mapDispatchToProps
)(SendAReminder);

