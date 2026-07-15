import React, { useEffect, useState } from 'react'
import Icon from '../../../../../common/Icon'
import Payment from '../../../payments'
import symbolsIcon from "../../../../../../assets/icons/product/symbols.svg";
const Payments = props => {
  const { peymeData, togglePayment, paymentsOpen, handleRefreshPayment, refreshPayment } = props
  const [refreshClass, setRefreshClass] = useState("Icon")
  useEffect(() => {
    setRefreshClass("Icon fa-spin")
    setTimeout(() => {
      setRefreshClass("Icon")
    }, 2000);
  }, [refreshPayment])
  return (
    <div>
      <div className="py-box py-box--large">
        <div className="invoice-steps-card__options">
          <div style={{position:"relative"}} className="invoice-step-Collapsible__header-content">
            <div className="step-indicate">
              <div className="step-icon plane-icon">
                <Icon
                  className="Icon"
                  xlinkHref={`${symbolsIcon}#timeline`}
                />
              </div>
            </div>
            <div className="d-flex  w-100" >
              <div className="py-heading--subtitle">
                <span className="cursor-pointer" onClick={togglePayment} >
                  Payments
                </span>
                <span onClick={handleRefreshPayment} className="refresh-action">
                  <Icon
                    className={refreshClass}
                    xlinkHref={`${symbolsIcon}#refresh`}
                  />
                </span>
              </div>
              <div className="invoice-step-card__actions cursor-pointer" onClick={togglePayment} >
                <div className={`collapse-arrow ms-auto ${paymentsOpen && 'collapsed'}`}>
                  <i className="fas fa-chevron-up"/>
                </div>
              </div>
            </div>
          </div>
        </div>
        {paymentsOpen &&
        <div className="invoice-steps-card__content mt-3">
          <div className="invoice-create-info">
            <div className="invoice-list-table tab-unpaid">
              {
                peymeData ? 
                <Payment
                  isPeyme
                  peymeName={peymeData ? peymeData.peyme._id : ''}
                  refreshPayment={refreshPayment}
                /> : ""
              }
            </div>
          </div>
        </div>
        }
      </div>
    </div>
  )
}

export default Payments
