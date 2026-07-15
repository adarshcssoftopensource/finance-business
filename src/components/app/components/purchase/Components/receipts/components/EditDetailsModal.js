import { fetchCurrencies } from '../../../../../../../api/globalServices';
import taxServices from '../../../../../../../api/TaxServices';
import { cloneDeep, orderBy, uniqBy, truncate } from 'lodash';
import React, { Component } from 'react';
import { Button, Form, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner, Collapse } from 'reactstrap';
import DatepickerWrapper from '../../../../../../../utils/formWrapper/DatepickerWrapper';
import SelectBox from '../../../../../../../utils/formWrapper/SelectBox';
import FormValidationError from '../../../../../../../global/FormValidationError';
import { _toDateConvert, _formatDate } from '../../../../../../../utils/globalMomentDateFunc';
export default class EditDetailsModal extends Component {
    isTaxAdded = (id) => {
        const { data: { amountBreakup: { taxes = [] } = {} } = {} } = {} = this.state;
        const tax = taxes.find(r => r.id === id);
        return !!tax;
    };

    toggleTax = (tax) => {
        const data = cloneDeep(this.state.data || {});

        if (!data.amountBreakup) {
            data.amountBreakup = {};
        }

        if (!data.amountBreakup.taxes) {
            data.amountBreakup.taxes = [];
        }

        const index = data.amountBreakup.taxes.findIndex(r => r.id === tax.id);
        if (index === -1) {
            const amount = Number(tax.rate * Number(data.subTotal || data.amountBreakup.subTotal) / 100).toFixed(2);
            data.amountBreakup.taxes.push({ ...tax, amount })
        } else {
            data.amountBreakup.taxes.splice(index, 1);
        }

        this.setState({ data });
    };
    getTaxAmount = (id) => {
        const data = cloneDeep(this.state.data || {});
        if (!data.amountBreakup) {
            data.amountBreakup = {};
        }
        if (!data.amountBreakup.taxes) {
            data.amountBreakup.taxes = [];
        }
        const tax = data.amountBreakup.taxes.find(r => r.id === id);
        if (!tax) {
            return '';
        }
        return !tax.amount ? '0.00' : tax.amount;
    };
    close = () => {
        this.setState({ data: {} }, this.props.onClose);
    };
    handleChange = ({ target: { name, value } }) => {
        this.setState({ data: { ...this.state.data, [name]: value }, errors: {} });
    };
    onAmountChange = ({ target: { name, value } }) => {
        const newValue = Number(value || 0).toFixed(2);
        this.handleChange({ target: { name, value: newValue } });
    };

    handleValidation = (data) => {
        const errors = {};
        if (!data.merchant) {
            document.getElementById('merchant').focus()
            errors.merchant = true;
        } else if (!data.receiptDate) {
            document.getElementById('receiptDate').focus()
            errors.receiptDate = true;
        } else if (!data.currency) {
            document.getElementById('currency').focus()
            errors.currency = true;
        } else if (!data.totalAmount) {
            document.getElementById('totalAmount').focus()
            errors.totalAmount = true;
        }
        this.setState({ errors });
        return !Object.keys(errors).length
    }

    submit = async (e) => {
        e.preventDefault();
        const payload = this.getData();
        if (!this.handleValidation(payload)) {
            return;
        } else {
            this.props.editReceipt(this.props.data.id, payload);
        }

    };

    save = (e) => {
        e.preventDefault();
        const payload = this.getData();
        if (!this.handleValidation(payload)) {
            return;
        } else {
            this.props.saveReceipt(this.props.data.id, payload);
        }
    };

    constructor(props) {
        super(props);

        this.state = {
            currencies: [],
            taxes: [],
            data: props.data,
            errors: {},
            isOpen: false
        }
    }

    componentDidMount() {
        this.fetchTaxes();
        this.fetchCurrencies();
    }

    componentWillReceiveProps(props) {
        if (Object.keys(this.state.data || {}).length < 2 && props.data) {
            this.setState({
                data: {
                    ...props.data,
                    totalAmount: Number(props.data.totalAmount || 0).toFixed(2),
                    receiptDate: props.data.receiptDate || _formatDate(new Date()),
                    currency: props.currency,
                    amountBreakup: {
                        ...(props.data.amountBreakup || {}),
                        subTotal: Number(props.data.amountBreakup?.subTotal || 0).toFixed(2),
                    }
                }
            });
        }
    }

    async fetchCurrencies() {
        const response = await fetchCurrencies();
        const list = (Array.isArray(response) ? response : [])
            .map(country => country?.currencies?.[0] || country)
            .filter(Boolean);
        const currencies = orderBy(uniqBy(list, "code"), "code", "asc");
        this.setState({ currencies });
    }

    async fetchTaxes() {
        const response = (await taxServices.fetchTaxes())?.data?.taxes || [];
        response.forEach(row => {
            row.id = row._id;
            delete row._id;
        });
        this.setState({ taxes: response })
    }

    handleTaxChange(id, amount, blur) {
        const data = cloneDeep(this.state.data || {});

        if (!data.amountBreakup) {
            data.amountBreakup = {};
        }

        if (!data.amountBreakup.taxes) {
            data.amountBreakup.taxes = [];
        }

        const index = data.amountBreakup.taxes.findIndex(r => r.id === id);

        if (index === -1) {
            return;
        }

        data.amountBreakup.taxes[index].amount = blur ? Number(amount).toFixed(2) : amount;
        this.setState({ data });
    }

    getData() {
        const payload = cloneDeep(this.state.data);
        if (!payload.amountBreakup) {
            payload.amountBreakup = {};
        }
        if (payload.subTotal) {
            payload.amountBreakup.subTotal = payload.subTotal;
            delete payload.subTotal;
        }

        delete payload.id;
        delete payload.uuid;
        delete payload.createdAt;
        delete payload.fileUrl;
        delete payload.previewUrl;
        delete payload.status;
        delete payload.source;

        return payload;
    }



    renderMedia() {
        const { data: { fileUrl, previewUrl, source } = {} } = this.props;
        return (
            <div className="preview-section">
                <a target="_blank" href={fileUrl} className="media-wrapper">
                    <img src={previewUrl} alt="receipt preview" className="media" />
                    <span className="py-text--link">View original receipt</span>
                </a>
                <span className="source">Source: {source}</span>
            </div>
        );
    }

    renderTaxes() {
        const { data: { amountBreakup: { taxes = [] } = {} } = {} } = this.props;

        if (!this.state.taxes.length) {
            return null;
        }

        return this.state.taxes.map((tax) => (
            <div className="py-form-field py-form-field--inline" key={tax.id}>
                <Label className="py-form-field__label">
                    Tax
                </Label>
                <div className="py-form-field__element">
                    <div className="checkbox-custom me-2">
                        <Label check>
                            <Input
                                type="checkbox"
                                name={tax.name}
                                className="me-2"
                                checked={this.isTaxAdded(tax.id)}
                                value={tax.id}
                                onChange={() => this.toggleTax(tax)}
                            />
                            {truncate(tax.abbreviation, { 'length': 35, 'separator': '...' })}
                        </Label>
                    </div>
                    <div >
                        {/* <Label>
                            Amount
                            </Label> */}
                        <Input
                            className="py-form__element__fluid form-control"
                            type="number"
                            disabled={!this.isTaxAdded(tax.id)}
                            value={this.getTaxAmount(tax.id)}
                            name="subTotal"
                            onChange={(e) => this.handleTaxChange(tax.id, e.target.value)}
                            onBlur={(e) => this.handleTaxChange(tax.id, e.target.value, true)}
                        />
                    </div>
                </div>
            </div>
        ));
    }

    renderInformation() {
        const { isOpen, errors, currencies, data: { merchant, receiptDate, notes, subTotal, currency = {}, totalAmount, amountBreakup = {} } = {} } = this.state;
        return (
            <Form onSubmit={e => e.preventDefault()}>
                <div className="py-form-field py-form-field--inline">
                    <Label className="py-form-field__label is-required">
                        Merchant
                    </Label>
                    <div className="py-form-field__element">
                        <Input
                            type="text"
                            value={merchant}
                            name="merchant"
                            id="merchant"
                            className="py-form__element__fluid form-control"
                            onChange={this.handleChange}
                        />
                        <FormValidationError showError={errors.merchant} />
                    </div>
                </div>
                <div className="py-form-field py-form-field--inline">
                    <Label className="py-form-field__label is-required">
                        Date
                    </Label>
                    <div className="py-form-field__element">
                        <DatepickerWrapper
                            popperPlacement="top-end"
                            selected={receiptDate ? _toDateConvert(receiptDate) : ''}
                            onChange={date => this.handleChange({ target: { value: date, name: "receiptDate" } })}
                            className="py-form__element__fluid form-control"
                            id="receiptDate"
                        />
                        <FormValidationError showError={errors.receiptDate} />
                    </div>
                </div>
                <div className="py-form-field py-form-field--inline">
                    <Label className="py-form-field__label">
                        Notes
                    </Label>
                    <div className="py-form-field__element">
                        <textarea
                            name="notes"
                            rows={2}
                            className="form-control py-form__element__fluid form-control"
                            value={notes}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="py-form-field py-form-field--inline">
                    <Label className="py-form-field__label">
                        Subtotal
                    </Label>
                    <div className="py-form-field__element">
                        <Input
                            type="number"
                            value={subTotal || amountBreakup.subTotal}
                            name="subTotal"
                            className=" py-form__element__fluid form-control"
                            onChange={this.handleChange}
                            onBlur={this.onAmountChange}
                        />
                    </div>
                </div>
                <div className="py-form-field py-form-field--inline">
                    <Label className="py-form-field__label is-required">
                        Currency
                    </Label>
                    <div className="py-form-field__element">
                        <SelectBox
                            value={currency}
                            getOptionLabel={(value)=>(value["displayName"])}
                            getOptionValue={(value)=>(value["code"])}
                            onChange={selected => this.handleChange({ target: { name: 'currency', value: selected } })}
                            options={currencies}
                            clearable={false}
                            id="currency"
                        />
                        <FormValidationError showError={errors.currency} />
                    </div>
                </div>
                <div className="py-form-field py-form-field--inline">
                    <Label className="py-form-field__label is-required">
                        Total
                    </Label>
                    <div className="py-form-field__element">
                        <Input
                            id="totalAmount"
                            type="number"
                            value={totalAmount}
                            name="totalAmount"
                            className="py-form__element__fluid form-control"
                            onChange={this.handleChange}
                            onBlur={this.onAmountChange}

                        />
                        <FormValidationError showError={errors.totalAmount} />
                    </div>
                </div>
                {this.state.taxes.length && <div className="text-right">
                    <span className="py-text--link " onClick={this.toggle}>View taxes</span>
                </div>}
                <Collapse isOpen={isOpen}>
                    {this.renderTaxes()}
                </Collapse>
            </Form>
        );
    }
    toggle = () => this.setState({ isOpen: !this.state.isOpen });
    render() {
        const { data } = this.props;

        return (
            <Modal centered isOpen={!!data} className="modal-common receipt-details edit-mode show-overlay">
                <ModalHeader toggle={this.close}>
                    Receipt details
                </ModalHeader>
                <ModalBody>
                    <div className="receipt-container">
                        {this.renderMedia()}
                        <div className="information-section">
                            {this.renderInformation()}
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button outline color="primary" onClick={this.close}>Cancel</Button>
                    <Button hidden={this.props.updating} color="primary" outline onClick={this.save}>Save</Button>
                    <Button hidden={this.props.updating} color="primary" onClick={this.submit}>Post to Accounting</Button>
                    <Button hidden={!this.props.updating} color="primary" ><Spinner size="sm" color="primary" /></Button>
                </ModalFooter>
            </Modal>
        )
    }
}
