import React, { useState, useEffect } from 'react';
import { Col, Form, OverlayTrigger, Tooltip, FormGroup, Row } from 'react-bootstrap';
import { Spinner,
    // CustomInput,
    Button } from 'reactstrap';
import InputMask from 'react-input-mask';
import { pick } from "lodash";
import FormValidationError from '../../../../../../../global/FormValidationError';
import AddressAutoComplete from "../../../../../../common/AddressAutoComplete";
//Import business category
import { validatePhone, donationOptions, requiredMsg, removeMaskRegex, validateUrl } from '../data';
import SelectBox from '../../../../../../../utils/formWrapper/SelectBox';
import CountryCodeData from '../../../../../../../data/country-code.json'
import CustomInput from '../../../../../../common/CustomInput';
const StepTwo = (props) => {
    const [validated, setValidated] = useState(false);
    const [formData, setFormData] = useState({ address: {} });
    const [phoneError, setPhoneError] = useState(false);
    const [einError, setEinError] = useState(false);
    const [isReadOnly, setIsReadONly] = useState(false);
    const [businessCategory, setBusinessCategory] = useState([]);
    const [streetError, setStreetError] = useState(false);
    const [urlError, setUrlError] = useState(false);
    const [countryCode, setCountryCode] = useState(1);

    useEffect(() => {
        if (props.data) {
            setFormData(props.data)
        }
        if (props.isReadOnly || props.data.step =='2'){
            setIsReadONly(true)
        }
        if (!props.getAllMCC.data) {
            getCategory();
        }
        setInitialCountryCode() 
    }, []);

    useEffect(() => {
        setBusinessCategory(props.getAllMCC.data)
    }, [props.getAllMCC.data]);

    const getCategory = async () => {
        try {
            await props.getBusinessMcc()
        } catch (error) {
            props.onShowSnackbar(error.message);
        }
    }

    const handleAutoComplete = (data) => {
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

    const validateForm = () => {
        let error = true
        if (!formData.telephone) {
            setPhoneError(true);
            error = false
        }
        if (formData.website && !validateUrl(formData.website)) {
            setUrlError(true)
            error = false
        }
        if (formData.taxNumber && formData.taxNumber.length != 10) {
            setEinError(true)
            error = false
        } if (!formData.address.addressLine1) {
            setStreetError(true)
            error = false
        }
        return error;
    }

    const handleSubmit = (event) => {
        const form = event.currentTarget;
        event.preventDefault();
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            validateForm();
        } else if (validateForm()) {
            if (formData.businessType == 'individual') {
                setFormData({
                    ...formData,
                    haveEIN: false,
                    haveTradeName: false
                });
            }
            let data = pick(formData, ['legalName', 'mcc', 'taxNumber', 'haveEIN', 'haveTradeName', 'sellType', 'description', 'address', 'telephone', 'website',
                'tradeName', 'signingAuthorityName', 'organizationAge', 'donationVia'])
            props.onSubmit({ ...data, step: 2, countryCode: countryCode.toString()});
        }
        setValidated(true);
    };

    const onFormValChange = (key, value) => {
        if (key.includes('address')) {
            setStreetError(false)
            const newKey = key.split('.')[1];
            setFormData((prevData) => ({
                ...formData,
                address: { ...prevData.address, [newKey]: value }
            }));
        } else {
            setFormData({
                ...formData,
                [key]: value
            });
        }
    }
const validateCounteryCode=()=>{
    if(!countryCode){
        setInitialCountryCode() 
    }else{
        const getCode = CountryCodeData.filter(country => country.phoneCode === parseInt(countryCode)) 
        if(getCode.length==0){
        setInitialCountryCode() 
        }
    }
}

const setInitialCountryCode=()=>{
    const getCode = CountryCodeData.filter(country => country.sortname === props.data.country)
    setCountryCode(getCode[0].phoneCode || 1)   
}
    return (
        <div className="onboarding__business__details">
            <header className="py-header py-header--page">
                <div className="py-header--title">
                    <div className="h3 mb-3"> Tell us about your business </div>
                </div>
            </header>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <fieldset className="py-box py-box--card">
                    <div className="py-box__header">
                        <div className="py-box__header-title">Business Information</div>
                    </div>
                    <div className="py-box--content text-left">
                        <Row>
                            <Form.Group as={Col} xs={12} controlId="legalName">
                                <Form.Label className="is-required">Business Legal Name</Form.Label>
                                <Form.Control
                                    disabled={isReadOnly}
                                    required
                                    type="text"
                                    name="legalName"
                                    autoFocus={!isReadOnly}
                                    placeholder="Business Legal Name"
                                    defaultValue={formData ? formData.legalName : ''}
                                    onChange={(e) => setFormData({ ...formData, 'legalName': e.target.value })}
                                />
                                <Form.Control.Feedback type="invalid">{requiredMsg}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} xs={12} controlId="mcc">
                                <Form.Label className="pb-1 is-required">Category</Form.Label>
                                <SelectBox
                                    getOptionLabel={(value)=>(value["type"])}
                                    getOptionValue={(value)=>(value["mcc"])}
                                    placeholder="Select a category"
                                    className="py-form__element__fluid"
                                    required
                                    name="mcc"
                                    disabled={isReadOnly}
                                    value={formData && formData.mcc ? formData.mcc : ''}
                                    onChange={(e) => setFormData({ ...formData, 'mcc': e ? e.mcc : '' })}
                                    options={businessCategory}
                                />
                                <Form.Control
                                    required
                                    type="text"
                                    hidden
                                    name="mcc"
                                    defaultValue={formData && formData.mcc ? formData.mcc : ""}
                                />
                                <Form.Control.Feedback type="invalid">{requiredMsg}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} xs={12} controlId="sellType">
                                <Form.Label className="is-required">You Sell</Form.Label>
                                <div>
                                    <CustomInput disabled={isReadOnly} key={`product-${formData.sellType}`} onChange={(e) => onFormValChange('sellType', e.currentTarget.value)} defaultChecked={formData.sellType == 'Product' ? true : false}
                                        inline required type="radio" id="sellType0" name="sellType" value="Product" label="Products" />
                                    <CustomInput disabled={isReadOnly} key={`service-${formData.sellType}`} onChange={(e) => onFormValChange('sellType', e.currentTarget.value)} defaultChecked={formData.sellType == 'Service'}
                                        inline required type="radio" id="sellType1" name="sellType" value="Service" label="Services" />
                                    <CustomInput disabled={isReadOnly} key={`both-${formData.sellType}`} onChange={(e) => onFormValChange('sellType', e.currentTarget.value)} defaultChecked={formData.sellType == 'Both'}
                                        inline required type="radio" id="sellType2" name="sellType" value="Both" label="Both" />
                                </div>
                                <Form.Control
                                    required
                                    type="text"
                                    hidden
                                    name="sellType"
                                    defaultValue={formData ? formData.sellType : ''}
                                />
                                <Form.Control.Feedback type="invalid">{requiredMsg}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} xs={12} controlId="description">
                                <Form.Label className="is-required">Description</Form.Label>
                                <Form.Control
                                    name="description"
                                    placeholder="Description"
                                    as="textarea"
                                    disabled={isReadOnly}
                                    rows="4"
                                    required
                                    value={formData ? formData.description : ''}
                                    onChange={(e) => {
                                        onFormValChange('description', e.currentTarget.value);
                                    }} />
                                <Form.Control.Feedback type="invalid">{requiredMsg}</Form.Control.Feedback>
                            </Form.Group>
                            {formData.businessType != 'individual' && (
                                <React.Fragment>
                                    <Form.Group as={Col} xs={12} controlId="taxNumber">
                                        <Form.Label className="is-required">
                                            {props.data.country == 'US' ? 'Employer Identification Number (Tax ID)' : 'Business Number (Tax ID)'}
                                        </Form.Label>
                                        <OverlayTrigger
                                            key="top"
                                            placement="top"
                                            overlay={
                                                <Tooltip id={`tooltip-top`} >
                                                    If you process more than $20,000/year we use this to fill out you 1099-K form
                                        </Tooltip>
                                            }
                                        >
                                            <InputMask mask="99-9999999"
                                                maskChar={null}
                                                // disabled={!formData.haveEIN}
                                                required
                                                disabled={isReadOnly}
                                                value={formData ? formData.taxNumber : ''}
                                                onChange={(e) => {
                                                    setEinError(false)
                                                    onFormValChange('taxNumber', e.currentTarget.value);
                                                }}>
                                                {(inputProps) =>
                                                    <Form.Control
                                                        required
                                                        type="text"
                                                        name="taxNumber"
                                                        disabled={isReadOnly}
                                                        placeholder="00-0000000"
                                                        // disabled={!formData.haveEIN}
                                                        defaultValue={formData ? formData.taxNumber : ''}
                                                        {...inputProps}
                                                    />
                                                }
                                            </InputMask>
                                        </OverlayTrigger>
                                        <FormValidationError showError={einError} message="Valid number is required" />
                                        <Form.Control.Feedback type="invalid">{requiredMsg}</Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group as={Col} xs={12} controlId="haveEIN">
                                        <Form.Label>Trade Name (DBA)</Form.Label>
                                        <OverlayTrigger
                                            key="top"
                                            placement="top"
                                            overlay={
                                                <Tooltip id={`tooltip-top`} >
                                                    A trade name or DBA is a business name you've register with IRS
                                        </Tooltip>
                                            }
                                        >
                                            <Form.Control
                                                type="text"
                                                name="tradeName"
                                                placeholder="DBA"
                                                disabled={formData.haveTradeName || isReadOnly}
                                                defaultValue={formData ? formData.tradeName : ''}
                                                onChange={(e) => {
                                                    onFormValChange('tradeName', e.target.value);
                                                }}
                                            />
                                        </OverlayTrigger>
                                        <Form.Control.Feedback type="invalid">{requiredMsg}</Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group as={Col} xs={12} controlId="haveTradeName">
                                        <Form.Check
                                            custom
                                            inline
                                            disabled={isReadOnly}
                                            label="I didn't register my EIN with DBA"
                                            type="checkbox"
                                            name="haveTradeName"
                                            id="haveTradeName"
                                            defaultChecked={formData.haveTradeName}
                                            onChange={(e) => {
                                                onFormValChange('tradeName', e.target.checked ? '' : formData.tradeName);
                                                onFormValChange('haveTradeName', e.target.checked ? true : false);
                                            }}
                                        />
                                    </Form.Group>
                                </React.Fragment>
                            )}
                            {(formData.businessType !== "individual" && formData.businessType !== "single_member_llc") &&
                                (<Form.Group as={Col} xs={12} controlId="signingAuthorityName">
                                    <Form.Label className="is-required">Who has signing authority on the bank account your payments will be deposited into?</Form.Label>
                                    <Form.Control
                                        required
                                        type="text"
                                        name="signingAuthorityName"
                                        disabled={isReadOnly}
                                        placeholder="Enter full name"
                                        defaultValue={formData ? formData.signingAuthorityName : ''}
                                        onChange={(e) => {
                                            onFormValChange('signingAuthorityName', e.currentTarget.value);
                                        }}
                                    />
                                    <Form.Control.Feedback type="invalid">{requiredMsg}</Form.Control.Feedback>
                                </Form.Group>
                                )}
                            {formData.businessType === 'non_profit' && (
                                <React.Fragment>
                                    <Form.Group as={Col} xs={12} controlId="donationVia">
                                        <Form.Label className="pb-1 is-required">How do you typically receive your donations?</Form.Label>
                                        <SelectBox
                                            name="donationVia"
                                            getOptionLabel={(value)=>(value["title"])}
                                            getOptionValue={(value)=>(value["value"])}
                                            placeholder="Select"
                                            aria-required
                                            isDisabled={isReadOnly}
                                            value={formData ? formData.donationVia : ''}
                                            onChange={(e) => {
                                                onFormValChange('donationVia', e ? e.value : donationOptions[0].value)
                                            }}
                                            isClearable={false}
                                            options={donationOptions}
                                        />
                                        <Form.Control
                                            required
                                            type="text"
                                            hidden
                                            disabled={isReadOnly}
                                            name="donationVia"
                                            defaultValue={formData ? formData.donationVia : ''}
                                        />
                                        <Form.Control.Feedback type="invalid">{requiredMsg}</Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group as={Col} xs={12} controlId="organizationAge">
                                        <Form.Label>How old is the organization?</Form.Label>
                                        <Form.Control
                                            type="number"
                                            disabled={isReadOnly}
                                            name="organizationAge"
                                            placeholder="Age"
                                            defaultValue={formData ? formData.organizationAge : ''}
                                            onChange={(e) => {
                                                onFormValChange('organizationAge', e.currentTarget.value);
                                            }}
                                        />
                                        <Form.Control.Feedback type="invalid">Valid number is required</Form.Control.Feedback>
                                    </Form.Group>
                                </React.Fragment>
                            )}

                        </Row>
                    </div>
                </fieldset>
                <fieldset className="py-box py-box--card">
                    <div className="py-box__header">
                        <div className="py-box__header-title">Contact Information</div>
                    </div>
                    <div className="py-box--content text-left">
                        <Row>
                            <Form.Group as={Col} xs={6} controlId="telephone">
                                <Form.Label className="is-required">Telephone</Form.Label>
                                <div className="country-phone-field">
                                    <div className="plus disabled">+</div>
                                        <Form.Control
                                        value={formData && formData.countryCode ? formData.countryCode : countryCode}
                                            placeholder=''
                                            className="country-code ps-3 pe-0"
                                            disabled={true}
                                             onBlur={() => validateCounteryCode()}
                                            onChange={(e) => setCountryCode(e.target.value)}
                                            required
                                        />
                                    <Form.Control
                                        type="text"
                                        disabled={isReadOnly}
                                        placeholder=""
                                        value={formData ? formData.telephone : ''}
                                        defaultValue={formData ? formData.telephone : ''}
                                        required
                                        onChange={(e) => {
                                            setPhoneError(false)
                                            onFormValChange('telephone', validatePhone(e.currentTarget.value));
                                        }}
                                    />
                                   
                                    {/* <Form.Control.Feedback type="invalid">{requiredMsg}</Form.Control.Feedback> */}
                                </div>
                                <FormValidationError showError={phoneError} />
                            </Form.Group>
                            <Form.Group as={Col} xs={6} controlId="website">
                                <Form.Label>Website</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="website"
                                    disabled={isReadOnly}
                                    placeholder="www.example.com"
                                    defaultValue={formData ? formData.website : ''}
                                    onChange={(e) => {
                                        onFormValChange('website', e.currentTarget.value.toLowerCase());
                                    }}
                                />
                                <FormValidationError showError={urlError} message="Valid url is required" />
                                {/* <Form.Control.Feedback type="invalid">Valid url required</Form.Control.Feedback> */}
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
                                    disabled={isReadOnly}
                                    placeholder="Unit"
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
                                    disabled={isReadOnly}
                                    placeholder="City"
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
                                    isDisabled={isReadOnly}
                                    getOptionLabel={(value)=>(value["name"])}
                                    getOptionValue={(value)=>(value["id"])}
                                    placeholder="State"
                                    aria-required
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
                                    disabled={isReadOnly}
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
                                    disabled={isReadOnly}
                                    required
                                    placeholder="ZIP"
                                    minLength={2}
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

                        </Row>
                    </div>
                </fieldset>
                <FormGroup>
                    <div className="py-form-field__label mb-2">Have you accepted credit card payments in the past?</div>
                    <label for="accepted_credit_card_true" className="py-radio">
                        <input type="radio" disabled={isReadOnly} id="accepted_credit_card_true" name="accepted_credit_card_in_past" defaultChecked={formData && formData.accepted_credit_card_in_past} />
                        <span className="py-form__element__faux"></span>
                        <span className="py-form__element__label">Yes</span>
                    </label>

                    <label for="accepted_credit_card_false" className="py-radio">
                        <input type="radio" disabled={isReadOnly} id="accepted_credit_card_false" name="accepted_credit_card_in_past" defaultChecked={formData ? !formData.accepted_credit_card_in_past : false} />
                        <span className="py-form__element__faux"></span>
                        <span className="py-form__element__label">No</span>
                    </label>

                </FormGroup>
                {/* Save and continue Button */}
                <div className="d-flex justify-content-center mt-4">
                    {!isReadOnly && <Button type="submit" color="primary" disabled={props.loading} >
                        Save and continue {props.loading && (<Spinner size="sm" color="default" />)}
                    </Button>}
                    {isReadOnly && <Button type="button" color="primary" outline className="ms-2" onClick={() => props.handleSteps(2)}>Next</Button>}
                </div>
            </Form>
        </div>
    );
}

export default StepTwo;