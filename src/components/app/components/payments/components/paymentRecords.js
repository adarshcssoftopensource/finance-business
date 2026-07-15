import React, { PureComponent } from 'react';
import { get as _get } from 'lodash';
import { withStyles } from '@material-ui/core/styles'
import { Link, browserHistory, withRouter } from 'react-router-dom'
import {
  Tabs,
  Tab,
  InputGroup,
  FormControl,
  Modal
} from 'react-bootstrap'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
import history from '../../../../../customHistory';
import queryString from 'query-string'
// import Cards from 'react-credit-cards';
import 'react-credit-cards/es/styles-compiled.css'
import * as PaymentIcon from '../../../../../global/PaymentIcon'
import CenterSpinner from '../../../../../global/CenterSpinner';
import MailModal from "../../../../../global/MailModal";
import {
  toMoney,
  getAmountToDisplay
} from '../../../../../utils/GlobalFunctions'
import { toDisplayDate } from '../../../../../utils/common'
import { PaymentDetails } from './PaymentDetails'
import { RefundModal } from './RefundModal'
import NavItem from 'react-bootstrap/NavItem'
import TabPane from 'react-bootstrap/TabPane'
import compose from 'recompose/compose'
import { postNewRefund } from '../../../../../actions/paymentAction'
import { openGlobalSnackbar } from '../../../../../actions/snackBarAction'
import { connect } from 'react-redux'
import DatepickerWrapper from '../../../../../utils/formWrapper/DatepickerWrapper'
import Pagination from './pagination/pagination';
import {ReactSVG} from 'react-svg';
import { Tooltip, Button, UncontrolledTooltip, Alert } from 'reactstrap';
import { removeQueryStringUrl } from '../../../../../utils/common';
import { _formatDate, _toDateConvert, _displayDate } from '../../../../../utils/globalMomentDateFunc'
import {
  getInvoice
} from '../../../../../api/InvoiceService';
import InformationAlert from '../../../../../global/InformationAlert';
import Payouts from '../../Banking/components/Payouts'
import Disputes from './Disputes'
import GetRedirectUrl from '../common/paymentTypeRedirection'
import { invoiceInput } from '../../invoice/helpers'
import PaymeServices from '../../../../../api/PaymeServices'
import CheckoutServices from '../../../../../api/CheckoutService'
import CrowdFundingServices from '../../../../../api/CrowdFundingServices';
import  icCancelSvg from "../../../../../assets/icons/ic_cancel.svg"
import PaymentService from '../../../../../api/paymentService'
import moment from 'moment'
import { PAYOUT_DISABLE } from '../../../../../utils/Provider.const';

const styles = theme => ({

  table: {},
  tableHeader: {},
  tableColumn: {
    border: '0px'
  },
  payments: {
    color: '#0ea90e',
    fontSize: '16px',
    fontWeight: '500'
  },
  paymentExpandable: {},

  viewInvoiceButton: {
    color: '#fff',
    background: '#136acd',
    border: '1px solid transparent',
    padding: '6px 20px',
    textAlign: 'center',
    borderRadius: '500px',
    display: 'inline-block',
    boxSizing: 'border-box',
    verticalAlign: 'middle',
    outline: 0,
    margin: '10px',
    '&:hover': {
      background: '#0b59b1'
    }
  },
  refundButton: {
    color: '#4d6575',
    background: '#fff',
    border: '1px solid #ebeff4',
    padding: '6px 20px',
    textAlign: 'center',
    borderRadius: '500px',
    display: 'inline-block',
    boxShadow: 'none',
    verticalAlign: 'middle',
    outline: 0,
    '&:hover': {
      borderColor: '#136acd'
    }
  },
  paymentFooter: {
    width: '100%',
    textAlign: 'right'
  },
  expandableHeader: {
    fontSize: '20px',
    fontWeight: '600',
    paddingBottom: '10px'
  },
  expandableSubHeader: {
    color: 'dimgrey',
    whiteSpace: 'initial'
  },
  myAccount: {
    background: 'linear-gradient(25deg, #013aff, #7f92ff)'
  },
  dropDownItems: {
    fontSize: '14px',
    whiteSpace: 'pre-line',
    padding: '5px'
  },
  refundDialog: {
    maxWidth: '610px'
  },
  editAmount: {
    '&:disabled': {
      border: '0px',
      width: '50px',
      backgroundColor: 'transparent',
      marginTop: '-2px'
    }
  },
  addonSearch: {
    cursor: 'pointer'
  }
})

class PaymentRecords extends PureComponent {
  state = {
    startDate: null,
    endDate: null,
    createRefundModalShow: [],
    filters: {
      startDate: '',
      endDate: '',
      text: '',
      pageNo: 1
    },
    isOpenRefund: false,
    refundModalIndex: 0,
    editMountRefund: true,
    refundLoding: false,
    activeKey: 'payments',
    tooltipOpen: false,
    openMail: false,
    openText: false,
    openReceiptMail: false,
    receiptItem:"",
    receiptIndex:0,
    openAlert:false,
    invoiceData:{},
    isVerifiedEmail: false
  }

  componentDidMount = () => {
    if(this.props.tabSelected){
      const query = queryString.parse(this.props.location.search);
      this.setState((prevState) => ({
        ...prevState,
        filters: { ...prevState.filters, ...query },
      }))

      /*if( query.status ==="payout" && this.props.tabSelected === 'payments.success') {
        this.handleTabChangeRedirectURL("success")
      }*/

      this.setState({
        activeKey: this.props.tabSelected || "payments"
      })
      switch (this.props.tabSelected) {
        case 'payments.refund':
          this.props.getRefund({ ...this.state.filters, pageNo: 1, ...query })
          break;
        case 'payments':
          this.props.fetchData({ ...this.state.filters,type:false, pageNo: 1, ...query })
          break;
        case 'payments.success':
          this.props.fetchData({ ...this.state.filters, type:"SUCCESS", pageNo: 1, ...query })
          break;
          case 'payments.failed':
        this.props.fetchData({ ...this.state.filters, type:"FAILED", pageNo: 1, ...query })
        break;
        case 'payments.payout':
          this.props.getPayoutBalance();
          break;

        default:
          break;
      }
    }
  }

  componentDidUpdate = (prevProps) => {
    if(prevProps.tabSelected !== this.props.tabSelected){
    this.setState({
        activeKey: this.props.tabSelected || "payments"
      })
      switch (this.props.tabSelected) {
        case 'payments.refund':
          this.props.getRefund({ ...this.state.filters, pageNo: 1 })
          break;
        case 'payments':
          this.props.fetchData({ ...this.state.filters, type:false, pageNo: 1 })
          break;
        case 'payments.success':
          this.props.fetchData({ ...this.state.filters, type:"SUCCESS", pageNo: 1 })
          break;
          case 'payments.failed':
        this.props.fetchData({ ...this.state.filters, type:"FAILED", pageNo: 1 })
        break;
        case 'payments.payout':
          this.props.getPayoutBalance();
          break;

        default:
          break;
      }
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (
      props.data &&
      props.data.length > 0 &&
      state.createRefundModalShow.length != props.data.length
    ) {
      let modals = []
      props.data.map((d, i) => {
        let a = {}
        a['modal_' + i] = false
        modals.push(a)
      })
      const query = queryString.parse(props.location.search)
      return {
        createRefundModalShow: modals,
        startDate: !!props.filter ? props.filter.startDate ? props.filter.startDate : query.startDate : '',
        endDate: !!props.filter ? props.filter.endDate ? props.filter.endDate : query.endDate : '',
        filters: !!props.filter ? { ...props.filter, ...query } : {...query}
      }
    }
    return { ...state }
  }

  toggle = () => {
    this.setState({
      tooltipOpen: !this.state.tooltipOpen
    });
  };

  clearDate = () => {
    this.setState((prevState) => ({
      ...prevState,
      startDate: '',
      endDate: '',
      filters: {
        ...prevState.filters,
        startDate: '',
        endDate: '',
        pageNo: 1
      }
    }), () => {
      this.onTabChange(this.state.activeKey);
      this.handleSearchURL();
    })
  }

  handleURLParams = (queryData) => {
    const urlParams = new URLSearchParams(queryData);
    if (urlParams.get('endDate') === '') {
      urlParams.delete('endDate');
    }
    if (urlParams.get('startDate') === '') {
      urlParams.delete('startDate');
    }
    if (urlParams.get('text') === '') {
      urlParams.delete('text');
    }
    if (urlParams.get('status') === '') {
      urlParams.delete('status');
    }
    urlParams.delete('pageNo');
    urlParams.delete('pageSize');
    urlParams.delete('type');
    return urlParams.toString();
  }

  handleSearchURL = () => {
    const { filters } = this.state;
    const query = queryString.parse(this.props.location.search);
    let queryData = Object.entries({...filters, status: query.status ? query.status : ''}).map(([key, val]) => `${key}=${val}`).join("&");
    const pathname = this.props.location.pathname;
    history.push({
      pathname,
      search: this.handleURLParams(queryData)
    });
    return this.handleURLParams(queryData)
  }

  handleDateChange = (date, name) => {
    const getDate = date ? _formatDate(date) : ''; // Handle null date safely
    let updates = {
      [name]: getDate,
      filters: {
        ...this.state.filters,
        [name]: getDate,
        pageNo: 1
      }
    };
  
    this.setState(prev => ({ ...prev, ...updates }), () => {
      this.onTabChange(this.state.activeKey);
      this.handleSearchURL();
    });

  }

  handleSearch = e => {
    let { filters } = this.state
    filters.text = e.target.value
    this.setState(filters)
  }
  handleSearchClick = e => {
    this.setState((prevState) => ({
      ...prevState,
      filters: {
        ...prevState.filters,
        pageNo: 1
      }
    }), () => {
      this.onTabChange(this.state.activeKey);
      this.handleSearchURL();
    })

  }

  onOpenReceiptMail =async (item, index) => {
    let response = ""
    if (item.invoiceId) {
      response = await getInvoice(item.invoiceId)
      if (response && response !== "") {
        this.setState({
          openReceiptMail: true,
          openMail: true,
          receiptItem: item,
          receiptIndex: 1,
          invoiceData:invoiceInput(
            response.data.invoice,
            this.props.businessInfo
          ),
          openAlert: false
        })
      }
    }
    if (item.peymeId) {
      response = await PaymeServices.fetchPeyMePayment(item.uuid)
      if (response && response !== "") {
        this.setState({
          openReceiptMail: true,
          openMail: true,
          receiptItem: item,
          receiptIndex: 1,
          invoiceData: {
            _id: response.data.peyme._id,
            uuid: response.data.peyme.uuid,
            title: "Finance.Me",
            invoiceNumber: response.data.peyme.peymeName,
            paymentFor: 'peyme',
            businessInfo: this.props.businessInfo,
            customer: { ...response.data.payment.customer, currency: response.data.payment.currency},
          },
          openAlert: false
        })
      }
    }
    if (item.fundingId) {
      response = await CrowdFundingServices.fetchCrowdFundingPayment(item.uuid)
      if (response && response !== "") {
        this.setState({
          openReceiptMail: true,
          openMail: true,
          receiptItem: item,
          receiptIndex: 1,
          invoiceData: {
            _id: response.data.funding._id,
            uuid: response.data.funding.uuid,
            title: "Give",
            invoiceNumber: response.data.funding.fundingName,
            paymentFor: 'funding',
            businessInfo: this.props.businessInfo,
            customer: { ...response.data.payment.customer, currency: response.data.payment.currency},
          },
          openAlert: false
        })
      }
    }
    if (item.checkoutId) {
      response = await CheckoutServices.fetchCheckoutPayment(item.uuid)
      if (response && response !== "") {
        this.setState({
          openReceiptMail: true,
          openMail: true,
          receiptItem: item,
          receiptIndex: 1,
          invoiceData: {
            _id: response.data.checkout._id,
            uuid: response.data.checkout.uuid,
            title: "Checkout",
            invoiceNumber: response.data.checkout.itemName,
            paymentFor: 'checkout',
            businessInfo: this.props.businessInfo,
            customer: { ...response.data.payment.customer, currency: response.data.payment.currency},
          },
          openAlert: false
        })
      }
    }
  }

  onCloseMail = (status, alertTitle, alertMsg, from) => {
    this.setState({
      openMail: false,
      openReceiptMail: false
    })
  }

  onTabChange = key => {

    if (this.state.activeKey != key) {
      switch (key) {
        case 'payments.refund':
          this.props.getRefund({ ...this.state.filters, pageNo: 1 })
          break;
        case 'payments':
          this.props.fetchData({ ...this.state.filters,type:false, pageNo: 1 })
          break;
        case 'payments.success':
          this.props.fetchData({ ...this.state.filters, type:"SUCCESS", pageNo: 1 })
          break;
          case 'payments.failed':
        this.props.fetchData({ ...this.state.filters, type:"FAILED", pageNo: 1 })
        break;
        case 'payments.payout':
          this.props.getPayoutBalance();
          break;

        default:
          break;
      }
    } else {
      switch (key) {
        case 'payments.refund':
          this.props.getRefund(this.state.filters)
          break;
        case 'payments':
          this.props.fetchData({...this.state.filters,type:false})
          break;
        case 'payments.success':
          this.props.fetchData({...this.state.filters, type:"SUCCESS"})
          break;
          case 'payments.failed':
        this.props.fetchData({ ...this.state.filters, type:"FAILED"})
        break;
        case 'payments.payout':
          this.props.getPayoutBalance();
          break;

        default:
          break;
      }
    }
    this.setState({ activeKey: key });
  }

  handleTabChangeRedirectURL = (status) => {
    let searchString = '';
    if (status) {
      searchString = `?status=${status}`;
    }
    delete this.state.filters.status;
    const tabChangeSearch = Object.entries(this.state.filters).map(([key, val]) => `${key}=${val}`).join("&");
    searchString += `&${tabChangeSearch}`;
    this.props.history.push({
      pathname: "/app/payments",
      search: this.handleURLParams(searchString),
    })
  }

  onTabChangeFromTab = key => {
    removeQueryStringUrl()
    switch (key) {
      case 'payments.refund':
        this.handleTabChangeRedirectURL('refund');
        this.props.getRefund({ ...this.state.filters, pageNo: 1 })
        break;
      case 'payments':
        this.handleTabChangeRedirectURL();
        this.props.fetchData({ ...this.state.filters, type:false, pageNo: 1 })
        break;
      case 'payments.success':
        this.handleTabChangeRedirectURL('success');
        this.props.fetchData({ ...this.state.filters, type:"SUCCESS", pageNo: 1 })
        break;
      case 'payments.failed':
        this.handleTabChangeRedirectURL('failed');
        this.props.fetchData({ ...this.state.filters, type:"FAILED", pageNo: 1 })
        break;
      case 'payments.payout':
        this.handleTabChangeRedirectURL('payout');
        this.props.getPayoutBalance();
        break;
      case 'payments.disputes':
        this.handleTabChangeRedirectURL('disputes');
        break;

      default:
        break;
    }
    this.setState({ activeKey: key });
  }

  riskScore = (riskScore) => {
    let scoreObj = {
      class: 'default',
    }
    if (riskScore >= 0 &&  riskScore <= 25 ){
      scoreObj = {
        class: 'success'
      }
    } else if (riskScore >= 26 &&  riskScore <= 50 ){
      scoreObj = {
        class: 'warning'
      }
    } else if (riskScore >= 51 &&  riskScore <= 100 ){
      scoreObj = {
        class: 'danger'
      }
    } else if (riskScore === 'NA'){
      scoreObj = {
        class: 'default'
      }
      return <span className={`badge badge-${scoreObj.class}`}>{riskScore}</span>
    }
    return <span className={`badge badge-${scoreObj.class}`}>{riskScore}%</span>
  }

  handlePaginationPage = (page, key) => {
    this.setState((prevState) => ({
      ...prevState,
      filters: {
        ...prevState.filters,
        pageNo: page
      }
    }), () => this.onTabChange(this.state.activeKey))
  }

  handlePaginationPageSize = (size, key) => {
    this.setState((prevState) => ({
      ...prevState,
      filters: {
        ...prevState.filters,
        pageNo: 1
      }
    }), () => this.onTabChange(key))
  }

  isPaymentListExpandable = row => {
    return true
  }

  capitalize = (word) => {
    return word[0].toUpperCase() + word.slice(1).toLowerCase();
  }

  statusFormatter = (status) => {
    let type = 'success'
    if (status == 'DECLINED' || status == 'FAILED') {
      type = 'danger'
    } else if (status == 'INITIATED') {
      type = 'gray'
    } else if (status == 'REFUNDED') {
      type = 'alert'
    } else if (status == 'PENDING') {
      type = 'gray'
    }
    return `<div class='badge badge-${type}'>${this.capitalize(status)}</div>`
  }

  getHeaderOfExpandable = row => {
    const { classes } = this.props
    if (row.status == 'SUCCESS') {
      return (
        <div>
          <div className={`${classes.expandableHeader} expandHeader`}>
            Payment Successful for&nbsp;
            <GetRedirectUrl row={row} className="success-text" isPeyme={this.props.isPeyme} isCrowdFunding={this.props.isCrowdFunding} />
          </div>
        </div>
      )
    } else if (row.status == 'DECLINED' || row.status == 'FAILED') {
      return (
        <div>
          <div className={`${classes.expandableHeader} expandHeader`}>
            Your customer's {row.method == 'bank' ? 'bank details' : 'credit card'} was {row.status == 'DECLINED' ? 'declined' : 'failed'} for{' '}
            <GetRedirectUrl row={row} className="declined-text" linkId isPeyme={this.props.isPeyme} isCrowdFunding={this.props.isCrowdFunding} />
          </div>
          <div
            className={`${classes.expandableSubHeader} expandSubHeader d-inline-flex align-items-center`}
          >
            <svg
              className="Icon me-1"
              viewBox="0 0 20 20"
              id="info"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 19a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-2a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm0-11a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 3a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0v-4a1 1 0 0 1 1-1z"></path>
            </svg>{' '}
            Your customer should be aware of the issue, but you may need to
            reach out to them if they don't successfully retry with another
            payment method.<br />
          </div>
          {row.failureReason && <div className={`${classes.expandableSubHeader}`} style={{paddingLeft:'25px'}}><b>Failure Reason:</b> {row.failureReason}</div>}
        </div>
      )
    } else if (row.status == 'REFUNDED') {
      return (
        <div>
          <div className={`${classes.expandableHeader} expandHeader`}>
            Refunded for&nbsp;
            <GetRedirectUrl row={row} className="refunded-text" isPeyme={this.props.isPeyme} isCrowdFunding={this.props.isCrowdFunding} />
          </div>
        </div>
      )
    } else if (row.status == 'PENDING') {
      return (
        <div>
          <div className={`${classes.expandableHeader} expandHeader`}>
            Payment is in progress for&nbsp;
            <GetRedirectUrl row={row} className="pending-text" linkId isPeyme={this.props.isPeyme} isCrowdFunding={this.props.isCrowdFunding} />
          </div>
        </div>
      )
    }
  }

  paymentListExpandableComponent = row => {
    const { classes } = this.props
    let currency = row.currency ? row.currency.symbol : '$'
    let account =
      row.ownAccount && row.ownAccount.accountNumber
        ? row.ownAccount.accountNumber.split('')
        : []
    account = account ? account.splice(0, account.length - 3, 'xxxx') : []
    account = account ? account.join('') : ''
    let style = {
      leftCol: {
        textAlign: 'right',
        fontSize: '16px',
        fontWeight: '500'
      },
      rightCol: {
        textAlign: 'left',
        fontSize: '16px',
        fontWeight: '500'
      },
      formRow: {
        padding: '10px'
      }
    }
    let { data, businessInfo,...filteredProps } = this.props
    const isRefundInitiated = (row.requests && row.requests.some((refundRequest) => (refundRequest.requestType === "refund" && refundRequest.status === "pending"))) || (row.refund && (row.refund.totalAmount >= row.amount));
    return (
      <div className="payment-list__item-container">
        {this.state.createRefundModalShow[row.index]['modal_' + row.index] && (
          <RefundModal
            data={row}
            open={
              this.state.createRefundModalShow[row.index]['modal_' + row.index]
            }
            styles={style}
            editMountRefund={this.state.editMountRefund}
            loading={this.state.refundLoding}
            postRefund={(postData, index) => this.postRefund(postData, index)}
            handleRefundModalClose={() =>
              this.handleRefundModalClose(row.index)
            }
            setEditRefund={value =>
              this.setState({ editMountRefund: !this.state.editMountRefund })
            }
            {...filteredProps}
            classes={`${this.props.classes}`}
          />
        )}
        <div
          className={`expandBody ${row.status}`}
        >
          {this.getHeaderOfExpandable(row)}
          <PaymentDetails row={row} {...this.props} account={account} />
          {row && row.paymentType && row.paymentType.toLowerCase() === 'peyme' &&
            <div className="remarks mt-3">
              <h6>Remarks:</h6>
              <p>{row && row.note}</p>
            </div>
          }
        </div>
        <div className="payment-list__footer">
          {(row.paymentType.toLowerCase() === "invoice"
            || row.paymentType.toLowerCase() === "peyme"
            || row.paymentType.toLowerCase() === "checkout"
            || row.paymentType.toLowerCase() === "funding") &&
            <Button
              color="primary"
              className="me-3"
              outline
              onClick={()=> this.onOpenReceiptMail(row,row.index)}
            >{`Resend ${row.paymentType.toLowerCase() === "peyme" ? 'Finance.Me' : row.paymentType.toLowerCase() === "funding" ? 'Give' : row.paymentType} Receipt`}</Button>
          }
          {row.refund && row.refund.isApplicable && row.status != 'PENDING' ? (
              <React.Fragment>
                {isRefundInitiated ?
                    <UncontrolledTooltip
                        placement="top"
                        target={`payment-record-refund-button-${row.uuid}`}>
                      {(row.refund && (row.refund.totalAmount >= row.amount)) ? "Amount already refunded" : "Already applied for refund"}
                    </UncontrolledTooltip> : null
                }
                <Button
                    color="primary"
                    outline
                    id={`payment-record-refund-button-${row.uuid}`}
                    className={isRefundInitiated ? "disabled" : ""}
                    onClick={() => {
                      if (isRefundInitiated) return;
                      this.handleRefundModalOpen(row.index)
                    }}
                    disabled={!_get(this.props, "paymentSettings.data.onBoardingRules.isRefundEnabled", false)}
                >Refund</Button>
              </React.Fragment>
          ) : ( '' )}
          <GetRedirectUrl row={row} viewButton="viewButton" isPeyme={this.props.isPeyme} isCrowdFunding={this.props.isCrowdFunding} />
        </div>
      </div>
    )
  }

  handleIsVerifiedEmail = (status) => {
    this.setState({
      isVerifiedEmail : status
    })
  }

  downloadCSV = async (response, type) => {
    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    let link
    link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `${type}s_${moment().format('D_MMM_YYYY_HH:mm:ss')}.csv`
    this.props.showSnackbar("Report Downloaded.", false)
    link.click()
  };

  handleExportReports = async () => {
    const filters = { ...this.state.filters };
    const query = queryString.parse(this.props.location.search)?.status;
    let type = ''

    if (!query || query === 'success') {
      type = 'payment'
    } else {
      type = query
    }

    if (filters.pageNo) {
      delete filters.pageNo
    }

    // Because only payments listing carries status based on tab names
    // Here we pass status param just as the name of selected tab which is only in the case of payments listing.
    // For payouts & refunds, status values are not like we've with selected tab.
    if (type !== 'payment' && filters.status) {
      delete filters.status
    }

    const filterObj = { ...filters, type };

    // Send only those keys which have values
    const formattedObj = Object.keys(filterObj).filter(key => (filterObj[key])).reduce((output, key) => {
      output[key] = filterObj[key];
      return output;
    }, {});

    const stringifiedFilter = queryString.stringify(formattedObj)
    try {
      const response = await PaymentService.exportPaymentItems(stringifiedFilter);
      if (response) {
        this.downloadCSV(response, type || 'Report')
      }
    } catch (error) {
      console.error("Error while exporting report:", error)
    }
  }

  payments = props => {
    let { classes, businessInfo } = props;
    let {openMail,openReceiptMail,invoiceData,receiptItem} = this.state;
    let data = [];
    props.data.map((d, i) => {
      data.push({
        id: d.id,
        status: d.status,
        method: d.method || d.paymentIcon,
        methodToDisplay: d.methodToDisplay || d.paymentIcon,
        paymentIcon: d.method === 'alipay' ? 'alipay' : d.paymentIcon,
        date: d.paymentDate,
        customer: `${d?.customer?.firstName || d?.customer?.lastName ? `${d?.customer?.firstName} ${d.customer.lastName}` : d?.customer?.email}`,
        totalAmount: d.amountBreakup.total,
        amountBreakup: d.amountBreakup,
        amount: d.amount,
        note: d.note,
        account: d.account,
        paymentType: d.paymentType,
        linkId: d[d.paymentType.toLowerCase()],
        ownAccount: d.ownAccount,
        index: i,
        refund: d.refund,
        other: d.other,
        currency: d.currency,
        card: d.card,
        bank: d.bank,
        invoiceId: d.invoiceId,
        peymeId: d.peymeId,
        checkoutId: d.checkoutId,
        payout: d.payout,
        failureReason: d.failureReason || '',
        data: d,
        uuid: d.uuid,
        riskScore: d.riskScore,
        requests: d.requests,
        rewardPoints: d?.rewardPoints,
        fundingId: d?.fundingId,
      })
    })
    return (
      <React.Fragment>
        <BootstrapTable
          className={`${classes.table} payments-list`}
          data={data}
          bordered={false}
          expandableRow={this.isPaymentListExpandable}
          expandRowClassName="payTableExpandRow"
          classes="py-table"
          options={{ expandRowBoxShadow: '0px 8px 32px red' }}
          trClassName={'py-table__row cursor-pointer'}
          expandComponent={this.paymentListExpandableComponent}
        >
          <TableHeaderColumn dataField="id" isKey hidden>
            Id
        </TableHeaderColumn>

          <TableHeaderColumn
            columnClassName={`${classes.tableColumn} py-table__cell`}
            className={`py-table__cell`}
            dataField="status"
            dataFormat={(cell, row) => {
              return this.statusFormatter(cell)
            }}
            width="180px"
          >
            Status
        </TableHeaderColumn>

          {/* <TableHeaderColumn
            columnClassName={`${classes.tableColumn} py-table__cell`}
            className={`py-table__cell`}
            dataField="paymentIcon"
            dataFormat={(cell, row) => {
              let icon = PaymentIcon[cell] ? PaymentIcon[cell] : cell
              return (
                <img
                  src={
                    process.env.REACT_APP_WEB_URL.includes('localhost') ? `/${icon}` : icon
                  }
                  width={cell === "sezzle" ? "23px" : "35px"}
                />
              )
            }}
            width="120px"
          >
            Method
        </TableHeaderColumn> */}

          <TableHeaderColumn
            columnClassName={`${classes.tableColumn} py-table__cell`}
            className={`py-table__cell`}
            dataField="date"
            dataFormat={(cell, row) => {
              return toDisplayDate(cell, true, 'MMM D, YYYY @ h:mm A')
            }}
          >
            Date
        </TableHeaderColumn>

          <TableHeaderColumn
            columnClassName={`${classes.tableColumn} py-table__cell`}
            className={`py-table__cell`}
            dataField="customer"
          >
            Customer
        </TableHeaderColumn>

        {/* <TableHeaderColumn
            columnClassName={`${classes.tableColumn} py-table__cell`}
            className={`py-table__cell`}
            dataField="riskScore"
            thStyle={{width:100}}
            tdStyle={{width:100}}
            dataFormat={(cell, row) => {
              return this.riskScore(cell)
            }}
          >
            Risk Score
        </TableHeaderColumn> */}

          <TableHeaderColumn
            columnClassName={`${classes.tableColumn} py-table__cell`}
            className={`py-table__cell-amount`}
            dataField="amount"
            thStyle={{width:150}}
            tdStyle={{width:150}}
            dataFormat={(cell, row) => {
              let currency = row.currency
              return (
                <div
                  className={`${classes.payments} payAmount ${row.status ===
                    'REFUNDED' && 'color-default'}`}
                  style={{ textAlign: 'right' }}
                >
                  {getAmountToDisplay(currency, cell)}
                </div>
              )
            }}
          >
            Amount
        </TableHeaderColumn>
        {
          this.state.activeKey === 'payments.success' ?
            <TableHeaderColumn
                columnClassName={`${classes.tableColumn} py-table__cell pe-4`}
                className={`py-table__cell-amount`}
                dataField="rewardPoints"
                thStyle={{width:150}}
                tdStyle={{width:150}}
                dataFormat={(cell, row) => {
                  return (
                    <div style={{ textAlign: 'right' }}>
                      {row?.rewardPoints ? <span>{row?.rewardPoints || 0}</span> : null}
                    </div>
                  )
                }}
              >
                <UncontrolledTooltip placement="top" target="reward_points" style={{maxWidth: "350px", padding: "10px"}}>
                  As a Premium user, earn points for travel, cashback, and crypto when you collect payments with Finance
                </UncontrolledTooltip>
                Points <small id='reward_points' className='fal fa-info-circle'></small>
            </TableHeaderColumn>
          : null
        }
        </BootstrapTable>
        <Pagination data={this.props.paymentMeta}
          type='payments'
          handlePaginationPage={this.handlePaginationPage}
          handlePaginationPageSize={this.handlePaginationPageSize} />
          <MailModal
            from={"Receipt"}
            type="paymentRecord"
            openMail={openMail}
            isVerifiedEmail={this.handleIsVerifiedEmail}
            mailData={invoiceData}
            receipt={receiptItem}
            onClose={this.onCloseMail.bind(this)}
            businessInfo={this.props.businessInfo}
          />
      </React.Fragment>
    )
  }

  handleRefundModalOpen = index => {
    let a = this.state.createRefundModalShow
    a[index]['modal_' + index] = true
    this.setState({ createRefundModalShow: a, isOpenRefund: true })
  }
  handleRefundModalClose = index => {
    let a = this.state.createRefundModalShow
    a[index]['modal_' + index] = false
    this.setState({ createRefundModalShow: a, isOpenRefund: false })
  }

  postRefund = (body, index) => {
    if (!!body.reason) {
      this.setState({ refundLoding: true });
      this.props
        .postNewRefund({
          refundInput: body
        })
        .then(res => {
          this.setState({ refundLoding: false })
          if (res.statusCode === 200) {
            this.handleRefundModalClose(index);
            this.props.fetchData(this.state.filters);
          }
        })
    } else {
      this.props.openGlobalSnackbar('Please select reason first.', true)
    }
  }

  refundListExpandableComponent = row => {
    const { classes } = this.props
    let currency = row.currency.symbol
    let account = !!row.ownAccount && !!row.ownAccount.accountNumber ? row.ownAccount.accountNumber.split('') : ""
    if (!!account) {
      account.splice(0, account.length - 3, 'xxxx')
      account = account.join('')
    }
    return (
      <div className={classes.paymentExpandable}>
        <div
          className={`expandBody ${row.status}`}
        >
          <div>
            <div className={`${classes.expandableHeader} expandHeader`}>
              Refunded for&nbsp;
              <GetRedirectUrl row={row} className="refunded-text" isPeyme={this.props.isPeyme} isCrowdFunding={this.props.isCrowdFunding} />

              <span>&nbsp;due to {row.reason}</span>
              {/* <Link to={row.paymentType.toLowerCase() == "invoice" ? "/app/invoices/view/" + row.linkId : '/app/sales/checkouts/edit/' + row.linkId}>{`${row.paymentType} #${row.other.invoiceNo}`}</Link> {row.reason ? 'due to ' + row.reason : ''} */}
            </div>
            <div className={`${classes.expandableSubHeader} expandSubHeader`}>
              <i className="fal fa-info-circle" /> Refunded on{' '}
              {_displayDate(row.date, 'MMMM DD, YYYY')}
            </div>
          </div>
          {/* {
						this.getHeaderOfExpandable(row)
					} */}
          <PaymentDetails row={row} {...this.props} account={account} />
        </div>
        <div className="d-flex justify-content-end py-3">
          <Link to={'/app/payments/view-payment/' + row.paymentId}>
            <Button color="primary" outline className="me-2">View Original Payment</Button>
          </Link>
          <GetRedirectUrl row={row} viewButton="viewButton" isPeyme={this.props.isPeyme} isCrowdFunding={this.props.isCrowdFunding} />
        </div>
      </div>
    )
  }

  refunds = props => {
    let { classes } = props
    let data = []
    if (props.refundList) {
      props.refundList.map((d, i) => {
        data.push({
          id: d.id,
          status: d.status,
          method: d.method || d.paymentIcon,
          paymentIcon: d.paymentIcon,
          date: d.refundDate,
          customer: `${d.customer.firstName} ${d.customer.lastName}`,
          amount: d.amount,
          paymentType: d.paymentType,
          linkId: d[d.paymentType && d.paymentType.toLowerCase()],
          ownAccount: d.ownAccount,
          index: i,
          card: d.card,
          bank: d.bank,
          invoiceId: d.invoiceId,
          checkoutId: d.checkoutId,
          account: d.account,
          reason: d.reason,
          paymentId: d.payment.id,
          currency: d.currency,
          other: d.other,
          isRefund: true,
          payout: d.payout
        })
      })
    }
    return (
      <React.Fragment>
        {
          !_get(props, "paymentSettings.data.onBoardingRules.isRefundEnabled", false) ?
            <Alert color="danger"
              className="alertReciept alert-action alert-danger justify-content-start mt-4">
              <div className="alert-icon">
                <svg
                  viewBox="0 0 20 20"
                  className="Icon__M me-2"
                  id="info"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 19a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-2a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm0-11a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 3a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0v-4a1 1 0 0 1 1-1z" />
                </svg>
              </div>
              <div className="alert-content">
                <div className="alert-desc">{_get(props, "paymentSetFtings.data.providerName", "")} Refund is not supported by provider.</div>
              </div>
            </Alert>
          : null
        }
        <BootstrapTable
          className={`${classes.table}`}
          data={data}
          bordered={false}
          expandableRow={this.isPaymentListExpandable}
          trClassName={'py-table__row'}
          classes={'py-table--condensed'}
          expandComponent={this.refundListExpandableComponent}
        >
          <TableHeaderColumn dataField="id" isKey hidden>
            Id
        </TableHeaderColumn>

          <TableHeaderColumn
            columnClassName={`${classes.tableColumn} py-table__cell`}
            className={`py-table__cell`}
            dataField="status"
            dataFormat={(cell, row) => {
              return this.statusFormatter(cell)
            }}
            width="180px"
          >
            Status
        </TableHeaderColumn>

          <TableHeaderColumn
            columnClassName={`${classes.tableColumn} py-table__cell`}
            className={`py-table__cell`}
            style={{
              width: 'max-content'
            }}
            dataField="paymentIcon"
            dataFormat={(cell, row) => {

              let icon = PaymentIcon && PaymentIcon[cell] ? PaymentIcon[cell] : cell
              return <img src={icon} width="35px" />
            }}
            width="120px"
          >
            Method
        </TableHeaderColumn>

          <TableHeaderColumn
            columnClassName={`${classes.tableColumn} py-table__cell`}
            className={`py-table__cell`}
            style={{ width: 'max-content' }}
            dataField="date"
            dataFormat={(cell, row) => {
              return toDisplayDate(cell, true, 'MMM D, YYYY @ h:mm A')
            }}
          >
            Date
        </TableHeaderColumn>

          <TableHeaderColumn
            columnClassName={`${classes.tableColumn} py-table__cell`}
            className={`py-table__cell`}
            style={{ width: 'max-content' }}
            dataField="customer"
          >
            Customer
        </TableHeaderColumn>
          <TableHeaderColumn
            columnClassName={`${classes.tableColumn} py-table__cell`}
            className={`py-table__cell-amount text-right`}
            dataField="totalAmount"
            dataFormat={(cell, row) => {
              let currency = row && row.currency
              return (
                <div
                  className={`${classes.payments} color-default`}
                  style={{ textAlign: 'right' }}
                >
                  {getAmountToDisplay(currency, row && row.amount)}
                </div>
              )
            }}
          >
            Amount
        </TableHeaderColumn>
        </BootstrapTable>
        <Pagination data={this.props.refundMeta}
          type='refunds'
          handlePaginationPage={this.handlePaginationPage}
          handlePaginationPageSize={this.handlePaginationPageSize} />
      </React.Fragment>
    )
  }

  render() {
    const { classes, isLoaing, bankingSetupSkipped, paymentSettings: { data } } = this.props;
    const { startDate, endDate } = this.state;
    const currentTab = queryString.parse(this.props.location.search)?.status;
    let Payments = this.payments
    let Refunds = this.refunds

    const isPayoutHidden = true; 

    return (
      <div className="content-wrapper__main PaymentList__Container">
        {!this.props.isPeyme && !this.props.isCrowdFunding ? (
          <div>
            <header className="py-header--page flex">
              <div className="py-header--title">
                <h2 className="py-heading--title">Payments</h2>
              </div>
            </header>
            <div className="payments-filter-container">
              <div className="payments-filter__search">
                <InputGroup>
                  <FormControl
                    placeholder="Search by customer, cardholder or amount"
                    aria-describedby="basic-addon2"
                    onChange={this.handleSearch}
                    value={this.state.filters.text}
                  />
                  {
                      !!this.state.filters.text && (
                          <a className="btn-close icon me-2 cross-placeholder cross-payment-placeholder" href="javascript:void(0)" id="reset"
                              onClick={() => {
                                this.setState((prevState) => ({
                                  prevState,
                                  filters: { ...prevState.filters, text: '' },
                                }), () => {
                                  this.handleSearchClick();
                                })
                              }
                            }
                          >
                              <svg viewBox="0 0 20 20" className="py-svg-icon" id="cancel" xmlns="http://www.w3.org/2000/svg"><path d="M11.592 10l5.078 5.078a1.126 1.126 0 0 1-1.592 1.592L10 11.592 4.922 16.67a1.126 1.126 0 1 1-1.592-1.592L8.408 10 3.33 4.922A1.126 1.126 0 0 1 4.922 3.33L10 8.408l5.078-5.078a1.126 1.126 0 0 1 1.592 1.592L11.592 10z"></path></svg>
                          </a>
                      )
                  }
                    <InputGroup.Text onClick={this.handleSearchClick} className={classes.addonSearch} style={{ borderRight: '1px solid #b2c2cd' }}>
                      <i class="fal fa-search" aria-hidden="true"/>
                    </InputGroup.Text>
                </InputGroup>
              </div>

              <div className="payments-filter__datepicker">
                <div className="DateRange__control">
                  <DatepickerWrapper
                    className="form-control"
                    popperPlacement="top-end"
                    selected={startDate ? _toDateConvert(startDate) : ''}
                    strictParsing
                    onChange={date => this.handleDateChange(date, 'startDate')}
                    maxDate={endDate ? _toDateConvert(endDate) : ''}
                    placeholderText="From"
                    key={`from-${startDate || ''}`}
                  />
                  <span className="mx-1">&nbsp;</span>
                  <DatepickerWrapper
                    className="form-control"
                    popperPlacement="top-end"
                    selected={endDate ? _toDateConvert(endDate) : ''}
                    openToDate={startDate ? _toDateConvert(startDate) : ''}
                    strictParsing
                    onChange={date => this.handleDateChange(date, 'endDate')}
                    placeholderText="To"
                    minDate={startDate ? _toDateConvert(startDate) : ''}
                    key={`to-${endDate || ''}`}
                  />
                  <span className="mx-1">&nbsp;</span>
                  <span className="fillter__action__btn" role="button" id="reset-btn"
                    onClick={() => this.clearDate()}>
                    <ReactSVG
                      src={icCancelSvg}
                      afterInjection={(error, svg) => {
                        if (error) {
                          return
                        }
                      }}
                      beforeInjection={svg => {
                        svg.classList.add('Icon')
                      }}
                      evalScripts="always"
                      fallback={() => <span className='fa fa-refresh'></span>}
                      loading={() => <span className='fa fa-refresh fa-spin'></span>}
                      renumerateIRIElements={false}
                      className="Icon"
                    />
                  </span>
                  <Tooltip placement="right" isOpen={this.state.tooltipOpen} target="reset-btn"
                    toggle={this.toggle}>
                    Reset date
                  </Tooltip>
                </div>
              </div>
              <span className="mx-4">&nbsp;</span>
              {/* Show export button only if there is data and also doesn't show for Disputes or Failed tab */}
              {this.props.data && this.props.data.length > 0 && currentTab !== 'disputes' && currentTab !== 'failed' && <Button className='filter-icon-button' id='exportButton' color="secondary" onClick={this.handleExportReports}><i className="fal fa-download"></i></Button>}
            </div>
            <div className="pd0 mg-t-30 payments-list-area-content">
              <Tabs
                defaultActiveKey="payments"
                className="py-nav--tabs"
                id="uncontrolled-tab-example"
                onSelect={this.onTabChangeFromTab}
                activeKey={this.state.activeKey}
              >
                <Tab
                  className={classes.tabBody}
                  eventKey="payments"
                  title="All"
                >
                  {isLoaing ? <CenterSpinner /> : this.state.activeKey === "payments" ? <Payments {...this.props} /> : ''}
                </Tab>
                <Tab
                  className={classes.tabBody}
                  eventKey="payments.success"
                  title="Successful"
                >
                  {isLoaing ? <CenterSpinner /> : this.state.activeKey === "payments.success" ? <Payments {...this.props} /> : ''}
                </Tab>
                <Tab
                  className={classes.tabBody}
                  eventKey="payments.failed"
                  title="Failed"
                >
                  {isLoaing ? <CenterSpinner /> : this.state.activeKey === "payments.failed" ? <Payments {...this.props} /> : ''}
                </Tab>
                <Tab className={classes.tabBody} eventKey="payments.refund" title="Refunds">
                  {isLoaing ? <CenterSpinner /> : <Refunds {...this.props} />}
                </Tab>
                {isPayoutHidden ? null
                  :
                  <Tab className={classes.tabBody} eventKey="payments.payout" title="Payouts">
                    {isLoaing ? <CenterSpinner /> : <Payouts isUnderPaymentSection {...this.props} isVerifiedEmail={this.state.isVerifiedEmail} handleSearchURL={this.handleSearchURL} />}
                  </Tab>
                }

                {
                  _get(data, "onBoardingRules.isDisputeEnabled", false) ?
                    <Tab
                      className={classes.tabBody}
                      eventKey="payments.disputes"
                      title="Disputes"
                    >
                      {isLoaing ? <CenterSpinner /> : this.state.activeKey === "payments.disputes" ? <Disputes {...this.props} /> : ''}
                    </Tab>
                  : null
                }
              </Tabs>
            </div>
          </div>
        ) :
          isLoaing ? <CenterSpinner /> : <Payments {...this.props} />
        }

      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    refundStatus: state.paymentReducer,
    refundList: state.paymentReducer.refundRecords,
    businessInfo: state.businessReducer.selectedBusiness,
    paymentSettings: state.paymentSettings,
  }
}

export default withRouter(compose(
  withStyles(styles),
  connect(mapStateToProps, { postNewRefund , openGlobalSnackbar })
)(PaymentRecords))
