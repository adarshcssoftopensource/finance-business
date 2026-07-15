import React from 'react'
import { _displayDate } from '../utils/globalMomentDateFunc';

const statusRender = (cell, row, rowIndex, formatExtraData) =>{
    return (
      <span className="badge-danger">{_displayDate(row.expiryDate)}</span>
    );
  }
  
  const dateRender = (cell, row, rowIndex, formatExtraData)=> {
    return (
      <a className="py-table__cell-content" href="javascript:void(0)">{_displayDate(row.estimateDate)}</a>
    );
  }
  
  const numberRender = (cell, row, rowIndex, formatExtraData)=> {
    return (
      <a className="py-table__cell-content" href="javascript:void(0)">{row.estimateNumber}</a>
    );
  }
  
const customerRender = (cell, row, rowIndex, formatExtraData)=> {
    return (
      <a className="py-table__cell-content" href="javascript:void(0)">{row.customer.customerName}</a>
    );
  }
  
  const amountRender = (cell, row, rowIndex, formatExtraData) => {
    return (
      <a className="py-table__cell-content" href="javascript:void(0)">{row.amount}</a>
    );
  }

export const columns = [{
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
  dataField: 'amount due',
  text: 'Amount due',
  formatter: amountRender,
  sort: true
},
];

export const defaultSorted = [{
    dataField: 'name',
    order: 'desc'
  }];
