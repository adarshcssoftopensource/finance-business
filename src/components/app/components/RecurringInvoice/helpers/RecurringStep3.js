import React, { Fragment, PureComponent } from 'react'
import { Button, Spinner } from 'reactstrap'
import AutomaticPayments from './paymentModes/AutomaticPayments'
import ManualPayments from './paymentModes/ManualPayments'
import {
  openGlobalSnackbar,
  updateData
} from '../../../../../actions/snackBarAction';
import { connect } from 'react-redux'
import {
  getInvoicePaymentMethods,
  updatePaymentMethod
} from '../../../../../api/RecurringService';
import Icon from '../../../../common/Icon';
import {getRecurringCards} from "../../../../../actions/recurringInvoiceActions";
import symbolsIcon from "../../../../../assets/icons/product/symbols.svg";


class RecurrintStep3 extends PureComponent {
  state = {
    showManual: true,
    payManual: false,
    showEnterCard: false,
    allCards: [],
  }
  async componentDidMount() {
    const { invoiceData, paymentModeSetting, paymentSettings: { data } } = this.props
    const invoiceId = invoiceData && invoiceData._id
    let IsPaymentOnboardingDone = invoiceData && invoiceData.isManual ? invoiceData.isManual : false
    let invoiceCurrencyCode = invoiceData.currency && invoiceData.currency.code;
    let invoiceCurrencyCodeFromBusiness = invoiceData.businessId && invoiceData.businessId.currency && invoiceData.businessId.currency.code;

    if (invoiceData && !invoiceData.paid.isPaid && data.isSetupDone && data.isVerified.payment && invoiceCurrencyCode === invoiceCurrencyCodeFromBusiness){
      IsPaymentOnboardingDone=false
    } else if (!data.isSetupDone || !data.isVerified.payment || invoiceCurrencyCode !== invoiceCurrencyCodeFromBusiness){
      IsPaymentOnboardingDone = true
    }
    
    this.setState({ showManual: IsPaymentOnboardingDone})
    if (invoiceId) {
      const cardsData = await getInvoicePaymentMethods(invoiceId)
      if (cardsData.error) {
        this.props.showSnackBar(cardsData.message, true)
      }
      const isBusinessEnabled = invoiceData.onlinePayments && invoiceData.onlinePayments.businessEnabled
      this.setState({
        allCards: [cardsData.data],
        showEnterCard: !invoiceData.paymentModeSetting.preAuthorized,
        payManual: invoiceData.paymentModeSetting.allowOnline && isBusinessEnabled
      })
    }
  }
  componentDidUpdate(prevProps) {
    const { invoiceData, paymentSettings: { data } } = this.props
    const isBusinessEnabled = invoiceData.onlinePayments && invoiceData.onlinePayments.businessEnabled
    if (prevProps.editMode !== this.props.editMode) {
      this.setState({
        payManual: this.props.invoiceData.paymentModeSetting.allowOnline && isBusinessEnabled
      })
    }
  }

  switchToManual = () => {
    this.setState({
      showManual: !this.state.showManual,
      showEnterCard: false
    })
  }

  isPayManual = () => {
    this.setState({
      payManual: !this.state.payManual
    })
  }

  fetchCards = async () => {
    const { invoiceData } = this.props
    const invoiceId = invoiceData && invoiceData._id
    const cardsData = await getInvoicePaymentMethods(invoiceId)
    this.setState({
      allCards: [cardsData.data],
      showEnterCard: true
    })
  }

  switchToEnterCard = async (e) => {
    const updates = {
      ...this.props.invoiceData.paymentModeSetting,
      preAuthorized: !this.props.invoiceData.paymentModeSetting.preAuthorized
    }
    await this.props.updatePaymentModeSettings(updates)
    this.setState({
      showEnterCard: !!updates.preAuthorized ? false : true,
    })
  }
  updatePayment = async () => {
    const { invoiceData, handleEditMode, paymentSettings: { data } } = this.props
    const { showManual, payManual } = this.state
    let paymentModeSetting = {
      ...invoiceData.paymentModeSetting,
      allowOnline: payManual
    }
    if (invoiceData.currency.code !== invoiceData.businessId.currency.code || !data.isConnected) {
      paymentModeSetting = {
        ...invoiceData.paymentModeSetting,
        allowOnline: false,
        preAuthorized: false
      }
    }
    const payload = {
      isManual: showManual,
      paymentModeSetting,
      paid: {
        ...invoiceData.paid,
        isPaid: true
      }
    }

    try {
      this.setState({ load: true })
      const updatedInvoice = await updatePaymentMethod(invoiceData._id, payload)
      if (updatedInvoice.error) {
        this.setState({ load: false })
        throw Error(updatedInvoice.message)
      }
      handleEditMode('step3')
      this.props.showSnackbar(updatedInvoice.message, false)
      this.setState({ load: false })
      this.props.refreshData()
    } catch (error) {
      this.setState({ load: false })
      this.props.showSnackbar(error.message, true)
    }
  }
  render() {
    const { handleGetPaid, invoiceData, editMode, onboardingRules, handleEditMode, isViwer, paymentSettings: { loading, data } } = this.props
    const { showManual, payManual, showEnterCard, allCards, load } = this.state
    const isBusinessEnabled = invoiceData.onlinePayments && invoiceData.onlinePayments.businessEnabled
    return (
      <div className={!invoiceData.recurrence.isSchedule ? "py-box py-box--large disabled" : `py-box py-box--large ${editMode || !invoiceData.paid.isPaid ? "is-highlighted" : ""}`}>
        <div className="invoice-steps-card__options">
          <div className="invoice-step-Collapsible__header-content recurring-invoice-Collapsible__header-content">
            <div className="step-indicate">
              {invoiceData.paid.isPaid ? (
                <div className="step-icon step-done card-icon">
                  <Icon
                    className="Icon"
                    xlinkHref={`${symbolsIcon}#creditcard`}
                  />
                </div>
              ) : (
                  <div className="step-icon card-icon">
                    <Icon
                      className="Icon"
                      xlinkHref={`${symbolsIcon}#creditcard`}
                    />
                  </div>
                )}
            </div>
            <div className="py-heading--subtitle">Get Paid </div>

            {!isViwer && invoiceData.recurrence.isSchedule && (invoiceData.status == 'active' || invoiceData.status == 'draft') && (
              <div className="step-btn-box">

                {editMode || !invoiceData.paid.isPaid ? (
                  <Fragment>
                    {
                      !!invoiceData.paid.isPaid && (
                        <Button
                          onClick={e => handleEditMode('step3')}
                          className="me-2"
                          color="primary" outline
                          disabled={!invoiceData.paid.isPaid || invoiceData.currency.code != invoiceData.businessId.currency.code}
                        >
                          Cancel
                        </Button>
                      )
                    }
                    {/* <Button
                      onClick={
                        showManual
                          ? this.switchToManual
                          : this.switchToEnterCard.bind(this)
                      }
                      className="me-2"
                      color="primary"
                      outline
                      disabled={!!loading || invoiceData.currency.code != invoiceData.businessId.currency.code || !data.isSetupDone || !data.isVerified.payment}
                    >
                      {showManual
                        ? 'Switch to automatic payments'
                        : !!invoiceData.paymentModeSetting.preAuthorized && onboardingRules?.isRecurringPaymentEnabled ? 'Enter card details' : 'Request credit card'}
                    </Button> */}
                    <Button
                      color="primary"
                      onClick={this.updatePayment}
                      disabled={load || showEnterCard && !allCards[0]}
                    >
                      {load ? <Spinner size="sm" color="default" /> : 'Save'}
                    </Button>
                  </Fragment>
                ) : (
                    <Fragment>
                      <Button
                        onClick={e =>
                          editMode && !invoiceData.paid.isPaid
                            ? handleGetPaid('step3')
                            : handleEditMode('step3')
                        }
                        // disabled={!invoiceData.sendMail.isSent}
                        color="primary"
                        outline={invoiceData.paid.isPaid}
                      >
                        {editMode && !invoiceData.paid.isPaid ? 'Next' : 'Edit'}
                      </Button>
                    </Fragment>
                  )}
              </div>
            )}
          </div>
        </div>

        {invoiceData.recurrence.isSchedule ? editMode || !invoiceData.paid.isPaid ? (
          <Fragment>
            {!showManual && onboardingRules?.isRecurringPaymentEnabled ? (
              <AutomaticPayments
                currencyCode={invoiceData.currency.code}
                switchToManual={this.switchToManual}
                showEnterCard={showEnterCard}
                invoiceId={invoiceData && invoiceData._id}
                cardsData={allCards}
                showSnackBar={(message, error) =>
                  this.props.showSnackbar(message, error)
                }
                refreshData={() => this.props.refreshData()}
                fetchCards={this.fetchCards}
                customerId={
                  invoiceData &&
                  invoiceData.customer &&
                  invoiceData.customer._id
                }
                invoiceData={invoiceData}
              />
            ) : (
                <ManualPayments
                  invoiceData={invoiceData}
                  currencyCode={invoiceData.currency.code}
                  payManual={payManual}
                  isBusinessEnabled={isBusinessEnabled}
                  isPayManual={this.isPayManual}
                  showSnackBar={(message, error) =>
                    this.props.showSnackbar(message, error)
                  }
                  isKycIssue={!!loading || !loading && !!data && !!data.isKycIssue}
                />
            )}
          </Fragment>
        ) : showManual ? (
          <div className="invoice-steps-card__content mt-3 ms-4 me-2 ps-5">
            <div className="pz-text-strong">
              <span>
                <strong className="py-text--strong">Manual payments:&nbsp;</strong>
              </span>
              <span>
                Your customer will manually pay each recurring invoice.
              </span>
            </div>
            <div className="pz-text-strong">
              <span>
                <strong className="py-text--strong">Online Payments:&nbsp;</strong>
              </span>
              <span>
                {invoiceData.paymentModeSetting.allowOnline ? "Enabled" : 'Disabled'}
              </span>
            </div>
          </div>
        )
            : (
              <div className="invoice-steps-card__content mt-3 ms-4 me-2 ps-5">
                <div className="pz-text-strong">
                  <span className="py-text py-text--body">
                    <strong className="py-text--strong">Automatic payments:&nbsp;</strong>{!allCards[0] && `Credit/Debit card pre-authorization will be requested on the invoice. `}
                    Finance will automatically charge your customer's credit card.
              </span>
                </div>
              </div>
            ) : ''}
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    showSnackbar: (message, error) => {
      dispatch(openGlobalSnackbar(message, error))
    },
    refreshData: () => {
      dispatch(updateData())
    },
    fetchAllCustomerCards: id => {
      dispatch(getRecurringCards(id))
    }
  }
}

const mapStateToProps = state => {
  return {
    allCards: state.getAllCards,
    paymentSettings: state.paymentSettings,
    onboardingRules: state.businessReducer?.onboardingRules
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RecurrintStep3)
