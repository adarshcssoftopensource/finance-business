import React from 'react';
import { CardElement, Row, Col, CardNumberElement, CardExpiryElement, CardCVCElement, PaymentRequestButtonElement, IbanElement, IdealBankElement } from 'react-stripe-elements';
import { Button, FormGroup, Label, Input } from 'reactstrap';
import history from '../../../../../../customHistory';
import { connect } from 'react-redux';

class CardSection extends React.Component {
    constructor() {
        super()
        this.state = {
            isChanged:false,
            card_number: false,
            card_expiry: false,
            card_cvc: false,
            card_zip: false,
            customerName: false,
            card_number_changed: false,
            card_expiry_changed: false,
            card_cvc_changed: false,
            card_zip_changed: false,
            customerName_changed: false,
            card_error_msg: 'Enter the card number',
            isPreview:false
        }
    }

    componentDidMount(){
        if(history.location.pathname == '/app/sales/checkouts/preview'){
              this.setState({
                isPreview:true
              })
        }
    }

    componentDidUpdate(prevProps) {
        const { isChanged } = this.props

        if (prevProps.isChanged != isChanged) {
            this.setState({
                isChanged: true,
                card_number_changed: true,
                card_expiry_changed: true,
                card_cvc_changed: true,
                card_zip_changed: true,
                customerName_changed: true,
            })
        }
    }

    stripeElementChange = (element, name, type) => {
        let {isChanged} = this.state;
        if(isChanged == true && name == 'customerName' && element.target && element.target.value !== ''){
            this.setState({ [name]: true, [type]:true });
        } else if (!element.empty && element.complete) {
            this.setState({ [name]: true, [type]:true });
        } else {
            this.setState({ [name]: false, [type]:true  });
            if(name == 'card_number' && element.error && element.error.code == 'invalid_number'){
                this.setState({ card_error_msg: 'Enter a valid card number' });
            } else {
                this.setState({ card_error_msg: 'Enter the card number' });
            }
        }
        this.setState({ isChanged: true });

        let {card_number, card_expiry, card_cvc, card_zip, customerName} = this.state;
        this.props.validateElement({'card_number':   card_number, 'card_expiry': card_expiry, 'card_cvc': card_cvc, 'card_zip': card_zip, 'customerName':customerName});
    }

    render() {
        let stripeInput = {
            fontSize: '16px',
            color: this.props.themeMode === "dark-mode" ? '#8f9bb3' : '#1c252c',
            fontFamily: "Finance Grotesk, sans-serif",
            fontSmoothing: 'antialiased',

            '::placeholder': {
                color: this.props.themeMode === "dark-mode" ? '#8f9bb3' : 'rgba(40, 21, 64, 0.3)'
            }
        }

        var stripeStyle = {
            base: stripeInput
        }

        let {card_number, card_expiry, card_cvc, card_zip, customerName, isChanged, card_error_msg, isPreview,
            card_number_changed,card_expiry_changed,card_cvc_changed,customerName_changed, card_zip_changed} = this.state;
        let classess = (isChanged == true && (card_number == false || card_expiry == false || card_cvc == false || card_zip == false || customerName == false))? 'full-width stripe-has-error' : 'full-width';
        let customerNameClass = (isChanged == true && customerName == false)? 'pd0 card-75 radR0 StripeElement customStripeElement StripeElement--invalid' : 'pd0 card-75 radR0 StripeElement customStripeElement';
        return (
            <div className="full-width">
                <div className="py-form-field--condensed">
                    <div className="row mx-n2">
                        <div className="col-sm-9 px-2 pb-3">
                            <input style={stripeInput} type="text" placeholder="Cardholder's name" className={`my-0 form-control py-stripe__element ${!customerName && customerName_changed ? 'has-error' : ''}`} name="customerName" onChange={(e) => {this.props.handleText(e); this.stripeElementChange(e, 'customerName', 'customerName_changed') }} />
                            {
                                (!customerName && customerName_changed)? <span className="stripe-error">Enter the cardholder's name</span> :''
                            }
                        </div>
                        <div className="col-sm-3 px-2 pb-3">
                            <Input
                                autocomplete="nope"
                                type="zip"
                                name="card_zip"
                                placeholder="Postal code"
                                minLength={2}
                                maxLength={10}
                                className={`py-stripe__element ${!card_zip && card_zip_changed ? 'has-error' : ''}`}
                                onChange={(element) => this.stripeElementChange(element, 'card_zip', 'card_zip_changed')}
                            />
                            {
                                (!card_zip && card_zip_changed)? <span className="stripe-error">Enter the postal code</span> :''
                            }
                        </div>
                    </div>
                </div>
                <div className="row mx-n2">
                    <div className={`col-sm-6 px-2 pb-3 ${!card_number && card_number_changed ? 'stripe-has-error' : ''}`}>
                            <CardNumberElement style={stripeStyle} placeholder="Card number" className="py-stripe__element" name="card_number" onChange={(element) => this.stripeElementChange(element, 'card_number', 'card_number_changed')} />
                            {
                                (!card_number && card_number_changed)? <span className="stripe-error ">{card_error_msg}</span> :''
                            }
                    </div>
                    <div className={`col-sm-3 col-xs-6 px-2 pb-3 ${!card_expiry && card_expiry_changed ? 'stripe-has-error' : ''}`}>
                        <CardExpiryElement className="py-form__element__small" style={stripeStyle} name="card_expiry" className="py-stripe__element" onChange={(element) => this.stripeElementChange(element, 'card_expiry', 'card_expiry_changed')}/>
                        {
                            (!card_expiry && card_expiry_changed)? <span className="stripe-error">Enter the expiry date</span> :''
                        }
                    </div>
                    <div className={`col-sm-3 col-xs-6 px-2 pb-3 ${!card_cvc && card_cvc_changed ? 'stripe-has-error' : ''}`}>
                        <CardCVCElement className="py-form__element__small" className="py-stripe__element" style={stripeStyle} name="card_cvc" onChange={(element) => this.stripeElementChange(element, 'card_cvc', 'card_cvc_changed')}/>
                        {
                            (!card_cvc && card_cvc_changed)? <span className="stripe-error">Enter the security code</span> :''
                        }
                    </div>
                </div>
            </div>
        );
    }
}
  
  const mapStateToProps = state => {
    return { themeMode: state.themeReducer.themeMode }
  }
  
  export default connect(mapStateToProps, {})(CardSection);