import React, { Component } from 'react';
import {
  Button,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  ModalBody,
  ModalFooter,
  Spinner
} from 'reactstrap';
import { cloneDeep } from 'lodash';
import { renderCardNumber } from '../../../../../../utils/GlobalFunctions';
import { ShowPaymentIcons } from '../../../../../../global/ShowPaymentIcons';
import SavedCardInfo from '../../../../../../global/savedCardInfo';

export default class SavedCard extends Component {
  state = {
    selected: {
      selected_0: true,
      selectedId: null
    }
  }

  setSelectedCard = (i, id, e) => {
    this.setState({
      selected: { [`selected_${i}`]: true },
      selectedId: id
    })
  }
  _setAmount = e => {
    const { name, value } = e.target
    let paymentInput = cloneDeep(this.state.paymentInput)
    paymentInput[name] = parseFloat(value).toFixed(2)
    this.setState({
      paymentInput
    })
  }
  render() {
    const {
      openSaveCard,
      onClose,
      allCards,
      amount,
      handlePayment,
      setAmount,
      selectedId,
      handleSubmit,
      loading,
      currency,
      businessInfo,
    } = this.props
    const hideUseDifferentCard = {
          ecrypt: true
    }
    return (
      <Form
        onSubmit={e => {
          e.preventDefault()
          handleSubmit(
            this.state.selectedId ? this.state.selectedId : selectedId
          )
        }}
      >
        <ModalBody className="py-4 px-5">
          <SavedCardInfo />
          <FormGroup className="py-form-field box-symble-field">
            <Label>Amount:</Label>
            <div className="py-form-field__element">
              <InputGroup>
                <InputGroupText
                  className={`prependAddon-input-card`}
                // disabled={edit === true ? true : false}
                >{currency ? currency : '$'}</InputGroupText>
                {'   '}
                <Input
                  value={amount}
                  onChange={e => handlePayment(e)}
                  type="number"
                  name="amount"
                  step="any"
                  id="recAmoutn"
                  onBlur={e => setAmount(e)}
                  // disabled={edit === true ? true : false}
                  className={'flex-1'}
                />
                <label htmlFor="recAmoutn" className="edit-icon" ><i className="fa fa-pen" ></i></label>
              </InputGroup>
              {/* <small> {paymentInput.exchangeRate && paymentData.currency ? `${paymentData.currency.code} - ${paymentData.currency.name}` : ""}</small> */}
            </div>
          </FormGroup>
          <FormGroup className="py-form-field">
            <Label>Select a card on file:</Label>
            <div>
              <ul className="payment__cards__list">
                {allCards.length > 0 &&
                  allCards.map((item, i) => {
                    return (
                      <li
                        key={i}
                        onClick={this.setSelectedCard.bind(this, i, item.id)}
                        className={
                          this.state.selected[`selected_${i}`] === true
                            ? 'payment__cards__list__item is-selected'
                            : 'payment__cards__list__item'
                        }
                      >
                        <ShowPaymentIcons
                          icons={[item.card.brand]}
                          className="icon"
                        />
                        <span className="number">
                          {renderCardNumber(item.card.last4)}
                        </span>
                        <span className="date">{`${item.card.exp_month}/${item.card.exp_year}`}</span>
                        <span className="name">
                          {item.billing_details.name}
                        </span>
                        {this.state.selected[`selected_${i}`] === true}
                      </li>
                    )
                  })}
                {
                  hideUseDifferentCard[businessInfo?.provider] ? '' : <li
                    onClick={() => this.props.setDifferent()}
                    className="payment__cards__list__item linkable"
                  >
                    Use a Different Credit Card
                  </li>
                }
              </ul>
            </div>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
            <Button
                color="primary"
                outline
                onClick={() => onClose()}
            >Back</Button>
          <Button color="primary" className="btn-icon-space" disabled={loading}>{loading && <Spinner size="sm" color="light" />} Record payment <i className="fal fa-lock"></i></Button>
        </ModalFooter>
      </Form>
    )
  }
}
