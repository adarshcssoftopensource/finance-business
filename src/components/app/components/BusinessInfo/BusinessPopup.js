import React, { Component } from 'react';
import {
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  FormText,
  Card,
  CardBody,
  Table,
  Modal, ModalHeader, ModalBody, ModalFooter, Spinner
} from "reactstrap";
import { connect } from "react-redux";
import SelectBox from "../../../../utils/formWrapper/SelectBox";
import { cloneDeep, find } from 'lodash'
import { fetchBusinessById, updateCompany, fetchBusinessCountries } from '../../../../api/businessService';
import { businessObject, timeZoneList } from './helper/businessObject';
import { fetchStatesByCountryId } from '../../../../api/CustomerServices';
import { openGlobalSnackbar } from '../../../../actions/snackBarAction';
import { setSelectedBussiness } from "../../../../actions/businessAction";
import AddressAutoComplete from "../../../common/AddressAutoComplete";

class BusinessPopup extends Component {

  state = {
    businessInfo: businessObject(),
    countries: [],
    stateList: [],
    shippingCountries: [],
    title: '',
    statesOptions: [],
    btnLoad: false,
    errors: {
      organizationName: false
    }
  }

  componentDidMount() {
    const businessId = localStorage.getItem('businessId')
    this.fetchBusinessDetail(businessId)
    this.fetchFormData()
  }

  fetchBusinessDetail = async (businessId) => {
    let response = await fetchBusinessById(businessId)
    if (response.data.business) {
      if (!!response.data.business.address && !!response.data.business.address.country) {
        const stateList = (await fetchStatesByCountryId(response.data.business.address.country.id)).states
        this.setState({ stateList })
      }
      this.setState({ businessInfo: businessObject(response.data.business) })
    }
  }
  
  formatWebsiteUrl = (url) => {
    if (!url) return url;
    let formattedUrl = url.trim();
    const hasProtocol = /^https?:\/\//i.test(formattedUrl);
    const isPartialProtocol = /^https?:?\/?\/?$/i.test(formattedUrl);

    if (!hasProtocol && !isPartialProtocol) {
        formattedUrl = 'https://' + formattedUrl;
    }
    return formattedUrl;
  }

  editBusinessHandle = async (event, fieldName) => {
    let updateValue = cloneDeep(this.state.businessInfo)
    if (fieldName === "country") {
      let stateList = (await fetchStatesByCountryId(event.id)).states
      updateValue.address[fieldName] = await this.prepareCountryObj(event.id)
      this.setState({ stateList: stateList })
    } else if (fieldName === "state") {
      updateValue.address[fieldName] = event
    } else if (fieldName === "timezone") {
      updateValue[fieldName] = event
    } else {
      const { name, value } = event.target
      if (["city", "postal", "addressLine1", "addressLine2"].includes(name)) {
        updateValue.address[name] = value
      } else if (["phone", "fax", "mobile", "tollFree"].includes(name)) {
        updateValue.communication[name] = value
      } else if (['website'].includes(name)) {
        updateValue.communication[name] = this.formatWebsiteUrl(value);
      } else {
        updateValue[name] = value

        // Clear error when user starts typing
        if (name === 'organizationName' && value) {
          this.setState(prevState => ({
            errors: {
              ...prevState.errors,
              organizationName: false
            }
          }))
        }

      }
    }
    this.setState({
      businessInfo: updateValue
    })
  }

  validateForm = () => {
    const { businessInfo } = this.state;
    let isValid = true;
    const errors = {
      organizationName: false
    };

    if (!businessInfo.organizationName || businessInfo.organizationName.trim() === '') {
      errors.organizationName = true;
      isValid = false;
    }

    this.setState({ errors });
    return isValid;
  };

  handleAutoComplete = async (data) => {
    if (data.state) {
      const states = this.state.stateList;
      const stateObject = states.find(o => o.name === data.state)
      if (stateObject) {
      await  this.editBusinessHandle(stateObject, "state");
      }
    }

    if (!!data.postalCode) {
      this.editBusinessHandle({ target: { name: 'postal', value: data.postalCode } });
    } else {
      this.editBusinessHandle({ target: { name: 'postal', value: '' } });
    }
    if (!!data.city) {
      this.editBusinessHandle({ target: { name: 'city', value: data.city } });
    } else {
      this.editBusinessHandle({ target: { name: 'city', value: '' } });
    }
    if (!!data.oneLine) {
    await  this.editBusinessHandle({ target: { name: 'addressLine1', value: data.addressLine1 } });
    await  this.editBusinessHandle({ target: { name: 'addressLine2', value: data.oneLine } });
    } else {
      this.editBusinessHandle({ target: { name: 'addressLine1', value: data.addressLine1 } });
      this.editBusinessHandle({ target: { name: 'addressLine2', value: '' } });
    }
  }

  prepareCountryObj = id => {
    const { countries } = this.state;
    const countryObject = find(countries, { 'id': parseInt(id) });
    let countryObj = {
      name: countryObject.name,
      id: countryObject.id,
      sortname: countryObject.sortname

    };
    return countryObj;
  };

  handleNumericInput = async (e) => {
    if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
    }
  }

  submitBusiness = async (e) => {
    e.preventDefault()
    if (!this.validateForm()) {
      return;
    }
    let businessInfo = cloneDeep(this.state.businessInfo)
    if (businessInfo.communication.website) {
      const websiteRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/i;
      if (!websiteRegex.test(businessInfo.communication.website)) {
        this.props.showSnackbar("Invalid website URL. Please include a valid domain suffix (like .com, .net)", true);
        return;
      }
      businessInfo.communication.website = this.formatWebsiteUrl(businessInfo.communication.website);
      this.setState({ businessInfo });
    }
    this.setState({ btnLoad: true })
    const businessId = businessInfo._id
    const { _id, ...businessInput } = businessInfo;
    let payload = {
      businessInput
    }
    try {
      const res = await updateCompany(businessId, payload)
      if (res.statusCode === 200) {
        this.props.showSnackbar(res.message, false)
        this.props.onClose(payload.businessInput)
        this.props.setSelectedBussiness(this.state.businessInfo._id, localStorage.getItem('refreshToken'), false)
        this.setState({ btnLoad: false })
      } else {
        this.props.showSnackbar(res.message, true)
      }
    } catch (error) {
      this.props.showSnackbar(error.message, true)
    }
  }

  fetchFormData = async () => {
    const countries = (await fetchBusinessCountries()).data.countries;
    this.setState({ countries })
  }

  render() {
    const { businessInfo, countries, stateList, btnLoad, errors } = this.state
    const { communication, address } = businessInfo
    const { openPopup, onClose } = this.props;
    return (
      <Modal isOpen={openPopup} className="modal-add " centered>
        <ModalHeader toggle={() => onClose(businessInfo)}>
          <h4 className="py-modal__header__stitle">Edit Business Address and Contact Details</h4>
        </ModalHeader>
        <ModalBody className="px-5">
          <Form className="py-form--vertical  py-form-field--condensed businesseditform" autocomplete="off" >
            <fieldset className="py-form-fieldset">
              <legend className="py-form-legend">Business</legend>
              <div className="py-form-field py-form-field--inline">
                <label htmlFor="company_name" className="py-form-field__label is-required">Company/Business</label>
                <div className="py-form-field__element">
                  <Input autocomplete="nope"
                    type="text"
                    id="company_name"
                    value={businessInfo.organizationName}
                    name="organizationName"
                    onChange={this.editBusinessHandle}
                    className={`py-form__element__fluid ${errors.organizationName ? 'is-invalid' : ''}`}
                  />
                  {errors.organizationName && (
                    <div className="invalid-feedback d-block">
                      Company/Business name is required
                    </div>
                  )}
                </div>
              </div>
              <div className="py-form-field py-form-field--inline">
                <label htmlFor="b_phone" className="py-form-field__label"> Phone </label>
                <div className="py-form-field__element" >
                  <Input autocomplete="nope"
                    type="text"
                    id="b_phone"
                    value={communication.phone}
                    name="phone"
                    onChange={this.editBusinessHandle}
                    onKeyDown={this.handleNumericInput}
                    className="py-form__element__fluid"
                  />
                </div>
              </div>
              <div className="py-form-field py-form-field--inline">
                <label htmlFor="b_fax" className="py-form-field__label"> Fax </label>
                <div className="py-form-field__element">
                  <Input autocomplete="nope"
                    type="text"
                    id="b_fax"
                    value={communication.fax}
                    name="fax"
                    onChange={this.editBusinessHandle}
                    onKeyDown={this.handleNumericInput}
                    className="py-form__element__fluid"
                  />
                </div>
              </div>
              <div className="py-form-field py-form-field--inline">
                <label htmlFor="b_mobile" className="py-form-field__label">Mobile </label>
                <div className="py-form-field__element" >
                  <Input autocomplete="nope"
                    type="text"
                    id="b_mobile"
                    value={communication.mobile}
                    name="mobile"
                    onChange={this.editBusinessHandle}
                    onKeyDown={this.handleNumericInput}
                    className="py-form__element__fluid"
                  />
                </div>
              </div>
              <div className="py-form-field py-form-field--inline">
                <label htmlFor="b_toll" className="py-form-field__label"> Toll Free </label>
                <div className="py-form-field__element">
                  <Input autocomplete="nope"
                    type="text"
                    value={communication.tollFree}
                    name="tollFree"
                    id="b_toll"
                    onChange={this.editBusinessHandle}
                    onKeyDown={this.handleNumericInput}
                    className="py-form__element__fluid"
                  />
                </div>
              </div>
              <div className="py-form-field py-form-field--inline">
                <label htmlFor="b_website" className="py-form-field__label"> Website  </label>
                <div className="py-form-field__element">
                  <Input autocomplete="nope"
                    type="text"
                    id="b_website"
                    value={communication.website}
                    name="website"
                    onChange={this.editBusinessHandle}
                    placeholder=""
                    className="py-form__element__fluid"
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="py-form-fieldset">
              <legend className="py-form-legend">Address</legend>
              <div className="py-form-field py-text--hint">
                <p>If you do business in one country but are based in another, choose the country where you file your taxes, or where your business is incorporated.</p>
              </div>
              <div className="py-form-field py-form-field--inline">
                <label htmlFor="addressLine1" className="py-form-field__label">Address Line 1</label>
                <div className="py-form-field__element">
                  {/* <Input autocomplete="nope"
                    type="text"
                    value={address.addressLine1}
                    name="addressLine1"
                    id="addressLine1"
                    onChange={this.editBusinessHandle}
                    className="py-form__element__fluid"
                  /> */}
                  <AddressAutoComplete
                    value={address}
                    restrictCountry={address.country && address.country.sortname ? address.country.sortname : 'us'}
                    isClass="py-form__element__fluid"
                    handleSet={(addrObj) => this.handleAutoComplete(addrObj)}
                  />
                </div>
              </div>
              <div className="py-form-field py-form-field--inline" >
                <label htmlFor="addressLine2" className="py-form-field__label">  Address Line 2</label>
                <div className="py-form-field__element">
                  <Input autocomplete="nope"
                    type="text"
                    value={address.addressLine2}
                    name="addressLine2"
                    id="addressLine2"
                    onChange={this.editBusinessHandle}
                    className="py-form__element__fluid"
                  />

                </div>
              </div>
              <div className="py-form-field py-form-field--inline">
                <label htmlFor="b_city" className="py-form-field__label"> City </label>
                <div className="py-form-field__element">
                  <Input autocomplete="nope"
                    type="text"
                    value={address.city}
                    name="city"
                    id="b_city"
                    onChange={this.editBusinessHandle}
                    className="py-form__element__fluid"
                  />
                </div>
              </div>

              <div className="py-form-field py-form-field--inline">
                <label htmlFor="b_country" className="py-form-field__label">Country<span className="text-danger">*</span> </label>
                <div className="py-form-field__element">
                  <SelectBox
                    id="b_country"
                    getOptionLabel={(value)=>(value["name"])}
                    getOptionValue={(value)=>(value["id"])}
                    isDisabled={true}
                    value={address.country}
                    onChange={e => this.editBusinessHandle(e, "country")}
                    options={countries}
                    clearable={false}
                  />
                </div>
              </div>
              <div className="py-form-field py-form-field--inline">
                <label htmlFor="time_zone" className="py-form-field__label">Time Zone</label>
                <div className="py-form-field__element">
                  <SelectBox
                    id="time_zone"
                    getOptionLabel={(value)=>(value["displayName"])}
                    getOptionValue={(value)=>(value["displayName"])}
                    value={businessInfo.timezone.displayName && businessInfo.timezone}
                    onChange={e => this.editBusinessHandle(e, "timezone")}
                    options={timeZoneList}
                    className="py-form__element__fluid"
                    clearable={false}
                    placeholder={'Select a time zone'}
                    menuPosition="fixed"
                    menuPlacement="bottom"
                  />
                </div>
              </div>

              <div className="py-form-field py-form-field--inline" >
                <label htmlFor="b_province" className="py-form-field__label"> Province/State </label>
                <div className="py-form-field__element">
                  <SelectBox
                    id="b_province"
                    getOptionLabel={(value)=>(value["name"])}
                    getOptionValue={(value)=>(value["id"])}
                    value={address.state}
                    onChange={e => this.editBusinessHandle(e, "state")}
                    options={stateList}
                    clearable={false}
                    menuPosition="fixed"
                    menuPlacement="bottom"
                  />
                </div>
              </div>

              <div className="py-form-field py-form-field--inline" >
                <label htmlFor="b_postal" className="py-form-field__label"> Postal/Zip Code </label>
                <div className="py-form-field__element" >
                  <Input autocomplete="nope"
                    type="zip"
                    id="b_postal"
                    value={address.postal}
                    name="postal"
                    minLength={2}
                    maxLength={10}
                    onChange={this.editBusinessHandle}
                    onKeyDown={this.handleNumericInput}
                    className="py-form__element__fluid"
                  />
                </div>
              </div>
            </fieldset>
          </Form>
        </ModalBody>

        <ModalFooter>
          <Button 
            color="primary"
            outline
            onClick={() => onClose(businessInfo)}
            >Close</Button>
          <Button
            color="primary"
            onClick={this.submitBusiness}
            disabled={btnLoad}
          >{btnLoad ? <Spinner size="sm" color="deault" /> : "Save"}</Button>
        </ModalFooter>
      </Modal>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    showSnackbar: (message, error) => {
      dispatch(openGlobalSnackbar(message, error));
    },
    setSelectedBussiness: (id, token, redirect) => {
      dispatch(setSelectedBussiness(id, token, redirect))
    }
  };
};

export default connect(
  null,
  mapDispatchToProps
)(BusinessPopup)