import React, { Component, Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { fetchOverdueBills, fetchOverdueInvoices } from '../../../../../api/DashboardService';
import { getAmountToDisplay } from '../../../../../utils/GlobalFunctions';

function Amount({ currency = {}, amount }) {
  return (
    <Fragment>
      <span className="amount" >{getAmountToDisplay(currency, amount)}</span>
    </Fragment>
  );
}

class Overdue extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      bills: [],
      invoices: [],
    }
  }

  componentWillMount() {
    this.fetchBills();
    this.fetchInvoices();
  }


  async fetchBills() {
    this.setState({ loading: true });
    try {
      const { statusCode, data } = await fetchOverdueBills(this.props.limit);
      if (statusCode !== 200) {
        this.setState({ loading: false, bills: [] });
        return;
      }
      const bills = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      this.setState({ loading: false, bills });
    } catch (e) {
      this.setState({ loading: false, bills: [] });
    }
  }

  async fetchInvoices() {
    this.setState({ loading: true });
    try {
      const { statusCode, data } = await fetchOverdueInvoices(this.props.limit);
      if (statusCode !== 200) {
        this.setState({ loading: false, invoices: [] });
        return;
      }
      const invoices = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      this.setState({ loading: false, invoices });
    } catch (e) {
      this.setState({ loading: false, invoices: [] });
    }
  }

  renderBills() {
    const { bills } = this.state;
    if (!bills.length) {
      return null;
    }
    return (
      <div className="widget-content">
        <h5 className="widget-sub-title">Overdue Bills</h5>
        <ul className="widget-list">
          {bills.map((bill) => (
            <li key={`dashboard-overdue-invoice-${bill._id}`}><NavLink className="b_name" to={`/app/purchase/bills/${bill.idToOpen}`}>{bill.displayName}</NavLink> <Amount
              currency={bill.currency} amount={bill.amount} /></li>
          ))}
        </ul>
        <div className="widget-footer-link">
          <NavLink to="/app/purchase/bills">See all bills</NavLink>
        </div>
      </div>
    )
  }

  renderInvoices() {
    const { invoices } = this.state;
    if (!invoices.length) {
      return null;
    }
    return (
      <div className="widget-content">
        <h5 className="widget-sub-title">Overdue Invoices</h5>
        <ul className="widget-list">
          {invoices.map((invoice) => (
            <li key={`dashboard-overdue-invoice-${invoice._id}`}><NavLink className="b_name" to={`/app/invoices/view/${invoice.idToOpen}`}>{invoice.displayName}</NavLink> <Amount
              currency={invoice.currency} amount={invoice.amount} /></li>
          ))}
        </ul>
        <div className="widget-footer-link">
          <NavLink to="/app/invoices?filter_overdue=1">See all overdue invoices</NavLink>
        </div>
      </div>
    )
  }


  render() {
    const { invoices, bills } = this.state;
    if (!(invoices.length + bills.length)) {
      return null;
    }

    return (
      <div className="dh-widget widget-overdue">
        <h3 className="widget-title">Overdue Invoices &amp; Bills</h3>
        <div className="widget-box">
          {this.renderInvoices()}
          {invoices.length > 0 && bills.length > 0 && <hr />}
          {this.renderBills()}
        </div>
      </div>
    );
  }
}

export default Overdue;
