import { cloneDeep, groupBy } from 'lodash';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import {
  Alert,
  Button,
  Col,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner
} from 'reactstrap';
import DatepickerWrapper from '../../../../../utils/formWrapper/DatepickerWrapper';
import SelectBox from '../../../../../utils/formWrapper/SelectBox';
import { openGlobalSnackbar, updateData } from '../../../../../actions/snackBarAction';
import { editPayment, recordPayment } from '../../../../../api/InvoiceService';
import CustomerServices from '../../../../../api/CustomerServices';
import {
  _setCurrency,
  _showExchangeRate,
  changePriceFormat,
  handleAclPermissions,
  InfoIcon
} from '../../../../../utils/GlobalFunctions';
import SavedCard from './Payout/SavedCard';
import { fetchAllCustomerCards } from '../../../../../actions/CustomerActions';
import CenterSpinner from '../../../../../global/CenterSpinner';
import { chargeCard } from '../../../../../actions/paymentAction';
import { fetchPaymentSettings } from '../../../../../actions/paymentSettings';
import { bindActionCreators } from 'redux';
import FormValidationError from '../../../../../global/FormValidationError';
import { _formatDate, _toDateConvert } from '../../../../../utils/globalMomentDateFunc';
import changeCart from '../../../../../assets/change-cart.png';
import cashRegister from '../../../../../assets/cash-register.png';
import InformationAlert from '../../../../../global/InformationAlert';

export const paymentAccount = currencyName => {
  return [
    {
      label: `Cash on Hand (${currencyName})`,
      value: 'cash_on_hand'
    },
    {
      label: `CHASE COLLEGE (${currencyName})`,
      value: 'chase_college'
    },
    {
      label: `Owner Invesstment / Drawings (${currencyName})`,
      value: 'owner_investment'
    },
    {
      label: `Cash on Hand (${currencyName})`,
      value: 'cash_on_hand'
    }
  ]
}

export const ACCOUNT = [
  {
    id: 0,
    label: 'Bank payment',
    value: 'bank'
  },
  {
    id: 1,
    label: 'Cash',
    value: 'cash'
  },
  {
    id: 2,
    label: 'Check',
    value: 'check'
  },
  {
    id: 3,
    label: 'Credit card',
    value: 'card'
  },
  {
    id: 4,
    label: 'PayPal',
    value: 'paypal'
  },
  {
    id: 5,
    label: 'Other',
    value: 'other'
  }
]

const PAYMENT_INPUT = {
  account: '',
  amount: 0,
  memo: '',
  method: '',
  exchangeRate: 0,
  invoiceId: '',
  businessId: '',
  paymentDate: _formatDate()
}

class InvoicePayment extends Component {
  state = {
    paymentInput: PAYMENT_INPUT,
    invoiceInput: {},
    recordStep: 0,
    bankSubmit: false,
    showSave: false,
    allCardsData: [],
    cardLoading: true,
    methodErr: false
  }

  componentDidMount() {

    // this.props.fetchPaymentSettings();
    this.initData()
  }

  initData = () => {
    const { openRecord, receipt, paymentData, recordStep, edit } = this.props
    let paymentInput = cloneDeep(this.state.paymentInput)
    if (!!receipt) {
      paymentInput = receipt
      let pMethods = groupBy(ACCOUNT, 'value')
      paymentInput.amount = parseFloat(receipt.amount).toFixed(2) || 0
      // paymentInput.method = (pMethods[receipt.methodToDisplay] && pMethods[receipt.methodToDisplay][0].label)
      // paymentInput.method = pMethods[receipt.methodToDisplay] && (receipt.methodToDisplay == 'card' ? pMethods.credit_card[0].label : pMethods[receipt.methodToDisplay][0].label)
    } else {
      paymentInput.invoiceId = paymentData._id
      paymentInput.amount = parseFloat(paymentData.dueAmount).toFixed(2) || 0
      paymentInput.amount = parseFloat(paymentData.dueAmount).toFixed(2) || 0
      paymentInput.methodToDisplay = null
      paymentInput.memo = null
    }
    paymentInput.exchangeRate = paymentData.exchangeRate || 0
    paymentInput.businessId =
      typeof paymentData.businessId === 'object'
        ? paymentData.businessId._id
        : paymentData.businessId
    this.setState({ paymentInput })
    if (!!recordStep) {
      this.setState({ recordStep })
    }
  }

  componentDidUpdate = async (prevProps, prevState) => {
    const { openRecord, paymentData, recordStep } = this.props
    if (prevProps.openRecord != openRecord) {
      this.initData()
    }
    if (this.state.recordStep === 1) {
      const cardData = await CustomerServices.fetchCustomerCards(
        paymentData.customer._id
      )
      if (prevState.recordStep !== this.state.recordStep) {
        if (cardData.data && cardData.data.length > 0) {
          this.setState({
            allCardsData: cardData.data,
            showSave: true,
            cardLoading: false
          })
        } else {
          this.setState({
            allCardsData: [],
            showSave: false,
            cardLoading: false
          })
        }
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.paymentReducer.data !== nextProps.paymentReducer.data) {
      if (nextProps.paymentReducer.success) {
        this.props.refreshData()
        this.props.onClose()
      }
    }
  }

  onSaveClick = async e => {
    e.preventDefault()
    const {
      showSnackbar,
      paymentData,
      refreshData,
      openAlert,
      receiptIndex,
      receipt,
      isEdit
    } = this.props;
    if (handleAclPermissions(['Viewer'])) {
      showSnackbar(process.env.REACT_APP_PERMISSION_MSG, true)
    } else {
      let { paymentInput } = this.state

      if (!isEdit && parseFloat(paymentInput.amount || 0).toFixed(2) > parseFloat(paymentData.dueAmount || 0).toFixed(2)) {
        showSnackbar(`Payment amount cannot exceed the total amount due ${paymentData?.currency?.symbol || '$'}${parseFloat(paymentData.dueAmount || 0).toFixed(2)}`, true);
        return;
      } else if (isEdit && parseFloat(paymentData.dueAmount || 0).toFixed(2) <= 0 && parseFloat(paymentInput.amount || 0).toFixed(2) > parseFloat(paymentData.totalAmount || 0).toFixed(2)) {
        showSnackbar(`Payment amount cannot exceed the total amount due ${paymentData?.currency?.symbol || '$'}${parseFloat(paymentData.dueAmount || 0).toFixed(2)}`, true);
        return;
      }

      if (!!paymentInput && !paymentInput.methodToDisplay) {
        const elem = document.getElementById('method')
        if (!!elem) {
          elem.focus()
        }
        this.setState({ methodErr: true })
      } else {
        this.setState({ methodErr: false })
        try {
          this.setState({ bankSubmit: true })
          let payment
          let payload = {
            paymentInput: {
              amount: parseFloat(paymentInput.amount),
              amountInHomeCurrency: paymentInput.amountInHomeCurrency,
              exchangeRate: paymentInput.exchangeRate,
              manualMethod: paymentInput.method.toLowerCase(),
              memo: paymentInput.memo,
              method: 'manual',
              paymentDate: paymentInput.paymentDate
            }
          }
          //Checking for edit or record.
          if (receipt) {
            // const newPay = {
            //   paymentInput: {
            //     memo: paymentInput.memo,
            //     method: 'manual',
            //   }
            // }
            payment = await editPayment(paymentData._id, receipt._id, payload)
          } else {
            payment = await recordPayment(paymentData._id, payload)
          }
          await this.onCancel()
          this.setState({ bankSubmit: false })
          refreshData()
          openAlert(payment.data.payment || payment.data.payments[receiptIndex], 'Record a payment', 'The payment was recorded.')
          // onClose()
          // showSnackbar("Payment recorded successfully", false);
        } catch (error) {
          this.setState({ bankSubmit: false })
          showSnackbar(error.message, true)
        }
      }
    }
  }

  onCancel = e => {
    this.setState({
      paymentInput: PAYMENT_INPUT
    })
    this.props.onClose()
  }

  handlePayment = (event, fieldName) => {
    let paymentInput = cloneDeep(this.state.paymentInput)
    if (fieldName === 'paymentDate') {
      paymentInput[fieldName] = !!event ? event : _formatDate(new Date())
    } else if (fieldName === 'account') {
      paymentInput[fieldName] = event.value
    } else if (fieldName === 'method') {
      paymentInput[fieldName] = event.value
      paymentInput.methodToDisplay = event.value
      if (!!event.value) {
        this.setState({ methodErr: false })
      }
    } else {
      const { name, value } = event.target
      paymentInput[name] = value
    }
    this.setState({
      paymentInput
    })
  }

  _setAmount = e => {
    const { name, value } = e.target
    let paymentInput = cloneDeep(this.state.paymentInput)
    if (!!value) {
      paymentInput[name] = parseFloat(value).toFixed(2)
    } else {
      paymentInput[name] = parseFloat(0).toFixed(2)
    }
    this.setState({
      paymentInput
    })
  }

  _handleChargeSaveCard = id => {
    const { paymentData, openAlert, showSnackbar } = this.props
    if (handleAclPermissions(['Viewer'])) {
      showSnackbar(process.env.REACT_APP_PERMISSION_MSG, true)
    } else {
      let paymentBody = {
        paymentInput: {
          uuid: paymentData.uuid,
          method: 'card',
          amount: parseFloat(this.state.paymentInput.amount),
          cardId: id
        }
      }
      this.props
        .chargeCard(paymentBody)
        .then(data => {
          if (data.payload.error) {
            throw Error(data.payload.message)
          }
          openAlert(data.payload.paymentResponse, 'Record a payment', 'The payment was recorded.')
        })
        .catch(err => {
          this.props.showSnackbar(err.message, true)
        })
    }
  }

  render() {
    const {
      openRecord,
      onClose,
      businessInfo,
      paymentData,
      allCards,
      receipt,
      receiptIndex,
      refreshData,
      edit,
      isEdit,
      paymentReducer,
      paymentSettings
    } = this.props
    const {
      paymentInput,
      recordStep,
      bankSubmit,
      showSave,
      allCardsData,
      cardLoading,
      methodErr
    } = this.state
    if (paymentData && paymentData.currency && businessInfo && businessInfo.currency){
      var currencySymbol = _setCurrency(
        paymentData && paymentData.currency,
        businessInfo && businessInfo.currency
      ).symbol
      var currencyName = _setCurrency(
        paymentData && paymentData.currency,
        businessInfo && businessInfo.currency
      )
    }

    const selectedOption = ACCOUNT.find(
      option => option.value === paymentInput.methodToDisplay
    );
    const { providerName } = paymentSettings?.data;
    return (
      <React.Fragment>
        { paymentData && businessInfo && <React.Fragment>
      <Modal
        isOpen={openRecord}
        toggle={onClose}
        onClosed={() => {
          this.setState({ recordStep: 0 })
        }}
      >
        <ModalHeader toggle={onClose}>
          {isEdit === true
            ? 'Edit a payment for this invoice'
            : 'Record a payment'}{' '}
        </ModalHeader>
        {recordStep == 0 ? (
          <div>
            <ModalBody>
              <div>
                {paymentData.currency.code == businessInfo.currency.code && !!paymentSettings && !paymentSettings.loading && !!paymentSettings.data && paymentSettings.data.accept_bank && paymentSettings.data.accept_card ?
                  (<Fragment>
                      <Row style={{ paddingLeft: '10%' }}
                           className={providerName === 'paypal' ? 'disabled' : ''}>
                        <Col xs={3}>
                          <figure style={{ width: '100px' }}>
                            <img src={changeCart} alt="Change Cart" />
                          </figure>
                        </Col>
                        <Col xs={8}>
                          <div style={{ marginBottom: '10px' }}>
                            Process your customer's credit card directly through
                            Finance.
                          </div>
                          <Button
                            color="primary"
                            disabled={providerName === 'paypal'}
                            onClick={() => {
                              this.setState({ recordStep: 1 });
                            }}
                          >Charge a credit card</Button>
                        </Col>
                      </Row>
                    <div className="py-text--divider">
                      <span>&nbsp;&nbsp; OR &nbsp;&nbsp;</span>
                    </div>
                  </Fragment>
                  ) : null}
                <Row style={{ paddingLeft: '10%', marginBottom: '24px' }}>
                  <Col xs={3}>
                    <figure style={{ width: '100px' }} >
                      <img src={cashRegister} alt="Cash Register" />
                    </figure>
                  </Col>
                  <Col xs={9}>
                    <div style={{ marginBottom: '10px' }}>
                      Record a payment you've already received, such as cash,
                      check, or bank payment.
                    </div>
                    <Button
                      color="primary"
                      onClick={() => {
                        this.setState({ recordStep: 2 })
                      }}
                    >Record a manual payment</Button>
                  </Col>
                </Row>
              </div>
            </ModalBody>
          </div>
        ) : recordStep == 1 ? (
          <div>
            {cardLoading ? (
              <CenterSpinner />
            ) : showSave ? (
              <SavedCard
                allCards={allCardsData}
                businessInfo={businessInfo}
                amount={paymentInput.amount}
                setDifferent={() => this.setState({ showSave: false })}
                handlePayment={e => this.handlePayment(e)}
                handleSubmit={id => this._handleChargeSaveCard(id)}
                selectedId={allCardsData[0].id}
                onClose={onClose}
                loading={paymentReducer.loading}
                setAmount={this._setAmount.bind(this)}
                currency={paymentData.currency.code}
              />
            ) : (
                  <ModalBody className="invoice__record__modal__body">
                    {/* <ValidationMessages
                      className="err color-red mrT20"
                      id="invoiceCustomerErr"
                        messages={[]}
                      title="Oops! There is no saved cards on file for this customer."
                      autoFocus={true}
                    /> */}
                    <InformationAlert varient="info">
                      {InfoIcon()}
                      <div className="alert-content">
                        <div className="alert-desc">
                          Currently, no card is saved on file.
                        </div>
                      </div>
                    </InformationAlert>
                    {/*<StripeProvider apiKey={getStripeKey()}>
                      <Elements>
                        <InjectInvoiceCardPayout
                          invoiceData={paymentData}
                          onBack={() => {
                            this.setState({
                              recordStep: allCardsData.length > 0 ? 1 : 0,
                              showSave: allCardsData.length > 0
                            })
                          }}
                          showSnackbar={(message, error) =>
                            this.props.showSnackbar(message, error)
                          }
                          businessInfo={businessInfo}
                          receipt={receipt}
                          receiptIndex={receiptIndex}
                          refreshData={() => refreshData()}
                          openAlert={(payment, number) =>
                            this.props.openAlert(
                              payment,
                              'Record a payment',
                              'The payment was recorded.'
                            )
                          }
                        />
                      </Elements>
                    </StripeProvider>*/}
                  </ModalBody>
                )}
          </div>
        ) : (
              <Form onSubmit={this.onSaveClick}>
                <ModalBody className="invoice__record__modal__body">
                  {isEdit === true ? (
                    <Alert color="primary" className="alertReciept alert-action alert-primary">
                      <div className="alert-icon">
                        <svg
                          viewBox="0 0 20 20"
                          className="Icon__M me-2"
                          id="info"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M10 19a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-2a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm0-11a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 3a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0v-4a1 1 0 0 1 1-1z"></path>
                        </svg>
                      </div>
                      <div className="alert-content">
                        <div className="alert-desc">Payments received through Finance are automatically categorized to ensure accurate bookkeeping.</div>
                      </div>
                    </Alert>
                  ) : (
                      <p>
                        Record a payment you’ve already received, such as cash, check,
                        or bank payment.
                      </p>
                    )}

                  <FormGroup className="py-form-field py-form-field--inline">
                    <Label for="exampleEmail" className="py-form-field__label">
                      Payment date
                </Label>
                    <div className="py-form-field__element">
                      <div className="py-form__element__small">
                        <DatepickerWrapper
                          selected={!!paymentInput.paymentDate && _toDateConvert(paymentInput.paymentDate)}
                          popperPlacement="top-end"
                          onChange={date => this.handlePayment(date, 'paymentDate')}
                          placeholderText="yyyy-MM-dd"
                          dateFormat="yyyy-MM-dd"
                          disabled={edit === true ? true : false}
                          className={
                            edit ? 'form-control invoiceDisabled' : 'form-control'
                          }
                        />
                      </div>
                    </div>
                  </FormGroup>
                  <FormGroup className="py-form-field py-form-field--inline box-symble-field record-payment-form">
                    <Label for="exampleEmail" className="py-form-field__label">Amount</Label>
                    <div className="py-form-field__element">
                      <InputGroup className="py-form__element__medium" >
                        <InputGroupText
                          className={`prependAddon-input-card ${edit === true && 'is-disabled'}`} disabled={edit === true ? true : false}
                        >{currencySymbol || '$'}</InputGroupText>
                        {'   '}
                        <Input
                          value={paymentInput.amount}
                          onChange={this.handlePayment}
                          type="number"
                          name="amount"
                          step="any"
                          onBlur={this._setAmount.bind(this)}
                          disabled={edit === true ? true : false}
                          className={
                            edit
                              ? 'is-disabled py-form__element__medium'
                              : 'py-form__element__medium'
                          }
                          onKeyDown={(e) => {
                              if (e.key === '-' || e.key === 'Minus') {
                                e.preventDefault()
                              }
                            }}
                        />
                      </InputGroup>
                      <small>
                        {' '}
                        {paymentInput.exchangeRate && paymentData.currency
                          ? `${paymentData.currency.code} - ${paymentData.currency.name}`
                          : ''}
                      </small>
                    </div>
                  </FormGroup>
                  {_showExchangeRate(
                    businessInfo.currency,
                    paymentData.currency
                  ) ? (
                      <Fragment>
                        <FormGroup className="py-form-field py-form-field--inline">
                          <Label for="exampleEmail" className="py-form-field__label">
                            Exchange rate
                    </Label>
                          <div className="py-form-field__element">
                            <Input
                              value={paymentInput.exchangeRate}
                              onChange={this.handlePayment}
                              name="exchangeRate"
                              disabled={edit === true ? true : false}
                              className={
                                edit ? 'invoiceDisabled' : 'py-form__element__medium'
                              }
                            />
                            <div className="py-text--small py-text--hint">
                              {paymentInput.exchangeRate && paymentData.currency
                                ? `${paymentData.currency.code} to ${businessInfo.currency.code}`
                                : ''}
                            </div>
                          </div>
                        </FormGroup>
                        <FormGroup className="py-form-field py-form-field--inline">
                          <Label for="exampleEmail" className="py-form-field__label pt-0">
                            Converted amount
                    </Label>
                          <div className="py-form-field__element">
                            <div className="d-flex flex-column">
                              <strong>
                                {businessInfo.currency.symbol}
                                {''}
                                {changePriceFormat(
                                  paymentInput.amount * paymentInput.exchangeRate,
                                  2
                                )}{' '}
                              </strong>
                              <small>
                                {paymentInput.exchangeRate
                                  ? `${businessInfo.currency.code} - ${businessInfo.currency.name}`
                                  : ''}
                              </small>
                            </div>
                          </div>
                        </FormGroup>
                      </Fragment>
                    ) : (
                      ''
                    )}
                  <FormGroup className="py-form-field py-form-field--inline">
                    <Label for="method" className="py-form-field__label">
                      Payment method
                </Label>
                    <div className="py-form-field__element">
                      <SelectBox
                        value={selectedOption}
                        id="method"
                        onChange={e => this.handlePayment(e, 'method')}
                        options={ACCOUNT}
                        clearable={false}
                        placeholder={'Select a payment method'}
                        name="method"
                        disabled={edit === true ? true : false}
                        isDisabled={edit}
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            opacity: edit ? 0.3 : 1,
                            pointerEvents: edit ? 'none' : 'auto',
                          })
                        }}
                        className={edit ? 'invoiceDisabled is-disabled py-form__element__medium' : 'py-form__element__medium'}
                      />
                      <FormValidationError
                        showError={methodErr}
                      />
                    </div>
                  </FormGroup>
                  <FormGroup className="py-form-field py-form-field--inline">
                    <Label for="exampleEmail" className="py-form-field__label">
                      Memo / notes
                </Label>
                    <div className="py-form-field__element">
                      <textarea
                        value={paymentInput.memo}
                        onChange={this.handlePayment}
                        name="memo"
                        rows="4"
                        className="form-control py-form__element__medium"
                      />
                    </div>
                  </FormGroup>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="primary"
                    outline
                    onClick={this.onCancel}
                    type="button"
                  >Cancel</Button>
                  <Button type="submit" color="primary" className="width100">{bankSubmit ? <Spinner size="sm" color="light" /> : 'Submit'}</Button>
                </ModalFooter>
              </Form>
            )}
          </Modal>
          </React.Fragment>}
      </React.Fragment>
    )
  }
}

const mapPropsToState = state => ({
  businessInfo: state.businessReducer.selectedBusiness,
  allCards: state.getAllCards,
  paymentReducer: state.paymentReducer,
  paymentSettings: state.paymentSettings
})

const mapDispatchToProps = dispatch => {
  return {
    refreshData: () => {
      dispatch(updateData())
    },
    showSnackbar: (message, error) => {
      dispatch(openGlobalSnackbar(message, error))
    },
    fetchAllCustomerCards: id => {
      dispatch(fetchAllCustomerCards(id))
    },
    chargeCard: bindActionCreators(chargeCard, dispatch),
    fetchPaymentSettings: bindActionCreators(fetchPaymentSettings, dispatch),
  }
}

export default connect(mapPropsToState, mapDispatchToProps)(InvoicePayment)
