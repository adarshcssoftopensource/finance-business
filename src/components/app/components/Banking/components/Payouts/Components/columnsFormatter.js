import React from "react";
import { toMoney } from "../../../../../../../utils/GlobalFunctions";
import * as PaymentIcon from '../../../../../../../global/PaymentIcon';
import { Link } from 'react-router-dom'
import { _displayDate } from "../../../../../../../utils/globalMomentDateFunc";
import { getAmountToDisplay } from '../../../../../../../utils/GlobalFunctions';

const amountRender = (cell, row, rowIndex, formatExtraData) => {
  return (
    <div className="el-text">
      {getAmountToDisplay(row.currency, row.amount ? row.amount : 0)}
    </div>
  );
};

const amountRenderTransaction = (cell, row, rowIndex, formatExtraData) => {
  return (
    <div className="el-text">
      {getAmountToDisplay(row.currency, row.amountBreakup && row.amountBreakup.total ? row.amountBreakup.total : 0)}
    </div>
  );
};

const feeRender = (cell, row, rowIndex, formatExtraData) => {
  return (
    <div className="el-text text-right">
      {getAmountToDisplay(row.currency, row.amountBreakup ? row.amountBreakup.fee : 0)}
    </div>
  );
};

const statusRender = (cell, row, rowIndex, formatExtraData) => {
  if (cell == 'paid' || cell == 'approved' || cell == 'success') {
    return <div className={`badge badge-success`}>{cell}</div>
  } else if (cell == 'pending') {
    return <div className={`badge badge-alert`}>{cell}</div>
  } else {
    return <div className={`badge badge-danger`}>{cell}</div>
  }
};

const dateRender = (cell, row, rowIndex, formatExtraData) => {
  let getDate = new Date();
  if (row.timeline && row.timeline.arrivalDate) {
    getDate = row.timeline.arrivalDate
  } else if (row.payout && row.payout.timeline && row.payout.timeline.arrivalDate) {
    getDate = row.payout.timeline.arrivalDate
  } else {
    getDate = row.updatedAt || row.createdAt;
  }
  return (
    <span className="py-table__cell-content">
      {_displayDate(getDate, 'LL')}
    </span>
  );
};

const dateRenderTransacton = (cell, row, rowIndex, formatExtraData) => {
  let getDate = new Date();
  if (row.paymentDate && row.paymentDate) {
    getDate = row.paymentDate
  }
  return (
    <span className="py-table__cell-content">
      {_displayDate(getDate, 'LL')}
    </span>
  );
};

const customerRender = (cell, row, rowIndex, formatExtraData) => {
  return (
    <span className="py-table__cell-content">
      {row.customer.firstName} {row.customer.lastName}
    </span>
  );
}

const methodRender = (cell, row, rowIndex, formatExtraData) => {
  let icon = PaymentIcon[cell] ? PaymentIcon[cell] : cell;
  return (
    <img
      src={
        process.env.REACT_APP_WEB_URL.includes('localhost') ? `/${icon}` : icon
      }
      width="35px"
    />
  )
}

const actionRender = (cell, row, rowIndex, formatExtraData) => {
  return (
    <Link to={`/app/payments/view-payment/${row._id}`} className="py-text--link">View</Link>
  )
}

const noColumnRender = (cell, row, rowIndex, formatExtraData) => {
  return (
    <div className="inner-alert">
      <div className="alert alert-primary" role="alert">
        <svg viewBox="0 0 20 20" className="Icon" id="info" xmlns="http://www.w3.org/2000/svg"><path d="M10 19a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-2a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm0-11a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 3a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0v-4a1 1 0 0 1 1-1z"></path></svg>
        You don't have any estimates. Why not <Link to="/app/purchase/add" className="accent">create an estimate</Link>?
      </div>
    </div>
  )
};



export function getColumns() {
  return [
    {
      dataField: "status",
      classes: 'py-table__cell',
      text: "Status",
      formatter: statusRender,
      sort: false
    },
    {
      dataField: "",
      classes: 'py-table__cell',
      text: "Date",
      formatter: dateRender,
      sort: false,
    },
    {
      dataField: "amount",
      classes: 'py-table__cell-amount',
      text: "Amount",
      formatter: amountRender,
      sort: false,
      style: {
        textAlign: 'right'
      }
    }
  ];
}

export function getTransactionColumns() {
  return [
    {
      dataField: "paymentIcon",
      classes: 'py-table__cell',
      text: "Method",
      formatter: methodRender,
      sort: false
    },
    {
      dataField: "paymentType",
      classes: 'py-table__cell',
      text: "Type",
      sort: false
    },
    {
      dataField: "",
      classes: 'py-table__cell',
      text: "Date",
      formatter: dateRenderTransacton,
      sort: false,
    },
    {
      dataField: "customer",
      classes: 'py-table__cell',
      text: "Customer",
      formatter: customerRender,
      sort: false,
    },
    {
      dataField: "customer",
      classes: 'py-table__cell',
      text: "Fee",
      formatter: feeRender,
      sort: false,
    },
    {
      dataField: "amount",
      classes: 'py-table__cell-amount',
      text: "Amount",
      formatter: amountRenderTransaction,
      sort: false
    },
    {
      dataField: "",
      classes: 'py-table__cell-action',
      text: "Action",
      formatter: actionRender,
      sort: false
    }
  ];
}
