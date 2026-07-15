import React from 'react'
import { Switch } from 'react-router-dom'
import { get } from 'lodash'
import { connect } from 'react-redux'
import MainRoute from '../../MainRoute'
import Reports from '.'
import CashFlowReport from './components/CashFlow'
import IncomeByCustomersReport from './components/IncomeByCustomers'
import PurchaseByVendorsReport from './components/PurchaseByVendors'
import AgedReceivablesReport from './components/AgedReceivables'
import AgedPayablesReport from './components/AgedPayables'

function ReportRoutes({
  url,
  isReportsEnabled,
  isCashFlowEnabled,
  isAgedPayablesEnabled,
  isCustomerIncomeEnabled,
  isVendorPurchasesEnabled,
  isAgedReceivablesEnabled,
}) {
  return (
    <Switch>
      {isReportsEnabled && (
        <MainRoute
          exact
          path={`${url}`}
          component={(routeProps) => (
            <Reports
              {...routeProps}
              isReportsEnabled={isReportsEnabled}
              isCashFlowEnabled={isCashFlowEnabled}
              isAgedPayablesEnabled={isAgedPayablesEnabled}
              isCustomerIncomeEnabled={isCustomerIncomeEnabled}
              isVendorPurchasesEnabled={isVendorPurchasesEnabled}
              isAgedReceivablesEnabled={isAgedReceivablesEnabled}
            />
          )}
        />
      )}
      {isCashFlowEnabled && (
        <MainRoute exact path={`${url}/cash-flow`} component={CashFlowReport} />
      )}
      {isCustomerIncomeEnabled && (
        <MainRoute
          exact
          path={`${url}/customers-income`}
          component={IncomeByCustomersReport}
        />
      )}
      {isVendorPurchasesEnabled && (
        <MainRoute
          exact
          path={`${url}/vendor-purchases`}
          component={PurchaseByVendorsReport}
        />
      )}
      {isAgedReceivablesEnabled && (
        <MainRoute
          exact
          path={`${url}/aged-receivables`}
          component={AgedReceivablesReport}
        />
      )}
      {isAgedPayablesEnabled && (
        <MainRoute
          exact
          path={`${url}/aged-payables`}
          component={AgedPayablesReport}
        />
      )}
    </Switch>
  )
};

const mapStateToProps = ({ settings: { featureFlags } = {} }) => {
  const isMinimumOneReportEnabled = Object.values(
    get(featureFlags, 'reports', {})
  ).includes('true')
  const isReportsEnabled = get(featureFlags, 'reports.enabled', 'true') === 'true' && isMinimumOneReportEnabled;
  const isCashFlowEnabled = get(featureFlags, 'reports.cashFlow', "true") === "true";
  const isAgedPayablesEnabled = get(featureFlags, 'reports.agedPayables', "true") === "true";
  const isAgedReceivablesEnabled = get(featureFlags, 'reports.agedReceivables', "true") === "true";
  const isCustomerIncomeEnabled = get(featureFlags, 'reports.customerIncome', "true") === "true";
  const isVendorPurchasesEnabled = get(featureFlags, 'reports.vendorPurchases', "true") === "true";

  return {
    isReportsEnabled,
    isCashFlowEnabled,
    isAgedPayablesEnabled,
    isCustomerIncomeEnabled,
    isVendorPurchasesEnabled,
    isAgedReceivablesEnabled
  }
}

export default connect(mapStateToProps, null)(ReportRoutes);
