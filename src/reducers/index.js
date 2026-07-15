import { routerReducer } from 'react-router-redux';
import { combineReducers } from 'redux';
import * as ActionTypes from '../constants/ActionTypes';
import appUserReducer from './appUserReducer'
import { billsReducer, getAllBills } from './billsReducer';
import businessReducer from './businessReducer';
import checkoutReducer from './checkoutReducer';
import customerReducer from './CustomerReducer';
import estimateReducer from './estimateReducer';
import { deleteCards, getAllCards } from './getAllCardsReducer';
import { getAllBankAccounts, getAllInvoicePayments, getAllInvoices } from './invoiceReducer';
import paymentReducer from './paymentReducer';
import userReducer from './userReducer';
import verificationReducer from './verificationReducer';
import productReducer from './productReducer';
import receipts from './receiptReducer';
import receiptSettings from './receiptSettings';
import { sendMail } from './sendMailReducer';
import settings from './settings';
import snackbarReducer from './snackBarReducer';
import { getAllRecurring, getAllRecurringCount } from './RecurringReducer';
import { getResetLink, passwordReset, linkVerify, registerVerify } from './authReducer';

import { addVendor, deleteVendor, getAllVendors, getByIdVendor, updateVendor, vendorBank } from './vendorReducer';
import paymentSettings from './paymentSettings';
import { bankingReducer } from './bankingReducer';
import { transactionReducer } from './bankingReducer/transactionReducer';
import { profileReducer } from './profileReducer';
import { getAllMCC, IpInfo, BannerList } from './utilityReducer';
import { getAllPayout,singlePayout } from './payoutReducer';
import { getThemeMode } from './themeReducer';
import { getEventTimeline } from './timelineReducer';
import { documentsReducer } from './documentsReducer';
import subscriptionReducer from './subscriptionReducer';
import deviceSessionReducer from './deviceSessionReducer';
import crowdFundingReducer from "./crowdFundingReducer"

const reducers = {
  routing: routerReducer,
  documents: documentsReducer,
  settings,
  userData: userReducer,
  verification: verificationReducer,
  themeReducer: getThemeMode,
  appUserReducer,
  productReducer,
  checkoutReducer,
  customerReducer,
  businessReducer,
  snackbar: snackbarReducer,
  paymentReducer,
  getAllVendors,
  addVendor,
  updateVendor,
  deleteVendor,
  getByIdVendor,
  getAllBills,
  sendMail,
  getAllBankAccounts,
  getAllInvoicePayments,
  getAllCards,
  receiptSettings,
  vendorBank,
  bills: billsReducer,
  deleteCards,
  receipts,
  getAllRecurring,
  getAllRecurringCount,
  getResetLink,
  passwordReset,
  linkVerify,
  paymentSettings,
  banking: bankingReducer,
  transaction: transactionReducer,
  profile: profileReducer,
  registerVerify,
  estimateReducer,
  invoice: getAllInvoices,
  getAllMCC,
  IpInfo,
  payouts:getAllPayout,
  payoutDetail:singlePayout,
  timelines: getEventTimeline,
  subscriptionReducer,
  BannerList,
  deviceSession: deviceSessionReducer,
  crowdFundingReducer
};

// const rootReducer = combineReducers(reducers);
// export default rootReducer;
// 19 jan 2019 21:20:37
const appReducer = combineReducers(reducers);
const rootReducer = (state, action) => {
  if (action.type === ActionTypes.USER_LOGOUT) {
    state = undefined
  }
  return appReducer(state, action)
};

// module.exports = combineReducers(reducers);
export default rootReducer;
