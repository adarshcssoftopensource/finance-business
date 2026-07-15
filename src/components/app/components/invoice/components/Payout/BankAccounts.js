import React, { Component, Fragment } from 'react'
import { Col, Form, FormGroup, InputGroup, Label,
    InputGroupText,
    Input, FormText, Spinner, Row, Button } from 'reactstrap'
import { _institutionLists } from '../../helpers';
import SelectBox from '../../../../../../utils/formWrapper/SelectBox';
import { toMoney, terms } from '../../../../../../utils/GlobalFunctions';
import PlaidLinkTokenButton from '../../../../../../global/PlaidWrapper/PlaidLinkTokenButton';
import { AccountOption } from './AccountOption';
import { _displayDate } from '../../../../../../utils/globalMomentDateFunc';
export default class BankAccounts extends Component {

    state = {
        accounts: [],
        amountPay: 0,
        selectedBank: null,
        signErr: false
    }
    componentDidMount() {
        const { accounts, invoiceData, logo, selectedBank } = this.props
        let arr = []
        !!accounts && accounts.map((item, i) => {
            arr = arr.concat({
                accountName: item.name,
                mask: item.mask,
                // type: item.subtype,
                className: "bank-select-list",
                label: <AccountOption account={item} logo={logo} />,
                id: item.account_id
            })
        })
        let selected = arr.find(item => { return selectedBank === item.id })
        this.setState({ accounts: arr, selectedBank: selected, amountPay: invoiceData && parseFloat(invoiceData.dueAmount).toFixed(2) })
    }

    componentDidUpdate(prevProps) {
        if (prevProps.selectedBank !== this.props.selectedBank) {
            let selected = this.state.accounts.find(item => { return this.props.selectedBank === item.id })
            this.setState({ selectedBank: selected })
        }
    }


    handleSubmit(e) {
        e.preventDefault();
    }

    handlePayment(e) {
        e.preventDefault();
        let { metadata, token, signature } = this.props;
        if (!!signature) {
            this.props.proceedToPay(token, metadata)
        } else {
            this.setState({ signErr: true })
        }
    }

    render() {
        const { accounts, amountPay, selectedBank, signErr } = this.state;
        const { invoiceData, paidAmount, handleOnSuccess, orgName, loading } = this.props
        return (
            <div className="bankAccounts-wrapper bankPayment-container">
                <Form onSubmit={this.handleSubmit.bind(this)}>
                    <Row>
                        <Col md={8} >
                            <FormGroup className="text-left">
                                <Label for="selectAccount" className="mb-1 d-block">Select a bank acocunt</Label>
                                <SelectBox
                                    autofocus={true}
                                    // openOnFocus={true}
                                    getOptionLabel={(value)=>(value["label"])}
                                    getOptionValue={(value)=>(value["id"])}
                                    className="select-bank-box"
                                    value={!!selectedBank ? selectedBank : undefined}
                                    onChange={item => this.props.handleAccount(item)}
                                    searchable={false}
                                    options={accounts}
                                    aria-required
                                />
                                <FormText>
                                    <PlaidLinkTokenButton
                                        api="onboarding"
                                        asWrapper
                                        onSuccess={(token, metadata) => handleOnSuccess(token, metadata)}
                                        className="plaid d-inline"
                                    >
                                        <span className="py-text--hint mt-1 py-text--link">Use a different bank</span>
                                    </PlaidLinkTokenButton>
                                </FormText>
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <FormGroup className="text-left font-small box-symble-field">
                                <Label for="payAmount" className="mb-1" >Amount to pay</Label>
                                <InputGroup size="lg">
                                    <InputGroupText className="prependAddon-input-card">
                                        {invoiceData && invoiceData.currency && invoiceData.currency.symbol}
                                    </InputGroupText>
                                    <input
                                        type="number"
                                        step="any"
                                        value={paidAmount}
                                        onChange={e => this.props.handleChange(e)}
                                        name="paidAmount"
                                        id="recAmoutn5"
                                        onBlur={(e) => this.props.setAmount(e)}
                                        required
                                        className="stripe-control form-control text-strong accountAmount"
                                    />
                            <label htmlFor="recAmoutn5" className="edit-icon" ><i className="fa fa-pen" ></i></label>
                                </InputGroup>
                            </FormGroup>
                        </Col>
                    </Row>


                    <div xs={12} className="text-center authorize-text">
                        <p className="mb-0" >I authorize this payment to {orgName} on {_displayDate(new Date(), 'll')} or thereafter. </p>
                        <p>I agree with the <a href={terms()} taegt={'_blank'} target="_blank" className="py-text--strong py-text--link">Terms of Use</a>.</p>
                    </div>
                    <FormGroup className="text-center" style={{ maxWidth: '420px', margin: '0 auto 32px auto' }}>
                        <Input type="text" name="signature" id="signature"
                            autoComplete={'off'}
                            className="border-left-no border-right-no border-top-no text-center bankSign p-0"
                            onChange={e => this.props.handleChange(e)}
                            placeholder="Enter your full name here"
                        ></Input>
                        {
                            signErr ?
                                <FormText><span className="err color-red">Please sign above</span></FormText>
                                : ""
                        }
                        <div className="mt-1">Account Holder Signature</div>
                    </FormGroup>


                    <Button type="submit" color="primary" block className="width100" onClick={this.handlePayment.bind(this)}
                        disabled={(!!selectedBank ? selectedBank.label.props.account.balances.available : 0) < (!!paidAmount ? parseFloat(paidAmount) : invoiceData ? parseFloat(invoiceData.dueAmount) : 0)}
                    ><i className="fal fa-lock" />&nbsp;&nbsp;&nbsp;{loading ? <Spinner size="sm" color="light" /> : `Pay ${`${invoiceData && invoiceData.currency && invoiceData.currency.symbol}${toMoney(!!paidAmount ? paidAmount : invoiceData && invoiceData.dueAmount)}`}`}</Button>
                </Form>
            </div>
        )
    }
}
