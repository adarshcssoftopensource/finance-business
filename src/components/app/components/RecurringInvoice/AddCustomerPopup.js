import classnames from 'classnames';
import { cloneDeep, find } from 'lodash';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  Button,
  Card,
  CardBody,
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  Spinner
} from "reactstrap";
import { bindActionCreators } from 'redux'
import * as CustomerActions from '../../../../actions/CustomerActions';
import { openGlobalSnackbar } from '../../../../actions/snackBarAction';
import { fetchStatesByCountryId } from "../../../../api/CustomerServices";
import { fetchCountries, fetchCurrencies } from '../../../../api/globalServices';
import { initialCustomerObject } from '../sales/components/customer/customerSupportFile/constant';
import BillingForm from './AddCustomerForms/BillingForm';
import ContactForm from './AddCustomerForms/ContactForm';
import MoreForm from './AddCustomerForms/MoreForm';
import ShippingForm from './AddCustomerForms/ShippingForm';
import { handleAclPermissions, _isValidEmail } from "../../../../utils/GlobalFunctions"
class AddCustomerPopup extends Component {
  state = {
    activeTab: '1',
    hideFields: false,
    modal: false,
    collapse: false,
    customerModel: initialCustomerObject(this.props.customer, this.props.isEditMode, this.props.businessInfo),
    countries: [],
    currencies: [],
    shippingCountries: [],
    title: '',
    statesOptions: [],
    customerNameErr: false,
    contactNameErr: false,
    loading: false,
    errors: {},
    isValid: false
  };

  _toggle(tab) {
    if (this.state.customerModel.isShipping) {
      if (!!this.state.customerModel.addressShipping.contactPerson) {
        if (this.state.activeTab !== tab) {
          this.setState({ activeTab: tab })
        }
      } else {
        this.setState({ contactNameErr: true });
        // this.props.showSnackbar("Please enter required fields", true)
      }
    } else {
      if (!!this.state.customerModel.customerName) {
        this.setState({ customerNameErr: false });
        if (this.state.activeTab !== tab) {
          this.setState({ activeTab: tab })
        }
      } else {
        this.setState({ customerNameErr: true });
        // this.props.showSnackbar("Please enter required fields", true)
      }
    }
  }

  componentDidMount() {
    const { isEditMode, selectedCustomer, businessInfo, customer } = this.props;
    document.title = businessInfo && businessInfo.organizationName ? `Finance-${businessInfo.organizationName}-Customers` : `Finance-Customers`;
    const onSelect = isEditMode ? customer : null;
    const formatedData = initialCustomerObject(onSelect, isEditMode, businessInfo);
    this.setState({ customerModel: formatedData });
    this.fetchFormData();
    if (isEditMode) {
      if (onSelect && onSelect.addressBilling && onSelect.addressBilling.country.id && onSelect.addressBilling.country.id) {
        this.fetchStates(onSelect.addressBilling.country.id);
        if(onSelect.addressShipping){
         this.fetchStatesForShipping(onSelect.addressShipping.country.id);
        }
      }

    } else {
      if (!!businessInfo.country.id) {
        this.fetchStates(businessInfo.country.id);
      }
    }
  }

  componentDidUpdate(prevProps) {
    const { isEditMode, selectedCustomer, businessInfo } = this.props;
    if (prevProps.selectedCustomer != selectedCustomer) {
      const onSelect = isEditMode ? selectedCustomer : null;
      const formatedData = initialCustomerObject(onSelect, isEditMode, businessInfo);
      this.setState({ customerModel: formatedData });
      this.fetchFormData()
    }
    document.title = businessInfo && businessInfo.organizationName ? `Finance - ${businessInfo.organizationName} - Add a customer` : `Finance - Add a customer`;
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
      if (from === 'addressShipping' && !!countryObject.id) {
        countriesData = await this.fetchStatesForShipping(countryObject.id);
      } else {
        if (!!countryObject.id) {
          countriesData = await this.fetchStates(countryObject.id)
        }
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
      this.setState({
        customerModel: {
          ...this.state.customerModel,
          [from]: {
            ...this.state.customerModel[from], postal: data.postalCode
          }
        }
      });
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
            ...this.state.customerModel[from], addressLine2: '', addressLine1: data.addressLine1
          }
        }
      });
    }
    // if(!!data.lat){
    //   this.setState({
    //     customerModel: {
    //       ...this.state.customerModel,
    //       [from]: {
    //         ...this.state.customerModel[from], lat: data.lat
    //       }
    //     }
    //   });
    // }
    // if(!!data.long){
    //   this.setState({
    //     customerModel: {
    //       ...this.state.customerModel,
    //       [from]: {
    //         ...this.state.customerModel[from], long: data.long
    //       }
    //     }
    //   });
    // }
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
        let setValue = this.mapWithStates(event.id, 'shipping');
        this.setState({
          customerModel: {
            ...this.state.customerModel,
            addressShipping: {
              ...this.state.customerModel.addressShipping, [name]: setValue
            }
          }
        });
      } else if (name === 'country') {
        let setValue = this.mapWithCountry(event.id);
        await this.fetchStatesForShipping(event.id);

        this.setState({
          customerModel: {
            ...this.state.customerModel,
            addressShipping: {
              ...this.state.customerModel.addressShipping, [name]: setValue
            }
          }
        });
      } else {
        if (name === 'contactPerson') {
          if (!!value) {
            this.setState({ contactNameErr: false })
          } else {
            this.setState({ contactNameErr: true })
          }
        }
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
    } else if (type === 'checkbox') {
      const value = target.type === 'checkbox' ? target.checked : target.value;
      const name = name;
      this.setState({
        customerModel: { ...this.state.customerModel, [name]: value }
      })
    } else if (name === 'accountNumber' || name === 'phone' || name === 'fax' || name === 'mobile' ||
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
      this.setState({
        customerModel: {
          ...this.state.customerModel,
          addressBilling: {
            ...this.state.customerModel.addressBilling, [name]: value
          }
        }
      });
    } else if (name === 'state') {
      let setValue = this.mapWithStates(event.id, 'billing');
      this.setState({
        customerModel: {
          ...this.state.customerModel,
          addressBilling: {
            ...this.state.customerModel.addressBilling, [name]: setValue
          }
        }
      });
    } else if (name === 'country') {
      let setValue = this.mapWithCountry(event.id);
      await this.fetchStates(event.id);
      this.setState({
        customerModel: {
          ...this.state.customerModel,
          addressBilling: {
            ...this.state.customerModel.addressBilling, [name]: setValue
          }
        }
      });
    } else if (name === 'currency') {
      // let states = await CustomerActions.fetchStatesByCountryId(value);
      const setValue = this.mapCurrencyWithCurrency(event.code);
      this.setState({
        customerModel: { ...this.state.customerModel, [name]: setValue }
      });
    } else if (name === 'customerName') {
      this.setState({
        customerModel: { ...this.state.customerModel, [name]: value },
        customerNameErr: false
      })
    } else {
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
        name: !!countryObject && !!countryObject.name && countryObject.name,
        id: !!countryObject && !!countryObject.id && countryObject.id,
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
    if (id > 0) {
      const statesList = await fetchStatesByCountryId(id);
      this.props.actions.setCountrytStates(statesList);
      return statesList;
    } else return []
  };

  fetchStatesForShipping = async (id) => {
    if (id > 0) {
      const statesList = await fetchStatesByCountryId(id);
      this.props.actions.setCountrytStatesForShipping(statesList);
      return statesList;
    } else return []
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

  customerFormSumbit = (event) => {
    event.preventDefault();
    let customerObj = { ...this.state.customerModel };
    const customerId = customerObj.id;
    delete customerObj.id;
    let payload = {
      customerInput: customerObj
    };

    const isValid = this.validateFields();
    if (isValid) {
      this.saveCustomer(payload, customerId);
      this.props.actions.resetCountrytStates();
    }
  };

  validateFields = () => {
    const errors = {};
    const customerObj = this.state.customerModel;
    
    if (!customerObj.customerName) {
      errors.customerName = 'Please enter name.'
    }
    if (!customerObj.firstName) {
      errors.firstName = 'Please enter first name.'
    }

    if (!customerObj.lastName) {
      errors.lastName = 'Please enter last name.'
    }
    
    if (!customerObj.email) {
      errors.email = 'Please enter email.'
    }

    if (customerObj.email && !_isValidEmail(customerObj.email)) {
      errors.email = 'Please enter valid email.'
    }
    
    const isValid = Boolean(Object.keys(errors).length === 0);
    this.setState({ errors, isValid })
    return isValid;
  }

  saveCustomer = async (payload, customerId) => {
    const { isEditMode, actions, type, updateList } = this.props;
    let response;
    this.setState({ loading: true })
    delete payload.customerInput.userId
    try {
      if (isEditMode) {
        if (!(this.props.invoiceData && this.props.invoiceData.payments && this.props.invoiceData.payments.length > 0 && this.props.invoiceData.customer.customerName !== payload.customerInput.customerName)) {
          response = await actions.updateCustomer(customerId, payload);

          if (!!response && response.statusCode === 200) {
            this.setState({ loading: false })
            this.props.showSnackbar(response.message, false);
          } else {
            this.setState({ loading: false })
            this.props.showSnackbar(response.message, true);
          }
        } else {
          response = payload.customerInput
        }
      } else {
        response = await actions.addCustomer(payload);
        if (!!response) {
          this.setState({ loading: false })
          // this.props.showSnackbar(response.data.customer.message, false);
        } else {
          this.setState({ loading: false })
          this.props.showSnackbar(response.data.customer.message, true);
        }
      }
      if (type) {
        updateList(response)
      } else {
        // history.push('/app/sales/customer');
        this.setState({ loading: false })
        this.props.closeModal(response)
      }
    } catch (error) {
      this.setState({ loading: false })
      this.props.showSnackbar(error.message, true)
    }
  };

  render() {
    const { open, isEditMode, customer } = this.props;
    const { countries, loading, customerModel, shippingCountries } = this.state;
    return (
      <div>
        <Modal isOpen={open} toggle={() => this.props.closeModal(!!customerModel.customerName && customerModel.customerName === !!customer && !!customer.customerName && customer.customerName ? customerModel : customer)} className="modal-add modal-customer" centered>
          <ModalHeader toggle={() => this.props.closeModal(!!customerModel.customerName && customerModel.customerName === !!customer && !!customer.customerName && customer.customerName ? customerModel : customer)}>
            <span className="modal-title">{isEditMode === true ? 'Edit' : 'Add'} a customer</span>
          </ModalHeader>
          <ModalBody>
            <Nav tabs className="py-nav--tabs mb-4">
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === '1' })}
                  onClick={() => { this._toggle('1'); }}
                >
                  Contact
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === '2' })}
                  onClick={() => { this._toggle('2'); }}
                >
                  Billing
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === '3' })}
                  onClick={() => { this._toggle('3'); }}
                >
                  Shipping
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === '4' })}
                  onClick={() => { this._toggle('4'); }}
                >
                  More
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={this.state.activeTab}>
              <TabPane tabId="1">
                <Row>
                  <Col sm="12">
                    <ContactForm
                      currencies={this.state.currencies}
                      handleText={this.handleText}
                      handlePhone={this.handlePhone}
                      businessInfo={this.props.businessInfo}
                      customerNameErr={this.state.customerNameErr}
                      errors={this.state.errors}
                      customerModel={customerModel}
                    />
                  </Col>
                </Row>
              </TabPane>
              <TabPane tabId="2">
                <Row>
                  <Col sm="12">
                    <BillingForm
                      handleText={this.handleText}
                      currencies={this.state.currencies}
                      countryMenus={shippingCountries}
                      customerModel={customerModel}
                      selectedCountryStates={this.props.selectedCountryStates}
                      handleSet={this.setAddress}
                    />
                  </Col>
                </Row>
              </TabPane>
              <TabPane tabId="3">
                <Row>
                  <Col sm="12">
                    <ShippingForm
                      addressShipping={this.state.customerModel.addressShipping}
                      handleText={this.handleText}
                      countryMenus={shippingCountries}
                      customerModel={customerModel}
                      selectedCountryStates={this.props.selectedCountryStatesForShipping}
                      handleSet={this.setAddress}
                      err={this.state.contactNameErr}
                    />
                  </Col>
                </Row>
              </TabPane>
              <TabPane tabId="4">
                <Row>
                  <Col sm="12">
                    <MoreForm
                      customerModel={customerModel}
                      handleText={this.handleText}
                    />
                  </Col>
                </Row>
              </TabPane>
            </TabContent>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" outline onClick={() => this.props.closeModal(!!customerModel.customerName && customerModel.customerName === !!customer && !!customer.customerName && customer.customerName ? customerModel : customer)}>Cancel</Button>
            <Button color="primary" disabled={handleAclPermissions(['Viewer']) || loading} onClick={this.customerFormSumbit.bind(this)}>{loading ? <Spinner size="sm" color="default" /> : "Save"}</Button>
          </ModalFooter>
        </Modal>
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


export default withRouter((connect(mapStateToProps, mapDispatchToProps)(AddCustomerPopup)))
