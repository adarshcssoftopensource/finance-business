import React, { Component, Fragment } from 'react'
import compose from 'recompose/compose'
import qs from 'qs'
import { connect } from 'react-redux'
import { UncontrolledTooltip } from "reactstrap";
import { withRouter, NavLink } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { openGlobalSnackbar } from '../../../../../actions/snackBarAction'
import { toDisplayDate } from '../../../../../utils/common'
import CenterSpinner from '../../../../../global/CenterSpinner';
import Pagination from '../../payments/components/pagination/pagination';

import rewardService from '../../../../../api/rewardService';
import { getAmountToDisplay } from "../../../../../utils/GlobalFunctions";


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
})

class RewardHistory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rewards: [],
      isLoading: false,
      pageNo: 1,
      pageSize: 10,
      balance: {},
    };
  }

  async componentDidMount() {
    await this.fetchBusinessRewardBalance();
    await this.fetchBusinessEarnRewardHistory();
  }

  fetchBusinessEarnRewardHistory = async () => {
    this.setState({ isLoading: true });
    const queryString = qs.stringify({
      pageNo: this.state.pageNo,
      pageSize: this.state.pageSize,
    })
    await rewardService.getEarnRewardHistory(queryString)
        .then(response => {
          this.setState({ isLoading: false });
          if (response?.result?.statusCode === 200) {
            this.setState({ rewards: response?.result?.data?.rewards || [], disputeMeta: response?.result?.data?.meta });
          } else {
            this.props.openGlobalSnackbar(response.message, true)
          }
        })
        .catch(error => {
          this.setState({ isLoading: false });
          this.props.openGlobalSnackbar(error.message, true)
        })
  }

  capitalize = (word) => {
    return word[0].toUpperCase() + word.slice(1).toLowerCase();
  }

  statusFormatter = (status) => {
    let type = 'success'
    if (status == 'processed') {
      type = 'success'
      status = 'Available'
    } else if (status == 'pending') {
      type = 'warning'
    } else if (status == 'canceled') {
      type = 'alert'
    } else if (status == 'redeemed') {
      type = 'grey'
    } else if (status == 'expired') {
      type = 'danger'
    }
    return <span className={`badge badge-${type}`}>{this.capitalize(status)}</span>
  }

  reasonFormatter = (reason, rewardType, referenceId) => {
    const rewardTypeSplit = rewardType.split(".")
    const reasonFor = rewardTypeSplit.includes('peyme') ? 'Peyme' : rewardTypeSplit.includes('checkout') ? 'Checkout' : rewardTypeSplit.includes('adjustments') ? 'Adjustments': 'Invoice'
    const reasonSplit = reason?.split(reasonFor)
    const linkFor = reasonSplit?.length > 1 ? reasonSplit?.[1].trim() : ''
    const passFeeText = rewardTypeSplit.includes('pass_fee') ? 'pf.enbaled' : rewardTypeSplit.includes('adjustments') ? 'adjustments' : 'pf.disabled'
    if (reasonFor !== 'Invoice' && linkFor && reason) {
      return (
        <span>
          {reasonFor === 'Peyme' ? 'Finance.Me' : reasonFor}&nbsp;<NavLink to={`/app/payments/view-payment/${referenceId}`}>{reasonSplit?.[1]?.trim()}</NavLink>&nbsp;{passFeeText}
        </span>
      )
    } else if (reasonFor === 'Invoice' && reason) {
      return (
        <span>
          <NavLink to={`/app/payments/view-payment/${referenceId}`}>{reason}</NavLink>&nbsp;{passFeeText}
        </span>
      )
    } else if (reasonFor === 'Adjustments' && reason) {
      return (
        <span>
          {reasonFor}:&nbsp;{reason}
        </span>
      )
    }
    return reason;
  }

  handlePaginationPage = (pageNumber) => {
    this.setState({ pageNo: pageNumber }, async () => {
      await this.fetchBusinessEarnRewardHistory();
    })
  }

  handlePaginationPageSize = (pageSize) => {
    this.setState({ pageSize }, async () => {
      await this.fetchBusinessEarnRewardHistory();
    })
  }

  fetchBusinessRewardBalance = async () => {
    this.setState({ isLoading: true });
    await rewardService.getRewardBalance()
        .then(response => {
          this.setState({ isLoading: false });
          if (response?.result?.statusCode === 200) {
            this.setState({ balance: response?.result?.data?.balance || {} });
          } else {
            this.props.openGlobalSnackbar(response?.result?.message, true)
          }
        })
        .catch(error => {
          this.setState({ isLoading: false });
          this.props.openGlobalSnackbar(error.message, true)
        })
  }

  render () {
    if (this.state.isLoading) {
      return <CenterSpinner />
    }
    const { balance } = this.state;
    return (
      <Fragment>
        <div className='content-wrapper__main RewardHistoryWrapper'>
          <header className="py-header--page">
            <div className="py-header--title">
              <h1 className="py-heading--title">Finance Membership Rewards ~ History</h1>
            </div>
          </header>
          <div className={`row my-5`}>
            <div className='col-6'>
              <div className='card p-4'>
                <div className='d-flex flex-row justify-content-between'>
                  <h4 className='card-title mb-0'>Available</h4>
                  <div className='card-balance text-center'>
                    {balance?.availablePoints || 0} <small><sup>PTS</sup></small>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-6'>
              <div className='card p-4'>
                <div className='d-flex flex-row justify-content-between'>
                  <UncontrolledTooltip placement="bottom" target="pending_points">Points accumulate between the 1st and the end of the month, minus refunds, disputes, and adjustments.</UncontrolledTooltip>
                  <h4 className='card-title mb-0'>Pending <small id='pending_points' className='fal fa-info-circle'></small></h4>
                  <div className='card-balance text-center'>{balance?.pendingPoints || 0} <small><sup>PTS</sup></small></div>
                </div>
              </div>
            </div>
          </div>
          <div className="tab-content tab-container p-0">
            <div className="tab-pane tab-panel active">
              <div className="reward-history-list-table tab-unpaid">
                <div>
                  <div className="react-bootstrap-table">
                    <table className="table table-hover table-bordered py-table py-table--condensed">
                      <thead>
                        <tr>
                          <th tabindex="0">Status</th>
                          <th tabindex="0">Earned Date</th>
                          <th tabindex="0">Description</th>
                          <th tabindex="0">Amount</th>
                          <th tabindex="0">Points</th>
                        </tr>
                      </thead>
                      <tbody>
                      {
                          (this.state.rewards || []).map((reward) => (
                            <tr className="py-table__row">
                              <td className="py-table__cell">
                                {this.statusFormatter(reward?.status)}
                              </td>
                              <td className="py-table__cell">
                                <div className="py-table__cell-content popover_wrapper">
                                  {toDisplayDate(reward?.createdAt, false)}
                                </div>
                              </td>
                              <td className="py-table__cell">
                                <div className="py-table__cell-text">
                                  {this.reasonFormatter(reward?.reason, reward?.rewardTemplate?.rewardName, reward?.referenceId) || reward?.description}
                                </div>
                              </td>
                              <td className='py-table__cell-amount'>
                                <div className="amount-cell">{reward?.rewardSnapshot?.amount ? getAmountToDisplay(reward?.currency, reward?.rewardSnapshot?.amount) : ''}</div>
                              </td>
                              <td className='py-table__cell-amount'>
                                <div className="amount-cell">
                                  <span id={`earned_reward_points_${reward?.id}`}>{reward?.points}</span>
                                </div>
                              </td>
                            </tr>
                          ))
                        }
                        {
                          (this.state.rewards || []).length === 0 ?
                            <tr className="py-table__cell">
                              <td className="text-center" colSpan={6}>No data available</td>
                            </tr>
                          : null
                        }
                      </tbody>
                    </table>
                  </div>
                  <Pagination data={this.state.disputeMeta}
                    type='payments'
                    handlePaginationPage={this.handlePaginationPage}
                    handlePaginationPageSize={this.handlePaginationPageSize}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    )
  }
}

const mapStateToProps = state => {
  return {
    businessInfo: state.businessReducer.selectedBusiness
  }
}

export default withRouter(compose(
  withStyles(styles),
  connect(mapStateToProps, { openGlobalSnackbar })
)(RewardHistory))