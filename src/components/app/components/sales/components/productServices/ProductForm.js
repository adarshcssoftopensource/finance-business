import history from "../../../../../../customHistory";
import { cloneDeep } from "lodash";
import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Button, Form, Input, Label, ModalFooter, Spinner } from "reactstrap";
import { bindActionCreators } from "redux";
import _ from 'lodash';
import * as ProductActions from "../../../../../../actions/productAction";
import { openGlobalSnackbar } from "../../../../../../actions/snackBarAction";
import taxServices from "../../../../../../api/TaxServices";
import { ValidationMessages } from "../../../../../../global/ErrorBoxes/Message";
import { changePriceFormat, logger, handleAclPermissions } from "../../../../../../utils/GlobalFunctions";
import { CreateAccountModal } from "../supportComponent/CreateAccountModal";
import Taxes from "../Taxes";

import { IncomeTab } from "./IncomeConstant";
import { openBlocks } from "../../../../../../global/Sidebar";
import CenterSpinner from '../../../../../../global/CenterSpinner';
import FormValidationError from "../../../../../../global/FormValidationError";

const initialProduct = (state, isEditMode) => {
  let data = {
    id: (state && state._id) || "",
    userId: (state && state.userId) || localStorage.getItem("user.id"),
    // businessId: (state && state.businessId) || localStorage.getItem("businessId"),
    name: (state && state.name) || "",
    description: (state && state.description) || "",
    price: parseFloat((state && state.price) || 0).toFixed(2),
    buy: state
      ? state.buy
      : {
        allowed: false
      },
    sell: state
      ? state.sell
      : {
        allowed: false
      },
    taxes: (state && state.taxes) || []
  };
  if (!isEditMode) {
    delete data.id;
  }
  return data;
};

class ProductForm extends Component {
  state = {
    taxList: [],
    modal: false,
    errorMessage: "",
    activeTab: "3",
    collapse: false,
    addNewIncome: IncomeTab,
    productModel: initialProduct(),
    typeError: false,
    nameError: false,
    btnLoad: false
  };

  componentDidMount() {
    const { isEditMode, selectedProduct, errorMessage } = this.props;
    const onSelect = isEditMode
      ? selectedProduct
      : null;
    const formatedData = initialProduct(onSelect, isEditMode);
    // if(isEditMode){   this.setState({     productModel: {
    // ...this.state.productModel, price: parseFloat(formatedData.price).toFixed(2)
    // }   }) }
    this.fetchtaxList();
    this.setState({ productModel: formatedData });
  }

  componentDidUpdate(prevProps) {
    const { isEditMode, selectedProduct } = this.props;
    if (prevProps.selectedProduct != selectedProduct) {
      const onSelect = isEditMode
        ? selectedProduct
        : null;
      const formatedData = initialProduct(onSelect, isEditMode);
      this.setState({ productModel: formatedData });
    }
  }

  fetchtaxList = async () => {
    const response = (await taxServices.fetchTaxes()).data.taxes;
    this.setState({ taxList: response });
  };

  handleModalToggle = () => {
    this.setState({
      modal: !this.state.modal
    });
  };

  handleTabToggle = tab => {
    if (this.state.activeTab !== tab) {
      this.setState({ activeTab: tab });
    }
  };

  handleText = event => {
    const target = event.target;
    const { name, value } = event.target;
    let modal = this.state.productModel;
    if (target.type === "checkbox") {
      if (name === "sell") {
        modal.sell.allowed = !modal.sell.allowed;
        modal.sell.account = "";
      } else {
        modal.buy.allowed = !modal.buy.allowed;
        modal.buy.account = "";
      }
      this.setState({ productModel: modal, typeError: false });
    } else if (name === "taxes") {
      modal
        .taxes
        .push(value);
    } else if (name === 'price') {
      if (value.length <= 12) {
        this.setState({
          productModel: {
            ...this.state.productModel,
            [name]: value
          }
        });
      }
    } else {
      this.setState({
        productModel: {
          ...this.state.productModel,
          [name]: value
        }
      });
    }
  };

  handleCollapseToggle = (item, type, subTitle) => {
    let updateData = this
      .state
      .addNewIncome
      .map(list => {
        if (list.title === item.title && type === "mainList") {
          list.incomeShowMore = !list.incomeShowMore;
        } else if (list.title === item.title && type === "subList") {
          list
            .content
            .map(contentList => {
              if (contentList.title === subTitle) {
                contentList.showMore = !contentList.showMore;
              }
              return contentList;
            });
        }
        return list;
      });
    this.setState({
      addNewIncome: updateData
      // collapse: !this.state.collapse
    });
  };

  handleValidation = e => {
    // e.preventDefault();
    if (!this.state.productModel.sell.allowed && !this.state.productModel.buy.allowed) {
      this.setState({ typeError: true })
    }
  };

  productFormSumbit = event => {
    event.preventDefault();
    let productObj = cloneDeep(this.state.productModel);
    let pId = productObj.id;
    delete productObj.id;
    delete productObj.userId;
    productObj.price = changePriceFormat(productObj.price, 2);
    let payload = {
      productInput: {
        ...productObj
      }
    };
    if (!payload.productInput.name || payload.productInput.name === " ") {
      this.setState({ nameError: true })
      document.getElementById('name').focus()
    } else {
      this.setState({ nameError: false })
    }
    if (!this.props.flag) {
      if (this.state.productModel.sell.allowed || this.state.productModel.buy.allowed) {
        this.setState({ typeError: false })
      } else {
        this.setState({ typeError: true })
      }
      if ((!!payload.productInput.name && payload.productInput.name !== " ") && (this.state.productModel.sell.allowed || this.state.productModel.buy.allowed)) {
        this.saveProduct(payload, pId);
      }
    } else {
      if (this.props.buyOnly) {
        payload.productInput.buy = {
          allowed: true
        };
      } else {
        payload.productInput.sell = {
          allowed: true
        };
      }
      if (payload.productInput.name) {
        this.saveProduct(payload, pId);
      }

    }
  };

  saveProduct = async (payload, productId) => {
    const { isEditMode, flag, updateList } = this.props;
    const isPurchase = this.props.location.pathname.includes('purchase');
    if (this.state.typeError) {
      return;
    }
    let response;
    try {
      this.setState({ btnLoad: true })
      if (isEditMode) {
        response = await this
          .props
          .actions
          .updateProduct(productId, payload);
        if (response.error) {
          this.setState({ btnLoad: false })
          this
            .props
            .showSnackbar(response.message, true);
        } else {
          this
            .props
            .showSnackbar(response.message, false);
          this.setState({ btnLoad: false })
          if (!flag) {
            if (payload.productInput.sell.allowed && !payload.productInput.buy.allowed) {
              const sideBlock = {
                ...openBlocks,
                salesOpen: true
              }
              localStorage.setItem('sidebarToggleHistory', JSON.stringify(sideBlock))
              history.push("/app/sales/products");
            } else if (!payload.productInput.sell.allowed && payload.productInput.buy.allowed) {
              const sideBlock = {
                ...openBlocks,
                purchaseOpen: true
              }
              localStorage.setItem('sidebarToggleHistory', JSON.stringify(sideBlock))
              history.push("/app/purchase/products");
            } else {
              if (isPurchase) {
                const sideBlock = {
                  ...openBlocks,
                  purchaseOpen: true
                }
                localStorage.setItem('sidebarToggleHistory', JSON.stringify(sideBlock))
                history.push("/app/purchase/products");
              } else {
                const sideBlock = {
                  ...openBlocks,
                  salesOpen: true
                }
                localStorage.setItem('sidebarToggleHistory', JSON.stringify(sideBlock))
                history.push("/app/sales/products");
              }
            }
          }
        }
      } else {
        response = await this
          .props
          .actions
          .addProduct(payload);
        if (response.error) {
          this.setState({ btnLoad: false })
          this
            .props
            .showSnackbar(response.message, true);
        } else {
          this.setState({ btnLoad: false })
          if (!flag) {
            if (payload.productInput.sell.allowed && !payload.productInput.buy.allowed) {
              const sideBlock = {
                ...openBlocks,
                salesOpen: true
              }
              localStorage.setItem('sidebarToggleHistory', JSON.stringify(sideBlock))
              history.push("/app/sales/products");
              this
                .props
                .showSnackbar(response.message, false);
            } else if (!payload.productInput.sell.allowed && payload.productInput.buy.allowed) {
              const sideBlock = {
                ...openBlocks,
                purchaseOpen: true
              }
              localStorage.setItem('sidebarToggleHistory', JSON.stringify(sideBlock))
              history.push("/app/purchase/products");
            } else {
              if (isPurchase) {
                const sideBlock = {
                  ...openBlocks,
                  purchaseOpen: true
                }
                localStorage.setItem('sidebarToggleHistory', JSON.stringify(sideBlock))
                history.push("/app/purchase/products");
              } else {
                const sideBlock = {
                  ...openBlocks,
                  salesOpen: true
                }
                localStorage.setItem('sidebarToggleHistory', JSON.stringify(sideBlock))
                history.push("/app/sales/products");
              }
            }
          }
        }
      }
      if (flag) {
        const prodData = {
          item: response._id,
          name: response.name,
          description: response.description,
          quantity: 1,
          price: response.price,
          taxes: response.taxes
        };
        updateList(prodData);
      }
    } catch (error) {
      logger.error("error", error)
      this.setState({ btnLoad: false })
      this
        .props
        .showSnackbar(error.message, true);
    }
  };

  handleSelectChange = selectedOption => {
    let productModel = this.state.productModel;
    let selectedTax = selectedOption.map(item => {
      return item.value;
    });
    productModel.taxes = selectedTax;
    this.setState({ productModel });
  };

  _handleParseDecimal(e) {
    const { name, value } = e.target;
    if (!!value) {
      this.setState({
        productModel: {
          ...this.state.productModel,
          [name]: parseFloat(value).toFixed(2)
        }
      })
    } else {
      this.setState({
        productModel: {
          ...this.state.productModel,
          [name]: parseFloat(0.00).toFixed(2)
        }
      })
    }
  }

  render() {
    const { isEditMode, flag, selectedLoading } = this.props;
    const {
      activeTab,
      taxList,
      modal,
      addNewIncome,
      productModel,
      typeError,
      nameError,
    } = this.state;
    return (
      <Fragment>
        {
          !!isEditMode && !!selectedLoading ? <CenterSpinner /> : (

            <Form onSubmit={this.productFormSumbit} className="productServices-form">
              <div className="py-form-field py-form-field--inline mb-3">
                <Label htmlFor="name" className="py-form-field__label is-required">
                  Name
                </Label>
                <div className="py-form-field__element">
                  <Input
                    type="text"
                    name="name"
                    id="name"
                    className="py-form__element__s_medium"
                    value={productModel.name}
                    onChange={this.handleText}
                    maxLength={300}
                    onInvalid={e => e
                      .target
                      .setCustomValidity('This field is required')}
                    onInput={e => e
                      .target
                      .setCustomValidity('')} />
                  <div className="d-block">
                    <FormValidationError
                      showError={nameError}
                    />
                  </div>
                </div>
              </div>
              <div className="py-form-field py-form-field--inline mb-2">
                <Label htmlFor="description" className="py-form-field__label mt-1">
                  Description
                </Label>
                <div className="py-form-field__element mb-0">
                  <textarea
                    type="textarea"
                    rows={4}
                    className="py-form__element__medium form-control"
                    name="description"
                    id="description"
                    spellCheck={false}
                    value={productModel.description}
                    onChange={this.handleText}
                    maxLength={'300'} />
                </div>
              </div>
              <div className="py-form-field py-form-field--inline mb-2">
                <Label htmlFor="price" className="py-form-field__label">
                  Price
                </Label>
                <div className="py-form-field__element mb-0">
                  <Input
                    type="number"
                    name="price"
                    className="py-form__element__s_medium"
                    value={productModel.price}
                    onChange={this.handleText}
                    maxLength={12}
                    id={'price'}
                    autoComplete={'off'}
                    onBlur={this
                      ._handleParseDecimal
                      .bind(this)}
                    onFocus={e => e.target.select()}
                    required />
                </div>
              </div>
              {!flag && (
                <Fragment>
                  <div className="py-form-field py-form-field--inline mb-2">
                    <Label htmlFor="sell" className="py-form-field__label mt-1">Sell this</Label>
                    <div className="py-form-field__element mb-0">
                      <Label className="py-checkbox mb-0">
                        <Input
                          name="sell"
                          type="checkbox"
                          id="sell"
                          checked={productModel.sell && productModel.sell.allowed}
                          value={productModel.sell && productModel.sell.allowed}
                          onChange={this.handleText} />{' '}
                        <span className="py-form__element__faux"></span>
                        <span className="py-form__element__label">Add to Invoices.</span>
                      </Label>
                    </div>
                  </div>
                  <div className="py-form-field py-form-field--inline mb-2">
                    <Label htmlFor="buy" className="py-form-field__label mt-1">Buy this</Label>
                    <div className="py-form-field__element">
                      <Label className="py-checkbox">
                        <Input
                          name="buy"
                          id="buy"
                          type="checkbox"
                          checked={productModel.buy && productModel.buy.allowed}
                          value={productModel.buy && productModel.buy.allowed}
                          onChange={this.handleText} />{' '}
                        <span className="py-form__element__faux"></span>
                        <div className="py-form__element__label">Add to Bills.</div>
                      </Label>
                      <div className="d-block">
                        <FormValidationError
                          showError={typeError}
                          message={'Please indicate weather you will be buying or selling this product or both'}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="py-form-field py-form-field--inline mb-3">
                    <Label htmlFor="sales-tax" className="py-form-field__label">
                      Sales tax
                    </Label>
                    <div className="py-form-field__element">
                      <Taxes
                        taxList={taxList}
                        id="sales-tax"
                        taxValue={productModel}
                        isEditMode={isEditMode}
                        fetchtaxList={this.fetchtaxList}
                        onChange={this.handleSelectChange} />
                    </div>
                  </div>
                  <div className="py-form-field py-form-field--inline">
                    <div className="py-form-field__blank"></div>
                    <div className="py-form-field__element">
                      <Button
                        type="submit"
                        color="primary"
                        onClick={this
                          .handleValidation
                          .bind(this)}
                        disabled={handleAclPermissions(['Viewer']) || this.state.btnLoad}
                      >{this.state.btnLoad ? <Spinner size="sm" color="default" /> : 'Save'}</Button>{" "} {flag && (
                        <div>
                          <span className="pdL5 pdR5">or</span>
                          <Button onClick={this.props.onClose} color="primary" outline >Cancel</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Fragment>
              )}
              {_.includes(this.props.location.pathname, 'products')
                ? ""
                : (
                  <ModalFooter
                    className="pd-r-0 mt-4"
                  >
                    <Button
                      onClick={this.props.onClose}
                      color="primary" outline
                    >Cancel</Button>
                    {flag && !handleAclPermissions(['Viewer']) && (
                      <Fragment>
                        <Button type="submit" color="primary" disabled={this.state.btnLoad}>
                          {this.state.btnLoad ? <Spinner size="sm" color="default" /> : 'Add product'}
                        </Button>

                      </Fragment>
                    )}
                  </ModalFooter>
                )
              }
            </Form>
          )
        }

        <CreateAccountModal
          modal={modal}
          activeTab={activeTab}
          addNewIncome={addNewIncome}
          tabToggle={this.handleTabToggle}
          toggleModal={this.handleModalToggle}
          collapseToggle={this.handleCollapseToggle} />
      </Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    selectedProduct: state.productReducer.selectedProduct,
    selectedLoading: state.productReducer.selectedLoading,
    errorMessage: state.productReducer.errorMessage
  };
};

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators(ProductActions, dispatch),
    showSnackbar: (message, error) => {
      dispatch(openGlobalSnackbar(message, error));
    }
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProductForm));
