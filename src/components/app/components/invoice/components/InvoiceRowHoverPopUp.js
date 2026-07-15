import React, { Fragment } from "react";
import { getAmountToDisplay } from "../../../../../utils/GlobalFunctions";
import { _displayDate } from "../../../../../utils/globalMomentDateFunc";

const InvoiceRowHoverPopUp = props => {
        return (
        <Fragment>
            <div className="popover_wrapper">
            <div className="py-table__cell-content">{props.children}</div>
                <div className="tooltip" id={props.row._id}>
                    <ul>
                        <li>
                            <h6>Due</h6>
                            <span> {_displayDate(props.row.dueDate)}</span>
                        </li>
                        <li>
                            <h6>Last Sent</h6>
                            <span>{props.row.lastSent ? _displayDate(props.row.lastSent) : "Never"}</span>
                        </li>
                        <li>
                            <h6>Last Viewed</h6>
                            <span>{props.row?.report?.lastViewedOn ? _displayDate(props.row.report.lastViewedOn) : "Never"}</span>
                        </li>
                        <li>
                            <h6>Total</h6>
                            <span>{ getAmountToDisplay((!!props.row.currency && !!props.row.currency.symbol ? props.row.currency : {symbol: "$"}), props.row.totalAmount)}</span>
                        </li>
                    </ul>
                    <div className="customer_details">
                        <div className="customer_container">
                            <div className="col-left">
                              <p><strong>Customer:</strong></p>
                            </div>
                            <div className="col-right">
                            <p>{!!props.row.customer && props.row.customer.customerName}</p>
                            </div>
                        </div>
                        {!!props.row.customer && props.row.customer.firstName && (<div className="customer_container">
                            <div className="col-left">
                              <p><strong></strong></p>
                            </div>
                            <div className="col-right">
                            <p>{!!props.row.customer && props.row.customer.firstName} {!!props.row.customer && props.row.customer.lastName}</p>
                            </div>
                        </div>)}
                        {!!props.row.customer && props.row.customer.email && (<div className="customer_container">
                            <div className="col-left">
                              <p><strong></strong></p>
                            </div>
                            <div className="col-right">
                            <p>{!!props.row.customer && props.row.customer.email} </p>
                            </div>
                        </div>)}
                        {!!props.row.customer && props.row.customer.phone && (<div className="customer_container">
                            <div className="col-left">
                              <p><strong></strong></p>
                            </div>
                            <div className="col-right">
                            <p>{props.row.customer.phone} </p>
                            </div>
                        </div>)}
                        {
                            props.row.createdFrom && (
                                <div className="customer_container">
                                    <div className="col-left">
                                    <p><strong>Created From:</strong></p>
                                    </div>
                                    <div className="col-right">
                                    <p>{props.row.createdFrom ? props.row.createdFrom : "--"} </p>
                                    </div>
                                </div>
                            )
                        }
                        <div className="customer_container">
                            <div className="col-left">
                              <p><strong>Notes:</strong></p>
                            </div>
                            <div className="col-right">
                            <p dangerouslySetInnerHTML={{ __html: props.row.notes ? props.row.notes : " -- " }} ></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
        )
}

export default InvoiceRowHoverPopUp;