import { fetchCurrencies } from '../../../../../../../api/globalServices';
import CurrencyWrapper from '../../../../../../../global/CurrencyWrapper';
import { cloneDeep, set } from 'lodash';
import React, { Component, Fragment } from "react";
import { Button, Col, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap";
import { fetchStatesByCountryId } from '../../../../../../../api/CustomerServices';
import { fetchCountries } from '../../../../../../../api/globalServices';
import CountryWrapper from '../../../../../../../global/CountryWrapper';
import StateWrapper from '../../../../../../../global/StateWrapper';
import FormValidationError from '../../../../../../../global/FormValidationError';
import AddressAutoComplete from "../../../../../../common/AddressAutoComplete";
class VendorModal extends Component {
  state = {
    data: {},
    currencies: [],
    countries: [],
    states: [],
    additionalInformation: false,
    errors: {},
  };

  componentWillReceiveProps(props) {
    if (!this.state.data.currencyId || !this.state.data.currency || !this.state.data.currency.code) {
      this.handleCurrency({ target: { value: props.currency.code || '' } })
    }
  }

  componentDidMount() {
    this.loadInitialData();
  }

  loadInitialData = async () => {
    const [currencies, countries] = await Promise.all([this.fetchCurrencies(), this.fetchCountries()]);

    this.setState({ currencies, countries });
  };

  fetchCurrencies = async () => {
    const currencies = await fetchCurrencies();
    return currencies.map(c => c.currencies[0]);
  };

  fetchCountries = async () => {
    const { countries } = await fetchCountries();
    return countries;
  };

  fetchStates = async (id) => {
    const { states } = await fetchStatesByCountryId(id);
    this.setState({ states });
  };

  close = () => {
    this.setState({ data: {}, additionalInformation: false });
    this.props.onClose();
  };

  toggleAdditionalInformation = () => {
    this.setState({ additionalInformation: !this.state.additionalInformation });
  };

  handleAutoComplete = async (data) => {
    if (data.country) {
      const countries = this.state.countries;
      const countryObject = countries.find(o => o.sortname == data.country)
      if (countryObject) {
        this.handleCountry({ target: { name: 'country', value: countryObject.id } });
      }
    }
    if (data.state) {
      const states = this.state.states;
      const stateObject = states.find(o => o.name == data.state)
      if (stateObject) {
        this.handleState({ target: { name: 'state', value: stateObject.id } });
      }
    }
    if (!!data.postalCode) {
      this.handleChange({ target: { name: 'postal', value: data.postalCode } });
    } else {
      this.handleChange({ target: { name: 'postal', value: '' } });
    }
    if (!!data.city) {
      this.handleChange({ target: { name: 'city', value: data.city } });
    } else {
      this.handleChange({ target: { name: 'city', value: '' } });
    }
    if (!!data.oneLine) {
      this.handleChange({ target: { name: 'addressLine1', value: data.addressLine1 } });
      this.handleChange({ target: { name: 'addressLine2', value: data.oneLine } });
    } else {
      this.handleChange({ target: { name: 'addressLine1', value: data.addressLine1 } });
      this.handleChange({ target: { name: 'addressLine2', value: '' } });
    }
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      ...prevState,
      data: {
        ...prevState.data,
        [name]: value
      },
      errors: {}
    }));
  };

  handleNumericInput = async (e) => {
    if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  handleCountry = ({ target: { value } = {} } = {}) => {
    const data = cloneDeep(this.state.data);
    set(data, 'countryId', value);
    const country = this.state.countries.find(r => r.id.toString() === value.toString());
    if (!country) {
      return;
    }
    set(data, 'country', { name: country.name, id: country.id });
    this.setState({ data }, () => this.fetchStates(country.id));
  };

  handleState = ({ target: { value } = {} } = {}) => {
    const data = cloneDeep(this.state.data);
    set(data, 'stateId', value);
    const state = this.state.states.find(r => r.id.toString() === value.toString());
    set(data, 'state', { name: state.name, id: state.id, countryId: this.state.countryId });
    this.setState({ data });
  };

  handleCurrency = ({ target: { value } = {} } = {}) => {
    const data = cloneDeep(this.state.data);
    set(data, 'currencyId', value);
    const currency = this.state.currencies.find(r => r.code.toString() === value.toString());
    set(data, 'currency', currency);
    this.setState({ data });
  };

  getData = () => {
    const data = cloneDeep(this.state.data);
    data.vendorType = 'regular';
    data.communication = {
      phone: data.phone,
      fax: data.fax,
      mobile: data.mobile,
      tollFree: data.tollFree,
      website: data.website,
    };
    delete data.phone;
    delete data.fax;
    delete data.mobile;
    delete data.tollFree;
    delete data.website;

    data.address = {
      country: data.country,
      state: data.state,
      city: data.city,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      postal: data.postal,
    };

    delete data.countryId;
    delete data.stateId;
    delete data.state;
    delete data.country;
    delete data.addressLine1;
    delete data.addressLine2;
    delete data.postal;
    delete data.city;
    delete data.currencyId;
    return data;
  };

  validateData = (data) => {
    const errors = {};
    if (!data.vendorName || !data.vendorName.trim()) {
      document.getElementById('vendorName').focus()
      errors.vendorName = true;
    }
    this.setState({ errors });
    return !Object.keys(errors).length;
  };

  submitForm = (e) => {
    e.preventDefault();

    const payload = this.getData();
    if (!this.validateData(payload)) {
      return;
    }
    this.props.addVendor(payload, this.close);
  };

  renderStateOptions() {
    const options = this.state.states.map(state => (
      <option key={state.id} value={state.id}>{state.name}</option>
    ));

    options.unshift((<option key={-1} value="">Choose</option>));

    return options;
  }

  renderAdditionalInformation() {
    const { data = {}, additionalInformation } = this.state;
    return (
      <Fragment>
        <FormGroup row>
          <Label
            className="text-right"
            md={5}>
          </Label>
          <Col md={7} className="field-container">
            <a href="javascript:void(0)" onClick={this.toggleAdditionalInformation} style={{ fontWeight: 'bold' }}>
              <i className={`fal fa-chevron-${additionalInformation ? 'up' : 'down'}`} />
              &nbsp;
              <span>{additionalInformation ? 'Hide' : 'Add'} additional information</span>
            </a>
          </Col>
        </FormGroup>
        {additionalInformation && (
          <Fragment>
            <FormGroup row>
              <Label
                className="text-right text-muted"
                htmlFor="account_number"
                md={5}>
                Account number
              </Label>
              <Col md={6}>
                <Input autocomplete="nope" type="text" id="account_number"
                  name="accountNumber" value={data.accountNumber}
                  onChange={this.handleChange}
                  onKeyDown={this.handleNumericInput}
                  maxLength={300}
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label
                className="text-right text-muted"
                htmlFor="addressLine1"
                md={5}>
                Address line 1
              </Label>
              <Col md={6}>
                <AddressAutoComplete
                  handleSet={(addrObj) => this.handleAutoComplete(addrObj)}
                />
                {/* <Input autocomplete="nope" type="text" id="addressLine1"
                  name="addressLine1" value={data.addressLine1}
                  onChange={this.handleChange}
                  maxLength={300}
                /> */}
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label
                className="text-right text-muted"
                htmlFor="addressLine2"
                md={5}>
                Address line 2
              </Label>
              <Col md={6}>
                <Input autocomplete="nope" type="text"
                  name="addressLine2"
                  id="addressLine2"
                  value={data.addressLine2}
                  onChange={this.handleChange}
                  maxLength={300}
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label
                htmlFor="v_city"
                className="text-right text-muted"
                md={5}>
                City
              </Label>
              <Col md={6}>
                <Input autocomplete="nope" type="text"
                  name="city"
                  id="v_city"
                  value={data.city}
                  onChange={this.handleChange}
                  maxLength={300}
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label
                className="text-right text-muted"
                htmlFor="v_provice"
                xs={12}
                sm={6}
                md={5}>
                Province/State
              </Label>
              <Col md={6} className="field-container">
                <StateWrapper handleText={this.handleState} id="v_provice"
                  selectedState={data.stateId} options={this.state.states} />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label
                className="text-right text-muted"
                htmlFor="v_postal"
                md={5}>
                Postal/Zip code
              </Label>
              <Col md={6}>
                <Input autocomplete="nope" type="zip"
                  name="postal"
                  id="v_postal"
                  value={data.postal}
                  minLength={2}
                  maxLength={10}
                  onChange={this.handleChange} maxLength={300}
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label
                htmlFor="v_country"
                className="text-right text-muted"
                xs={12}
                sm={6}
                md={5}>
                Country
              </Label>
              <Col md={6} className="field-container">
                <CountryWrapper handleText={this.handleCountry} id="v_country"
                  selectedCountry={data.countryId} />
              </Col>
            </FormGroup>


            <FormGroup row>
              <Label
                className="text-right text-muted"
                htmlFor="v_phone"
                md={5}>
                Phone
              </Label>
              <Col md={6}>
                <Input autocomplete="nope" type="text"
                  name="phone"
                  id="v_phone"
                  value={data.phone}
                  onKeyDown={this.handleNumericInput}
                  onChange={this.handleChange} maxLength={300}
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label
                className="text-right text-muted"
                htmlFor="v_fax"
                md={5}>
                Fax
              </Label>
              <Col md={6}>
                <Input autocomplete="nope" type="text" id="v_fax"
                  name="fax" value={data.fax}
                  onChange={this.handleChange}
                  onKeyDown={this.handleNumericInput}
                  maxLength={300}
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label
                className="text-right text-muted"
                htmlFor="v_mobile"
                md={5}>
                Mobile
              </Label>
              <Col md={6}>
                <Input autocomplete="nope" type="text"
                  name="mobile"
                  id="v_mobile"
                  value={data.mobile}
                  onChange={this.handleChange} maxLength={300}
                  onKeyDown={this.handleNumericInput}
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label
                htmlFor="v_toll"
                className="text-right text-muted"
                md={5}>
                Toll-Free
              </Label>
              <Col md={6}>
                <Input autocomplete="nope" type="text" id="v_toll"
                  name="tollFree" value={data.tollFree}
                  onChange={this.handleChange}
                  onKeyDown={this.handleNumericInput}
                  maxLength={300}
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label
                htmlFor="v_website"
                className="text-right text-muted"
                md={5}>
                Website
              </Label>
              <Col md={6}>
                <Input autocomplete="nope"
                  id="v_website"
                  type="url"
                  name="website"
                  value={data.website}
                  onChange={this.handleChange}
                  maxLength={300}
                />
              </Col>
            </FormGroup>
          </Fragment>
        )}
      </Fragment>
    );
  }

  render() {
    const { data, errors } = this.state;
    const { loading } = this.props;
    return (
      <Modal isOpen={this.props.isOpen}>
        <ModalHeader toggle={this.close}>Add a Vendor </ModalHeader>
        <ModalBody>
          <Form onSubmit={this.submitForm}>
            <FormGroup row>
              <Label
                htmlFor="vendorName"
                className="text-right text-muted is-required"
                md={5}>
                Vendor name
              </Label>
              <Col md={6}>
                <Input autocomplete="nope"
                  type="text"
                  name="vendorName"
                  id="vendorName"
                  value={data.vendorName}
                  onChange={this.handleChange}
                  maxLength={300}
                />
                <FormValidationError showError={errors.vendorName} />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label
                className="text-right text-muted"
                htmlFor="vendorEmail"
                md={5}>
                Email address
              </Label>
              <Col md={6}>
                <Input autocomplete="nope"
                  type="email"
                  name="email"
                  id="vendorEmail"
                  value={data.email}
                  onChange={this.handleChange}
                  maxLength={300}
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label
                className="text-right text-muted"
                htmlFor="vendor_first_name"
                md={5}>
                First name
              </Label>
              <Col md={6}>
                <Input autocomplete="nope" type="text"
                  name="firstName"
                  id="v_first_name"
                  value={data.firstName}
                  onChange={this.handleChange}
                  maxLength={300}
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label
                className="text-right text-muted"
                htmlFor="v_last_name"
                md={5}>
                Last name
              </Label>
              <Col md={6}>
                <Input autocomplete="nope" type="text"
                  name="lastName"
                  id="v_last_name"
                  value={data.lastName}
                  onChange={this.handleChange}
                  maxLength={300}
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label
                htmlFor="v_currency"
                className="text-right text-muted"
                xs={12}
                sm={6}
                md={5}>
                Currency{" "}
              </Label>
              <Col xs={12} sm={6} md={6} className="field-container">
                <CurrencyWrapper id="v_currency" handleText={this.handleCurrency} selectedCurrency={{ code: data.currencyId }} />
              </Col>
            </FormGroup>
            {this.renderAdditionalInformation()}
          </Form>
        </ModalBody>
        <ModalFooter>
          <FormGroup row>
            <Col md={5} />
            <Col md={7} className="text-right">
              <Button
                onClick={this.close}
                color="primary"
                outline
                >Cancel</Button>
                <Button
                  type="submit"
                  color="primary"
                  onClick={this.submitForm}
                  disabled={loading}
                  className="ms-3"
                >Add vendor {loading && (<Spinner size="sm" color="default" />)}</Button>
            </Col>
          </FormGroup>
        </ModalFooter>
      </Modal>
    );
  }
}

export default VendorModal;
