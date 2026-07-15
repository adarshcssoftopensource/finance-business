import React, { Fragment } from 'react'
import PlaidLinkTokenButton from '../../../../../../global/PlaidWrapper/PlaidLinkTokenButton'
import { connect } from 'react-redux'
import { Col, Spinner, Button } from 'reactstrap'
import { getBankAccounts } from '../../../../../../actions/invoiceActions'
import paymentService from '../../../../../../api/paymentService'
import CenterSpinner from '../../../../../../global/CenterSpinner'
import { toMoney } from '../../../../../../utils/GlobalFunctions'
import { _institutionLists, PoweredByBank } from '../../helpers'
import BankAccounts from './BankAccounts'

// import { PoweredBy } from "../../../../common/PoweredBy";

// let time = ''
class BankPayoutForm extends React.Component {
  state = {
    paidAmount: null,
    loading: false,
    showAccounts: false,
    accounts: null,
    logo: null,
    publicToken: null,
    metadata: null,
    selectedBank: null,
    payLoading: false
  }

  componentDidMount() {
    const { invoiceData } = this.props
    this.setState({ paidAmount: toMoney(invoiceData.dueAmount, false) })
  }
  handleOnSuccess = async (token, metadata) => {
    let data = {
      accountInput: {
        publicToken: metadata.public_token,
        institutionId: metadata.institution.institution_id
      }
    }
    if (!!token) {
      try {
        await this.props.getBankAccounts(data)
        this.setState({ publicToken: token, metadata })
      } catch (err) {
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.bankAccounts !== nextProps.bankAccounts) {
      const { bankAccounts } = nextProps
      if (!!bankAccounts) {
        const { success, error, data } = bankAccounts
        if (success) {
          this.setState({
            accounts: data.accounts,
            showAccounts: true,
            logo: data.institution.logo,
            selectedBank: data.accounts[0].account_id
          })
        } else {
        }
      }
    }
  }

  proceedToPay = (token, metaData) => {
    const { invoiceData } = this.props
    this.setState({ payLoading: true })
    const { paidAmount, signature, selectedBank } = this.state
    let paymentBody = {
      paymentInput: {
        uuid: invoiceData.uuid,
        method: 'bank',
        amount: paidAmount ? paidAmount : invoiceData.dueAmount,
        plaidToken: token,
        accountId: selectedBank,
        rawLinkResponse: JSON.stringify(metaData),
        signature: signature
      }
    }
    this.paymentCallback(paymentBody)
  }

  paymentCallback = async _checkoutPayment => {
    try {
      const { invoiceData } = this.props
      const response = await paymentService.chargeEmailService(_checkoutPayment)
      if (response.statusCode === 200) {
        const payload = {
          status: 'SUCCESS',
          paymentMethodId: null,
          invoiceId: invoiceData.uuid,
          amount: _checkoutPayment.paymentInput.amount
        }
        let res = null;
        let time = setInterval(async () => {
          res = await paymentService.updatePaymentStatusPid(
            response.data.paymentResponse.paymentIntentId
          )
          if (!!res && res.data && res.data.status !== 'PENDING') {
            response.data.paymentResponse.status = res.data.status
            clearInterval(time)
            this.props.refreshData()
            this.props.openAlert(response.data.paymentResponse, 0)
          }
        }, 5000)
        // await paymentService.updatePaymentStatus(
        //   payload,
        //   response.data.paymentResponse.id
        // )
        this.setState({ successPaid: true, payLoading: false })
        this.props.refreshData()
        this.props.openAlert(response.data.paymentResponse)
      } else {
        this.setState({ payLoading: false })
        this.props.showSnackbar(response.message, true)
      }
    } catch (error) {
      this.setState({ payLoading: false })
      this.props.showSnackbar(error.message, true)
    }
  }

  // componentWillUnmount(){
  //   if(!!time){
  //     clearTimeout(time)
  //   }
  // }

  handleChange = e => {
    const { name, value } = e.target
    this.setState({
      [name]: value
    })
  }

  handleAccount = item => {
    let { metadata } = this.state
    metadata.account_id = item.id
    this.setState({ metadata, selectedBank: item.id })
  }

  render() {
    const { invoiceData, bankAccounts } = this.props
    const {
      accounts,
      showAccounts,
      payLoading,
      logo,
      paidAmount,
      publicToken,
      metadata,
      selectedBank,
      signature
    } = this.state
    return (
      <div className="py-box py-box--large m-0 no-border" >
        {this.state.loading ? (
          <div className="spinner-wrapper">
            <Spinner />
          </div>
        ) : (
            <Fragment>
              {bankAccounts.loading ? (
                <CenterSpinner />
              ) : showAccounts ? (
                <BankAccounts
                  accounts={accounts}
                  invoiceData={invoiceData}
                  handleOnSuccess={this.handleOnSuccess.bind(this)}
                  logo={logo}
                  paidAmount={paidAmount}
                  handleChange={this.handleChange.bind(this)}
                  setAmount={e =>
                    this.setState({
                      paidAmount: !!e.target.value ? parseFloat(e.target.value).toFixed(2) : toMoney(invoiceData.dueAmount, false)
                    })
                  }
                  proceedToPay={this.proceedToPay.bind(this)}
                  token={publicToken}
                  metadata={metadata}
                  handleAccount={this.handleAccount.bind(this)}
                  selectedBank={selectedBank}
                  signature={signature}
                  loading={payLoading}
                  orgName={
                    invoiceData &&
                    invoiceData.businessId &&
                    invoiceData.businessId.organizationName
                  }
                />
              ) : (
                    <div className="bankPayment-container">
                      <p className={"mt-0 mb-3 py-text text-center"}><strong>Select a bank by clicking "Pay using your bank"</strong></p>
                      <PlaidLinkTokenButton
                        api="onboarding"
                        asWrapper
                        onExit={this.handleOnExit}
                        onSuccess={this.handleOnSuccess}
                        className="plaid"
                        style={{ display: 'inline-block', width: '100%' }}
                      >
                        <Fragment>
                          {/* <div className="py-bank-list row">
                      {_institutionLists.map((item, i) => {
                        return (
                          <Col
                            sm={3}
                            key={i}
                            className="py-bank-list__item-wrapper"
                          >
                            <div className="institution-list__display">
                              <div className="intitution-list__item">
                                <img src={item.img} alt={item.name} />
                                <span>{item.name}</span>
                              </div>
                            </div>
                          </Col>
                        )
                      })}
                    </div> */}
                          <div className="text-center">
                            <Button color="primary">{'Pay ' + invoiceData.currency.symbol + toMoney(invoiceData.dueAmount) + ' using your bank'}</Button>
                          </div>
                        </Fragment>
                      </PlaidLinkTokenButton>
                    </div>
                  )}
            </Fragment>
          )}
        {/* <PoweredByBank /> */}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  bankAccounts: state.getAllBankAccounts
})
export default connect(mapStateToProps, { getBankAccounts })(BankPayoutForm)
