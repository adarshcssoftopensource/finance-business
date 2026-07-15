import history from '../../../../customHistory';
import _, { cloneDeep } from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import queryString from 'query-string'
import CenterSpinner from '../../../../global/CenterSpinner';
import { Button, Tooltip } from 'reactstrap';
import DataTableWrapper from '../../../../utils/dataTableWrapper/DataTableWrapper';
import DatepickerWrapper from '../../../../utils/formWrapper/DatepickerWrapper';
import SelectBox from '../../../../utils/formWrapper/SelectBox';
import { openGlobalSnackbar } from '../../../../actions/snackBarAction';
import CustomerServices from '../../../../api/CustomerServices';
import { fetchEstimates } from '../../../../api/EstimateServices';
import { columns, defaultSorted, FILTER_CONST } from '../../../../constants/EstimateConst';
import { NoDataMessage } from '../../../../global/NoDataMessage';
import { getEstimates } from '../../../../actions/estimateAction';
import { FETCH_ESTIMATE_LOADING, FETCH_ESTIMATE_SUCCESS } from '../../../../constants/ActionTypes';
import { _formatDate, _toDateConvert } from '../../../../utils/globalMomentDateFunc';
import {handleAclPermissions } from '../../../../utils/GlobalFunctions';

class Estimates extends Component {
    state = {
        selectedOption: null,
        showFilter: false,
        customerList: [],
        selectedStatus: undefined,
        selectedCustomer: undefined,
        filterData: {
            status: "",
            customer: "",
            startDate: undefined,
            endDate: undefined
        },
        search: false,
        offset: 1,
        limit: 10,
        totalData: 0,
        queryData: 'pageNo=1&pageSize=10',
        sort: true,
        sortTye: "estimateDate",
        dateErrors: { startDate: "", endDate: "" },
    }

    componentDidMount() {
        const { businessInfo } = this.props;
        const pageData = localStorage.getItem('paginationData')
        let queryData = this.state.queryData
        if(!!pageData){
        const {limit} = JSON.parse(pageData)
        queryData = `pageNo=${this.state.offset}&pageSize=${limit}`
        this.setState({queryData, limit})
        }
        document.title = businessInfo && businessInfo.organizationName ? `Finance - ${businessInfo.organizationName} - Estimates` : `Finance - Estimates`;
        const query = queryString.parse(this.props.location.search)
        const queryParams = Object.entries(query).map(([key, val]) => `${key}=${val}`).join("&");
        queryData += `&${queryParams}`;
        this.setState((prevState) => ({
            ...prevState,
            filterData: { ...prevState.filterData, ...query },
            selectedStatus: query.status,
            selectedCustomer: query.customer
        }))
        this.fetchEstimateInvoice(queryData)
        this.fetchCustomersList()

    }

    fetchEstimateInvoice = async (filter) => {
        this.props.getEstimates(filter)
    }

    fetchCustomersList = async () => {
        const customerList = (await CustomerServices.fetchCustomersSlim()).data.customers
        this.setState({ customerList })
        const query = queryString.parse(this.props.location.search)
        const _foundCustomer = customerList && customerList.filter(customer => customer._id === query.customer);
        if (_foundCustomer.length) {
            this.setState({ selectedCustomer: _foundCustomer[0] });
        }
    }

    handleSelectChange = (selectedOption, type) => {
        let filterData = cloneDeep(this.state.filterData)
        if (type === 'status') {
            filterData.status = selectedOption && selectedOption.value || ''
            this.setState({ selectedStatus: selectedOption, search: true })
        } else if (type === 'customer') {
            filterData.customer = selectedOption && selectedOption._id || ''
            this.setState({ selectedCustomer: selectedOption, search: true })
        } else if (type.includes("Date")) {
            filterData = {
                ...filterData, [type]: selectedOption ? _formatDate(selectedOption, "YYYY-MM-DD") : null
            }
        } else {
            filterData.startDate = selectedOption
            filterData.endDate = selectedOption
            filterData.status = ''
            filterData.customer = ''
            this.setState({ selectedStatus: selectedOption, selectedCustomer: selectedOption, search: false, tooltipOpen: null })
        }
        this.setState({ filterData, search: !!selectedOption ? true : false, offset: 1 },
            () => this.filterEstimateData())

    }

    validateDateInput = (inputValue, type) => {
        const errorMsg = inputValue && (isNaN(_toDateConvert(inputValue)?.getTime()) 
            ? `${type === "startDate" ? "Start" : "End"} date must be a valid date.` 
            : "");
    
        this.setState((prevState) => ({
            dateErrors: { ...prevState.dateErrors, [type]: errorMsg }
        }));
    
        if (errorMsg) this.props.showSnackbar(errorMsg, true);
    };
    
    handleDateChange = (e, type) => {
        const inputValue = e.target.value;
        this.validateDateInput(inputValue, type);
    };

    filterEstimateData = async () => {
        let filterQuery = cloneDeep(this.state.filterData)
        let { startDate, endDate, customer, status } = filterQuery
        let queryString = `pageNo=${this.state.offset}&pageSize=${this.state.limit}&sortBy=${this.state.sortTye}&sortType=${!!this.state.sort ? 'asc' : 'desc'}`
        if (status) {
            queryString += `&status=${status}`
        }
        if (customer) {
            queryString += `&customer=${customer}`
        }
        if (startDate) {
            queryString += `&startDate=${startDate}`
        }
        if (endDate) {
            queryString += `&endDate=${endDate}`
        }
        const urlParams = new URLSearchParams(queryString);
        urlParams.delete('pageNo');
        urlParams.delete('pageSize');
        urlParams.delete('sortBy');
        urlParams.delete('sortType');
        const pathname = this.props.location.pathname;
        history.push({
            pathname,
            search: urlParams.toString()
        });
        this.fetchEstimateInvoice(queryString)
    }

    onFilterClick = () => {
        this.setState(prevState => {
            if(prevState.showFilter){
                this.fetchEstimateInvoice('')
            }
            return {
                showFilter: !prevState.showFilter,
                search: !prevState.search
            }
        })
    }

    toggle = (id) => {
        const isOpen = this.state.tooltipOpen === id;
        this.setState({
          tooltipOpen: isOpen ? null : id,
        });
    };

    _handlePageChange = (type, {page, sizePerPage}) => {
        let {queryData, offset, limit, sort, sortTye} = this.state;
        if(type === 'pagination'){
            let pageNo = !!page ? page : offset;
            if(this.state.limit !== sizePerPage){
                pageNo = 1;
            }
            queryData = queryData.replace(`pageNo=${offset}`, `pageNo=${pageNo}`)
            queryData = queryData.replace(`pageSize=${limit}`, `pageSize=${!!sizePerPage ? sizePerPage : limit}`)
            this.setState({offset: pageNo, queryData, limit: sizePerPage})
            localStorage.setItem('paginationData', JSON.stringify({offset: pageNo, queryData, limit: sizePerPage}))
        }else if(type === 'sort'){
            const sortBy = !sort
            if(queryData.includes('sort')){
               queryData = queryData.replace(`sortType=${!!sort ? 'asc': 'desc'}`, `sortType=${!!sortBy ? 'asc' : 'desc'}`)
            }else{
                queryData += `&sortType=${!!sortBy ? 'asc': 'desc'}&sortBy=${sortTye}`

            }
            this.setState({queryData, sort: sortBy})
        }
        this.fetchEstimateInvoice(queryData);
    }

    render() {
        const { customerList, selectedCustomer, selectedStatus, filterData, offset, limit, search, totalData } = this.state
        const { estimate: {type, data} } = this.props
        return (
            <div className="content-wrapper__main estimate">
                <header className="py-header--page estimate-header-page">
                    <div className="pull-right">
                        <Button 
                        onClick={() => history.push('/app/estimates/add')} 
                        disabled={handleAclPermissions(['Viewer'])} 
                        color="primary"
                        >Create an estimate</Button>
                    </div>
                    <div className="py-header--title">
                        <h1 className="py-heading--title">Estimates</h1>
                    </div>
                </header>
                {
                    type === FETCH_ESTIMATE_SUCCESS && (

                        <div className="estimate__filter__container">
                            <div className="estimate-filter--customer">
                                <SelectBox
                                    getOptionValue={(value)=>(value["_id"])}
                                    getOptionLabel={(value)=>(value["customerName"])}
                                    value={selectedCustomer}
                                    onChange={cust => this.handleSelectChange(cust, 'customer')}
                                    options={customerList}
                                    placeholder="All customers"
                                    isClearable
                                    isDisabled={data.estimates.length === 0 && !search}
                                />
                            </div>
                            <div className="estimate-filter--status">
                                <SelectBox
                                    value={selectedStatus}
                                    onChange={(status) => this.handleSelectChange(status, 'status')}
                                    options={FILTER_CONST}
                                    isClearable
                                    placeholder="All statuses"
                                    isDisabled={data.estimates.length === 0 && !search}
                                />
                            </div>
                            <div className="estimate-filter--date">
                                <div className="DateRange__control">
                                    <div className="from-filed me-3">
                                        <DatepickerWrapper
                                            value={!!filterData.startDate && _toDateConvert(filterData.startDate)}
                                            onChange={date => this.handleSelectChange(date, 'startDate')}
                                            maxDate={!!filterData.endDate && _toDateConvert(filterData.endDate)}
                                            onBlur={(e) => this.handleDateChange(e, "startDate")}
                                            strictParsing
                                            className="form-control"
                                            popperPlacement="top-end"
                                            placeholderText="From"
                                            dropdownMode="select"
                                            disabled={data.estimates.length === 0 && !search}
                                        />
                                    </div>
                                    {/* <span className="mx-2">to</span> */}
                                    <div className="to-field">
                                        <DatepickerWrapper
                                            value={!!filterData.endDate && _toDateConvert(filterData.endDate)}
                                            onChange={date => this.handleSelectChange(date, 'endDate')}
                                            minDate={!!filterData.startDate && _toDateConvert(filterData.startDate)}
                                            onBlur={(e) => this.handleDateChange(e, "endDate")}
                                            strictParsing
                                            popperPlacement="top-end"
                                            className="form-control"
                                            placeholderText="To"
                                            dropdownMode="select"
                                            disabled={!!data && data.estimates.length === 0 && !search}
                                        />
                                    </div>
                                </div>
                                <Tooltip placement="top" isOpen={this.state.tooltipOpen === `reset`}
                                    target={`reset`}
                                    toggle={() => this.toggle(`reset`)}>
                                    Reset filters
                                </Tooltip>
                                <a className="fillter__action__btn" href="javascript:void(0)" id="reset" onClick={() => this.handleSelectChange(undefined, 'clear')}>
                                    <span className='fa fa-refresh'></span>
                                </a>
                            </div>
                        </div>
                    )
                }

                <div className="estimate-list-table mt-3">
                    {
                        type === FETCH_ESTIMATE_LOADING ?
                        <CenterSpinner /> :
                        type === FETCH_ESTIMATE_SUCCESS && data.estimates.length === 0 ?
                        (<NoDataMessage
                            title="estimates"
                            buttonTitle="estimate"
                            add={() => history.push('/app/estimates/add')}
                            filter={search}
                            btnText={"Create an"}
                            secondryMessage="Create a new estimate to send to your customer."
                        />)
                        : type === FETCH_ESTIMATE_SUCCESS ? (
                        <DataTableWrapper
                        data={data.estimates || []}
                        columns={columns}
                        defaultSorted={""}
                        classes="py-table py-table--hover py-table--condensed py-table__v__center"
                        from="estimateList"
                        hover={true}
                        changePage={this._handlePageChange}
                        page={offset}
                        limit={limit}
                        totalData={data.meta.total}
                        sort={this.state.sort}
                        sortField='date'
                    />
                    ) : (<NoDataMessage
                        title="estimate"
                        buttonTitle="estimate"
                        add={() => history.push('/app/estimates/add')}
                        filter={search}
                        btnText={"Create an"}
                        secondryMessage="Create a new estimate and send it to customer."
                    />)
                    }
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    businessInfo: state.businessReducer.selectedBusiness,
    estimate: state.estimateReducer
});

const mapDispatchToProps = dispatch => {
    return {
        showSnackbar: (message, error) => {
            dispatch(openGlobalSnackbar(message, error));
        },
        getEstimates: filter => {
            dispatch(getEstimates(filter))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Estimates);
