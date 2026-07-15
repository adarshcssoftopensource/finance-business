import React, { Component, Fragment } from "react";
import { NavLink, withRouter } from "react-router-dom";
import { Helmet } from 'react-helmet'
import { connect } from "react-redux";
import { parse } from 'query-string';
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle, Button } from 'reactstrap';

import CashFlow from './CashFlow';
import NetIncome from './NetIncome';
import Overdue from './Overdue';
import PayableOwing from './PayableOwing';
import ProfitLoss from './ProfitLoss';
import ThingsToDo from './ThingsToDo';

import { _documentTitle } from '../../../../../utils/GlobalFunctions';
import { checkVerifiedEmail } from '../../../../../constants';
import invoiceIcon from '../../../../../assets/icons/gradient-icons/ic-invoice.svg'
import recurringInvoiceIcon from '../../../../../assets/icons/gradient-icons/ic-recurring-invoice.svg'
import checkoutIcon from '../../../../../assets/icons/gradient-icons/ic-checkouts.svg'
import peymeIcon from '../../../../../assets/icons/gradient-icons/ic-peyme.svg'
import paymentsIcon from '../../../../../assets/icons/gradient-icons/ic-payments.svg'
//import ExpenseBreakdown from './ExpenseBreakdown';

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dropdownOpen: false,
      limit: this.parseLimit(props),
    };
  }

  componentWillReceiveProps(props) {
    let limit = this.parseLimit(props);

    if (this.state.limit !== limit) {
      this.setState({ limit });
    }
  }

  componentDidMount() {
    const { businessInfo } = this.props;
    _documentTitle(businessInfo, 'Dashboard');
    checkVerifiedEmail()
  }

  parseLimit(props) {
    const { location: { search } } = props;
    const params = parse(search.substring(1));
    let limit = parseInt(params.limit || 'a');

    if (isNaN(limit)) {
      limit = undefined;
    }

    return limit;
  }

  toggleDropdown = () => {
    this.setState({ dropdownOpen: !this.state.dropdownOpen });
  };

  render() {
    const { limit } = this.state;
    return (
      <Fragment>
        <Helmet>
          <meta name="viewport" content="" />
        </Helmet>

        <div className="content-wrapper__main dashboard-wrapper">
          <header className="py-header--page d-flex flex-wrap">
            <div className="py-header--title">
              <h2 className="py-heading--title">Dashboard</h2>
            </div>
            <div className="py-header--actions d-flex flex-wrap">
              <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown}>
                <DropdownToggle caret className="custom-toggle" >Create a new</DropdownToggle>
                <DropdownMenu className="dropdown-menu-center">
                  <DropdownItem tag={NavLink} to="/app/estimates/add">Estimate</DropdownItem>
                  <DropdownItem tag={NavLink} to="/app/invoices/add">Invoice</DropdownItem>
                  <DropdownItem tag={NavLink} to="/app/recurring/add">Recurring Invoice</DropdownItem>
                  <DropdownItem tag={NavLink} to="/app/purchase/bills/add">Bill</DropdownItem>
                  <DropdownItem tag={NavLink} to="/app/sales/customer/add">Customer</DropdownItem>
                  <DropdownItem tag={NavLink} to="/app/purchase/vendors/add">Vendor</DropdownItem>
                  <DropdownItem tag={NavLink} to="/app/sales/products/add">Product or Service</DropdownItem>
                </DropdownMenu>
              </ButtonDropdown>
            </div>
          </header>
          <div className="dh-widget quick-link-widget">
            <div className="widget-box" style={{ boxShadow: "none" }} >
              <ul className="quick-link-list">
                <li>
                  <NavLink to="/app/invoices" className={`icon-link`}>
                    <span className='gradient-icon'>
                      <img
                        src={invoiceIcon}
                        alt="Invoice Icon"
                        className="icon"
                      />
                    </span>
                    <span className='text'>Invoices</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/app/recurring" className={`icon-link`}>
                    <span className='gradient-icon'>
                      <img
                        src={recurringInvoiceIcon}
                        alt="Invoice Icon"
                        className="icon"
                      />
                    </span>
                    <span className='text'>Recurring Invoices</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/app/sales/checkouts" className={`icon-link`}>
                    <span className='gradient-icon'>
                      <img
                        src={checkoutIcon}
                        alt="Invoice Icon"
                        className="icon"
                      />
                    </span>
                    <span className='text'>Checkouts</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/app/payyitme" className={`icon-link`}>
                    <span className='gradient-icon'>
                      <img
                        src={peymeIcon}
                        alt="Invoice Icon"
                        className="icon"
                      />
                    </span>
                    <span className='text'>Finance.Me Lynk</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/app/payments/?status=success" className={`icon-link`}>
                    <span className='gradient-icon'>
                      <img
                        src={paymentsIcon}
                        alt="Invoice Icon"
                        className="icon"
                      />
                    </span>
                    <span className='text'>Payments</span>
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
          <div className="content">
            <div className="dashboard-row two-cols">
              <Overdue limit={limit} />
              <ThingsToDo limit={limit} />
            </div>

            <div className="dashboard-row quarter-half">
              <CashFlow limit={limit} />
              <ProfitLoss limit={limit} />
            </div>

            <div className="dashboard-row quarter-half">
              <PayableOwing limit={limit} />
              <NetIncome limit={limit} />
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    businessInfo: state.businessReducer.selectedBusiness
  };
};

export default withRouter((connect(mapStateToProps, null)(Home)))