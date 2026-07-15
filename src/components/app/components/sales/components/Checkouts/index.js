import history from '../../../../../../customHistory';
import React, { Fragment } from 'react';
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom';
import CenterSpinner from '../../../../../../global/CenterSpinner';
import { Button, Container, Spinner } from 'reactstrap';
import { bindActionCreators } from 'redux'
import DataTableWrapper from '../../../../../../utils/dataTableWrapper/DataTableWrapper';
import * as CheckoutActions from '../../../../../../actions/CheckoutActions';
import { openGlobalSnackbar } from '../../../../../../actions/snackBarAction';
import { columns } from '../../../../../../constants/CheckoutConst';
import CheckoutDropdownWrapper from "../../../../../../global/CheckoutDropdownWrapper";
import { _documentTitle } from '../../../../../../utils/GlobalFunctions';
import NoCheckouts from '../../../../../common/NoCheckouts';
import { fetchPaymentSettings } from '../../../../../../actions/paymentSettings';
import { Redirect } from 'react-router-dom';

class Checkouts extends React.Component {
    constructor(props) {
        super(props);
      this.state = {
            dropdownOpen: -1,
            checkoutData: [],
            isLoadingData: true,
            getData:false,
            offSet:1,
            limit: 10,
            totalData: 0,
            sort: true
        };
    }

    actionRender = (cell, row, rowIndex, formatExtraData) => {
        return (
          <Fragment>
            <CheckoutDropdownWrapper onUpdate={this.onupdate} row={row} index={rowIndex} />
          </Fragment>
        );
    };

    onupdate = (err, message) => {
        this.props.showSnackbar(message, false);
        this.setState({
            getData:true
        })
    };

    componentDidMount() {
        const { selectedBusiness } = this.props;
        _documentTitle(selectedBusiness, 'Checkouts')
        if(columns.length == 4){
            columns.push({
                dataField: "",
                text: "Actions",
                formatter: this.actionRender,
                sort: false,
                classes: 'py-table__cell checkouts-action-row'
            });
        }
        this.props.fetchPaymentSettings()
    }

    componentDidUpdate() {
        if(this.state.getData){
            let queryData = `pageNo=1&pageSize=10`
            const pageData = localStorage.getItem('paginationData')
            if(!!pageData){
                const {limit} = JSON.parse(pageData)
                queryData = `pageNo=${this.state.offSet}&pageSize=${limit}&tab=${this.state.activeTab}`
                this.setState({queryData, limit})
            }
            this.fetchCheckouts(queryData);
            this.setState({
                getData:false
            })
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.paymentSettings !== nextProps.paymentSettings) {
            if (!nextProps.paymentSettings.loading) {
                const { data: { isConnected, isKycIssue, legalData } } = nextProps.paymentSettings
                if ((isConnected && !isKycIssue) || legalData?.isPayByBankEnabled || legalData?.isBnplEnabled) {
                    let queryData = `pageNo=1&pageSize=10`
                    const pageData = localStorage.getItem('paginationData')
                    if (!!pageData) {
                        const { limit } = JSON.parse(pageData)
                        queryData = `pageNo=${this.state.offSet}&pageSize=${limit}&tab=${this.state.activeTab}`
                        this.setState({ queryData, limit })
                    }
                    this.fetchCheckouts(queryData);
                }
            }
        }
    }

    fetchCheckouts(query) {
        this.setState({ isLoadingData: true })
        this.props.actions.fetchCheckouts(query)
            .then(result => {
                if (!result) {
                    this.setState({ isLoadingData: false });
                } else {
                    this.setState({ isLoadingData: false });
                }
            }).catch(error => {
                this.setState({ isLoadingData: false });
            });
    }

    _handlePageChange = (type, { page, sizePerPage }) => {
        if (type === 'pagination') {
            let pageNo = !!page ? page : this.state.offset;
            if (sizePerPage !== this.state.limit) {
                pageNo = 1
            }
            const sort = this.state.sort
            const query = `pageNo=${pageNo}&pageSize=${!!sizePerPage ? sizePerPage : this.state.limit}&sortBy=createdAt&sortType=${!!sort ? 'asc' : 'desc'}`
            this.fetchCheckouts(query)
            this.setState({ offset: pageNo, limit: sizePerPage })
            localStorage.setItem('paginationData', JSON.stringify({ offset: pageNo, query, limit: sizePerPage }))
        } else if (type === 'sort') {
            const sort = !this.state.sort
            const query = `pageNo=${this.state.offSet}&pageSize=${this.state.limit}&sortBy=createdAt&sortType=${!!sort ? 'asc' : 'desc'}`
            this.fetchCheckouts(query)
            this.setState({ sort })
        }
    }

    render() {
        const {isLoadingData} = this.state;
        const { checkouts:{meta, checkouts}, paymentSettings: { loading, data } } = this.props;
        const isConnected = data.isConnected || data?.legalData?.isPayByBankEnabled || data?.legalData?.isBnplEnabled;
        if (!!data && data.kycStatus !== 'verified' && !data.isProviderSwitched && !data?.legalData?.isPayByBankEnabled && !data?.legalData?.isBnplEnabled) {
            return <Redirect to="/app/payments" />
        }
        return (
            <div className={`content-wrapper__main checkoutWrapper ${((!checkouts || checkouts.length <= 0) && isLoadingData === false) && 'pdT0'}`}>
                {
                    loading ?
                    <Container className="mrT50 text-center">
                        <CenterSpinner />
                    </Container> :
                       (!isConnected) ?
                       (
                            <NoCheckouts
                                checkouts={checkouts}
                                isLoadingData={isLoadingData}
                                paymentSettings={data}
                                showCreate={(!checkouts || checkouts.length <= 0)}
                            />
                        )
                        : isLoadingData ? (
                        <Container className="mrT50 text-center">
                            <CenterSpinner />
                        </Container>) : (!checkouts || checkouts.length <= 0) ?(
                            <NoCheckouts
                                checkouts={checkouts}
                                isLoadingData={isLoadingData}
                                paymentSettings={data}
                                showCreate={(!checkouts || checkouts.length <= 0)}
                            />
                        ) :(
                            <div>
                                <header className="py-header mb-4">
                                    <div className="py-header--title">
                                        <h4 className="py-heading--title">Checkouts </h4>
                                    </div>
                                    <div className="py-header--actions">
                                        <Button onClick={() => history.push('/app/sales/checkouts/add')} color="primary" >Create a checkout</Button>
                                    </div>
                                </header>

                                <div className="checkout-list-table">
                                    <DataTableWrapper
                                    data={checkouts || []}
                                    columns={columns}
                                    classes="py-table py-table--condensed"
                                    defaultSorted={""}
                                    from="checkout"
                                    hover={true}
                                    changePage={this._handlePageChange}
                                    page={this.state.offset}
                                    limit={this.state.limit}
                                    totalData={meta.total}
                                    sort={this.state.sort}
                                    sortField='date created'
                                />
                            </div>
                        </div>
                    )
                }
            </div>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        checkouts: state.checkoutReducer.checkouts,
        isCheckoutAdd: state.checkoutReducer.isCheckoutAdd,
        isCheckoutUpdate: state.checkoutReducer.isCheckoutUpdate,
        selectedBusiness: state.businessReducer.selectedBusiness,
        paymentSettings: state.paymentSettings
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators(CheckoutActions, dispatch),
        showSnackbar: (message, error) => {
            dispatch(openGlobalSnackbar(message, error))
        },
        fetchPaymentSettings: () => {
            dispatch(fetchPaymentSettings())
        }
    };
};


export default withRouter((connect(mapStateToProps, mapDispatchToProps)(Checkouts)))
