import React, { Component } from 'react'
import SelectBox from "../../utils/formWrapper/SelectBox";
import { fetchCountries } from '../../api/globalServices';

export default class CountryWrapper extends Component {
  state = {
    countries: []
  };

  componentDidMount() {
    this.fetchFormData()
  }

  fetchFormData = async () => {
    const countries = (await fetchCountries()).countries;
    this.setState({ countries, shippingCountries: countries })
  };

  handleChange = (item) => {
    let value = '';
    if (item && item.id) {
      value = item.id;
    }
    this.props.handleText({ target: { name: 'country', value } });
  };

  render() {
    const selectedCountryObj = this.state.countries.find(c => c.id === this.props.selectedCountry) || null;
    return (
      <SelectBox
        placeholder="Select a country"
        getOptionValue={(value)=>(value?.["id"])}
        getOptionLabel={(value)=>(value?.["name"])}
        className="h-100 select-40"
        isDisabled={this.props.disabled}
        value={selectedCountryObj}
        onChange={this.handleChange}
        options={this.state.countries}
        isClearable={false}
      />
    )
  }
}
