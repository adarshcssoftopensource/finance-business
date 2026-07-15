import React from 'react';
import { connect } from 'react-redux';
import { CardElement, Row, Col, CardNumberElement, CardExpiryElement, CardCVCElement, PaymentRequestButtonElement, IbanElement, IdealBankElement } from 'react-stripe-elements';
import { InputGroup,
    InputGroupText,
    FormGroup, Input } from 'reactstrap';
import {checkEmptyCardForm} from "../../../../../../utils/GlobalFunctions";
// import { stripeStyle } from '../../../../../../global/commonStyles';

class InvoiceCardSection extends React.Component {
    componentDidMount() {
        let cssLink = document.createElement('link');
        cssLink.href = './card.css';
        cssLink.rel = "stylesheet";
        cssLink.type = "text/css";
        let frame5 = document.getElementsByName('__privateStripeFrame5');
    }
    render() {
        let stripeStyle = {
            base: {
                fontSize: '16px',
                color: this.props.themeMode === "dark-mode" ? '#9ea7b9' : '#41494f',
                fontFamily: "'Finance Grotesk', sans-serif",
                fontSmoothing: 'antialiased',

                '::placeholder': {
                    color: this.props.themeMode === "dark-mode" ? '#9ea7b9' : 'rgba(40, 21, 64, 0.3)',
                }
            }
        }
        const { onChange, recurring } = this.props
        return (
            <div className="full-width payment-view">
                <div className="row mx-n2">
                    <div className="col-sm-9 px-2 pb-3">
                        <input type="text" placeholder="Cardholder’s name" id="PaymentCard__Name" className="form-control my-0" name="firstName" onChange={(e) => this.props._handleCardHolder(e)} />
                    </div>
                    <div className="col-sm-3 px-2 pb-3">
                        <Input
                            autocomplete="nope"
                            type="zip"
                            name="postalCode"
                            placeholder="ZIP/Postal"
                            minLength={2}
                            maxLength={10}
                            className="py-stripe__element form-control my-0"
                            onChange={(e) => this.props._handleCardHolder(e)}
                        />
                    </div>
                </div>
                <div className="row mx-n2">
                    <div className="col-sm-6 px-2 pb-3">
                        <div className="payment-view__card-number">
                            <CardNumberElement id="PaymentCard__Number" style={stripeStyle} className="py-stripe__element" placeholder="Card number" onChange={onChange} />
                        </div>
                    </div>
                    <div className="col-sm-3 col-xs-6 px-2 pb-3">
                        <div className="payment-view__expire-date">
                            <CardExpiryElement style={stripeStyle} className="py-stripe__element" id="PaymentCard__ExpireDate" placeholder="MM/YY" onChange={onChange} />
                        </div>
                    </div>
                    <div className="col-sm-3 col-xs-6 px-2 pb-3">
                        <div className="payment-view__cvc">
                            <CardCVCElement style={stripeStyle} className="py-stripe__element" id="PaymentCard__CVV" onChange={onChange} />
                        </div>
                    </div>
                </div>
                {
                    !!recurring ? '' : (
                        <div className="row mx-n2">
                            <div className="col-sm-12 px-2 pb-3">
                              <FormGroup className="py-form-field box-symble-field">
                                <div className="py-form-field__element">
                                  <InputGroup>
                                    <InputGroupText className="prependAddon-input-card no-border">{this.props.sign}</InputGroupText>
                                    <input
                                        type="text"
                                        step="any"
                                        value={this.props.amount}
                                        onChange={e => this.props._handleAmountChange(e)}
                                        name="dueAmount"
                                        id="recAmoutn3"
                                        onBlur={(e) => this.props._setAmount(e)}
                                        className="form-control"
                                    />
                                    <label htmlFor="recAmoutn3" className="edit-icon" ><i className="fa fa-pen" ></i></label>
                                  </InputGroup>
                                </div>
                              </FormGroup>                        
                            </div>
                        </div>
                    )
                }
                {/* <CardElement style={{
                        base: {
                            fontSize: '18px'
                        }
                    }} className="card-element" /> */}
            </div>
        );
    }
}

const mapStateToProps = state => {
    return { themeMode: state.themeReducer.themeMode }
}

export default connect(mapStateToProps, {})(InvoiceCardSection);