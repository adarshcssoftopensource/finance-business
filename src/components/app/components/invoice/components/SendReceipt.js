import React, { Component } from 'react';
import {
  Button,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner
} from "reactstrap";
import { connect } from "react-redux";

import { updateData, openGlobalSnackbar } from "../../../../../actions/snackBarAction";
import { cloneDeep } from "lodash";
import { sendReceiptMail } from '../../../../../api/InvoiceService';
import { fetchUsersEmails } from '../../../../../api/EstimateServices';
import SelectBox from '../../../../../utils/formWrapper/SelectBox';
import FormValidationError from '../../../../../global/FormValidationError';

class SendReceipt extends Component {
  state = {
    sendReceipt: {
      from: localStorage.getItem('user.email'),
      to: [""],
      subject: "",
      message: "",
      self: false
    },
    loading: false,
    fromErr: false,
    toErr: false,
    isEmail: true
  }

  componentDidMount() {
    const { invoiceData, businessInfo } = this.props;
    
    let { sendReceipt } = this.state;
    sendReceipt.subject = `Payment Receipt for ${invoiceData.title} #${invoiceData.invoiceNumber}`;
    sendReceipt.from = localStorage.getItem("user.email");
    sendReceipt.to=[`${invoiceData.customer && invoiceData.customer.email}`]
    this.fetchEmails();
    this.setState({ sendReceipt });
  }
  
  fetchEmails = async () => {
    let emails=[];
    try{
      let response = await fetchUsersEmails(localStorage.getItem('user.id'))
      emails = response.data.emails;
      this.setState({emails})
    }catch(err){
    }
  }
  componentDidUpdate(prevProps) {
    const { openRecord, receipt, invoiceData, businessInfo } = this.props;
    if (prevProps.openRecord != openRecord) {
      const customerName = invoiceData.customer ? invoiceData.customer.customerName : ''
      const customerEmail = invoiceData.customer ? invoiceData.customer.email : ''
      const currencySymbol = invoiceData.customer && !!invoiceData.customer.currency.symbol ? invoiceData.customer.currency.symbol : businessInfo.currency.symbol
      const currencyCode = invoiceData.customer && !!invoiceData.customer.currency.code ? invoiceData.customer.currency.code : businessInfo.currency.code
      let { sendReceipt } = this.state;
      sendReceipt.subject = `Payment Receipt for ${invoiceData.title} #${invoiceData.invoiceNumber}`;
      sendReceipt.from = localStorage.getItem("user.email");
      sendReceipt.to=[`${customerEmail}`]
      sendReceipt.message = `Hi ${customerName},

Here's your payment receipt for
${invoiceData.title} #${invoiceData.invoiceNumber}, for ${currencySymbol}${receipt.amount} ${currencyCode}.

You can always view your receipt
online, at:
${process.env.REACT_APP_WEB_URL}/invoice/${invoiceData.uuid}/public/reciept-view/readonly/${receipt._id}

If you have any questions, please let us know.

Thanks,
${businessInfo.organizationName}`
this.setState({ sendReceipt });
    }
  }

  openReceiptPreview=()=>{
    const {invoiceData, receipt} = this.props
    window.open(`/invoices/${invoiceData._id}/receipt-preview/${receipt._id}`);
  }

  onSaveClick = async e => {
    e.preventDefault();
    const { showSnackbar, invoiceData, receipt, refreshData, onClose } = this.props;
    let emailInput = this.state.sendReceipt
    let toErr = false

    if(!this.state.sendReceipt.from){
      document.getElementById('fromEmail').focus()
      this.setState({fromErr: true})
    }else{
      this.setState({fromErr: false})
    }
    if(!this.state.sendReceipt.to){
      toErr = true;
      this.setState({toErr: true})
    }else{
      if(this.state.sendReceipt.to.length <= 0){
        toErr = true;
        this.setState({toErr: true})
      }else{
        const to = this.state.sendReceipt.to.filter(item => !item || item === "")
        if(to.length > 0){
        toErr = true;
        this.setState({toErr: true})
        }else{
        toErr = false;
        this.setState({toErr: false})
        }
      }
    }
    if(!!this.state.sendReceipt.from && !toErr){
      try {
        await this.setState({ loading: true });
        await sendReceiptMail(invoiceData._id, receipt._id, { emailInput });
        onClose();
        refreshData();
        showSnackbar("Payment recorded successfully", false);
        await this.setState({ loading: false });
      } catch (error) {
        showSnackbar("Something went wrong. Please try again", true);
        await this.setState({ loading: false });
      }
    }
  };

  onCancel = e => {
    this.setState({
      sendReceipt: {
        from: "",
        to: [""],
        subject: "Invoice #5 from Sample",
        message: "",
        self: false
      }
    });
    this.props.onClose();
  };

  handleReceipt = (event, index, selected = null) => {
    let sendReceipt = this.state.sendReceipt;
    if(!!selected){
      sendReceipt.from = selected.email
    }else{
      const { value, name, type } = event.target;
      if (index === "message") {
        sendReceipt[name] = value;
      } else {
        if (index !== undefined) {
          sendReceipt[name][index] = value;
        } else {
          if (type === "checkbox") {
            sendReceipt[name] = !sendReceipt[name];
          } else {
            sendReceipt[name] = value;
          }
        }
      }
    }
    this.setState({ sendReceipt });
  };

  addRecipientAddress = () => {
    let sendReceipt = cloneDeep(this.state.sendReceipt);
    sendReceipt.to.push("");
    this.setState({ sendReceipt });
  };

  removeRecipientAddress = idx => {
    let sendReceipt = cloneDeep(this.state.sendReceipt);
    sendReceipt.to = sendReceipt.to.filter((item, index) => {
      return index !== idx;
    });
    if (sendReceipt.to.length <= 0) {
      sendReceipt.to.push("");
    }
    this.setState({ sendReceipt });
  };

  renderSendAddress = () => {
    const to = this.state.sendReceipt.to;
    return (
      <FormGroup className="py-form-field py-form-field--inline">
        <Label for="exampleEmail" className="py-form-field__label mt-2">
          To
        </Label>
        <div className="py-form-field__element">
          {to.map((address, index) => {
            return index === 0 ? (
              <div key={index} className="multirecipient">
                <Input
                  type="email"
                  name="to"
                  value={address}
                  onChange={e => this.handleReceipt(e, index)}
                />
                <a className="multirecipient__icon py-text--link" onClick={this.addRecipientAddress}>
                  <svg className="Icon" viewBox="0 0 26 26" id="add--large" xmlns="http://www.w3.org/2000/svg"><path d="M13 24C6.925 24 2 19.075 2 13S6.925 2 13 2s11 4.925 11 11-4.925 11-11 11zm0-2a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path><path d="M12 8a1 1 0 0 1 2 0v10a1 1 0 0 1-2 0V8z"></path><path d="M8 14a1 1 0 0 1 0-2h10a1 1 0 0 1 0 2H8z"></path></svg>
                </a>
                {
                  (!address || (!this.state.isEmail ? true : this.state.toErr)) && (
                    <FormValidationError
                      showError={!this.state.isEmail ? true : this.state.toErr}
                      message={!this.state.isEmail ? "Please enter a valid email" : 'This field is required'}
                    />
                  )
                }
              </div>
            ) : (
                <div key={index} className="multirecipient">
                  <Input
                    type="email"
                    name="to"
                    value={address}
                    onChange={e => this.handleReceipt(e, index)}
                  />
                  <a className="multirecipient__icon py-text--link" onClick={() => this.removeRecipientAddress(index)}>
                    <svg className="Icon" viewBox="0 0 20 20" id="cancel" xmlns="http://www.w3.org/2000/svg"><path d="M11.592 10l5.078 5.078a1.126 1.126 0 0 1-1.592 1.592L10 11.592 4.922 16.67a1.126 1.126 0 1 1-1.592-1.592L8.408 10 3.33 4.922A1.126 1.126 0 0 1 4.922 3.33L10 8.408l5.078-5.078a1.126 1.126 0 0 1 1.592 1.592L11.592 10z"></path></svg>
                  </a>
                  {
                    !address && (
                      <FormValidationError
                        showError={!this.state.isEmail ? true : this.state.toErr}
                        message={!this.state.isEmail ? "Please enter a valid email" : 'This field is required'}
                      />
                    )
                  }
                </div>
              );
          })}
        </div>
      </FormGroup>
    );
  };

  render() {
    const { openRecord, onCloseReceiptMail, businessInfo, invoiceData } = this.props;
    const { sendReceipt, loading, emails, fromErr } = this.state
    return (
      <Modal
        isOpen={openRecord}
        toggle={onCloseReceiptMail}
        className="send-with-py"
        centered
      >
        <ModalHeader toggle={onCloseReceiptMail}>Send a receipt</ModalHeader>
        <ModalBody>
          <FormGroup className="py-form-field py-form-field--inline mt-3 v-center">
            <Label for="exampleEmail" className="py-form-field__label">From</Label>
            <div className="py-form-field__element">
              <SelectBox
                name="from"
                getOptionLabel={(value)=>(value["email"])}
                getOptionValue={(value)=>(value["email"])}
                value={sendReceipt.from}
                onChange={(selected, e) => this.handleReceipt(e, '', selected)}
                options={emails}
                aria-required
                inputProps={{
                  onInvalid: (e) => e.target.setCustomValidity('This field is required.'),
                  onInput: (e) => e.target.setCustomValidity(''),
                }}
                aria-errormessage={'This field is required.'}
                placeholder="Choose"
                id="fromEmail"
                required
                className="py-form__element__medium"
              />
              <FormValidationError
                showError={fromErr}
              />
              {/* {localStorage.getItem('user.email')} */}
            </div>
          </FormGroup>
          {this.renderSendAddress()}
          <FormGroup className="py-form-field py-form-field--inline v-center">
            <Label for="exampleEmail" className="py-form-field__label mt-0">Subject</Label>
            <div className="py-form-field__element form-control w-auto ms-0">
              {sendReceipt.subject}
            </div>
          </FormGroup>
          <FormGroup className="py-form-field py-form-field--inline">
            <Label for="exampleEmail"className="py-form-field__label">
              Message
              </Label>
            <div className="py-form-field__element">
              <Input type={"textarea"} cols={5} rows={15}value={sendReceipt.message} className="form-control custom-textarea" name={"message"} onChange={this.handleReceipt} />
            </div>
          </FormGroup>
          <FormGroup className="py-form-field py-form-field--inline mb-4">
            <div className="py-form-field__label"></div>
            <div className="py-form-field__element">
              <label className="py-checkbox">
                <Input
                  name="self"
                  type="checkbox"
                  value={sendReceipt.self}
                  checked={sendReceipt.self}
                  onChange={this.handleReceipt}
                />
                <span className="py-form__element__faux"></span>
                <span className="py-form__element__label">Send a copy to myself at {sendReceipt.from}</span>
              </label>
            </div>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            outline
            onClick={this.onCancel}
          >Cancel</Button>
          <Button 
            color="primary"
            outline
            onClick={this.openReceiptPreview}
          >Preview</Button>
          <Button
            type="submit"
            onClick={this.onSaveClick}
            disabled={loading}
            color="primary"
          >{ loading ? <Spinner size="sm" color="light" /> : 'Send'}</Button>
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
)(SendReceipt)
