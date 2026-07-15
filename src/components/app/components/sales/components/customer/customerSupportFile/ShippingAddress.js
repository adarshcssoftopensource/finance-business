import React, { Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Col, FormGroup, Input, Label, FormText } from "reactstrap";
import { fetchStatesByCountryId } from "../../../../../../../api/globalServices";
import { changePhoneFormate } from "../../../../../../../utils/GlobalFunctions";
import AddressAutoComplete from "../../../../../../common/AddressAutoComplete";
import FormValidationError from "../../../../../../../global/FormValidationError";
import SelectBox from "../../../../../../../utils/formWrapper/SelectBox";

class ShippingAddress extends React.Component {
  state = {
    statesOptions: []
  };

  componentDidMount() {
    const { country } = this.props.addressShipping;
    this.fetchStates(country.id);
  }

  componentDidUpdate(prevProps) {
    const { addressShipping } = this.props;
    const oldAddressShipping = prevProps.addressShipping;
    if (addressShipping != oldAddressShipping) {
      if (addressShipping.country != oldAddressShipping.country) {
        this.fetchStates(addressShipping.country.id);
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
    const { addressShipping, handleText, countryMenus, handleSet, showContactError } = this.props;
    const statesOptions = this.state.statesOptions;
    return (
      <Fragment>
        <div className="py-form-field py-form-field--inline">
          <Label
            htmlFor="contactPerson"
            className="py-form-field__label is-required"
          >Ship to contact</Label>
          <div className="py-form-field__element">
            <Input autocomplete="nope"
              type="text"
              name="contactPerson"
              id="contactPerson"
              value={addressShipping.contactPerson}
              onChange={e => handleText(e, "addressShipping")}
              className={`py-form__element__medium`}
            />
            <FormValidationError showError={showContactError} />
          </div>
        </div>
        <div className="py-form-field py-form-field--inline">
          <Label
            htmlFor="exampleEmail"
            className="py-form-field__label"
          >
            Address line 1
          </Label>
          <div className="py-form-field__element">
            <AddressAutoComplete
              handleSet={(addrObj) => handleSet('addressShipping', addrObj)}
              value={addressShipping}
            />
          </div>
        </div>

        <div className="py-form-field py-form-field--inline">
          <Label
            htmlFor="addressLine2"
            className="py-form-field__label"
          >
            Address line 2
          </Label>
          <div className="py-form-field__element">
            <Input autocomplete="nope"
              type="text"
              name="addressLine2"
              id="addressLine2"
              className="py-form__element__medium"
              value={addressShipping.addressLine2}
              onChange={e => handleText(e, "addressShipping")}
            />
          </div>
        </div>
        <div className="py-form-field py-form-field--inline">
          <Label
            htmlFor="city"
            className="py-form-field__label"
          >
            City
          </Label>
          <div className="py-form-field__element">
            <Input autocomplete="nope"
              type="text"
              name="city"
              id="city"
              className="py-form__element__medium"
              value={addressShipping.city}
              onChange={e => handleText(e, "addressShipping")}
            />
          </div>
        </div>
        <div className="py-form-field py-form-field--inline">
          <Label
            htmlFor="country"
            className="py-form-field__label"
          >
            Country
          </Label>
          <div className="py-form-field__element">
            <div className="py-select--native">
              <SelectBox
                getOptionLabel={(value)=>(value["name"])}
                getOptionValue={(value)=>(value["id"])}
                value={!!addressShipping.country && !!addressShipping.country.id ? addressShipping.country : ''}
                onChange={e => handleText({ ...e, target: { ...e.target, name: 'country', value: e.id } }, 'addressShipping')}
                placeholder="Select a country"
                options={countryMenus}
                clearable={false}
              />
            </div>
          </div>
        </div>
        <div className="py-form-field py-form-field--inline">
          <Label
            htmlFor="province"
            className="py-form-field__label"
          >
            Province/State
          </Label>
          <div className="py-form-field__element">
            <div className="py-select--native">
              <SelectBox
                getOptionLabel={(value)=>(value["name"])}
                getOptionValue={(value)=>(value["id"])}
                value={!!addressShipping.state && !!addressShipping.state.id ? addressShipping.state : ''}
                onChange={e => handleText({ ...e, target: { ...e.target, name: 'state', value: e.id } }, 'addressShipping')}
                placeholder="Select a province/state"
                options={statesOptions}
                clearable={false}
              />
            </div>
          </div>
        </div>
        <div className="py-form-field py-form-field--inline">
          <Label
            htmlFor="postalAdd"
            className="py-form-field__label"
          >
            Postal/Zip code
          </Label>
          <div className="py-form-field__element">
            <Input autocomplete="nope"
              type="zip"
              name="postal"
              id="postalAdd"
              minLength={2}
              maxLength={10}
              value={addressShipping.postal}
              className="py-form__element__medium"
              onChange={e => handleText(e, "addressShipping")}
            />
          </div>
        </div>
        <div className="py-form-field py-form-field--inline">
          <Label
            htmlFor="phone"
            className="py-form-field__label"
          >
            Phone
          </Label>
          <div className="py-form-field__element">
            <Input autocomplete="nope"
              type="text"
              name="phone"
              id="phone"
              className="py-form__element__medium"
              value={changePhoneFormate(addressShipping.phone)}
              onChange={e => handleText(e, "addressShipping")}
            />
          </div>
        </div>

        <div className="py-form-field py-form-field--inline">
          <Label
            htmlFor="delivery"
            className="py-form-field__label"
          >
            Delivery instructions
          </Label>
          <div className="py-form-field__element">
            <textarea
              type="text"
              rows="10"
              id="delivery"
              name="deliveryNotes"
              className="form-control py-form__element__medium"
              value={addressShipping.deliveryNotes}
              onChange={e => handleText(e, "addressShipping")}
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
    selectedCountryStates:
      state.customerReducer.selectedCountryStatesForShipping
  };
};
export default withRouter(
  connect(
    mapStateToProps,
    null
  )(ShippingAddress)
);

const setCountries = countries => {
  return countries && countries.length ? (
    countries.map((item, i) => {
      return (
        <option key={i} value={item.id}>
          {" "}
          {item.name}
        </option>
      );
    })
  ) : (
      <option key={-1} value={0}>
        {" "}
        {"None"}
      </option>
    );
};

const setCountryStates = countryStates => {
  return countryStates && countryStates.length ? (
    countryStates.map((item, i) => {
      return (
        <option key={i} value={item.id}>
          {item.name}
        </option>
      );
    })
  ) : (
      <option key={-1} value={0} disabled>
        {"None"}
      </option>
    );
};
