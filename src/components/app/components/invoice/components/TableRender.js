import history from "../../../../../customHistory";
import React, { Fragment } from "react";
import InvoiceDropdown from "./InvoiceDropDown";
import InvoiceRowHoverPopUp from "./InvoiceRowHoverPopUp"
import { getAmountToDisplay, _showExchangeRate, customTimeAgo } from "../../../../../utils/GlobalFunctions";
import { _displayDate } from "../../../../../utils/globalMomentDateFunc";

export const statusRender = (cell, row, rowIndex, formatExtraData) => {
  if (!!row) {
    if (row.status === "overdue") {
      return <span className="badge badge-danger">{"Overdue"}</span>;
    } else if (row.status === "saved") {
      return <span className="badge badge-default">{"Unsent"}</span>;
    } else if (row.status === "draft") {
      return <span className="badge badge-gray">{row.status}</span>;
    } else if (row.status === "paid") {
      return <span className="badge badge-success">{row.status}</span>;
    } else if (row.status === "partial") {
      return <span className="badge badge-alert">{row.status}</span>;
    } else if (row.status === "sent") {
      return <span className="badge badge-info">{"Sent"}</span>;
    } else if (row.status === 'viewed') {
      return <span className="badge badge-warning">{row.status}</span>;
    } else {
      return <span className="badge badge-default">{row.status}</span>;
    }
  }
};

export const dateRender = (cell, row, rowIndex, formatExtraData) => {
  if (!!row) {
    return (
      //  <InvoiceRowHoverPopUp row={row}>
      <div className="py-table__cell-content popover_wrapper" onClick={() => history.push(`/app/invoices/view/${row._id}`)} id={`date-${row._id}`} onMouseEnter={e => showTooltip(e, row._id, true)} onMouseLeave={e => showTooltip(e, row._id, false)}>
        {_displayDate(row.invoiceDate)}
      </div>
      //  </InvoiceRowHoverPopUp>
    );
  }
};


export const dueDateRender = (cell, row, rowIndex, formatExtraData) => {

  if (!!row) {
    let color = '';
    if (row.status === 'overdue') {
      color = '#c22929'
    }
    return (
      // <InvoiceRowHoverPopUp row={row}>
      <div className="py-table__cell-content" onClick={() => history.push(`/app/invoices/view/${row._id}`)} id={`date-${row._id}`} className="" style={{ color: color }} onMouseEnter={e => showTooltip(e, row._id, true)} onMouseLeave={e => showTooltip(e, row._id, false)}>
       <Fragment>{customTimeAgo(row.dueDate,'2')} </Fragment> 
      </div>
      // </InvoiceRowHoverPopUp>
    );
  }
};

export const numberRender = (cell, row, rowIndex, formatExtraData) => {
  if (!!row) {
    return (
      <InvoiceRowHoverPopUp row={row}>
        <span onClick={() => history.push(`/app/invoices/view/${row._id}`)}>{row.invoiceNumber}</span>
        {row.isRecurring ? <span className="color-muted" data-toggle="tooltip" title="This is a recurring invoice"
          style={{ display: 'block', lineHeight: '1' }}
        ><small>Recurring</small></span> : ""}
      </InvoiceRowHoverPopUp>
    )
  }
};

export const customerRender = (cell, row, rowIndex, formatExtraData) => {
  if (!!row) {
    return (
      // <InvoiceRowHoverPopUp row={row}>
      <div className="py-table__cell-content" onClick={() => history.push(`/app/invoices/view/${row._id}`)} onMouseEnter={e => showTooltip(e, row._id, true)} onMouseLeave={e => showTooltip(e, row._id, false)}>{row.customer && row.customer.customerName}</div>
      // </InvoiceRowHoverPopUp>
    );
  }
};

export const totalRender = (cell, row, rowIndex, formatExtraData) => {
  if (!!row) {
    return (
      // <InvoiceRowHoverPopUp row={row}>
      <span onClick={() => history.push(`/app/invoices/view/${row._id}`)} onMouseEnter={e => showTooltip(e, row._id, true)} onMouseLeave={e => showTooltip(e, row._id, false)}>
        {row ? getAmountToDisplay(row.currency, row.totalAmount ? row.totalAmount : 0) : ''}
      </span>
      // </InvoiceRowHoverPopUp>
    );
  }
};

export const amountRender = (cell, row, rowIndex, formatExtraData) => {
  if (!!row) {
    let buisinessInfo = JSON.parse(JSON.parse(localStorage.getItem('reduxPersist:root')).businessReducer).selectedBusiness
    return (
      // <InvoiceRowHoverPopUp row={row}>
      <div onClick={() => history.push(`/app/invoices/view/${row._id}`)} className={row.totalAmountInHomeCurrency > 0 ? "text-right invoice-amount-cell amount-cell" : "text-right invoice-amount-cell"} onMouseEnter={e => showTooltip(e, row._id, true)} onMouseLeave={e => showTooltip(e, row._id, false)}>
        <span className="ov-text" >
          { row ? getAmountToDisplay(row.currency, row.dueAmount) : '' }
        </span>
        {/* {_showExchangeRate(row.currency, buisinessInfo.currency) } 
              //   ? `${getAmountToDisplay(buisinessInfo.currency, row.totalAmountInHomeCurrency)} ${buisinessInfo.currency.code}`
          // : ""}*/}
          <small className="py-text--hint">{_showExchangeRate(buisinessInfo.currency, row.currency) ? `${getAmountToDisplay(buisinessInfo.currency, row.dueAmountInHomeCurrency ? row.dueAmountInHomeCurrency : row.dueAmount * row.exchangeRate)} ${buisinessInfo.currency.code}` : ''}</small>
      </div>
      // </InvoiceRowHoverPopUp>
    );
  }
};

export const actionRender = (cell, row, rowIndex, formatExtraData) => {
  if (!!row) {
    return (
      <Fragment>
        <InvoiceDropdown row={row} index={rowIndex} />
      </Fragment>
    );
  }
};

const showTooltip = (e, id, show) => {
  const elem = document.getElementById(id);
  if (!!elem) {
    elem.style.display = !!show ? 'block' : 'block'
  }
}