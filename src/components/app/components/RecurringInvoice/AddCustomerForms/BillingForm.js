import React, { Component } from 'react'
import {
    Form,
    Input,
} from "reactstrap";
import { initialCustomerObject } from '../../sales/components/customer/customerSupportFile/constant';
import { orderBy, uniqBy } from 'lodash';
import { connect } from 'react-redux';
import AddressAutoComplete from '../../../../common/AddressAutoComplete';
import SelectBox from '../../../../../utils/formWrapper/SelectBox';

class BillingForm extends Component {
    state = {
        customerModel: initialCustomerObject(),
        countries: [],
        currencies: [],
        statesOptions: []
    }

    render() {
        let countries = this.props.currencies;
        let currencies = countries.map(country => { return country.currencies[0] });
        currencies = orderBy(uniqBy(currencies, "code"), "code", "asc");
        return (
            <div>
                <Form className="py-form-field--condensed">
                    <div className="py-form-field py-form-field--inline">
                        <label htmlFor="bl_currency" className="py-form-field__label">Currency</label>
                        <div className="py-form-field__element">
                            <div className="py-select--native">
                                <SelectBox
                                    id="bl_currency"
                                    getOptionLabel={(value)=>(value["displayName"])}
                                    getOptionValue={(value)=>(value["code"])}
                                    value={this.props.customerModel && !!this.props.customerModel.currency && this.props.customerModel.currency}
                                    onChange={e => this.props.handleText({ ...e, target: { ...e.target, name: 'currency' } })}
                                    placeholder="Select a currency"
                                    options={currencies}
                                    clearable={false}
                                />
                            </div>
                        </div>
                    </div>
                    <p className="headingsAdd">Billing address</p>
                    <div className="py-form-field py-form-field--inline v-center">
                        <label htmlFor="addressLine1" className="py-form-field__label">Address line 1 </label>
                        <div className="py-form-field__element">
                            <div className="py-select--native">
                                <AddressAutoComplete
                                    handleSet={(addrObj) => this.props.handleSet('addressBilling', addrObj)}
                                    value={this.props.customerModel && this.props.customerModel.addressBilling}
                                    id="addressLine1"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="py-form-field py-form-field--inline v-center">
                        <label htmlFor="addressLine2" className="py-form-field__label">Address line 2 </label>
                        <div className="py-form-field__element">
                            <Input autocomplete="nope"
                                type="text"
                                value={this.props.customerModel && this.props.customerModel.addressBilling.addressLine2}
                                name="addressLine2"
                                onChange={this.props.handleText}
                                className="py-form__element__medium"
                            />
                        </div>
                    </div>
                    <div className="py-form-field py-form-field--inline v-center">

                        <label htmlFor="city" className="py-form-field__label">City </label>
                        <div className="py-form-field__element">
                            <Input autocomplete="nope"
                                type="text"
                                value={this.props.customerModel && this.props.customerModel.addressBilling.city}
                                name="city"
                                id="city"
                                onChange={this.props.handleText}
                                className="py-form__element__medium"
                            />
                        </div>
                    </div>
                    <div className="py-form-field py-form-field--inline">
                        <label htmlFor="country" className="py-form-field__label">Country </label>
                        <div className="py-form-field__element">
                            <div className="py-select--native py-form_<_element__medium">
                                <SelectBox
                                    getOptionLabel={(value)=>(value["name"])}
                                    getOptionValue={(value)=>(value["id"])}
                                    id="country"
                                    value={this.props.customerModel && !!this.props.customerModel.addressBilling.country.id ? this.props.customerModel.addressBilling.country : ''}
                                    onChange={e => this.props.handleText({ ...e, target: { ...e.target, name: 'country' } })}
                                    placeholder="Select a country"
                                    options={this.props.countryMenus}
                                    clearable={false}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="py-form-field py-form-field--inline">
                        <label htmlFor="province" className="py-form-field__label">Province/State </label>
                        <div className="py-form-field__element">
                            <div className="py-select--native py-form__element__medium">
                                <SelectBox
                                    id="province"
                                    getOptionLabel={(value)=>(value["name"])}
                                    getOptionValue={(value)=>(value["id"])}
                                    value={this.props.customerModel && !!this.props.customerModel.addressBilling.state.id ? this.props.customerModel.addressBilling.state : ''}
                                    onChange={e => this.props.handleText({ ...e, target: { ...e.target, name: 'state' } })}
                                    placeholder="Select a province"
                                    options={this.props.selectedCountryStates}
                                    clearable={false}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="py-form-field py-form-field--inline v-center">
                        <label htmlFor="postall" className="py-form-field__label">Postal/ZIP code </label>
                        <div className="py-form-field__element">
                            <Input autocomplete="nope"
                                type="zip"
                                id="postall"
                                value={this.props.customerModel && this.props.customerModel.addressBilling.postal}
                                name="postal"
                                minLength={2}
                                maxLength={10}
                                onChange={this.props.handleText}
                                className="py-form__element__medium"
                            />
                        </div>
                    </div>
                </Form>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        selectedCountry: state.customerReducer.selectedCountry,
        // selectedCountryStates: state.customerReducer.selectedCountryStates
    }
}

export default connect(mapStateToProps, null)(BillingForm)