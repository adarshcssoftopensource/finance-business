import React, { Component } from 'react'
import RenderTableRow from './RenderTableRow'
import { handleAclPermissions } from "../../../../../utils/GlobalFunctions"
class AddItemComponent extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    let {
      itemHeading,
      products,
      taxList,
      openProduct,
      itemsHtml,
      type,
      handleProductValue,
      handleProduct,
      handleDelete,
      items,
      currency,
      handleItemBlur,
      fetchtaxList,
      onSort,
      priceError,
      handleTaxChange,
      list,
      from,
      children
    } = this.props

    return (
      <div className="py-frame" key={`itrm-`}>
        <div className="py-table invoice-item-table py-table__v__center">
          <div className="invoice-item-table-header">
            <div className="py-table__cell all_scroll_effect"></div>
            <div className="py-table__cell item-cell py-text--strong">
              {itemHeading.hideItem ? (
                <img className="eye_logo" src="/assets/eye.png" />
              ) : (
                ''
              )}
              {itemHeading.column1.name}
            </div>
            <div className="py-table__cell detail-cell" />
            <div className="py-table__cell quantity-cell py-text--strong">
              {itemHeading.hideQuantity ? (
                <img className="eye_logo" src="/assets/eye.png" />
              ) : (
                ''
              )}
              {itemHeading.column2.name}
            </div>
            <div className="py-table__cell price-cell py-text--strong">
              {itemHeading.hidePrice ? (
                <img className="eye_logo" src="/assets/eye.png" />
              ) : (
                ''
              )}
              {itemHeading.column3.name}
            </div>
            <div className="py-table__cell amount-cell py-text--strong">
              {itemHeading.hideAmount ? (
                <img className="eye_logo" src="/assets/eye.png" />
              ) : (
                ''
              )}
              {/* <img className="eye_logo" src="/assets/eye.png" />{" "}<br /> */}
              {itemHeading.column4.name}
            </div>
            <div className="py-table__cell bin-cell py-text--strong">
              &nbsp;
            </div>
          </div>
          {/* {renderTableRow()} */}
          <RenderTableRow
            products={products}
            taxList={taxList}
            openProduct={openProduct}
            type={type}
            handleProductValue={handleProductValue}
            handleProduct={handleProduct}
            handleDelete={handleDelete}
            items={items}
            currency={currency}
            handleItemBlur={handleItemBlur}
            fetchtaxList={fetchtaxList}
            onSort={onSort}
            priceError={priceError}
            handleTaxChange={handleTaxChange}
            list={list}
            itemsHtml= {itemsHtml}
            from={from}
          >{children}</RenderTableRow>
        </div>
      </div>
    )
  }
}

export default AddItemComponent
