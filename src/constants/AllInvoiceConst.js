import React from 'react'
import { _formatDate } from '../utils/globalMomentDateFunc';

const statusRender = (cell, row, rowIndex, formatExtraData) =>{
    return (
      <span className="badge-danger">{_formatDate(row.expiryDate)}</span>
    );
  }
  
  const dateRender = (cell, row, rowIndex, formatExtraData)=> {
    return (
      <a href="javascript:void(0)">{_formatDate(row.estimateDate)}</a>
    );
  }
  
  const numberRender = (cell, row, rowIndex, formatExtraData)=> {
    return (
      <a href="javascript:void(0)">{row.estimateNumber}</a>
    );
  }
  
const customerRender = (cell, row, rowIndex, formatExtraData)=> {
    return (
      <a href="javascript:void(0)">{row.customer.customerName}</a>
    );
  }
  
  const amountRender = (cell, row, rowIndex, formatExtraData) => {
    return (
      <a href="javascript:void(0)">{row.amount}</a>
    );
  }

export const invoiceColumns = [{
  dataField: 'status',
  text: 'Status',
  formatter: statusRender,
  sort: true,
}, {
  dataField: 'date',
  text: 'Date',
  formatter: dateRender,
  sort: true

}, {
  dataField: 'number',
  text: 'Number',
  formatter: numberRender,
  sort: true
},
{
  dataField: 'customer',
  text: 'Customer',
  formatter: customerRender,
  sort: true
},
{
  dataField: 'amount',
  text: 'Amount',
  formatter: amountRender,
  sort: true
},
];

export const defaultSorted = [{
    dataField: 'name',
    order: 'desc'
  }];
