import * as PaymentIcon from '../global/PaymentIcon'
import moment from 'moment'
import React from 'react'
import TimeAgo from 'react-timeago'
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter'
import { isEmpty } from 'lodash'
import { downloadSubscriptionPdf } from '../api/subscriptionService'
import { downloadPdf } from '../api/InvoiceService'
import { getDeviceInfo, toDisplayDate } from './common'
import history from '../customHistory'
import LoginService from '../api/LoginService'
import { _setToken } from './authFunctions'
import { persistingStore } from '../index'
import { store } from '../Store'
import {
  _addDate,
  _displayDate,
  _getDiffDate,
  _getEndOf,
  _getStartOf,
} from './globalMomentDateFunc'
import TimeAgoFormatter from '../global/TimeAgoFormatter'
import { setThemeMode, setThemeModeAction } from '../actions/themeAction'
import Main_Logo from "../assets/logo/finance-logo.png"

export function changePhoneFormate(phoneNumber) {
  // if (phoneNumber) {
  //   let r = phoneNumber.replace(/\D/g, '')
  //   r = r.replace(/^0/, '')
  //   return r.replace(/^(\d\d\d)(\d{3})(\d{4}).*/, '($1) $2-$3')
  // } else {
  // }
  return phoneNumber
}

export function changeZipFormate(zipNumber) {
  if (zipNumber) {
    let r = zipNumber.replace(/\D/g, '')
    r = r.replace(/^0/, '')
    return (r = r.replace(/^(\d{5})(\d{4}).*/, '$1$2'))
  }
  return ''

}

// Convert Number type value to money
Number.prototype.toMoney1 = function (decimals, decimal_sep, thousands_sep) {
  let n = this

  let c = isNaN(decimals) ? 2 : Math.abs(decimals)
  // if decimal is zero we must take it, it means user does not want to show any decimal

  let d = decimal_sep || '.'
  // if no decimal separator is passed we use the dot as default decimal separator (we MUST use a decimal separator)
  /*
    according to [https://stackoverflow.com/questions/411352/how-best-to-determine-if-an-argument-is-not-sent-to-the-javascript-function]
    the fastest way to check for not defined parameter is to use typeof value === 'undefined'
    rather than doing value === undefined.
    */

  let t = typeof thousands_sep === 'undefined' ? ',' : thousands_sep
  // if you don't want to use a thousands separator you can pass empty string as thousands_sep value

  let sign = n < 0 ? '-' : ''

  // extracting the absolute value of the integer part of the number and converting to string

  let i = `${parseInt((n = Math.abs(n).toFixed(c)))}`

  var j = (j = i.length) > 3 ? j % 3 : 0
  return (
    sign +
    (j ? i.substr(0, j) + t : '') +
    i.substr(j).replace(/(\d{3})(?=\d)/g, `$1${t}`) +
    (c
      ? d +
      Math.abs(n - i)
        .toFixed(c)
        .slice(2)
      : '')
  )
}

export function toMoney(price, addComma = true) {
  if (typeof price === 'string') {
    price = parseFloat(price)
  }
  price = !!price ? price : 0
  if (addComma) {
    return price.toMoney1(2, '.', ',')
  } return price.toMoney1(2, '.', '')
}

// Convert String type value to money
String.prototype.toMoney = function () {
  const price = parseFloat(this) || 0
  return `${price.toMoney1()}`
}

export function changePriceFormat(price, fixed = 2) {
  if (typeof price === 'string') {
    price = parseFloat(price)
  }
  price = price || 0
  return Number(price)
}

export const checkEmptyCardForm = keyObject => {
  const {
    cardNumber,
    cardExpiry,
    cardCvc,
    postalCode,
    cardHolderNameEmpty
  } = keyObject
  if (
    !cardNumber &&
    !cardExpiry &&
    !cardCvc &&
    !postalCode &&
    !cardHolderNameEmpty
  ) {
    return false
  }
  return true
}

export const renderCardNumber = (last4, brand) => {
  if (brand === "amex") {
    return `•••• •••••• ${last4}`
  }
  return `•••• •••• •••• ${last4}`

}
export const sortData = (value1, value2, order) => {
  if (order === 'asc') {
    return value2 - value1
  }
  return value1 - value2 // desc
}

export function privacyPolicy() {
  return `${process.env.REACT_APP_ROOT_URL}/privacy-policy.html`
}

export function terms() {
  return `${process.env.REACT_APP_ROOT_URL}/terms-of-use.html`
}
export function home() {
  window.open(`${process.env.REACT_APP_ROOT_URL}/`)
}

export function security() {
  window.open(`${process.env.REACT_APP_ROOT_URL}/security.html`)
}

export function getstarted() {
  return `${process.env.REACT_APP_ROOT_URL}`
}

export function help() {
  window.$crisp = [];
  window.CRISP_WEBSITE_ID = process.env.REACT_APP_CRISP_ID;

  (function () {
    let d = document;
    let s = d.createElement("script");

    s.src = "https://client.crisp.chat/l.js";
    s.async = 1;
    d.getElementsByTagName("head")[0].appendChild(s);
  })();
  window.$crisp.push(['do', 'chat:open'])
}

export function feedback() {
  const Userback = window.Userback || {};
  if (Userback) {
    Userback.show()

    Userback.open()
  }
}

export function colormode(selectedMode) {
  store.dispatch(selectedMode ? setThemeMode("light-mode") : setThemeModeAction("light-mode"));
  localStorage.setItem("colormode", "light-mode");
  sessionStorage.setItem("colormodeSessionStorageData", "light-mode");
  document.body.classList.remove('dark-mode');
  document.body.classList.add('light-mode');
}

// Converts any color into darker shade shadeColor("#63C6FF",-40);
// Converts any color into ligher shade shadeColor("#63C6FF",40);
export function shadeColor(color, percent = -20) {
  if (isDarkColor(color)) {
    percent = 40
  } else {
    percent = -20
  }
  let R = parseInt(color.substring(1, 3), 16)
  let G = parseInt(color.substring(3, 5), 16)
  let B = parseInt(color.substring(5, 7), 16)
  if (R == 0) R = 32
  if (G == 0) G = 32
  if (B == 0) B = 32
  R = parseInt((R * (100 + percent)) / 100)
  G = parseInt((G * (100 + percent)) / 100)
  B = parseInt((B * (100 + percent)) / 100)
  R = R < 255 ? R : 255
  G = G < 255 ? G : 255
  B = B < 255 ? B : 255
  let RR = R.toString(16).length == 1 ? `0${R.toString(16)}` : R.toString(16)
  let GG = G.toString(16).length == 1 ? `0${G.toString(16)}` : G.toString(16)
  let BB = B.toString(16).length == 1 ? `0${B.toString(16)}` : B.toString(16)
  return `#${RR}${GG}${BB}`
}

// Function tells whether provided color is bright or dark
function isDarkColor(color) {
  // Variables for red, green, blue values
  var r, g, b, hsp

  // Check the format of the color, HEX or RGB?
  if (color.match(/^rgb/)) {
    // If HEX --> store the red, green, blue values in separate variables
    color = color.match(
      /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/
    )

    r = color[1]
    g = color[2]
    b = color[3]
  } else {
    // If RGB --> Convert it to HEX: http://gist.github.com/983661
    color = +('0x' + color.slice(1).replace(color.length < 5 && /./g, '$&$&'))

    r = color >> 16
    g = (color >> 8) & 255
    b = color & 255
  }

  // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
  hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b))

  // Using the HSP value, determine whether the color is light or dark
  if (hsp > 127.5) {
    return false
  }
  return true

}

// This function is used only in Invoice module for handling date with timeAgo formatters
export const _invoiceDateTime = (date, showTime, format, showTz, tzFormat, formatterType = null) => {
  if (_getDiffDate(date) >= 0 && _getDiffDate(date) <= 6) {
    // If day difference is 0 or >0 then we need to show time ago formatter for future dates
    const formatter = getTimeAgoFormatter(formatterType || 'future')
    return (
      <TimeAgo
        date={formatterType ? date : _getEndOf(date).format('YYYY-MM-DD HH:mm')}
        formatter={formatter}
      />
    )
  } if (_getDiffDate(date) < 0 && _getDiffDate(date) >= -6) {
    // If day difference is <0 then we need to show time ago formatter for past dates
    const formatter = getTimeAgoFormatter('past')
    return (
      <TimeAgo
        date={_getStartOf(date).format('YYYY-MM-DD hh:mm')}
        formatter={formatter}
      />
    )
  } else {
    // If day difference is more than 6 days then it will show full date
    return toDisplayDate(date, showTime, format, showTz, tzFormat)
  }
}

export const _dueText = date => {
  let txt = 'Due'
  if (
    _getDiffDate(date) > 0 &&
    _getDiffDate(date) <= 6
  ) {
    if (
      _getDiffDate(date) <= 1
    ) {
      txt = 'Due'
    } else txt = 'Due in'
  } else if (
    _getDiffDate(date) <= 0 &&
    _getDiffDate(date) >= -6
  ) {
    txt = 'Due'
  } else {
    txt = 'Due on'
  }
  return txt
}

export const _calculateTotalPaid = data => {
  let total = 0
  if (!!data && data.length > 0) {
    for (let i = 0; i < data.length; i++) {
      total += data[i].amount
    }
  }
  return total
}

export const _documentTitle = (businessInfo, title) => {
  const parts = ['Finance']
  if (businessInfo && businessInfo.organizationName) {
    parts.push(businessInfo.organizationName)
  }
  if (title) {
    parts.push(title)
  }
  document.title = parts.join(' - ')
}

export const _paymentMethodDisplay = method => {
  let txt = ''
  if (method) {
    switch (method.toLowerCase()) {
      case 'bank':
        txt = ` using a bank payment`
        break
      case 'cash':
        txt = ' using cash'
        break
      case 'check':
        txt = ' using a check'
        break
      case 'card':
        txt = ' using a credit card'
        break
      case 'paypal':
        txt = ' using PayPal'
        break
      case 'other':
        txt = ''
        break
      case 'cashapp':
        txt = ' using cashapp'
        break
      case 'afterpay_clearpay':
        txt = ' using Afterpay & Clearpay'
        break
      case 'klarna':
        txt = ' using klarna'
        break
      default:
        txt = ''
    }
  }
  return txt
}

export const _paymentMethodIcons = method => {
  const icon = PaymentIcon[method]
  return icon
}

export const _showPaymentText = (date, currency, type, amount) => {
  const text = `${_displayDate(date, 'MMMM DD, YYYY')} - A ${type} for <strong>${type === 'refund'
    ? `(${getAmountToDisplay(currency, amount)})`
    : getAmountToDisplay(currency, amount)
    }</strong>`
  return text
}

export const getAmountToDisplay = (currency = { symbol: '$' }, amount) => {
  const symbol = currency ? currency.symbol : ''
  amount =
    amount < 0
      ? `(${symbol}${toMoney(amount * -1)})`
      : `${symbol}${toMoney(amount)}`
  return `${amount}`
}

export const _showExchangeRate = (businessCurrency, matchCurrency) => {
  if (!!matchCurrency && !!matchCurrency.code) {
    if (
      (businessCurrency && businessCurrency.code) !==
      (matchCurrency && matchCurrency.code)
    ) {
      return true;
    }
    return false;

  } else {
    return false;
  }
};


export const _calculateExchangeRate = (exchangeRate, amount) => {
  const total = exchangeRate * amount
  return total
}

export const _showAmount = (symbol, amount) => {
  const totalAmount = `${symbol}${toMoney(amount)}`
  return totalAmount
}

export const _setCurrency = (currentCurrency, businessCurrency) => {
  let currency = {
    symbol: '$',
    code: 'USD',
    displayName: 'USD ($)-US Dollar',
    name: 'US Dollar'
  }
  if (currentCurrency) {
    if (!!currentCurrency.code && !!currentCurrency.symbol) {
      currency = {
        symbol: currentCurrency.symbol,
        code: currentCurrency.code,
        displayName: currentCurrency.displayName,
        name: currentCurrency.name
      }
    }
  } else if (businessCurrency) {
    if (!!businessCurrency.code && !!businessCurrency.symbol) {
      currency = {
        symbol: businessCurrency.symbol,
        code: businessCurrency.code,
        displayName: businessCurrency.displayName,
        name: businessCurrency.name
      }
    }
  }
  return currency
}

export const _downloadPDF = async (data, from) => {
  let link
  let pdfLink
  try {
    if (from === 'subscription') {
      pdfLink = await downloadSubscriptionPdf(data)
    } else {
      pdfLink = await downloadPdf(data.uuid, from)
    }

    if (pdfLink) {
      const blob = new Blob([pdfLink], { type: 'application/pdf' })
      link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
    }
    return link
  } catch (err) {
    return false
  }
}

export const isEmail = value => {
  const regex = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/
  return regex.test(value)
}

export const debounce = (a, b) => {
  let d
  const func = () => {
    let f = this;
    var g = this.arguments
    clearTimeout(d)
    // d=null
    d = setTimeout(a.apply(f, g), b)
  }
  return func()
}

// Usage
// Refrsh Token
let refrestTimer;
export const logout = async (search = null, to = null) => {
  colormode('logout')
  if (refrestTimer) {
    clearInterval(refrestTimer)
    refrestTimer = null;
  }

  const basicAuthToken = localStorage.getItem('basicAuthToken')
  localStorage.clear();
  localStorage.setItem('basicAuthToken', basicAuthToken)

  // Static demo: clear session only — no forced redirect to /signin
  await persistingStore.purge()
}
export const setupRefreshTimer = () => {
  if (!localStorage.getItem('token')) {
    return
  }
  if (refrestTimer) {
    clearInterval(refrestTimer)
    refrestTimer = null
  }
  const expiryToken = localStorage.getItem('expiryToken')
  let durationSeconds
  if (!expiryToken || expiryToken === 'undefined') {
    // Static demo / missing expiry: refresh daily, do not logout
    durationSeconds = 86400
  } else if (/^\d+(\.\d+)?$/.test(String(expiryToken))) {
    durationSeconds = moment.unix(Number(expiryToken)).diff(moment(), 'seconds')
  } else {
    durationSeconds = moment(expiryToken).diff(moment(), 'seconds')
  }
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 120) {
    durationSeconds = 86400
  }
  refrestTimer = setInterval(async () => {
    callRefresh()
  }, Math.max(durationSeconds - 100, 60) * 1000)
}

export const callRefresh = async _ => {
  try {
    const deviceInfo = await getDeviceInfo();
    const refreshData = await (LoginService.refreshToken({
      accessToken: localStorage.getItem("token"),
      refreshToken: localStorage.getItem("refreshToken"),
      deviceInfo
    }));
    if (refreshData.statusCode === 200 || refreshData.statusCode === 201) {
      _setToken(refreshData.data || refreshData)
    }
    // Static demo: never logout on refresh failure
  } catch (e) {
    console.warn('Token refresh skipped', e)
  }
  return null
}

export const logger = {
  error: (message, value) => console.error(`${message} ==> `, value),
  log: (message, value) => console.log(`${message} ==> `, value),
  warn: (message, value) => console.warn(`${message} ==> `, value)
}

export const _isValidEmail = email => {
  const regEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return regEx.test(email);
}

export const _isValidPhone = number => {
  if (number.match(/^(\+\d{1,3}[- ]?)?\d{10}$/) && !(number.match(/0{5,}/))) {
    return true
  }
  return false

}
// export const _setUrl = (url, page) => {
//   let newUrl = url;
//   if
// }


// Handle Component based Permissions
export const handleAclPermissions = roles => {
  const getSelectedBiz = store.getState().businessReducer.selectedBusiness
  const activeRole = getSelectedBiz ? getSelectedBiz.role : "Owner"
  return roles.includes(activeRole)
}

export const getTimeAgoFormatter = (type) => {
  return buildFormatter(TimeAgoFormatter[type])
}

export const customTimeAgo = (date, type) => {
  const dayDifference = _getDiffDate(date)
  if (type === '1') {
    if (dayDifference === 0) {
      return 'Today'
    } if (dayDifference === 1) {
      return `Tomorrow`
    } else if (dayDifference > 1 && dayDifference <= 6) {
      return `Within ${dayDifference} days`
    } else if (dayDifference < -1 && dayDifference >= -6) {
      return `${dayDifference * -1} days ago`
    } else {
      return _displayDate(date, 'MMM DD, YYYY')
    }
  } else {
    if (dayDifference === 0) {
      return 'Today'
    } else if (dayDifference === 1) {
      return `In 1 day`
    } else if (dayDifference === -1) {
      return '1 day ago'
    } else if (dayDifference > 1) {
      return `In ${dayDifference} days`
    } else if (dayDifference < -1) {
      return `${dayDifference * -1} days ago`
    } else {
      return _displayDate(date, 'YYYY-MM-DD')
    }
  }
}

export const removeURLParameter = (url, parameter) => {
  //prefer to use l.search if you have a location/link object
  var urlparts = url.split('?');
  if (urlparts.length >= 2) {

    var prefix = encodeURIComponent(parameter) + '=';
    var pars = urlparts[1].split(/[&;]/g);

    //reverse iteration as may be destructive
    for (var i = pars.length; i-- > 0;) {
      //idiom for string.startsWith
      if (pars[i].lastIndexOf(prefix, 0) !== -1) {
        pars.splice(i, 1);
      }
    }

    url = urlparts[0] + '?' + pars.join('&');
    return url;
  }
  return url;

}

export const calculateRecurringDueDate = (data) => {
  if (data.notifyStatus.key === 'on') {
    return data.nextInvoiceDate
  }
  return _addDate(data.nextInvoiceDate, data.notifyStatus.key)

}

export const getLogoURL = () => {
  const { themeMode } = store.getState().themeReducer
  const logoURL = themeMode === 'dark-mode' ?
    `${Main_Logo}` :
    `${Main_Logo}`

  return logoURL
}

export const minimumTwoDigits = (number) => {
  return `${number < 10 ? '0' : ''}${number}`;
}

export const getAmountToDisplayWithColor = (amount, currency) => {
  const symbol = !isEmpty(currency) ? currency.symbol : ''
  if (amount < 0) {
    return (<span>{`${symbol}${toMoney(amount * -1)}`}</span>)
  }
  return (<span className='text-success'>{`+ ${symbol}${toMoney(amount)}`}</span>)
}

export const isDisableHelpButtonForStarterPlan = (subscriptionPlan) => {
  try {
    const isStarterPlan = subscriptionPlan === 1;
    const isPremiumPlan = subscriptionPlan === 2;
    const isPremiumProPlan = subscriptionPlan === 3;
    const isPremiumElitePlan = subscriptionPlan === 4;
    const isPremiumAmbassador = subscriptionPlan === 5;
    const isPremiumEnterprise = subscriptionPlan === 6;

    const startHour = moment("09:00am", "hh:mma");
    const endHour = moment("03:00pm", "hh:mma");
    const currentTimeHour = moment().tz("America/New_York").format('hh:mma'); // EST time hour
    const currentMomentHour = moment(currentTimeHour, "hh:mma");
    const weekDay = moment().tz("America/New_York").isoWeekday();
    const isWeekEnd = [6, 7].includes(weekDay); // 6 = saturday, 7 = sunday
    if (isStarterPlan && currentMomentHour.isAfter(startHour) && currentMomentHour.isBefore(endHour) && !isWeekEnd) {
      return false
    }

    const premiumStartHour = moment("04:00am", "hh:mma");
    const premiumEndHour = moment("08:00pm", "hh:mma");

    if (isPremiumPlan && currentMomentHour.isAfter(premiumStartHour) && currentMomentHour.isBefore(premiumEndHour)) {
      return false
    }

    if (isPremiumProPlan || isPremiumElitePlan || isPremiumAmbassador || isPremiumEnterprise) {
      return false
    }
    return true
  } catch (error) {
    console.error('Error in isDisableHelpButtonForStarterPlan:', error)
    return true
  }
}

export const customerSupportTooltipText = (subscriptionPlan) => {
  const isStarterPlan = subscriptionPlan === 1;
  const isPremiumPlan = subscriptionPlan === 2;
  const isPremiumProPlan = subscriptionPlan === 3;
  const isPremiumElite = subscriptionPlan === 4;
  const isPremiumAmbassador = subscriptionPlan === 5;
  const isPremiumEnterprise = subscriptionPlan === 6;

  if (isStarterPlan) {
    return 'Customer support is available 24/7 for Premium Elite & Premium Pro users, daily between 4am EST & 8pm EST for Premium users, and weekdays between 9am EST & 3pm EST for Starter users.';
  } if (isPremiumPlan) {
    return 'Customer support is available 24/7 for Premium Elite & Premium Pro users, daily between 4am EST & 8pm EST for Premium users, and weekdays between 9am EST & 3pm EST for Starter users.';
  } else if (isPremiumProPlan) {
    return 'Customer support is available 24/7 for Premium Elite & Premium Pro users, daily between 4am EST & 8pm EST for Premium users, and weekdays between 9am EST & 3pm EST for Starter users.';
  } else if (isPremiumElite || isPremiumAmbassador || isPremiumEnterprise) {
    return 'Customer support is available 24/7.';
  }
}

export const InfoIcon = () => {
  return (
    <div className="alert-icon">
      <svg className="Icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 19a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-2a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm0-11a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 3a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0v-4a1 1 0 0 1 1-1z" /></svg>
    </div>
  )
}
