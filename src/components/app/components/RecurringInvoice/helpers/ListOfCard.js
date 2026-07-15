import React, { Component } from 'react'
import { Form, FormGroup } from 'reactstrap'
import {
  _paymentMethodIcons,
  renderCardNumber
} from '../../../../../utils/GlobalFunctions'
import { ShowPaymentIcons } from '../../../../../global/ShowPaymentIcons'

class ListOfCard extends Component {
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

  render() {
    const { allCards } = this.props
    return (
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
                        {renderCardNumber(item.card.cardNumber)}
                      </span>
                      <span className="date">{`${item.card.expiryMonth <= 9 ? `0${item.card.expiryMonth}` : item.card.expiryMonth}/${item.card.expiryYear}`}</span>
                      <span className="name">{item.card.cardHolderName}</span>
                      {this.state.selected[`selected_${i}`] === true}
                    </li>
                  )
                })}
            </ul>
          </div>

    )
  }
}

export default ListOfCard
