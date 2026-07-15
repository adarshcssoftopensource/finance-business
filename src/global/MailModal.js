import React, { Fragment } from "react";
import {
  TabContent,
  TabPane,
  Button,
  Form,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  Label,
  Input,
  Spinner
} from "reactstrap";
import { cloneDeep } from "lodash";
import { connect } from "react-redux";

import Icon from '../components/common/Icon'
import SelectBox from "../utils/formWrapper/SelectBox";
import { mailMessage } from "../components/app/components/invoice/helpers";
import SweetAlertSuccess from "./SweetAlertSuccess";
import { mailEstimate, fetchUsersEmails } from "../api/EstimateServices";
import { logger, _isValidEmail } from "../utils/GlobalFunctions";
import CenterSpinner from "./CenterSpinner";
import FormValidationError from "./FormValidationError";
import { sendInvoice, sendMail, sendReceiptMail } from "../api/InvoiceService";
import PaymeServices from '../api/PaymeServices'
import CrowdFundingServices from "../api/CrowdFundingServices";
import CheckoutServices from '../api/CheckoutService'
import { openGlobalSnackbar } from '../actions/snackBarAction';
import symbolsIcon from "../assets/icons/product/symbols.svg";
class MailModal extends React.Component {
  state = {
    activeTab: "1",
    editSubject: false,
    sentVia: undefined,
    isEmail:true,
    mailInvoice: {
      from: "",
      to: [""],
      subject: ``,
      message: "",
      self: false,
      attachPDF: false
    },
    loading: false,
    showSuccess: false,
    isCanceled:false,
    emails: [],
    emailLoader: false
  };

  componentDidMount() {
    const { mailData, businessInfo, activeTab, from, receipt } = this.props;

    let { mailInvoice } = this.state;
    if(from === 'Receipt'){
      mailInvoice.subject = `Payment Receipt for ${mailData.title} ${mailData.invoiceNumber}`;
    }else{
      mailInvoice.subject = `${from === 'estimate' ? mailData.name : mailData.title} ${from === 'Invoice' ? mailData.invoiceNumber : mailData.estimateNumber} from ${businessInfo.organizationName}`;
    }
    mailInvoice.to = [`${mailData.customer && mailData.customer.email ? mailData.customer.email : ""}`]
    const isEmail = ![mailInvoice.to].includes("")
    if(from === 'Receipt'){
      const customerName = mailData.customer ? mailData.customer.customerName : ''
      const customerEmail = mailData.customer ? mailData.customer.email : ''
      const currencySymbol = mailData.customer && !!mailData.customer.currency.symbol ? mailData.customer.currency.symbol : businessInfo.currency.symbol
      const currencyCode = mailData.customer && !!mailData.customer.currency.code ? mailData.customer.currency.code : businessInfo.currency.code
      mailInvoice.subject = `Payment Receipt for ${mailData.title} ${mailData.invoiceNumber}`;
      mailInvoice.from = localStorage.getItem("user.email");
      mailInvoice.to=[`${customerEmail}`]
      mailInvoice.message = `Hi ${customerName},

        Here's your payment receipt for
        ${mailData.title} ${mailData.invoiceNumber}, for ${currencySymbol}${!!receipt && !!receipt ? receipt.amount : 0} ${currencyCode}.

        You can always view your receipt
        online, at:
        ${process.env.REACT_APP_WEB_URL}/${mailData.paymentFor}/${mailData.uuid}/public/reciept-view/readonly/${receipt.uuid}

        If you have any questions, please let us know.

        Thanks,
      ${businessInfo.organizationName}`
    }
    this.fetchEmails();
    this.setState({ mailInvoice, isEmail, activeTab: activeTab || '1'});
  }

  fetchEmails = async () => {
    let emails=[];
    try{
      this.setState({emailLoader: true})
      let { mailInvoice } = this.state;
      let response = await fetchUsersEmails(localStorage.getItem('user.id'))
      emails = response.data.emails.filter(item => item.status.toLowerCase() === 'verified');
      if(emails.length <= 0){
        this.setState({emailLoader: false})
        this.props.isVerifiedEmail && this.props.isVerifiedEmail(false)
        this.closeMailInvoice();
        this.props.showSnackbar('Please verify your email first to enable this feature', true)
      }else{
        mailInvoice.from = response.data.emails.find(item => item.isPrimary === true).email;
        this.props.isVerifiedEmail &&this.props.isVerifiedEmail(true)
        this.setState({emails, mailInvoice, emailLoader: false})
      }
    }catch(err){
      this.setState({emailLoader: false})
      logger.error("Error in fetchEmails", err)
    }
  }

  componentDidUpdate(previousProps) {
    const { mailData, businessInfo, activeTab, from, receipt } = this.props;
    
    const {isCanceled}= this.state;
    if (previousProps.mailData != mailData) {
      let { mailInvoice } = this.state;
      if(from === 'Receipt'){
        mailInvoice.subject = `Payment Receipt for ${mailData.title} ${mailData.invoiceNumber}`;
      }else{
        mailInvoice.subject = `${from === 'estimate' ? mailData.name : mailData.title} ${from === 'Invoice' ? mailData.invoiceNumber : mailData.estimateNumber} from ${businessInfo.organizationName}`;
      }
      mailInvoice.to = [`${mailData.customer && mailData.customer.email ? mailData.customer.email : ""}`]
      const isEmail = ![mailInvoice.to].includes("")
      if(from === 'Receipt'){
        const customerName = mailData.customer ? mailData.customer.customerName : ''
        const customerEmail = mailData.customer ? mailData.customer.email : ''
        const currencySymbol = mailData.customer && !!mailData.customer.currency.symbol ? mailData.customer.currency.symbol : businessInfo.currency.symbol
        const currencyCode = mailData.customer && !!mailData.customer.currency.code ? mailData.customer.currency.code : businessInfo.currency.code
        mailInvoice.subject = `Payment Receipt for ${mailData.title} ${mailData.invoiceNumber}`;
        mailInvoice.from = localStorage.getItem("user.email");
        mailInvoice.to=[`${customerEmail}`]
        mailInvoice.message = `Hi ${customerName},
  
          Here's your payment receipt for
          ${mailData.title} ${mailData.invoiceNumber}, for ${currencySymbol}${!!receipt && !!receipt ? receipt.amount : 0} ${currencyCode}.
  
          You can always view your receipt
          online, at:
          ${process.env.REACT_APP_WEB_URL}/${mailData.paymentFor}/${mailData.uuid}/public/reciept-view/readonly/${receipt.uuid}
  
          If you have any questions, please let us know.
  
          Thanks,
        ${businessInfo.organizationName}`
      }
      this.setState({ mailInvoice, isEmail, activeTab: activeTab || '1' });
    }
  }
  openReceiptPreview=()=>{
    const {mailData, receipt} = this.props
    window.open(`/${mailData.paymentFor === 'peyme' ? 'peyme' : mailData.paymentFor === 'checkout' ? 'checkout' : mailData.paymentFor === 'invoice' ? 'invoices' : mailData.paymentFor === 'funding' ? 'funding' : ''}/${mailData._id}/receipt-preview/${receipt.uuid}`);
  }
  toggleTab = tab => {
    let queryString = "";
    if (this.state.activeTab !== tab) {
      queryString = tab !== "all" ? `status=${tab}` : "";
      this.setState({
        activeTab: tab
      });
    }
  };

  addToMailAddress = () => {
    let mailInvoice = cloneDeep(this.state.mailInvoice);
    mailInvoice.to.push("");
    this.setState({ mailInvoice, isEmail:true });
  };

  removeMailAddress = idx => {
    let mailInvoice = cloneDeep(this.state.mailInvoice);
    mailInvoice.to = mailInvoice.to.filter((item, index) => {
      return index !== idx;
    });
    if (mailInvoice.to.length <= 0) {
      mailInvoice.to.push("");
    }
    this.setState({ mailInvoice,isEmail:true });
  };

  isValidMail = (value) => {
    const regex = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/
    return regex.test(value)
  }

  handleMailInvoice = (event, index) => {
    const { value, name, type } = event.target;
    let mailInvoice = this.state.mailInvoice;
    if (index !== undefined) {
      mailInvoice[name][index] = value;
    } else {
      if (type === "checkbox") {
        mailInvoice[name] = !mailInvoice[name];
      } else {
        mailInvoice[name] = value;
      }
    }
    this.setState({ mailInvoice });
  };

  handleChangeEmail = (selected, event, index) => {
    if(!!selected){
      this.setState({
        mailInvoice: {
          ...this.state.mailInvoice,
          from: selected.email,
        },
        fromErr: false
      })
    }else{
      if(!!event && !!event.target){
        const { value, name } = event.target;
        let mailInvoice = this.state.mailInvoice;
        const isEmail = _isValidEmail(value)
        mailInvoice[name][index] = value;
        this.setState({ mailInvoice, [`isEmail-${index}`]: isEmail, [`toErr-${index}`]: false, isEmail });
      }else{
        this.setState({
          mailInvoice: {
            ...this.state.mailInvoice,
            from: selected
          },
          fromErr: false
        })
      }
    }
  };

  renderSendAddress = () => {
    const to = this.state.mailInvoice.to;
    return (
      <FormGroup className="py-form-field py-form-field--inline">
        <Label htmlFor="exampleEmail" className="py-form-field__label mt-2">
          To
        </Label>
        <div className="py-form-field__element">
          {to.map((address, index) => {
            return index === 0 ? (
              <div key={index} className="multirecipient">
                <div>
                <Input
                  type="email"
                  name="to"
                  value={address}
                  className="py-form__element__medium"
                  onChange={e => this.handleChangeEmail('', e, index)}
                  id={`modalFormInput${index}`}
                />
                  {
                    (!address || (!this.state.isEmail && !this.state[`isEmail-${index}`] ? true : this.state[`toErr-${index}`])) && (
                      <FormValidationError
                        showError={!this.state.isEmail && !this.state[`isEmail-${index}`] ? true : this.state.toErr}
                        message={!this.state.isEmail && !this.state[`isEmail-${index}`] ? "Please enter a valid email" : 'This field is required'}
                      />
                    )
                  }
                </div>
                <a className="multirecipient__icon py-text--link" onClick={this.addToMailAddress}>
                  {" "}
                  <svg viewBox="0 0 26 26" className="Icon" id="add--large" xmlns="http://www.w3.org/2000/svg"><path d="M13 24C6.925 24 2 19.075 2 13S6.925 2 13 2s11 4.925 11 11-4.925 11-11 11zm0-2a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path><path d="M12 8a1 1 0 0 1 2 0v10a1 1 0 0 1-2 0V8z"></path><path d="M8 14a1 1 0 0 1 0-2h10a1 1 0 0 1 0 2H8z"></path></svg>
                </a>
              </div>
            ) : (
                <div key={index} className="multirecipient">
                  <div>
                  <Input
                    type="email"
                    name="to"
                    className="py-form__element__medium"
                    value={address}
                    onChange={e => this.handleChangeEmail('', e, index)}
                  />
                  {
                    !address && (
                      <FormValidationError
                        showError={!this.state.isEmail && !this.state[`isEmail-${index}`] ? true : this.state[`toErr-${index}`]}
                        message={!this.state.isEmail && !this.state[`isEmail-${index}`] ? "Please enter a valid email" : 'This field is required'}
                      />
                    )
                  }
                  </div>
                  <a className="multirecipient__icon py-text--link-err" onClick={() => this.removeMailAddress(index)}>
                    <svg viewBox="0 0 20 20" className="Icon" id="cancel" xmlns="http://www.w3.org/2000/svg"><path d="M11.592 10l5.078 5.078a1.126 1.126 0 0 1-1.592 1.592L10 11.592 4.922 16.67a1.126 1.126 0 1 1-1.592-1.592L8.408 10 3.33 4.922A1.126 1.126 0 0 1 4.922 3.33L10 8.408l5.078-5.078a1.126 1.126 0 0 1 1.592 1.592L11.592 10z"></path></svg>
                  </a>
                </div>
              );
          })}

          {/* <Form
        {!this.state[`isEmail-${index}`] && <span style={{color:'red'}}>Enter valid email</span>} */}
        </div>
      </FormGroup>
    );
  };

  onEditSubject = () => {
    this.setState({
      editSubject: true
    })
  }

  closeMailInvoice = (status) => {
    const { onClose, mailData, from } = this.props
    if(status === true){
      this.setState({ sentVia: undefined, isCanceled:true, showSuccess: status === true ? true : false })
      if(from === 'Invoice'){
        onClose(status, "Send this invoice", "This invoice was sent", 'invoice')
      }else{
        onClose(mailData);
      }
    } else {
      onClose()
    }
  }

  sendMailToCustomer = async (e) => {
    e.preventDefault()
    const { mailData, showSnackbar, showSnackbar2, from, receipt } = this.props
    let { mailInvoice, sentVia } = this.state
    let toErr = false
    let payload;
    if(!mailInvoice.from){
      document.getElementById('fromEmail').focus()
      this.setState({fromErr: true})
    }else{
      this.setState({fromErr: false})
    }
    if(!mailInvoice.to){
      toErr = true;
      this.setState({[`toErr-${0}`]: true})
    }else{
      if(mailInvoice.to.length <= 0){
        toErr = true;
        this.setState({[`toErr-${0}`]: true})
      }else{
        const to = mailInvoice.to.filter((item, i) => {
          if(!item || item === ""){
            this.setState({[`toErr-${i}`] : true})
          }else{
            this.setState({[`toErr-${i}`] : false})
          }
          return !item || item === ""
        })
        if(to.length > 0){
        toErr = true;
        this.setState({toErr: true})
        }else{
        toErr = false;
        this.setState({toErr: false})
        }
      }
    }
    if(!!mailInvoice.from && !toErr){
      try {
        payload = {
          emailInput: mailInvoice
        }
        this.setState({ loading: true });
          if(from==='estimate'){
            await mailEstimate(mailData._id, payload);
          }else if(from === 'Invoice'){
            await sendMail(mailData._id, payload);
          }else if(from === 'Receipt'){
            if (mailData.paymentFor === 'checkout') {
              await CheckoutServices.sendCheckoutReceiptMail(mailData.uuid, receipt.uuid, payload)
            } else if (mailData.paymentFor === 'peyme') {
              await PaymeServices.sendPeyMeReceiptMail(mailData.uuid, receipt.uuid, payload);
            } else if (mailData.paymentFor === 'funding') {
              await CrowdFundingServices.sendCrowdFundingReceiptMail(mailData.uuid, receipt.uuid, payload);
            } else {
              await sendReceiptMail(mailData.uuid, receipt.uuid, payload);
            }
          }
        await this.setState({ loading: false });
        this.closeMailInvoice(true)
      } catch (error) {
        const errorMessage = error.message
        this.setState({ loading: false });
        showSnackbar(errorMessage, true);
      }
    }
  }

  sendMailToUser = (e, type) => {
    const { mailData, businessInfo } = this.props
    this.setState({
      sentVia: type
    })
    const url = mailMessage(mailData, type, businessInfo)
    window.open(url)
  }

render() {
  const { openMail, businessInfo, mailData, from } = this.props;
  const { mailInvoice, editSubject, sentVia, isEmail, loading, showSuccess, emails, fromErr, toErr, emailLoader } = this.state;
  return (
    showSuccess ?
      (
        <SweetAlertSuccess showAlert={true} title={`Send a ${from.toLowerCase()}`} message={`The ${from} was sent`} onCancel={() => this.setState({showSuccess: false})} from={from}/>
      ): (
      <Modal
        isOpen={openMail}
        toggle={this.closeMailInvoice}
        id="modal"
        centered
      >
        <ModalHeader
          toggle={this.closeMailInvoice}
          id="modalHeader"
        >{mailData && mailData.sentDate ? `Resend ${from.toLowerCase()} via email` : `Send ${from.toLowerCase()} via email`}</ModalHeader>
        <ModalBody
          id="modalBody"
        >
          <TabContent activeTab={this.state.activeTab} id="modalTab">
            <TabPane tabId="1" id="modalTabId">
              {
                !emailLoader ? (

                  <Form className="send-with-py"  onSubmit={e => this.sendMailToCustomer(e)} id="modalForm">
                    <FormGroup className="py-form-field py-form-field--inline mt-3 v-center" id="modalFormGroup">
                      <Label htmlFor="fromEmail" className="py-form-field__label" id="modalFormLabel">
                        From
                      </Label>
                      <div className="py-form-field__element">
                        <SelectBox
                          name="from"
                          getOptionLabel={(value)=>(value["email"])}
                          getOptionValue={(value)=>(value["email"])}
                          value={{email:mailInvoice.from}}
                          onChange={this.handleChangeEmail}
                          options={emails}
                          inputProps={{
                            onInvalid: (e) => e.target.setCustomValidity('This field is required.'),
                            onInput: (e) => e.target.setCustomValidity(''),
                          }}
                          aria-required
                          aria-errormessage={"This field is required."}
                          placeholder="Choose"
                          id="fromEmail"
                          className="py-form__element__medium"
                        />
                        <FormValidationError
                          showError={fromErr}
                        />
                      </div>
                    </FormGroup>
                    {this.renderSendAddress()}
                    <FormGroup className="py-form-field py-form-field--inline align-items-center">
                      <Label htmlFor="exampleEmail" className="py-form-field__label mt-0">Subject</Label>

                    <div className="py-form-field__element">
                          {editSubject ? (
                            <Input
                              type="text"
                              name="subject"
                              className="py-form__element__medium"
                              value={mailInvoice.subject}
                              onChange={this.handleMailInvoice}
                            />
                          ) : (
                              <span className="d-flex" >
                                {" "}
                                <span className="text-break">{mailInvoice.subject}</span> <a className="py-text--link py-text--strong ms-1" href="#" onClick={this.onEditSubject}>
                                  <Icon
                                      className="Icon"
                                      xlinkHref={`${symbolsIcon}#edit-pen`}
                                  />
                                </a>{" "}
                              </span>
                            )}
                    </div>

                    </FormGroup>
                    <FormGroup className="py-form-field py-form-field--inline">
                      <Label htmlFor="exampleEmail" className="py-form-field__label">
                        Message
                    </Label>
                      <div className="py-form-field__element">
                        <textarea
                          type="text"
                          name="message"
                          onChange={this.handleMailInvoice}
                          value={mailInvoice.message}
                          style={{height: '148px'}}
                          className="form-control py-form__element__medium"
                          placeholder={`Enter your message ${
                            !!mailData && from === 'estimate' ? !!mailData.customer && !!mailData.customer.customerName ? `to ${mailData.customer.customerName}` : '' : !!mailData.customer && !!mailData.customer.firstName ? `to ${mailData.customer.firstName} ${mailData.customer.lastName}` : ''
                            }`}
                        />
                      </div>
                    </FormGroup>
                    <FormGroup className="py-form-field py-form-field--inline mb-4">
                      <div className="py-form-field__label"></div>
                      <div className="py-form-field__element">
                      <Label className="py-checkbox">
                        <Input
                          name="self"
                          type="checkbox"
                          id="action"
                          className="py-form__element"
                          value={mailInvoice.self}
                          checked={mailInvoice.self}
                          onChange={this.handleMailInvoice}
                        />{" "}

                        <span className="py-form__element__faux"></span>
                        <span className="py-form__element__label">Send a copy to myself at {mailInvoice.from}</span>
                      </Label>
                     {/* {
                        this.props.from !== 'Receipt' && (
                          <Label className="py-checkbox" >
                              <Input
                                type="checkbox"
                                id="action"
                                name="attachPDF"
                                className="py-form__element"
                                checked={mailInvoice.attachPDF}
                                value={mailInvoice.attachPDF}
                                onChange={this.handleMailInvoice}
                              />
                              <span className="py-form__element__faux"></span>
                              <span className="py-form__element__label">{`Attach the ${from.toLowerCase()}  as a PDF`}</span>
                            </Label>
                        )
                      }*/}
                      </div>

                    </FormGroup>
                    <div className="tabfooter text-right">
                      <Button
                        type="button"
                        color="primary" outline
                        onClick={this.closeMailInvoice}
                        >Cancel</Button>
                        {
                          this.props.from === 'Receipt' && (
                            <Button color="primary" outline
                            onClick={this.openReceiptPreview}
                            >Preview</Button>
                          )
                        }
                        <Button
                          disabled={!isEmail || loading}
                          type={'submit'} color="primary"
                        >{ loading ? <Spinner size="sm" color="light" /> : 'Send'}</Button>
                    </div>
                  </Form>
                ) : (<CenterSpinner/>)
              }
            </TabPane>
            <TabPane tabId="2">
              {!sentVia ? <Fragment>

                <div className="send-invoice-email__provider">
                  <a className="send-invoice-email__provider__link">
                    <img className="send-invoice-email__provider__logo" src="/assets/gmail-logo.png" />
                    <span className="send-invoice-email__provider__text">
                      <span className="py-text py-text--body"
                        onClick={(e) => this.sendMailToUser(e, 'gmail')}
                      >Send with Gmail</span>
                    </span>
                    <span className="send-invoice-email__provider__forward-icon">
                      <i className="fal fa-angle-right"> </i>
                    </span>
                  </a>
                </div>
                <div className="send-invoice-email__divider"></div>
                <div className="send-invoice-email__provider">
                  <a className="send-invoice-email__provider__link">
                    <img className="send-invoice-email__provider__logo" src="/assets/outlook-logo.png" />
                    <span className="send-invoice-email__provider__text">
                      <span className="py-text py-text--body"
                        onClick={(e) => this.sendMailToUser(e, 'outlook')}
                      >Send with Outlook</span>
                    </span>
                    <span className="send-invoice-email__provider__forward-icon">
                      <i className="fal fa-angle-right"> </i>
                    </span>
                  </a>
                </div>
                <div className="send-invoice-email__divider"></div>
                <div className="send-invoice-email__provider">
                  <a className="send-invoice-email__provider__link">
                    <img className="send-invoice-email__provider__logo" src="/assets/yahoo-logo.png" />
                    <span className="send-invoice-email__provider__text">
                      <span className="py-text py-text--body"
                        onClick={(e) => this.sendMailToUser(e, 'yahoo')}
                      >Send with Yahoo! Mail</span>
                    </span>
                    <span className="send-invoice-email__provider__forward-icon">
                      <i className="fal fa-angle-right"> </i>
                    </span>
                  </a>
                </div>
              </Fragment>
                :
                <Fragment>
                  <div className="send-invoice-email__followup">

                    {sentVia === 'gmail' ?
                      <img className="send-invoice-email__followup__logo" src="/assets/gmail-logo.png" />
                      :
                      sentVia === 'yahoo' ?
                        <img className="send-invoice-email__followup__logo" src="/assets/yahoo-logo.png" />
                        :
                        <img className="send-invoice-email__followup__logo" src="/assets/outlook-logo.png" />
                    }
                    <div> {`Welcome back! Did you resend your invoice with ${sentVia}?`} </div>
                  </div>
                  <div className="tabfooter">
                    <Button
                      color="danger" outline
                      onClick={this.sendMailToCustomer} className="pull-right"
                    >Yes, and update sent date</Button>
                    <Button
                    className="pull-right"
                    color="primary"
                    onClick={this.closeMailInvoice}
                    >No, leave as is</Button>
                  </div>
                </Fragment>}

            </TabPane>
          </TabContent>

        </ModalBody>
      </Modal>)
    );
  }
}

const mapPropsToState = state => ({
  businessInfos: state.businessReducer.selectedBusiness
});

const mapDispatchToProps = dispatch => {
  return {
    showSnackbar: (message, error) => {
      dispatch(openGlobalSnackbar(message, error));
    }
  };
};

export default connect(
  mapPropsToState,
  mapDispatchToProps
)(MailModal);
