import React, { Component } from "react";
import { Table, Button } from "reactstrap";
import CenterSpinner from "../../../../../../global/CenterSpinner";
import { renderCardNumber } from '../../../../../../utils/GlobalFunctions';
import { PaymentMethodConfirmation } from "../../../../../../utils/PopupModal/DeleteModal";
import AddNewcardModal from "../../../../../../utils/PopupModal/AddNewCardModal";
import { StripeProvider, Elements } from "react-stripe-elements";
import { getStripeKey } from "../../../../../../utils/common";
import * as PaymentIcon from "../../../../../../global/PaymentIcon";
import { NoDataMessage } from "../../../../../../global/NoDataMessage";
import { Redirect } from "react-router-dom";
import Icon from '../../../../../../components/common/Icon';
import { handleAclPermissions } from '../../../../../../utils/GlobalFunctions'
import symbolsIcon from "../../../../../../assets/icons/product/symbols.svg";
export default class CustomerPayment extends Component {
  state = {
    openDelete: false,
    selectedCardNumber: "",
    selectedId: "",
    newCardModal: false,
    deleteBtn: false
  };
  openDeleteModal = (selectedId, selectedCardNumber, index) => {
    let a = {};
    a["modal_" + index] = true;

    this.setState({ openDelete: true, selectedCardNumber, selectedId, a });
  };

  deleteCard = () => {
    this.setState({ deleteBtn: true })
    this.props.deleteCard(this.state.selectedId);
  };

  toggleModal = e => {
    this.setState({
      openDelete: !this.state.openDelete
    });
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.deleteCardData !== nextProps.deleteCardData) {
      const { error, success, message } = nextProps.deleteCardData;
      if (success) {
        this.props.showSnackBar(message, false);
        this.props.fetchCards();
        this.setState({ deleteBtn: false })
        this.toggleModal();
      } else if (error) {
        this.setState({ deleteBtn: false })
        this.props.showSnackBar(message, true);
      }
    }
  }

  _handleToggleNewCard(e) {
    e.preventDefault();
    this.setState({ newCardModal: !this.state.newCardModal });
  }
  render() {
    const { id, cardsData, paymentSettings } = this.props;
    const { loading, success, data } = cardsData;
    const { openDelete, newCardModal } = this.state;
    const isViewer = handleAclPermissions(['Viewer'])
    if (!!paymentSettings) {
      return (
        <div>
          <div className="py-header--page">
            {/* {!isViewer && <div className="ms-auto pull-right">
              <Button
                  color="primary" 
                  onClick={this._handleToggleNewCard.bind(this)}
              >Add new card</Button>
            </div>} */}
            <div className="py-header--title">
              <h4 className="m-0">
                Saved payment methods
                {/* <small><a href="javascript: void(0)" className="Link__External fs-small">Learn more</a></small> */}
              </h4>
            </div>
          </div>
          <div className="paymentTable-customer mrT10">
            {
              (success && !!data ? data.length > 0 : !data) ? (
                <Table hover className="customerTable">
                  <thead className="py-table__header">
                    <tr className="py-table__row">
                      <th
                        className="py-table__cell"
                        style={{ borderTop: "none" }}
                      ></th>
                      <th className="py-table__cell" style={{ borderTop: "none" }}>
                        Card number
                    </th>
                      <th className="py-table__cell" style={{ borderTop: "none" }}>
                        Expiry
                    </th>
                      <th className="py-table__cell" style={{ borderTop: "none" }}>
                        Cardholder's name
                    </th>
                      <th
                        className="py-table__cell"
                        style={{ borderTop: "none", textAlign: "center" }}
                      >
                        Actions
                    </th>
                    </tr>
                  </thead>
                  {loading ? (
                    <tr>
                      <td colSpan={5}>
                        <CenterSpinner />
                      </td>
                    </tr>
                  ) : success ? (
                    <tbody className="relative" >
                      {data && data.length > 0 ? (
                        data.map((item, i) => {
                          return (
                            <tr className="py-table__row" key={i}>
                              <td className="py-table__cell">
                                <img
                                  style={{ width: "40px" }}
                                  src={
                                    process.env.REACT_APP_WEB_URL.includes("localhost")
                                      ? `${PaymentIcon[item.card.brand]}`
                                      : `${PaymentIcon[item.card.brand]}`
                                  }
                                />
                              </td>
                              <td className="py-table__cell">
                                <span>{renderCardNumber(item.card.last4, item.card.brand)}</span>
                              </td>
                              <td className="py-table__cell">
                                {`${item.card.exp_month}/${item.card.exp_year}`}
                              </td>
                              <td className="py-table__cell">
                                {item.billing_details.name}
                              </td>
                              <td className="py-table__cell__action">
                                <a
                                  className={`py-table__action py-table__action__danger Icon ${isViewer ? 'disabled' :''}`}
                                  onClick={!isViewer ? this.openDeleteModal.bind(
                                    this,
                                    item.id,
                                    item.card,
                                    i
                                  ) : ''}
                                >
                                  <Icon className="Icon" xlinkHref={`${symbolsIcon}#delete`} />
                                </a>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                          <tr className="no-hover vh-60">
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                          </tr>
                        )}
                    </tbody>
                  ) : null}
                </Table>
              ) : (
                  <NoDataMessage
                    secondryMessage=""
                    title="cards"
                    buttonTitle="card"
                    showHead={'added'}
                    btnText={"Add new"}
                    add={this._handleToggleNewCard.bind(this)}
                    filter={false}
                    showBtn={false}
                  />

                )
            }
            <PaymentMethodConfirmation
              openModal={openDelete}
              onConfirm={this.deleteCard.bind(this)}
              onClose={this.toggleModal.bind(this)}
              cardNumber={this.state.selectedCardNumber}
              showSnackBar={(message, error) =>
                this.props.showSnackBar(message, error)
              }
              btnLoad={this.state.deleteBtn}
            />
          </div>
          <StripeProvider apiKey={getStripeKey()}>
            <Elements>
              <AddNewcardModal
                openModal={newCardModal}
                onConfirm={this.deleteCard.bind(this)}
                onClose={() => this.setState({ newCardModal: false })}
                id={id}
                showSnackBar={(message, error) =>
                  this.props.showSnackBar(message, error)
                }
                fetchCards={() => this.props.fetchCards()}
              />
            </Elements>
          </StripeProvider>
        </div>
      );
    } else {
      return <CenterSpinner />
    }
  }
}
