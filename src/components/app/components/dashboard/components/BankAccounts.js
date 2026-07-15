import React, { Component, Fragment } from 'react'
import TimeAgo from 'react-timeago'
import { Button, Spinner } from 'reactstrap'
import {
  fetchBankAccounts,
  fetchBankAccountsById
} from '../../../../../api/DashboardService'
import { getAmountToDisplay } from '../../../../../utils/GlobalFunctions';
import { NavLink } from 'react-router-dom'
import { openBlocks } from '../../../../../global/Sidebar'
import NoBankAcocunts from './NoBankAcocunts'
import PlaidLinkTokenButton from '../../../../../global/PlaidWrapper/PlaidLinkTokenButton';
import { saveBank } from '../../../../../api/bankingServices';
import CenterSpinner from '../../../../../global/CenterSpinner';

function TimeIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="Icon"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(1 1)">
        <path
          d="M9 18A9 9 0 1 1 9 0a9 9 0 0 1 0 18zm0-2A7 7 0 1 0 9 2a7 7 0 0 0 0 14zm3.215-4.616a1.023 1.023 0 1 1-1.52 1.368L8.24 10.025a1.023 1.023 0 0 1-.263-.684V3.886a1.023 1.023 0 1 1 2.046 0v5.062l2.192 2.436z"
          id="dca"
        />
      </g>
    </svg>
  )
}

function Amount({ currency = {}, amount }) {
  return (
    <Fragment>
      {currency.code} {getAmountToDisplay(currency, amount)}
    </Fragment>
  )
}

function Account({ name, currency, balance, error }) {
  return (
    <div className={error ? 'account-container-error' : 'account-container'}>
      <span className="account--name">{name}</span>
      <span className="account--balance">
        <Amount currency={currency} amount={balance} />
      </span>
    </div>
  )
}

const Bank = ({
  institute,
  _id,
  index,
  lastSyncedAt,
  accounts,
  fetchBanks,
  bankError,
  uLoading
}) => {


  return (
    <div className="bank-container">
      <h4 className="bank--name">
        <img
          className="bank--logo"
          src={`data:image/jpg;base64, ${institute.logo}`}
        />
        {institute.name}
      </h4>
      <div className="last-updated-container">
        <div style={{ display: 'block' }}>
          <TimeIcon />
          &nbsp;Last updated &nbsp;
          <TimeAgo date={lastSyncedAt} className="bank--last-updated"
            formatter={(value, unit, suffix) => {
              if (unit === "second") {
                return "just now";
              } else {
                return value + " " + unit + (value > 1 ? "s" : "") + " " + suffix;
              }
            }} />
          &nbsp;
          {uLoading ? <Spinner size={'sm'} color="default" style={{ height: '20px', width: '20px', minHeight: '20px', minWidth: '20px', borderWidth: '2px' }} /> : <a href="javascript:void(0)" onClick={() => fetchBanks(_id, index)}>
            Update Now
          </a>}
        </div>
      </div>
      {bankError[index] && (
        <div className="error">
          <p><i className="fal fa-times" aria-hidden="true"></i> There is an error with your connection.</p>
          <a href="javascript:void(0)">
            More info
          </a>
        </div>
      )}
      <div className="accounts-wrapper">
        {accounts.map(account => {
          account.error = bankError[index]
          return <Account {...account} key={account.name} />
        })}
      </div>
    </div>
  )
}

class BankAccounts extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      data: [],
      bankError: [],
      uLoading: false   //for showing loader on update now
    }
  }

  componentWillMount() {
    this.fetchBankAccounts()
  }

  fetchBankAccounts = async () => {
    this.setState({ loading: true })
    const { statusCode, data } = await fetchBankAccounts()
    if (statusCode !== 200) {
      this.setState({ loading: false })
      return
    }

    this.setState({ loading: false, data })
  }

  fetchBankAccountsByIstitute = async (id, index) => {
    let newState = Object.assign(this.state, {})
    this.setState({ updateAccount: true, uLoading: true })
    fetchBankAccountsById(id)
      .then(({ statusCode, data }) => {
        if (statusCode != 200) {
          throw Error()
        }
        newState.data[index] = data[0]
        this.setState({ updateAccount: false, uLoading: false, data: [...newState.data] })
      })
      .catch(error => {
        const { bankError } = this.state
        bankError[index] = true
        this.setState({ loading: false, uLoading: false, bankError })
      })
  }

  updateBankAccounts = async () => {
    let date = new Date()
    localStorage.setItem('accountLastUpdatedOndate', date)
    this.fetchBankAccounts()
  }

  renderOptions() {
    const { data } = this.state

    if (data && data.length) {
      return (
        <div className="manage-accounts-container">
          <NavLink to="/app/banking/bankconnections">
            View and manage all connected accounts
          </NavLink>
        </div>
      )
    }

    {/*return (
      <Fragment>
        <div className="or-separator-container">
          <hr />
          <span className="text">or</span>
          <hr />
        </div>
        <div className="statement-link-container">
          <a href="#">Upload a bank statement</a>
        </div>
      </Fragment>
    )*/}
  }

  _connectBank(e) {
    let side = !!JSON.parse(localStorage.getItem('sidebarToggleHistory')) ? JSON.parse(localStorage.getItem('sidebarToggleHistory')) : openBlocks;
    side = {
      ...openBlocks,
      bankingOpen: true
    }
    localStorage.setItem("sidebarToggleHistory", JSON.stringify(side))
  }

  handleBankSucess = async (token, metadata) => {
    if (!!token) {
      try {
        const saveBankDetails = await saveBank(metadata.public_token)
        if (!!saveBankDetails) {
          if (saveBankDetails.statusCode === 200) {
            this.fetchBankAccounts()
            // this.props.openGlobalSnackbar('Bank added successfully', false)
            // this.props.refreshBank(saveBankDetails.data.institute._id)
            // history.push({pathname: '/app/banking/bankconnections', state: {id: saveBankDetails.data.institute._id}})
          }
        }
      } catch (err) {
        console.error("err", err)
      }
    }
  }

  render() {
    const { data, bankError, loading, uLoading } = this.state
    return (
      <div className="widget-wrapper bank-widget">
        <div className="title-container">
          <h3 className="widget--title">Bank Accounts & Credit Cards</h3>
        </div>
        <div className="content-container">
          {!!loading ? <CenterSpinner /> : !!data && data.length > 0 ? data.map((row, index) => {
            row.fetchBanks = this.fetchBankAccountsByIstitute
            row.index = index
            row.bankError = bankError
            row.uLoading = uLoading
            return <Bank {...row} key={row.institute && row.institute.name} />
          }) : <NoBankAcocunts />}
          <div className="add-bank-account-container">
            <PlaidLinkTokenButton
              api="banking"
              className="btn btn-primary text-center w-100"
              style={{ background: '#ffffff', border: 'none' }}
              onExit={this.handleOnExit}
              onSuccess={this.handleBankSucess}
            >
              Connect an Account
            </PlaidLinkTokenButton>
          </div>
          {this.renderOptions()}
        </div>
      </div>
    )
  }
}

export default BankAccounts
