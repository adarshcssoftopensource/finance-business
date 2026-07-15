import React from 'react'
import Icon from '../../../../../common/Icon';
import symbolsIcon from "../../../../../../assets/icons/product/symbols.svg";
import { getAmountToDisplay } from "../../../../../../utils/GlobalFunctions";

const CrowdItems = props => {
  const { toggleItems, crowdFundingData, handleItemPopupOpen, handleEditCrowdFunding } = props
  const items = crowdFundingData?.funding?.items || [];
  const currency = crowdFundingData?.funding?.business?.currency;
  return (
    <div>
      <div class="py-box py-box--large">
        <div className="invoice-steps-card__options">
          <div style={{ position: "relative" }} className="invoice-step-Collapsible__header-content">
            <div className="step-indicate">
              <div className="step-icon plane-icon">
                <Icon
                  className="Icon"
                  xlinkHref={`${symbolsIcon}#timeline`}
                />
              </div>
            </div>
            <div className="d-flex w-100" >
              <div className="py-heading--subtitle">
                <span className="cursor-pointer" onClick={toggleItems} >Products & Services</span>
              </div>
              <div className="invoice-step-card__actions cursor-pointer" >
                <button className='btn btn-primary' onClick={() => handleItemPopupOpen('create')}>Create an item</button>
              </div>
            </div>
          </div>
        </div>
        <div class="invoice-steps-card__content mt-3 ms-4 me-2 ps-5">
          <div class="invoice-create-info">
            <table className='table table-hover'>
              <thead>
                <tr>
                  <th className='py-table__cell'>Item</th>
                  <th className='py-table__cell'>Description</th>
                  <th className='py-table__cell'>Price type</th>
                  <th className='py-table__cell'>Price</th>
                  <th className='py-table__cell text-end' >Active/Inactive</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {
                  (items || []).map((item, index) => {
                    return (
                      <tr>
                        <td className='py-table__cell'>{item?.title || ""}</td>
                        <td className='py-table__cell w-25'>{item?.description || ""}</td>
                        <td className='py-table__cell text-capitalize'>{item?.priceType || ""}</td>
                        <td className='py-table__cell'>{item?.priceType === 'dynamic' ? 'No fixed amount' : getAmountToDisplay(currency, item?.price)}</td>
                        <td className='py-table__cell text-end'>
                          <label class="py-switch m-0" for={`item_${index}`}>
                            <input
                              type="checkbox"
                              id={`item_${index}`}
                              name={`item_${index}`}
                              className="py-toggle__checkbox"
                              checked={item?.isActive}
                              onChange={(e) => {
                                handleEditCrowdFunding(item?._id, { fundingItemInput: { status: item?.isActive ? 'inactive' : 'active' } }, true);
                              }}
                            />
                            <span class="py-toggle__handle"></span>
                          </label>
                        </td>
                        <td>
                          <a href='#' type='button' className='py-table__action' onClick={() => handleItemPopupOpen('edit', item)}>
                            <Icon
                              className="Icon"
                              xlinkHref={`${symbolsIcon}#edit`}
                            />
                          </a>
                        </td>
                      </tr>
                    )
                  })
                }
                {
                  !items || !items?.length ?
                    <tr>
                      <td className='py-table__cell text-center' colSpan={6}>No items available!</td>
                    </tr>
                  : null
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="invoice-view__body__vertical-line"></div>
    </div>
  )
}

export default CrowdItems
