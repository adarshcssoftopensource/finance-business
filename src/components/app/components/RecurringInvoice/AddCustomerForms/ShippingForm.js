import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Col, Form, FormGroup, Input, Label, FormText, } from "reactstrap";
import { initialCustomerObject } from '../../sales/components/customer/customerSupportFile/constant';
import AddressAutoComplete from '../../../../common/AddressAutoComplete';
import SelectBox from '../../../../../utils/formWrapper/SelectBox';
import FormValidationError from '../../../../../global/FormValidationError';

class ShippingForm extends Component {
    state = {
        sameBilling: true,
        customerModel: initialCustomerObject(),
        countries: [],
        currencies: [],
        statesOptions: []
    };

    _handleIsShip(e) {
        this.setState({
            sameBilling: !this.state.sameBilling
        });
        this.props.handleText(e)
    }
    render() {
        return (
            <div>
                <p className="headingsAdd">Shipping address</p>
                <Form className="py-form-field--condensed">
                    <div className="py-form-field py-form-field--inline" className="mb-30">
                        <div className="py-form-field__element">
                            <Label check className="py-checkbox">
                                <Input autocomplete="nope"
                                    type="checkbox"
                                    checked={!this.props.customerModel.isShipping}
                                    name="isShipping"
                                    onChange={e => this.props.handleText(e)}
                                />{' '}
                                <span className="py-form__element__faux"></span>
                                <span className="py-form__element__label">Same as billing address</span>
                            </Label>
                        </div>
                    </div>
                    {
                        this.props.customerModel.isShipping ?
                            (<Fragment>
                                <div className="py-form-field py-form-field--inline">
                                    <label className="py-form-field__label is-required">Ship to Contact</label>
                                    <div className="py-form-field__element">
                                        <Input autocomplete="nope"
                                            type="text"
                                            value={this.props.customerModel.addressShipping.contactPerson}
                                            name="contactPerson"
                                            required
                                            onChange={e => this.props.handleText(e, 'addressShipping')}
                                            className={"py-form__element__medium"}
                                        />
                                        <FormValidationError
                                            showError={
                                                this.props.err
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="py-form-field py-form-field--inline">
                                    <label className="py-form-field__label">Address line 1 </label>
                                    <div className="py-form-field__element">
                                        <div className="py-select--native">
                                            <AddressAutoComplete
                                                handleSet={(addrObj) => this.props.handleSet('addressShipping', addrObj)}
                                                value={this.props.customerModel.addressShipping}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="py-form-field py-form-field--inline">

                                    <label className="py-form-field__label">Address line 2 </label>
                                    <div className="py-form-field__element">
                                        <Input autocomplete="nope"
                                            type="text"
                                            value={this.props.customerModel.addressShipping.addressLine2}
                                            name="addressLine2"
                                            onChange={e => this.props.handleText(e, 'addressShipping')}
                                            className="py-form__element__medium"
                                        />
                                    </div>
                                </div>
                                <div className="py-form-field py-form-field--inline">

                                    <label className="py-form-field__label">City </label>
                                    <div className="py-form-field__element">
                                        <Input autocomplete="nope"
                                            type="text"
                                            value={this.props.customerModel.addressShipping.city}
                                            name="city"
                                            onChange={e => this.props.handleText(e, 'addressShipping')}
                                            className="py-form__element__medium"
                                        />
                                    </div>
                                </div>
                                <div className="py-form-field py-form-field--inline">
                                    <label className="py-form-field__label">Country </label>
                                    <div className="py-form-field__element">
                                        <div className="py-select--native">
                                            <SelectBox
                                                getOptionLabel={(value)=>(value["name"])}
                                                getOptionValue={(value)=>(value["id"])}
                                                value={this.props.customerModel && !!this.props.customerModel.addressShipping.country.id ? this.props.customerModel.addressShipping.country : ''}
                                                onChange={e => this.props.handleText({ ...e, target: { ...e.target, name: 'country' } }, 'addressShipping')}
                                                placeholder="Select a country"
                                                options={this.props.countryMenus}
                                                clearable={false}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="py-form-field py-form-field--inline">
                                    <label className="py-form-field__label">Province/State </label>
                                    <div className="py-form-field__element">
                                        <div className="py-select--native">
                                            <SelectBox
                                                getOptionLabel={(value)=>(value["name"])}
                                                getOptionValue={(value)=>(value["id"])}
                                                value={this.props.customerModel && !!this.props.customerModel.addressShipping.state.id ? this.props.customerModel.addressShipping.state : ''}
                                                onChange={e => this.props.handleText({ ...e, target: { ...e.target, name: 'state' } }, 'addressShipping')}
                                                placeholder="Select a province"
                                                options={this.props.selectedCountryStates}
                                                clearable={false}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="py-form-field py-form-field--inline">
                                    <label className="py-form-field__label">Postal/ZIP code </label>
                                    <div className="py-form-field__element">
                                        <Input autocomplete="nope"
                                            type="zip"
                                            value={this.props.customerModel.addressShipping.postal}
                                            name="postal"
                                            minLength={2}
                                            maxLength={10}
                                            onChange={e => this.props.handleText(e, 'addressShipping')}
                                            className="py-form__element__medium"
                                        />
                                    </div>
                                </div>
                                <div className="py-form-field py-form-field--inline">
                                    <label className="py-form-field__label">Delivery instructions </label>
                                    <div className="py-form-field__element">
                                        <Input autocomplete="nope"
                                            type="textarea"
                                            value={this.props.customerModel.addressShipping.deliveryNotes}
                                            name="deliveryNotes"
                                            onChange={e => this.props.handleText(e, 'addressShipping')}
                                            className="py-form__element__medium"
                                        />
                                    </div>
                                </div>
                            </Fragment>

                            )
                            : ''
                    }
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
};

export default connect(mapStateToProps, null)(ShippingForm)
