import React, { Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Input, Label } from "reactstrap";
import { fetchStatesByCountryId } from "../../../../../api/CustomerServices";
import AddressAutoComplete from "../../../../common/AddressAutoComplete";
import SelectBox from "../../../../../utils/formWrapper/SelectBox";
import FormValidationError from "../../../../../global/FormValidationError";

class ShippingAddress extends React.Component {
  state = {
    statesOptions: []
  };

  componentDidMount() {
    const { country } = this.props.addressBilling;
    this.fetchStates(country.id);
  }

  componentDidUpdate(prevProps) {
    const { addressBilling } = this.props;
    const oldAddressBilling = prevProps.addressBilling;
    if (addressBilling != oldAddressBilling) {
      if (addressBilling.country != oldAddressBilling.country) {
        this.fetchStates(addressBilling.country.id);
      }
    }
  }

  fetchStates = async id => {
    if (id && id !== 0) {
      const statesList = await fetchStatesByCountryId(id);
      this.setState({ statesOptions: statesList.states });
    }
  };

  render() {
    const { 
      addressBilling, handleText, countryMenus, handleSet,
      addressLine1Error, cityError, stateError, postalError,
      countryError
    } = this.props;
    const statesOptions = this.state.statesOptions;
    return (
      <Fragment>
        <div className="py-form-field py-form-field--inline v-center">
          <Label htmlFor="addressLine1" className="py-form-field__label is-required">
            Address line 1
          </Label>
          <div className="py-form-field__element">
            <AddressAutoComplete
              handleSet={(addrObj) => handleSet('addressBilling', addrObj)}
              value={addressBilling}
            />
            <FormValidationError
              showError={addressLine1Error}
            />
          </div>
        </div>
        <div className="py-form-field py-form-field--inline v-center">
          <Label htmlFor="addressLine2" className="py-form-field__label">
            Address line 2
          </Label>
          <div className="py-form-field__element">
            <Input autocomplete="nope"
              type="text"
              className="py-form__element__medium"
              name="addressLine2"
              id="addressLine2"
              value={addressBilling.addressLine2}
              onChange={handleText}
            />
          </div>
        </div>
        <div className="py-form-field py-form-field--inline v-center">
          <Label
            htmlFor="city"
            className="py-form-field__label is-required"
          >
            City
          </Label>
          <div className="py-form-field__element">
            <Input autocomplete="nope"
              type="text"
              name="city"
              id="city"
              className="py-form__element__medium"
              value={addressBilling.city}
              onChange={handleText}
            />
            <FormValidationError
              showError={cityError}
            />
          </div>
        </div>
        <div className="py-form-field py-form-field--inline">
          <Label htmlFor="country" className="py-form-field__label is-required">
            Country
          </Label>
          <div className="py-form-field__element">
            <div className="py-select--native">
              <SelectBox
                getOptionLabel={(value)=>(value["name"])}
                getOptionValue={(value)=>(value["id"])}
                id="country"
                className="select-empty"
                value={!!addressBilling.country && addressBilling.country.id ? addressBilling.country : ''}
                onChange={e => handleText({ ...e, target: { ...e.target, name: 'country', value: e.id } })}
                placeholder="Select a country"
                options={countryMenus}
                clearable={false}
              />
              <FormValidationError
                showError={countryError}
              />
            </div>
          </div>
        </div>
        <div className="py-form-field py-form-field--inline">
          <Label htmlFor="province" className="py-form-field__label is-required">
            Province/State
          </Label>
          <div className="py-form-field__element">
            <div className="py-select--native">
              <SelectBox
                id="province"
                className="select-empty"
                getOptionLabel={(value)=>(value["name"])}
                getOptionValue={(value)=>(value["id"])}
                value={!!addressBilling.state && !!addressBilling.state.id ? addressBilling.state : ''}
                onChange={e => handleText({ ...e, target: { ...e.target, name: 'state', value: e.id } })}
                placeholder="Select a province/state"
                options={statesOptions}
                clearable={false}
              />
              <FormValidationError
                showError={stateError}
              />
            </div>
          </div>
        </div>
        <div className="py-form-field py-form-field--inline v-center">
          <Label
            htmlFor="postal"
            className="py-form-field__label is-required"
          >
            Postal/Zip code
          </Label>
          <div className="py-form-field__element">
            <Input autocomplete="nope"
              type="zip"
              name="postal"
              id="postal"
              minLength={2}
              maxLength={10}
              className="py-form__element__medium"
              value={addressBilling.postal}
              onChange={handleText}
            />
            <FormValidationError
              showError={postalError}
            />
          </div>
        </div>
      </Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    selectedCountry: state.customerReducer.selectedCountry,
    selectedCountryStates: state.customerReducer.selectedCountryStates
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    null
  )(ShippingAddress)
);
