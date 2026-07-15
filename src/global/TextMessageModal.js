import React from 'react';
import { Button, Form, FormGroup, Label, Modal, ModalBody, ModalHeader, Spinner } from 'reactstrap';
import { cloneDeep } from 'lodash';
import { connect } from 'react-redux';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import SweetAlertSuccess from './SweetAlertSuccess';
import FormValidationError from './FormValidationError';
import { sendCheckoutTextMessage, sendInvoiceTextMessage } from '../api/InvoiceService';
import { openGlobalSnackbar } from '../actions/snackBarAction';
import CountryCodeList from '../data/country-code.json';

class TextMessageModal extends React.Component {
  state = {
    activeTab: "1",
    editSubject: false,
    sentVia: undefined,
    isPhone:true,
    textInvoice: {
      to:[],
    },
    country: null,
    loading: false,
    showSuccess: false,
    isCanceled:false,
    emailLoader: false
  };

  componentDidMount = () => {
    const selectedCountry = CountryCodeList.find(val => val.name === this.props.businessInfo.country.name)
    const countryCodeNumber = this.props.textData.customer ?  this.props.textData.customer.communication.phone : selectedCountry
    this.state.textInvoice.to.push(countryCodeNumber);
    this.setState({
      country: selectedCountry ? selectedCountry.sortname.toLowerCase() : null,
      textInvoice:{
        to: this.state.textInvoice.to || []
      }
    })
  }

  closeTextInvoice = (status) => {
    const { onClose, textData, from } = this.props
    if(status === true){
      this.setState({ sentVia: undefined, isCanceled:true, showSuccess: status === true ? true : false })
      switch (from) {
        case 'Invoice':
          onClose(status, "Send this invoice", "This invoice was sent", 'invoice')
          break;
        case 'Checkout':
          onClose(status, "Send this checkout", "This checkout was sent", 'checkout')
          break;
        default:
          onClose(textData);
          break;
      }
    }else {
      onClose()
    }
  }

  addPhoneNumber = () => {
    const selectedCountry = CountryCodeList.find(val => val.name === this.props.businessInfo.country.name)
    let textInvoice = cloneDeep(this.state.textInvoice);
    textInvoice.to.push("");
    this.setState({ textInvoice,
    country: selectedCountry ? selectedCountry.sortname.toLowerCase() : null
   });
  };

  removePhoneNumber = idx => {
    let textInvoice = cloneDeep(this.state.textInvoice);

    textInvoice.to = textInvoice.to.filter((item, index) => {
      return index !== idx;
    });
    if (textInvoice.to.length <= 0) {
      textInvoice.to.push("");
    }
    this.setState({ textInvoice });
  };

  handleChangeCountry = (value,index) => {
    let textInvoice = this.state.textInvoice;
    textInvoice["to"][index] = `+${value}`;
    this.setState({
      textInvoice,
      [`isPhone-${index}`]: false,
      [`toErr-${index}`]: false
    })
  }

  renderPhoneInput = () => {
    const to = this.state.textInvoice.to;
    return (
      <FormGroup className="py-form-field py-form-field--inline mt-3 v-center" id="modalFormGroup">
        <Label htmlFor="exampleEmail" className="py-form-field__label mt-2" id="modalToLabel">
          To
        </Label>
        <div className="py-form-field__element custom-select-div">
          {to.map((phone, index) => {
            const phoneNumber=typeof phone ==='string'? phone :''
            return index === 0 ? (
              <div key={index} className="multirecipient">
                <div id={`modalToInput-${index}`}>
                  <PhoneInput
                    disableSearchIcon
                    countryCodeEditable={false}
                    country={this.state.country}
                    enableSearch
                    value={phoneNumber}
                    onChange={e => this.handleChangeCountry(e, index)}
                  />
                  {
                    (!phone ||  this.state[`toErr-${index}`]) && (
                      <FormValidationError
                        showError={this.state.toErr}
                        message='This field is required'
                      />
                    )
                  }
                </div>
                <a className="multirecipient__icon py-text--link ms-4" onClick={this.addPhoneNumber}>
                  {" "}
                  <svg viewBox="0 0 26 26" className="Icon" id="add--large" xmlns="http://www.w3.org/2000/svg"><path d="M13 24C6.925 24 2 19.075 2 13S6.925 2 13 2s11 4.925 11 11-4.925 11-11 11zm0-2a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path><path d="M12 8a1 1 0 0 1 2 0v10a1 1 0 0 1-2 0V8z"></path><path d="M8 14a1 1 0 0 1 0-2h10a1 1 0 0 1 0 2H8z"></path></svg>
                </a>
              </div>
            ) : (
                <div key={index} className="multirecipient">
                  <div id={`modalToInput-${index}`}>
                  <PhoneInput
                    disableSearchIcon
                    countryCodeEditable={false}
                    value={phoneNumber}
                    country={this.state.country}
                    enableSearch
                    onChange={e => this.handleChangeCountry(e, index)}
                  />
                  {
                    (!phone ||  this.state[`toErr-${index}`]) && (
                      <FormValidationError
                        showError={this.state.toErr}
                        message='This field is required'
                      />
                    )
                  }
                  </div>
                  <a className="multirecipient__icon py-text--link-err ms-4" onClick={() => this.removePhoneNumber(index)}>
                    <svg viewBox="0 0 20 20" className="Icon" id="cancel" xmlns="http://www.w3.org/2000/svg"><path d="M11.592 10l5.078 5.078a1.126 1.126 0 0 1-1.592 1.592L10 11.592 4.922 16.67a1.126 1.126 0 1 1-1.592-1.592L8.408 10 3.33 4.922A1.126 1.126 0 0 1 4.922 3.33L10 8.408l5.078-5.078a1.126 1.126 0 0 1 1.592 1.592L11.592 10z"></path></svg>
                  </a>
                </div>
              );
          })}
        </div>
      </FormGroup>
    );
  };

  sendTextToCustomer = async(data) => {
    data.preventDefault()
    const { showSnackbar,from } = this.props;
    let toErr = false
    if(this.state.textInvoice.to.length > 0  ){
      const to = this.state.textInvoice.to.filter((item, i) => {
        if(!item || item === "" || item.length <= 4){
          this.setState({[`toErr-${i}`] : true})
        }else{
          this.setState({[`toErr-${i}`] : false})
        }
        return !item || item === "" || item.length <= 4
      })
      if(to.length > 0){
      toErr = true;
      this.setState({toErr: true})
      }else{
      toErr = false;
      this.setState({toErr: false})
      }
    }
    if(!toErr){
      try {
       let payload = {
          smsInput: {
            to: this.state.textInvoice.to
          }
        }
        this.setState({ loading: true });
        switch (from) {
          case "Checkout":
            await sendCheckoutTextMessage(this.props.textData._id, payload);
            break;

          default:
            await sendInvoiceTextMessage(this.props.textData._id, payload);
            break;
        }
        await this.setState({ loading: false, fromErr: false });
        this.closeTextInvoice(true)
      } catch (error) {
        const errorMessage = error.message
        showSnackbar(errorMessage, true);
        this.setState({ loading: false });
        this.closeTextInvoice(false)
      }
    }
  }

  render() {
    const { openMail, businessInfo, textData, from, showSnackbar, textMessage } = this.props;
    const { textInvoice, editSubject, sentVia, isEmail, loading, country, showSuccess, fromErr, toErr, emailLoader } = this.state;
    return (     
      <>
        {showSuccess ?
        (
          <SweetAlertSuccess showAlert={true} title={`Send a ${from.toLowerCase()}`} message={`The ${from} was sent`} onCancel={() => this.setState({showSuccess: false})} from={from}/>
        ): (
        <Modal
          isOpen={openMail}
          toggle={this.closeTextInvoice}
          id="modal"
          centered
        >
          <ModalHeader
            toggle={this.closeTextInvoice}
            id="modalHeader"
          >{textData && textData.sentDate ? `Resend ${from.toLowerCase()} via text message` : `Send ${from.toLowerCase()} via text message`}</ModalHeader>
          <ModalBody
            id="modalBody"
          >

              <Form className="send-with-py"  onSubmit={e => this.sendTextToCustomer(e)} id="modalForm">
                {this.renderPhoneInput()}
                <FormGroup className="py-form-field py-form-field--inline mt-3 v-center" id="modalFormGroup">
                  <Label htmlFor="textMessage" className="py-form-field__label" id="modalMessageLabel">
                    Body
                  </Label>
                  <div className="py-form-field__element">
                    <div className="message-body-wrapper">
                    <p>{textMessage}</p>
                    <p className="emoji"></p>
                    <span>{textData.publicView.shareableLinkUrl}</span>
                    </div>
                  </div>
                </FormGroup>

                <div className="tabfooter text-right">
                  <Button
                    type="button"
                    color="primary" outline
                    onClick={this.closeTextInvoice}
                    >Cancel</Button>
                    <Button
                      disabled={loading}
                      type={'submit'} color="primary"
                    >{ loading ? <Spinner size="sm" color="light" /> : 'Send'}</Button>
                </div>
              </Form>
          </ModalBody>
        </Modal>
        )}
        </>
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
)(TextMessageModal);
