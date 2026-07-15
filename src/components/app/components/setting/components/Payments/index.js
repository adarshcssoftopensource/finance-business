import React, { Component, Fragment } from 'react'
import { get as _get } from 'lodash';
import { InputGroup, InputGroupText, Input, Card, CardBody, Col, Form, FormGroup, Button } from 'reactstrap';
import { ShowPaymentIcons } from '../../../../../../global/ShowPaymentIcons';
import { _documentTitle } from '../../../../../../utils/GlobalFunctions';
import { fetchPaymentSettings, savePaymentSettings, savePaymentSettingsForce, changeStatementDescriptor, fetchProcessingFees, updateMerchantPassFee, resetMerchantPassFee } from '../../../../../../actions/paymentSettings';
import { connect } from 'react-redux';
import Icon from '../../../../../common/Icon'
import { openGlobalSnackbar } from '../../../../../../actions/snackBarAction';
import symbolsIcon from "../../../../../../assets/icons/product/symbols.svg";
import creditCardPng from "../../../../../../assets/icons/png/credit-card.png"
import { PROVIDER_NAME } from '../../../../../../utils/Provider.const';

const acceptPayment = {
  padding: "25px",
  background: "#e0f4fb",
  borderRadius: "6px",
  marginBottom: "25px",
  border: "solid 2px #bde7f6"
};
const declinePayment = {
  padding: "25px",
  background: "#fcfbe3",
  borderRadius: "6px",
  marginBottom: "25px",
  border: "solid 2px #f6f2ad"
};
const pyIcon = {
  marginTop: '-11px'
};
const payload = {};

class Payments extends Component {
  constructor(props) {
    super(props)
    this.state = {
      cardpopupAccept: this.props.data.accept_card,
      statement: this.props.data && this.props.data.statement && this.props.data.statement.displayName || "",
      isPopupCard: false,
      isPopupBank: false,
      editStatement: false,
      loadingUpdate: false,
      paymentButtons: {
        payWithPaypal: false,
        payLaterWithPaypal: false,
        payWithVenmo: false,
      },
      merchantFees: this.props.processingFee || []
    }
  }

  componentDidMount() {
    this.props.fetchPaymentSettings();
    this.props.fetchProcessingFees();

    if (this.props.processingFee && this.props.processingFee.length > 0) {
      this.setState({
        merchantFees: this.props.processingFee
      });
    }

    // let businessInfo = JSON.parse(localStorage.getItem('reduxPersist:businessReducer'))
    // _documentTitle(businessInfo.selectedBusiness, '')
  }

  componentWillReceiveProps(newProps) {
    if (newProps.data.accept_card !== this.props.data.accept_card) {
      this.setState({
        isPopupCard: true
      });
    }
    if (newProps.data.accept_bank !== this.props.data.accept_bank) {
      this.setState({
        isPopupBank: true
      });
    }
    if (newProps.statement_descriptor !== this.props.statement_descriptor) {
      this.setState({
        statement: newProps.statement_descriptor
      })
    }
    if (newProps.processingFee !== this.props.processingFee) {
      this.setState({
        merchantFees: newProps.processingFee
      })
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data.paymentButtons !== this.props.data.paymentButtons) {
      this.setState({
        paymentButtons: this.props.data.paymentButtons
      })
    }
  }

  handleField = (event) => {
    const { name, checked, value } = event.target;
    if (name !== 'accept_card') {
      this.handlePopupCloseCard()
    }
    if (name !== 'accept_bank') {
      this.handlePopupCloseBank()
    }
    if (name === 'preferred_mode') {
      payload[name] = value;
    }
    else {
      payload[name] = checked;
    }
    this.saveSettingAPICall(payload);
  };

  handleChangeStatement = async () => {
    this.setState({
      ...this.state,
      loadingUpdate: true
    })
    const response = await this.props.changeStatementDescriptor(this.state.statement)
    if (response) {
      this.setState({
        ...this.state,
        loadingUpdate: false
      })
    }
    this.props.fetchPaymentSettings();

    this.setState({
      editStatement: false
    })
  }

  handlePopup = (mode, check) => {
    // payload['allInvoices'] = check;
    const obj = {
      onlinePayments: {
        [mode]: check
      }
    }
    this.props.savePaymentSettingsForce(obj)
    // this.saveSettingAPICall(payload);
    if (mode.includes('card')) {
      this.handlePopupCloseCard();
    } else {
      this.handlePopupCloseBank()
    }
  }

  handlePopupCloseCard = () => {
    this.setState({
      isPopupCard: false
    })
  }

  handlePopupCloseBank = () => {
    this.setState({
      isPopupBank: false
    })
  }

  saveSettingAPICall = (dataObj) => {
    this.props.savePaymentSettings(dataObj);
  }

  handlePaymentButtons = (e, buttonType) => {
    const updatedButtons = {
      ...this.state.paymentButtons,
      [buttonType]: e.target.checked
    }
    this.setState({
      paymentButtons: updatedButtons
    })

    const payload = {
      paymentButtons: updatedButtons
    }
    this.saveSettingAPICall(payload);
  }

  handleMerchantFeeChange = (index, feeType, field, value) => {
    const updatedFees = [...this.state.merchantFees];
    let finalValue = parseFloat(value) || 0;

    // If it's a percentage field (dynamic), convert from whole number to decimal
    if (field === 'dynamic') {
      finalValue = finalValue / 100;
    }

    updatedFees[index] = {
      ...updatedFees[index],
      [feeType]: {
        ...updatedFees[index][feeType],
        [field]: finalValue
      }
    }
    this.setState({ merchantFees: updatedFees });
  }

  savePassFees = () => {
    this.props.updateMerchantPassFee(this.state.merchantFees);
  }

  resetToDefaultFees = () => {
    this.props.resetMerchantPassFee();
  }

  render() {
    const { paymentButtons } = this.state;
    const { data, loading, businessInfo } = this.props;
    if (data) {
      if (data && (!data.isConnected || !data.isOnboardingApplicable)) {
        this.props.history.push('/app/payments')
      }
    }
    let bankDisabled = data && !data.charges?.bank_charge_message;
    return (
      <div className="py-page__content py-page__settings__payments">
        <div className="py-page__inner" style={{ maxWidth: "1000px" }}>
          <header className="py-header--page flex">
            <div className="py-header--title">
              <h2 className="py-heading--title">Payments</h2>
            </div>
          </header>
          <div className="py-box py-box--large">
            <Form>
              <FormGroup>
                <div className="py-table__cell ps-0 mt-4">
                  <label className="py-switch m-0" htmlFor="accept_card">
                    <span className="py-toggle__label ms-0 me-2">
                      Accept credit card payments on new invoices
                      <ShowPaymentIcons className="credit-card-icons mt-3" icons={['visa', 'master', 'amex', 'discover']} />
                    </span>
                    <input
                      id="accept_card"
                      disabled={loading}
                      type="checkbox"
                      className="py-toggle__checkbox"
                      name="accept_card"
                      value="accept_card"
                      onChange={this.handleField}
                      checked={data.accept_card}
                    />
                    <span className="py-toggle__handle pull-right"></span>
                    <span className="py-form-field__hint receipts-setting__hint-text">
                      {data.charges ? data.charges.card_charge_message : null}
                    </span>
                  </label>
                </div>
                <div className="py-divider"></div>
                <span>This will be applied on all existing Invoices, Checkouts and Finance.Me Lynks.</span>
                {this.props?.businessInfo?.provider === PROVIDER_NAME.PROVIDER_PAYPAL &&
                  <>
                    <div className="py-table__cell ps-0 mt-4">
                      <label htmlFor="payWithPaypal" className="py-switch m-0">
                        <span className="py-toggle__label ms-0 me-2">PayPal&nbsp;</span>
                        <input
                          type="checkbox"
                          id="payWithPaypal"
                          name="payWithPaypal"
                          className="py-toggle__checkbox"
                          checked={paymentButtons['payWithPaypal']}
                          onChange={e => this.handlePaymentButtons(e, 'payWithPaypal')}
                        />
                        <span className="py-toggle__handle pull-right" />
                      </label>
                    </div>
                    <div className="py-table__cell ps-0 mt-4">
                      <label htmlFor="payLaterWithPaypal" className="py-switch m-0">
                        <span className="py-toggle__label ms-0 me-2">Pay Later&nbsp;</span>
                        <input
                          type="checkbox"
                          id="payLaterWithPaypal"
                          name="payLaterWithPaypal"
                          className="py-toggle__checkbox"
                          checked={paymentButtons['payLaterWithPaypal']}
                          onChange={e => this.handlePaymentButtons(e, 'payLaterWithPaypal')}
                        />
                        <span className="py-toggle__handle pull-right" />
                      </label>
                    </div>
                    <div className="py-table__cell ps-0 mt-4">
                      <label htmlFor="payWithVenmo" className="py-switch m-0">
                        <span className="py-toggle__label ms-0 me-2">Venmo&nbsp;</span>
                        <input
                          type="checkbox"
                          id="payWithVenmo"
                          name="payWithVenmo"
                          className="py-toggle__checkbox"
                          checked={paymentButtons['payWithVenmo']}
                          onChange={e => this.handlePaymentButtons(e, 'payWithVenmo')}
                        />
                        <span className="py-toggle__handle pull-right" />
                      </label>
                    </div>
                  </>
                }
              </FormGroup>
              {this.state.isPopupCard &&
                <React.Fragment>
                  {data.accept_card ?
                    <div className="py-settings-accept-payment" style={acceptPayment}>
                      <div >

                        <div className="d-inline-flex align-items-center mb-4">
                          <svg className="Icon me-2" style={pyIcon} viewBox="0 0 20 20" id="info" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 19a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-2a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm0-11a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 3a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0v-4a1 1 0 0 1 1-1z"></path>
                          </svg>
                          <h4 style={{
                            fontSize: "20px",
                            fontWeight: "400"
                          }}>
                            Dont Forget about existing invoices</h4>
                        </div>

                        <p className="mb-4">They are also more likey to get paid fater when you turn on credit card payments</p>
                        <Button color="primary" outline onClick={() => this.handlePopup('modeCard', 'true')}>Accept credit card payments for existing invoices</Button>
                        <Button color="link" onClick={this.handlePopupCloseCard}> Not Right Now </Button>
                      </div>

                    </div>
                    :
                    <div className="py-settings-accept-payment" style={declinePayment}>
                      <div>

                        <div className="d-inline-flex align-items-center mb-4">



                          <svg className="me-2" style={pyIcon} xmlns="http://www.w3.org/2000/svg" fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12" y1="17" y2="17" /></svg>
                          <h4 style={{
                            fontSize: "20px",
                            fontWeight: "400"
                          }}>
                            Do you wish to turn off credit card payments on all existing invoices as well?</h4>
                        </div>
                        <Button color="primary" outline onClick={() => this.handlePopup('modeCard', 'false')}>Yes, turn off credit card payments for existing invoices as well</Button>
                        <Button color="link" onClick={this.handlePopupCloseCard}> Not Right Now</Button>
                      </div>

                    </div>
                  }


                </React.Fragment>}
              {/* Unhcomment to Accept Bank Payments */}
              {/* <FormGroup>

                <div className="d-flex justify-content-between align-items-center">
                  <label className="py-switch m-0" htmlFor="accept_bank">
                    <input
                      id="accept_bank"
                      disabled={loading || bankDisabled}
                      type="checkbox"
                      name="accept_bank"
                      value="accept_bank"
                      className="py-toggle__checkbox"
                      onChange={this.handleField}
                      checked={!bankDisabled && data.accept_bank}
                    />
                    <span className={`py-toggle__handle ${bankDisabled ? 'disabled' :''}`}></span>&nbsp;
                  <span className="py-toggle__label">
                      Accept bank payments (ACH) on new invoices
                  </span>
                    <span className="py-form-field__hint receipts-setting__hint-text">
                      {data.charges ? data.charges.bank_charge_message : null}
                    </span>
                  </label>
                  <lable>
                    <ShowPaymentIcons className="bank-logos__wrapper" icons={['boi', 'chase', 'wells']} />
                    <span className="py-form-field__hint receipts-setting__icon-text">
                      &amp; 2,400+ others
                    </span>
                  </lable>
                </div>
              </FormGroup> */}
              {this.state.isPopupBank &&
                <Fragment>
                  {

                    data.accept_bank ?
                      <div className="py-settings-accept-payment" style={acceptPayment}>
                        <div >
                          <div className="d-inline-flex align-items-center mb-4">
                            <svg className="Icon me-2" style={pyIcon} viewBox="0 0 20 20" id="info" xmlns="http://www.w3.org/2000/svg">
                              <path d="M10 19a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-2a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm0-11a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 3a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0v-4a1 1 0 0 1 1-1z"></path>
                            </svg>
                            <h4 style={{
                              fontSize: "20px",
                              fontWeight: "400"
                            }}>
                              Dont Forget about existing invoices</h4>
                          </div>

                          <p className="mb-4">They are also more likey to get paid fater when you turn on bank payments</p>
                          <Button color="primary" outline onClick={() => this.handlePopup('modeBank', 'true')}>Accept bank payments for existing invoices</Button>
                          <Button color="link" onClick={this.handlePopupCloseBank}>Not Right Now</Button>
                        </div>
                      </div>
                      :
                      <div className="py-settings-accept-payment" style={declinePayment}>
                        <div>

                          <div className="d-inline-flex align-items-center mb-4">



                            <svg className="me-2" style={pyIcon} xmlns="http://www.w3.org/2000/svg" fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12" y1="17" y2="17" /></svg>
                            <h4 style={{
                              fontSize: "20px",
                              fontWeight: "400"
                            }}>
                              Do you wish to turn off bank payments on all existing invoices as well?</h4>
                          </div>


                          <Button color="primary" outline onClick={() => this.handlePopup('modeBank', 'false')}>Yes turn off bank payments for existing invoices as well ?</Button>
                          <Button color="link" onClick={this.handlePopupCloseBank}> Not Right Now </Button>
                        </div>

                      </div>
                  }
                </Fragment>
              }
              <div className="py-divider"></div>
              <div>
                <span className="py-text">When offering both payment methods to your customers, how would you prefer to be paid?</span>
              </div>
              <ul className="list-inline m-0">
                <li className="list-inline-item me-4">
                  <label htmlFor="id_payment_method_0" className="py-radio">
                    <input
                      type="radio"
                      name="preferred_mode"
                      id="id_payment_method_0"
                      checked={data.preferred_mode === "card" ? true : false}
                      value="card"
                      onChange={this.handleField}
                    />
                    <span className="py-form__element__faux"></span>
                    <span className="py-form__element__label">Credit Card</span>
                  </label>
                </li>
                {/* Unhcomment to Accept Bank Payments */}
                {/* <li className="list-inline-item">
                 
                  <label htmlFor="id_payment_method_1" className="py-radio">
                    <input
                      type="radio"
                      disabled={bankDisabled}
                      name="preferred_mode"
                      id="id_payment_method_1"
                      checked={data.preferred_mode === "bank" ? true : false}
                      value="bank"
                      onChange={this.handleField}
                    />
                    <span className="py-form__element__faux"></span>
                    <span className="py-form__element__label">Bank Payment</span>
                  </label>
                </li> */}
              </ul>
            </Form>
            {/* <div className="py-divider"></div>
              <div>
                <strong className="py-text">Statement descriptor</strong>
              </div>
              {!this.state.editStatement ?                
                <div>
                  <label for="def_subhead" class="py-form-field__label">{this.state.statement}</label>
                  <button className={`btn-link ${!_get(data, "onBoardingRules.isStatementDescriptorChangeEnabled", false) ? 'd-none' : ''}`}
                    onClick={()=>this.setState({editStatement: true})}>
                  <Icon
                      className="Icon"
                      xlinkHref={`${symbolsIcon}#edit-pen`}
                  />
                  </button>
                </div>
                :
                <div className="row">
                  <div className="col-lg-4">
                    <InputGroup>
                      <Input className="mt-0"
                             type="text"
                             name="statement"
                             id="statement"
                          // disabled={this.state.editStatement}
                             value={this.state.statement}
                             onChange={(e) => this.setState({statement: e.target.value})}/>
                      <InputGroupText className="cursor-pointer" onClick={this.handleChangeStatement}><i
                          className="fal fa-check"></i></InputGroupText>
                      <InputGroupText className="cursor-pointer" onClick={() => this.setState({
                        editStatement: false,
                        statement: data.statement.displayName
                      })}><i className="fal fa-times"></i></InputGroupText>
                    </InputGroup>
                  </div>
                </div>
              }` */}
          </div>

          <div className="py-box py-box--large mt-4">
            <header className="py-header--box flex mb-4">
              <div className="py-header--title">
                <h3 className="py-heading--title">Fee Management</h3>
                <span className="py-form-field__hint">Customize the fees passed to your customers. Leaving these as 0 will use the platform defaults.</span>
              </div>
              <div className="py-header--actions">
                <Button color="link" className="text-danger p-0 me-3" onClick={this.resetToDefaultFees}>Reset to Defaults</Button>
                <Button color="primary" size="sm" onClick={this.savePassFees}>Save Fees</Button>
              </div>
            </header>

            <div className="py-table__wrapper">
              <table className="py-table">
                <thead>
                  <tr>
                    <th className="ps-0">Method</th>
                    <th>Domestic (%)</th>
                    <th>Domestic ($)</th>
                    <th>International (%)</th>
                    <th>International ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.merchantFees && this.state.merchantFees.length > 0 ? (
                    this.state.merchantFees.filter(fee => fee.type !== 'wallet').map((fee, index) => (
                      <tr key={index}>
                        <td className="ps-0 pt-3 pb-3">
                          <span className="text-capitalize">{fee.type === 'bnpl' ? 'BNPL' : fee.type}</span>
                        </td>
                        <td>
                          <Input
                            type="number"
                            step="0.01"
                            value={fee.passFee?.dynamic ? parseFloat((fee.passFee.dynamic * 100).toFixed(4)) : 0}
                            onChange={(e) => this.handleMerchantFeeChange(index, 'passFee', 'dynamic', e.target.value)}
                            className="py-form-field__input"
                            style={{ width: '80px' }}
                          />
                        </td>
                        <td>
                          <Input
                            type="number"
                            step="0.01"
                            value={fee.passFee?.fixed}
                            onChange={(e) => this.handleMerchantFeeChange(index, 'passFee', 'fixed', e.target.value)}
                            className="py-form-field__input"
                            style={{ width: '80px' }}
                          />
                        </td>
                        <td>
                          <Input
                            type="number"
                            step="0.01"
                            value={fee.international_passFee?.dynamic ? parseFloat((fee.international_passFee.dynamic * 100).toFixed(4)) : 0}
                            onChange={(e) => this.handleMerchantFeeChange(index, 'international_passFee', 'dynamic', e.target.value)}
                            className="py-form-field__input"
                            style={{ width: '80px' }}
                          />
                        </td>
                        <td>
                          <Input
                            type="number"
                            step="0.01"
                            value={fee.international_passFee?.fixed}
                            onChange={(e) => this.handleMerchantFeeChange(index, 'international_passFee', 'fixed', e.target.value)}
                            className="py-form-field__input"
                            style={{ width: '80px' }}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        {this.props.loading ? 'Loading fee settings...' : 'No fee settings found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="d-flex flex-column justify-content-center align-items-center">
            <img src={creditCardPng} className="Icon--xlg" />
            <h3 className="py-heading--title">Give customers the option to pay you right away</h3>
            <h4 className="py-heading--subtitle">Online payments help you get paid up to 3 times faster!</h4>
          </div>
          <div className="benefits-description py-box py-box--large py-box--gray d-none">
            <ul className="py-list--icon">
              {data?.charges?.messages?.map((msg, i) => (<li key={i}>
                <svg viewBox="0 0 20 20" className="Icon me-2" xmlns="http://www.w3.org/2000/svg"><path d="M7 14.586L17.293 4.293a1 1 0 0 1 1.414 1.414l-11 11a1 1 0 0 1-1.414 0l-5-5a1 1 0 0 1 1.414-1.414L7 14.586z"></path></svg>
                <strong>{msg.heading}:</strong> {msg.body}
              </li>))}
            </ul>
          </div>
        </div>
      </div>
    )
  }
}

const mapPropsToState = ({ paymentSettings: { data, loading, statement_descriptor, processingFee }, snackbar, businessReducer }) => ({
  businessInfo: businessReducer.selectedBusiness,
  legalDetails: businessReducer.legalDetails,
  data,
  statement_descriptor,
  processingFee,
  loading
});

export default connect(mapPropsToState, { openGlobalSnackbar, savePaymentSettings, fetchPaymentSettings, savePaymentSettingsForce, changeStatementDescriptor, fetchProcessingFees, updateMerchantPassFee, resetMerchantPassFee })(Payments)
