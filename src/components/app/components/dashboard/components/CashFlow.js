import { fetchCashFlow } from '../../../../../api/DashboardService';
import classNames from 'classnames';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getAmountToDisplay } from '../../../../../utils/GlobalFunctions';

function formatNumberWithSymbols() {
  var axis = this.axis,
    value = this.value,
    numericSymbols = ['k', 'M', 'G', 'T', 'P', 'E'],
    i = numericSymbols && numericSymbols.length,
    multi,
    ret = null,

    // make sure the same symbol is added for all labels on a linear axis
    numericSymbolDetector = axis.isLog ? value : axis.tickInterval;
  if (i && numericSymbolDetector >= 1000) {
    // Decide whether we should add a numeric symbol like k (thousands) or M (millions).
    // If we are to enable this in tooltip or other places as well, we can move this
    // logic to the numberFormatter and enable it by a parameter.
    while (i-- && ret === null) {
      multi = Math.pow(1000, i + 1);
      if (numericSymbolDetector >= multi && numericSymbols[i] !== null) {
        ret = Highcharts.numberFormat(value / multi, -1) + numericSymbols[i];
      }
    }
  }

  if (ret === null) {
    if (value >= 1000) { // add thousands separators
      ret = Highcharts.numberFormat(value, 0);

    } else { // small numbers
      ret = Highcharts.numberFormat(value, -1);
    }
  }

  return ret;
}


class CashFlow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      limit: 12,
      data: { values: [] },
    }
  }

  componentWillMount() {
    this.fetchCashFlow();
  }

  async fetchCashFlow() {
    const limit = this.props.limit !== undefined ? this.props.limit : this.state.limit;
    const pointWidth = limit === 24 ? 10 : 20;
    this.setState({ loading: true });
    const { statusCode, data } = await fetchCashFlow(limit);
    if (statusCode !== 200 || !Array.isArray(data?.values)) {
      this.setState({ loading: false });
      return;
    }

    const categories = data.values.map((row, idx) => idx % 2 !== 0 && limit == 24 ? '': row.displayName );
    const inFlow = data.values.map(row => row.inFlow);
    const outFlow = data.values.map(row => row.outFlow);
    const netChange = data.values.map(row => row.netChange);
    // this.setState({
    //   loading: false, data: {
    //     categories,
    //     currency: data.currency,
    //     data: [
    //       { name: 'Inflow', data: inFlow, type: 'column', pointWidth },
    //       { name: 'Outflow', data: outFlow, type: 'column', pointWidth },
    //       {
    //         name: 'Net Change', data: netChange, type: 'line', marker: {
    //           fillColor: "#FFFFFF",
    //           lineWidth: 2,
    //           lineColor: "#26384f"
    //         }
    //       },
    //     ],
    //   }
    // });
    this.setState({
  loading: false,
  data: {
    categories,
    currency: data.currency,
    data: [
      { 
        name: 'Inflow',
        data: inFlow,
        type: 'column',
        pointWidth,
        textColor:"#cccccc",
        backgroundColor:  "#8AA2B2" 
      },
      { 
        name: 'Outflow',
        data: outFlow,
        type: 'column',
        pointWidth,
        textColor: "#cccccc",
        backgroundColor: "#8AA2B2"
      },
      {
        name: 'Net Change',
        data: netChange,
        type: 'line',
        marker: {
          fillColor: "#FFFFFF",
          lineWidth: 2,
          lineColor: "#26384f"
        },
        textColor:"#cccccc",
        backgroundColor: "#8AA2B2"
      },
    ],
  }
});

  }

  changeLimit = (limit = 12) => {
    this.setState({ limit }, () => this.fetchCashFlow());
  };

  getOptions = () => {
    const { currency, data, categories } = this.state.data;
    return {
      credits: false,
      chart: {
        backgroundColor: "transparent",
        type: "column",
        zoomType: "x",
        spacingLeft: 0,
        spacingRight: 0,
        width: 580,
        height: 344
      },
      colors: ["#136ACD", "#8AA2B2", "#1c252c"],
      marginTop: 20,
      title: {
        text: "",
        margin: 65
      },
      xAxis: {
        categories,
        minRange: 1,
        tickLength: 0,
        labels: {
          formatter: function () {
            return this.value != -1 ? this.value : ""
          },
          rotation:  -45,
          autoRotation: false,
        }
      },
      yAxis: {
        title: {
          text: ""
        },
        labels: {
          formatter: function () {
            return currency.symbol + "" + formatNumberWithSymbols.call(this)
          }
        }
      },
      plotOptions: {
        series: {
          stacking: "normal"
        },
        line: {
          color: this.props.themeMode === "dark-mode" ? 'white' : 'black',
          states: {
            inactive: {
              opacity: 1
            }
          }
        },
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
          states: {
            hover: {
              brightness: 0.12,
            },
            inactive: {
              opacity: 1
            }
          }
        },
      },
      // legend: {
      //   align: "center",
      //   borderWidth: 0,
      //   margin: 30,
      //   x: -161,
      //   y: -10,
      //   verticalAlign: "top",
      //   itemStyle: {
      //     color: "#444"
      //   }
      // },
      legend: {
  useHTML: true,
  labelFormatter: function () {
    const { backgroundColor, textColor } = this.userOptions;

    return `
      <span style="
        background:${backgroundColor};
        color:${textColor};
        padding:4px 10px;
        border-radius:4px;
        display:inline-block;
      ">
        ${this.name}
      </span>
    `;
  },
  itemStyle: {
    color: null 
  }
},

      tooltip: {
        formatter: function () {
          return '<b>' + this.point.series.name + '</b>' +
            '<br><span>' + getAmountToDisplay(currency,this.y) + '</span>';
        },
      },
      series: data
    }
  };

  renderData() {
    return (
      <div className="HighchartsReact" >
        <HighchartsReact
          highcharts={Highcharts}
          options={this.getOptions()}
        />
      </div>
    )
  }

  renderSwitchOptions() {
    const { limit } = this.state;

    return (
      <div className="options-container">
        <span className={classNames({ option: true, active: limit === 12 })} onClick={() => this.changeLimit(12)}>
          Last 12 months
        </span>
        <span className={classNames({ option: true, active: limit === 24 })} onClick={() => this.changeLimit(24)}>
          Last 24 months
        </span>
      </div>
    )
  }

  render() {
    return (
      <div className="dh-widget cash-flow-widget">
        <h3 className="widget-title">Cash Flow</h3>
        <h6 className="widget-info">Cash coming in and going out of your business.</h6>
        <div className="widget-box" >
          {this.renderSwitchOptions()}
          {this.renderData()}
          {/*<NavLink to="#">View Report</NavLink>*/}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return { themeMode: state.themeReducer.themeMode }
}

export default connect(mapStateToProps, {})(CashFlow);