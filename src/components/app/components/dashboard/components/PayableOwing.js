import React, { Component, Fragment } from 'react';
import { fetchOwingBills, fetchPayableInvoices } from '../../../../../api/DashboardService';
import { getAmountToDisplay } from '../../../../../utils/GlobalFunctions';

function Amount({ currency = {}, amount }) {
  return (
    <Fragment>
     {getAmountToDisplay(currency,amount)}
    </Fragment>
  );
}

class PayableOwing extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      payables: [],
      owings: [],
    }
  }

  componentWillMount() {
    this.fetchPayables();
    this.fetchOwings();
  }

  async fetchPayables() {
    this.setState({ loading: true });
    try {
      const response = await fetchPayableInvoices(this.props.limit);
      if (response?.statusCode !== 200) {
        this.setState({ loading: false, payables: [] });
        return;
      }
      const raw = response?.data;
      const payables = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
      this.setState({ loading: false, payables });
    } catch (e) {
      this.setState({ loading: false, payables: [] });
    }
  }

  async fetchOwings() {
    this.setState({ loading: true });
    try {
      const response = await fetchOwingBills(this.props.limit);
      if (response?.statusCode !== 200) {
        this.setState({ loading: false, owings: [] });
        return;
      }
      const raw = response?.data;
      const owings = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
      this.setState({ loading: false, owings });
    } catch (e) {
      this.setState({ loading: false, owings: [] });
    }
  }

  renderPayable() {
    const { payables } = this.state;

    return (
      <table className="widget-table" >
        <thead>
        <tr>
          <th colSpan={2}>Invoices payable to you</th>
        </tr>
        </thead>
        <tbody>
        {payables.map((row, i) => (
          <tr key={row.displayName}>
            <td>{row.displayName}</td>
            <td><Amount currency={row.currency} amount={row.amount} /></td>
          </tr>
        ))}
        </tbody>
      </table>
    )
  }

  renderOwings() {
    const { owings } = this.state;

    return (
      <table className="widget-table" >
        <thead>
        <tr>
          <th colSpan={2}>Bills you owe</th>
        </tr>
        </thead>
        <tbody>
        {owings.map((row, i) => (
          <tr key={row.displayName}>
            <td>{row.displayName}</td>
            <td><Amount currency={row.currency} amount={row.amount} /></td>
          </tr>
        ))}
        </tbody>
      </table>
    )
  }

  render() {
    const payables = this.state.payables || [];
    const owings = this.state.owings || [];
    if (!payables.length && !owings.length) {
      return null;
    }
    return (
      <div className="dh-widget payable-owing-widget">
        <h3 className="widget-title">Payable &amp; Owing</h3>
        <div className="widget-box">
          {this.renderPayable()}
          {this.renderOwings()}
        </div>
      </div>
    );
  }
}

export default PayableOwing;
