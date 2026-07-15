import React, { Component, Fragment } from 'react';
import { Tooltip } from 'reactstrap';
import { fetchNetIncome } from '../../../../../api/DashboardService';
import { getAmountToDisplay } from '../../../../../utils/GlobalFunctions';

function HelpIcon({ id }) {
  return (
    <svg
      className="Icon"
      id={id}
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10 19a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-2a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm0-4a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM8.543 7.936a1 1 0 1 1-1.886-.664 3.4 3.4 0 0 1 6.607 1.132c0 1.105-.646 1.965-1.645 2.632a6.249 6.249 0 0 1-1.439.716 1 1 0 1 1-.632-1.897 4.594 4.594 0 0 0 .962-.483c.5-.334.754-.673.754-.97a1.4 1.4 0 0 0-2.72-.466z" />
    </svg>
  );
}

class NetIncome extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      data: { headings: [], values: [], tip: '' },
      tooltipOpen: {} // manage tooltip state per id
    };
  }

  componentDidMount() {
    this.fetchNetIncome();
  }

  async fetchNetIncome() {
    this.setState({ loading: true });
    try {
      const { statusCode, data } = await fetchNetIncome(this.props.limit);
      if (statusCode !== 200) return;
      const next = {
        headings: Array.isArray(data?.headings) ? data.headings : [],
        values: Array.isArray(data?.values) ? data.values : [],
        tip: data?.tip || '',
      };
      this.setState({ data: next });
    } catch (error) {
      console.error('Error fetching net income:', error);
    } finally {
      this.setState({ loading: false });
    }
  }

  toggleTooltip = (id) => {
    this.setState((prev) => ({
      tooltipOpen: {
        ...prev.tooltipOpen,
        [id]: !prev.tooltipOpen[id]
      }
    }));
  };

  renderData() {
    const { data } = this.state;

    return (
      <table className="widget-table">
        <thead>
          <tr>
            {data.headings.map((head, i) => {
              const tooltipId = `help-${i}`;
              return (
                <th key={head}>
                  {head}{' '}
                  {i === 0 && (
                    <Fragment>
                      <HelpIcon id={tooltipId} />
                      <Tooltip
                        placement="top"
                        isOpen={this.state.tooltipOpen[tooltipId]}
                        target={tooltipId}
                        toggle={() => this.toggleTooltip(tooltipId)}
                      >
                        {data.tip}
                      </Tooltip>
                    </Fragment>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.values.map((row) => (
            <tr key={row.displayName}>
              <td>{row.displayName}</td>
              <td>{getAmountToDisplay(row.currency, row.column1)}</td>
              <td>{getAmountToDisplay(row.currency, row.column2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  render() {
    const { loading } = this.state;
    return (
      <div className="dh-widget net-income-widget">
        <h3 className="widget-title">Net Income</h3>
        <div className="widget-box">
          {loading ? <p>Loading...</p> : this.renderData()}
        </div>
      </div>
    );
  }
}

export default NetIncome;
