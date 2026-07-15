import history from "../../../../../customHistory";
import _, { cloneDeep } from "lodash";
import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import CenterSpinner from '../../../../../global/CenterSpinner'
import SelectBox from "../../../../../utils/formWrapper/SelectBox";
import { Form, FormGroup, Input, Label, Spinner, Button } from "reactstrap";
import DatepickerWrapper from "../../../../../utils/formWrapper/DatepickerWrapper";
import { openGlobalSnackbar } from "../../../../../actions/snackBarAction";
import {
  addEstimate,
  checkEstimateNumberExist,
  createLatestEstimateNumber,
  updateEstimate
} from "../../../../../api/EstimateServices";
import { currentExchangeRate } from "../../../../../api/globalServices";
import taxServices from "../../../../../api/TaxServices";
import {
  _setCurrency, _showExchangeRate, getAmountToDisplay, logger, _calculateExchangeRate,
  handleAclPermissions
} from "../../../../../utils/GlobalFunctions";
import Taxes from "../../sales/components/Taxes";
import {
  calculateTaxes,
  estimatePayload,
  estimateProductObject,
  getSelectedCurrency,
  getSelectedCustomer,
  setFormData
} from "./constant";
import { EstimateAlert } from "./EstimateInvoiceComponent";
import Popup from "./Popup";
import EstimateInfoForm from '../../invoice/common/EstimateInfoForm';
import CustomizeHeader from '../../invoice/common/CustomizeHeader'
import AddItemComponent from "../../invoice/common/AddItemComponent";
import TotalComponent from "../../invoice/common/TotalComponent";
import { ReactSVG } from "react-svg";
import SingleTax from '../../sales/components/Taxes/SingleTax'
import pluralize from 'pluralize'
import ReactDragListView from 'react-drag-listview/lib/index.js';
import debounce from 'lodash/debounce'
import FormValidationError from "../../../../../global/FormValidationError";
import { _getDiffDate, _toDateConvert, _formatDate } from "../../../../../utils/globalMomentDateFunc";
import icDeleteSvg from "../../../../../assets/icons/ic_delete.svg"
import icAddSvg from "../../../../../assets/icons/ic_add.svg"

const sampleProduct = {
  item: "",
  description: "",
  quantity: 1,
  price: undefined,
  taxes: [],
  hideAddButton: false
};

class EstimateForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showExchange: false,
      selectedCustomer: {},
      currencies: [],
      estimatePayload: estimatePayload(null, this.props.businessInfo, this.props.userSettings),
      customers: [],
      products: [],
      currency: "",
      taxList: [],
      openPopup: false,
      type: "All",
      estimateNumber: 0,
      isEstimateNumberExist: false,
      minDate: new Date(),
      loader: false,
      openHeader: false,
      memo: '',
      btnLoad: false,
      openProduct: false,
      custErr: false,
      estName: false,
      estNo: false,
      estMessage: ''
    };
    this.list = []
    this.memoRef = React.createRef()
  }


  componentDidMount() {
    const { isEditMode, selectedEstimate, businessInfo, isDuplicate } = this.props;
    window.addEventListener("beforeunload", this.onUnload)
    // window.onbeforeunload = () /=> true;
    document.title = businessInfo && businessInfo.organizationName ? `Finance - ${businessInfo.organizationName} - Estimate` : `Finance - Estimate`;
    this.debounceEvent = debounce(currentExchangeRate, 500)
    let formatedData = this.state.estimatePayload;
    if (isEditMode) {
      let showExchange = _showExchangeRate(businessInfo.currency, (selectedEstimate && selectedEstimate.currency));
      formatedData = estimatePayload(selectedEstimate, businessInfo);
      this.setState({ estimatePayload: formatedData, showExchange, loader: true });
    }
    this.fetchtaxList();
    this.fetchFormData(formatedData);
    if (!isEditMode) {
      this.createEstimateNumber();
    }
  }

  componentDidUpdate(prevProps) {
    const { selectedEstimate, businessInfo } = this.props;
    if (prevProps.selectedEstimate !== selectedEstimate) {
      let showExchange = _showExchangeRate(businessInfo.currency, selectedEstimate.currency);
      let formatedData = estimatePayload(selectedEstimate, businessInfo);
      this.setState({ estimatePayload: formatedData, showExchange });
      this.fetchFormData(formatedData);
    }
  }

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.onUnload);

  }

  onUnload = (e, load) => {
    e.preventDefault();
    e.returnValue = ''
    // return load
  }
  fetchtaxList = async () => {
    const response = (await taxServices.fetchTaxes()).data.taxes;
    this.setState({ taxList: response })
  };

  createEstimateNumber = async () => {
    let result = await createLatestEstimateNumber();
    if (result.statusCode === 200) {
      this.setState({
        estimatePayload: { ...this.state.estimatePayload, estimateNumber: result.data.estimateNumber }
      });
    }
  };

  fetchFormData = async (formatedData) => {
    let stateData = {
      currencies: this.state.currencies,
      customers: this.state.customers,
      products: this.state.products
    };
    const listData = await setFormData(stateData, "all");
    this.setState(listData);
    // await this.calculateAmount()
    await this.setFormData(listData, formatedData)
  };

  setFormData = async (listData, data) => {
    const { businessInfo } = this.props;
    const currencyValue = data.currency || businessInfo.currency;
    const selectedCustomer = await getSelectedCustomer(listData.customers, data.customer, businessInfo);
    const selectedCurency = await getSelectedCurrency(listData.currencies, currencyValue);
    this.setState({ selectedCustomer, selectedCurency, loader: false })
  };

  updateList = async (fetch, data) => {
    let stateData = {
      currencies: this.state.currencies,
      customers: this.state.customers,
      products: this.state.products
    };
    let { estimatePayload, selectedCustomer, prodIndex } = this.state;

    if (fetch === 'CustomerPopup') {
      estimatePayload.customer = data;
      selectedCustomer = data
    } else {
      estimatePayload.items[prodIndex] = data;
      estimatePayload.items[prodIndex]['amount'] = estimatePayload.items[prodIndex]['quantity'] * estimatePayload.items[prodIndex]['price'];

    }
    const listData = await setFormData(stateData, fetch);
    this.setState(listData);
    this.setState({ openPopup: false, estimatePayload, selectedCustomer });
    this.calculateAmount(estimatePayload)
  };

  onPopupClose = async type => {
    let stateData = {
      currencies: this.state.currencies,
      customers: this.state.customers,
      products: this.state.products
    };
    const data = await setFormData(stateData, type);
    this.setState(data);
    this.setState({ openPopup: false });
  };

  handleCustomer = async (selected, e) => {
    let elem = document.getElementById('customerAdd');
    // elem.setCustomValidity("");
    if (selected && selected._id === "Add new customer") {
      this.setState({ openPopup: true, type: "CustomerPopup", custErr: false });
    } else {
      let { estimatePayload, selectedCurency, selectedCustomer, currencies, showExchange } = this.state;
      const { businessInfo } = this.props;
      estimatePayload.customer = selected;
      estimatePayload.currency = _setCurrency(selected && selected.currency, businessInfo.currency);
      if (selected === null) {
        showExchange = false
      } else {
        showExchange = _showExchangeRate(businessInfo.currency, selected.currency);
      }
      if (showExchange) {
        try {
          const { data } = await currentExchangeRate(selected.currency.code, businessInfo.currency.code);
          estimatePayload.exchangeRate = data.exchangeRate;
        } catch (error) {
          return error;
        }
      }
      selectedCurency = getSelectedCurrency(
        currencies,
        (selected && selected.currency) || null
      );
      this.setState({
        selectedCurency,
        selectedCustomer: { ...selected, currency: _setCurrency(selected && selected.currency, businessInfo.currency) },
        estimatePayload,
        showExchange,
        custErr: false
      });
    }
  };

  setData = async data => {
    let { estimatePayload, selectedCurency, currencies, showExchange } = this.state;
    const { businessInfo } = this.props;
    estimatePayload.customer = data;
    estimatePayload.currency = _setCurrency(data && data.currency, businessInfo && businessInfo.currency);
    if (data === null) {
      showExchange = false
    } else {
      showExchange = _showExchangeRate(businessInfo.currency, data.currency);
    }
    selectedCurency = getSelectedCurrency(
      currencies,
      _setCurrency(data && data.currency, businessInfo.currency)
    );
    if (showExchange) {
      try {
        const res = await currentExchangeRate(data.currency.code, this.props.businessInfo.currency.code);
        estimatePayload.exchangeRate = res.data.exchangeRate;
      } catch (error) {
        logger.error("error", error)
        return error;
      }
    }
    this.setState({
      selectedCurency,
      selectedCustomer: data,
      estimatePayload,
      showExchange
    });
  };

  handleCurrency = async selected => {
    let { estimatePayload, selectedCustomer, selectedCurency } = this.state;
    let showExchange = _showExchangeRate(this.props.businessInfo.currency, selected);
    estimatePayload.currency = selected;
    if (showExchange) {
      try {
        const { data } = await currentExchangeRate(selected.code, this.props.businessInfo.currency.code);
        estimatePayload.exchangeRate = data.exchangeRate;
      } catch (error) {
        return error;
      }
    }
    this.setState({ showExchange, selectedCurency: selected, estimatePayload },
      () => this.calculateAmount(estimatePayload));
  };

  calculateAmount = async (payload) => {
    let { taxList } = this.state;
    const { businessInfo } = this.props;
    let estimatePayload = payload;
    let showExchange = _showExchangeRate(
      this.props.businessInfo.currency,
      estimatePayload.currency
    )
    let result = await calculateTaxes(estimatePayload.items, taxList);
    estimatePayload.amountBreakup = {
      subTotal: result.sumAmount,
      taxTotal: result.taxsTotal,
      total: result.amount
    };
    estimatePayload.totalAmount = result.amount;
    estimatePayload.totalAmountInHomeCurrency = showExchange ?
      _calculateExchangeRate(estimatePayload.exchangeRate, result.amount) : 0;
    this.setState({ estimatePayload, showExchange });
    if (showExchange) {
      // debounce()
      try {
        this.debounceEvent(
          estimatePayload.currency.code,
          businessInfo.currency.code
        ).then(({ data }) => {
          estimatePayload.exchangeRate = data.exchangeRate
          this.setState({ estimatePayload, showExchange });
        })
      } catch (error) {
        return error
      }
    }
    this.setState({ estimatePayload, showExchange });
  };

  handleEstimate = async (e, fieldName) => {
    if (fieldName && fieldName.includes("Date")) {
      const date = _formatDate(e);
      this.setState({
        estimatePayload: {
          ...this.state.estimatePayload,
          [fieldName]: date
        }
      });
    } else {
      const { name, value } = e.target;
      if (name && name === "estimateNumber") {
        // if (!isNaN(value)) {
        this.setState({
          estimatePayload: { ...this.state.estimatePayload, [name]: value }
        });
        let result = await checkEstimateNumberExist(value);
        if (result.statusCode === 200) {
          if (!!result.data.estimateNumberExist) {
            this.setState({
              isEstimateNumberExist: true
            });
          } else {
            this.setState({
              isEstimateNumberExist: false
            });
          }
        }
        // }
      } else {
        this.setState({
          estimatePayload: { ...this.state.estimatePayload, [name]: value }
        }, () => { if (name === "exchangeRate") { this.calculateAmount(this.state.estimatePayload); } });
      }

    }
  };

  handleTaxChange = (selected, i) => {
    let { estimatePayload } = this.state;
    let selectedTax = selected.map(item => {
      if (!!item && !!item.value) {
        return item.value
      }
    })
    if (estimatePayload.items[i].taxes) estimatePayload.items[i].taxes = selectedTax;


    this.setState({ estimatePayload }, () => this.calculateAmount(estimatePayload));
  };

  setMemo = () => {
    const data = this.memoRef.current.innerHTML
    if (data)
      this.setState({ memo: data });
  }
  estimateFormSumbit = async (e) => {
    e.preventDefault();
    try {

      let estiPayload = cloneDeep(this.state.estimatePayload);
      estiPayload.customer = typeof estiPayload.customer === "object" ? estiPayload.customer._id : estiPayload.customer;
      estiPayload.memo = this.memoRef.current.innerHTML;
      estiPayload.estimateNumber = (estiPayload.estimateNumber || "").toString().trim();
      delete estiPayload.postal
      delete estiPayload.userId
      delete estiPayload.businessId
      estiPayload.estimateDate = _formatDate(estiPayload.estimateDate);
      estiPayload.expiryDate = _formatDate(estiPayload.expiryDate);
      const payload = {
        estimateInput: estiPayload
      };
      let response;
      if (!!this.state.isEstimateNumberExist) {
        document.getElementById('estimateNo').focus()
        // this.setState({ estNo: true, estMessage: 'Estimate number already exists' })
        this.props.showSnackbar("Estimate number already exists.", true);
      } else {
        this.setState({ estNo: false, estMessage: '' })
      }
      if (!estiPayload.estimateNumber) {
        document.getElementById('estimateNo').focus()
        this.setState({ estNo: true, estMessage: 'This field is required' })
      } else {
        this.setState({ estNo: false, estMessage: '' })
      }
      if (!estiPayload.name) {
        document.getElementById('estimateName').focus()
        this.setState({ estName: true });
      } else {
        this.setState({ estName: false });
      }
      if (!estiPayload.customer) {
        document.getElementById('customerAdd').focus()
        this.setState({ custErr: true });
      } else {
        this.setState({ custErr: false });
      }
      if (!this.state.isEstimateNumberExist && estiPayload.estimateNumber && !!estiPayload.name && estiPayload.customer) {
        if (estiPayload.items.length > 0) {
          const itemErr = estiPayload.items.filter((item, i) => !!item.name ? null : { idx: i })
          if (itemErr.length > 0) {
            this.props.showSnackbar("Item name or price can't be empty", true)
          } else {
            this.setState({ btnLoad: true })
            if (this.props.isEditMode) {
              const id = this.props.selectedEstimate._id;
              response = await updateEstimate(id, payload);
              this.setState({ btnLoad: false })
              this.props.showSnackbar(response.message, false);
            } else {
              response = await addEstimate(payload);
              this.setState({ btnLoad: false })
              this.props.showSnackbar(response.message, response.statusCode !== 201);
            }
            if (response?.statusCode === 201 && response.data?.estimate?._id) {
              history.push(`/app/estimates/view/${response.data.estimate._id}`);
            }
          }
        } else {
          this.setState({ btnLoad: false })
          this.props.showSnackbar("please add item to continue", true);
          return false
        }
      }
    } catch (error) {
      this.setState({ btnLoad: false })
      this.props.showSnackbar(error.message || "Something went wrong", true);
    }
  };

  onTextChange = (event, i) => {
    let { estimatePayload } = this.state;
    const { name, value } = event.target;
    let { items } = estimatePayload;
    items[i][name] = value;
    this.setState({ estimatePayload });
  };

  _handleBlur = e => {

  };

  addALine = (e) => {
    e.preventDefault()
    let estimatePayload = cloneDeep(this.state.estimatePayload);
    const addItem = estimateProductObject(estimatePayload.items.length > 0);
    estimatePayload.items.push(addItem);
    this.setState({ estimatePayload });
  };

  handleDelete = idx => {
    let estimatePayload = this.state.estimatePayload;
    estimatePayload.items = estimatePayload.items.filter((s, index) => {
      return !(index === idx);
    });
    if (estimatePayload.items.length === 0) {
      this.setState({ hideAddButton: false });
    } else {
      this.setState({ estimatePayload });
    }
    this.calculateAmount(estimatePayload)
  };
  handleProductValue = (e, idx) => {
    const { name, value } = e.target
    let estimatePayload = this.state.estimatePayload
    estimatePayload.items[idx]['item'] = ''
    estimatePayload.items[idx][name] = value
    this.setState(
      {
        // ...this.state,
        estimatePayload,
        showAlert: true
      })
  }
  handleProduct = (selected, i) => {
    let estimatePayload = this.state.estimatePayload;
    if (selected && selected.target) {
      const { name, value } = selected.target;
      let { items } = estimatePayload;
      if (['price', 'quantity'].includes(name)) {
        if (name === 'quantity') {
          if (value >= 0 && value.length <= 11) {
            items[i][name] = value;
          }
        } else {
          if (value.length <= 11) {
            items[i][name] = value;
          }
        }
        items[i]['amount'] = items[i]['quantity'] * items[i]['price'];
      } else {
        items[i][name] = value;
      }
      this.setState({ estimatePayload });
      this.calculateAmount(estimatePayload);
    } else {
      let elem = document.getElementById(`item${i}`);
      // elem.setCustomValidity("");
      if (selected && selected.item === "Add new item") {
        estimatePayload.items[estimatePayload.items.length - 1].item = ''
        this.setState({ openProduct: true, type: "", prodIndex: i, hideAddButton: false });
        // this.calculateAmount(estimatePayload);
      } else {
        let { estimatePayload } = this.state;
        if (selected) {
          estimatePayload.items[i] = selected;
        } else {
          estimatePayload.items[i] = sampleProduct;
        }
        estimatePayload.items[i]['amount'] = estimatePayload.items[i]['quantity'] * estimatePayload.items[i]['price'];
        this.setState({ estimatePayload, });
        this.calculateAmount(estimatePayload);
      }
    }
  };

  handleItemBlur = ({ target: { value } }) => {
    let estimatePayload = cloneDeep(this.state.estimatePayload)
    if (!value && estimatePayload.items.length > 0) {
      estimatePayload.items = estimatePayload.items.filter(item => {
        return item.item !== undefined
      })
      this.setState({
        estimatePayload,
        hideAddButton: false
      })
    }
  }

  /*
    Function onSort(sortedList, dropEvent) is used when a user drags or drop some component.
  */
  onSort(sortedList, dropEvent) {
    const { items, currency } = this.state.estimatePayload
    const reduce = sortedList.reduce(
      (map, item) => map.set(item.content.props.id, item.rank),
      new Map()
    )
    const result = items.map(check => {
      check.position = reduce.get(check.item)
      return check
    })
    result.sort((a, b) => a.position - b.position)
    this.setState({
      estimatePayload: {
        ...this.state.estimatePayload,
        items: result
      }
    })
  }

  onDragEnd = (fromIndex, toIndex) => {
    const { items } = this.state.estimatePayload;
    const item = items.splice(fromIndex, 1)[0];
    items.splice(toIndex, 0, item);
    this.setState({
      estimatePayload: {
        ...this.state.estimatePayload,
        items
      }
    })
  }

  itemsHtml = (currencySymbol) => {
    const { estimatePayload, taxList, products } = this.state;
    if (estimatePayload.items && estimatePayload.items.length > 0) {
      return estimatePayload.items.map((item, i) => {
        if (item.item !== undefined) {

          return (
            <li className="drag-item is-selected" id={i} key={`items-${i}`}>
              <div
                className="invoice-item-table-body"
                data-rank={item.item}
              >
                <div className="py-table__cell all_scroll_effect">
                  <span className="Icon">
                    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M7 3h2v2H7V3zm0 4h2v2H7V7zm4-4h2v2h-2V3zm0 4h2v2h-2V7zm-4 4h2v2H7v-2zm4 0h2v2h-2v-2zm-4 4h2v2H7v-2zm4 0h2v2h-2v-2z"></path></svg>
                  </span>
                </div>
                <div className="py-table__cell item-cell">
                  <Input
                    name="name"
                    id={`column_${i}`}
                    className="form-control"
                    placeholder="Enter item name"
                    value={item.name}
                    onChange={e => this.handleProduct(e, i)}
                  />
                  <FormValidationError
                    showError={this.state.itemErr}
                  />
                </div>
                <div className="py-table__cell detail-cell">
                  <Input
                    type="text"
                    name="description"
                    id={`column2_${i}`}
                    // ref={(input) => { this.nameInput = input; }}
                    className="form-focus--expand"
                    placeholder="Enter item description"
                    value={item.description}
                    onChange={e => this.handleProduct(e, i)}
                  />
                </div>
                <div className="py-table__cell quantity-cell">
                  <Input
                    type="number"
                    step="any"
                    // ref={(input) => { this.nameInput = input; }}
                    className="form-control"
                    name="quantity"
                    placeholder="Quantity"
                    onChange={e => this.handleProduct(e, i)}
                    onFocus={e => e.target.select()}
                    value={item.quantity}
                  />
                </div>
                <div className="py-table__cell price-cell">
                  <Input
                    type="number"
                    step="any"
                    className="form-control"
                    name="price"
                    placeholder="Price"
                    maxLength={'11'}
                    onChange={e => this.handleProduct(e, i)}
                    value={item.price}
                    onFocus={e => e.target.select()}
                  />
                  <FormValidationError
                    showError={this.state.priceError}
                  />
                </div>
                <div className="py-table__cell amount-cell">
                  {getAmountToDisplay(this.state.estimatePayload.currency, item.amount)}
                </div>
                <div className={`py-table__cell ${handleAclPermissions(['Viewer']) ? 'disabled' : ''}`}>
                  <ReactSVG
                    src={icDeleteSvg}
                    afterInjection={(error, svg) => {
                      if (error) {
                        return
                      }
                    }}
                    beforeInjection={svg => {
                      svg.classList.add('py-svg-icon')
                    }}
                    renumerateIRIElements={false}
                    className="Icon py-table__action py-table__action__danger"
                    onClick={() => handleAclPermissions(['Viewer']) ? '' : this.handleDelete(i)}
                  />
                </div>
              </div>
              <div className="invoice-item-table-body">
                <div className="invoice-item-income-account"></div>
                <div
                  className="invoice-item-row-tax-section__taxes"
                >
                  <SingleTax
                    taxValue={item}
                    currencySymbol={this.state.estimatePayload.currency && this.state.estimatePayload.currency}
                    isEditMode={true}
                    index={i}
                    taxList={this.state.taxList}
                    multi={false}
                    fetchtaxList={this.fetchtaxList}
                    onChange={this.handleTaxChange}
                    from="estimate"

                  />
                </div>
              </div>
            </li>
          );
        }
      });
    }
  };

  showCustomerInfo = () => {
    const { customer } = this.state.estimatePayload;
    return (
      customer ?
        <Fragment>
          <span className="py-text--hint mt-2">
            {customer.firstName || customer.lastName ? (<div>{`${customer?.firstName} ${customer?.lastName}`}</div>) : ""}
            {customer?.addressBilling && !!customer?.addressBilling?.addressLine1 ? (<div><span>{`${customer?.addressBilling?.addressLine1}`}</span></div>) : ""}
            {customer.addressBilling && !!customer.addressBilling?.addressLine2 ? (<div><span>{`${customer?.addressBilling?.addressLine2}`}</span></div>) : ""}
            {customer.addressBilling && !!customer.addressBilling?.city ? (<div><span>{`${!!customer?.addressBilling?.city ? customer?.addressBilling?.city : ""} ${!!customer?.addressBilling?.state ? customer?.addressBilling?.state?.name : ''} ${customer?.addressBilling?.postal || ""}`}</span></div>) : ""}
            {customer.addressBilling && !!customer.addressBilling?.country?.name ? (<div><span>{`${!!customer?.addressBilling?.country ? customer?.addressBilling?.country?.name : ""}`}</span></div>) : ""}
            {customer.addressBilling && customer.communication && !!customer?.communication?.phone ? (<div><span>{`${!!customer?.communication?.phone ? customer?.communication?.phone : ""}`}</span></div>) : ""}
            <span>{`${customer.email}`}</span>
          </span>
        </Fragment> : ""
    )
  };

  handleHeader = () => {
    this.setState({
      openHeader: true
    });
  };

  closeHeader = () => {
    this.setState({ openHeader: false });
  };


  onHeaderChange = data => {
    this.setState({ estimatePayload: data, showAlert: true });
    this.closeHeader()
  };

  render() {
    const {
      estimatePayload,
      openPopup,
      type,
      customers,
      selectedCustomer,
      currencies,
      showExchange,
      openHeader,
      currency,
      estMessage,
      estName,
      estNo,
      custErr
    } = this.state;
    const dragProps = {
      nodeSelector: 'li',
      handleSelector: 'span'
    };
    const { isEditMode, businessInfo } = this.props;
    const { itemHeading } = estimatePayload;
    const currencySymbol = _setCurrency(estimatePayload && !!estimatePayload.currency && estimatePayload.currency, !!businessInfo && !!businessInfo.currency ? businessInfo.currency : '').symbol;
    return (
      <div className="content-wrapper__main estimateForm">
        <header className="py-header--page flex">
          <div className="py-header--title">
            <h2 className="py-heading--title">{isEditMode ? "Edit" : "Create"} an estimate </h2>
          </div>
        </header>
        {this.state.loader ? <CenterSpinner /> : (
          <Form className="estimate_form__container" onSubmit={this.estimateFormSumbit}>
            <div className="py-box__header">
              <div className="py-form-field me-3">
                <label htmlFor="estimateName" className="py-form-field__label d-block is-required">
                  Estimate name
                </label>
                <Input
                  type="text"
                  value={estimatePayload.name}
                  id="estimateName"
                  name="name"
                  onChange={this.handleEstimate}
                  placeholder="Estimate name"
                  className="me-2 py-input--large py-form__element__medium"
                />
                <FormValidationError
                  showError={estName}
                />
              </div>

              <div className="py-form-field estimate-number-field">
                <label
                  htmlFor="estimateNo"
                  className="py-form-field__label d-block is-required"
                >
                  Estimate number
                </label>
                <Input
                  type="text"
                  step="any"
                  value={estimatePayload.estimateNumber}
                  onChange={this.handleEstimate}
                  name="estimateNumber"
                  id="estimateNo"
                  placeholder="Estimate number"
                  className="py-form__element__medium py-form__element__medium"
                  required
                />
                <FormValidationError
                  showError={estNo}
                  message={estMessage}
                />
              </div>
            </div>
            <div className="py-box--content">
              <div className="py-form-field--condensed estimate-form__info__container">
                <div className="estimate-form__info__content">
                  <FormGroup className="">
                    <Label
                      htmlFor="customerAdd"
                      className="py-form-field__label is-required"
                    >
                      Customer
                    </Label>
                    <div className="py-form-field__element">
                      <SelectBox
                        getOptionLabel={(value) => (value["customerName"])}
                        getOptionValue={(value) => (value["_id"])}
                        value={estimatePayload.customer}
                        onChange={this.handleCustomer}
                        options={customers}
                        clearable={false}
                        placeholder="Select a customer"
                        id="customerAdd"
                        className="py-form__element__medium"
                      />
                      {this.showCustomerInfo()}
                      <FormValidationError
                        showError={custErr}
                      />
                    </div>
                  </FormGroup>

                  <FormGroup className="">
                    <Label htmlFor="currencyAdd" className="py-form-field__label is-required">
                      Currency
                    </Label>
                    <div className="py-form-field__element">
                      <SelectBox
                        getOptionLabel={(value) => (value["displayName"])}
                        getOptionValue={(value) => (value["code"])}
                        value={estimatePayload.currency}
                        onChange={this.handleCurrency}
                        className="py-form__element__medium"
                        options={currencies}
                        clearable={false}
                        id="currencyAdd"
                      />
                    </div>
                  </FormGroup>
                  {showExchange && (
                    <div className="py-form-field">
                      <label htmlFor="exchangeRate" className="py-form-field__label">
                        Exchange Rate
                      </label>
                      <div className="py-form-field__element">
                        <Input
                          type="number"
                          step="any"
                          value={estimatePayload.exchangeRate}
                          name="exchangeRate"
                          id="exchangeRate"
                          className="py-form__element__medium"
                          onChange={this.handleEstimate}
                          maxLength="10"
                        />
                        <div className="py-text--hint">
                          Exchange rate at invoice date is from openexhangerates.org
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="estimate-form__info__content">
                  <div className="py-form-field py-form-field--inline date-filter-box">
                    <Label htmlFor="dateFor" className="py-form-field__label is-required">
                      Date
                    </Label>
                    <div className="py-form-field__element">
                      <DatepickerWrapper
                        maxDate={!!estimatePayload.expiryDate && _toDateConvert(estimatePayload.expiryDate)}
                        selected={estimatePayload.estimateDate ? _toDateConvert(estimatePayload.estimateDate) : null}
                        onChange={date => this.handleEstimate(date, 'estimateDate')}
                        className="form-control py-form__element__small"
                        id="dateFor"
                      />
                    </div>
                  </div>
                  <div className="py-form-field py-form-field--inline date-filter-box expire-date">
                    <Label htmlFor="dateExpiry" className="py-form-field__label is-required">
                      Expires on
                    </Label>
                    <div className="py-form-field__element">
                      <DatepickerWrapper
                        selected={estimatePayload.expiryDate ? _toDateConvert(estimatePayload.expiryDate) : null}
                        onChange={date => this.handleEstimate(date, 'expiryDate')}
                        minDate={estimatePayload.estimateDate ? _toDateConvert(estimatePayload.estimateDate) : null}
                        className="form-control py-form__element__small"
                        id="dateExpiry"
                      />
                    </div>
                  </div>
                  <div className="py-form-field py-form-field--inline">
                    <Label htmlFor="poso" className="py-form-field__label">
                      P.O./S.O.{' '}
                    </Label>
                    <div className="py-form-field__element">
                      <Input
                        type="text"
                        className="py-form__element__small"
                        value={estimatePayload.purchaseOrder}
                        onChange={this.handleEstimate}
                        name="purchaseOrder"
                        id="poso"
                      />
                    </div>
                  </div>
                </div>
                <div className="estimate-form__info__content">
                  <div className="py-form-field py-form-field--inline">
                    <Label htmlFor="subHeading" className="py-form-field__label">
                      Subheading{' '}
                    </Label>
                    <div className="py-form-field__element">
                      <Input
                        type="text"
                        className="py-form__element__medium"
                        value={estimatePayload.subheading}
                        onChange={this.handleEstimate}
                        name="subheading"
                        id="subHeading"
                        maxLength="100"
                      />
                    </div>
                  </div>
                  <div className="py-form-field py-form-field--inline">
                    <Label htmlFor="footer" className="py-form-field__label">
                      Footer{' '}
                    </Label>
                    <div className="py-form-field__element">
                      <Input
                        type="text"
                        className="py-form__element__medium"
                        value={estimatePayload.footer}
                        onChange={this.handleEstimate}
                        name="footer"
                        id="footer"
                        maxLength="255"
                      />
                    </div>
                  </div>
                  <div className="py-form-field py-form-field--inline">
                    <Label htmlFor="memo" className="py-form-field__label">
                      Memo{' '}
                    </Label>
                    <div className="py-form-field__element">
                      <div
                        contentEditable="true"
                        ref={this.memoRef}
                        name="memo"
                        rows={3}
                        className="form-control editableDiv"
                        dangerouslySetInnerHTML={{ __html: estimatePayload.memo }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="py-box is-highlighted invoice-add__body__center" >

              <div className="invoice-add-info__section">
                <div className="invoice-add-info__fileds" >
                  <div className="invoice-add-info__customize-tab">
                    <a
                      className={`py-text--link py-text--strong ${handleAclPermissions(['Viewer']) ? 'disabled' : ''}`}
                      onClick={this.handleHeader}
                    >
                      {' '}
                      <span className="Icon me-1">
                        <svg
                          viewBox="0 0 20 20"
                          id="edit"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M8.75 13.836L16.586 6 14 3.414 6.164 11.25l2.586 2.586zm-1.528 1.3l-2.358-2.358-.59 2.947 2.948-.59zm11.485-8.429l-10 10a1 1 0 0 1-.51.274l-5 1a1 1 0 0 1-1.178-1.177l1-5a1 1 0 0 1 .274-.511l10-10a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1 0 1.414z"></path>
                        </svg>
                      </span>
                      Edit columns
                    </a>
                  </div>

                  <CustomizeHeader
                    invoice={estimatePayload}
                    openHeader={openHeader}
                    onClose={this.closeHeader}
                    onSave={this.onHeaderChange}
                    from="estimate"
                  />

                  <div className="invoice-add-info__itemtable">
                    <AddItemComponent
                      itemHeading={itemHeading}
                      products={this.state.products}
                      taxList={this.state.taxList}
                      openProduct={this.state.openPopup}
                      handleProductValue={this.handleProductValue}
                      type={this.state.type}
                      handleProduct={this.handleProduct}
                      handleDelete={this.handleDelete}
                      items={this.state.estimatePayload.items}
                      currency={this.state.estimatePayload.currency}
                      handleItemBlur={this.handleItemBlur}
                      fetchtaxList={this.fetchtaxList}
                      onSort={this.onSort}
                      handleTaxChange={this.handleTaxChange}
                      list={this.list}
                      priceError={this.state.priceError}
                      itemsHtml={this.itemsHtml}
                      from="estimate"
                    >
                      <ReactDragListView {...dragProps}
                        onDragEnd={(fromIndex, toIndex) => this.onDragEnd(fromIndex, toIndex)}>
                        <ol className="p-0 m-0 list-unstyled">
                          {this.itemsHtml()}
                        </ol>
                      </ReactDragListView>
                    </AddItemComponent>
                    {!this.state.hideAddButton ? (
                      <Button
                        onClick={this.addALine}
                        className="btn-add-invoice"
                        color="primary"
                        outline
                        block
                      >
                        <ReactSVG
                          src={icAddSvg}
                          afterInjection={(error, svg) => {
                            if (error) {
                              return
                            }
                          }}
                          beforeInjection={svg => {
                            svg.classList.add('py-svg-icon')
                          }}
                          renumerateIRIElements={false}
                          className="Icon me-1"
                        />{' '}
                        Add{' '}
                        {itemHeading.column1.name.toLowerCase() ===
                          'items'
                          ? `an ${pluralize.singular(
                            itemHeading.column1.name.toLowerCase()
                          )}`
                          : `a ${pluralize.singular(
                            itemHeading.column1.name.toLowerCase()
                          )}`}
                      </Button>
                    ) : (
                      ''
                    )}
                    {estimatePayload ? <TotalComponent
                      type="estimation"
                      getAmountToDisplay={getAmountToDisplay}
                      invoiceInput={estimatePayload}
                      businessInfo={businessInfo}
                      showExchange={showExchange}
                      currencies={currencies}
                      handleCurrency={this.handleCurrency}
                    /> : null}
                  </div>
                  <div className="py-box--footer">
                    <Button
                      color="primary"
                      className="width100"
                      type="submit"
                      disabled={handleAclPermissions(['Viewer']) || this.state.btnLoad}
                    // onClick={this.estimateFormSumbit}
                    >{this.state.btnLoad ? <Spinner color="default" size="sm" /> : 'Save'}</Button>
                  </div>
                  {/* <EstimateInfoForm
                    estimatePayload ={estimatePayload}
                    closeHeader={this.closeHeader}
                    onHeaderChange={this.onHeaderChange}
                    itemHeading={itemHeading}
                    itemsHtml={this.itemsHtml}
                    addALine={this.addALine}
                    businessInfo={businessInfo}
                    showCustomerInfo={this.showCustomerInfo}
                    showExchange={showExchange}
                    openHeader={openHeader}
                    currencySymbol={currencySymbol}
                    btnLoad={this.state.btnLoad}
                  /> */}
                </div>
              </div>
            </div>
          </Form>
        )}
        <Popup
          type={type}
          openPopup={openPopup}
          onClosePopup={this.onPopupClose}
          updateList={this.updateList}
          setData={this.setData.bind(this)}
        />
      </div>
    );
  }
}

const mapPropsToState = state => ({
  userSettings: state.settings.userSettings,
  businessInfo: state.businessReducer.selectedBusiness
});
const mapDispatchToProps = (dispatch) => {
  return {
    showSnackbar: (message, error) => {
      dispatch(openGlobalSnackbar(message, error))
    }
  };
};
export default withRouter(connect(mapPropsToState, mapDispatchToProps)(EstimateForm));
