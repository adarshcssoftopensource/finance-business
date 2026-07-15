import { currentExchangeRate } from '../../../../../../../api/globalServices';
import { cloneDeep, set } from 'lodash';
import React, { Component, Fragment } from "react";
import {
  Button,
  Col,
  Form,
  Spinner,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader
} from "reactstrap";
import DatepickerWrapper from '../../../../../../../utils/formWrapper/DatepickerWrapper';
import { toMoney } from '../../../../../../../utils/GlobalFunctions';
import SelectBox from '../../../../../../../utils/formWrapper/SelectBox';
import FormValidationError from '../../../../../../../global/FormValidationError';
import { _toDateConvert } from '../../../../../../../utils/globalMomentDateFunc';

const ACCOUNTS = [
  {
    id: -1,
    label: "Select a payment method",
    value: "",
    disabled: true,
  },
  {
    id: 0,
    label: "Bank payment",
    value: "bank_payment"
  },
  {
    id: 1,
    label: "Cash",
    value: "cash"
  },
  {
    id: 2,
    label: "Check",
    value: "check"
  },
  {
    id: 3,
    label: "Credit card",
    value: "credit_card"
  },
  {
    id: 4,
    label: "PayPal",
    value: "paypal"
  },
  {
    id: 5,
    label: "Other",
    value: "other"
  }
];

export default class RecordPaymentModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: {},
      errors: {},
    };
  }

  componentWillReceiveProps(props) {
    if (!this.props.bill && props.bill) {
      this.findExchangeRate(props.bill);
      this.setState({
        data: {
          amount: Number(props.bill.dueAmount || 0).toFixed(2),
          paymentDate: new Date(),
        },
        errors: {}
      });
    }
  }

  async findExchangeRate(bill) {
    const { businessInfo } = this.props;
    if (!bill) {
      return;
    }

    const { data } = await currentExchangeRate(bill.currency.code, businessInfo.currency.code);
    this.handleChange({ target: { name: 'exchangeRate', value: data.exchangeRate } });
  }

  handleChange = ({ target: { name, value } = {} } = {}) => {
    const data = cloneDeep(this.state.data);
    set(data, name, value);

    this.setState({ data });
  };

  onAmountChange = ({ target: { name, value } = {} } = {}) => {
    const newValue = Number(value || 0).toFixed(2);
    this.handleChange({ target: { name, value: newValue } });
  };

  close = () => {
    this.setState({ data: {}, bill: undefined });
    this.props.onClose();
  };

  getData = () => {
    const { data } = this.state;

    return {
      paymentMethod: data.method,
      amount: data.amount,
      exchangeRate: data.exchangeRate,
      amountInHomeCurrency: data.exchangeRate * data.amount,
      paymentDate: data.paymentDate,
      memo: data.memo,
    };
  };

  validateData = (data) => {
    const errors = {};
    if (!data.paymentMethod) {
      errors.paymentMethod = "This field is required";
    }
    this.setState({ errors });
    return !Object.keys(errors).length;
  };

  submit = (e) => {
    e.preventDefault();
    const payload = this.getData();

    if (!this.validateData(payload)) {
      return;
    }

    if (parseFloat(payload.amount || 0) > parseFloat(this.props.bill.dueAmount || 0)) {
      this.props.showSnackbar(`Payment amount cannot exceed the total amount due ${this.props?.businessInfo?.currency?.symbol || '$'}${parseFloat(this.props.bill.dueAmount || 0).toFixed(2)}`, true);
      return;
    }

    this.props.recordPayment(payload, this.close);
  };

  renderExchangeRate() {
    const { businessInfo, bill } = this.props;
    const { data = {} } = this.state;

    if (!bill) {
      return null;
    }

    if (bill.currency.code === businessInfo.currency.code) {
      return null;
    }

    return (
      <Fragment>
        <div className="py-form-field py-form-field--inline">
          <Label for="amount" className="py-form-field__label">Exchange Rate</Label>
          <div className="py-form-field__element">
            <Input
              type="number"
              className="py-form__element__medium"
              required
              disabled={true}
              value={data.exchangeRate}
              name="exchangeRate"
              onChange={this.handleChange}
            />
            <div className="help-block">{bill.currency.code} to {businessInfo.currency.code}</div>
          </div>
        </div>
        <div className="py-form-field py-form-field--inline align-items-center">
          <Label className="py-form-field__label">Amount in</Label>
          <div className="py-form-field__element ">
            <span className="py-text--hint mt-0">{businessInfo.currency.code}<strong className="ms-1">{toMoney(data.exchangeRate * data.amount)}</strong></span>
          </div>
        </div>
      </Fragment>
    );
  }

  render() {
    const { data = {}, errors = {} } = this.state;
    const { bill,loading } = this.props;
    return (
      <Modal centered isOpen={!!bill} className="modal-common purchase-record-payment">
        <ModalHeader toggle={this.close}>
        {bill && bill.vendor && bill.vendor.vendorType=='contractor' ? 'Pay contractor':'Record a manual payment'} 
        </ModalHeader>
        <ModalBody>
          <Form className="py-form-field--condensed" onSubmit={this.submit}>
            <div className="py-form-field py-form-field--inline">
              <Label for="paymentMethod" className="py-form-field__label is-required">Payment Method</Label>
              <div className="py-form-field__element">
                <div className="py-select--native">
                  <SelectBox
                    getOptionLabel={(value)=>(value["label"])}
                    getOptionValue={(value)=>(value["value"])}
                    value={ACCOUNTS[data.method]}
                    onChange={e => this.handleChange({...e, target: {...e.target, name: 'method', value: e.value}})}
                    placeholder="Select a payment method"
                    options={ACCOUNTS}
                    clearable={false}
                  />
                  <FormValidationError showError={errors.paymentMethod} />
                </div>
              </div>
            </div>
            <div className="py-form-field py-form-field--inline">              
                <Label for="amount" className="py-form-field__label">Amount</Label>
                <div className="py-form-field__element box-symble-field py-form__element__medium">
                    <InputGroup>
                      <InputGroupText className="prependAddon-input-card">
                        {bill && bill.currency && bill.currency.symbol}
                      </InputGroupText>
                      {"   "}
                      <Input
                        type="number"
                        required
                        value={data.amount}
                        name="amount"
                        id="recAmoutn2"
                        className="py-form__element__medium"
                        onChange={this.handleChange}
                        onBlur={this.onAmountChange}
                      />
                    <label htmlFor="recAmoutn2" className="edit-icon" ><i className="fa fa-pen" ></i></label>
                    </InputGroup>
                  </div>
            </div>
            {this.renderExchangeRate()}
            <div className="py-form-field py-form-field--inline">
              <Label for="amount" className="py-form-field__label">Payment Date</Label>
              <div className="py-form-field__element py-form__element__medium payment-date-box">
                <DatepickerWrapper
                  selected={!!data.paymentDate && _toDateConvert(data.paymentDate)}
                  onChange={date => this.handleChange({ target: { value: date, name: "paymentDate" } })}
                  className="form-control"
                  popperPlacement="top-end"
                />
              </div>
            </div>
            <div className="py-form-field py-form-field--inline">
              <Label for="amount" className="py-form-field__label">Memo</Label>
              <div className="py-form-field__element">
                <textarea
                  name="memo"
                  rows={4}
                  className="form-control py-form__element__medium"
                  value={data.memo}
                  onChange={this.handleChange}
                />
              </div>
            </div>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" outline onClick={this.close}>Cancel</Button>
          <Button disabled={loading} color="primary" onClick={this.submit}>
            Submit {loading && (<Spinner size="sm" color="default" />)}
          </Button>
        </ModalFooter>
      </Modal>
    )
  }
}
