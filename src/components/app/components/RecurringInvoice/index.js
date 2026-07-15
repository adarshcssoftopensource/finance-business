import classnames from 'classnames'
import history from '../../../../customHistory'
import { cloneDeep } from 'lodash'
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  Badge,
  Button,
  Col,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane
} from 'reactstrap'
// eslint-disable-next-line no-unused-vars
import DataTableWrapper from '../../../../utils/dataTableWrapper/DataTableWrapper'
import queryString from 'query-string'
import {
  getAllRecurringInvoices,
  getRecurringCounts
} from '../../../../actions/recurringInvoiceActions'
import customerServices from '../../../../api/CustomerServices'
import {
  columns,
  columnsAll, defaultSorted,
  draftColumns
} from '../../../../constants/recurringConst'
import CenterSpinner from '../../../../global/CenterSpinner'
import { NoDataMessage } from '../../../../global/NoDataMessage'
import SelectBox from '../../../../utils/formWrapper/SelectBox'
import RecurringInvoiceCreate from './recurringinvoicecreate'
import { handleAclPermissions } from '../../../../utils/GlobalFunctions'
class RecurringInvoice extends Component {
  state = {
    activeTab: 'active',
    tooltipOpen: false,
    dropdownOpen: false,
    limit: 10,
    offset: 1,
    totalData: 0,
    data: [],
    customerList: [],
    selectedCustomer: undefined,
    selectedStatus: undefined,
    invoiceData: [],
    invoiceCount: {
      draft: 0,
      active: 0,
      total: 0
    },
    filterData: {
      status: undefined,
      customer: '',
      startDate: undefined,
      endDate: undefined,
      invoiceNumber: undefined
    },
    loading: false,
    hideEnable: false,
    queryData: ''
  }

  componentWillMount() {
    const { businessInfo } = this.props
    document.title =
      businessInfo && businessInfo.organizationName
        ? `Finance - ${businessInfo.organizationName} - Recurring Invoices`
        : `Finance - Recurring Invoices`

    const pageData = localStorage.getItem('paginationData')
    let queryData = `pageNo=1&pageSize=10&tab=${this.state.activeTab}`
    if (!!pageData) {
      const { limit } = JSON.parse(pageData)
      queryData = `pageNo=${this.state.offset}&pageSize=${limit}&tab=${this.state.activeTab}`
      this.setState({ queryData, limit })
    }
    const query = queryString.parse(this.props.location.search)
    const queryParams = Object.entries(query).map(([key, val]) => `${key}=${val}`).join("&");
    if (queryParams) {
      const urlParams = new URLSearchParams(queryData);
      if (urlParams.get('tab')) {
        urlParams.delete('tab');
      }
      queryData = `${urlParams.toString()}&${queryParams}`;
      this.setState((prevState) => ({
          ...prevState,
          filterData: { ...prevState.filterData, ...query },
          selectedCustomer: query.customer,
          activeTab: query.tab
      }))
    }
    this.fetchInvoices(queryData)
    this.fetchInvoicesCount()
    this.fetchCustomersList()
  }

  componentDidUpdate(prevProps) {
    const { updateData } = this.props
    if (prevProps.updateData !== updateData) {
      let queryData = `pageNo=&pageSize=10&tab=${this.state.activeTab}`
      if (!!updateData.pageData) {
        const { limit } = JSON.parse(updateData.pageData)
        queryData = `pageNo=${this.state.offset}&pageSize=${limit}&tab=${this.state.activeTab}`
        // this.setState({queryData, limit})
      }
      this.fetchInvoices(queryData)
      this.fetchInvoicesCount()
      this.fetchCustomersList()
    }
  }

  fetchInvoices = async queryString => {
    const { limit, offset } = this.state
    this.setState({ loading: true })
    this.props.getAllRecurringInvoices(queryString)
    // if(response.data.invoices.length > 0){
    //     this.setState({ invoiceData: response.data.invoices, loading: false });
    // }
  }

  fetchInvoicesCount = async (queryString=null) => {
    let { filterData, invoiceCount, activeTab } = this.state
    this.setState({ loading: true })
    this.props.getRecurringCounts(queryString)
    // const invoiceCountResponse = response.data.invoiceCount;
    // this.setState({ invoiceCount: invoiceCountResponse, loading: false, hideEnable: true });
  }

  fetchCustomersList = async () => {
    this.setState({ loading: true })
    const customerList = (await customerServices.fetchCustomersSlim()).data
      .customers
    this.setState({ customerList, loading: false })
    const query = queryString.parse(this.props.location.search)
    const _foundCustomer = customerList && customerList.filter(customer => customer._id === query.customer);
    if (_foundCustomer.length) {
        this.setState({ selectedCustomer: _foundCustomer[0] });
    }
  }

  toggleTab = tab => {
    if (this.state.activeTab !== tab) {
      this.setState(
        {
          activeTab: tab,
          invoiceData: []
        },
        () => this.filterInvoiceData(false)
      )
    }
  }

  toggle = () => {
    this.setState({
      tooltipOpen: !this.state.tooltipOpen
    })
  }

  toggleDropdown = () => {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }))
  }

  addInvoice = () => {
    history.push('/app/recurring/add')
  }

  handleSelectChange = (selectedOption, type) => {
    let filterData = cloneDeep(this.state.filterData)
    if (type === 'customer') {
      filterData.customer = (selectedOption && selectedOption._id) || ''
      this.setState({ selectedCustomer: selectedOption })
    }
    this.setState({ filterData }, () => this.filterInvoiceData(true))
  }

  filterInvoiceData = async from => {
    let filterQuery = cloneDeep(this.state.filterData)
    const { activeTab } = this.state
    let { customer } = filterQuery
    let queryString = `pageNo=1&pageSize=${this.state.limit}`
    let countFilter = ''
    if (activeTab) {
      queryString += `&tab=${activeTab}`
    }

    if (customer) {
      queryString += `&customer=${customer}`
      countFilter += `customer=${customer}`
    }
    const urlParams = new URLSearchParams(queryString);
    urlParams.delete('pageNo');
    urlParams.delete('pageSize');
    const pathname = this.props.location.pathname;
    history.push({
        pathname,
        search: urlParams.toString()
    });
    this.setState({ queryData: queryString, offset: 1 })
    this.fetchInvoices(queryString)
    if (from) {
      this.fetchInvoicesCount(countFilter)
    }
  }

  addRecurringInvoice = () => {
    history.push('/app/recurring/add')
  }

  _handlePageChange = (type, { page, sizePerPage }) => {
    if (type === 'pagination') {
      let { queryData } = this.state;
      queryData = queryData.replace(`pageNo=${this.state.offset}`, `pageNo=${!!page ? page : this.state.offset}`)
      queryData = queryData.replace(`pageSize=${this.state.limit}`, `pageSize=${!!sizePerPage ? sizePerPage : this.state.limit}`)
      this.setState({ offset: page, queryData, limit: sizePerPage })
      localStorage.setItem('paginationData', JSON.stringify({ offset: page, queryData, limit: sizePerPage }))
      this.fetchInvoices(queryData);
    }
  }

  render() {
    const { hideEnable, customerList, selectedCustomer, activeTab, offset, limit, totalData } = this.state
    const { invoiceCount, allRecurring, businessInfo } = this.props
    const { loading, success, data } = allRecurring
    let invoiceData = []
    let meta = { pageNo: offset, pageSize: limit, total: totalData }
    if (success) {
      invoiceData = data.invoices
      meta = data.meta
    }
    if (!!businessInfo && !!businessInfo.meta && !!businessInfo.meta.recurring && !!businessInfo.meta.recurring.firstVisit) {
      return (
        <div>
          <RecurringInvoiceCreate />
        </div>
      )
    } else {
      return (
        <div className="content-wrapper__main">
          {loading ? (
            <CenterSpinner />
          ) : (
              <Fragment>
                <div className="invoice-header">
                  <header className="py-header--page flex-wrap">
                    <div className="py-header--title rec-inv-header-title">
                      <h2 className="py-heading--title"> Recurring Invoices </h2>
                    </div>
                    <div className="py-header--actions">
                      <Button disabled={handleAclPermissions(['Viewer'])} onClick={this.addRecurringInvoice} color="primary"  >Create a recurring invoice</Button>
                    </div>
                  </header>
                </div>

                <div className="recurring-invoice-list-table-filters--container">
                  <SelectBox
                    placeholder="All customers"
                    getOptionLabel={(value)=>(value["customerName"])}
                    getOptionValue={(value)=>(value["_id"])}
                    value={selectedCustomer}
                    className="py-select--medium"
                    onChange={cust => this.handleSelectChange(cust, 'customer')}
                    options={customerList}
                    isClearable
                  />
                </div>

                <div>
                  <Row>
                    <Col xs={12}>
                      <Nav tabs className="py-nav--tabs">
                        <NavItem>
                          <NavLink
                            className={classnames({
                              active: this.state.activeTab === 'active'
                            })}
                            onClick={() => {
                              this.toggleTab('active')
                            }}
                          >
                            Active
                          <Badge className="badge-circle">
                              {invoiceCount.active}
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
                            Draft
                          <Badge className="badge-circle mrL5">
                              {invoiceCount.draft}
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
                            All recurring invoices
                          {/* <Badge className="badge-circle mrL5">
                            {invoiceCount.total}
                          </Badge> */}
                          </NavLink>
                        </NavItem>
                      </Nav>
                      <TabContent
                        activeTab={this.state.activeTab}
                        className="tab-container pd0"
                      >
                        <TabPane tabId="active" className="tab-panel">
                          <div className="recurring-list-table">
                            {invoiceData.length > 0 ? (
                              <div className="py-table--condensed">
                                <DataTableWrapper
                                  data={invoiceData}
                                  columns={columns}
                                  defaultSorted={defaultSorted}
                                  from={'recurring'}
                                  changePage={this._handlePageChange}
                                  page={this.state.offset}
                                  limit={this.state.limit}
                                  totalData={meta.total}
                                />
                              </div>
                            ) : loading ? (
                              <CenterSpinner
                                color="primary"
                                size="md"
                                className="loader"
                              />
                            ) : (
                                  <NoDataMessage
                                    title={'active recurring invoice'}
                                    filter={activeTab !== 'active'}
                                    add={this.addInvoice}
                                    primaryMessage={`You haven't any active recurring invoice yet.`}
                                    btnText={'Add a recurring invoice'}
                                  />
                                )}
                          </div>
                        </TabPane>
                        <TabPane tabId="draft" className="tab-panel">
                          <div className="recurring-list-table">
                            {invoiceData.length > 0 ? (
                              <div className="py-table--condensed">
                                <DataTableWrapper
                                  data={invoiceData}
                                  columns={draftColumns}
                                  defaultSorted={defaultSorted}
                                  from="recurring"
                                  changePage={this._handlePageChange}
                                  page={this.state.offset}
                                  limit={this.state.limit}
                                  totalData={meta.total}
                                />
                              </div>
                            ) : loading ? (
                              <CenterSpinner
                                color="primary"
                                size="md"
                                className="loader"
                              />
                            ) : (
                                  <NoDataMessage
                                    title={'draft recurring invoice'}
                                    filter={activeTab !== 'active'}
                                    add={this.addInvoice}
                                    primaryMessage={`You haven't any recurring invoice in draft.`}
                                    btnText={'Add a recurring invoice'}
                                  />
                                )}
                          </div>
                        </TabPane>
                        <TabPane tabId="all">
                          <div className="recurring-list-table">
                            {invoiceData.length > 0 ? (
                              <div className="py-table--condensed">
                                <DataTableWrapper
                                  data={invoiceData}
                                  columns={columnsAll}
                                  defaultSorted={defaultSorted}
                                  from="recurring"
                                  changePage={this._handlePageChange}
                                  page={this.state.offset}
                                  limit={this.state.limit}
                                  totalData={meta.total}
                                />
                              </div>
                            ) : loading ? (
                              <CenterSpinner
                                color="primary"
                                size="md"
                                className="loader"
                              />
                            ) : (
                                  <NoDataMessage
                                    title={'recurring invoice'}
                                    buttonTitle={'recurring invoice'}
                                    filter={activeTab !== 'active'}
                                    add={this.addInvoice}
                                    btnText={'Add a recurring invoice'}
                                  />
                                )}
                          </div>
                        </TabPane>
                      </TabContent>
                    </Col>
                  </Row>
                </div>
              </Fragment>
            )}
        </div>
      )
    }
  }
}

const mapStateToProps = ({
  snackbar,
  settings,
  businessReducer,
  getAllRecurring,
  getAllRecurringCount
}) => ({
  businessInfo: businessReducer.selectedBusiness,
  invoiceCount: getAllRecurringCount.success
    ? getAllRecurringCount.data.invoiceCount
    : {},
  allRecurring: getAllRecurring
})

export default withRouter(
  connect(mapStateToProps, { getRecurringCounts, getAllRecurringInvoices })(
    RecurringInvoice
  )
)
