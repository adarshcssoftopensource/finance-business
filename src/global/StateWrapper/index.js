import React, { Component } from 'react'
import { connect } from 'react-redux';
import SelectBox from '../../utils/formWrapper/SelectBox';

class StateWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedValue: null
    };
  }

  componentDidMount() {
    this.getSelectedValue();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selectedState !== this.props.selectedState || 
        prevProps.options !== this.props.options ||
        prevProps.selectedCountryStates !== this.props.selectedCountryStates) {
      this.getSelectedValue();
    }
  }

  handleChange = (item) => {
    let value = '';
    if (item && item.id) {
      value = item.id;
    }
    this.props.handleText({ target: { name: 'state', value } });
  };

  getSelectedValue = () => {
    const { selectedState, options, selectedCountryStates } = this.props;
    let selectedValue = null;

    if (selectedState) {
      if (typeof selectedState === 'string' || typeof selectedState === 'number') {
        const allOptions = options || selectedCountryStates || [];
        selectedValue = allOptions.find(option => option.id === selectedState);
      } else {
        selectedValue = selectedState.name === "" ? null : selectedState;
      }
    }

    this.setState({ selectedValue });
  };

  render() {
    return (
      <SelectBox
        placeholder="Select a province/state"
        getOptionLabel={(value)=>(value["name"])}
        getOptionValue={(value)=>(value["id"])}
        className="h-100 select-40"
        disabled={this.props.disabled}
        ar={this.props.required}
        value={this.state.selectedValue}
        onChange={this.handleChange}
        options={this.props.options || this.props.selectedCountryStates}
        isClearable={false}
        addBlank={this.props.addBlank}
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    selectedCountryStatesForShipping: state.customerReducer.selectedCountryStatesForShipping,
    selectedCountryStates: state.customerReducer.selectedCountryStates
  }
};


export default connect(mapStateToProps)(StateWrapper)
