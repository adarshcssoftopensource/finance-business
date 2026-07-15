import React, { Component } from "react";
import {Link, Redirect} from "react-router-dom";
import {
  Nav,
  NavItem,
  NavLink,
  Collapse,
  Button,
  DropdownMenu, DropdownItem, TabContent, TabPane,
} from "reactstrap";
import BankingEditModal from "./BankingEditModal";
import ButtonGroupCustom from "../../../../common/ButtonGroupCustom";
import CollapsibleTrigger from "../../../../common/CollapsibleTrigger";
import CollapsibleHeader from "../../../../common/CollapsibleHeader";
import CollapsibleContent from "../../../../common/CollapsibleContent";
import CustomBanner from "../../../../common/CustomBanner";
import { getAllConnectedBank, deleteBank, updateBalance } from "../../../../../actions/bankingActions";
import { connect } from "react-redux";
import { GET_CONNECTED_BANKS_LOADING, DELETED_BANKS_SUCCESS, DELETED_BANKS_LOADING, GET_CONNECTED_BANKS_SUCCESS, UPDATE_BALANCE_SUCCESS, UPDATE_BALANCE_LOADING } from "../../../../../actions/bankingActions/bankingTypes";
import CenterSpinner from "../../../../../global/CenterSpinner";
import { openGlobalSnackbar } from "../../../../../actions/snackBarAction";
import CommonModal from "../../../../common/CommonModal";
import { SAVE_TRANSACTIONS_ERROR, SAVE_TRANSACTIONS_SUCCESS } from "../../../../../actions/bankingActions/transactionTypes";
import { Spinner } from "react-bootstrap";
// import Collapsibe from "../../../../common/CollapsibleHeader";
import PlaidLinkTokenButton from '../../../../../global/PlaidWrapper/PlaidLinkTokenButton';
import { getUpdatedPlaidToken } from "../../../../../api/bankingServices";
import NoBankAcocunts from "../../dashboard/components/NoBankAcocunts";
import { getAmountToDisplay, _documentTitle } from "../../../../../utils/GlobalFunctions";
import BankIconListShow from "./BankIconListShow";
import { _displayDate } from "../../../../../utils/globalMomentDateFunc";

class BankConnections extends Component {

  state = {
    isOpen: false,
    updateOpen: false,
    activeTab: '1',
    connectedData: null,
    selectedAccount: null,
    isEdit: false,
    selectedbsns: null
  }

  componentWillMount() {
    this.props.getAllConnectedBank()
  }
  componentDidMount(){
    if(!!this.props.location.state && !!this.props.location.state.id){
      this.setState({[`isOpenCollapse_${this.props.location.state.id}`]: true})
    }
    _documentTitle(this.props.businessInfo, 'Bank Connections')
  }
  toggle = (e, data, isEdit = false) => {
    this.setState({
      isOpen: !this.state.isOpen,
      selectedAccount: data,
      isEdit
    })
  }

  refreshBank(id){
    this.props.getAllConnectedBank()
    if(!!id){
      this.setState({[`isOpenCollapse_${id}`]: true})
    }
  }

  toggleDrop = e => {
    e.preventDefault()
    this.setState({updateOpen: !this.state.updateOpen})
  }

  toggleTabs = tab => {
    this.setState({activeTab: tab})
  }
  toggleDeleteModal = (id) => {
    this.setState({deleteModal: !this.state.deleteModal, selectedId: id})
  }
  deleteBank = (e) => {
    e.preventDefault();
    this.props.deleteBank(this.state.selectedId)
  }
  componentWillReceiveProps(nextProps) {
    if(this.props.banking !== nextProps.banking){
      const { type, data, updateBalanceData, connectedData } = nextProps.banking
      if(type === DELETED_BANKS_SUCCESS){
        this.props.openGlobalSnackbar('Bank deleted successfully', false)
        this.props.getAllConnectedBank();
        this.setState({deleteModal: false})
      }
      if(type === GET_CONNECTED_BANKS_SUCCESS){
        let count = 0;
        if(!!connectedData && connectedData.institutes.length > 0){
          const arr = connectedData.institutes.map(ins => {
            if(!!ins.accounts && ins.accounts.length > 0){
              ins.accounts.map(acc => {
                if(acc.isImporting){
                  count+=1;
                }
              })
            }
            ins.connectedAccounts = count;
            count = 0;
            return ins;
          })
          this.setState({connectedData: {institutes: arr}})
        }
      }
      if(type === UPDATE_BALANCE_SUCCESS){
        if(!!updateBalanceData){
          let count = 0;
          const oldConnectedData = this.state.connectedData;
          if(!!oldConnectedData && !!oldConnectedData.institutes && oldConnectedData.institutes.length > 0) {
            const data = oldConnectedData.institutes.map(ins => {
              if(ins._id === updateBalanceData._id){
                if(!!ins.accounts && ins.accounts.length > 0){
                  ins.accounts.map(acc => {
                    if(acc.isImporting){
                      count+=1;
                    }
                  })
                }
                ins = updateBalanceData
                ins.connectedAccounts = count;
                count = 0;
                ins.updatedBalance = true
              }
              return ins;
            })
            this.setState({connectedData: {institutes: data}})
          }
        }
      }
    }
    if(this.props.transaction !== nextProps.transaction){
      const { type, saveImportData } = nextProps.transaction;
      if(type === SAVE_TRANSACTIONS_SUCCESS){
        this.setState({isOpen: false})
        if(!!saveImportData){
          let count = 0;
          const oldConnectedData = this.state.connectedData;
          if(!!oldConnectedData && !!oldConnectedData.institutes && oldConnectedData.institutes.length > 0) {
            const data = oldConnectedData.institutes.map(ins => {
              if(ins._id === saveImportData.instituteAccount.instituteId){
                if(!!ins.accounts && ins.accounts.length > 0){
                  const accArr = ins.accounts.map(acc => {
                    if(acc._id === saveImportData.instituteAccount._id){
                      acc = saveImportData.instituteAccount
                      acc.updateAcc = true
                    }
                    if(acc.isImporting){
                      count+=1;
                    }
                    return acc
                  })
                  ins.accounts = accArr
                }
                ins.connectedAccounts = count;
                count = 0;
                ins.updatedBalance = true
              }
              return ins;
            })
            this.setState({connectedData: {institutes: data}})
          }
        }
        this.props.openGlobalSnackbar('Transaction importing initiated successfully', false)
        // this.props.getAllConnectedBank()
      }
    }
  }

  toggleImport = (insId, accId) => {
    const oldConnectedData = this.state.connectedData;
    if(!!oldConnectedData && !!oldConnectedData.institutes && oldConnectedData.institutes.length > 0) {
      const data = oldConnectedData.institutes.map(ins => {
        if(ins._id === insId){
          if(ins.accounts)
          ins.updatedBalance = true
        }
        return ins;
      })
      this.setState({connectedData: {institutes: data}})
    }
  }

  handeUpdate(id) {
    this.setState({selectedbsns: id})
    this.props.updateBalance(id)
  }

  handleBankSucess(token, metaData) {
  }

  async handleOnLoad(e, metaData, id, idx){
    const updateToken = await getUpdatedPlaidToken(id)
    if(!!updateToken && updateToken.statusCode === 200){
      if(!!updateToken.data && !!updateToken.data.publicToken){
        this.setState({
          [`publicToken${idx}`]: updateToken.data.publicToken
        })
      }
    }
  }

  handleOnExit(err, metaData){
  }

  render() {
    const { activeTab, connectedData, selectedAccount, isEdit } = this.state;
    const { banking: {type}, paymentSettings: { loading, data } } = this.props;
    return (
        <div className="content-wrapper__main">
          <div className="py-header--page">
            <div className="py-header__action pull-right">
              <BankIconListShow
                // list={iconList}
                refreshBank={(id) => this.refreshBank(id)}
                openGlobalSnackbar={this.props.openGlobalSnackbar}
              />
            </div>
            <div className="py-header--title">
              <h1 className="py-heading--title">Bank connections</h1>
            </div>
          </div>
          <div className="Margin__t-32 Margin__b-40">
            <Nav tabs>
              <NavItem>
                <NavLink active={activeTab === '1'} onClick={() => this.toggleTabs('1')}>Active</NavLink>
              </NavItem>

              <NavItem>
                <NavLink active={activeTab === '2'} onClick={() => this.toggleTabs('2')}>Payments</NavLink>
              </NavItem>
          </Nav>
        </div>
        <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          {
            (type === GET_CONNECTED_BANKS_LOADING) ?
            (
              <CenterSpinner/>
            ) : (
              !!connectedData && !!connectedData.institutes && connectedData.institutes.length > 0 ? (
                connectedData.institutes.map((item, idx) => {
                  return (
                    <div className="Collapsible py-box banking-collaps border-none shadow-sm" key={idx}>
                      <CollapsibleHeader className="d-flex jusitfy-content-between">
                            <div className="Collapsible__header-content d-flex align-items-center">
                                <div className="bg-light d-flex align-items-center justify-content-center Margin__r-16 rounded" style={{width: "70px", height: "70px"}}>
                                  <img className="Icon Icon__Lg" src={item.institute.logo ? `data:image/jpeg;base64, ${item.institute.logo}` : "http://placehold.it/24x24"}/>
                                </div>

                                <div className="">
                                <h5 className="mb-1">{item.institute.name}</h5>

                                <div className="account_info d-flex">
                                <div className="me-4">
                                  <span className="text-sm text-muted">Connected on</span>
                                  <div>{_displayDate(item.accountConnectedOn, 'MMM DD, YYYY HH:mm')}</div>
                                </div>

                                {/* <div className="me-4">
                                  <span className="text-sm text-muted">Accounts</span>
                                  <div>{`${item.connectedAccounts}/${item.accounts.length}`} connected
                                  </div>
                                </div> */}

                                <div className="me-4">
                                  <span className="text-sm text-muted">Last update</span>
                                  <div>{_displayDate(item.lastSyncedAt, 'MMM DD, YYYY HH:mm')}</div>
                                </div>
                                </div>
                              </div>
                            </div>
                            <div className="ml-auto d-flex align-items-center banking-list-button">
                              <ButtonGroupCustom
                                text={`Update`}
                                disabled={type === UPDATE_BALANCE_LOADING}
                                actionClass="btn-default"
                                className={'me-1 dropdown update-button'}
                                onClick={() => this.handeUpdate(item._id)}
                                selectedBsns = {this.state.selectedbsns}
                                data={item}
                              >
                                    <DropdownMenu className="dropdown-menu-center">
                                        <PlaidLinkTokenButton
                                          api="banking"
                                          asWrapper
                                          onSuccess={(token, metadata) => this.handleBankSucess(token, metadata)}
                                          onExit={this.handleOnExit}
                                          className="plaid w-100"
                                        >
                                          <DropdownItem>Update credentials via Plaid</DropdownItem>
                                        </PlaidLinkTokenButton>
                                        <DropdownItem onClick={(e) => this.toggleDeleteModal(item._id)}>Delete connections</DropdownItem>
                                    </DropdownMenu>
                              </ButtonGroupCustom>
                              {/* <CollapsibleTrigger
                                  className="Margin__l-16 btn-toggle"
                                  toggleCollapse={() => this.setState({[`isOpenCollapse_${item._id}`]: !this.state[`isOpenCollapse_${item._id}`]})}
                                  isOpen={this.state[`isOpenCollapse_${item._id}`]}
                                  text={this.state[`isOpenCollapse_${item._id}`] ? <i className="fal fa-minus" ></i> : <i className="fal fa-plus" ></i> }
                                ></CollapsibleTrigger> */}
                            </div>
                          </CollapsibleHeader>

                          <Collapse style={{transition: "none"}} isOpen={this.state[`isOpenCollapse_${item._id}`]}>

                            <CollapsibleContent className="Margin__l-80">
                                    {
                                      item.loginRequired && (
                                        <CustomBanner
                                          statusClass='Banner__statusWarning'
                                          className="Margin__t-24"
                                          iconClass={"Icon__Svg"}
                                          iconName="error_outline"
                                          title={'Connection failed.'}
                                          content={'Sorry, we couldn’t establish connection to this bank. Maybe the credentials has been changed. Try reconnecting to your bank account.'}
                                          dismissible={false}
                                        >
                                          <div>
                                            <Button color="primary Margin__r-8">Reconnect</Button>
                                            <Button color="default">Learn more</Button>
                                          </div>
                                        </CustomBanner>
                                      )
                                    }

                                    <div className="mt-4 py-box">
                                      <h5 className="mb-3 heading-sm" >Connected accounts</h5>
                                      <ul className="account-card__list list-unstyled w-100">
                                        {
                                          !!item.accounts && item.accounts.length > 0 &&
                                            item.accounts.map((account, i) => {
                                              return (<li key={i}>
                                                <div className="account-card__single">
                                                  <div className="account-card__single-header">
                                                  <div className="bg-primary Icon Icon__M me-3 text-white d-flex align-items-center justify-content-center border-radius">
                                                  <svg viewBox="0 0 40 40">
                                                      <path fill="currentColor" fillRule="nonzero" d="M36.25 0A3.75 3.75 0 0140 3.75v30a3.75 3.75 0 01-3.75 3.75H35v1.25a1.25 1.25 0 01-2.5 0V37.5h-25v1.25a1.25 1.25 0 01-2.5 0V37.5H3.75A3.75 3.75 0 010 33.75v-30A3.75 3.75 0 013.75 0zm0 2.5H3.75c-.69 0-1.25.56-1.25 1.25v30c0 .69.56 1.25 1.25 1.25h32.5c.69 0 1.25-.56 1.25-1.25v-30c0-.69-.56-1.25-1.25-1.25zm-5 2.5A3.75 3.75 0 0135 8.75v20a3.75 3.75 0 01-3.75 3.75h-20a3.75 3.75 0 01-3.75-3.75V25H6.25a1.25 1.25 0 010-2.5H7.5V15H6.25a1.25 1.25 0 010-2.5H7.5V8.75A3.75 3.75 0 0111.25 5zm0 2.5h-20c-.69 0-1.25.56-1.25 1.25v3.75h1.25a1.25 1.25 0 010 2.5H10v7.5h1.25a1.25 1.25 0 010 2.5H10v3.75c0 .69.56 1.25 1.25 1.25h20c.69 0 1.25-.56 1.25-1.25v-20c0-.69-.56-1.25-1.25-1.25zM21.28 10c.69 0 1.25.56 1.25 1.25v1.89a5.51 5.51 0 011.39.51L25 12.56a1.25 1.25 0 011.74 1.77l-.93.93a5.78 5.78 0 011.05 2.24h1.89a1.25 1.25 0 010 2.5h-1.89a5.78 5.78 0 01-1.02 2.24l.93.93a1.25 1.25 0 01-.88 2.13 1.28 1.28 0 01-.89-.36l-1.11-1.09a5.65 5.65 0 01-1.39.51v1.89a1.25 1.25 0 01-2.5 0v-1.89a5.65 5.65 0 01-1.39-.51l-1.08 1.09a1.28 1.28 0 01-.89.36 1.25 1.25 0 01-.88-2.13l.93-.93A5.78 5.78 0 0115.64 20h-1.89a1.25 1.25 0 010-2.5h1.92a5.78 5.78 0 011.05-2.24l-.93-.93a1.252 1.252 0 111.77-1.77l1.08 1.09a5.65 5.65 0 011.39-.51v-1.89c0-.69.56-1.25 1.25-1.25zm-.03 5.5a3.25 3.25 0 000 6.5 3.26 3.26 0 003.25-3.25 3.25 3.25 0 00-3.25-3.25z"/>
                                                    </svg>
                                                  </div>
                                                    <div>
                                                      <div className="account-type">{account.name}&nbsp;
                                                      <span className="account-number">{account.mask}</span>
                                                      </div>
                                                      <div className="account-balance text-sm text-muted">
                                                        Balance
                                                        <span className="account-balance_value ml-2">
                                                          {getAmountToDisplay(account.currency, account.balance)}
                                                          {/* {!!account.currency ? `${account.currency.code} ${account.currency.symbol}` : ""}{!!account.balance ? account.balance : 0} */}
                                                        </span>
                                                      </div>
                                                    </div>
                                                    <div className="account-card__single-acitons ml-auto">
                                                      <button className="btn btn-blank" onClick={(e) => this.toggle(e, account, true)} disabled={!account.isImporting}>
                                                        <i className="fal fa-pencil-alt"></i>
                                                      </button>
                                                    </div>
                                                  </div>
                                                  <div className="account-card__single-footer">
                                                    <div className="Callout">
                                                    <span className="me-5">Do you want to import transactions from this account?</span>

                                                    <label className="py-switch ml-auto" htmlFor="AccountImportSwitch">
                                                      <input
                                                        type="checkbox"
                                                        className="py-toggle__checkbox"
                                                        defaultChecked={account.isImporting}
                                                        disabled={account.isImporting}
                                                        checked={account.isImporting}
                                                        // onChange={this.toggle}
                                                      />
                                                      <span className={account.isImporting ? "py-toggle__handle disabled" : "py-toggle__handle"} onClick={!account.isImporting ? (e) => this.toggle(e, account, false) : () => {return false}}></span>
                                                    </label>
                                                    </div>
                                                  </div>
                                                </div>
                                              </li>)
                                            })
                                        }
                                      </ul>
                                    </div>
                            </CollapsibleContent>
                          </Collapse>
                    </div>
                  )
                })
              ) : <NoBankAcocunts/>
            )
          }
        </TabPane>
        <TabPane tabId="2">
          {/* Payment callout */}
          { activeTab === "2" ?
            !!loading ? <CenterSpinner/> : !!data && !!data.isOnboardingApplicable && !!data.isConnected ? (
              <div className="py-box py-box--large p-4">
                <div className="bank_options">
                  <h3 className="py-heading--subtitle-wbtn">Payments</h3>
                  <div>
                    <Link to="/app/setting/payouts" className="btn btn-primary">
                      Edit Bank Profile
                    </Link>
                  </div>
                </div>

                <div className="py--grey-text">
                  Choose where to deposit the payments you collect through Finance.
                </div>
              </div>
            ) : (
              <Redirect to='/app/payments'/>
            ) : ''
          }
        </TabPane>
        </TabContent>

        <CommonModal
          isOpen={this.state.deleteModal}
          toggle={this.toggleDeleteModal}
          className="modal-add modal-confirm modal-dialog-centered"
          modalTitle="Delete bank"
          modalBody="Are you sure you want to delete this connection? Doing this could have very negative effects on your bookkeeping."
          buttonLabel="Close"
          showPrimary={true}
          onConfirm={this.deleteBank}
          primaryLoading={type === DELETED_BANKS_LOADING}
        />
        {
          this.state.isOpen && (
            <BankingEditModal
              isOpen={this.state.isOpen}
              toggle={this.toggle}
              className="modal"
              data={selectedAccount}
              isEdit={isEdit}
            />
          )
        }
      </div>
    );
  }
}

const state = state => {
  return {
    banking: state.banking,
    transaction: state.transaction,
    paymentSettings: state.paymentSettings,
    businessInfo: state.businessReducer.selectedBusiness
  }
}
export default connect(state, { getAllConnectedBank, deleteBank, openGlobalSnackbar, updateBalance })(BankConnections);
