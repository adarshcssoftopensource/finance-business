import React, { Component } from 'react'
import { Form, FormGroup, Label, Col, Input, Spinner, Button } from 'reactstrap';
import DatepickerWrapper from "../../../../../utils/formWrapper/DatepickerWrapper";
import { _documentTitle } from '../../../../../utils/GlobalFunctions';
import FormValidationError from '../../../../../global/FormValidationError';
import SelectBox from '../../../../../utils/formWrapper/SelectBox';
import { toDisplayDate } from '../../../../../utils/common';
import { _toDateConvert } from '../../../../../utils/globalMomentDateFunc';

export default class EditProfileForm extends Component {
    componentDidMount() {
        _documentTitle({}, "Your Profile")
    }


    render() {
        const { handleText, countries, states, userInput, handleFormSubmission, profLoad,
            nameErr, lastNameErr, dobErr, stateErr, dobMessage, countryErr
        } = this.props;
        return (
            <Form className="py-form-field--condensed editprofile" onSubmit={e => handleFormSubmission(e)}>
                <div className="row mx-n2 mb-2">
                    <div className="col-3 col-sm-3 px-2 text-right" >
                        <Label for="firstName" className="py-form-field__label is-required mt-2">First name</Label>
                    </div>
                    <div className="col-9 col-sm-6 px-2" >
                        <Input autocomplete="nope" type="text"
                            value={userInput.firstName}
                            name="firstName"
                            id="firstName"
                            onChange={(e) => handleText(e)}
                        />
                        <FormValidationError
                            showError={nameErr}
                        />
                    </div>
                </div>
                <div className="row mx-n2 mb-2">
                    <div className="col-3 col-sm-3 px-2 text-right" >
                        <Label for="lastName" className="py-form-field__label is-required mt-2">Last name</Label>
                    </div>
                    <div className="col-9 col-sm-6 px-2" >
                        <Input autocomplete="nope" type="text"
                            value={userInput.lastName}
                            name="lastName"
                            id="lastName"
                            onChange={(e) => handleText(e)}
                        />
                        <FormValidationError
                            showError={lastNameErr}
                        />
                    </div>
                </div>
                <div className="row mx-n2 mb-2">
                    <div className="col-3 col-sm-3 px-2 text-right" >
                        <Label for="country" className="py-form-field__label is-required mt-2">Country</Label>
                    </div>
                    <div className="col-9 col-sm-6 px-2" >
                        <SelectBox
                            getOptionLabel={(value)=>(value["name"])}
                            getOptionValue={(value)=>(value["id"])}
                            value={!!userInput.address ? userInput.address.country : ""}
                            onChange={e => handleText({ ...e, target: { ...e.target, name: 'country', value: e } })}
                            placeholder="Select a country"
                            options={countries}
                            clearable={false}
                        />
                        <FormValidationError
                            showError={countryErr}
                        />
                    </div>
                </div>
                <div className="row mx-n2 mb-2">
                    <div className="col-3 col-sm-3 px-2 text-right" >
                        <Label for="state" className="py-form-field__label is-required mt-2" >Province/State</Label>
                    </div>
                    <div className="col-9 col-sm-6 px-2" >
                        <SelectBox
                            getOptionLabel={(value)=>(value["name"])}
                            getOptionValue={(value)=>(value["id"])}
                            value={!!userInput.address && userInput.address.state && userInput.address.state.id ? userInput.address.state : ""}
                            onChange={e => this.props.handleText({ ...e, target: { ...e.target, name: 'state', value: e } })}
                            placeholder="Select a province"
                            options={states}
                        />
                        <FormValidationError
                            showError={stateErr}
                        />
                    </div>
                </div>
                <div className="row mx-n2 mb-2">
                    <div className="col-3 col-sm-3 px-2 text-right" >
                        <Label for="city" className="py-form-field__label pt-2">City </Label>
                    </div>
                    <div className="col-9 col-sm-6 px-2" >
                        <Input autocomplete="nope" type="text"
                            value={!!userInput.address ? userInput.address.city : ""}
                            name="city"
                            id="city"
                            onChange={(e) => handleText(e)} />
                    </div>
                </div>
                <div className="row mx-n2 mb-2">
                    <div className="col-3 col-sm-3 px-2 text-right" >
                        <Label for="firstName" className="py-form-field__label pt-2">Postal/Zip code </Label>
                    </div>
                    <div className="col-9 col-sm-6 px-2" >
                        <Input autocomplete="nope" type="zip"
                            value={!!userInput.address ? userInput.address.postal : ""}
                            name="postal"
                            id="postal"
                            minLength={2}
                            maxLength={10}
                            className="form-box-sm"
                            onChange={(e) => handleText(e)}
                        />
                    </div>
                </div>
                <div className="row mx-n2 mb-2">
                    <div className="col-3 col-sm-3 px-2 text-right" >
                        <Label for="firstName" className="py-form-field__label pt-2">Date of birth </Label>
                    </div>
                    <div className="col-9 col-sm-6 px-2 py-form-field__element" >
                        <DatepickerWrapper
                            value={!!userInput.dateOfBirth && _toDateConvert(userInput.dateOfBirth)}
                            onChange={date =>
                                handleText({ target: { value: date, name: 'dateOfBirth' } })
                            }
                            onSelect={date =>
                                handleText({ target: { value: date, name: 'dateOfBirth' } })
                            }
                            className="form-control form-box-sm"
                            popperPlacement="top-end"
                            id="dob"
                        />
                        <FormValidationError
                            showError={dobErr}
                            message={dobMessage}
                        />
                        <div className="btnSave mt-3">
                            <Button color="primary" disabled={profLoad}>{profLoad ? <Spinner size="sm" color="default" /> : "Save"}</Button>
                        </div>
                    </div>
                </div>
            </Form>
        )
    }
}

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
