import { getAllBills, recordPayment } from '../../../../../../actions/billsAction';
import { getAllVendors } from '../../../../../../actions/vendorsAction';
import RecordPaymentModal from '../../../../../../components/app/components/purchase/Components/bills/components/RecordPaymentModal';
import history from '../../../../../../customHistory'
import _, { isEqual, pickBy } from 'lodash'
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import { Button, Tooltip } from 'reactstrap';
import queryString from 'query-string';
import DataTableWrapper from '../../../../../../utils/dataTableWrapper/DataTableWrapper';
import DatepickerWrapper from "../../../../../../utils/formWrapper/DatepickerWrapper";
import CenterSpinner from '../../../../../../global/CenterSpinner';
import SelectBox from '../../../../../../utils/formWrapper/SelectBox';
import { _documentTitle, handleAclPermissions } from '../../../../../../utils/GlobalFunctions';
import { defaultSorted, getColumns } from './constants/BillTableConst';
import { NoDataMessage } from '../../../../../../global/NoDataMessage';
import { _formatDate, _toDateConvert } from '../../../../../../utils/globalMomentDateFunc';
import { openGlobalSnackbar } from '../../../../../../actions/snackBarAction';

let query = '';

class Bills extends Component {
  state = {
    query: { vendorId: '', startDate: '', endDate: '', status: '', pageNo: 1, pageSize: 10 },
    selectedBill: undefined,
    tooltipOpen: false,
    filter: false,
    recordLoading: false
  };

  componentDidMount() {
    const { businessInfo } = this.props;
    _documentTitle(businessInfo, "Bills");
    const pData = JSON.parse(localStorage.getItem('paginationData'))
    const query = queryString.parse(this.props.location.search)
    this.setState((prevState) => ({
      ...prevState,
      query: { ...prevState.query, ...query, pageSize: pData && pData.limit ? pData.limit : 10 }
    }), () => this.handleQueryString());
    this.props.getAllVendors();
  }

  vendorsOption() {
    const { allVendors = [] } = this.props;
    return [
      { id: '', value: '', label: 'All vendors' },
      ...allVendors.map(r => ({ id: r.id, value: r.id, label: r.vendorName }))
    ];
  }

  onRowClick = (e, row, rowIndex) => {
    if (['a', 'button', 'svg'].indexOf(e.target.tagName.toLowerCase()) !== -1 || ['a', 'button', 'svg'].indexOf(e.target.parentElement.tagName.toLowerCase()) !== -1 || e.target.onClick) {
      e.stopPropagation();
      return;
    }

    history.push(`${this.props.url}/bills/${row.id}`);
  };

  _filter = (select, from) => {
    this.setState({ filter: true });
    let query = { ...this.state.query };
    if (from === 'vendorId') {
      query.vendorId = select;
    } else if (from === 'startDate') {
      query.startDate = _formatDate(select);
    } else if (from === 'endDate') {
      query.endDate = _formatDate(select);
    } else if (from === 'status') {
      query.status = select;
    } else {
      query = { vendorId: '', startDate: '', endDate: '', status: '', pageNo: 1, pageSize: 10 }
    }

    if (isEqual(Object.values(this.state.query), Object.values(query))) {
      return;
    }
    this.setState((prevState) => ({
      ...prevState,
      query: { ...prevState.query, ...query }
    }), () => this.handleQueryString());

  }

  handleQueryString = () => {
    const { query } = this.state;
    let queryString = '';
    let data = pickBy(query, _.identity)
    queryString = Object.entries(data).map(([key, val]) => `${key}=${val}`).join("&");

    this.props.getAllBills(queryString);

    const urlParams = new URLSearchParams(queryString);
    urlParams.delete('pageNo');
    urlParams.delete('pageSize');
    const pathname = this.props.location.pathname;
    history.push({
      pathname,
      search: urlParams.toString()
    });
  }

  getStatusLabel = (status) => {
    const statusOptions = [
      { value: 'paid', label: 'Paid' },
      { value: 'unpaid', label: 'Unpaid' }
    ];
    const selected = statusOptions.find(option => option.value === status);
    return selected ? selected.label : '';
  }

  toggle = () => {
    this.setState({
      tooltipOpen: !this.state.tooltipOpen
    });
  };

  closeRecordPayment = () => {
    this.setState({ selectedBill: undefined });
  };

  openRecordPayment = (bill) => {
    this.setState({ selectedBill: bill });
  };

  columns = getColumns(this.openRecordPayment);

  recordPayment = (payload, callback) => {
    const { selectedBill } = this.state;
    this.setState({ recordLoading: true })
    this.props.recordPayment(selectedBill.id, payload, () => {
      this.setState({ recordLoading: false })
      this.props.getAllBills();
      callback();
    });
  };

  _handlePageChange = (type, { page, sizePerPage }) => {
    if (type === 'pagination') {
      let { query } = this.state;
      let pageNo = !!page ? page : query.pageNo;
      if (query.pageSize !== sizePerPage) {
        pageNo = 1;
      }
      const pData = JSON.parse(localStorage.getItem('paginationData'))
      if (pData) {
        localStorage.setItem('paginationData', JSON.stringify({ offset: pData.offset, queryData: pData.queryData, limit: sizePerPage }))
      } else {
        localStorage.setItem('paginationData', JSON.stringify({ offset: 1, queryData: {}, limit: sizePerPage }))
      }
      this.setState((prevState) => ({
        ...prevState,
        query: { ...prevState.query, pageNo, pageSize: sizePerPage ? sizePerPage : query.pageSize }
      }), () => this.handleQueryString());
    }
  }

  renderContent() {
    const { loading, success, data = {} } = this.props.getAllBillsState;
    if (loading) {
      return (<CenterSpinner className="mt-5" />);
    }

    if (!data || !data.bills || !data.bills.length) {
      return (
        <NoDataMessage
          title="bill"
          buttonTitle="bill"
          add={() => history.push('/app/purchase/bills/add')}
          filter={this.state.filter}
          secondryMessage="Add new bill which you have received from vendor."
        />
      );
    }

    return (
      <DataTableWrapper
        data={data ? data.bills || [] : []}
        columns={this.columns}
        defaultSorted={defaultSorted}
        hover={true}
        classes="py-table py-table--condensed"
        rowEvents={{ onClick: this.onRowClick }}
        changePage={(type, pagin) => this._handlePageChange(type, pagin)}
        page={data ? data.meta.pageNo : 1}
        limit={data ? data.meta.pageSize : 10}
        totalData={data ? data.meta.total : 0}
        from="bills"
      />
    );
  }

  render() {
    const { loading, success, data } = this.props.getAllBillsState;
    const { query: { vendorId, startDate, endDate, status }, selectedBill, recordLoading } = this.state;

    return (
      <Fragment>
        <div className="content-wrapper__main">
          <header className="py-header--page d-flex flex-wrap">
            <div className="py-header--title">
              <h2 className="py-heading--title">Bills</h2>
            </div>
            {!handleAclPermissions(['Viewer']) && <div className="py-header--actions">
              <Button onClick={() => history.push(`${this.props.url}/bills/add`)} color="primary" >Create a bill</Button>
            </div>}
          </header>
          <div className="content">
            <div className="bill-filter__container">
              <div className="bill-filter__vendor">
                <SelectBox
                  type="select"
                  name="vendorId"
                  placeholder="All vendors"
                  value={
                    vendorId === ''
                      ? { value: '', label: 'All vendors' }
                      : this.vendorsOption().find(option => option.value === vendorId)
                  }
                  onChange={(e) => this._filter(e ? e.value : '', 'vendorId')}
                  options={this.vendorsOption()}
                />
              </div>
              <div className="bill-filter__status">
                <SelectBox
                  type="select"
                  name="status"
                  placeholder="Status"
                  value={status === '' ? null : { value: status, label: this.getStatusLabel(status) }}
                  onChange={(e) => this._filter(e ? e.value : '', 'status')}
                  options={[
                    { value: '', label: 'All Statuses' },
                    { value: 'paid', label: 'Paid' },
                    { value: 'unpaid', label: 'Unpaid' }]}
                  isSearchable={false}
                />
              </div>
              <div className="bill-filter__range">
                <div className="DateRange__control">
                  <DatepickerWrapper
                    className="form-control"
                    placeholderText='From'
                    popperPlacement="top-end"
                    name="startDate"
                    maxDate={endDate ? _toDateConvert(endDate) : ''}
                    value={startDate ? _toDateConvert(startDate) : ''}
                    onChange={(date) => this._filter(date, 'startDate')}
                  />
                  <span className="mx-1">&nbsp;</span>
                  <DatepickerWrapper
                    className="form-control"
                    popperPlacement="top-end"
                    placeholderText='To'
                    minDate={startDate ? _toDateConvert(startDate) : ''}
                    value={endDate ? _toDateConvert(endDate) : ''}
                    onChange={(date) => this._filter(date, 'endDate')}

                  />
                </div>
                <span className="fillter__action__btn" role="button" id="reset-btn"
                  onClick={() => this._filter(null, 'clear')}>
                  <ReactSVG
                    src="/assets/icons/ic_cancel.svg"
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
                  Reset Filters
                </Tooltip>
              </div>
            </div>
            <div className="bill-list">
              {this.renderContent()}
            </div>
          </div>
        </div>
        <RecordPaymentModal
          loading={recordLoading}
          onClose={this.closeRecordPayment}
          bill={selectedBill}
          businessInfo={this.props.businessInfo}
          recordPayment={this.recordPayment}
          showSnackbar={this.props.openGlobalSnackbar}
        />
      </Fragment>
    )
  }
}

const mapStateToProps = state => ({
  getAllBillsState: state.getAllBills,
  businessInfo: state.businessReducer.selectedBusiness,
  allVendors: state.getAllVendors.data ? state.getAllVendors.data.vendors : [],
});

export default withRouter(connect(mapStateToProps, { getAllBills, getAllVendors, recordPayment, openGlobalSnackbar })(Bills))