import _, { orderBy, uniqBy } from "lodash";
import React from "react";
import CustomerServices from "../../../../../api/CustomerServices";
import { fetchCurrencies } from "../../../../../api/globalServices";
import ProductServices from "../../../../../api/ProductService";
import { changePriceFormat, privacyPolicy, terms, _setCurrency, home, getLogoURL } from "../../../../../utils/GlobalFunctions";
import { currencyObject } from "../../sales/components/customer/customerSupportFile/constant";
import { _displayDate, _addDate, _formatDate } from "../../../../../utils/globalMomentDateFunc";

export const invoiceInput = (state, businessInfo, userSettings, isEditMode) => {
  let payload = {
    _id: (state && state._id) || undefined,
    uuid: (state && state.uuid) || undefined,
    amountBreakup: (state && state.amountBreakup) || {
      subTotal: 0,
      taxTotal: [],
      total: 0
    },
    shouldAskProcessingFee: isEditMode ? state && state.shouldAskProcessingFee : true,
    createdAt: (state && state.createdAt) || new Date(),
    name: (state && state.name) || userSettings && userSettings.invoiceSetting.defaultTitle || "Invoice",
    invoiceLogo: invoiceLogo(state, userSettings),
    title: (state && state.title) || userSettings && userSettings.invoiceSetting.defaultTitle || "Invoice",
    subTitle: (state && state.subTitle) || userSettings && userSettings.invoiceSetting.defaultSubTitle || "",
    invoiceNumber: (state && state.invoiceNumber) || 0,
    customer: (state && state.customer) || "",
    isReminder: (state && state.isReminder) || false,
    currency: _setCurrency(state && state.currency, businessInfo && businessInfo.currency),
    invoiceDate: state && state.invoiceDate ? state.invoiceDate : new Date(), 
    dueDate: state && state.dueDate ? state.dueDate : new Date(),  
    footer: (state && state.footer) || userSettings && userSettings.invoiceSetting.defaultFooter || "",
    notes: (state && state.notes) || userSettings && userSettings.invoiceSetting.defaultMemo || "",
    itemHeading: (state && state.itemHeading) || userSettings && userSettings.itemHeading || {
      column1: {
        name: "Items",
        shouldShow: true
      },
      column2: {
        name: "Quantity",
        shouldShow: true
      },
      column3: {
        name: "Price",
        shouldShow: true
      },
      column4: {
        name: "Amount",
        shouldShow: true
      },
      hideAmount: false,
      hideDescription: false,
      hideItem: false,
      hidePrice: false,
      hideQuantity: false,
    },
    exchangeRate: (state && state.exchangeRate) || 1,
    items: (state && state.items) || [],
    totalAmount: (state && state.totalAmount) || 0,
    totalAmountInHomeCurrency: (state && state.totalAmountInHomeCurrency) || 0,
    dueAmount: (state && state.dueAmount) || 0,
    lastSent: (state && state.lastSent) || undefined,
    lastViewedOn: (state && state.lastViewedOn) || undefined,
    isRecurring: (state && state.isRecurring) || false,
    onlinePayments: (state && state.onlinePayments) || {
      enabled: false,
      modeBank: false,
      modeCard: false,
      onlinePaymentAllowed: false,
    },
    paymentButtons: (state && state.paymentButtons) || {
      payWithPaypal: false,
      payLaterWithPaypal: false,
      payWithVenmo: false,
    },
    purchaseOrder: (state && state.purchaseOrder) || "",
    payments: (state && state.payments) || null,
    sentDate: (state && state.sentDate) || undefined,
    paidDate: (state && state.paidDate) || undefined,
    status: (state && state.status) || "draft",
    skipped: (state && state.skipped) || false,
    sentVia: (state && state.sentVia) || "",
    schedule: {
      beforeFourteen: (state && state.schedule.beforeFourteen) || defaultReminder,
      beforeSeven: (state && state.schedule.beforeSeven) || defaultReminder,
      beforeThree: (state && state.schedule.beforeThree) || defaultReminder,
      onDueDate: (state && state.schedule.onDueDate) || defaultReminder,
      afterThree: (state && state.schedule.afterThree) || defaultReminder,
      afterSeven: (state && state.schedule.afterSeven) || defaultReminder,
      afterFourteen: (state && state.schedule.afterFourteen) || defaultReminder,
    },
    publicView: (state && state.publicView) || {},
    businessId: (state && state.businessId) | {},
    paymentFor: 'invoice'
  };
  // savedForFuture:false,
  payload.itemHeading["savedForFuture"] = state && state.itemHeading.savedForFuture || false;
  return payload
};

export const invoiceLogo = (state, settings) => {
  let invoiceImage = undefined;
  if (state && state.invoiceLogo) {
    invoiceImage = state.invoiceLogo
  } else if (settings && settings.displayLogo) {
    invoiceImage = settings.companyLogo
  }
  return invoiceImage
};

const defaultReminder = {
  enable: false,
  notifyDate: null
};

const dueDateWithin = (settings) => {
  let dueDate = _formatDate(new Date());

  const dueDateOn = settings.invoiceSetting && settings.invoiceSetting.defaultPaymentTerm ? settings.invoiceSetting.defaultPaymentTerm.key : '';
  switch (dueDateOn) {
    case "dueWithin15":
      dueDate = _formatDate(_addDate(new Date(), 15, "d"));
      break;
    case "dueWithin30":
      dueDate = _formatDate(_addDate(new Date(), 30, "d"));
      break;
    case "dueWithin45":
      dueDate = _formatDate(_addDate(new Date(), 45, "d"));
      break;
    case "dueWithin60":
      dueDate = _formatDate(_addDate(new Date(), 60, "d"));
      break;
    case "dueWithin90":
      dueDate = _formatDate(_addDate(new Date(), 90, "d"));
      break;
    default:
      dueDate = _formatDate(new Date());
  }
  return dueDate
};

export const setCustomerList = list => {
  let custList = list;
  custList.unshift({
    _id: "Add new customer",
    customerName: (
      <a className="select-add-new-option"><i className="Icon pe pe-7s-plus" />&nbsp;Add new customer
      </a>
    )
  });
  return custList;
};

export const getSelectedCustomer = (list, value, businessInfo) => {
  let selectedCust = value;
  list.forEach(item => {
    if (item._id === value) {
      selectedCust = item;
    }
  });
  return selectedCust;
};

export const INVOICE_ITEM = {
  item: undefined,
  column1: "",
  column2: "",
  column3: 1,
  column4: '0.00',
  taxes: [],
  amount: 0
};

export const setFormData = async (stateData, type) => {
  let currenciesResponse;
  let productResponse;
  let customerResponse;
  let currencyList = stateData.currencies;
  let customerList = stateData.customers;
  let productList = stateData.products;
  switch (type) {
    default:
      currenciesResponse = await fetchCurrencies();
      productResponse = (await ProductServices.fetchProducts('sell', `pageNo=1&pageSize=9007199254740991`)).data.products;
      customerResponse = (await CustomerServices.fetchCustomers(`pageNo=${1}&pageSize=${9007199254740991}`)).data
        .customers;
      currencyList = await setCurrencyList(currenciesResponse);
      productList = await setProductList(productResponse);
      customerList = await setCustomerList(customerResponse);
      break;
    case "ProductPopup":
      productResponse = (await ProductServices.fetchProducts('sales')).data.products;
      productList = await setProductList(productResponse);
      break;
    case "CustomerPopup":
      customerResponse = (await CustomerServices.fetchCustomers(`pageNo=${1}&pageSize=${9007199254740991}`)).data
        .customers;
      customerList = await setCustomerList(customerResponse);
      break;
    case "Currency":
      currenciesResponse = await fetchCurrencies();
      currencyList = await setCurrencyList(currenciesResponse);
      break;
  }
  const data = {
    currencies: currencyList,
    customers: customerList,
    products: productList
  };
  return data;
};

export const setProductList = list => {
  let prodList = [];
  list.map(item => {
    prodList.push({
      item: item._id,
      column1: item.name,
      column2: item.description,
      column3: 1,
      column4: item.price,
      taxes: item.taxes
    });
    return item;
  });
  prodList.unshift({
    item: "Add new item",
    column1: (
      <a className="select-add-new-option"><i className="Icon pe pe-7s-plus" />&nbsp;Add new item</a>
    )
  });
  return prodList;
};

export const setCurrencyList = list => {
  let countries = list;
  let currencies = countries.map(country => {
    return country.currencies[0];
  });
  currencies = orderBy(uniqBy(currencies, "code"), "code", "asc");
  return currencies;
};

export const getSelectedCurrency = (list, currency) => {
  let selectedValue = null;
  list.forEach(item => {
    if (currency && item.code === currency.code) {
      selectedValue = item;
    }
  });
  return selectedValue;
};

export const calculateTaxes = async (list, response) => {
  // let response = (await taxServices.fetchTaxes()).data.taxes;
  let taxsTotal = [];
  let subTotal = 0;
  let amount = 0;
  let sumAmount = 0;
  list.map(data => {
    subTotal = data.column3 * data.column4;
    sumAmount += data.column3 * data.column4;
    const taxList = data.taxes.filter((tax)=> tax !=null)
    if (taxList.length > 0) {
      taxList.map(tax => {
        response.map(item => {
          if (typeof tax === 'object' && tax.hasOwnProperty('_id')) {
            if (item._id === tax._id) {
              taxsTotal.push({
                taxName: item,
                rate: item.rate,
                amount: calculatePercent(subTotal, item.rate)
              });
              amount += calculatePercent(subTotal, item.rate);
            }
          } else {
            if (item._id === tax) {
              taxsTotal.push({
                taxName: item,
                rate: item.rate,
                amount: calculatePercent(subTotal, item.rate)
              });
              amount += calculatePercent(subTotal, item.rate);
            }
          }
        });
      });
    }
    amount += subTotal;
  });

  let taxArrayObject = _.groupBy(taxsTotal, 'taxName._id');
  let newArryaObj = _.uniqBy(taxsTotal, 'taxName');
  taxsTotal = newArryaObj.map(item => {
    item.amount = _.sumBy(taxArrayObject[item.taxName._id], 'amount');
    return item
  });
  return {
    sumAmount: sumAmount,
    taxsTotal: taxsTotal,
    amount: amount
  };
};

export const calculatePercent = (total, per) => {
  return (total / 100) * per;
};

export const mailMessage = (data, via, businessInfo) => {
  let subject = `${data.name}\ #${data.invoiceNumber} from ${
    businessInfo.organizationName
    }`;
  let message = `
  Below please find a link to ${data.name}\ #${data.invoiceNumber}.

  Amount due: ${(data.currency && data.currency.symbol) || ""}${
    data.dueAmount
    }

  Expires on: ${_formatDate(data.expiryDate)}

  To view this invoice online, please visit: ${process.env.REACT_APP_WEB_URL}/public/invoice/${data.uuid}`;
  if (via === "gmail") {
    return `https://mail.google.com/mail/u/0/?view=cm&&to=${escape(data.customer && data.customer.email)}
    &&su=${escape(
      subject
    )}&&body=${escape(message)}`;
  } else if (via === "yahoo") {
    return `http://compose.mail.yahoo.com/?to=${escape(data.customer && data.customer.email)}&&subj=${escape(
      subject
    )}&&body=${escape(message)}`;
  } else if (via === "outlook") {
    return `https://outlook.live.com/owa/?path=/mail/action/compose&&to=${escape(data.customer && data.customer.email)}&subject=${escape(
      subject
    )}&body=${escape(message)}`;
  }
};

export const InvoiceItems = props => {
  return (
    <div className="contemporary-template__items">
      <table className="table">
        <InvoiceItemsHeader
          invoiceInfo={props.invoiceInfo}
          userSettings={props.userSettings}
        />
        <RenderInvoiceItems
          invoiceInfo={props.invoiceInfo}
          invoiceItems={props.invoiceItems}
          sign={props.sign}
        />
      </table>
    </div>
  );
};

export const InvoiceItemsHeader = (props) => {
  const { itemHeading } = props.invoiceInfo;
  const borderColour = props.userSettings ? props.userSettings.accentColour : "#000";
  return (
    <thead>
      <tr>
        <th style={{ backgroundColor: borderColour }} width="300">{itemHeading.column1.name}</th>
        {!itemHeading.hideQuantity && <th style={{ backgroundColor: borderColour }} width="200">{itemHeading.column2.name}</th>}
        {!itemHeading.hidePrice && <th style={{ backgroundColor: borderColour }} width="200">{itemHeading.column3.name}</th>}
        {!itemHeading.hideAmount && <th style={{ backgroundColor: borderColour }} width="200">{itemHeading.column4.name}</th>}
      </tr>
    </thead>
  );
};

export const RenderInvoiceItems = props => {
  const { sign, invoiceItems, invoiceInfo } = props;
  const { itemHeading } = invoiceInfo;
  return (
    <tbody>
      {invoiceItems.map((item, key) => {
        return (
          <tr key={key} className="bodr_btm" >
            <td width="300">
              {!itemHeading.hideItem && <span className="text-strong">{item.column1}</span>}
              {!itemHeading.hideDescription && <p className="invoice-product-description">{item.column2}</p>}
            </td>
            {!itemHeading.hideQuantity && <td width="200">
              <span>{item.column3}</span>
            </td>}
            {!itemHeading.hidePrice && <td width="200">
              <span>{`${sign}${changePriceFormat(item.column4, 2)}`}</span>
            </td>}
            {!itemHeading.hideAmount &&
              <td width="200">
                <span>{`${sign}${changePriceFormat((item.column3 * item.column4), 2)}`}</span>
              </td>}
          </tr>
        );
      })}
    </tbody>
  );
};

export const renderPaymentDetails = data => {
  return null;
};

export const _institutionLists = [
  {
    name: 'Chase',
    img: '/assets/chase.svg'
  },
  {
    name: 'Bank of America',
    img: '/assets/boi.svg'
  },
  {
    name: 'Wells Fargo',
    img: '/assets/wells.svg'
  },
  {
    name: 'USAA',
    img: '/assets/usaa.svg'
  },
  {
    name: 'HSBC',
    img: '/assets/hsbc.png'
  },
  {
    name: 'Lloyds Banking',
    img: '/assets/lloyd.png'
  },
  {
    name: 'Royal Bank of Scotland',
    img: '/assets/rbs.png'
  },
  {
    name: 'Barclays',
    img: '/assets/barclays.png'
  },
];

export const PoweredByBank = () => {
  return (
    <div className="public-payment-footer">
      <span>Powered by <a href="javascript: void(0)" onClick={() => home()} className="font-bold ms-3"><img className="logo-action" src={getLogoURL()} alt="Finance" /></a></span>
      <br />
      <ul className="public-payment-footer-links">
        <li><a className="py-text--strong py-text--link" href={terms()} taget='_blank'>Terms of Use</a></li>
        <li><a className="py-text--strong py-text--link" href={privacyPolicy()} target="_blank">Privacy Policy</a></li>
        <li><a className="py-text--strong py-text--link" href={terms()} target="_blank">Security</a></li>
      </ul>
    </div>
  )
};

export const PoweredByReciept = () => {
  return (
    <div className="public-payment-footer">
      <span>Powered by <a href="javascript: void(0)" onClick={() => home()} className="font-bold ms-3"><img className="logo-action" src={getLogoURL()} alt="Finance" /></a></span>
    </div>
  )
};
