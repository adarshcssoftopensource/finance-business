import React, { Fragment, useEffect, useState } from "react"
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { _paymentMethodIcons } from "../../../../../../../utils/GlobalFunctions";
import { _getUser } from "../../../../../../../utils/authFunctions";
import CustomerAction from "./CustomerAction";
import { useDispatch } from "react-redux";
import { blockCustomer, unblockCustomer } from "../../../../../../../actions/CustomerActions";

export const nameRender = (cell, row, rowIndex, formatExtraData) => {
    if (!!row) {
        return (
            <Fragment>
                <span>
                    <a className="py-table__cell-content">{row.customerName}</a>
                    <span className="py-text--hint">{row.firstName} {' '} {row.lastName} </span>
                </span>
            </Fragment>
        )
    }
};

export const emailRender = (cell, row, rowIndex, formatExtraData) => {
    if (!!row) {
        return (
            <Fragment>
                <a className="el-text" >{row.email}</a>
            </Fragment>
        )
    }
};

export const blockStatusRender = (cell, row) => {
    if (!row) return <span>—</span>;

    const BlockButton = () => {
        const dispatch = useDispatch();
        const [loading, setLoading] = useState(false);
        const [blocked, setBlocked] = useState(!!row.isBlocked);

        const handleToggle = async () => {
            setLoading(true);
            try {
                if (blocked) {
                    await dispatch(unblockCustomer(row._id));
                } else {
                    await dispatch(blockCustomer(row._id));
                }
                setBlocked(!blocked);
            } catch (error) {
                console.error("Block/Unblock failed", error);
            } finally {
                setLoading(false);
            }
        };

        return (
            <button
                className={`btn btn-sm py-2 text-xs ${blocked ? 'btn-warning' : 'btn-danger'}`}
                onClick={handleToggle}
                disabled={loading}
            >
                {loading ? '...' : blocked ? 'Unblock' : 'Block'}
            </button>
        );
    };

    return <BlockButton />;
};

export const phoneRender = (cell, row, rowIndex, formatExtraData) => {
    if (!!row) {
        return (
            <Fragment>
                <a className="el-text" >{!!row.communication ? row.communication.phone : '--'}</a>
            </Fragment>
        )
    }
};

export const paymntRender = (cell, row, rowIndex, formatExtraData) => {
    if (!!row) {
        return (
            <Fragment>
                {row.cards && row.cards.length > 0 && row.cards.slice(0, 3).map((method, i) => {
                    return (
                        <OverlayTrigger
                            key={i}
                            placement="top"
                            overlay={
                                <Tooltip id={`tooltip-card`}>
                                    Ending in {method.cardNumber}
                                </Tooltip>
                            }
                        >
                            <img
                                src={process.env.REACT_APP_WEB_URL.includes('localhost') ? `${_paymentMethodIcons(method.brand)}` : _paymentMethodIcons(method.brand)}
                                style={{ width: '40px', paddingRight: '5px' }} />
                        </OverlayTrigger>
                    )
                })}
            </Fragment>
        )
    }
};

export const actionRender = (cell, row, rowIndex, formatExtraData) => {
    if (!!row) {
        return (
            <CustomerAction row={row} />
        )
    }
};