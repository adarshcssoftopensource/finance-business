import React, { Fragment, Component } from 'react'
import { Button } from 'reactstrap';
import { withStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import compose from 'recompose/compose'
import { connect } from 'react-redux'
import 'react-bootstrap-typeahead/css/Typeahead.css'
import * as PaymentIcon from '../../../../../global/PaymentIcon'
import {
  getRefundByPaymentId,
  getRefundById
} from '../../../../../actions/paymentAction'
import {
  getAmountToDisplay
} from '../../../../../utils/GlobalFunctions'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
import { PaymentDetails } from './PaymentDetails'
import { toDisplayDate } from '../../../../../utils/common'
import { _displayDate } from '../../../../../utils/globalMomentDateFunc'
import GetRedirectUrl from '../common/paymentTypeRedirection';

const styles = theme => ({

  paymentExpandableBodySuccess: {
    padding: '14px',
    background: '#fcfbe3'
  },
  paymentExpandableBodyDeclined: {
    padding: '14px',
    background: '#fcfbe3'
  },
  viewInvoiceButton: {
    color: '#fff',
    background: '#136acd',
    border: '1px solid transparent',
    padding: '6px 20px',
    textAlign: 'center',
    minWidth: '100px',
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
    color: '#136acd',
    background: '#fff',
    border: '1px solid transparent',
    padding: '6px 20px',
    textAlign: 'center',
    minWidth: '100px',
    borderRadius: '500px',
    display: 'inline-block',
    boxSizing: 'border-box',
    verticalAlign: 'middle',
    outline: 0,
    margin: '10px',
    '&:hover': {
      border: '1px solid #136acd'
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
    marginBottom: '27px',
    color: 'dimgrey',
    whiteSpace: 'initial'
  },
  myAccount: {
    width: '260px',
    height: '150px',
    background: 'linear-gradient(25deg, #013aff, #7f92ff)',
    borderRadius: '16px',
    textAlign: 'left',
    paddingTop: '18%',
    fontSize: '15px',
    fontWeight: '600',
    color: 'white',
    paddingLeft: '22px'
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
    maxWidth: '70px',
    marginTop: '-2px',
    marginRight: '4px',
    marginLeft: '4px',
    maxHeight: '28px',
    '&:disabled': {
      border: '0px',
      width: '50px',
      backgroundColor: 'transparent',
      marginTop: '-2px'
    }
  },
  payments: {
    color: '#0ea90e',
    fontSize: '16px',
    fontWeight: '500'
  },
})

class ViewRefund extends Component {
  state = {
    modal_0: false,
    editMountRefund: true,
    isSingleRefund: true
  }

  componentDidMount() {
    const { path } = this.props.match
    if (path.includes('payments/refunds')) {
      this.props.getRefundById(this.props.match.params.id)
    } else {
      this.setState({ isSingleRefund: false })
      this.props.getRefundByPaymentId(this.props.match.params.id)
    }


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
    } else if (status == 'REFUNDED') {
      type = 'alert'
    } else if (status == 'PENDING') {
      type = 'gray'
    }
    return `<div class='badge badge-${type}'>${this.capitalize(status)}</div>`
  }

  refundListExpandableComponent = row => {
    const { classes } = this.props
    let currency = row.currency.symbol
    let account;
    if (row.ownAccount) {
      account = row.ownAccount.mask
    }
    return (
      <div className={classes.paymentExpandable}>
        <div
          className={`expandBody ${row.status}`}
        >
          <div>
            <div className={`${classes.expandableHeader} expandHeader`}>
              Refunded for&nbsp;
              <GetRedirectUrl row={row} className="refunded-text" />
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
            <Button color="primary" className="me-2">View Original Payment</Button>
          </Link>
          <GetRedirectUrl row={row} className="refunded-text" viewButton="viewButton"/>
        </div>
      </div>
    )
  }

  refundData = (d, i) => {
    return {
      id: d.id,
      status: d.status,
      method: d.method,
      methodToDisplay: d.methodToDisplay,
      paymentIcon: d.paymentIcon,
      date: d.refundDate,
      customer: `${d.customer.firstName} ${d.customer.lastName}`,
      amount: d.amount,
      paymentType: d.paymentType,
      linkId: d[d.paymentType.toLowerCase()],
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
      other: d.other
    }
  }
  refunds = props => {
    let { classes } = props
    let data = []
    const { refundList } = this.props
    if (refundList) {
      if (refundList && refundList.length > 0) {
        refundList.map((d, i) => {
          data.push(this.refundData(d, i))
        })
      }
    }
    return (
      <BootstrapTable
        className={`${classes.table}`}
        data={data}
        bordered={false}
        expandableRow={this.isPaymentListExpandable}
        trClassName={'py-table__row'}
        classes={'py-table--condensed'}
        expandComponent={this.refundListExpandableComponent}
        pagination
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
          width="200px"
        >
          Status
        </TableHeaderColumn>

        <TableHeaderColumn
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
        </TableHeaderColumn>

        <TableHeaderColumn
          columnClassName={`${classes.tableColumn} py-table__cell`}
          className={`py-table__cell`}
          dataField="date"
          dataFormat={(cell, row) => {
            return toDisplayDate(cell, true, 'MMM D, YYYY @ HH:mm A')
          }}
        >
          Refund Date
        </TableHeaderColumn>

        <TableHeaderColumn
          columnClassName={`${classes.tableColumn} py-table__cell`}
          className={`py-table__cell`}
          dataField="customer"
        >
          Customer
        </TableHeaderColumn>
        <TableHeaderColumn
          columnClassName={`${classes.tableColumn} py-table__cell`}
          className={`py-table__cell-amount text-right`}
          dataField="totalAmount"
          dataFormat={(cell, row) => {
            let currency = row.currency
            return (
              <div
                className={`${classes.payments} payAmount ${row.status ===
                  'REFUNDED' && 'color-default'}`}
                style={{ textAlign: 'right' }}
              >
                {getAmountToDisplay(currency, row.amount)}
              </div>
            )
          }}
        >
          Refund Amount
        </TableHeaderColumn>
      </BootstrapTable>
    )
  }

  render() {
    const { isSingleRefund } = this.state
    let Refunds = this.refunds
    let SingleRefund = null
    let refundInfo = null
    if (this.props.refundInfo && this.props.refundInfo.refund) {
      refundInfo = this.props.refundInfo ? this.refundData(this.props.refundInfo.refund, 0) : null
      SingleRefund = this.refundListExpandableComponent(refundInfo)
    }else if (this.props.refundInfo) {
      refundInfo = this.props.refundInfo ? this.refundData(this.props.refundInfo, 0) : null
      SingleRefund = this.refundListExpandableComponent(refundInfo)
    }


    return (
      <div class="content-wrapper__main">
        <header className="py-header--page" >
          <h1 className="py-heading--title" >Payment details</h1>
        </header>
        {isSingleRefund ?
          refundInfo && SingleRefund
        :
        <Refunds {...this.props} />
        }


      </div>
    )
  }
}

const mapStateToProps = state => {

  return {
    refundInfo: state.paymentReducer.refundInfo,
    refundList: state.paymentReducer.refundList
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getRefundByPaymentId: body => {
      dispatch(getRefundByPaymentId(body))
    },
    getRefundById: body => {
      dispatch(getRefundById(body))
    }
  }
}

export default compose(
  withStyles(styles, { name: 'Refunds' }),
  connect(mapStateToProps, mapDispatchToProps)
)(ViewRefund)
