import classNames from 'classnames';
import CountryWrapper from '../../../../../../../global/CountryWrapper';
import CurrencyWrapper from '../../../../../../../global/CurrencyWrapper';
import StateWrapper from '../../../../../../../global/StateWrapper';
import React, { Component, Fragment } from 'react'
import { Input, Label } from 'reactstrap';
import FormValidationError from '../../../../../../../global/FormValidationError';
import AddressAutoComplete from "../../../../../../common/AddressAutoComplete";
export default class RegularForm extends Component {
  state = {
    regularMore: false
  };
  
  handleNumericInput = async (e) => {
    if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  render() {
    const { regularMore } = this.state;
    const { vendorInput: { communication, contractor: { contractorType }, currency, firstName, lastName, email, country, address: { addressLine1, addressLine2, city, postal, state } = {}, vendorType = "regular" }, otherCountries, errors = {}, handleAutoComplete } = this.props;
    return (
      <Fragment>
        {vendorType === 'contractor' && contractorType === 'business' ? null : (
          <Fragment>
            <div className="py-form-field py-form-field--inline">
              <Label
                htmlFor="r_first_name"
                className={classNames({ "py-form-field__label": true, 'is-required': vendorType === 'contractor' })}>
                First name
              </Label>
              <div className="py-form-field__element">
                <Input autocomplete="nope"
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={firstName}
                  onChange={this.props.handleText}
                />
               &nbsp; <FormValidationError showError={errors.firstName} />
              </div>
            </div>
            <div className="py-form-field py-form-field--inline">
              <Label
                htmlFor="r_last_name"
                className={classNames({ "py-form-field__label": true, 'is-required': vendorType === 'contractor' })}>
                Last name
              </Label>
              <div className="py-form-field__element">
                <Input autocomplete="nope"
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={lastName}
                  onChange={this.props.handleText}
                />
              &nbsp;  <FormValidationError showError={errors.lastName} />
              </div>
            </div>
          </Fragment>
        )}
        <div className="py-form-field py-form-field--inline">
          <Label
            htmlFor="email"
            className={classNames({ "py-form-field__label": true, 'is-required': vendorType === 'contractor' })}>
            Email address
              </Label>
          <div className="py-form-field__element">
            <Input autocomplete="nope"
              type="text"
              name="email"
              id="email"
              value={email}
              onChange={this.props.handleText}
            />
           &nbsp; <FormValidationError showError={errors.emailtext} message={errors.emailtext} />
           &nbsp;<FormValidationError showError={errors.email} />
          </div>
        </div>
        <div className="py-form-field py-form-field--inline"
          style={vendorType === "contractor" ? { display: 'none' } : {}}>
          <Label
            htmlFor="r_currency"
            className="py-form-field__label">
            Currency{" "}
          </Label>
          <div className="py-form-field__element">
            <CurrencyWrapper id="r_currency" disabled={vendorType === "contractor"} handleText={(e) => this.props.handleText(e)}
              selectedCurrency={currency || {}} />
          </div>
        </div>
        <div className="py-form-field py-form-field--inline">
          <Label
            htmlFor="addressLine1"
            className={classNames({ "py-form-field__label": true, 'is-required': vendorType === 'contractor' })}>
            Address line 1
          </Label>
          <div className="py-form-field__element">
            <AddressAutoComplete
              restrictCountry={vendorType === "contractor" ? 'us' : ''}
              handleSet={(addrObj) => handleAutoComplete(addrObj)}
            />
           <FormValidationError showError={errors.addressLine1} />
          </div>
        </div>
        <div className="py-form-field py-form-field--inline">
          <Label
            htmlFor="r2_addressLine2"
            className="py-form-field__label">
            Address line 2
          </Label>
          <div className="py-form-field__element">
            <Input autocomplete="nope"
              type="text"
              id="r2_addressLine2"
              name="addressLine2"
              placeholder={otherCountries ? '' : ''}
              value={addressLine2}
              onChange={this.props.handleText}
            // maxLength={300}
            />
          </div>
        </div>
        <div className="py-form-field py-form-field--inline">
          <Label
            htmlFor="r2_country"
            className="py-form-field__label">
            Country
          </Label>
          <div className="py-select--native">
            <CountryWrapper id="r2_country" addBlank disabled={vendorType === "contractor"} handleText={(e) => this.props.handleText(e)}
              selectedCountry={country} />
          </div>
        </div>
        <div className="py-form-field py-form-field--inline">
          <Label
            htmlFor="state"
            className={classNames({ "py-form-field__label": true, 'is-required': vendorType === 'contractor' })}>
            Province/State
          </Label>
          <div className="py-select--native">
            <StateWrapper id="state" addBlank handleText={(e) => this.props.handleText(e)}
              selectedState={state} />
            <FormValidationError showError={errors.state} />
          </div>
        </div>
        <div className="py-form-field py-form-field--inline">
          <Label
            htmlFor="r2_city"
            className={classNames({ "py-form-field__label": true, 'is-required': vendorType === 'contractor' })}>
            City
          </Label>
          <div className="py-form-field__element">
            <Input autocomplete="nope"
              type="text"
              name="city"
              id="city"
              value={city}
              onChange={this.props.handleText}
            />
            <FormValidationError showError={errors.city} />
          </div>
        </div>
        <div className="py-form-field py-form-field--inline">
          <Label
            htmlFor="postal"
            className={classNames({ "py-form-field__label": true, 'is-required': vendorType === 'contractor' })}>
            Postal/Zip code
          </Label>
          <div className="py-form-field__element">
            <Input autocomplete="nope"
              type="zip"
              name="postal"
              id="postal"
              minLength={2}
              maxLength={10}
              value={postal}
              className={errors.postal && "has-errors"}
              onChange={this.props.handleText}
            />
           &nbsp; <FormValidationError showError={errors.postaltext} message={errors.postaltext} />
           &nbsp;  <FormValidationError showError={errors.postal} />
          </div>
        </div>
        <div className="py-form-field py-form-field--inline">
          <Label
            htmlFor="exampleEmail"
            className="py-form-field__label">
          </Label>
          <div className="py-form-field__element">
            <a className="py-text--link" href="javascript:void(0)"
              onClick={() => this.setState({ regularMore: !this.state.regularMore })}>
              Enter additional information (optional)
            </a>
          </div>
        </div>
        {
          regularMore ?
            (<Fragment>
              <div className="py-form-field py-form-field--inline">
                <Label
                  htmlFor="r2_account_number"
                  className="py-form-field__label">
                  Account number
                </Label>
                <div className="py-form-field__element">
                  <Input autocomplete="nope"
                    type="text"
                    name="accountNumber"
                    onKeyDown={this.handleNumericInput}
                    id="r2_account_number"
                  // value={communication.accountNumber}
                  // onChange={this.props.handleText}
                  // maxLength={300}
                  />
                </div>
              </div>
              <div className="py-form-field py-form-field--inline">
                <Label
                  htmlFor="r2_phone"
                  className="py-form-field__label">
                  Phone
                </Label>
                <div className="py-form-field__element">
                  <Input autocomplete="nope"
                    type="text"
                    id="r2_phone"
                    name="phone"
                    value={communication.phone}
                    onKeyDown={this.handleNumericInput}
                    onChange={this.props.handleText}
                  // maxLength={300}
                  />
                </div>
              </div>
              <div className="py-form-field py-form-field--inline">
                <Label
                  htmlFor="r2_fax"
                  className="py-form-field__label">
                  Fax
                </Label>
                <div className="py-form-field__element">
                  <Input autocomplete="nope"
                    type="text"
                    id="r2_fax"
                    name="fax"
                    value={communication.fax}
                    onKeyDown={this.handleNumericInput}
                    onChange={this.props.handleText}
                  // maxLength={300}
                  />
                </div>
              </div>
              <div className="py-form-field py-form-field--inline">
                <Label
                  htmlFor="r2_mobile"
                  className="py-form-field__label">
                  Mobile
                </Label>
                <div className="py-form-field__element">
                  <Input autocomplete="nope"
                    type="text"
                    id="r2_mobile"
                    name="mobile"
                    value={communication.mobile}
                    onKeyDown={this.handleNumericInput}
                    onChange={this.props.handleText}
                  // maxLength={300}
                  />
                </div>
              </div>
              <div className="py-form-field py-form-field--inline">
                <Label
                  htmlFor="r2_toll"
                  className="py-form-field__label">
                  Toll-Free
                </Label>
                <div className="py-form-field__element">
                  <Input autocomplete="nope"
                    type="text"
                    name="tollFree"
                    id="r2_toll"
                    value={communication.tollFree}
                    onKeyDown={this.handleNumericInput}
                    onChange={this.props.handleText}
                  // maxLength={300}
                  />
                </div>
              </div>
              <div className="py-form-field py-form-field--inline">
                <Label
                  htmlFor="r2_website"
                  className="py-form-field__label">
                  Website
                </Label>
                <div className="py-form-field__element">
                  <Input autocomplete="nope"
                    type="url"
                    id="r2_website"
                    name="website"
                    value={communication.website}
                    onChange={this.props.handleText}
                  // maxLength={300}
                  />
                </div>
              </div>
            </Fragment>)
            : ""
        }
        {vendorType === 'contractor' ? (
          <div className="py-form-field py-form-field--inline">
            <Label
              className="py-form-field__label">
              Direct deposit
            </Label>
            <div className="py-form-field__element check-group-container">
              <span>After saving the contractor information you will be able to add bank details on the vendors list.</span>
            </div>
          </div>
        ) : null}
      </Fragment>
    )
  }
}
