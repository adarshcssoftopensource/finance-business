import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { PROVIDER_NAME } from '../../utils/Provider.const';
import CrediCards from '../creditCards';
class MethodPopup extends Component {
    render() {
        const { modeCard, modeBank, creditCardDisabled, bankModeDisabled, paymentButtons, handlePaymentButtons, modePayByBank } = this.props
        return (
            <Fragment>
                <button className="py-popup-close" onClick={this.props.toggle}>
                    <i className="fal fa-times" /></button>
                <div className="py-popup-content-wrapper">
                    <h6>Allow my customer to pay this invoice via:</h6>
                    <div className="payOpt">
                        <div className="row">
                            <div className="py-table__cell ps-0 mt-4">
                            <label htmlFor="card" className="py-switch m-0">
                                <span className="py-toggle__label ms-0 me-2">Credit Card&nbsp;</span>
                                <input
                                    type="checkbox"
                                    id="card"
                                    name="modeCard"
                                    className="py-toggle__checkbox"
                                    checked={modeCard}
                                    onChange={(e) => this.props.handleChange(e)}
                                    disabled={creditCardDisabled}
                                />
                                <span className="py-toggle__handle pull-right" />
                            </label>
                        </div>
                        {/* <div className="py-table__cell ps-0 mt-4">
                            <label htmlFor="payByBank" className="py-switch m-0">
                                <span className="py-toggle__label ms-0 me-2">Pay by Bank&nbsp;</span>
                                <input
                                    type="checkbox"
                                    id="payByBank"
                                    name="payByBank"
                                    className="py-toggle__checkbox"
                                    checked={modePayByBank}
                                    readOnly
                                />
                                <span className="py-toggle__handle pull-right" />
                            </label>
                        </div> */}
                            <CrediCards cards={['cc-visa', 'cc-mastercard', 'cc-amex', 'cc-discover']} />
                        </div>
                        {this.props?.selectedBusiness?.provider === PROVIDER_NAME.PROVIDER_PAYPAL &&
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
                                        onChange={e => handlePaymentButtons(e, 'payWithPaypal')}
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
                                        onChange={e => handlePaymentButtons(e, 'payLaterWithPaypal')}
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
                                        onChange={e => handlePaymentButtons(e, 'payWithVenmo')}
                                    />
                                    <span className="py-toggle__handle pull-right" />
                                </label>
                            </div>
                        </>
                        }
                        {/* Remove comment code while bank payment is enabled */}
                        {/* <div className="row">
                            <div className="toggle-handle">
                                <div className={`switch ${bankModeDisabled ? 'disabled' : ''}`}>
                                    <input
                                        type="checkbox"
                                        id="bank"
                                        name={"modeBank"}
                                        checked={modeBank}
                                        onChange={(e) => this.props.handleChange(e)}
                                        disabled={bankModeDisabled}
                                    />
                                    <label htmlFor="bank"><span className="round-btn"></span></label>
                                </div>
                                <span className="txt">Bank Payment</span>
                            </div>
                            <div className="Icons cards">
                                <span className="Icon bankofamerica card"></span>
                                <span className="Icon chase card"></span>
                                <span className="Icon citi card"></span>
                                <span className="Icon wellsfargo card"></span>
                                <p className="note">&amp; 2,400+ others</p>
                            </div>
                        </div> */}
                    </div>
                    <div className="changePref">
                        <span>Want to change payment options on future invoices?</span>
                        <NavLink to="/app/setting/payments">Change your preferences</NavLink>
                    </div>
                </div>
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        selectedBusiness: state.businessReducer.selectedBusiness,
    }
}
  
export default connect(mapStateToProps, null)(MethodPopup)
