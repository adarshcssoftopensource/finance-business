import history from '../../../../../../customHistory';
import { cloneDeep, find, orderBy, uniqBy } from 'lodash';
import React, { Fragment, PureComponent } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { Button, Form, Input, Label, Spinner } from 'reactstrap';
import { bindActionCreators } from 'redux'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import CountryCodeList from "../../../../../../data/country-code.json";
import * as CustomerActions from '../../../../../../actions/CustomerActions';
import { openGlobalSnackbar } from '../../../../../../actions/snackBarAction';
import { fetchStatesByCountryId } from "../../../../../../api/CustomerServices";
import { fetchCountries, fetchCurrencies } from '../../../../../../api/globalServices';
import BillingAddress from './customerSupportFile/BillingAddress';
import { initialCustomerObject } from './customerSupportFile/constant';
import ShippingAddress from './customerSupportFile/ShippingAddress';
import { logger, handleAclPermissions } from '../../../../../../utils/GlobalFunctions';
import CenterSpinner from '../../../../../../global/CenterSpinner';
import FormValidationError from '../../../../../../global/FormValidationError';
import SelectBox from '../../../../../../utils/formWrapper/SelectBox';
class CustomerForm extends PureComponent {
  state = {
    hideFields: false,
    modal: false,
    activeTab: '3',
    collapse: false,
    customerModel: initialCustomerObject(),
    country:null,
    countries: [],
    currencies: [],
    shippingCountries: [],
    title: '',
    statesOptions: [],
    default_currecy: '',
    fetchstateapi: false,
    btnDisable: false,
    loader: true,
    showError: false,
    showContactError: false
  };

  componentDidMount() {
    const { isEditMode, selectedCustomer, businessInfo, selectedBusiness } = this.props;
    document.title = businessInfo && businessInfo.organizationName ? `Finance-${businessInfo.organizationName}-Customers` : `Finance-Customers`;
    const onSelect = isEditMode ? selectedCustomer : null;
    const formatedData = initialCustomerObject(onSelect, isEditMode, businessInfo);
    const selectedCountry = CountryCodeList.find(val => val.name === businessInfo.country.name);
    this.setState({ customerModel: formatedData, country: selectedCountry || null });
    this.fetchFormData();
    this.fetchStates(businessInfo.country.id);
    this.setState({ default_currecy: selectedBusiness.currency.code });
  }

  componentDidUpdate(prevProps) {
    const { isEditMode, selectedCustomer, businessInfo } = this.props;
    if (prevProps.selectedCustomer != selectedCustomer) {
      const onSelect = isEditMode ? selectedCustomer : null;
      const formatedData = initialCustomerObject(onSelect, isEditMode, businessInfo);
      this.setState({ customerModel: formatedData })
    }
  }

  fetchFormData = async () => {
    const countries = (await fetchCountries()).countries;
    const currencies = await fetchCurrencies();
    this.setState({ countries, currencies, shippingCountries: countries })
  };


  setAddress = async (from, data) => {
    if (!!data.country) {
      const countries = this.state.countries;
      const countryObject = find(countries, { 'sortname': data.country });
      let countriesData = []
      const setValue = this.mapWithCountry(countryObject.id);
      if (from === 'addressShipping') {
        countriesData = await this.fetchStatesForShipping(countryObject.id);
      } else {
        countriesData = await this.fetchStates(countryObject.id)
      }
      if (!!countriesData) {
        if (!!data.state) {
          const stateObject = find(countriesData.states, { 'name': data.state });
          const stateValue = this.mapWithStates(stateObject.id, from);
          this.setState({
            customerModel: {
              ...this.state.customerModel,
              [from]: {
                ...this.state.customerModel[from], state: stateValue
              }
            }
          });
        }
      }
      this.setState({
        customerModel: {
          ...this.state.customerModel,
          [from]: {
            ...this.state.customerModel[from], country: setValue
          }
        }
      });
    }
    else {
      this.setState({
        customerModel: {
          ...this.state.customerModel,
          [from]: {
            ...this.state.customerModel[from], country: '', state: ''
          }
        }
      });
    }
    if (!!data.postalCode) {
      if (data.postalCode.length <= 6) {
        this.setState({
          customerModel: {
            ...this.state.customerModel,
            [from]: {
              ...this.state.customerModel[from], postal: data.postalCode
            }
          }
        });
      }
    } else {
      this.setState({
        customerModel: {
          ...this.state.customerModel,
          [from]: {
            ...this.state.customerModel[from], postal: ''
          }
        }
      });
    }
    if (!!data.city) {
      this.setState({
        customerModel: {
          ...this.state.customerModel,
          [from]: {
            ...this.state.customerModel[from], city: data.city
          }
        }
      });
    } else {
      this.setState({
        customerModel: {
          ...this.state.customerModel,
          [from]: {
            ...this.state.customerModel[from], city: ''
          }
        }
      });
    }
    if (!!data.oneLine) {
      this.setState({
        customerModel: {
          ...this.state.customerModel,
          [from]: {
            ...this.state.customerModel[from], addressLine2: data.oneLine, addressLine1: data.addressLine1
          }
        }
      });
    } else {
      this.setState({
        customerModel: {
          ...this.state.customerModel,
          [from]: {
            ...this.state.customerModel[from], addressLine2: '',
            addressLine1: data.addressLine1
          }
        }
      });
    }
  }

  handlePhone = (val) => {
    this.setState({
      customerModel: {
        ...this.state.customerModel,
        communication: {
          ...this.state.customerModel.communication, phone: `+${val}`
        }
      }
    })
  }

  handleText = async (event, type) => {
    const target = event.target;
    const { name, value } = event.target;
    if (type === 'addressShipping') {
      if (name === 'state') {
        let setValue = this.mapWithStates(value, 'shipping');
        this.setState({
          customerModel: {
            ...this.state.customerModel,
            addressShipping: {
              ...this.state.customerModel.addressShipping, [name]: setValue
            }
          }
        });
      } else if (name === 'country') {
        let setValue = this.mapWithCountry(value);
        await this.fetchStatesForShipping(value);

        this.setState({
          customerModel: {
            ...this.state.customerModel,
            addressShipping: {
              ...this.state.customerModel.addressShipping, [name]: setValue
            }
          }
        });
      } else if (name === 'postal') {
        if (value.length <= 6) {
          this.setState({
            customerModel: {
              ...this.state.customerModel,
              addressShipping: {
                ...this.state.customerModel.addressShipping, [name]: value.toUpperCase()
              }
            }
          });
        }
      } else {
        this.setState({
          customerModel: {
            ...this.state.customerModel,
            addressShipping: {
              ...this.state.customerModel.addressShipping, [name]: value
            }
          }
        })
      }
    } else if (name === 'isShipping') {
      let customerModel = cloneDeep(this.state.customerModel);
      customerModel.isShipping = !customerModel.isShipping;
      this.setState({
        customerModel
      })
    }
    else if (target.type === 'checkbox') {
      const target = event.target;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      const name = target.name;
      this.setState({
        customerModel: { ...this.state.customerModel, [name]: value }
      })
    } else if (name === 'accountNumber' || name === 'fax' || name === 'mobile' ||
      name === 'tollFree' || name === 'website') {
      this.setState({
        customerModel: {
          ...this.state.customerModel,
          communication: {
            ...this.state.customerModel.communication, [name]: value
          }
        }
      })
    } else if (name === 'city' ||
      name === 'addressLine1' || name === 'addressLine2' || name === 'postal') {
      if (name === 'postal') {
        if (value.length <= 6) {
          this.setState({
            customerModel: {
              ...this.state.customerModel,
              addressBilling: {
                ...this.state.customerModel.addressBilling, [name]: value.toUpperCase()
              }
            }
          });
        }
      } else {
        this.setState({
          customerModel: {
            ...this.state.customerModel,
            addressBilling: {
              ...this.state.customerModel.addressBilling, [name]: value
            }
          }
        });
      }
    } else if (name === 'state') {
      let setValue = this.mapWithStates(value, 'billing');
      this.setState({
        customerModel: {
          ...this.state.customerModel,
          addressBilling: {
            ...this.state.customerModel.addressBilling, [name]: setValue
          }
        }
      });
    } else if (name === 'country') {
      let setValue = this.mapWithCountry(value);
      const currencyValue = this.mapCurrencyWithCountry(setValue)
      await this.fetchStates(value);
      this.setState({
        customerModel: {
          ...this.state.customerModel,
          addressBilling: {
            ...this.state.customerModel.addressBilling, [name]: setValue
          },
          currency: currencyValue
        }
      });
    } else if (name === 'currency') {
      // let states = await CustomerActions.fetchStatesByCountryId(value);
      const setValue = this.mapCurrencyWithCurrency(value);
      this.setState({
        customerModel: { ...this.state.customerModel, [name]: setValue }
      });
    }
    else {
      this.setState({
        customerModel: { ...this.state.customerModel, [name]: value }
      })
    }
  };


  mapWithCountry = id => {
    let countries = this.state.countries;
    if (countries && countries.length > 0) {
      let countryObject = find(countries, { 'id': parseInt(id) });
      let countryObj = {
        name: countryObject.name,
        id: countryObject.id,
        sortname: countryObject.sortname ? countryObject.sortname : ''
      };
      return countryObj;
    }
    return {};
  };


  mapWithStates = (id, addressType) => {
    let countryStates = (addressType.toLowerCase().includes('shipping')) ?
      this.props.selectedCountryStatesForShipping : this.props.selectedCountryStates;
    if (countryStates && countryStates.length > 0) {
      let stateObject = find(countryStates, { 'id': id });
      if (stateObject) {

        let countryObj = {
          name: stateObject.name,
          id: stateObject.id,
          country_id: stateObject.country_id
        }
      }

      return stateObject;
    }
    return {};
  };

  fetchStates = async (id) => {
    if (id && id !== 0) {
      const statesList = await fetchStatesByCountryId(id);
      this.props.actions.setCountrytStates(statesList);
      return statesList;
    } else {
      return false
    }
  };

  fetchStatesForShipping = async (id) => {
    if (id && id !== 0) {
      const statesList = await fetchStatesByCountryId(id);
      this.props.actions.setCountrytStatesForShipping(statesList);
      return statesList;
    } else {
      return false
    }
  };

  mapCurrencyWithCurrency = id => {
    const countries = this.state.currencies;
    let currencies = countries.map(country => { return country.currencies[0] });
    const currencyObject = find(currencies, { 'code': id });
    let selectedCountryCurrency = {
      name: currencyObject.name,
      code: currencyObject.code,
      symbol: currencyObject.symbol,
      displayName: currencyObject.displayName
    };
    return selectedCountryCurrency
  };

  mapCurrencyWithCountry = (country) => {
    const currencies = this.state.currencies;
    const currentCurrency = currencies.filter(curr => { return country.sortname === curr.alpha2Code });
    const currencyObject = currentCurrency[0].currencies[0];
    let selectedCountryCurrency = {
      name: currencyObject.name,
      code: currencyObject.code,
      symbol: currencyObject.symbol,
      displayName: currencyObject.displayName
    };
    return selectedCountryCurrency
  }
  customerFormSumbit = (event) => {
    event.preventDefault();
    let customerObj = this.state.customerModel;
    if (!customerObj.addressBilling.country.id) {
      customerObj.addressBilling.country.id = 0
    }

    if (!customerObj.customerName) {
      document.getElementById('customerName').focus()
      this.setState({
        showError: true
      })
    } else {
      this.setState({
        showError: false
      })
    }

    if (!customerObj.firstName) {
      document.getElementById('firstName').focus();
      this.setState({ showError: true });
      return;
  }

  if (!customerObj.lastName) {
      document.getElementById('lastName').focus();
      this.setState({ showError: true });
      return;
    }
 
    if (!!customerObj.isShipping && !customerObj.addressShipping.contactPerson) {
      const elem = document.getElementById('contactPerson')
      if (!!elem) {
        elem.focus()
      }
      this.setState({ showContactError: true })
    } else {
      this.setState({ showContactError: false })
    }
    if (!!customerObj.customerName && (!!customerObj.isShipping ? !!customerObj.addressShipping.contactPerson : true)) {
      const customerId = customerObj.id;
      delete customerObj.id;
      delete customerObj.userId;
      let payload = {
        customerInput: customerObj
      };
      this.setState({
        showError: false
      })
      this.saveCustomer(payload, customerId);
      this.props.actions.resetCountrytStates();
    }
  };

  
  saveCustomer = async (payload, customerId) => {
    const { isEditMode, actions, type, updateList } = this.props;
    this.setState({ btnDisable: true })
    let response;
    if (!!payload.customerInput.customerName && payload.customerInput.customerName !== " ") {
      try {
        if (!payload.customerInput.currency.code) {
          payload.customerInput = { ...payload.customerInput, currency: this.props.businessInfo.currency }
        }
        if (isEditMode) {
          response = await actions.updateCustomer(customerId, payload);
          if (response.statusCode === 200) {
            this.props.showSnackbar(response.message, false);
            history.push('/app/sales/customer');
          } else {
            this.props.showSnackbar(response.message, true);
          }
        } else {
          response = await actions.addCustomer(payload);
          if (response.statusCode === 201) {
            this.props.showSnackbar(response.message, false);
            history.push('/app/sales/customer');
          } else {
            this.props.showSnackbar(response.message, true);
          }
        }
        if (type) {
          this.setState({ btnDisable: false })
          updateList(response)
        } else {
          this.setState({ btnDisable: false })
        }
      } catch (error) {
        logger.error('error===>', error);
        this.props.showSnackbar(error.message, true)
        this.setState({ btnDisable: false })
      }
    } else {
      this.props.showSnackbar("No empty space is allowed in Customer Name.", true)
      this.setState({ btnDisable: false })
    }
  };

  handleShippingAdderss = e => {
    const { name, value } = e.target;
    let that = this;
    let { customerModel } = this.state;
    customerModel.addressShipping[name] = value;
    this.setState({
      customerModel: {
        ...this.state.customerModel,
        addressShipping: {
          ...this.state.customerModel.addressShipping, [name]: value
        }
      }
    })
  };

  handleHideFields = () => {
    this.setState(prevState => {
      return {
        hideFields: !prevState.hideFields
      }
    })
  };

  

  onCancel = () => {
    const { onClose } = this.props;
    if (onClose) {
      onClose()
    } else {
      history.push('/app/sales/customer');
    }
  };


  renderCurrencyOptions = () => {
    let countries = this.state.currencies;
    let currencies = countries.map(country => { return country.currencies[0] });
    currencies = orderBy(uniqBy(currencies, "code"), "code", "asc");
    return currencies.map((item, i) => {
      return (<option key={i} value={item.code}>
        {item.displayName}
      </option>)
    })
  };

  componentWillReceiveProps(nextProps) {
    if (!!this.state.customerModel.addressBilling.country.id && !this.state.fetchstateapi) {
      this.fetchStates(this.state.customerModel.addressBilling.country.id);
      this.setState({ fetchstateapi: true })
    }
    if (this.props.isEditMode && this.props.selectedCustomer !== nextProps.selectedCustomer) {
      this.setState({ loader: false })
    }
  }

  _renderSectionHeading = title => {
    return (
      <div>
        <h4 className="py-heading--section-title p-4">{title}</h4>
      </div>
    )
  };

  render() {
    const { isEditMode, type } = this.props;
    const { countries, country, customerModel, shippingCountries, btnDisable, loader, showError, showContactError } = this.state;
    let currencies = this.state.currencies;
    currencies = currencies.map(country => { return country.currencies[0] });
    currencies = orderBy(uniqBy(currencies, "code"), "code", "asc");

    return (
      <div>
        {
          (isEditMode && loader) ? (
            <CenterSpinner />
          ) : (

              <Form className="py-form-field--condensed" onSubmit={this.customerFormSumbit.bind(this)}>
                <Fragment>
                  {this._renderSectionHeading('Contact')}
                  <div className="py-form-field py-form-field--inline">
                    <Label htmlFor="customerName" className="py-form-field__label is-required">Customer</Label>
                    <div className="py-form-field__element">
                      <Input type="text"
                        className={`py-form__element__medium`}
                        value={customerModel.customerName} //Customer or Company name
                        name="customerName"
                        id="customerName"
                        onChange={this.handleText} />
                      <div style={{display: "block"}}>
                        <FormValidationError
                          showError={showError}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="py-form-field py-form-field--inline">
                    <Label htmlFor="contact_email" className="py-form-field__label is-required">Email address</Label>
                    <div className="py-form-field__element">
                      <Input type="email"
                        name="email"
                        id="contact_email"
                        className="py-form__element__medium"
                        value={customerModel.email}
                        onChange={this.handleText} />
                      <div style={{display: "block"}}>
                        <FormValidationError
                          showError={showError}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="py-form-field py-form-field--inline">
                    <Label htmlFor="contact_phone" className="py-form-field__label">Phone</Label>
                    <div className="py-form-field__element">
                      <PhoneInput
                        disableSearchIcon	
                        name="phone"
                        countryCodeEditable={false}
                        value={customerModel.communication.phone?
                          customerModel.communication.phone.includes("+") 
                          ? customerModel.communication.phone 
                          : `+${country && country.phoneCode}${customerModel.communication.phone}`
                      :`+${country && country.phoneCode}${customerModel.communication.phone}`
                      }
                        country={country && country.sortname.toLowerCase()}
                        enableSearch
                        id="contact_phone"
                        inputClass="py-form__element__medium"
                        containerClass="custom-select-div"
                        onChange={this.handlePhone}
                      />
                    </div>
                  </div>
                  <div className="py-form-field py-form-field--inline">
                    <Label htmlFor="contact_number" className="py-form-field__label is-required">First name</Label>
                    <div className="py-form-field__element">
                      <Input type="text" name="firstName"
                        className="py-form__element__medium"
                        id="firstName"
                        value={customerModel.firstName}
                        onChange={this.handleText} />
                      <div style={{display: "block"}}>
                        <FormValidationError
                          showError={showError}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="py-form-field py-form-field--inline">
                    <Label htmlFor="lastName" className="py-form-field__label is-required" >Last name</Label>
                    <div className="py-form-field__element">
                      <Input type="text" name="lastName"
                        id="lastName"
                        className="py-form__element__medium"
                        value={customerModel.lastName}
                        onChange={this.handleText} />
                        <div style={{display: "block"}}>
                          <FormValidationError
                            showError={showError}
                          />
                        </div>
                    </div>
                  </div>
                </Fragment>
                <div className="py-divider"></div>
                <Fragment>
                  {this._renderSectionHeading("Billing")}
                  <div className="py-form-field py-form-field--inline">
                    <Label htmlFor="billing_currency" className="py-form-field__label" >Currency</Label>
                    <div className="py-form-field__element">
                      <div className="py-select--native">
                        <SelectBox
                          id="billing_currency"
                          getOptionLabel={(value)=>(value["displayName"])}
                          getOptionValue={(value)=>(value["code"])}
                          value={!!this.state.customerModel.currency ? this.state.customerModel.currency : this.state.default_currecy}
                          onChange={e => this.handleText({ ...e, target: { ...e.target, name: 'currency', value: e.code } })}
                          placeholder="Select a currency"
                          options={currencies}
                          clearable={false}
                        />
                      </div>
                      <span className="py-text--hint">Billing address</span>
                    </div>
                  </div>

                  <BillingAddress
                    addressBilling={this.state.customerModel.addressBilling}
                    handleText={this.handleText}
                    countryMenus={countries}
                    selectedCountryStates={this.props.selectedCountryStates}
                    handleSet={this.setAddress}
                  />
                  <div className="py-divider"></div>
                </Fragment>
                <Fragment>
                  {this._renderSectionHeading('Shipping')}
                  <div className="py-form-field py-form-field--inline">
                    {/* <AddressAutoComplete/> */}
                    <Label htmlFor="exampleEmail" className="py-form-field__label" ></Label>
                    <div className="py-form-field__element">
                      <span className="py-text--hint">Specify a shipping address</span>
                      <Label className="py-checkbox">
                        <input
                          type="checkbox"
                          name='isShipping'
                          checked={customerModel.isShipping}
                          value={customerModel.isShipping}
                          onChange={this.handleText}
                        />
                        <span className="py-form__element__faux"></span>
                        <span className="py-form__element__label">Shipping address</span>
                      </Label>
                    </div>
                  </div>
                  {this.state.customerModel.isShipping &&
                    <ShippingAddress
                      addressShipping={this.state.customerModel.addressShipping}
                      handleText={(e, type) => this.handleText(e, type)}
                      countryMenus={shippingCountries}
                      selectedCountryStates={this.props.selectedCountryStatesForShipping}
                      handleSet={this.setAddress}
                      showContactError={showContactError}
                    />
                  }
                  <div className="py-divider"></div>
                </Fragment>
                <Fragment>
                  {this._renderSectionHeading("More")}
                  <div className="py-form-field py-form-field--inline">
                    <Label htmlFor="account_number" className="py-form-field__label" >Account number</Label>
                    <div className="py-form-field__element">
                      <Input type="text" className="py-form__element__medium" id="account_number" name="accountNumber"
                        value={!!customerModel.communication.accountNumber ? customerModel.communication.accountNumber : ""}
                        onChange={this.handleText} />
                    </div>
                  </div>
                  <div className="py-form-field py-form-field--inline">
                    <Label htmlFor="contact_fax" className="py-form-field__label" >Fax</Label>
                    <div className="py-form-field__element">
                      <Input type="text" className="py-form__element__medium" id="contact_fax" name="fax"
                        value={!!customerModel.communication.fax ? customerModel.communication.fax : ""}
                        onChange={this.handleText} />
                    </div>
                  </div>
                  {/* <div className="py-form-field py-form-field--inline">
                                <Label htmlFor="phone_number" className="py-form-field__label" >Phone</Label>
                                <Col xs={12} sm={8} md={4} lg={2}>
                                    <Input type="text" name="phone" id="phone_number"
                                        value={customerModel.communication.phone}
                                        onChange={this.handleText} />
                                </div>
                            </div> */}
                  <div className="py-form-field py-form-field--inline">
                    <Label htmlFor="mobile_number" className="py-form-field__label" >Mobile</Label>
                    <div className="py-form-field__element">
                      <Input type="text" name="mobile" autocomplete="nope"
                        className="py-form__element__medium"
                        id="mobile_number"
                        value={!!customerModel.communication.mobile ? customerModel.communication.mobile : ""}
                        onChange={this.handleText} />
                    </div>
                  </div>
                  <div className="py-form-field py-form-field--inline">
                    <Label htmlFor="toll_free" className="py-form-field__label" >Toll-Free</Label>
                    <div className="py-form-field__element">
                      <Input type="text" name="tollFree"
                        id="toll_free"
                        className="py-form__element__medium"
                        value={!!customerModel.communication.tollFree ? customerModel.communication.tollFree : ""}
                        onChange={this.handleText} />
                    </div>
                  </div>
                  <div className="py-form-field py-form-field--inline">
                    <Label htmlFor="website" className="py-form-field__label" >Website</Label>
                    <div className="py-form-field__element">
                      <Input type="text" name="website"
                        id="website"
                        className="py-form__element__medium"
                        value={!!customerModel.communication.website ? customerModel.communication.website : ""}
                        onChange={this.handleText} />
                    </div>
                  </div>
                  <div className="py-form-field py-form-field--inline">
                    <Label
                      htmlFor="internal_notes"
                      className="py-form-field__label">
                      Internal notes
                        </Label>
                    <div className="py-form-field__element">
                      <textarea
                        type="text"
                        rows="10"
                        id="internal_notes"
                        name="internalNotes"
                        className="form-control py-form__element__medium"
                        value={!!customerModel.internalNotes ? customerModel.internalNotes : ""}
                        onChange={e => this.handleText(e)}
                      />
                    </div>
                  </div>
                </Fragment>
                {!handleAclPermissions(['Viewer']) &&  <div className="py-form-field py-form-field--inline" check>
                  <div className="py-form-field__label"></div>
                  <div className="py-form-field__element">
                    <Button disabled={btnDisable} color="primary" >{btnDisable ? <Spinner size="sm" /> : 'Save'}</Button>
                    {/* <Button className="btn btn-rounded" onClick={this.onCancel}>Cancel</Button> */}
                  </div>
                </div>}
              </Form>
            )
        }
      </div>
    )
  }
}


const mapStateToProps = (state) => {

  return {
    selectedCustomer: state.customerReducer.selectedCustomer,
    countryCurrencyList: state.customerReducer.countryCurrencyList,
    errorMessage: state.customerReducer.errorMessage,
    businessInfo: state.businessReducer.selectedBusiness,
    selectedCountryStates: state.customerReducer.selectedCountryStates,
    selectedCountryStatesForShipping: state.customerReducer.selectedCountryStatesForShipping
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(CustomerActions, dispatch),
    showSnackbar: (message, error) => {
      dispatch(openGlobalSnackbar(message, error))
    }
  };
};


export default withRouter((connect(mapStateToProps, mapDispatchToProps)(CustomerForm)))
