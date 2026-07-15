import React, { Component, Fragment } from 'react'
import compose from 'recompose/compose'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
import { openGlobalSnackbar } from '../../../../../actions/snackBarAction'
import { toDisplayDate } from '../../../../../utils/common'
import CenterSpinner from '../../../../../global/CenterSpinner';
import { getAmountToDisplay } from '../../../../../utils/GlobalFunctions'
import Pagination from './pagination/pagination';

import disputeService from '../../../../../api/disputeService';


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

class Disputes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disputes: [],
      isLoading: false,
      pageNo: 1,
      pageSize: 10,
    };
  }

  async componentDidMount() {
    await this.fetchBusinessDisputes();
  }

  fetchBusinessDisputes = async () => {
    this.setState({ isLoading: true });
    await disputeService.getAllDisputes(this.state.pageNo, this.state.pageSize)
        .then(response => {
          this.setState({ isLoading: false });
          if (response.statusCode === 200) {
            this.setState({ disputes: response?.data?.disputes || [], disputeMeta: response?.data?.meta });
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
    if (status == 'resolved') {
      type = 'success'
    } else if (status == 'pending') {
      type = 'gray'
    } else if (status == 'review') {
      type = 'alert'
    }
    return `<div class='badge badge-${type}'>${this.capitalize(status)}</div>`
  }

  handlePaginationPage = (pageNumber) => {
    this.setState({ pageNo: pageNumber }, async () => {
      await this.fetchBusinessDisputes();
    })
  }

  handlePaginationPageSize = (pageSize) => {
    this.setState({ pageSize }, async () => {
      await this.fetchBusinessDisputes();
    })
  }

  render () {
    const { classes } = this.props;
    if (this.state.isLoading) {
      return <CenterSpinner />
    }
    return (
      <Fragment>
        <BootstrapTable
          className={`${classes.table}`}
          data={this.state.disputes || []}
          bordered={false}
          trClassName={'py-table__row'}
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
            dataField="paymentFor"
            dataFormat={(cell, row) => {
              return (
                <a
                  id="Public_Url"
                  href={`${row?.url}?isUser=true`}
                  target="_blank"
                  className="link-content text-capitalize"
                >
                  {cell}
                </a>
              )
            }}> Payment For
          </TableHeaderColumn>
          <TableHeaderColumn
            columnClassName={`${classes.tableColumn} py-table__cell`}
            className={`py-table__cell`}
            dataField="createdAt"
            dataFormat={(cell, row) => {
              return toDisplayDate(cell, true, 'MMM D, YYYY @ h:mm A')
            }}> Date
          </TableHeaderColumn>
          <TableHeaderColumn
            columnClassName={`${classes.tableColumn} py-table__cell`}
            className={`py-table__cell-amount`}
            dataField="disputedAmount"
            dataFormat={(cell, row) => {
              let currency = row?.business?.currency
              return (
                <div
                  className={`${classes.payments} payAmount`}
                  style={{ textAlign: 'right' }}
                >
                  {getAmountToDisplay(currency, cell)}
                </div>
              )
            }}> Disputed Amount
          </TableHeaderColumn>
          <TableHeaderColumn
            columnClassName={`${classes.tableColumn} py-table__cell`}
            className={`py-table__cell-amount`}
            dataField="transactionAmount"
            dataFormat={(cell, row) => {
              let currency = row?.business?.currency
              return (
                <div
                  className={`${classes.payments} payAmount`}
                  style={{ textAlign: 'right' }}
                >
                  {getAmountToDisplay(currency, cell)}
                </div>
              )
            }}> Transaction Amount
          </TableHeaderColumn>
          <TableHeaderColumn
            headerAlign='right'
            columnClassName={`${classes.tableColumn} py-table__cell`}
            className={`py-table__cell`}
            dataField="action"
            thStyle={{width:100}}
            tdStyle={{width:100}}
            dataFormat={(cell, row) => {
              return (
                <div style={{ textAlign: 'right' }}>
                  <Link to={'/app/payments/disputes/' + row?._id}>
                    <i className="fa fa-eye"></i>
                  </Link>
                </div>
              )
            }}> Action
          </TableHeaderColumn>
        </BootstrapTable>
        <Pagination data={this.state.disputeMeta}
          type='payments'
          handlePaginationPage={this.handlePaginationPage}
          handlePaginationPageSize={this.handlePaginationPageSize}
        />
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
)(Disputes))