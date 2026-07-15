import history from "../../../../../../customHistory";
import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Button, Card, CardBody } from "reactstrap";
import { bindActionCreators } from "redux";
import * as ProductActions from "../../../../../../actions/productAction";
import CenterSpinner from "../../../../../../global/CenterSpinner";
import { NoDataMessage } from "../../../../../../global/NoDataMessage";
import DataTableWrapper from '../../../../../../utils/dataTableWrapper/DataTableWrapper';
import {columns} from '../supportComponent/productConstant';
import { logger, handleAclPermissions } from "../../../../../../utils/GlobalFunctions";
import _ from 'lodash'

class ProductServices extends PureComponent {
  state = {
    loading: false,
    offset: 1,
    limit: 10
  };

  componentDidMount() {
    const { selectedBusiness } = this.props;
    document.title = selectedBusiness && selectedBusiness.organizationName ? `Finance - ${selectedBusiness.organizationName} - Products & Services` : `Finance - Products & Services`;
    const pageData = localStorage.getItem('paginationData')
    let queryData = `pageNo=${this.state.offset}&pageSize=${this.state.limit}`
    if(!!pageData){
    const {limit} = JSON.parse(pageData)
      queryData = `pageNo=${this.state.offset}&pageSize=${limit}`
      this.setState({queryData, limit})
    }
    this.fetchProducts(queryData)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.url !== nextProps.url) {
      const pageData = localStorage.getItem('paginationData')
      let queryData =`pageNo=${this.state.offset}&pageSize=${this.state.limit}`
      if(!!pageData){
        const {limit} = JSON.parse(pageData)
        queryData = `pageNo=${this.state.offset}&pageSize=${limit}`
        this.setState({queryData, limit})
      }
      this.fetchProducts(queryData)
    }
  }

  fetchProducts = (query) => {
    const type = _.includes(window.location.pathname, 'sales') ? 'sell' : 'buy';
    this.setState({ loading: true });
    this.props.actions.fetchProducts(type, query)
      .then(result => {
        if (result) {
          // this.setState({ loading: true });
          this.setState({ loading: false })
        }
      }).catch(err => {
        this.setState({ loading: false })
      });
  };

  _handlePageChange = (type, {page, sizePerPage}) => {
    logger.log("type", type)
    if(type === 'pagination'){
      let pageNo = !!page ? page : this.state.offset;
      if(sizePerPage !== this.state.limit){
        pageNo = 1;
      }
      const query = `pageNo=${pageNo}&pageSize=${!!sizePerPage ? sizePerPage : this.state.limit}`
      this.fetchProducts(query)
      this.setState({offset: pageNo, limit: sizePerPage})
      localStorage.setItem('paginationData', JSON.stringify({offset: pageNo, query, limit: sizePerPage}))
    }
  }

  render() {
    const { loading } = this.state;
    const { productsData } = this.props
    const type = _.includes(this.props.location.pathname, 'sales');
    return (
      <div className="content-wrapper__main product-service-wrapper">
        <header className="py-header--page d-flex flex-wrap">
          <div className="py-header--title product-header-title">
            <h2 className="py-heading--title">{`Products & Services (${_.includes(this.props.location.pathname, 'sales') ? 'Sales' : "Purchases"})`}</h2>
          </div>
          {!handleAclPermissions(['Viewer']) && <div className="py-header--actions">
            <Button
              onClick={() => history.push(`${this.props.url}/products/add`)}
              color="primary" >Add a product or service</Button>
          </div>}
        </header>
        <div className="content">
              {
                loading ?
                  <CenterSpinner color="primary" size="md" className="loader" /> :
                !!productsData && productsData.products && productsData.products.length > 0 ? (
                  <DataTableWrapper
                    data={productsData.products || []}
                    columns={columns}
                    defaultSorted={""}
                    classes="py-table py-table--hover py-table--condensed py-table__v__center"
                    from="productList"
                    hover={true}
                    changePage={this._handlePageChange}
                    page={this.state.offset}
                    limit={this.state.limit}
                    totalData={productsData.meta.total}
                  />
                ) : (
                  <NoDataMessage
                    title="products &amp; services"
                    buttonTitle="product or service"
                    btnText={"Add a"}
                    add={() => history.push(`${this.props.url}/products/add`)}
                    filter={false}
                    secondryMessage={`Add a new product or service ${type ? 'and use in invoices  and estimates' : 'for bills'}.`}
                  />
                )}
          </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    productsData: state.productReducer.products,
    currency: state.businessReducer.selectedBusiness.currency && state.businessReducer.selectedBusiness.currency.symbol || '',
    isProductAdd: state.productReducer.isProductAdd,
    isProductUpdate: state.productReducer.isProductUpdate,
    selectedBusiness: state.businessReducer.selectedBusiness
  };
};
const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators(ProductActions, dispatch)
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ProductServices)
);
