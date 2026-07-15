import React, { Component, Fragment } from 'react'
import { Button, Popover, PopoverBody, PopoverHeader } from 'reactstrap';
import MethodPopup from './MethodPopup';
import PaymentPopover from './PaymentPopover';
export default class Index extends Component {
    state = {
        popoverOpen: false
    }

    toggle = () => {
        this.setState({ popoverOpen: !this.state.popoverOpen })
    }
    render() {

        const { status, invoiceData, offScreen, creditCardDisabled, bankModeDisabled } = this.props

        return (
            <Fragment>
                <Button id="onlinePayment" color="primary" outline>
                    Online Payments <span className={`status-${status ? 'ON' : 'OFF'}`}><div className={`devider-circle ${status ? 'ON' : 'OFF'}`}></div><strong>{status ? 'ON' : 'OFF'}</strong></span>
                </Button>
                <Popover
                    placement="bottom"
                    isOpen={this.state.popoverOpen}
                    target="onlinePayment"
                    toggle={this.toggle}
                    className="py-popover__panel"
                >
                    <PopoverBody>
                        {
                            offScreen ? (
                                <MethodPopup
                                    toggle={this.toggle}
                                    handleChange={(e) => this.props.handleChangeMode(e)}
                                    modeCard={invoiceData && invoiceData.modeCard}
                                    modeBank={invoiceData && invoiceData.modeBank}
                                    creditCardDisabled={creditCardDisabled}
                                    bankModeDisabled={bankModeDisabled}
                                    handlePaymentButtons={this.props.handlePaymentButtons}
                                    paymentButtons={this.props.paymentButtons}
                                    modePayByBank={invoiceData.modePayByBank}
                                />
                            ) : (
                                <PaymentPopover
                                    toggle={this.toggle}
                                    handleChange={(e) => this.props.handleChangeMode(e)}
                                    modeCard={invoiceData && invoiceData.modeCard}
                                    modeBank={invoiceData && invoiceData.modeBank}
                                    invoiceData={invoiceData}
                                />
                            )
                        }
                    </PopoverBody>
                </Popover>
            </Fragment>
        )
    }
}
