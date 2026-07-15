import React, { Component } from 'react'
import { Link } from 'react-router-dom'

export default class Reports extends Component {
  render() {
    const {
      isReportsEnabled,
      isCashFlowEnabled,
      isAgedPayablesEnabled,
      isCustomerIncomeEnabled,
      isVendorPurchasesEnabled,
      isAgedReceivablesEnabled,
    } = this.props

    return (
      <div className="reports-page-wrapper">
        <div className="content-wrapper__main__fixed">
          <header className="py-header--page d-flex flex-wrap">
            <div className="py-header--title">
              <h2 className="py-heading--title">Reports</h2>
            </div>
          </header>
          {isReportsEnabled && (
            <div className="content">
              <div className="reports__body">
                <div className="py-box">
                  <div className="py-box__content">
                    {isCashFlowEnabled && (
                      <Link
                        to="/app/reports/cash-flow"
                        className="reports__body-item"
                      >
                        <h4 className="py-heading--subtitle">
                          Cash flow <i className="far fa-angle-right"></i>
                        </h4>
                        <p className="py-text">
                          Shows how much money is entering and leaving your
                          business. The cash flow statement tells you how much
                          cash you have on hand for a specific time period.
                        </p>
                      </Link>
                    )}
                    {isCustomerIncomeEnabled && (
                      <Link
                        to="/app/reports/customers-income"
                        className="reports__body-item"
                      >
                        <h4 className="py-heading--subtitle">
                          Income by Customers{' '}
                          <i className="far fa-angle-right"></i>
                        </h4>
                        <p className="py-text">
                          A breakdown of income by customers.
                        </p>
                      </Link>
                    )}
                    {isAgedReceivablesEnabled && (
                      <Link
                        to="/app/reports/aged-receivables"
                        className="reports__body-item"
                      >
                        <h4 className="py-heading--subtitle">
                          Aged Receivables{' '}
                          <i className="far fa-angle-right"></i>
                        </h4>
                        <p className="py-text">
                          Unpaid and overdue invoices for the last 30, 60, and
                          90+ days.
                        </p>
                      </Link>
                    )}
                    {isVendorPurchasesEnabled && (
                      <Link
                        to="/app/reports/vendor-purchases"
                        className="reports__body-item"
                      >
                        <h4 className="py-heading--subtitle">
                          Purchase by Vendor{' '}
                          <i className="far fa-angle-right"></i>
                        </h4>
                        <p className="py-text">
                          A breakdown of purchases and bills from every vendor.
                        </p>
                      </Link>
                    )}
                    {isAgedPayablesEnabled && (
                      <Link
                        to="/app/reports/aged-payables"
                        className="reports__body-item"
                      >
                        <h4 className="py-heading--subtitle">
                          Aged Payables <i className="far fa-angle-right"></i>
                        </h4>
                        <p className="py-text">
                          Unpaid and overdue bills for the last 30, 60, and 90+
                          days.
                        </p>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
}
