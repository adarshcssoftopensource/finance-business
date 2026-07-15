import history from "../../../../../customHistory";
import { upperFirst } from "lodash";
import React, { Fragment } from "react";
import RecurringDropDown from "./RecurringDropDown";
import { toMoney } from "../../../../../utils/GlobalFunctions";
import { getCommonFormatedDate } from "../../../../../utils/common";
import { _displayDate } from "../../../../../utils/globalMomentDateFunc";

export const statusRender = (cell, row, rowIndex, formatExtraData) => {
  if (row.status === "overdue") {
    return <span className="badge badge-danger">{"Overdue"}</span>;
  } else if (row.status === "saved") {
    return <span className="badge badge-secondary">{"Unsent"}</span>;
  } else if (row.status === "draft") {
    return <span className="badge badge-gray">{row.status}</span>;
  } else if (row.status === "paid") {
    return <span className="badge badge-success">{row.status}</span>;
  } else if (row.status === "partial") {
    return <span className="badge badge-primary">{row.status}</span>;
  } else if (row.status === "active") {
    return <span className="badge badge-info">{"Active"}</span>;
  }else if (row.status === "completed" || row.status === "end") {
    return <span className="badge badge-success">{row.status === "end" ? "Ended" : row.status}</span>;
  } else {
    return <span className="badge badge-gray">{row.status}</span>;
  }
};

export const dateRender = (cell, row, rowIndex, formatExtraData) => {
  return (
    <a onClick={() => history.push(`/app/recurring/view/${row._id}`)}>
      {row.status !== 'draft' ? getCommonFormatedDate(row.invoiceDate) : getCommonFormatedDate(row.recurrence.startDate ? row.recurrence.startDate: row.invoiceDate)}
    </a>
  );
};

export const numberRender = (cell, row, rowIndex, formatExtraData) => {
  return <a onClick={() => history.push(`/app/recurring/view/${row._id}`)}>{row.invoiceNumber}</a>;
};

export const customerRender = (cell, row, rowIndex, formatExtraData) => {
  return <a className="py-table__cell-content" onClick={() => history.push(`/app/recurring/view/${row._id}`)}>{!!row.customer ? row.customer.customerName : ''}</a>
};

export const totalRender = (cell, row, rowIndex, formatExtraData) => {
  return (
    <Fragment>
      <a onClick={() => history.push(`/app/recurring/view/${row._id}`)} className="mrR10">
        {`${row.currency.symbol}${toMoney(row.totalAmount ? row.totalAmount : 0)}`}
      </a>
    </Fragment>
  );
};

export const amountRender = (cell, row, rowIndex, formatExtraData) => {
  return (
    <div className="py-table__cell-content" >
      {`${row.currency.symbol}${toMoney(row.dueAmount ? row.dueAmount : 0)} ${row.exchangeRate ? row.currency.code : ""}`}
    </div>
  );
};

export const amountRenderRecurring = (cell, row, rowIndex, formatExtraData) => {
  return (
    <div className="py-table__cell-content" >
      {`${row.currency.symbol}${toMoney(row.totalAmount ? row.totalAmount : row.dueAmount ? row.dueAmount : 0)} ${row.exchangeRate ? row.currency.code : ""}`}
    </div>
  );
};

export const actionRender = (cell, row, rowIndex, formatExtraData) => {
  return (
    <div style={{verticalAlign: 'middle', alignItems: 'center'}}>
      <RecurringDropDown row={row} index={rowIndex} from="active" />
    </div>
  );
};

export const actionRenderDraft = (cell, row, rowIndex, formatExtraData) => {
  return (
    <div style={{verticalAlign: 'middle', alignItems: 'center'}}>
      <RecurringDropDown row={row} index={rowIndex} from="draft" />
    </div>
  );
};

export const createdRender = (cell, row, rowIndex, formatExtraData) => {
  return (
    <a onClick={() => history.push(`/app/recurring/view/${row._id}`)}>
      {_displayDate(row.createdAt)}
    </a>
  );
};

export const nextInvoiceRender = (cell, row, rowIndex, formatExtraData) => {
  return (
    <Fragment>
      <div className="py-table__cell-content" >{row.nextInvoiceDate ? _displayDate(row.nextInvoiceDate, "YYYY-MM-DD") : "–"}</div>
    </Fragment>
  );
};

export const previousInvoiceRender = (cell, row, rowIndex, formatExtraData) => {
  return (
    <Fragment>
      <div className="py-table__cell-content" >{row.previousInvoiceDate ? _displayDate(row.previousInvoiceDate, "YYYY-MM-DD") : "–"}</div>
    </Fragment>
  );
};

export const scheduleColRender = (cell, row, rowIndex, formatExtraData) => {
  return (row.recurrence.isSchedule ?
    <Fragment>
      <a onClick={() => history.push(`/app/recurring/view/${row._id}`)} className="py-table__cell-content">
        {showRepeatOn(row.recurrence)}
      </a>
      <span className="py-text--hint" style={{display: 'inherit'}}>
        {showCreateDate(row.recurrence)}
      </span>
    </Fragment>
    : "–"
  );
};

const showRepeatOn = data => {
  switch (data.unit) {
    case 'daily':
      return 'Repeat Daily'
    case 'weekly':
      return !!data.dayOfWeek ? `Repeat ${data.dayOfWeek}` : '-'
    case 'monthly':
      return `${!!data.dayofMonth ? `Repeat monthly on the ${data.dayofMonth}` : '-'}`
    case 'yearly':
      return (!!data.monthOfYear && !!data.dayofMonth) ? `Repeat yearly on  ${data.monthOfYear} ${data.dayofMonth}` : '-'
    case 'custom':
      return `Every ${data.interval} ${data.subUnit} ${!!data.monthOfYear ? `in ${data.monthOfYear}` : ""} ${!!data.dayofMonth ? `on the ${data.dayofMonth}  day of the month` : ""}`
  }
}

const showCreateDate = data => {
  switch (data.type) {
    case 'after': return `First invoice: ${_displayDate(data.startDate, "YYYY-MM-DD")}, Ends: ${data.maxInvoices} invoices`
    case 'on': return `First invoice: ${_displayDate(data.startDate, "YYYY-MM-DD")}, Ends: ${_displayDate(data.endDate, "YYYY-MM-DD")}`
    case 'never': return `First invoice: ${_displayDate(data.startDate, "YYYY-MM-DD")}, Ends: ${upperFirst(data.type)}`
  }
}