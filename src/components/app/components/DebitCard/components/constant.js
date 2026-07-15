import React from "react";
import { getCommonFormatedDate, toDisplayDate } from "../../../../../utils/common";
import { _displayDate } from "../../../../../utils/globalMomentDateFunc";

export const debitCardOnboarding = () => {
  let payload = {
    "paymentSettingInput": {
      "isWalletCreated": true
    }
  }
  return payload;
}

export const columns = [
  {
    dataField: 'status',
    text: 'Status',
    formatter: (text, data) => statusRender(text, data), // capitalization also done from here
    classes: 'text-left',
    headerClasses: 'text-left',
    sort: true,
  },
  {
    dataField: 'cardNumber',
    text: 'Card',
    classes: 'text-left',
    headerClasses: 'text-left',
    formatter: (data, row) => cardNumberDisplay(row)
  },
  {
    dataField: 'date',
    text: 'Date',
    formatter: (date) => toDisplayDate(date, true, 'MMM D, YYYY @ h:mm A'),
    classes: 'text-left',
    headerClasses: 'text-left',
    sort: false,
  },
  {
    dataField: 'description',
    text: 'Description',
    classes: 'text-left',
    headerClasses: 'text-left',
  },
  {
    dataField: 'amount',
    text: 'Amount',
    classes: 'py-table__cell-amount text-right',
    headerClasses: 'text-right',
    sort: false,
    formatter: (data) => amountNumber(data)
  }
];

const statusRender = (cell, row, rowIndex, formatExtraData) => {
  return row.status === "pending" ? (
    <span className="badge badge-gray">{row.status}</span>
  ) : row.status === "declined" ? (
    <span className="badge badge-danger">{row.status}</span>
  ) : row.status === "refunded" ? (
    <span className="badge badge-alert">{row.status}</span>
  ) : row.status === "success" ? (
    <span className="badge badge-success">{row.status}</span>
  ) : row.status === "disputed" ? (
    <span className="badge badge-warning">{row.status}</span>
  ) :
    (
      <span>{row.status}</span>
    );
};

const cardNumberDisplay = (data) => {
  if(data.cardNumber === "0000"){
    return <span>N/A</span>
  } else{
  return <span>**** **** **** {data.cardNumber} </span>
  }
}

const amountNumber = (data) => {
  return data.toFixed(2)
}