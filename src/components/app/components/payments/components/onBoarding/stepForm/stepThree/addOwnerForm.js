import React, { useState, useEffect } from 'react';
import { Col, Form, InputGroup, Row } from 'react-bootstrap';
import InputMask from 'react-input-mask';
import { months, requiredMsg, removeMaskRegex, validatePhone } from '../../data';
import { Spinner, Button } from 'reactstrap';
import PaymentServices from '../../../../../../../../api/paymentService'
import InformationAlert from '../../../../../../../../global/InformationAlert'
import SelectBox from '../../../../../../../../utils/formWrapper/SelectBox';
import FormValidationError from '../../../../../../../../global/FormValidationError';
import AddressAutoComplete from "../../../../../../../common/AddressAutoComplete";
import { _getDiffDate } from '../../../../../../../../utils/globalMomentDateFunc';
import Roles from './roles';
import CountryCodeData from '../../../../../../../../data/country-code.json'

const AddOwnerForm = (props) => {
    const [validated, setValidated] = useState(false);
    const [formData, setFormData] = useState({ address: { country: props.data.address.country } });
    const [dayData, setDayData] = useState([]);
    const [dob, setDob] = useState({ day: '', month: '', year: '' });
    const [ageError, setAgeError] = useState(false);
    const [phoneError, setPhoneError] = useState(false);
    const [ssnError, setSsnError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [roleError, setRoleError] = useState(false);
    const [owenerShipError, setOwenerShipError] = useState(null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [streetError, setStreetError] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [countryCode, setCountryCode] = useState(1);

    useEffect(()=>{
        setInitialCountryCode()  
    },[])
    useEffect(() => {
        if (props.formData) {
            setFormData({ ...formData, ...props.formData });
            let d = new Date(props.formData.dob);
            let day = d.getDate();
            let month = d.getMonth() + 1;
            let year = d.getFullYear();
            setDob({ day, month, year });
            if (props.formData.roles && props.formData.roles.length > 0) {
                setSelectedRoles(props.formData.roles)
            }
        }
        let dayArr = []
        Array.from({ length: 31 }).map((ele, i) => {
            dayArr.push({ value: i + 1, label: i + 1 })
        })
        setDayData(dayArr);
        setIsReadOnly(props.isReadOnly)
        if (!props.isEdit && props.ownerType === 'owner') {
            setSelectedRoles(['representative'])
        }
    }, [props.formData]);

    const validateForm = () => {
        let error = true
        if (!props.isIndividual && selectedRoles.length == 0) {
            setRoleError(true);
            error = false
        }
        if (!props.isIndividual && !props.isNonProfit && formData.ownership && selectedRoles.includes('owner') && (formData.ownership > 100 || formData.ownership < 25)) {
            setOwenerShipError("value should be 25 to 100");
            error = false
        } if (props.data.country != 'GB' && formData.idNumber && formData.idNumber.length < 9) {
            setSsnError(true);
            error = false
        }
        if (!formData.communication || (formData.communication && !formData.communication.phone)){
            setPhoneError(true)
            error = false
        }
        if (formData.communication && validateEmail(formData.communication.email) === false) {
            setEmailError(true);
            error = false
        } if (dob.year && checkAge() === false) {
            setAgeError(true)
            error = false
        } if (!formData.address.addressLine1 && !props.isIndividual) {
            setStreetError(true)
            error = false
        } if (props.ownerType === 'owner' && props.data.businessType === 'company' && !(selectedRoles.includes('owner') || selectedRoles.includes('executive'))) {
            props.onShowSnackbar('the representative must be either the owner or an executive of the organization')
            error = false
        } if (props.ownerType === 'owner' && props.isNonProfit && !selectedRoles.includes('executive')) {
            props.onShowSnackbar('the representative must be an executive of the organization')
            error = false
        }
        return error;
    }
    const handleSubmit = (event) => {
        const form = event.currentTarget;
        event.preventDefault();
        if (form.checkValidity() === false) {
            validateForm()
            event.preventDefault();
            event.stopPropagation();
        } else if (validateForm()) {
            const newDob = new Date(parseInt(dob.year), dob.month - 1, dob.day);
            if (props.isRolesShow && props.isIndividual) {
                createPerson({ ...formData, dob: newDob, ownership: 100, address: props.data.address, roles: ["director", "executive", "owner", "representative"] });
            } else if (props.isIndividual) {
                createPerson({ ...formData, dob: newDob, ownership: 100, address: props.data.address });
            } else if (props.isNonProfit) {
                createPerson({ ...formData, dob: newDob, ownership: 0, roles: selectedRoles, isEdit: props.isEdit });
            } else {
                createPerson({ ...formData, dob: newDob, ownership: selectedRoles.includes('owner') ? formData.ownership : 0, roles: selectedRoles, isEdit: props.isEdit });
            }
        }
        setValidated(true);
    };

    const createPerson = (data) => {
        setIsLoading(true)
        if (data._id) {
            delete data._id
        }
        PaymentServices.addPerson({ ...data, communication: { ...data.communication, countryCode: countryCode.toString()}})
            .then((res) => {
                setIsLoading(false)
                props.onSave(props.isIndividual ? data : res.data.business)
            })
            .catch((error) => {
                setIsLoading(false)
                props.onShowSnackbar(error.message)
            })
    }

    const handleAutoComplete = (data) => {
        setStreetError(false)
        if (data.state && props.statesOptions) {
            const getState = props.statesOptions.find((state) => state.name == data.state)
            onFormValChange('address.state', getState);
        }
        if (!!data.postalCode) {
            onFormValChange('address.postal', data.postalCode);
        } else {
            onFormValChange('address.postal', '');
        }
        if (!!data.city) {
            onFormValChange('address.city', data.city);
        }
        if (!!data.oneLine) {
            onFormValChange('address.addressLine1', data.addressLine1);
            onFormValChange('address.addressLine2', data.oneLine);
        } else {
            onFormValChange('address.addressLine1', data.addressLine1);
            onFormValChange('address.addressLine2', '');
        }
    }

    const onFormValChange = (key, value) => {
        if (key.includes('address')) {
            const newKey = key.split('.')[1];
            setFormData((prevData) => ({
                ...formData,
                sameAsBusinessAddress: false,
                address: { ...prevData.address, [newKey]: value }
            }));
        } else if (key.includes('communication')) {
            // setPhoneError(false);
            setEmailError(false);
            const newKey = key.split('.')[1];
            setFormData((prevData) => ({
                ...formData,
                communication: { ...prevData.communication, [newKey]: value }
            }));
        } else if (key.includes('dob')) {
            setAgeError(false);
            const newKey = key.split('.')[1];
            setDob({ ...dob, [newKey]: value });
        }
        else {
            setSsnError(false);
            setFormData({
                ...formData,
                [key]: value
            });
        }

    }

    const validateEmail = (value) => {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        return reg.test(value);
    }

    const checkAge = () => {
        const newDob = new Date(dob.year, dob.month - 1, dob.day);
        const age = _getDiffDate(new Date(), newDob, 'years') >= 16 ? true : false;
        setFormData({
            ...formData,
            dob: newDob
        });
        return age;
    };

    const selectRole = (e) => {
        const { value } = e.target
        let roles;
        if (selectedRoles.indexOf(value) > -1) {
            roles = selectedRoles.filter(role => role !== value)
        } else {
            roles = [...selectedRoles, value];
        }
        setRoleError(false);
        setSelectedRoles(roles);
    }
    const validateCounteryCode = () => {
        if (!countryCode) {
            setInitialCountryCode()
        } else {
            const getCode = CountryCodeData.filter(country => country.phoneCode === parseInt(countryCode))
            if (getCode.length == 0) {
                setInitialCountryCode()
            }
        }
    }

    const setInitialCountryCode = () => {
        const getCode = CountryCodeData.filter(country => country.sortname === props.data.country)
        setCountryCode(getCode[0].phoneCode || 1)
    }
    return (
        <div>
            {props.ownerType != 'owner' && <header className="py-header py-header--page">
                <div className="py-header--title">
                    <div className="mb-3 h3"> Tell us about the other owners</div>
                    <div className="py-text">
                        U.S. banking regulations require us to collect the information of
                        anyone owning 25% or more of the business.
                    </div>
                </div>
            </header>}
            {props.ownerType === 'owner' && !props.isIndividual && <InformationAlert varient="info">
                <div class="row p-0">
                    <div className="col-12 p-0 text-left">
                        The information provided below should be a person authorized by the business to agree to the terms of use of Finance. By default, this person will be titled as a representative who we will contact for any questions or concerns related to the business.
                    </div>
                    <div className="col-12 p-0 pt-1 text-left text-bold">
                        {props.isNonProfit ? `The representative must be an executive of the business.`
                            :
                            `This representative must be an owner or an executive of the business`}
                    </div>
                </div>
            </InformationAlert>
            }
            <Form noValidate validated={validated} onSubmit={handleSubmit} id="addOwnerForm">
                <fieldset className="py-box py-box--card">
                    <div className="py-box__header">
                        <div className="py-box__header-title">Personal Information</div>
                    </div>
                    <div className="py-box--content text-left">
                        <Row>

                            <Form.Group as={Col} xs={6} controlId="firstName">
                                <Form.Label className="is-required">Legal First Name</Form.Label>
                                <Form.Control
                                    required
                                    disabled={isReadOnly}
                                    type="text"
                                    name="firstName"
                                    autoFocus={!isReadOnly}
                                    placeholder="Legal First Name"
                                    defaultValue={formData ? formData.firstName : ''}
                                    onChange={(e) => setFormData({ ...formData, 'firstName': e.target.value })}
                                />
                                <Form.Control.Feedback type="invalid">{requiredMsg}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} xs={6} controlId="lastName">
                                <Form.Label className="is-required">Legal Last Name</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    name="lastName"
                                    disabled={isReadOnly}
                                    placeholder="Legal Last Name"
                                    defaultValue={formData ? formData.lastName : ''}
                                    onChange={(e) => setFormData({ ...formData, 'lastName': e.target.value })}
                                />
                                <Form.Control.Feedback type="invalid">{requiredMsg}</Form.Control.Feedback>
                            </Form.Group>
                            {!props.isIndividual && <Form.Group as={Col} xs={12} controlId="roles">
                                <Form.Label className="is-required">Role</Form.Label>
                                <Roles isNonProfit={props.isNonProfit} selectRole={selectRole} selectedRoles={selectedRoles} />
                                <Form.Text className="text-muted">
                                    Owner should have 25% ownership.
                                </Form.Text>
                                <FormValidationError showError={roleError} message="select at-least one role" />
                            </Form.Group>}

                            {!props.isIndividual && !props.isNonProfit && <Form.Group as={Col} xs={6} className="mb-2">
                                <Form.Label className="is-required">Ownership</Form.Label>
                                <InputGroup controlId="ownership">
                                    <Form.Control
                                        required={selectedRoles.includes('owner')}
                                        type="number"
                                        name="ownership"
                                        disabled={isReadOnly || !selectedRoles.includes('owner')}
                                        placeholder=""

                                        aria-label="Ownership"
                                        aria-describedby="basic-addon2"
                                        defaultValue={formData ? formData.ownership : ''}
                                        onChange={(e) => {
                                            setOwenerShipError(null);
                                            setFormData({ ...formData, 'ownership': e.target.value })
                                        }
                                        }
                                    />
                                    <InputGroup.Append>
                                        <InputGroup.Text id="basic-addon2">% of business</InputGroup.Text>
                                    </InputGroup.Append>
                                    {owenerShipError && <FormValidationError showError={owenerShipError} message={owenerShipError} />}
                                    <Form.Control.Feedback type="invalid">{requiredMsg}</Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                            }
                            {props.data.country != 'GB' && (<Form.Group as={Col} xs={6} controlId="idNumber" className="mb-2">
                                <Form.Label className="is-required">
                                    {props.data.country == 'US' ? 'SSN' : 'SIN'}
                                </Form.Label>
                                <InputMask mask={props.data.country == 'US' ? '999-99-9999' : '999-999-999'}
                                    maskChar={null}
                                    required
                                    value={formData ? formData.idNumber : ''}
                                    disabled={isReadOnly}
                                    onChange={(e) => {
                                        onFormValChange('idNumber', removeMaskRegex(e.currentTarget.value));
                                    }}>
                                    {(inputProps) =>
                                        <Form.Control
                                            type="text"
                                            name="idNumber"
                                            placeholder={props.data.country == 'US' ? '999-99-9999' : '999-999-999'}
                                            minLength={11}
                                            maxLength={11}
                                            disabled={isReadOnly}
                                            {...inputProps}
                                        />
                                    }
                                </InputMask>
                                <FormValidationError showError={ssnError} message="Valid number is required" />
                                <Form.Control.Feedback type="invalid">{requiredMsg}</Form.Control.Feedback>
                            </Form.Group>
                            )}
                        </Row>
                        <Row>
                            <Form.Group as={Col} xs={6} controlId="month">
                                <Form.Label className="is-required">Date of Birth</Form.Label>
                                <SelectBox
                                    name="month"
                                    getOptionLabel={(value)=>(value["label"])}
                                    getOptionValue={(value)=>(value["value"])}
                                    placeholder="Month"
                                    isDisabled={isReadOnly}
                                    aria-required
                                    value={dob.month ? dob.month : ''}
                                    onChange={(e) => {
                                        onFormValChange('dob.month', e ? e.value : months[0].value)
                                    }}
                                    isClearable={false}
                                    options={months}
                                />
                                <Form.Control
                                    required
                                    type="text"
                                    hidden
                                    defaultValue={dob.month ? dob.month : ''}
                                    name="month"
                                />
                                <Form.Control.Feedback type="invalid">{requiredMsg}</Form.Control.Feedback>
                                <FormValidationError showError={ageError} message="You should be at least 16 years old." />
                            </Form.Group>
                            <Form.Group as={Col} xs={3} className="mt-4" controlId="day">
                                <SelectBox
                                    name="day"
                                    getOptionLabel={(value)=>(value["label"])}
                                    getOptionValue={(value)=>(value["value"])}
                                    placeholder="Day"
                                    aria-required
                                    isDisabled={isReadOnly}
                                    value={dob.day ? dob.day : ''}
                                    onChange={(e) => {
                                        onFormValChange('dob.day', e ? e.value : dayData[0].value)
                                    }}
                                    isClearable={false}
                                    options={dayData}
                                />
                                <Form.Control
                                    required
                                    type="text"
                                    hidden
                                    defaultValue={dob.day ? dob.day : ''}
                                    name="day"
                                />
                                <Form.Control.Feedback type="invalid">{requiredMsg}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} xs={3} style={{ marginTop: '17px' }} controlId="year">
                                <Form.Label></Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    name="year"
                                    minLength="4"
                                    maxLength="4"
                                    className="mb-0"
                                    placeholder="Year"
                                    disabled={isReadOnly}
                                    value={dob.year ? dob.year : ''}
                                    onChange={(e) => {
                                        onFormValChange('dob.year', e.target.value)
                                    }}
                                />
                                <Form.Control.Feedback type="invalid">{requiredMsg}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} xs={6} controlId="telephone">
                                <Form.Label className="is-required">Telephone</Form.Label>
                                <div className="country-phone-field">
                                    <div className="plus">+</div>
                                    <Form.Control
                                        value={formData && formData.communication && formData.communication.countryCode ? formData.communication.countryCode : countryCode}
                                        placeholder=''
                                        className="country-code ps-3 pe-0"
                                        disabled={isReadOnly}
                                        onBlur={() => validateCounteryCode()}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        required
                                    />
                                    <Form.Control
                                        type="number"
                                        placeholder=""
                                        disabled={isReadOnly}
                                        required
                                        value={(formData && formData.communication) ? formData.communication.phone : ''}
                                        defaultValue={(formData && formData.communication) ? formData.communication.phone : ''}
                                        onChange={(e) => {
                                             setPhoneError(false)
                                            onFormValChange('communication.phone', e.currentTarget.value);
                                        }}
                                    />
                                    {/* <Form.Control.Feedback type="invalid">{requiredMsg}</Form.Control.Feedback> */}
                                </div>
                                <FormValidationError showError={phoneError} />
                               
                            </Form.Group>
                            <Form.Group as={Col} xs={6} controlId="email">
                                <Form.Label className="is-required">Email</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    name="email"
                                    disabled={isReadOnly}
                                    placeholder="Email"
                                    defaultValue={(formData && formData.communication) ? formData.communication.email : ''}
                                    onChange={(e) => onFormValChange('communication.email', e.currentTarget.value)}
                                />
                                <FormValidationError showError={emailError} message="Valid email is required" />
                                <Form.Control.Feedback type="invalid">{requiredMsg}</Form.Control.Feedback>
                            </Form.Group>

                        </Row>
                    </div>
                </fieldset>
                {!props.isIndividual && <fieldset className="py-box py-box--card">
                    <div className="py-box__header">
                        <div className="py-box__header-title">Home Address</div>
                    </div>
                    <div className="py-box--content text-left">
                        <Row>
                            <Form.Group as={Col} xs={12} controlId="sameAsBusinessAddress">
                                <Form.Check
                                    custom
                                    disabled={isReadOnly}
                                    inline
                                    label="Same as Business Address"
                                    type="checkbox"
                                    name="sameAsBusinessAddress"
                                    id="sameAsBusinessAddress"
                                    key={formData.sameAsBusinessAddress}
                                    defaultChecked={formData.sameAsBusinessAddress}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            address: props.data.address,
                                            sameAsBusinessAddress: e.target.checked ? true : false,
                                        });
                                    }}
                                />
                            </Form.Group>
                            <Form.Group as={Col} xs={12} controlId="addressLine1">
                                <Form.Label className="is-required">Street</Form.Label>
                                <AddressAutoComplete
                                    isFull={true}
                                    isClass='w-100'
                                    restrictCountry={props.data.country}
                                    disabled={isReadOnly}
                                    placeholder="Street"
                                    value={(formData && formData.address) ? formData.address : ''}
                                    handleSet={(addrObj) => handleAutoComplete(addrObj)}
                                />
                                <FormValidationError showError={streetError} />
                            </Form.Group>

                            <Form.Group as={Col} xs={6} controlId="addressLine2">
                                <Form.Label>Unit</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="addressLine2"
                                    placeholder="Unit"
                                    disabled={isReadOnly}
                                    value={(formData && formData.address) ? formData.address.addressLine2 : ''}
                                    defaultValue={(formData && formData.address) ? formData.address.addressLine2 : ''}
                                    onChange={(e) => {
                                        onFormValChange('address.addressLine2', e.currentTarget.value);
                                    }}
                                />
                            </Form.Group>
                            <Form.Group as={Col} xs={6} controlId="city">
                                <Form.Label className="is-required">City</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    name="city"
                                    placeholder="City"
                                    disabled={isReadOnly}
                                    value={(formData && formData.address) ? formData.address.city : ''}
                                    defaultValue={(formData && formData.address) ? formData.address.city : ''}
                                    onChange={(e) => {
                                        onFormValChange('address.city', e.currentTarget.value);
                                    }}
                                />
                                <Form.Control.Feedback type="invalid">{requiredMsg}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} xs={6} controlId="state">
                                <Form.Label className="pb-1 is-required">State</Form.Label>
                                <SelectBox
                                    name="state"
                                    getOptionLabel={(value)=>(value["name"])}
                                    getOptionValue={(value)=>(value["id"])}
                                    placeholder="State"
                                    aria-required
                                    isDisabled={isReadOnly}
                                    value={(formData && formData.address && formData.address.state && formData.address.state.id) ? formData.address.state.id : ""}
                                    onChange={(e) => {
                                        onFormValChange('address.state', e ? e : props.statesOptions[0])
                                    }}
                                    isClearable={false}
                                    options={props.statesOptions}
                                />
                                <Form.Control
                                    required
                                    type="text"
                                    hidden
                                    name="state"
                                    defaultValue={(formData && formData.address && formData.address.state && formData.address.state.id) ? formData.address.state.id : ""}
                                />
                                <Form.Control.Feedback type="invalid">{requiredMsg}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} xs={6} controlId="postal">
                                <Form.Label className="is-required">ZIP code</Form.Label>
                                <Form.Control
                                    type="zip"
                                    name="postal"
                                    required
                                    placeholder="ZIP"
                                    minLength={2}
                                    disabled={isReadOnly}
                                    maxLength={10}
                                    className="text-uppercase"
                                    value={(formData && formData.address) ? formData.address.postal : ''}
                                    defaultValue={(formData && formData.address) ? formData.address.postal : ''}
                                    onChange={(e) => {
                                        onFormValChange('address.postal', e.currentTarget.value);
                                    }}
                                />
                                <Form.Control.Feedback type="invalid">{requiredMsg}</Form.Control.Feedback>
                                <Form.Text className="text-muted">
                                    P.O. Box addresses cannot be accepted
                                </Form.Text>
                            </Form.Group>
                            <Form.Group as={Col} xs={12} controlId="firstName">
                                <Form.Label className="is-required">What is your position with the organization?</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="position"
                                    required
                                    disabled={isReadOnly}
                                    placeholder="Position"
                                    defaultValue={formData ? formData.position : ''}
                                    onChange={(e) => setFormData({ ...formData, 'position': e.target.value })}
                                />
                                <Form.Control.Feedback type="invalid">{requiredMsg}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                    </div>
                </fieldset>
                }
                {/* Save and continue Button */}
                <div className="d-flex justify-content-center mt-4">
                    {!isReadOnly && <Button type="submit" color="primary" >
                        Save {props.isIndividual ? 'and continue' : ''} {(isLoading || props.loading) && <Spinner size="sm" color="default" />}
                    </Button>}
                    {props.isEdit && <Button type="button" color="primary" outline className="ms-2" onClick={props.onCancel}>
                        Cancel
                    </Button>}
                    {isReadOnly && <Button type="button" color="primary" outline className="ms-2" onClick={() => props.handleSteps(3)}>Next</Button>}
                </div>
            </Form>
        </div>
    );
}

export default AddOwnerForm;