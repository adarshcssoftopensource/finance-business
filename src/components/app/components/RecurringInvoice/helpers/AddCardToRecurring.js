import React, { Fragment } from 'react'
import { ShowPaymentIcons } from '../../../../../global/ShowPaymentIcons'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { addPaymentInRecurring } from '../../../../../api/RecurringService'
import StripePaymentForm from './providerForms/stripe'

class AddCardToRecurring extends React.Component {
  state = {
    cardHolderName: '',
  }

  setCardHolderName = cardHolderName => {
    this.setState({ cardHolderName })
  }

  _proceedToPay = async (cardData, turnOffLoading) => {
    const { invoiceId, refreshData } = this.props
    let input = {
      cardInput: {
        cardHolderName: this.state.cardHolderName,
        paymentMethodId: cardData
      }
    }
    try {
      const addCardResponse = await addPaymentInRecurring(invoiceId, input)
      if (addCardResponse.error) {
        this.props.showSnackBar(addCardResponse.message, true)
        turnOffLoading()
        refreshData()
      } else {
        this.props.showSnackBar(addCardResponse.message, false)
        turnOffLoading()
        this.props.fetchCards()
      }
    } catch (err) {
      this.props.showSnackBar(err.message, true)
      turnOffLoading()
    }
  }

  renderPaymentForm = () => {
    const { invoiceData } = this.props;
    const provider = invoiceData && invoiceData.providerData && invoiceData.providerData.providerName;
    switch (provider) {
      case 'stripe':
        return (
          <StripePaymentForm
            id={this.props.id}
            cardHolderName={this.state.cardHolderName}
            setCardHolderName={this.setCardHolderName}
            _proceedToPay={this._proceedToPay}
          />
        )
      default:
        return null
    }
  }

  render() {
    return (
      <Fragment>
        <div className="automatic_payment_icons">
          <ShowPaymentIcons
            className="credit-card-icons big-payment-icons"
            icons={['visa', 'master', 'amex', 'discover']}
          />
          <small style={{ margin: '0 24px' }}>Credit &amp; Debit</small>
        </div>
        <div className="row align-items-center">
          {this.renderPaymentForm()}
        </div>
      </Fragment>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addCard: (id, data) => {
      dispatch(addPaymentInInvoice(id, data))
    }
  }
}
export default withRouter(
  connect(null, mapDispatchToProps)(AddCardToRecurring)
)
