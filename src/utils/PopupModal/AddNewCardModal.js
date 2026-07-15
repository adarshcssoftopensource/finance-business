import React from "react";
import { Modal, ModalBody, ModalHeader, Col, Spinner, Button, Input } from "reactstrap";
import { ShowPaymentIcons } from "../../global/ShowPaymentIcons";
import {
  injectStripe,
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
} from "react-stripe-elements";
// import { stripeStyle } from "global/commonStyles";
import { initiateCard, addCard } from "../../api/CardsService";
import { checkEmptyCardForm } from "../GlobalFunctions";
import { connect } from "react-redux";

class AddNewcardModal extends React.Component {
  state = {
    loading: false,
    cardHolderName: "",
    isSubmitDisabled: true,
    postalCode:"",
    emptyError: {
      cardNumber: true,
      cardExpiry: true,
      cardCvc: true,
      postalCode: true,
      cardHolderNameEmpty: true
    }
  };
  componentDidMount() {
    const isSubmitDisabled = checkEmptyCardForm(this.state.emptyError);
    this.setState({ isSubmitDisabled });
  }

  onChange = e => {
    const { emptyError } = this.state;
    emptyError[e.elementType] = e.empty;
    const isSubmitDisabled = checkEmptyCardForm(emptyError);
    this.setState({ emptyError, isSubmitDisabled });
  };

  _handleSubmit = async ev => {
    ev.preventDefault();
    const { id } = this.props
    const { cardHolderName, emptyError, postalCode } = this.state;
    const isSubmitDisabled = checkEmptyCardForm(emptyError);
    this.setState({ loading: true, isSubmitDisabled });
    let cardInfo = {};
    cardInfo.isSaveCard = { allowed: this.state.saveCard };
    try {
      const stripeClientSecret = await initiateCard(id);
      if (stripeClientSecret.error) {
        throw Error("Card is invalid")
      }
      this.props.stripe.createToken().then(async res => {
        const { token } = res;
        try {
          this.props.stripe
            .confirmCardSetup(stripeClientSecret.data.initiateResponse.clientSecret, {
              payment_method: {
                metadata: {
                  "user_id": id
                },
                billing_details: {
                  name: cardHolderName,
                  address: { postal_code: postalCode }
                },
                card: {
                  token: token.id
                }
              }
            })
            .then(response => {
              if (typeof response.error === "object") {
                if (response.error.hasOwnProperty("message")) {
                  this.props.showSnackBar(response.error.message, true);
                  this.setState({ loading: false });
                }
              } else {
                this._proceedToPay(response.setupIntent.payment_method);
              }
            })
            .catch(err => {
              this.props.showSnackBar(err.message, true);
              this.setState({ loading: false });
            });
          // ("cardCvc");
        } catch (err) {
          this.setState({ loading: false });
          this.props.showSnackBar(err.message, true);
        }
      }).catch = err => {
        this.setState({ loading: false });
        this.props.showSnackBar(err.message, true);
      };
    } catch (err) {
      this.setState({ loading: false });
      this.props.showSnackBar(err.message, true);
    }
  };

  _proceedToPay = async cardData => {
    const { id } = this.props;
    let input = {
      cardInput: {
        cardHolderName: this.state.cardHolderName,
        paymentMethodId: cardData
      }
    };
    try {
      const addCardResponse = await addCard(id, input);
      if (addCardResponse.error) {
        this.props.showSnackBar(addCardResponse.message, true);
        this.setState({ loading: false });
      } else {
        this.props.showSnackBar(addCardResponse.message, false);
        this.setState({ loading: false });
        this.props.onClose();
        this.props.fetchCards();
      }
    } catch (err) {
      this.props.showSnackBar(err.message, true);
      this.setState({ loading: false });
    }
  };

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
    const { openModal, onClose } = this.props;
    return (
      <Modal
        isOpen={openModal}
        toggle={onClose}
        className="modal-add modal-confirm modal-medium"
        centered
      >
        <ModalHeader toggle={onClose}>Add New Card</ModalHeader>
        <ModalBody className="new_card_modal">
          <div className="text-center mrB40" >
            <ShowPaymentIcons
              className="credit-card-icons big-payment-icons"
              icons={["visa", "master", "amex", "discover"]}
            />
            <small style={{ margin: "0 24px" }}>Credit &amp; Debit</small>
          </div>
          <form onSubmit={this._handleSubmit.bind(this)}>
            <div className="row mx-n2">
              <Col className="px-2" xs={9}>
                <CardNumberElement
                  id="PaymentCard__Number"
                  style={stripeStyle}
                  onChange={this.onChange}
                  className="py-stripe__element form-control m-0"
                  placeholder="Card number"
                />
              </Col>
              <Col className="px-2" xs={3}>
                <Input
                    autocomplete="nope"
                    type="zip"
                    name="postalCode"
                    placeholder="ZIP/Postal"
                    minLength={2}
                    maxLength={10}
                    className="py-stripe__element form-control my-0"
                    onChange={({ target: { value } }) => {
                      let isSubmitDisabled = checkEmptyCardForm(
                          this.state.emptyError
                      );
                      if (value == "") {
                        isSubmitDisabled = true
                      }
                      this.setState({
                        postalCode: value,
                        emptyError: {
                          ...this.state.emptyError,
                          postalCode: false
                        },
                        isSubmitDisabled
                      });
                    }}
                />
              </Col>
              <Col className="px-2 mt-2 col-3" xs={6} >
                <input
                  type="text"
                  className="py-stripe__element form-control m-0 mt-1"
                  placeholder="Cardholder's name"
                  onChange={({ target: { value } }) => {
                    let isSubmitDisabled = checkEmptyCardForm(
                      this.state.emptyError
                    );
                    if (value == "") {
                      isSubmitDisabled = true
                    }
                    this.setState({
                      cardHolderName: value,
                      emptyError: {
                        ...this.state.emptyError,
                        cardHolderNameEmpty: false
                      },
                      isSubmitDisabled
                    });
                  }}
                />
              </Col>
              <Col className="px-2 mt-2" xs={3}>
                <CardExpiryElement
                  style={stripeStyle}
                  className="py-stripe__element form-control m-0 mt-1"
                  onChange={this.onChange}
                  id="PaymentCard__ExpireDate"
                  placeholder="MM/YY"
                />
              </Col>
              <Col className="px-2 mt-2" xs={3}>
                <CardCVCElement
                  style={stripeStyle}
                  onChange={this.onChange}
                  className="py-stripe__element form-control m-0 mt-1"
                  id="PaymentCard__CVV"
                  placeholder="CVV"
                />
              </Col>              
              <Col className="px-2 mrT20" xs={12}>
                <Button
                    type="submit"
                    className="full-width"
                    color="primary"
                    disabled={this.state.loading || this.state.isSubmitDisabled}
                >
                  {this.state.loading && <Spinner size="sm" color="light" />}
                  &nbsp;
                  <i className="fal fa-lock" /> Save Card
                </Button>
              </Col>
            </div>
          </form>
        </ModalBody>
      </Modal>
    );
  }
}

const mapStateToProps = state => {
  return { themeMode: state.themeReducer.themeMode }
}

export default injectStripe(connect(mapStateToProps, {})(AddNewcardModal));
