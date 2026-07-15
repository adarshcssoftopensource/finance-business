import React from 'react'
import { getAmountToDisplay } from '../../../../../../utils/GlobalFunctions'
import Icon from '../../../../../common/Icon'
import symbolsIcon from "../../../../../../assets/icons/product/symbols.svg";

const Reports = props => {
  const { peymeData, toggleReport, reportOpen, handleRefreshStatus, refreshReport } = props
  const report = peymeData ? peymeData.peyme.report : null

  return (
    <div>
      <div className="py-box py-box--large mb-0">
        <div className="invoice-steps-card__options">
          <div style={{ position: "relative" }} className="invoice-step-Collapsible__header-content">
            <div className="step-indicate">
              <div className="step-icon plane-icon">
                <Icon
                  className="Icon"
                  xlinkHref={`${symbolsIcon}#nav--reports`}
                />
              </div>
            </div>
            <div className="d-flex w-100" >
              <div className="py-heading--subtitle" >
                <span className="cursor-pointer" onClick={toggleReport}>Reports</span>
                <span role="button" class="refresh-action" onClick={handleRefreshStatus} >
                  <Icon
                    className={`Icon ${refreshReport && "fa-spin"}`}
                    xlinkHref={`${symbolsIcon}#refresh`}
                  />
                </span>
              </div>
              <div className="invoice-step-card__actions cursor-pointer" onClick={toggleReport}>
                <div className={`collapse-arrow ms-auto ${reportOpen && 'collapsed'}`}>
                  <i className="fas fa-chevron-up"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        {reportOpen &&
          <div className="invoice-steps-card__content mt-3 ms-4 me-2 ps-5">
            <div className="invoice-create-info">
              <div className="invoice-list-table tab-unpaid">
                <div className="invoice-insights__content">
                  <div className="invoice-insights__content-row">
                    <div className="invoice-insights-content__column">
                      <div className="py-text--block-label">View count</div>
                      <div className="py-text py-text--large">
                        <span className="invoice-insights-content__column-value">
                          {report ? report.viewCount : 0}
                        </span>
                      </div>
                    </div>
                    <div className="invoice-insights-content__column d-flex flex-column align-items-center">
                      <div className="py-text--block-label">Payments count</div>
                      <div className="py-text py-text--large">
                        <span className="invoice-insights-content__column-value">
                          {report ? report.paymentCount : 0}
                        </span>
                        <span className="invoice-insights-content__column-unit">
                        </span>
                      </div>
                    </div>
                    <div className="invoice-insights-content__column d-flex flex-column align-items-end">
                      <div className="py-text--block-label">Payments received</div>
                      <div className="py-text py-text--large">
                        <span className="invoice-insights-content__column-value">

                          {peymeData ? getAmountToDisplay(peymeData.peyme.business.currency, report.totalAmountReceived) : ""}
                        </span>
                        <span className="invoice-insights-content__column-unit">
                          <span className="py-text--small">{peymeData ? peymeData.peyme.business.currency.code : ""}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
      <div className="invoice-view__body__vertical-line mt-0"></div>
    </div>
  )
}

export default Reports
