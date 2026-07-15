import React, { Fragment } from "react"
import history from "../../../../../../customHistory";
import { toMoney } from "../../../../../../utils/GlobalFunctions";
import ProductActions from "./ProductActions";
import { getAmountToDisplay } from "../../../../../../utils/GlobalFunctions";

const showSellAndBuyTag = (item) => {
    const isPurchase = window.location.pathname.includes('purchase');
    const text = isPurchase ? 'Buy & Sell' : 'Sell & Buy';
    if (item.sell.allowed && item.buy.allowed) {
      return <span className="badge badge-default">{text}</span>;
    }
    return null;
};

export const nameRender = (cell, row, rowIndex, formatExtraData) => {
    if(!!row){
        return (
            <Fragment>
                <a class="py-table__cell-content" >
                    {row.name} {showSellAndBuyTag(row)}
                </a>
                {row.description && (<span className="py-text--hint">{row.description}</span>)}
            </Fragment>
        )
    }
};

export const priceRender = (cell, row, rowIndex, formatExtraData) => {
    const selectedBusiness = JSON.parse(JSON.parse(localStorage.getItem('reduxPersist:root')).businessReducer).selectedBusiness
    if(!!row){
        return (
            <Fragment>
                <a class="py-table__cell-content">
                {/* {currency} */}
                {getAmountToDisplay(selectedBusiness.currency, row.price)}
                </a>
                {row.taxes && row.taxes.length ?
                <span className="py-text--hint">
                {row.taxes.map((tax, i) => {
                    if (i === 0) {
                    return "+" + tax.abbreviation
                    } else {
                    return ', ' + tax.abbreviation
                    }
                })}
                </span>
                : null}
            </Fragment>
        )
    }
};

export const actionRender = (cell, row, rowIndex, formatExtraData) => {
    if(!!row){
        return (
            <Fragment>
                <ProductActions row={row}/>
            </Fragment>
        )
    }
}
