import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import { withStyles } from '@material-ui/core/styles';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import {
  getPaymentById,
  getRefundByPaymentId,
  postNewRefund
} from '../../../../../actions/paymentAction';
import { _documentTitle } from '../../../../../utils/GlobalFunctions';
import { PaymentDetails } from './PaymentDetails';
import { RefundModal } from './RefundModal';
import { openGlobalSnackbar } from '../../../../../actions/snackBarAction';
import { _displayDate } from '../../../../../utils/globalMomentDateFunc';
import GetRedirectUrl from '../common/paymentTypeRedirection';

const styles = theme => ({
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
    paddingTop: '22px',
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
  }
})

class ViewPayment extends PureComponent {
  state = {
    modal_0: false,
    editMountRefund: true,
    row: null,
    refundLoding: false,
  }

  componentDidMount() {
    this.props.getPayment(this.props.match.params.id)
    _documentTitle({}, 'Payment details')
    // this.props.getRefundByPaymentId(this.props.match.params.id);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      if (this.props.paymentInfo !== nextProps.paymentInfo) {
        const { paymentInfo } = nextProps
        if (paymentInfo) {
          const row = {
            id: paymentInfo.id,
            status: paymentInfo.status,
            method: paymentInfo.method,
            methodToDisplay: paymentInfo.methodToDisplay,
            paymentIcon: paymentInfo.method === 'alipay' ? 'alipay' : paymentInfo.paymentIcon,
            date: paymentInfo.paymentDate.successDate,
            customer: `${paymentInfo.customer.firstName} ${paymentInfo.customer.lastName}`,
            totalAmount: paymentInfo.amount.total,
            amount: paymentInfo.amount,
            account: paymentInfo.account,
            paymentType: paymentInfo.paymentType,
            linkId:
              paymentInfo.paymentType === 'Invoice'
                ? paymentInfo.invoiceId
                : paymentInfo.refundId,
            ownAccount: paymentInfo.ownAccount,
            index: 0,
            amountBreakup: paymentInfo.amountBreakup,
            refund: paymentInfo.refund,
            other: paymentInfo.other,
            currency: paymentInfo.currency || { symbol: '$' },
            card: paymentInfo.card,
            bank: paymentInfo.bank,
            invoiceId: paymentInfo.invoiceId,
            checkoutId: paymentInfo.checkoutId,
            payout: paymentInfo.payout
          }
          this.setState({ row })
        } else {
          this.props.getRefundByPaymentId(this.props.match.params.id)
        }
      }
    }
  }

  handleRefundModalOpen = index => {
    let a = {}
    a['modal_' + index] = true
    this.setState(a)
  }
  handleRefundModalClose = index => {
    let a = {}
    a['modal_' + index] = false
    this.setState(a)
  }

  RefundModal = props => {
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

    return (
      <RefundModal
        open={this.state['modal_' + props.data.index]}
        styles={style}
        loading={this.state.refundLoding}
        editMountRefund={this.state.editMountRefund}
        postRefund={(postData, index) => this.postRefund(postData, index)}
        handleRefundModalClose={() =>
          this.handleRefundModalClose(props.data.index)
        }
        setEditRefund={value =>
          this.setState({ editMountRefund: !this.state.editMountRefund })
        }
        {...props}
        classes={`${this.props.classes}`}
      />
    )
  }

  postRefund = async (body, index) => {
    if (!!body.reason) {
      try {
        this.setState({ refundLoding: true });
        this.props.postRefund({
          refundInput: body
        })
          .then((res) => {
            this.setState({ refundLoding: false })
            this.handleRefundModalClose(index)
          }).catch((error)=>{
          this.setState({ refundLoding: false })
        });

      } catch (error) {

      }
    } else {
      this.props.openGlobalSnackbar('Select reason first.', true)
    }
  }


  getHeaderOfExpandable = row => {
    const { classes } = this.props;
    if (row.status == 'SUCCESS') {
      return (
        <div>
          <div className={classes.expandableHeader}>
            Payment Successful for&nbsp;
            <GetRedirectUrl row={row} className="success-text" />
          </div>
          {/* <div className={classes.expandableSubHeader}>
            <i className="fal fa-info-circle" /> {row.payout && row.payout.isPaid ? 'Payout issued on ' : 'Payout scheduled for '}
            {_displayDate(row.payout ? row.payout.timeline.arrivalDate : new Date(), 'MMMM DD, YYYY')}
          </div> */}
        </div>
      )
    } else if (row.status == 'DECLINED' || row.status == 'FAILED') {
      return (
        <div>
          <div className={classes.expandableHeader}>
            Your customer's {row.method == 'bank' ? 'bank details' : 'credit card'} was {row.status == 'DECLINED' ? 'declined' : 'failed'} for{' '}
            <GetRedirectUrl row={row} className="declined-text" linkId/>
            {/* <Link
              className="declined-text"
              to={
                row.paymentType && row.paymentType.toLowerCase() == 'invoice'
                  ? '/app/invoices/view/' + row.linkId
                  : '/app/sales/checkouts/edit/' + row.linkId
              }
            >
              {row.paymentType}
            </Link> */}
          </div>
          <div className={classes.expandableSubHeader}>
            <i className="fal fa-info-circle" /> Your customer should be aware
            of the issue, but you may need to reach out to them if they don't
            successfully retry with another payment method.
          </div>
        </div>
      )
    } else if (row.status == 'REFUNDED') {
      return (
        <div>
          <div className={classes.expandableHeader}>
            Refunded for&nbsp;
            <GetRedirectUrl row={row} className="refunded-text" />
          </div>
          <div className={classes.expandableSubHeader}>
            <i className="fal fa-info-circle" /> Paid out on{' '}
            {_displayDate(row.date, 'MMMM DD, YYYY')}
          </div>
        </div>
      )
    } else if (row.status == 'PENDING') {
      return (
        <div>
          <div className={classes.expandableHeader}>
            Payment is in progress for&nbsp;
            <GetRedirectUrl row={row} className="pending-text" />
          </div>
        </div>
      )
    }
  }

  render() {
    const { classes, paymentInfo } = this.props
    const { row } = this.state
    let account, statusClass
    if (row) {
      if (row.status === 'SUCCESS') {
        statusClass = classes.paymentExpandableBodySuccess
      } else if (row.status === 'REFUNDED' || row.status === 'FAILED') {
        statusClass = classes.paymentExpandableBodyRefunded
      } else if (row.status === 'DECLINED') {
        statusClass = classes.paymentExpandableBodyDeclined
      }
    }

    let RefundModal = this.RefundModal
    if (row && paymentInfo) {
      if (row.ownAccount && Object.keys(row.ownAccount).length > 0) {
        account = row.ownAccount.maak
      }
      return (
        // <div>
        <div className="content-wrapper__main">
          <header className="py-header--page flex">
            <div className="py-header--title">
              <h2 className="py-heading--title">Payment details</h2>
            </div>
          </header>
          {/* <h2 className="py-heading--title">Payment details</h2> */}
          <div
            className={classes.paymentExpandable}
            style={{
              minWidth: '950px',
              marginRight: 'auto',
              marginLeft: 'auto',
              // padding: '10px',
              borderRadius: '8px 8px 8px 8px',
            }}
          >
            <RefundModal data={row} />
            <div
              className={`expandBody ${row.status}`}
              style={{
                borderRadius: '8px 8px 8px 8px',
              }}
            >
              {this.getHeaderOfExpandable(row)}
              <PaymentDetails row={row} {...this.props} account={account} />
            </div>
            <div className={`${classes.paymentFooter} payment-list__footer`}>
              {row.refund && row.refund.isApplicable && row.status != 'PENDING' ?
                (<Button
                    color="primary"
                    outline
                    onClick={() => {
                        this.handleRefundModalOpen(row.index)
                    }}
                >Refund</Button> ) : ( '' )}
                <GetRedirectUrl row={row} viewButton="viewButton" linkId/>
              {/* <Link
                to={
                  row.paymentType.toLowerCase() == 'invoice'
                    ? '/app/invoices/view/' + row.linkId
                    : '/app/sales/checkouts/edit/' + row.linkId
                }
              >
                <Button color="primary" >
                  View {row.paymentType}
                </Button>
              </Link> */}
            </div>
          </div>
        </div>
        // </div>
      )
    } else {
      return (
        <div>
          <div className="mrT50 text-center">
            <div
              className="spinner-border spinner-border-lg text-primary"
              role="status"
            >
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        </div>
      )
    }
  }
}

const mapStateToProps = state => {
  return {
    paymentInfo: state.paymentReducer.paymentInfo,
    refundInfo: state.paymentReducer.refundInfo
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getPayment: body => {
      dispatch(getPaymentById(body))
    },
    getRefundByPaymentId: body => {
      dispatch(getRefundByPaymentId(body))
    },
    postRefund: body => {
      dispatch(postNewRefund(body))
    },
    openGlobalSnackbar: (message, error) => {
      dispatch(openGlobalSnackbar(message, error))
    }
  }
}

export default compose(
  withStyles(styles, { name: 'Payments' }),
  connect(mapStateToProps, mapDispatchToProps)
)(ViewPayment)
