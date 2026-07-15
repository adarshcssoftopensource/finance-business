import React, { Fragment } from "react";
import { Link } from 'react-router-dom';
import history from "../customHistory";
import DropdownWrapper from "../global/DropdownWrapper";
import { toMoney, getAmountToDisplay } from "../utils/GlobalFunctions";
import { getCommonFormatedDate } from "../utils/common";
import { _displayDate } from "../utils/globalMomentDateFunc";

export const statusClass = (status) => {
  let className;
  switch (status) {
    case "expired" :
      className = 'badge-danger';
      break;
    case "saved" :
      className = "badge-secondary"
      break;
    case "sent" :
      className = "badge-success"
      break;
    default:
      className = "badge-warning e"
  }
  return className;
}

const statusRender = (cell, row, rowIndex, formatExtraData) => {
  return row.status === "expired" ? (
    <span className="badge badge-danger">{row.status}</span>
  ) : row.status === "saved" ? (
    <span className="badge badge-secondary">{row.status}</span>
  ) : row.status === "sent" ? (
    <span className="badge badge-success">{row.status}</span>
  ) : row.status === "viewed" ? (
    <span className="badge badge-warning">{row.status}</span>
  ) : (
            <span>{row.status}</span>
          );
};

const dateRender = (cell, row, rowIndex, formatExtraData) => {
  return (
    <a className="py-table__cell-content" onClick={() => history.push(`/app/estimates/view/${row._id}`)}>
      {_displayDate(row.estimateDate)}
    </a>
  );
};

const numberRender = (cell, row, rowIndex, formatExtraData) => {
  return <a className="py-table__cell-content" onClick={() => history.push(`/app/estimates/view/${row._id}`)}>{row.estimateNumber}</a>;
};

const customerRender = (cell, row, rowIndex, formatExtraData) => {
 /* {
    {
      row;
    }
  }*/
  return row.customer ? (
    <a className="py-table__cell-content" onClick={() => history.push(`/app/estimates/view/${row._id}`)}>{row.customer.customerName}</a>
  ) : null;
};

const amountRender = (cell, row, rowIndex, formatExtraData) => {
    let buisinessInfo = JSON.parse(JSON.parse(localStorage.getItem('reduxPersist:root')).businessReducer).selectedBusiness;
    return (
    <Fragment>
      <a className="py-table__cell-content d-inline" onClick={() => history.push(`/app/estimates/view/${row._id}`)}>
      {row ? `${getAmountToDisplay(row.currency, row.totalAmount ? row.totalAmount : 0)}`:''}
         {
          row && row.businessId.currency.code !== row.currency.code  ?
            <Fragment>
              <span className="py-text--hint">
                {getAmountToDisplay(buisinessInfo.currency, row.totalAmountInHomeCurrency)}
              </span>
            </Fragment> :
            null
        }
      </a>
    </Fragment>
  );
};

const actionRender = (cell, row, rowIndex, formatExtraData) => {
  return (
    <Fragment>
      <DropdownWrapper row={row} index={rowIndex} />
    </Fragment>
  );
};

const noColumnRender = (cell, row, rowIndex, formatExtraData) => {
  return (
    <div className="inner-alert">
      <div className="alert alert-primary" role="alert">
       <svg viewBox="0 0 20 20" className="Icon" id="info" xmlns="http://www.w3.org/2000/svg"><path d="M10 19a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-2a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm0-11a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 3a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0v-4a1 1 0 0 1 1-1z"></path></svg>
        You don't have any estimates. Why not <Link to="/app/estimates/add" className="accent">create an estimate</Link>?
        </div>
    </div>
  )
}

export const columnNull = [
  {
    dataField: "",
    text: "Status",
    formatter: noColumnRender,
    classes: 'py-table__cell',
    sort: false
  },
  {
    dataField: "estimateDate",
    text: "Date",
    formatter: null,
    classes: 'py-table__cell',
    sort: true
  },
  {
    dataField: "estimateNumber",
    text: "Number",
    formatter: null,
    classes: 'py-table__cell',
    sort: false
  },
  {
    dataField: "customer.customerName",
    text: "Customer",
    formatter: null,
    classes: 'py-table__cell',
    sort: false
  },
  {
    dataField: "totalAmount",
    text: "Amount",
    formatter: null,
    classes: 'py-table__cell-amount',
    sort: false,
  },
  {
    dataField: "",
    text: "",
    formatter: null,
    sort: false
  }
]

export const columns = [
  {
    dataField: "status",
    text: "Status",
    formatter: statusRender,
    classes: 'py-table__cell',
    sort: false
  },
  {
    dataField: "date",
    text: "Date",
    formatter: dateRender,
    classes: 'py-table__cell',
    sort: true,
  },
  {
    dataField: "estimateNumber",
    text: "Number",
    formatter: numberRender,
    classes: 'py-table__cell',
    sort: false
  },
  {
    dataField: "customer.customerName",
    text: "Customer",
    formatter: customerRender,
    classes: 'py-table__cell',
    sort: false
  },
  {
    dataField: "totalAmount",
    text: "Amount",
    formatter: amountRender,
    classes: 'py-table__cell-amount',
    sort: false,
  },
  {
    dataField: "",
    text: "",
    formatter: actionRender,
    classes: 'py-table__cell__action',
    sort: false
  }
];

export const defaultSorted = [
  {
    dataField: "",
    order: ""
  }
];

export const FILTER_CONST = [
  {
    label: "Sent",
    value: "sent"
  },
  {
    label: "Saved",
    value: "saved"
  },
  {
    label: "Viewed",
    value: "viewed"
  },
  {
    label: "Expired",
    value: "expired"
  }
];
