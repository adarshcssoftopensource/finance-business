import classnames from 'classnames'
import history from '../../../../customHistory'
import { cloneDeep, isEmpty } from 'lodash'
import queryString from 'query-string'
import React, { Fragment, PureComponent } from 'react'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'
import {
  Badge,
  Button,
  Input, InputGroup, InputGroupText,
  Nav,
  NavItem,
  NavLink, TabContent,
  TabPane,
  Tooltip
} from 'reactstrap'
import DataTableWrapper from '../../../../utils/dataTableWrapper/DataTableWrapper'
import DatepickerWrapper from '../../../../utils/formWrapper/DatepickerWrapper'
import SelectBox from '../../../../utils/formWrapper/SelectBox'
import { getInvoices } from '../../../../actions/invoiceActions'
import customerServices from '../../../../api/CustomerServices'
import {
  getInvoiceDashboardCount, getInvoicesCount
} from '../../../../api/InvoiceService'
import { FETCH_INVOICE_LOADING } from '../../../../constants/ActionTypes'
import {
  allColumns, columns,
  defaultSorted,
  draftColumns, INVOICE_STATUS_FILTER
} from '../../../../constants/invoiceConst'
import CenterSpinner from '../../../../global/CenterSpinner'
import InformationAlert from '../../../../global/InformationAlert'
import { NoDataMessage } from '../../../../global/NoDataMessage'
import { getAmountToDisplay, handleAclPermissions, _invoiceDateTime } from '../../../../utils/GlobalFunctions'
import { _displayDate, _formatDate, _toDateConvert } from '../../../../utils/globalMomentDateFunc'
import InvoiceOnboarding from './components/InvoiceOnboarding'
import TurnOnPayments from '../../../../global/turnOnPayments'
import Icon from '../../../common/Icon'
import symbolsIcon from "../../../../assets/icons/product/symbols.svg";
class Invoice extends PureComponent {
  state = {
    modal: false,
    activeTab: 'unpaid',
    limit: 10,
    offset: 1,
    totalInvoice: 0,
    data: [],
    customerList: [],
    selectedCustomer: undefined,
    selectedStatus: undefined,
    isSearchByCustomerNameDisabled: false,
    invoiceData: [],
    tooltipOpen: false,
    invoiceCount: {
      draft: 0,
      unpaid: 0,
      total: 0
    },
    invoiceDashboardData: {
      currency: {
        code: '',
        symbol: ''
      },
      overdue: 0,
      due: 0,
      paidThisMonth: 0
    },
    filterData: {
      status: undefined,
      customer: '',
      startDate: undefined,
      endDate: undefined,
      invoiceNumber: undefined
    },
    loading: false,
    refreshData: false,
    isOnBoard: false,
    queryData: '',
    sort: true,
    sortTye: 'dueDate',
    recurringId: null
  }

  componentDidMount() {
    this.initFunction()
  }

  initFunction() {
    const { businessInfo, location, paymentSettings } = this.props
    const { search } = location
    document.title =
      businessInfo && businessInfo.organizationName
        ? `Finance - ${businessInfo.organizationName} - Finance`
        : `Finance - Invoices`
    let invoiceMeta = { firstVisit: false }
    try {
      const raw = localStorage.getItem('reduxPersist:root')
      if (raw) {
        const root = JSON.parse(raw)
        const businessReducer = typeof root.businessReducer === 'string'
          ? JSON.parse(root.businessReducer)
          : root.businessReducer
        invoiceMeta = businessReducer?.selectedBusiness?.meta?.invoice || invoiceMeta
      }
    } catch (e) {
      /* ignore corrupt persist */
    }
    const invoice = invoiceMeta
    let queryData = `pageNo=${this.state.offset}&pageSize=${this.state.limit}`
    const pageData = localStorage.getItem('paginationData')

    if (!!pageData) {
      const { limit } = JSON.parse(pageData)
      queryData = `pageNo=${this.state.offset}&pageSize=${limit}`
      this.setState({ limit })
    }

    if (search.includes('rcId') || search.includes("recurringId")) {
      const {
        rcId,
        recurringId
      } = queryString.parse(search);
      this.setState({ recurringId: rcId ? rcId : recurringId , activeTab:"all" })
      queryData += `&recurringId=${rcId ? rcId : recurringId}&tab=all`
    } else {
      this.setState({ recurringId: null })
    }

    if (search.includes('filter_overdue')) {
      const { filter_overdue } = queryString.parse(search)
      const { filterData } = this.state
      if (filter_overdue) {
        filterData.status = 'overdue'
        this.setState({
          selectedStatus: 'overdue',
          filterData
        })
        queryData += '&status=overdue'
      }
    }
    const query = queryString.parse(search)
    const EXCLUDED_QUERY_PARAMS = ['tab', 'recurringId', 'rcId' ];
    if (!isEmpty(query)) {
      const otherParams = Object.entries(query).filter(([key]) => !EXCLUDED_QUERY_PARAMS.includes(key)).map(([key, val]) => `${key}=${val}`).join("&");
      queryData += `&${queryString}`;
      this.setState((prevState) => ({
        ...prevState,
        filterData: { ...prevState.filterData, ...query },
        selectedStatus: query.status,
        selectedCustomer: query.customer,
        activeTab: query.tab
      }))
    } else {
      queryData += `&tab=${this.state.activeTab}`
    }

    this.fetchInvoices(queryData)
    this.fetchInvoicesCount(queryData)
    this.fetchCustomersList()
    this.fetchInvoiceDashboardCount()
    if (!!paymentSettings && !paymentSettings.loading && !!paymentSettings.data && !!paymentSettings.data.isOnboardingApplicable && search.includes('pre=true')) {
      this.setState({
        isOnBoard: invoice.firstVisit
      })
    } else if (businessInfo?.meta?.invoice?.firstVisit) {
      history.push('/app/invoices/start')
    }
    this.setState({ queryData, isSearchByCustomerNameDisabled: false, selectedCustomer: undefined })
  }

  componentDidUpdate(prevProps, prevState) {
    const { updateData, invoice: { data }, location: { search } } = this.props
    const { filterData, recurringId } = this.state
    const { rcId, customer } = queryString.parse(search)

    if (this.props.invoice && this.props.invoice.data && this.props.invoice.data !== prevProps.invoice.data) {
      const _selectedCustomer = data && data.invoices && data.invoices[0] && data.invoices[0].customer;
      const _foundCustomer = data && data.invoices?.filter(invoice => invoice && invoice.customer && invoice.customer.id === customer);
      if (_foundCustomer.length) {
        this.setState({
          selectedCustomer: {
            _id: _foundCustomer[0].customer.id,
            customerName: _foundCustomer[0].customer.customerName
          }
        })
      }
      if (_selectedCustomer && rcId) {
        this.setState({
          isSearchByCustomerNameDisabled: true,
          selectedCustomer: {
            _id: _selectedCustomer.id,
            customerName: _selectedCustomer.customerName
          }
        })
      }
    }

    if (prevProps.updateData !== updateData) {
      this.filterInvoiceData()
      this.fetchCustomersList()
      this.fetchInvoiceDashboardCount()
    }
    if (prevState.recurringId != recurringId) {
      this.initFunction()
    }
  }


  fetchInvoices = async queryData => {
    this.props.getInvoices(queryData)
  }

  fetchInvoicesCount = async queryData => {
    const response = await getInvoicesCount(queryData)
    const invoiceCountResponse = response?.data?.invoiceCount || {
      draft: 0,
      unpaid: 0,
      total: 0,
    }
    this.setState({ invoiceCount: invoiceCountResponse })
  }

  onRefreshClick = async () => {
    // let queryData = `tab=${this.state.activeTab}`;
    // this.fetchInvoices(queryData);
    // this.fetchInvoicesCount(queryData);
    this.fetchInvoiceDashboardCount()
    this.setState({ refreshData: true })
  }

  fetchCustomersList = async () => {
    const customerList = (await customerServices.fetchCustomersSlim())?.data?.customers || []
    this.setState({ customerList })
  }

  fetchInvoiceDashboardCount = async () => {
    let invoiceDashboardData = (await getInvoiceDashboardCount())?.data?.invoiceDashboardData || this.state.invoiceDashboardData
    this.setState({ invoiceDashboardData, refreshData: false })
  }

  toggleTooltip() {
    this.setState(prevState => ({
      tooltipOpen: !prevState.tooltipOpen
    }));
  }

  handleSelectChange = (selectedOption, type) => {
    let filterData = cloneDeep(this.state.filterData)
    if (type === 'status') {
      filterData.status = (selectedOption && selectedOption.value) || ''
      this.setState({ selectedStatus: selectedOption })
    } else if (type === 'customer') {
      filterData.customer = (selectedOption && selectedOption._id) || ''
      this.setState({ selectedCustomer: selectedOption })
    } else if (type.includes('Date')) {
      filterData = {
        ...filterData,
        [type]: selectedOption
          ? _formatDate(selectedOption)
          : null
      }
    } else if (type === 'invoiceNumber') {
      filterData[type] = selectedOption
    }
    this.setState({ filterData }, () => this.filterInvoiceData())
  }

  removeFilter = () => {
    this.setState({
      selectedStatus: undefined,
      selectedCustomer: undefined,
      filterData: {
        status: undefined,
        customer: '',
        startDate: undefined,
        endDate: undefined,
        invoiceNumber: undefined
      },
      recurringId: null
    }, () => {
      const pathname = this.props.location.pathname;
      history.push({
        pathname,
        search: `?tab=${this.state.activeTab}`
      });
      const queryData = `pageNo=1&pageSize=${this.state.limit}&tab=${this.state.activeTab}`;
      this.fetchInvoices(queryData);
      this.fetchInvoicesCount(queryData);
    });
  }

  filterInvoiceData = async () => {
    let filterQuery = cloneDeep(this.state.filterData)
    const { activeTab, recurringId } = this.state
    let { startDate, endDate, customer, status, invoiceNumber } = filterQuery
    let queryData = `pageNo=1&pageSize=${this.state.limit}`
    let countFilter = ''
    if (activeTab) {
      queryData += `&tab=${activeTab}`
    }

    if (status) {
      queryData += `&status=${status}`
      countFilter =
        countFilter.length > 0 ? `status=${status}` : `&status=${status}`
    }

    if (customer) {
      queryData += `&customer=${customer}`
      countFilter +=
        countFilter === '' ? `customer=${customer}` : `&customer=${customer}`
    }

    if (startDate) {
      queryData += `&startDate=${startDate}`
      countFilter +=
        countFilter === ''
          ? `startDate=${startDate}`
          : `&startDate=${startDate}`
    }

    if (endDate) {
      queryData += `&endDate=${endDate}`
      countFilter +=
        countFilter === '' ? `endDate=${endDate}` : `&endDate=${endDate}`
    }

    if (invoiceNumber) {
      queryData += `&invoiceNumber=${invoiceNumber}`
      countFilter +=
        countFilter === ''
          ? `invoiceNumber=${invoiceNumber}`
          : `&invoiceNumber=${invoiceNumber}`
    }
    if (recurringId) {
      queryData += `&recurringId=${recurringId}`
      countFilter += `&recurringId=${recurringId}`
    }

    const urlParams = new URLSearchParams(queryData);
    urlParams.delete('pageNo');
    urlParams.delete('pageSize');
    const pathname = this.props.location.pathname;
    history.push({
      pathname,
      search: urlParams.toString()
    });
    this.setState({ offset: 1, queryData, recurringId })
    this.fetchInvoices(queryData)
    this.fetchInvoicesCount(countFilter)
  }

  onFilterClick = () => {
    this.setState(prevState => {
      return {
        showFilter: !prevState.showFilter
      }
    })
  }

  handleModal = () => {
    this.setState({
      modal: !this.state.modal
    })
  }

  toggleTab = tab => {
    if (this.state.activeTab !== tab) {
      this.setState(
        {
          activeTab: tab,
          invoiceData: [],
          selectedStatus: undefined,
          selectedCustomer: undefined,
          filterData: {
            status: undefined,
            customer: '',
            startDate: undefined,
            endDate: undefined,
            invoiceNumber: undefined
          }
        },
        () => this.filterInvoiceData()
      )
    }
  }

  addInvoice = () => {
    history.push('/app/invoices/add')
  }

  _handlePageChange = (type, { page, sizePerPage }) => {
    let { queryData, offset, limit, sort, sortTye } = this.state;
    if (type === 'pagination') {
      let pageNo = !!page ? page : offset;
      if (this.state.limit !== sizePerPage) {
        pageNo = 1;
      }
      if (pageNo === offset && sizePerPage === limit) {
        return
      }
      queryData = queryData.replace(`pageNo=${offset}`, `pageNo=${pageNo}`)
      queryData = queryData.replace(`pageSize=${limit}`, `pageSize=${!!sizePerPage ? sizePerPage : limit}`)
      this.setState({ offset: pageNo, queryData, limit: sizePerPage })

      localStorage.setItem('paginationData', JSON.stringify({ offset: pageNo, queryData, limit: sizePerPage }))
      this.fetchInvoices(queryData);
    } else if (type === 'sort') {
      const sortBy = !sort
      if (queryData.includes('sort')) {
        queryData = queryData.replace(`sortType=${!!sort ? 'asc' : 'desc'}`, `sortType=${!!sortBy ? 'asc' : 'desc'}`)
      } else {
        queryData += `&sortType=${!!sort ? 'asc' : 'desc'}&sortBy=${sortTye}`

      }
      this.setState({ queryData, sort: sortBy })
      this.fetchInvoices(queryData);
    }
  }

  render() {
    let search = false
    this.resetRef = React.createRef();
    const {
      invoiceData,
      customerList,
      selectedCustomer,
      selectedStatus,
      isSearchByCustomerNameDisabled,
      filterData,
      invoiceDashboardData,
      loading,
      refreshData,
      isOnBoard,
      recurringId
    } = this.state
    if (
      !!filterData.customer ||
      !!filterData.startDate ||
      !!filterData.endDate ||
      !!filterData.invoiceNumber ||
      !!filterData.status
    ) {
      search = true
    }
    const { invoice: { type, data }, paymentSettings, businessInfo } = this.props
    const showNoUnpaidInvoiceMessage = parseInt(this.state.invoiceCount.total) > 0 && parseInt(this.state.invoiceCount.unpaid) === 0
    return (
      <div className="content-wrapper__main invoiceWrapper">
        {
          isOnBoard && (
            <InvoiceOnboarding
              openModal={isOnBoard}
              setFirstVisit={this._setFirstVisit.bind(this)}
              businessInfo={businessInfo}
            />
          )
        }
        <div className="invoice-header">
          <header className="py-header--page d-flex">
            <div className="py-header--title">
              <h2 className="py-heading--title">Invoices </h2>
            </div>
            <div className="pull-right">
              <Button disabled={handleAclPermissions(['Viewer'])} onClick={this.addInvoice} color="primary" >Create an invoice</Button>
            </div>
          </header>
        </div>
        <div className="invoice-insights__content py-box py-box--large">
          <div className="invoice-insights__content-row">
            <div className="invoice-insights-content__column">
              <div className="py-text--block-label">Overdue</div>
              <div className="py-text py-text--large">
                <span className="invoice-insights-content__column-value">
                  {getAmountToDisplay(invoiceDashboardData &&
                    invoiceDashboardData.currency, invoiceDashboardData.overdue)}
                </span>
                <span className="invoice-insights-content__column-unit">
                  <span className="py-text--small">
                    {invoiceDashboardData &&
                      invoiceDashboardData.currency &&
                      invoiceDashboardData.currency.code}
                  </span>
                </span>
              </div>
            </div>
            <div className="invoice-insights-content__column d-flex flex-column align-items-center">
              <div className="py-text--block-label">Due within 30 days</div>
              <div className="py-text py-text--large">
                <span className="invoice-insights-content__column-value">
                  {getAmountToDisplay(invoiceDashboardData &&
                    invoiceDashboardData.currency, invoiceDashboardData.due)}
                </span>
                <span className="invoice-insights-content__column-unit">
                  <span className="py-text--small unit-value">
                    {invoiceDashboardData &&
                      invoiceDashboardData.currency &&
                      invoiceDashboardData.currency.code}
                  </span>
                </span>
              </div>
            </div>

            <div className="invoice-insights-content__column d-flex flex-column align-items-end">
              <div className="py-text--block-label">Received this month</div>
              <div className="py-text py-text--large">
                <span className="invoice-insights-content__column-value">
                  {getAmountToDisplay(invoiceDashboardData &&
                    invoiceDashboardData.currency, invoiceDashboardData.paidThisMonth)}
                </span>
                <span className="invoice-insights-content__column-unit">
                  <span className="py-text--small unit-value">
                    {invoiceDashboardData &&
                      invoiceDashboardData.currency &&
                      invoiceDashboardData.currency.code}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div className="invoice-insights__content__row bottom-row">
            <div className="py-text py-text--hint d-flex align-items-center">
              <span className="me-1">Last updated {_invoiceDateTime(
                _displayDate(new Date(), ''),
                true,
                'lll',
                true,
                'ha z',
                'pastWithTime'
              )}</span>
              <span
                role="button"
                onClick={this.onRefreshClick}
                className="filter__action"
              >
                <Icon
                  className="Icon"
                  xlinkHref={`${symbolsIcon}#refresh`}
                />
              </span>
            </div>
            {
              !!paymentSettings && !paymentSettings.loading && !!paymentSettings.data && !!paymentSettings.data.isOnboardingApplicable && !paymentSettings.data.isConnected && (
                <div className="py-text py-text--hint d-flex align-items-right">
                  <span className="me-1 round-light-bg">
                    Invoices get paid 3x faster with online payments <TurnOnPayments isText={true} />
                  </span>
                </div>
              )
            }
          </div>
        </div>
        {
          type === FETCH_INVOICE_LOADING ? <CenterSpinner /> : (
            <div className="responsive-table-wrapper">
              <div className="invoice-list-table-filters-container">
                <div className="invoice-filter--customer">
                  <SelectBox
                    placeholder="All customers"
                    getOptionLabel={(value)=>(value["customerName"])}
                    getOptionValue={(value)=>(value["_id"])}
                    value={selectedCustomer}
                    onChange={cust => this.handleSelectChange(cust, 'customer')}
                    options={customerList}
                    isClearable
                    isDisabled={(!!data && !!data.invoices && data.invoices.length === 0 && !search) || (isSearchByCustomerNameDisabled)}
                  />
                </div>
                <div className="invoice-filter--status">
                  <SelectBox
                    placeholder="All statuses"
                    value={selectedStatus}
                    onChange={status => this.handleSelectChange(status, 'status')}
                    options={INVOICE_STATUS_FILTER(this.state.activeTab)}
                    isClearable
                    isDisabled={!!data && !!data.invoices && data.invoices.length === 0 && !search}
                  />
                </div>
                <div className="invoice-filter--date">
                  <div className="DateRange__control">
                    <DatepickerWrapper
                      maxDate={!!filterData.endDate && _toDateConvert(filterData.endDate)}
                      isClearable={!!filterData.startDate ? true : false}
                      strictParsing
                      placeholderText="From"
                      className="form-control"
                      popperPlacement="bottom-start"
                      selected={!!filterData.startDate && _toDateConvert(filterData.startDate)}
                      onChange={date => this.handleSelectChange(date, 'startDate')}
                      name="startdate"
                      // calendarContainer = {(e) => this.MyContainer(e, 'startDate')}
                      disabled={!!data && !!data.invoices && data.invoices.length === 0 && !search}
                    />
                    <span className="mx-1">&nbsp;</span>
                    <DatepickerWrapper
                      minDate={!!filterData.startDate && _toDateConvert(filterData.startDate)}
                      isClearable={!!filterData.endDate ? true : false}
                      placeholderText="To"
                      strictParsing
                      popperPlacement="bottom-start"
                      className="form-control"
                      selected={!!filterData.endDate && _toDateConvert(filterData.endDate)}
                      onChange={date => this.handleSelectChange(date, 'endDate')}
                      // calendarContainer = {(e) => this.MyContainer(e, 'endDate')}
                      disabled={!!data && !!data.invoices && data.invoices.length === 0 && !search}
                    />
                  </div>
                </div>
                <div className="invoice-filter--search">
                  <InputGroup className="btn-search">
                    <Input
                      placeholder={'Enter invoice #'}
                      value={filterData.invoiceNumber}
                      onChange={e => {
                        const { value } = e.target
                        let filterData = cloneDeep(this.state.filterData)
                        filterData.invoiceNumber = value
                        this.setState({ filterData })
                      }}
                      className={!!filterData.invoiceNumber ? "cross" : ''}
                      disabled={!!data && !!data.invoices && data.invoices.length === 0 && !search}
                    />
                    {
                      !!filterData.invoiceNumber && (
                        <a className="btn-close icon me-2 cross-placeholder" href="javascript:void(0)" id="reset"
                          onClick={
                            e => this.handleSelectChange('', 'invoiceNumber')
                          }
                        >
                          <svg viewBox="0 0 20 20" className="py-svg-icon" id="cancel" xmlns="http://www.w3.org/2000/svg"><path d="M11.592 10l5.078 5.078a1.126 1.126 0 0 1-1.592 1.592L10 11.592 4.922 16.67a1.126 1.126 0 1 1-1.592-1.592L8.408 10 3.33 4.922A1.126 1.126 0 0 1 4.922 3.33L10 8.408l5.078-5.078a1.126 1.126 0 0 1 1.592 1.592L11.592 10z"></path></svg>
                        </a>
                      )
                    }
                    <div className={"input-group-append"}>
                      <Button
                        onClick={e =>
                          this.handleSelectChange(filterData.invoiceNumber, 'invoiceNumber')
                        }
                        disabled={!!data && !!data.invoices && data.invoices.length === 0 && !search}
                      ><i className="fal fa-search" aria-hidden="true" /></Button>
                    </div>
                  </InputGroup>
                </div>
                <div className="invoice-filter--reset mt-2">
                  <Tooltip 
                    placement="top" isOpen={this.state.tooltipOpen}
                    target={this.resetRef} toggle={() => this.toggleTooltip()}>
                    Reset filters
                  </Tooltip>
                  <a 
                    className="fillter__action__btn" href="javascript:void(0)" 
                    ref={this.resetRef} onClick={this.removeFilter}>
                    <span className='fa fa-refresh'></span>
                  </a>
                </div>
              </div>
              {recurringId &&
                <InformationAlert varient="info">
                  <div className="alert-icon">
                    <svg className="Icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 19a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-2a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm0-11a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 3a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0v-4a1 1 0 0 1 1-1z"></path></svg>
                  </div>
                  <div className="alert-content">
                    <div className="alert-desc" >
                      You are currently viewing invoices created from <Link to={`/app/recurring/view/${recurringId}`}>Recurring Invoices for {
                        data && !!data.invoices && data.invoices.length > 0 ? data.invoices[0].customer.customerName : ''}</Link>.
                    </div>
                  </div>
                  <div className="alert-button ms-auto">
                    <Button outline onClick={this.removeFilter}>Remove Filter</Button>
                  </div>
                </InformationAlert>
              }
              <Nav tabs className="py-nav--tabs">
                <NavItem>
                  <NavLink
                    className={classnames({
                      active: this.state.activeTab === 'unpaid'
                    })}
                    onClick={() => {
                      this.toggleTab('unpaid')
                    }}
                  >
                    Unpaid
                      <Badge className="badge-circle mrL5">
                      {this.state.invoiceCount.unpaid}
                    </Badge>
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({
                      active: this.state.activeTab === 'draft'
                    })}
                    onClick={() => {
                      this.toggleTab('draft')
                    }}
                  >
                    Draft{' '}
                    <Badge className="badge-circle mrL5">
                      {this.state.invoiceCount.draft}
                    </Badge>
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({
                      active: this.state.activeTab === 'all'
                    })}
                    onClick={() => {
                      this.toggleTab('all')
                    }}
                  >
                    All invoices{' '}
                  </NavLink>
                </NavItem>
              </Nav>
              <TabContent
                className="tab-container p-0"
                activeTab={this.state.activeTab}
              >
                <TabPane tabId="unpaid" className="tab-panel">
                  {this.state.activeTab === 'unpaid' && !!data && !!data.invoices && data.invoices.length > 0 ? (
                    <div className="invoice-list-table tab-unpaid">
                      <DataTableWrapper
                        from="invoiceList"
                        data={data.invoices}
                        columns={columns}
                        classes={'py-table py-table--condensed py-table__v__center'}
                        changePage={this._handlePageChange}
                        page={this.state.offset}
                        limit={this.state.limit}
                        totalData={data.meta.total}
                        // rowClasses={"py-table__row"}
                        defaultSorted={defaultSorted}
                        sort={this.state.sort}
                        sortField='due'
                      />
                    </div>
                  ) : search ? (
                    <Fragment>
                      <div className="text-center vr-middle">
                        <i
                          className="fal fa-search color-muted"
                          style={{ fontSize: '40px' }}
                        />
                        <div className="py-heading--section-title mt-4">
                          No invoices found for your current filters.
                        </div>

                        <p className="lead">
                          Verify your filters and try again.
                        </p>
                      </div>
                    </Fragment>
                  ) : this.state.invoiceCount.draft > 0 ? (
                    <Fragment>
                      <div className="text-center">
                        <div className="py-heading--section-title">
                          You have no unpaid invoices.
                        </div>
                        <p className="lead">
                          You have{' '}
                          <span className="py-text--strong">
                            {this.state.invoiceCount.draft}
                          </span>{' '}
                          draft invoices. What will you like to do next?
                        </p>
                        <Button
                          onClick={this.addInvoice}
                          color="primary"
                          className="me-2"
                        >Create a new Invoice</Button>
                        <Button
                          color="primary"
                          outline
                          onClick={() => {
                            let { filterData } = this.state
                            filterData.status = 'draft'
                            this.setState({ activeTab: 'draft', filterData })
                            // this.fetchInvoices
                          }}
                        >
                          View drafts
                        </Button>
                      </div>
                    </Fragment>
                  ) : (
                          <NoDataMessage
                            title="invoice"
                            buttonTitle="invoice"
                            btnText="Add an"
                            add={this.addInvoice}
                            filter={search}
                            primaryMessage={showNoUnpaidInvoiceMessage ? "You don’t have any unpaid invoice." : ""}
                            secondryMessage="Create your first invoice and get paid for your excellent work."
                          />
                        )}
                </TabPane>
                <TabPane tabId="draft" className="tab-panel">
                  {this.state.activeTab === 'draft' && !!data && !!data.invoices && data.invoices.length > 0 ? (
                    <div className="invoice-list-table tab-draft">
                      <DataTableWrapper
                        from="invoiceList"
                        data={data.invoices}
                        classes="py-table py-table--condensed py-table__v__center"
                        changePage={this._handlePageChange}
                        page={this.state.offset}
                        limit={this.state.limit}
                        totalData={data.meta.total}
                        columns={draftColumns}
                        defaultSorted={defaultSorted}
                        sort={this.state.sort}
                        sortField='date'
                      />
                    </div>
                  ) : loading ? (
                    <CenterSpinner />
                  ) : (
                        <NoDataMessage
                          title="invoice"
                          buttonTitle="invoice"
                          btnText="Add an"
                          add={this.addInvoice}
                          filter={search}
                          secondryMessage="Create your first invoice and get paid for your excellent work."
                        />
                      )}
                </TabPane>
                <TabPane tabId="all" className="tab-panel">
                  {this.state.activeTab === 'all' && !!data && !!data.invoices && data.invoices.length > 0 ? (
                    <div className="invoice-list-table tab-all">
                      <DataTableWrapper
                        from="invoiceList"
                        data={data.invoices}
                        classes="py-table py-table--condensed py-table__v__center"
                        changePage={this._handlePageChange}
                        page={this.state.offset}
                        limit={this.state.limit}
                        totalData={data.meta.total}
                        columns={allColumns}
                        defaultSorted={defaultSorted}
                        sort={this.state.sort}
                        sortField='date'
                      />
                    </div>
                  ) : loading ? (
                    <CenterSpinner />
                  ) : (
                        <NoDataMessage
                          title="invoice"
                          btnText="Add an"
                          buttonTitle="invoice"
                          add={this.addInvoice}
                          filter={search}
                          secondryMessage="Create your first invoice and get paid for your excellent work."
                        />
                      )}
                </TabPane>
              </TabContent>
            </div>
          )
        }
      </div>
    )
  }
}

const mapPropsToState = ({ snackbar, businessReducer, invoice, paymentSettings }) => ({
  updateData: snackbar.updateData,
  businessInfo: businessReducer.selectedBusiness,
  invoice,
  paymentSettings

})

export default withRouter(connect(mapPropsToState, { getInvoices })(Invoice))
