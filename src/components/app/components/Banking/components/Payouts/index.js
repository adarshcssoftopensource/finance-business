import React, { Component, Fragment } from 'react';
import { Button, UncontrolledTooltip, Modal, ModalHeader, ModalBody, ModalFooter, InputGroup, Alert,
    InputGroupText,
    Input, Spinner } from "reactstrap";
import TablePayout from './Components/TablePayout';
import { connect } from 'react-redux';
import { get as _get } from 'lodash';
import { getAllPayout } from '../../../../../../actions/payoutActions';
import Icon from '../../../../../common/Icon';
import { NavLink } from "react-router-dom";
import history from '../../../../../../customHistory'
import { _documentTitle, getAmountToDisplay } from '../../../../../../utils/GlobalFunctions';

import paymentService from '../../../../../../api/paymentService';

import TotalAmount from './Components/totalAmount';
import symbolsIcon from "../../../../../../assets/icons/product/symbols.svg";

class Payouts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isTransferToBankModalOpen: false,
            isTransferToBankLoading: false,
            transferAmount: '',
            isBankAutoTransfer: false,
            showTransferToBank : true,
            showPaymentBalance : true
        }
    }

    componentDidMount() {
        const { paymemntSettings: { data }, businessInfo } = this.props
        // if (data && data.isSetupDone && data.isConnected && data.isVerified.payment && data.isOnboardingApplicable) {
            const pData = JSON.parse(localStorage.getItem('paginationData'))
            const queryData = this.handlePayoutURL();
            this.props.getAllPayout(`pageNo=1&pageSize=${pData && pData.limit ? pData.limit : 10}${queryData ? `&${queryData}` : ''}`);
            if (data.isVerified.payout) {
                const payoutSchedule = _get(data, "transferSetting.payouts.schedule.interval", "")
                this.setState({ isBankAutoTransfer: payoutSchedule === "daily" ? true : false })
            }
        /*} else {
            history.push('/app/payments')
        }*/
        _documentTitle(businessInfo, 'Payouts')
    }

    handlePayoutURL = () => {
        const queryData = this.props.handleSearchURL();
        const urlParams = new URLSearchParams(queryData);
        urlParams.delete('status');
        return urlParams.toString()
    }

    handleFetchPayoutAvailableBalance = () => {
        this.setState({ isTransferToBankModalOpen: false, transferAmount: '' });
    }

    handleOpenTransferAmountToBankModal = () => {
        this.setState({ isTransferToBankModalOpen: true });
    }

    handleTransferAmountChange = (event, availableBalance) => {
        const balance = availableBalance && availableBalance[0].amount
        if (event.target.value === "" || (!isNaN(event.target.value) && event.target.value <= balance)) {
            this.setState({ transferAmount: event.target.value});
        }
    }

    transferAmountToBank = async () => {
        const availableBalance = this.props.payoutBalance && this.props.payoutBalance.available;
        const balance = availableBalance && availableBalance[0].amount
        if (!this.state.transferAmount || this.state.transferAmount <= 0) {
            this.props.showSnackbar("Transfer amount must be greater than 0!", true);
            return false;
        } else if (this.state.transferAmount > balance) {
            this.props.showSnackbar(`Transfer amount must be less than ${getAmountToDisplay(balance.currency, balance.amount)}!`, true);
            return false;
        }

        this.setState({ isTransferToBankLoading: true });
        await paymentService.transferAmountToBank({ transferAmount: this.state.transferAmount })
            .then(response => {
                if (response.statusCode === 200) {
                    this.props.getPayoutBalance();
                    this.setState({
                        isTransferToBankLoading: false
                    }, () => this.handleFetchPayoutAvailableBalance())
                    this.props.showSnackbar(response.message)
                } else {
                    this.props.showSnackbar(response.message, true)
                }
            })
            .catch(error => {
                this.setState({
                    isTransferToBankLoading: false
                }, () => this.handleFetchPayoutAvailableBalance())
                this.props.showSnackbar(error.message, true)
            })
    }

    render() {
        const { data } = this.props.payouts
        const { isVerifiedEmail } = this.props
        const isUnderPaymentSection = this.props.isUnderPaymentSection
        const availableBalance = this.props.payoutBalance && this.props.payoutBalance.available;
        const pendingBalance = this.props.payoutBalance && this.props.payoutBalance.pending;
        const providerName = _get(this.props, "paymentSettings.data.providerName", "")
        return (
            <div className={!isUnderPaymentSection ? "content-wrapper__main estimate" : ""}>

               {/* {
                !_get(this.props, "paymentSettings.data.onBoardingRules.isPayoutEnabled", false) ?
                    <Alert color="danger"
                    className="alertReciept alert-action alert-danger justify-content-start mt-4">
                    <div className="alert-icon">
                        <svg
                        viewBox="0 0 20 20"
                        className="Icon__M me-2"
                        id="info"
                        xmlns="http://www.w3.org/2000/svg"
                        >
                        <path
                            d="M10 19a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-2a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm0-11a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 3a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0v-4a1 1 0 0 1 1-1z" />
                        </svg>
                    </div>
                    <div className="alert-content">
                         <div
                          className="alert-desc">{providerName === "paypal" ? "Check your PayPal account for payout details" : `${providerName} provider not supported payout`} </div>
                    </div>
                    </Alert>
                : null
                }*/}
                {/*<div className={`row my-5 ${!_get(this.props.paymemntSettings, "data.onBoardingRules.isPayoutBalanceEnabled", false) ? 'd-none': ''}`}>
                    <div className='col-6'>
                        <div className='card p-4'>
                            <div className='d-flex flex-row justify-content-between'>
                                <UncontrolledTooltip placement="top" target="av_balance" style={{maxWidth: "350px", padding: "10px"}}>The available balance reflects funds available for payout to your bank or Blue Visa Debit card.</UncontrolledTooltip>
                                <h4 className='card-title mb-0'>Available balance <small id='av_balance' className='fal fa-info-circle'></small></h4>
                                {this.state.showPaymentBalance ?
                                <div className='card-balance text-center'>
                                    {availableBalance && getAmountToDisplay(availableBalance[0].currency, availableBalance[0].amount)}
                                </div>
                                : ""}
                            </div>
                            {
                                _get(this.props.paymemntSettings, "data.platformPayoutStatus", "") === "active" && _get(this.props.paymemntSettings, "onBoardingRules.isPayoutDetailChangeEnabled", false) ?
                                    <div>
                                        {
                                            _get(this.props.businessInfo, "currency.code", "") === "USD" && this.state.showTransferToBank ?
                                                <div className='d-flex flex-row justify-content-between align-items-center mt-4'>
                                                    <button className='btn btn-outline-primary px-4'
                                                        onClick={this.handleOpenTransferAmountToBankModal}
                                                        disabled={this.state.isBankAutoTransfer || !isVerifiedEmail}>
                                                        Transfer to bank
                                                    </button>
                                                    <div>
                                                        <UncontrolledTooltip placement="top" target="payoutSettings">
                                                            Settings
                                                        </UncontrolledTooltip>
                                                        <NavLink className="" activeclassname='is-active' to='/app/setting/payouts' id="payoutSettings">
                                                            <Icon
                                                                className="Icon"
                                                                xlinkHref={`${symbolsIcon}#settings`}
                                                            />
                                                        </NavLink>
                                                    </div>
                                                </div>
                                            : null
                                        }
                                    </div>
                                : null
                            }
                        </div>
                    </div>
                    <div className='col-6'>
                        <div className='card p-4'>
                            <div className='d-flex flex-row justify-content-between'>
                                <UncontrolledTooltip placement="top" target="pn_balance" style={{maxWidth: "350px", padding: "10px"}}>The pending balance reflects payments that have yet to complete processing settlement. Once the funds have settled, the funds will be available for payout to your bank or Blue Visa Debit card. </UncontrolledTooltip>
                                <h4 className='card-title mb-0'>Pending balance <small id='pn_balance' className='fal fa-info-circle'></small></h4>
                                <div className='card-balance text-center'>{pendingBalance && getAmountToDisplay(pendingBalance[0].currency, pendingBalance[0].amount)}</div>
                            </div>
                        </div>
                    </div>
                </div>*/}
                {!isUnderPaymentSection &&
                    <Fragment>
                        <header className="py-header--page flex">
                            <div className="py-header--title">
                                <h1 className="py-heading--title">Payouts</h1>
                            </div>
                            <div className="py-header--actions">
                                <Button color="primary" onClick={() => history.push(`/app/setting/payouts`)} >Update bank account</Button>
                            </div>
                        </header>
                        {data && data.balances && <TotalAmount data={data.balances} />}
                    </Fragment>
                }
                <TablePayout isUnderPaymentSection={isUnderPaymentSection} {...this.props} {...this.props.payouts} handlePayoutURL={this.handlePayoutURL} />
                <Modal isOpen={this.state.isTransferToBankModalOpen} className={this.props.className}>
                    {this.state.showPaymentBalance ?
                    <ModalHeader className="border-bottom-0" toggle={this.handleFetchPayoutAvailableBalance}>
                        {`You can transfer up to ${availableBalance && getAmountToDisplay(availableBalance[0].currency, availableBalance[0].amount)}`}
                    </ModalHeader>
                    : ""}
                    <ModalBody>
                    <p>How much would you like to transfer?</p>
                    <InputGroup>
                        <InputGroupText>$</InputGroupText>
                        <Input placeholder="0.00" className="mt-0" name="transferAmount" value={this.state.transferAmount} onChange={(event) => this.handleTransferAmountChange(event, availableBalance)}/>
                    </InputGroup>
                    </ModalBody>
                    <ModalFooter className="border-top-0">
                        {
                            this.state.isTransferToBankLoading ?
                                <Button color="primary" type="button" className="w-25">
                                    <Spinner size="sm" style={{height:"18px",width:"18px"}} color="default" />
                                </Button>
                            : <Button color="primary" type="submit" className="w-25" onClick={this.transferAmountToBank}>Confirm</Button>
                        }
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        paymemntSettings: state.paymentSettings,
        payouts: state.payouts,
        businessInfo: state.businessReducer.selectedBusiness
    }
}
const mapDispatchToProps = dispatch => {
    return {
        getAllPayout: (body) => {
            dispatch(getAllPayout(body))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Payouts);
