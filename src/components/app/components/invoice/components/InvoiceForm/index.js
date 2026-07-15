import history from '../../../../../../customHistory';
import { cloneDeep } from 'lodash';
import pluralize from 'pluralize';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { withRouter, Prompt } from 'react-router-dom';
import {ReactSVG} from 'react-svg';
import { PAYMENT_DUE_OPTION } from '../../../../../../constants/recurringConst';
import { DeleteModal } from '../../../../../../utils/PopupModal/DeleteModal';
import { openMailBox, openPayment } from '../../../../../../actions';
import { setUserSettings } from '../../../../../../actions/loginAction';
import { openGlobalSnackbar } from '../../../../../../actions/snackBarAction';
import SingleTax from '../../../sales/components/Taxes/SingleTax';
import { Input, Button, FormText } from 'reactstrap';
import {
  fetchSignedUrl,
  uploadImage
} from '../../../../../../api/businessService';
import { currentExchangeRate } from '../../../../../../api/globalServices';
import {
  addInvoice,
  getInvoiceNumber,
  updateInvoice
} from '../../../../../../api/InvoiceService';
import { fetchBusinessCheckoutFee } from '../../../../../../api/CheckoutService'
import {
  addRecurringInvoice,
  updateRecurringInvoice
} from '../../../../../../api/RecurringService';
import {
  addSalesSetting,
  patchSalesSetting
} from '../../../../../../api/SettingService';
import taxServices from '../../../../../../api/TaxServices';
import CenterSpinner from '../../../../../../global/CenterSpinner';
import { ValidationMessages } from '../../../../../../global/ErrorBoxes/Message';
import {
  _documentTitle,
  _showExchangeRate,
  getAmountToDisplay,
  _calculateExchangeRate,
  _setCurrency,
  logger,
  handleAclPermissions
} from '../../../../../../utils/GlobalFunctions';
import BusinessPopup from '../../../BusinessInfo/BusinessPopup';
import Popup from '../../../Estimates/components/Popup';
import {
  calculateTaxes,
  getSelectedCurrency,
  getSelectedCustomer,
  INVOICE_ITEM,
  invoiceInput,
  setFormData
} from '../../helpers';
import { invoiceInputRecurringAdd } from '../../../RecurringInvoice/helpers/index';
import CustomizeHeader from '../../common/CustomizeHeader';
import debounce from 'lodash/debounce';
import CommonHeader from '../../common/header';
import ContentHeader from '../../common/ContentHeader';
import AddCustomer from '../../common/AddCustomer';
import CustomerRightSection from '../../common/CustomerRightSection';
import TotalComponent from '../../common/TotalComponent';
import AddItemComponent from '../../common/AddItemComponent';
import ContentFooter from '../../common/ContentFooter';
import CommonFooter from '../../common/CommonFooter';
import Notes from '../../common/Notes';
import ShowPreview from '../../common/ShowPreview';
import ReactDragListView from 'react-drag-listview/lib/index.js';
import { _getDiffDate, _formatDate, _displayDate } from '../../../../../../utils/globalMomentDateFunc';
import DOMPurify from 'dompurify';
import icDeleteSvg from "../../../../../../assets/icons/ic_delete.svg"
import icAddSvg from "../../../../../../assets/icons/ic_add.svg"

class InvoiceForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'showExchange': false,
      'openProduct': false,
      'openUpperDropdown': false,
      'openBelowDropdown': false,
      'collapse': false,
      'showPreview': false,
      'openBusinessPopup': false,
      'popoverOpen': false,
      'selectedCustomer': undefined,
      'selectedCurency': undefined,
      'currencies': [],
      'customers': [],
      'products': [],
      'taxList': [],
      'showAlert': false,
      'invoiceInput':
        this.props.location.pathname.includes('/app/recurring')
          ? invoiceInputRecurringAdd(
            null,
            this.props.businessInfo,
            this.props.userSettings
          )
          : invoiceInput(
            null,
            this.props.businessInfo,
            this.props.userSettings,
            this.props.isEditMode
          ),
      'showCustomer': true,
      'openPopup': false,
      'hideAddButton': false,
      'type': 'All',
      'editCustomer': false,
      'loader': true,
      'businessInfo': this.props.businessInfo,
      'messages': [],
      // add
      'loading': false,
      'tooltipAutoGenDate': false,
      'deleteBtnLoad': false,
      invoiceNumErr: false,
      customerLoad: false,
      businessFee: [],
      selectedPaymentMethod: 'card'
    };
    this.list = [];
    this.notesRef = React.createRef();
  }

  toggleToolTip = tooltip => {
    if (tooltip === 'Auto-generated-Number') {
      this.setState(prevState => ({
        'tooltipAutoGenNo': !prevState.tooltipAutoGenNo
      }));
    } else {
      this.setState(prevState => ({
        'tooltipAutoGenDate': !prevState.tooltipAutoGenDate
      }));
    }
  }

  _findCurrentExchangeRate = async (to, base, showExchange, amount) => {
    try {
      let invoiceInput = cloneDeep(this.state.invoiceInput);
      const res = await currentExchangeRate(to, base);
      if (res.statusCode === 200) {
        invoiceInput.exchangeRate = res.data.exchangeRate;
        invoiceInput.totalAmountInHomeCurrency = showExchange
          ? _calculateExchangeRate(invoiceInput.exchangeRate, amount)
          : 0;
        this.setState({ invoiceInput, showExchange, loading: false })
      } else {
        this.setState({ loading: false })
        this.props.showSnackbar(res.message, true)
      }
    } catch (err) {
      this.setState({ loading: false })
      this.props.showSnackbar(err.message, true)
    }
  }

  async componentDidMount() {
    if (handleAclPermissions(['Viewer'])) {
      this.props.showSnackbar(process.env.REACT_APP_PERMISSION_MSG)
      history.goBack();
    }
    await this.fetchInvoiceFee();
    this.debounceEvent = debounce(this._findCurrentExchangeRate, 500);
    const { isEditMode, invoiceData, businessInfo, userSettings } = this.props;
    this.setTabTitle()
    let formatedData = this.state.invoiceInput;
    if (isEditMode) {
      formatedData = this.props.location.pathname.includes('/app/recurring')
        ? invoiceInputRecurringAdd(invoiceData, businessInfo, userSettings)
        : invoiceInput(invoiceData, businessInfo, userSettings, isEditMode);
      let showExchange = _showExchangeRate(
        businessInfo.currency,
        formatedData.currency
      );
      this.setState({ 'invoiceInput': formatedData, showExchange, businessInfo });
    }
    this.fetchtaxList();
    this.fetchFormData(formatedData);
    if (!isEditMode) this.createInvoiceNumber();
  }

  componentDidUpdate(prevProps) {
    const { invoiceData, businessInfo, userSettings, isEditMode } = this.props;
    this.setTabTitle()
    if (prevProps.invoiceData !== invoiceData) {
      let showExchange = _showExchangeRate(
        businessInfo.currency,
        invoiceData.currency
      );
      let formatedData = this.props.location.pathname.includes('/app/recurring')
        ? invoiceInputRecurringAdd(invoiceData, businessInfo, userSettings)
        : invoiceInput(invoiceData, businessInfo, userSettings, isEditMode);
      this.setState({ 'invoiceInput': formatedData, showExchange, businessInfo }, () => {
        this.calculateAmount();
      });
      this.fetchFormData(formatedData);
    }
  }

  setTabTitle = () => {
    const { businessInfo } = this.props;
    if (this.props.location.pathname.includes('/app/recurring')) {
      document.title = businessInfo && businessInfo.organizationName ? `Finance - ${businessInfo.organizationName} - Recurring Invoice` : `Finance - Recurring Invoice`;
    } else {
      document.title = businessInfo && businessInfo.organizationName ? `Finance - ${businessInfo.organizationName} - Invoices` : `Finance - Invoices`;
    }
  }

  createInvoiceNumber = async () => {
    let result = await getInvoiceNumber();
    if (result.statusCode === 200) {
      this.setState({
        'invoiceInput': {
          ...this.state.invoiceInput,
          'invoiceNumber': result.data.invoiceNumber
        }
      });
    }
  }

  fetchtaxList = async () => {
    const response = (await taxServices.fetchTaxes()).data.taxes;
    this.setState({ 'taxList': response });
  }

  fetchInvoiceFee = async () => {
    let feeResponse = (await fetchBusinessCheckoutFee()).data.processingFee;
    this.setState({
      businessFee: feeResponse
    })
  }

  fetchFormData = async formatedData => {
    this.setState({ customerLoad: true })
    let stateData = {
      'currencies': this.state.currencies,
      'customers': this.state.customers,
      'products': this.state.products
    };
    const listData = await setFormData(stateData, 'all');
    this.setState(listData);
    await this.calculateAmount()
    await this.setFormData(listData, formatedData);
  }

  setFormData = async (listData, data) => {
    const { businessInfo, isEditMode } = this.props;
    const currencyValue = data.currency || businessInfo.currency;

    const selectedCustomer = await getSelectedCustomer(
      listData.customers,
      data.customer,
      businessInfo
    );
    const selectedCurency = await getSelectedCurrency(
      listData.currencies,
      currencyValue
    );
    _documentTitle(businessInfo, '');
    if (!!isEditMode) {
      if (!!listData.customers && listData.customers.length && !!selectedCustomer) {
        this.setState({ customerLoad: false })
      }
    } else {
      if (!!listData.customers && listData.customers.length) {
        this.setState({ customerLoad: false })
      }
    }
    this.setState({ selectedCustomer, selectedCurency, 'loader': false });
  }

  updateList = async fetch => {
    let stateData = {
      'currencies': this.state.currencies,
      'customers': this.state.customers,
      'products': this.state.products
    };
    const listData = await setFormData(stateData, fetch);
    this.setState(listData);
    this.setState({ 'openPopup': false });
  }

  onPopupClose = async type => {
    let stateData = {
      'currencies': this.state.currencies,
      'customers': this.state.customers,
      'products': this.state.products
    };
    if (!this.state.editCustomer) {
      const data = await setFormData(stateData, type);
      this.setState(data);
    }
    this.setState({ 'openPopup': false, 'editCustomer': false });
  }

  toggleUpperDropdown = () => {
    this.setState(prevState => ({
      'openUpperDropdown': !prevState.openUpperDropdown
    }));
  }
  toggleBelowDropdown = () => {
    this.setState(prevState => ({
      'openBelowDropdown': !prevState.openBelowDropdown
    }));
  }

  toggleBusiness = () => {
    this.setState({ 'collapse': !this.state.collapse });
  }

  toggleFooter = () => {
    this.setState({ 'footerCollapse': !this.state.footerCollapse });
  }

  toggle = () => {
    this.setState({
      'popoverOpen': !this.state.popoverOpen
    });
  }

  handleHeader = () => {
    this.setState({
      'openHeader': true
    });
  }

  closeHeader = () => {
    this.setState({ 'openHeader': false });
  }

  onHeaderChange = data => {
    this.setState({ 'invoiceInput': data, 'showAlert': true });
    this.closeHeader();
  }

  addItem = () => {
    let { invoiceInput, hideAddButton } = this.state;
    invoiceInput.items.push(INVOICE_ITEM);
    this.setState(
      {
        // ...this.state,
        invoiceInput,
        // 'hideAddButton': true
      });
  }

  onDragEnd = (fromIndex, toIndex) => {
    const { items } = this.state.invoiceInput;
    const item = items.splice(fromIndex, 1)[0];
    items.splice(toIndex, 0, item);
    this.setState({
      'invoiceInput': {
        ...this.state.invoiceInput,
        items
      }
    });
  }

  itemsHtml = () => {
    let { invoiceInput } = this.state;
    const placeholder = <div className="placeholderContent">Drop Here!!!</div>;
    return invoiceInput.items.map((item, i) => {
      if (item.item !== null && item.item !== undefined)
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
                {/* {item.column1 && this.state.type === '' ? ( */}
                <Input
                  name="column1"
                  id={`column1_${i}`}
                  className="form-control"
                  placeholder="Enter item name"
                  value={item.column1}
                  onChange={e => this.handleProductValue(e, i)}
                />
                {/* ) : ( */}
                {/* <label>{item.column1}</label> */}
                {/* )} */}
              </div>
              <div className="py-table__cell detail-cell">
                <Input
                  type="textarea"
                  name="column2"
                  id={`column2_${i}`}
                  // ref={(input) => { this.nameInput = input; }}
                  className="form-focus--expand"
                  placeholder="Enter item description"
                  value={item.column2}
                  onChange={e => this.handleProduct(e, i)}
                />
              </div>
              <div className="py-table__cell quantity-cell">
                <Input
                  type="number"
                  step=".25"
                  // ref={(input) => { this.nameInput = input; }}
                  className="form-control"
                  name="column3"
                  onChange={e => this.handleProduct(e, i)}
                  onKeyDown={e => e.key === '-' && e.preventDefault()}
                  value={item.column3}
                  onFocus={e => e.target.select()}
                  min={0}
                />
              </div>
              <div className="py-table__cell price-cell">
                <Input
                  type="number"
                  step="any"
                  className="form-control"
                  name="column4"
                  maxLength={'11'}
                  min={'1'}
                  onChange={e => this.handleProduct(e, i)}
                  onKeyDown={e => e.key === '-' && e.preventDefault()}
                  value={item.column4}
                  onFocus={e => e.target.select()}
                />
                {this.state.priceError ? (
                  <FormText>Please enter a value</FormText>
                ) : (
                    ''
                  )}
              </div>
              <div className="py-table__cell amount-cell">
                {getAmountToDisplay(this.state.invoiceInput.currency, item.amount || item.column4)}
              </div>
              <div className="py-table__cell">
                <ReactSVG
                  src={icDeleteSvg}
                  afterInjection={(error, svg) => {
                    if (error) {
                      return;
                    }
                  }}
                  beforeInjection={svg => {
                    svg.classList.add('py-svg-icon');
                  }}
                  renumerateIRIElements={false}
                  className="Icon py-table__action py-table__action__danger"
                  onClick={() => this.handleDelete(i)}
                />
              </div>
            </div>
            <div className="invoice-item-table-body">
              <div className="invoice-item-income-account"></div>
              <div className="invoice-item-row-tax-section__taxes" >
                <SingleTax
                  taxValue={item}
                  currencySymbol={this.state.invoiceInput.currency && this.state.invoiceInput.currency}
                  isEditMode={true}
                  index={i}
                  taxList={this.state.taxList}
                  multi={false}
                  fetchtaxList={this.fetchtaxList}
                  onChange={this.handleTaxChange}
                />
              </div>
            </div>
          </li>
        );

      // }
    });
  }

  handleDelete = idx => {
    let invoiceInput = this.state.invoiceInput;
    invoiceInput.items = invoiceInput.items.filter((s, index) => {
      return !(index === idx);
    });
    this.setState({ invoiceInput, 'hideAddButton': false });
    this.calculateAmount();
  }

  handleProductValue = (e, idx) => {
    const { name, value } = e.target;
    let updateInvoice = cloneDeep(this.state.invoiceInput);
    updateInvoice.items[idx].item = '';
    updateInvoice.items[idx][name] = value;
    this.setState(
      {
        // ...this.state,
        'invoiceInput': updateInvoice,
        'showAlert': true
      });
  }
  handleCustomer = selected => {
    const { businessInfo } = this.props;
    if (selected && selected._id === 'Add new customer') {
      this.setState({
        'openPopup': true,
        'type': 'CustomerPopup',
        'isEditMode': false
      });
    } else {
      let { invoiceInput, selectedCurency, currencies } = this.state;
      invoiceInput.customer = (selected && selected) || '';
      selectedCurency = getSelectedCurrency(
        currencies,
        _setCurrency(selected && selected.currency, businessInfo.currency)
      );
      invoiceInput.currency = selectedCurency;
      let showExchange = _showExchangeRate(
        businessInfo.currency,
        invoiceInput.currency
      );
      this.setState({
        selectedCurency,
        'selectedCustomer': selected,
        invoiceInput,
        'showCustomer': false,
        'showAlert': true,
        showExchange
      });
      this.calculateAmount();
    }
  }

  setData = selected => {
    const { businessInfo, invoiceData } = this.props;
    let {
      invoiceInput,
      selectedCurency,
      currencies,
      editCustomer,
      selectedCustomer
    } = this.state;
    invoiceInput.customer = (selected && selected._id) ? selected : '';
    selectedCurency = getSelectedCurrency(
      currencies,
      _setCurrency(selected && selected.currency, businessInfo.currency)
    );
    invoiceInput.currency = selectedCurency;
    let messages = this.state.messages;
    if (
      editCustomer &&
      selected._id !== (invoiceData.customer && invoiceData.customer._id)
    ) {
      messages[0] = {
        'heading': 'Customer',
        'message':
          'An invoice customer cannot be modified after a payment has been made.'
      };

      this.setState({
        selectedCurency,
        selectedCustomer,
        invoiceInput,
        'showCustomer': true,
        'showValidation': true,
        messages
      });
      window.scrollTo(0, 0);
    } else {
      let showExchange = _showExchangeRate(
        businessInfo.currency,
        invoiceInput.currency
      );
      this.setState({
        selectedCurency,
        'selectedCustomer': selected,
        invoiceInput,
        'showCustomer': true,
        'showAlert': true,
        'showValidation': false,
        showExchange
      });
    }
  }

  handleCurrency = async selected => {
    const { businessInfo } = this.props;
    let { invoiceInput } = this.state;
    let showExchange = _showExchangeRate(businessInfo.currency, selected);
    invoiceInput.currency = selected;
    if (showExchange) {
      try {
        this.setState({ loading: true })
        const { data } = await currentExchangeRate(
          selected.code,
          businessInfo.currency.code
        );
        invoiceInput.exchangeRate = data.exchangeRate;
      } catch (error) {
        return error;
      }
    }
    this.setState({ showExchange, invoiceInput, 'showAlert': true }, () =>
      this.calculateAmount()
    );
  }

  handleProduct = (selected, i) => {
    let updateInvoice = cloneDeep(this.state.invoiceInput);
    let hideAddButton = this.state.hideAddButton;
    if (selected) {
      if (!!selected.target) {
        const { name, value } = selected.target;
        if (name === 'column4' || name === 'column3') {
          if (name === 'column3') {
            if (value >= 0 && value.length <= 11) {
              updateInvoice.items[i][name] = value;
            }
          } else {
            if (value.length <= 11) {
              updateInvoice.items[i][name] = value;
            }
          }
        } else {
          updateInvoice.items[i][name] = value;
        }

        updateInvoice.items[i].amount =
          updateInvoice.items[i].column3 * updateInvoice.items[i].column4;

        this.setState(
          {
            ...this.state,
            'invoiceInput': updateInvoice,
            'selectedProduct': selected,
            hideAddButton,
            'showAlert': true
          },
          () => {
            if (name !== 'column2') {
              this.calculateAmount();
            }
          }
        );
      } else {
        if (selected.item === 'Add new item') {
          updateInvoice.items[updateInvoice.items.length - 1].item = 0;
          this.setState({ 'openProduct': true, 'type': 'ProductPopup' });
        } else {
          updateInvoice.items[i] = selected;
          updateInvoice.items[i].taxes = selected.taxes;
          if (!!selected.column4) {
            updateInvoice.items[i].column4 = parseFloat(
              selected.column4
            ).toFixed(2);
          }
        }
        hideAddButton = false;
        updateInvoice.items[i].amount =
          updateInvoice.items[i].column3 * updateInvoice.items[i].column4;

        // let { invoiceInput, hideAddButton } = this.state
        // invoiceInput.items.push(INVOICE_ITEM)
        // this.setState(
        //   {
        //     invoiceInput,
        //     hideAddButton: true,
        //     openPopup: false,
        //     type: ''
        //   } )
        this.setState(
          {
            ...this.state,
            'invoiceInput': updateInvoice,
            'selectedProduct': selected,
            hideAddButton,
            'showAlert': true
          },
          () => this.calculateAmount()
        );
      }
    } else {
      updateInvoice.items[i] = INVOICE_ITEM;
      this.setState(
        {
          ...this.state,
          'invoiceInput': updateInvoice,
          'selectedProduct': selected,
          hideAddButton,
          'showAlert': true
        },
        () => this.calculateAmount()
      );
    }
  }

  isIOSDevice = () => {
    return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform)
    // iPad on iOS 13 detection
    || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  }

  handleItemBlur = ({ 'target': { value } }) => {
    let invoiceInput = cloneDeep(this.state.invoiceInput);
    if (!value && invoiceInput.items.length > 0) {
      invoiceInput.items = invoiceInput.items.filter(item => {
        return item.item !== undefined;
      });
      if (this.isIOSDevice()) {
        this.setState({
          'hideAddButton': false
        });
      } else {
        this.setState({
          invoiceInput,
          'hideAddButton': false
        });
      }
    }
  }

  _handlePriceBlur(i, e) {
    let updateInvoice = cloneDeep(this.state.invoiceInput);
    let { name, value } = e.target;
    if (name === 'column4') {
      if (!!value) {
        updateInvoice.items[i].column4 = parseFloat(value).toFixed(2);
      } else {
        updateInvoice.items[i].column4 = parseFloat(0);
      }
    }
    if (name === 'column3') {
      if (!value) {
        updateInvoice.items[i].column3 = parseFloat(0);
      }
    }
    this.setState({ 'invoiceInput': updateInvoice, 'priceError': false });
  }

  calculateAmount = async () => {
    let { taxList } = this.state;
    const { businessInfo } = this.props;
    let invoiceInput = cloneDeep(this.state.invoiceInput);
    let showExchange = _showExchangeRate(
      businessInfo.currency,
      invoiceInput.currency
    );
    let result = await calculateTaxes(this.state.invoiceInput.items, taxList);
    invoiceInput.amountBreakup = {
      'subTotal': result.sumAmount,
      'taxTotal': result.taxsTotal,
      'total': result.amount
    };
    invoiceInput.totalAmount = result.amount;

    let proceFee = 0;
    let card = {};
    /*if (this.state.invoiceInput.shouldAskProcessingFee && this.state.businessFee && this.state.businessFee.length) {
      card = this.state.businessFee.find((el) => el.type === this.state.selectedPaymentMethod);
      if(result.amount && card && Object.keys(card.international_fee).length > 0 ){
        // proceFee = parseFloat(result.amount * card.international_fee.dynamic + card.international_fee.fixed).toFixed(2)
        proceFee = parseFloat(parseFloat(
          (result.amount / (1 - card?.international_fee?.dynamic)) + card?.international_fee?.fixed
        ) - parseFloat(result.amount)).toFixed(2)
      }
    }
    const grandTotal = (result.amount + parseFloat(proceFee)).toFixed(2)*/

    /*if (this.state.invoiceInput.shouldAskProcessingFee) {
      invoiceInput.amountBreakup.total = parseFloat(grandTotal)
      invoiceInput.amountBreakup.fee = parseFloat(proceFee).toFixed(2)
      invoiceInput.amountBreakup.feeStructure = card.international_fee
      invoiceInput.totalAmount = parseFloat(grandTotal)
    } else {
      delete invoiceInput.amountBreakup.fee
      delete invoiceInput.amountBreakup.feeStructure
    }*/

    invoiceInput.totalAmountInHomeCurrency = showExchange
      ? _calculateExchangeRate(invoiceInput.exchangeRate, result.amount)
      : 0;
    if (showExchange) {
      // debounce()
      try {
        this.setState({ loading: true })
        this.debounceEvent(
          invoiceInput.currency.code,
          businessInfo.currency.code, showExchange, invoiceInput.totalAmount
        )
      } catch (error) {
        this.setState({ loading: false })
        return error;
      }
    }
    this.setState({ invoiceInput, showExchange });
  }

  getDueAmountWithTax = (dueAmount) => {
    let invoiceInput = cloneDeep(this.state.invoiceInput);
    const amountWithTax = invoiceInput.amountBreakup.taxTotal.reduce((acc, tax) => {
      acc += tax.amount
      return acc
    }, dueAmount)
    return parseFloat(amountWithTax.toFixed(2))
  }

  onSubmitRecurringInvoice = async option => {
    this.setState({ 'showAlert': false, showValidation: false, message: [] });
    const {
      openPayment,
      openMailBox,
      isEditMode,
      invoiceData,
      showSnackbar
    } = this.props;
    try {
      this.setState({ 'loading': true });
      let invoiceInput = cloneDeep(this.state.invoiceInput);
      // invoiceInput.customer = invoiceInput.customer._id;
      let response;
      delete invoiceInput.amountBreakup.totalWithTax;
      delete invoiceInput.invoiceNumber
      invoiceInput.amountBreakup.taxTotal = invoiceInput.amountBreakup.taxTotal.map(
        item => {
          if (item) { item.taxName = item.taxName._id; }
          return item;
        }
      );
      if (invoiceInput.items.length > 0) {
        if (typeof invoiceInput.customer === 'object') {
          invoiceInput.customer =
            invoiceInput.customer._id || invoiceInput.customer.id;
        }
        if (!!!!this.notesRef.current && !!this.notesRef.current.innerHTML) {
          invoiceInput.notes = DOMPurify.sanitize(this.notesRef.current.innerHTML);
        }
        invoiceInput.notes =
          invoiceInput.notes == '<br>' ? '' : DOMPurify.sanitize(invoiceInput.notes);
        delete invoiceInput['itemHeading']['savedForFuture']
        if (isEditMode) {
          const id = invoiceData._id;
          // invoiceInput.businessId = invoiceInput.businessId._id;
          delete invoiceInput._id;
          response = await updateRecurringInvoice(id, { invoiceInput });
          showSnackbar('Invoice updated successfully', false);
        } else {
          delete invoiceInput._id;
          invoiceInput.dueAmount = this.getDueAmountWithTax(invoiceInput.amountBreakup.subTotal);
          response = await addRecurringInvoice({ invoiceInput });
          showSnackbar('Invoice created successfully', false);
        }
        if (response) {
          if (option === 'Payment') {
            openPayment();
          } else if (option === 'Send') {
            openMailBox();
          }
          history.push(`/app/recurring/view/${response.data.invoice._id}`);
          this.setState({ 'loading': false });
        }
      } else {
        this.setState({ 'loading': false });
        showSnackbar('Please select an item to proceed.', true);
      }
    } catch (error) {
      showSnackbar(error.message, true);
      this.setState({ 'loading': false });
    }
  }

  onSubmitInvoice = async option => {
    this.setState({ 'showAlert': false, 'showValidation': false, 'messages': [] });
    const {
      openPayment,
      openMailBox,
      isEditMode,
      invoiceData,
      showSnackbar
    } = this.props;
    const { selectedCustomer } = this.state;
    delete this.state.invoiceInput.amountBreakup.totalWithTax
    try {
      this.setState({ 'loading': true });
      let invoiceInput = cloneDeep(this.state.invoiceInput);
      delete invoiceInput.paymentFor;
      let response;
      invoiceInput.amountBreakup.taxTotal = invoiceInput.amountBreakup.taxTotal.map(
        item => {
          item.taxName = item.taxName._id;
          return item;
        }
      );
      invoiceInput.invoiceDate = invoiceInput.invoiceDate ? _formatDate(invoiceInput.invoiceDate) : null;
      invoiceInput.dueDate = invoiceInput.dueDate ? _formatDate(invoiceInput.dueDate) : null;
    
    if (invoiceInput.invoiceDate > invoiceInput.dueDate) {
      this.setState({ loading: false });
        showSnackbar("Due date must be after invoice date.", true);
      return;
    }
    
      invoiceInput.invoiceNumber = String(invoiceInput.invoiceNumber);
      if (!invoiceInput.invoiceNumber) {
        const elem = document.getElementById("invoiceNumber")
        if (!!elem) {
          elem.focus()
        }
        this.setState({ invoiceNumErr: true, loading: false })
      } else {
        this.setState({ invoiceNumErr: false })
        if (invoiceInput.items.length > 0) {
          if (typeof invoiceInput.customer === 'object') {
            invoiceInput.customer =
              invoiceInput.customer._id || invoiceInput.customer.id;
          }
          if (!!!!this.notesRef.current && !!this.notesRef.current.innerHTML) {
            invoiceInput.notes = DOMPurify.sanitize(this.notesRef.current.innerHTML);
          }
          invoiceInput.notes =
            invoiceInput.notes == '<br>' ? '' : invoiceInput.notes;
          delete invoiceInput['itemHeading']['savedForFuture']
          if (isEditMode) {
            let messages = this.state.messages;
            let selectedName =
              selectedCustomer.customerName ||
              selectedCustomer.customer.customer.customerName;
            let selectedId =
              selectedCustomer._id || selectedCustomer.customer.customer._id;

            if (option === 'Payment') {
              invoiceInput.status = 'unsent';
            }
            if (option === 'Send') {
              invoiceInput.status = 'saved';
            }

            if (invoiceInput.payments && invoiceInput.payments.length > 0) {
              if (
                _formatDate(invoiceData.invoiceDate) !==
                _formatDate(invoiceInput.invoiceDate)
              ) {
                messages[1] = {
                  'heading': 'Invoice Date',
                  'message':
                    "An invoice's issue date cannot be modified after a payment has been made"
                };
                this.setState({
                  loading: false,
                  'showValidation': true,
                  messages
                });
                window.scrollTo(0, 0);
              }
              if (invoiceInput.currency.code !== invoiceData.currency.code) {
                messages[2] = {
                  'heading': 'Currency',
                  'message':
                    "An invoice's currency cannot be modified after a payment has been made"
                }
                  messages[3] = {
                    'heading': 'Exchange Rate',
                    'message':
                      "An invoice's exchange rate cannot be modified after a payment has been made"
                  }
                  this.setState({
                    loading: false,
                    'showValidation': true,
                    messages
                  });
                window.scrollTo(0, 0);
              }
              if (
                selectedId !== (invoiceData.customer && invoiceData.customer._id)
              ) {
                messages[0] = {
                  'heading': 'Customer',
                  'message':
                    'An invoice customer cannot be modified after a payment has been made.'
                };
                this.setState({
                  loading: false,
                  'showValidation': true,
                  messages
                });
                window.scrollTo(0, 0);
                this.setState({ 'loading': false });
              }
              if (
                _formatDate(invoiceData.invoiceDate) ===
                _formatDate(invoiceInput.invoiceDate) &&
                invoiceInput.currency.code === invoiceData.currency.code &&
                (!!selectedCustomer.customer
                  ? selectedCustomer.customer.customerName
                  : selectedCustomer.customerName) ===
                (invoiceData.customer && invoiceData.customer.customerName)
              ) {
                const id = invoiceData._id;
                delete invoiceInput.payments;
                delete invoiceInput.onlinePayments;
                delete invoiceInput.createdAt;
                delete invoiceInput.lastViewedOn;
                delete invoiceInput.businessId;
                delete invoiceInput._id;
                delete invoiceInput.paymentButtons;
                response = await updateInvoice(id, { invoiceInput });
                if (response.statusCode === 200) {
                  this.setState({ 'loading': false });
                  showSnackbar(response.message, false);
                } else {
                  this.setState({ 'loading': false });
                  showSnackbar(response.message, false);
                }
              }
            } else {
              const id = invoiceData._id;
              delete invoiceInput.payments;
              delete invoiceInput.onlinePayments;
              delete invoiceInput.createdAt;
              delete invoiceInput.lastViewedOn;
              delete invoiceInput.businessId;
              delete invoiceInput._id;
              delete invoiceInput.paymentButtons;
              invoiceInput.dueAmount = this.getDueAmountWithTax(invoiceInput.amountBreakup.subTotal);
              response = await updateInvoice(id, { invoiceInput });
              if (response.statusCode === 200) {
                this.setState({ 'loading': false });
                showSnackbar(response.message, false);
              } else {
                this.setState({ 'loading': false });
                showSnackbar(response.message, false);
              }
            }
          } else {
            invoiceInput.dueAmount = this.getDueAmountWithTax(invoiceInput.amountBreakup.subTotal);
            if (option === 'Payment') {
              invoiceInput.status = 'unsent';
            }
            if (option === 'Send') {
              invoiceInput.status = 'saved';
            }
            delete invoiceInput.onlinePayments;
            delete invoiceInput.payments;
            delete invoiceInput.createdAt;
            delete invoiceInput.businessId;
            delete invoiceInput.paymentButtons;
           
            response = await addInvoice({ invoiceInput });
            if (response.statusCode === 200) {
              this.setState({ 'loading': false });
              showSnackbar(response.message, false);
            } else {
              this.setState({ 'loading': false });
              showSnackbar(response.message, false);
            }
          }
          if (response) {
            if (option === 'Payment') {
              openPayment();
            } else if (option === 'Send') {
              openMailBox();
            }
            history.push(`/app/invoices/view/${response.data.invoice._id}`);
          }
        } else {
          this.setState({ 'loading': false });
          showSnackbar('Please select an item to proceed.', true);
        }
      }
    } catch (error) {
      this.setState({ 'loading': false });
      showSnackbar(error.message, true);
    }
  }

  handleTaxChange = (selected, i) => {
    let { invoiceInput } = this.state;
    let selectedTax = selected.map(item => {
      if (!!item) {
        return item.value;
      }
    });
    invoiceInput.items[i].taxes = selectedTax.filter((el) => el != null)
    this.setState({ invoiceInput }, () => this.calculateAmount());
  }

  onSort = (sortedList, dropEvent) => {
    const { items, currency } = this.state.invoiceInput;
    const reduce = sortedList.reduce(
      (map, item) => map.set(item.content.props.id, item.rank),
      new Map()
    );
    const result = items.map(check => {
      check.position = reduce.get(check.item);
      return check;
    });
    result.sort((a, b) => a.position - b.position);
    this.setState({
      'invoiceInput': {
        ...this.state.invoiceInput,
        'items': result
      }
    });
  }

  onCustomerChange = () => {
    this.handleCustomer(undefined);
  }

  onPreviewClick = () => {
    let invoiceInput = cloneDeep(this.state.invoiceInput);
    if (!!this.notesRef.current && !!this.notesRef.current.innerHTML) {
      invoiceInput.notes = DOMPurify.sanitize(this.notesRef.current.innerHTML);
    }
    invoiceInput.notes = invoiceInput.notes == '<br>' ? '' : invoiceInput.notes;
    invoiceInput.dueAmount = this.getDueAmountWithTax(invoiceInput.amountBreakup.subTotal);
    this.setState({
      invoiceInput,
      'showPreview': !this.state.showPreview
    });
  }

  onRecurringPreviewClick = () => {
    this.setState({
      'invoiceInput': {
        ...this.state.invoiceInput,
        'dueAmount': this.getDueAmountWithTax(this.state.invoiceInput.amountBreakup.subTotal)
      },
      'showPreview': !this.state.showPreview
    });
  }

  onSaveAndSend = () => {
    this.onSubmitInvoice('Send');
  }

  onSaveAndPayment = () => {
    this.onSubmitInvoice('Payment');
  }

  onShowCustomer = () => {
    this.setState({ 'showCustomer': !this.state.showCustomer });
  }

  onEditBusiness = () => {
    this.setState({
      'openBusinessPopup': true
    });
  }

  onEditBusinessClose = async businessInfo => {
    this.setState({
      'openBusinessPopup': false,
      businessInfo
    });
    // window.reload()
  }

  onImageUpload = async event => {
    const file = event.target.files[0];
  
    if (!file) return;
  
    // Validate file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      this.setState({ error: "File size exceeds 10MB. Please upload a smaller file." });
      return;
    }
  
    try {
      let imageUrl = await this.getSignedUrl(file);
      this.onUpdateSettings(event, imageUrl);
      this.setState({ error: null }); // Clear any previous error messages
    } catch (error) {
      this.setState({ error: "Failed to upload image. Please try again." });
    }
  };
  

  getSignedUrl = async file => {
    try {
      const payload = {
        's3Input': {
          'contentType': file.type,
          'fileName': file.name,
          'uploadType': 'logo'
        }
      };
      const response = await fetchSignedUrl(payload);
      const { sUrl, pUrl } = response.data.signedUrl;
      if (sUrl) {
        await uploadImage(sUrl, file, file.type);
        return pUrl;
      }
    } catch (error) {
      logger.log(error, 'gggggggggggg');
      this.props.showSnackbar('Something went wrong, please try again', true);
    }
  }

  removeLogoConfirmation = () => {
    this.setState(prevState => ({
      'deleteLogoConfirmation': !prevState.deleteLogoConfirmation
    }));
  }

  onUpdateSettings = async (e, imageUrl) => {
    let settings = !!this.props.userSettings ? this.props.userSettings : {};
    settings.companyLogo = !!imageUrl ? `${imageUrl}` : '';
    delete settings._id;
    delete settings.createdAt;
    delete settings.updatedAt;
    delete settings.__v;
    let salesSettingInput = {
      ...settings
    };
    try {
      this.setState({ 'deleteBtnLoad': true });
      let request = await patchSalesSetting({ salesSettingInput });
      if (request.statusCode === 200) {
        this.setState({ 'deleteBtnLoad': false });
        !imageUrl && this.removeLogoConfirmation();
        this.props.setUserSettings(request.data.salesSetting);
      } else {
        this.setState({ 'deleteBtnLoad': false });
        this.props.showSnackbar(request.message, true);
      }
    } catch (error) {
      this.setState({ 'deleteBtnLoad': false });
      this.props.showSnackbar(error.message, true);
    }
  }

  handleOnInputChange = async (event, fieldName) => {
    let invoiceInput = cloneDeep(this.state.invoiceInput);
    if (fieldName && fieldName.includes('Date')) {
      if (fieldName === 'dueDate') {
        invoiceInput[fieldName] = event;
      } else if (fieldName === 'invoiceDate') {
        invoiceInput[fieldName] = event;
      }

    } else if (fieldName === 'notifyStatus') {
      invoiceInput.notifyStatus = event;
    } else {
      const { name, value } = event.target;
      if (name === 'invoiceNumber') {
        if (!!value) {
          this.setState({ invoiceNumErr: false })
        } else {
          this.setState({ invoiceNumErr: true })
        }
      }
      invoiceInput[name] = value;
    }
    this.setState({ invoiceInput, 'showAlert': true });
  }

  handleEditCustomer = () => {
    this.setState({
      'openPopup': true,
      'type': 'CustomerPopup',
      'editCustomer': true
    });
  }

  toggleGrandTotal = () => {
    this.setState({
      invoiceInput: {
          ...this.state.invoiceInput,
        shouldAskProcessingFee: !this.state.invoiceInput.shouldAskProcessingFee
      }
    }, () => {
      this.calculateAmount()
    })
  }

  render() {
    const {
      invoiceInput,
      openHeader,
      customers,
      selectedCustomer,
      currencies,
      showExchange,
      showValidation,
      messages,
      showPreview,
      showCustomer,
      openPopup,
      type,
      deleteLogoConfirmation,
      openBusinessPopup,
      loader,
      businessInfo,
      showAlert,
      tooltipAutoGenDate,
      tooltipAutoGenNo,
      loading,
      deleteBtnLoad
    } = this.state;
    const dragProps = {
      'nodeSelector': 'li',
      'handleSelector': 'span'
    };
    const { isEditMode, userSettings, invoiceData, location } = this.props;
    const { itemHeading, totalAmount } = invoiceInput;
    // const previewInvoiceData = {...invoiceInput};
    // const sumofTax = data.invoice.amountBreakup.taxTotal.length > 0 ? data.invoice.amountBreakup.taxTotal.reduce((a,b) => {
    //     return a + b.amount
    //   },0) : 0
    //   const totalWithTax =  sumofTax + data.invoice.amountBreakup.subTotal || 0
    //    data.invoice.amountBreakup["totalWithTax"] = totalWithTax;
    // invoiceInputRecurringAdd;
    return (
      <Fragment>
        <Prompt
          when={showAlert}
          message={location =>
            'Your changes will be lost if you don\'t save your invoice.'
          }
        />
        {loader ? (
          <CenterSpinner />
        ) : (
            <div className="content-wrapper__main__fixed invoiceWrapper">
              <CommonHeader
                data={invoiceInput}
                location={this.props.location}
                isEditMode={isEditMode}
                state={this.state}
                onRecurringPreviewClick={this.onRecurringPreviewClick}
                onSubmitRecurringInvoice={this.onSubmitRecurringInvoice}
                onSubmitInvoice={this.onSubmitInvoice}
                onPreviewClick={this.onPreviewClick}
              />

              {showPreview ? (
                <ShowPreview
                  userSettings={userSettings}
                  invoiceInput={invoiceInput}
                  businessInfo={businessInfo}
                  selectedCustomer={selectedCustomer}
                />
              ) : (
                  <div className="content">
                    <div className="invoice-add__body">
                      {showValidation && (
                        <ValidationMessages
                          className="err color-red mrT20"
                          id="invoiceCustomerErr"
                          messages={messages}
                          title="Oops! There was an issue with updating your invoice. Please try again."
                          autoFocus={true}
                        />
                      )}

                      <div className="content">
                        <ContentHeader
                          userSettings={userSettings}
                          businessInfo={businessInfo}
                          invoiceInput={invoiceInput}
                          collapse={this.state.collapse}
                          removeLogoConfirmation={this.removeLogoConfirmation}
                          toggleBusiness={this.toggleBusiness}
                          onImageUpload={this.onImageUpload}
                          onEditBusiness={this.onEditBusiness}
                          handleOnInputChange={this.handleOnInputChange}
                          error={this.state.error} // Pass the error state
                        />

                        <div className="py-box is-highlighted invoice-add__body__center">
                          <div className="row no-gutters justify-content-between">
                            {
                              !!this.state.customerLoad ? <CenterSpinner /> : (
                                <AddCustomer
                                  selectedCustomer={selectedCustomer}
                                  handleEditCustomer={this.handleEditCustomer}
                                  onCustomerChange={this.onCustomerChange}
                                  showCustomer={showCustomer}
                                  onShowCustomer={this.onShowCustomer}
                                  handleCustomer={this.handleCustomer}
                                  customers={customers}
                                  invoiceData={invoiceData}
                                />
                              )
                            }
                            <CustomerRightSection
                              invoiceInput={invoiceInput}
                              handleOnInputChange={this.handleOnInputChange}
                              tooltipAutoGenDate={tooltipAutoGenDate}
                              tooltipAutoGenNo={tooltipAutoGenNo}
                              toggleToolTip={this.toggleToolTip}
                              PAYMENT_DUE_OPTION={PAYMENT_DUE_OPTION}
                              currencies={currencies}
                              handleCurrency={this.handleCurrency}
                              invoiceNumErr={this.state.invoiceNumErr}
                            />
                          </div>
                          <div className="invoice-add-info__section">
                            <div className="invoice-add-info__customize-tab">
                              <a
                                className="py-text--link py-text--strong"
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

                            {invoiceInput ? <CustomizeHeader
                              invoice={invoiceInput}
                              openHeader={openHeader}
                              onClose={this.closeHeader}
                              onSave={this.onHeaderChange}
                            /> : null}

                            <div className="invoice-add-info__itemtable">
                              {this.state.invoiceInput ? <AddItemComponent
                                itemHeading={itemHeading}
                                renderTableRow={this.renderTableRow}
                                products={this.state.products}
                                taxList={this.state.taxList}
                                openProduct={this.state.openProduct}
                                type={this.state.type}
                                handleProductValue={this.handleProductValue}
                                handleProduct={this.handleProduct}
                                handleDelete={this.handleDelete}
                                items={this.state.invoiceInput.items}
                                currency={this.state.invoiceInput.currency}
                                handleItemBlur={this.handleItemBlur}
                                fetchtaxList={this.fetchtaxList}
                                onSort={this.onSort}
                                priceError={this.state.priceError}
                                handleTaxChange={this.handleTaxChange}
                                list={this.list}
                                itemsHtml={this.itemsHtml}
                              >
                                <ReactDragListView {...dragProps}
                                  onDragEnd={(fromIndex, toIndex) => this.onDragEnd(fromIndex, toIndex)}>
                                  <ol className="p-0 m-0 list-unstyled">
                                    {this.itemsHtml()}
                                  </ol>
                                </ReactDragListView>
                              </AddItemComponent> : null}

                              {!this.state.hideAddButton ? (
                                <Button
                                  onClick={this.addItem}
                                  className="btn-add-invoice"
                                  color="primary"
                                  outline
                                  block
                                >
                                  <ReactSVG
                                    src={icAddSvg}
                                    afterInjection={(error, svg) => {
                                      if (error) {
                                        return;
                                      }
                                    }}
                                    beforeInjection={svg => {
                                      svg.classList.add('py-svg-icon');
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
                              {invoiceInput ? <TotalComponent
                                getAmountToDisplay={getAmountToDisplay}
                                invoiceInput={invoiceInput}
                                businessInfo={businessInfo}
                                showExchange={showExchange}
                                currencies={currencies}
                                grandTotal={totalAmount}
                                shouldAskProcessingFee={this.state.invoiceInput.shouldAskProcessingFee}
                                toggleGrandTotal={this.toggleGrandTotal}
                                handleCurrency={this.handleCurrency}
                              /> : null}
                            </div>
                          </div>
                          {invoiceInput ? <Notes
                            invoiceInput={invoiceInput}
                            handleOnInputChange={this.handleOnInputChange}
                            notesRef={this.notesRef}
                          /> : null}
                        </div>
                        <ContentFooter
                          collapse={this.state.collapse}
                          toggleFooter={this.toggleFooter}
                          invoiceInput={invoiceInput}
                          footerCollapse={this.state.footerCollapse}
                          handleOnInputChange={this.handleOnInputChange}
                        />
                      </div>
                    </div>
                  </div>
                )}

              {showPreview ? null : (
                <CommonFooter
                  onRecurringPreviewClick={this.onRecurringPreviewClick}
                  onSubmitRecurringInvoice={this.onSubmitRecurringInvoice}
                  loading={loading}
                  onPreviewClick={this.onPreviewClick}
                  onSubmitInvoice={this.onSubmitInvoice}
                  openBelowDropdown={this.state.openBelowDropdown}
                  toggleBelowDropdown={this.toggleBelowDropdown}
                  onSaveAndSend={this.onSaveAndSend}
                  onSaveAndPayment={this.onSaveAndPayment}
                />
              )}
            </div>
          )}
        <DeleteModal
          message={`Removing your logo will remove it from all existing and future invoices.
        Are you sure you want to remove your business logo?`}
          openModal={deleteLogoConfirmation}
          onDelete={this.onUpdateSettings}
          onClose={this.removeLogoConfirmation}
          btnLoad={deleteBtnLoad}
        />
        <BusinessPopup
          openPopup={openBusinessPopup}
          onClose={this.onEditBusinessClose}
        />
        <Popup
          type={type}
          openPopup={openPopup}
          onClosePopup={this.onPopupClose}
          updateList={this.updateList}
          setData={this.setData.bind(this)}
          isEditMode={this.state.editCustomer}
          customer={selectedCustomer}
          invoice={invoiceInput}
          invoiceData={invoiceData}
        />
      </Fragment>
    );
  }
}

const mapPropsToState = state => ({
  'userSettings': state.settings.userSettings,
  'businessInfo': state.businessReducer.selectedBusiness
});
const mapDispatchToProps = dispatch => {
  return {
    'showSnackbar': (message, error) => {
      dispatch(openGlobalSnackbar(message, error));
    },
    'openPayment': () => {
      dispatch(openPayment());
    },
    'openMailBox': () => {
      dispatch(openMailBox());
    },
    'setUserSettings': data => {
      dispatch(setUserSettings(data));
    }
  };
};

export default withRouter(
  connect(mapPropsToState, mapDispatchToProps)(InvoiceForm)
);
