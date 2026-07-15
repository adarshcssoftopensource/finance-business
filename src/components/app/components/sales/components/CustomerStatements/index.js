import React, { PureComponent, Fragment } from "react";
import {
    Badge,
    InputGroup,
    TabContent,
    TabPane,
    Nav,
    NavItem,
    NavLink,
    Card,
    CardBody,
    Button,
    Col,
    Input,
    Container,
    Label,
    // CustomInput,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    ListGroup,
    ListGroupItem,
    Table,
    Alert,
    Spinner,
    Row
} from "reactstrap";
// import classnames from "classnames";
import history from '../../../../../../customHistory';
import CenterSpinner from '../../../../../../global/CenterSpinner';
import { cloneDeep } from "lodash";
import queryString from 'query-string';
import SelectBox from "../../../../../../utils/formWrapper/SelectBox";
import DatepickerWrapper from "../../../../../../utils/formWrapper/DatepickerWrapper";
// import DataTableWrapper from "../../../../../../utils/dataTableWrapper/DataTableWrapper";
import { fetchCustomerStatements } from "../../../../../../api/CustomerStatementServices";
import * as CustomerStatementActions from '../../../../../../actions/CustomerStatementActions';
import { columns, defaultSorted, INVOICE_STATUS_FILTER } from "../../../../../../constants/invoiceConst";
import customerServices from "../../../../../../api/CustomerServices";
import { getStatementShareBaseURL, getInvoiceFilterQuery } from '../../../../../../utils/common';
import StatementView from './StatementView';
import MailStatement from "./MailStatement";
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { openGlobalSnackbar } from '../../../../../../actions/snackBarAction';
import { statementMailMessage } from "../helpers";
import { FETCH_CUSTOMER_STATEMENTS } from "../../../../../../constants/ActionTypes";
import { _toDateConvert } from "../../../../../../utils/globalMomentDateFunc";

class CustomerStatements extends PureComponent {

    constructor(props) {
        super(props);

        const today = new Date();
        this.state = {
            customerList: [],
            isLoadingStatement: false,
            isGeneratingPublicUrl: false,
            invoicesStatementData: {},
            invoicesStatementuuid: "",
            selectedCustomer: null,
            selectedStatus: undefined,
            filterData: {
                customer: "",
                startDate: new Date(today.setDate(today.getDate() - 30)),
                endDate: new Date()
            },
            dropdownOpen: false,
            visible: true,
            isShowUndepaid: true,
            openMail: false,
            statmentPublicUrl: '',
            selectedBusiness: {},
        };

        this.onDismiss = this.onDismiss.bind(this);
    }


    componentDidMount() {
        const { selectedBusiness } = this.props;

        document.title = selectedBusiness && selectedBusiness.organizationName ? `Finance - ${selectedBusiness.organizationName} - Customer Statements` : `Finance-Customer Statements`;
        this.fetchCustomersList();
        if (localStorage.getItem('isStatementVisible') === 'No') {
            this.onDismiss();
        }
    }

    toggleDropdown = () => {
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen
        }));

        if (this.state.dropdownOpen == false) {
            let filterQuery = cloneDeep(this.state.filterData);
            let { startDate, endDate, customer } = filterQuery;
            var filterQueryData = getInvoiceFilterQuery(customer, startDate, endDate, this.state.isShowUndepaid);
            this.generateStatmentPublicUrl(filterQueryData, false);
        }
    }

    toggleShowUnpaidChange = (evt) => {
        const checked = evt.target.checked;
        this.setState({
            isShowUndepaid: checked,
        });
        this.setState({ statmentPublicUrl: '' });
        setTimeout(() => {
            this.filterInvoiceData(checked);
        }, 500);
    }

    onDismiss() {
        localStorage.setItem('isStatementVisible', 'No');
        this.setState({ visible: false });
    }

    generateStatmentPublicUrl = async (filterQueryData, isRedirect) => {
        if (!this.state.statmentPublicUrl) {
            const response = await this.props.actions.generateStatement(filterQueryData);
            if (response && response.payload) {
                const statement = response.payload.statement;
                this.setState({ statmentPublicUrl: getStatementShareBaseURL() + statement.uuid, invoicesStatementuuid: statement.uuid });
                if (isRedirect) {
                    this.setState({ isGeneratingPublicUrl: false });
                    window.open(this.state.statmentPublicUrl, '_blank');
                }
            }
        } else if (isRedirect) {
            this.setState({ isGeneratingPublicUrl: false });
            window.open(this.state.statmentPublicUrl, '_blank');
        }
    }

    goToCustomerView = async () => {
        this.setState({ isGeneratingPublicUrl: true });
        let filterQuery = cloneDeep(this.state.filterData);
        let { startDate, endDate, customer } = filterQuery;
        var filterQueryData = getInvoiceFilterQuery(customer, startDate, endDate, this.state.isShowUndepaid);
        this.generateStatmentPublicUrl(filterQueryData, true);
    }

    fetchCustomerStatements = async (filterQueryData) => {
        const response = await this.props.actions.fetchCustomerStatements(filterQueryData);
        if (!!response && response.type === FETCH_CUSTOMER_STATEMENTS) {
            if (!!response.payload) {
                this.setState({ selectedCustomer: response.payload.statements.customer, invoicesStatementData: response.payload.statements, selectedBusiness: response.payload.statements.business, isLoadingStatement: false });
            }
        }
    };

    fetchCustomersList = async () => {
        const customerList = (await customerServices.fetchCustomersSlim()).data.customers
        this.setState({ customerList }, () => {
            const queryData = queryString.parse(this.props.location.search);
            let foundCustomer = [];
            if (queryData.customerId) {
                foundCustomer = this.state.customerList.filter(obj => obj._id === queryData.customerId);
            }
            const today = new Date();
            this.setState({
                filterData: {
                    ...this.state.filterData,
                    customer: foundCustomer && foundCustomer.length ? foundCustomer[0]._id : "",
                    startDate: queryData.startDate ? new Date(queryData.startDate) : new Date(today.setDate(today.getDate() - 30)),
                    endDate: queryData.endDate ? new Date(queryData.endDate) : new Date()
                },
                isShowUndepaid: !queryData.scope ? true : queryData.scope == "unpaid" ? true : false
            }, () => {
                if (foundCustomer && foundCustomer.length) {
                    this.handleSelectChange(foundCustomer[0], 'customer');
                }
            })
        })
        if (this.state.customerList && this.props.location.state && this.props.location.state.filterData) {
            let filterData = cloneDeep(this.props.location.state.filterData)
            this.setState({
                filterData: {
                    customer: filterData.customerId,
                    startDate: new Date(filterData.startDate),
                    endDate: new Date(filterData.endDate)
                }
            });

            this.setState({
                isShowUndepaid: (filterData.scope == "unpaid") ? true : false
            });


            var result = this.state.customerList.filter(obj => {
                return obj._id === filterData.customerId
            });
            if (result && result.length > 0) {
                this.handleSelectChange(result[0], 'customer');
            }
        }
    }

    handleSelectChange = (selectedOption, type) => {
        let filterData = cloneDeep(this.state.filterData)
        if (type === 'customer') {
            filterData.customer = selectedOption && selectedOption._id || ''
            this.setState({ selectedCustomer: selectedOption })

        } else if (type.includes("Date")) {
            filterData = {
                ...filterData, [type]: selectedOption
            }
        } else if (type === "invoiceNumber") {
            filterData.invoiceNumver = selectedOption;
        } else {
            filterData.startDate = selectedOption
            filterData.endDate = selectedOption
        }

        if (filterData.startDate <= filterData.endDate) {
            this.setState({ statmentPublicUrl: '' });
            this.setState({ filterData },
                () => this.filterInvoiceData(this.state.isShowUndepaid))
        } else {
            this.props.showSnackbar("From date shouldn't be more than to date", true);
        }
    }

    filterInvoiceData = async (isShowUndepaid) => {
        this.setState({ isLoadingStatement: true })
        let filterQuery = cloneDeep(this.state.filterData)
        let { startDate, endDate, customer } = filterQuery;

        if (startDate && endDate && customer) {
            this.setState({ invoicesStatementData: {} });
            var filterQueryData = getInvoiceFilterQuery(customer, startDate, endDate, isShowUndepaid);
            const queryData = Object.entries(filterQueryData.statementInput).map(([key, val]) => `${key}=${val}`).join("&");
            const urlParams = new URLSearchParams(queryData);
            const pathname = this.props.location.pathname;
            history.push({
                pathname,
                search: urlParams.toString()
            });
            this.fetchCustomerStatements(filterQueryData)
        } else {
            this.setState({ invoicesStatementData: {}, isLoadingStatement: false });
        }
    }

    isValidFilterForm() {
        let { startDate, endDate, customer } = this.state.filterData;
        return (startDate && endDate && customer);
    }


    openMailBox = () => {
        this.setState({
            openMail: true
        });
    };

    onCloseMail = () => {
        this.setState({
            openMail: false
        });
    };

    handleFocus = (event) => {
        event.preventDefault();
        event.target.select()
    }

    sendMailToUser = (e, type) => {
        const { invoicesStatementData, statmentPublicUrl } = this.state;
        const { selectedBusiness } = this.props;

        if (invoicesStatementData && statmentPublicUrl && selectedBusiness) {
            const url = statementMailMessage(invoicesStatementData, statmentPublicUrl, type, selectedBusiness)
            window.open(url)
        }
    }

    render() {
        const { openMail, customerList, selectedCustomer, selectedStatus, filterData, invoiceTotalAmt, invoicesStatementData, isShowUndepaid, statmentPublicUrl, isLoadingStatement, selectedBusiness, isGeneratingPublicUrl, invoicesStatementuuid } = this.state;
        // const { selectedBusiness } = this.props;
        return (
            <Fragment>
                <MailStatement
                    openMail={openMail}
                    invoicesStatementData={invoicesStatementData}
                    onClose={this.onCloseMail}
                    statementUuid={invoicesStatementuuid}
                />

                <div className="content-wrapper__main statement">
                    <header className="py-header--page flex">
                        <div className="py-header--title">
                            <h1 className="py-heading--title">Customer Statements </h1>
                        </div>
                    </header>
                    <div className="content">
                        <div className="alert-action alert-info" isOpen={this.state.visible} toggle={this.onDismiss}>
                            <div className="alert-icon">
                                <svg className="py-svg-icon icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M7.916 3.222C8.369 2.453 9.153 2 10 2c.848 0 1.632.453 2.085 1.222l6.594 12.196c.426.758.428 1.689.006 2.449-.424.765-1.147 1.122-2.084 1.133H3.391c-.928-.01-1.65-.368-2.075-1.133a2.51 2.51 0 0 1 0-2.436l6.6-12.21zm-4.76 12.904a.717.717 0 0 0-.002.696c.063.114.21.174.557.178h12.46c.356-.004.502-.064.565-.178a.723.723 0 0 0-.008-.708L10.564 4.298A.657.657 0 0 0 10 3.97a.656.656 0 0 0-.557.317l-6.287 11.84zM10 14a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-6a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0V9a1 1 0 0 1 1-1z"></path></svg>
                            </div>
                            <div className="alert-content pe-4 me-3">
                                <h4 className="alert-title">Statements: A clear overview of your customer's invoices and payments</h4>
                                <div className="alert-desc">
                                    <p className="text-justify">Customer statements allows you to summarize all the invoices and payments for a customer between two dates in a single view. Generate and send a statement to any customer that owes more than one outstanding invoice, or any customer that is requesting all their activity between two dates.</p>
                                </div>
                            </div>
                        </div>
                        <div className="py-box py-box--large customer-statements--filter__container">
                            <div className="py-box--content">
                                <div className="customer-statements--filter__content">
                                    <div className="py-form-field py-form-field--inline">
                                        <Label for="select-customer" className="is-required me-3 mt-2">Customer</Label>
                                        <div className="py-form-field">
                                            <SelectBox
                                                id={'select-customer'}
                                                getOptionLabel={(value) => (value["customerName"])}
                                                getOptionValue={(value) => (value["_id"])}
                                                placeholder="Select a customer"
                                                value={selectedCustomer}
                                                onChange={cust => this.handleSelectChange(cust, 'customer')}
                                                options={customerList}
                                                isClearable
                                            />
                                            <label className="py-checkbox">
                                                <input
                                                    checked={isShowUndepaid}
                                                    className="py-form__element"
                                                    type="checkbox"
                                                    onChange={this.toggleShowUnpaidChange}
                                                    id="isShowUndepaid" name="isShowUndepaid"
                                                />
                                                <span className="py-form__element__faux"></span>
                                                <span className="py-form__element__label">Show unpaid invoices only</span>
                                            </label>
                                            {/* <CustomInput type="checkbox" checked={isShowUndepaid} onChange={this.toggleShowUnpaidChange} id="isShowUndepaid" name="isShowUndepaid" label="Show unpaid invoices only" /> */}
                                        </div>
                                    </div>
                                </div>
                                <div className="customer-statements--filter__range">
                                    <div className="d-flex align-items-center me-3">
                                        <Label for="from" className="me-3 is-required">From</Label>
                                        <DatepickerWrapper
                                            className="form-control"
                                            popperPlacement="top-end"
                                            id="from"
                                            maxDate={filterData.endDate ? _toDateConvert(filterData.endDate) : ''}
                                            selected={filterData.startDate}
                                            onChange={date => this.handleSelectChange(date, 'startDate')}
                                        />
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <Label for="to" className="me-3 is-required">To</Label>
                                        <DatepickerWrapper
                                            className="form-control"
                                            popperPlacement="top-end"
                                            id="to"
                                            minDate={filterData.startDate ? _toDateConvert(filterData.startDate) : ''}
                                            selected={filterData.endDate}
                                            onChange={date => this.handleSelectChange(date, 'endDate')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {!!invoicesStatementData && !!invoicesStatementData.statements && invoicesStatementData.statements.length > 0 ? (
                            <div>
                                <div className="py-action-bar">
                                    <div className="d-flex align-items-center justify-content-end">
                                        <Button disabled={isGeneratingPublicUrl == true} onClick={this.goToCustomerView} className="me-2" color="primary" outline >Preview the customer view {isGeneratingPublicUrl && <Spinner size="md" color="default" />}</Button>
                                        <Dropdown isOpen={this.state.dropdownOpen} direction={'bottom'} toggle={this.toggleDropdown}>
                                            <DropdownToggle color="primary" caret>Send</DropdownToggle>
                                            <DropdownMenu left style={{ width: '300px' }}>
                                                <DropdownItem onClick={this.openMailBox}>Send with Finance</DropdownItem>
                                                {/* <span className="dropdown-item-divider"></span>
                                                    <div className="dropdown-menu-item--header"><strong>Send using</strong></div>
                                                    <DropdownItem><span className="pointer" onClick={(e) => this.sendMailToUser(e, 'gmail')}>Gmail</span></DropdownItem>
                                                    <DropdownItem><span className="pointer" onClick={(e) => this.sendMailToUser(e, 'yahoo')}>Yahoo! Mail</span></DropdownItem>
                                                    <DropdownItem><span className="pointer" onClick={(e) => this.sendMailToUser(e, 'outlook')}>Outlook</span></DropdownItem> */}
                                                <DropdownItem divider />
                                                <DropdownItem header>Share URL</DropdownItem>
                                                <DropdownItem toggle={false}>
                                                    <Input
                                                        type="text"
                                                        name="shareLink"
                                                        onClick={this.handleFocus}
                                                        ref="publicUrl"
                                                        className="js-public--link"
                                                        value={statmentPublicUrl} />
                                                    <span className="py-text--small py-text--hint">Press Cmd+C or Ctrl+C to copy to clipboard</span>
                                                </DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>
                                    </div>
                                </div>
                                <div className="box-shadow--py-page">
                                    {
                                        invoicesStatementData.statements.map((item, idx) => (
                                            <div key={idx} className="d-flex align-items-center" >
                                                <StatementView isPublic={false} invoicesStatementData={item} isShowUndepaid={isShowUndepaid} selectedBusiness={selectedBusiness} selectedCustomer={selectedCustomer} filterData={filterData} {...this.props} />
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>) : (
                            <Fragment>
                                {isLoadingStatement == true ?
                                    (<Container className="mrT50 text-center">
                                        <h3>Loading your customer statement...</h3>
                                        <CenterSpinner />
                                    </Container>) : (
                                        <div className="text-center" >
                                            <img src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/no-statements-img.png`} alt="" className="logo" />
                                            <p className="py-text">
                                                You haven't generated any statements yet
                                                <br />
                                                Select a customer to generate a statement.
                                            </p>
                                        </div>
                                    )
                                }
                            </Fragment>
                        )
                        }

                        {this.isValidFilterForm() || !selectedCustomer ? "" :
                            (<Row className="mrT50" hidden={this.isValidFilterForm() || !selectedCustomer}>
                                <Col xs={12} sm={12} md={12} lg={12} className="text-center">
                                    <h6>
                                        Please select all filter values
                                    </h6>
                                </Col>
                            </Row>)
                        }
                    </div>
                </div>
            </Fragment>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        business: state.businessReducer.business,
        selectedBusiness: state.businessReducer.selectedBusiness
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators(CustomerStatementActions, dispatch),
        showSnackbar: (message, error) => {
            dispatch(openGlobalSnackbar(message, error))
        }
    };
}


export default withRouter((connect(mapStateToProps, mapDispatchToProps)(CustomerStatements)))
// export default CustomerStatements;
