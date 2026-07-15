import _, { cloneDeep, find, isObject } from 'lodash'
import React, { Component, Fragment } from 'react';
import { connect } from "react-redux";
import { NavLink } from 'react-router-dom';
import { Form, FormText, Input, Label, Spinner, Button } from "reactstrap";
import SelectBox from "../../../../utils/formWrapper/SelectBox";
import { openGlobalSnackbar } from '../../../../actions/snackBarAction';
import {
  deleteBusinessById,
  fetchBusinessById,
  fetchBusinessCountries,
  updateCompany
} from '../../../../api/businessService';
import { fetchStatesByCountryId } from '../../../../api/CustomerServices';
import { _documentTitle, logout } from '../../../../utils/GlobalFunctions';
import { ArchiveConfirmation } from '../profile/components/ArchiveConfirmation';
import { businessObject } from './helper/businessObject';
import history from '../../../../customHistory';
import { setSelectedBussiness } from '../../../../actions/businessAction';
import FormValidationError from "../../../../global/FormValidationError";
import AddressAutoComplete from '../../../common/AddressAutoComplete'
import { _timeZoneMoment, _formatDate, _getAllTimeZone } from '../../../../utils/globalMomentDateFunc';

class EditBussinessInfo extends Component {

  state = {
    businessInfo: businessObject(),
    countries: [],
    stateList: [],
    shippingCountries: [],
    title: '',
    statesOptions: [],
    confrmArchv: false,
    btnLoad: false,
    archvLoad: false,
  };

  componentDidMount = async () => {
    const businessId = this.props.match.params.businessId;
    _documentTitle({}, "Edit Your Business");
    this.fetchBusinessDetail(businessId);
    this.fetchFormData()
  };

  fetchBusinessDetail = async (businessId) => {
    let response = await fetchBusinessById(businessId);
    if (response.data.business) {
      this.setState({ businessInfo: businessObject(response.data.business) });
      if (!!response.data.business.country) {
        let stateList = (await fetchStatesByCountryId(response.data.business.country.id)).states;
        this.setState({ stateList })
      }
    }
  };

  handleAutoComplete = async (data) => {
    if (data.state) {
      const states = this.state.stateList;
      if (!isObject(data.state)) {
        const stateObject = states.find(o => o.name == data.state)
        if (stateObject) {
          this.editBusinessHandle(stateObject, 'state');
        }
      }
    }
    if (!!data.postalCode) {
      this.editBusinessHandle({ target: { name: 'postal', value: data.postalCode } });
    }
    if (!!data.city) {
      this.editBusinessHandle({ target: { name: 'city', value: data.city } });
    }
    if (!!data.oneLine) {
      this.editBusinessHandle({ target: { name: 'addressLine1', value: data.addressLine1 } });
      this.editBusinessHandle({ target: { name: 'addressLine2', value: data.oneLine } });
    } else {
      this.editBusinessHandle({ target: { name: 'addressLine1', value: data.addressLine1 } });
    }
  }

  editBusinessHandle = async (event, fieldName) => {
    let updateValue = cloneDeep(this.state.businessInfo);
    // if (fieldName === "country") {
    //   let stateList = (await fetchStatesByCountryId(event.id)).states;
    //   // updateValue.address[fieldName] = await this.prepareCountryObj(event.id);
    //   updateValue.address.state = ''
    //   this.setState({ stateList: stateList })
    // } else
    if (fieldName === "state") {
      updateValue.address[fieldName] = event
    } else if (fieldName === "timezone") {
      updateValue[fieldName] = {
        name: event.value,
        offSet: parseInt(_formatDate(_timeZoneMoment(new Date, event.value), 'Z')),
        zoneAbbr: _formatDate(_timeZoneMoment(new Date, event.value), 'z')
      }
    } else {
      const { name, value } = event.target;
      if (["city", "postal", "addressLine1", "addressLine2"].includes(name)) {
        updateValue.address[name] = value
      } else if (["phone", "fax", "mobile", "tollFree"].includes(name)) {
        updateValue.communication[name] = value
      } else if (['website'].includes(name)) {
        updateValue.communication[name] = value
      } else {
        updateValue[name] = value
        if (name === 'organizationName') {
          if (!!value) {
            this.setState({ compErr: false })
          } else {
            this.setState({ compErr: true })
          }
        }

      }
    }
    this.setState({
      businessInfo: updateValue
    })
  };

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

  submitBusiness = async (e) => {
    e.preventDefault();
    let businessInfo = cloneDeep(this.state.businessInfo);
    const businessId = businessInfo._id;
    delete businessInfo._id;
    let payload = {
      businessInput: businessInfo
    };
    if (!businessInfo.organizationName) {
      const elem = document.getElementById('company_name');
      if (!!elem) {
        elem.focus()
      }
      this.setState({ compErr: true })
    } else {
      this.setState({ compErr: false })
    }
    // const businessId = this.props.match.params.businessId;
    if (!!businessInfo.organizationName) {
      try {
        this.setState({ btnLoad: true })
        const res = await updateCompany(businessId, payload);
        if (res.statusCode === 200) {
          if (!!businessInfo.isPrimary) {
            const refresh = localStorage.getItem('refreshToken')
            this.props.setSelectedBussiness(businessId, refresh, false)
          }
          this.setState({ btnLoad: false })
          this.props.showSnackbar(res.message, false)
          history.push(`/app/accounts/business`)
        } else {
          this.setState({ btnLoad: false })
          this.props.showSnackbar(res.message, true)
        }
      } catch (error) {
        this.setState({ btnLoad: false })
        this.props.showSnackbar(error.message, true)
      }
    }
  };

  fetchFormData = async () => {
    const countries = (await fetchBusinessCountries()).data.countries;
    this.setState({ countries })
  };

  _handleArchive = async (e) => {
    e.preventDefault();
    const businessId = this.props.match.params.businessId;
    let businessInfo = cloneDeep(this.state.businessInfo);
    try {
      this.setState({ archvLoad: true })
      const res = await deleteBusinessById(businessId);
      if (res.statusCode === 200) {
        this.props.showSnackbar(res.message, false);
        if(this.props.allBusinesses.length!==1){
          if (this.props.businessInfo._id !== businessId) {
            const refresh = localStorage.getItem('refreshToken')
            const selectedId = this.props.businessInfo._id === businessId ? null : this.props.businessInfo._id
            this.props.setSelectedBussiness(selectedId, refresh, true)
          } else {
            const primaryBusinessId = this.props.allBusinesses.find((business) => business.isPrimary)
            this.props.setSelectedBussiness(primaryBusinessId._id)
          }
        }else{
          logout()
        }


      } else {
        this.props.showSnackbar(res.message, true)
      }
      this.setState({ archvLoad: false })
    } catch (error) {
      this.props.showSnackbar(error.message, true)
      this.setState({ archvLoad: false })
    }
  };

  timeZoneList = () => {
    let listOfTimeZone = _getAllTimeZone();
    const list = listOfTimeZone.map(item => {
      return {
        label: item,
        value: item
      }
    });
    return list
  };

  render() {
    const { businessInfo, countries, stateList, confrmArchv, btnLoad, archvLoad } = this.state;
    const { communication, address, currency, isPrimary } = businessInfo;
    const { match: { params: { businessId } } } = this.props
    const timeZoneList = this.timeZoneList();
    let countryCode = ''
    if (countries && address.country) {
      const getC = countries.filter((country) => country.id == address.country.id);
      countryCode = getC && getC.length > 0 ? getC[0].sortname : '';
    }
    return (

      <div className="py-page__inner">
        <header className="py-header--page flex">
          <div className="py-header--title">
            <h4 className="py-heading--title d-flex align-items-center justify-content-start">
              {_.includes(this.props.location.pathname, 'account') ?
                <NavLink className="Icon Icon__M" to={`/app/accounts/business`}>
                  <svg className="Icon" viewBox="0 0 20 20" id="back" xmlns="http://www.w3.org/2000/svg"><path d="M13.813 16.187a1.15 1.15 0 0 1-1.626 1.626l-7-7a1.15 1.15 0 0 1 0-1.626l7-7a1.15 1.15 0 0 1 1.626 1.626L7.626 10l6.187 6.187z"></path></svg>
                </NavLink>
                : ""
              }
              Edit {businessInfo.organizationName}
            </h4>
          </div>
        </header>
        <Form className="py-form-field--condensed edit-profile-form-fields" autocomplete="off">

          <div className="row mx-n2 mb-2" >
            <div className="col-4 col-sm-4 text-right px-2" >
              <Label htmlFor="company_name" className="py-form-field__label is-required mt-2" id="link1">  Company name</Label>
            </div>
            <div className="col-8 col-sm-8 px-2" >
              <Input autocomplete="nope"
                type="text"
                id="company_name"
                value={businessInfo.organizationName}
                name="organizationName"
                onChange={this.editBusinessHandle}
              />
              <FormValidationError
                showError={this.state.compErr}
              />
            </div>
          </div>
          <div className="row mx-n2 mb-2" >
            <div className="col-4 col-sm-4 text-right px-2" >
              <Label htmlFor="addressLine1" className="py-form-field__label pt-2" id="link1">  Address line 1</Label>
            </div>
            <div className="col-8 col-sm-8 px-2" >
              {/* <Input autocomplete="nope"
                  type="text"
                  value={address.addressLine1}
                  name="addressLine1"
                  id="addressLine1"
                  onChange={this.editBusinessHandle}
                /> */}
              <AddressAutoComplete
                value={address}
                id="addressLine1"
                restrictCountry={countryCode}
                handleSet={(addrObj) => this.handleAutoComplete(addrObj)}
              />
            </div>
          </div>
          <div className="row mx-n2 mb-2" >
            <div className="col-4 col-sm-4 text-right px-2" >
              <Label htmlFor="addressLine2" className="py-form-field__label pt-2" id="link1">  Address line 2</Label>
            </div>
            <div className="col-8 col-sm-8 px-2" >
              <Input autocomplete="nope"
                type="text"
                value={address.addressLine2}
                name="addressLine2"
                id="addressLine2"
                onChange={this.editBusinessHandle}
              />
            </div>
          </div>
          <div className="row mx-n2 mb-2" >
            <div className="col-4 col-sm-4 text-right px-2" >
              <Label htmlFor="eb_city" className="py-form-field__label pt-2" id="link1"> City </Label>
            </div>
            <div className="col-8 col-sm-8 px-2" >
              <Input autocomplete="nope"
                type="text"
                value={address.city}
                name="city"
                id="eb_city"
                onChange={this.editBusinessHandle}
              />
            </div>
          </div>
          <div className="row mx-n2 mb-2" >
            <div className="col-4 col-sm-4 text-right px-2" >
              <Label htmlFor="eb_country" className="py-form-field__label is-required mt-2" id="link1"> Country</Label>
            </div>
            <div className="col-8 col-sm-8 px-2" >
              <SelectBox
                id="eb_country"
                value={address.country}
                getOptionLabel={(value)=>(value["name"])}
                getOptionValue={(value)=>(value["id"])}
                onChange={e => this.editBusinessHandle(e, "country")}
                placeholder="Select a country"
                options={countries}
                clearable={false}
                isDisabled
              />
              <FormText className="text-mute">
                If you do business in one country but are based in another, choose the country where you file your taxes,
                or where your business is incorporated.
                </FormText>
            </div>
          </div>
          <div className="row mx-n2 mb-2" >
            <div className="col-4 col-sm-4 text-right px-2" >
              <Label htmlFor="eb_province" className="py-form-field__label pt-2" id="link1">  Province/State </Label>
            </div>
            <div className="col-8 col-sm-8 px-2" >
              <SelectBox
                id="eb_province"
                getOptionLabel={(value)=>(value["name"])}
                getOptionValue={(value)=>(value["id"])}
                value={address.state}
                onChange={e => this.editBusinessHandle(e, "state")}
                options={stateList}
                placeholder="Select a province/state"
                clearable={false}
              />
            </div>
          </div>
          <div className="row mx-n2 mb-2" >
            <div className="col-4 col-sm-4 text-right px-2" >
              <Label htmlFor="eb_postal" className="py-form-field__label pt-2" id="link1">Postal/Zip code </Label>
            </div>
            <div className="col-8 col-sm-4 px-2" >
              <Input autocomplete="nope"
                type="zip"
                value={address.postal}
                name="postal"
                id="eb_postal"
                minLength={2}
                maxLength={10}
                onChange={this.editBusinessHandle}
                className="py-form__element__small"
              />
            </div>
          </div>
          <div className="row mx-n2 mb-2" >
            <div className="col-4 col-sm-4 text-right px-2" >
              <Label htmlFor="time_zone" className="py-form-field__label pt-2" id="link1">Time Zone</Label>
            </div>
            <div className="col-8 col-sm-4 px-2" >
              <SelectBox
                onChange={e => this.editBusinessHandle(e, "timezone")}
                options={timeZoneList}
                getOptionLabel={(value)=>(value["label"])}
                getOptionValue={(value)=>(value["value"])}
                value={{value: businessInfo.timezone.name, label: businessInfo.timezone.name}}
                clearable={false}
                id="time_zone"
                placeholder="Select a time zone"
              />
            </div>
          </div>
          <div className="row mx-n2 mb-2" >
            <div className="col-4 col-sm-4 text-right px-2" >
              <Label htmlFor="eb_phone" className="py-form-field__label pt-2" id="link1"> Phone </Label>
            </div>
            <div className="col-8 col-sm-4 px-2" >
              <Input autocomplete="nope"
                type="text"
                value={communication.phone}
                name="phone"
                id="eb_phone"
                onChange={this.editBusinessHandle}
                className="py-form__element__small"
              />
            </div>
          </div>
          <div className="row mx-n2 mb-2" >
            <div className="col-4 col-sm-4 text-right px-2" >
              <Label htmlFor="eb_fax" className="py-form-field__label pt-2" id="link1">Fax</Label>
            </div>
            <div className="col-8 col-sm-4 px-2" >
              <Input autocomplete="nope"
                type="text"
                value={communication.fax}
                name="fax"
                id="eb_fax"
                onChange={this.editBusinessHandle}
                className="py-form__element__small"
              />
            </div>
          </div>
          <div className="row mx-n2 mb-2" >
            <div className="col-4 col-sm-4 text-right px-2" >
              <Label htmlFor="eb_mobile" className="py-form-field__label pt-2" id="link1"> Mobile </Label>
            </div>
            <div className="col-8 col-sm-4 px-2" >
              <Input autocomplete="nope"
                type="text"
                value={communication.mobile}
                name="mobile"
                id="eb_mobile"
                onChange={this.editBusinessHandle}
                className="py-form__element__small"
              />
            </div>
          </div>
          <div className="row mx-n2 mb-2" >
            <div className="col-4 col-sm-4 text-right px-2" >
              <Label htmlFor="eb_toll" className="py-form-field__label pt-2" id="link1"> Toll-Free </Label>
            </div>
            <div className="col-8 col-sm-4 px-2" >
              <Input autocomplete="nope"
                type="text"
                id="eb_toll"
                value={communication.tollFree}
                name="tollFree"
                className="py-form__element__small"
                onChange={this.editBusinessHandle}
              />
            </div>
          </div>
          <div className="row mx-n2 mb-2" >
            <div className="col-4 col-sm-4 text-right px-2" >
              <Label htmlFor="eb_website" className="py-form-field__label pt-2" id="link1">Website</Label>
            </div>
            <div className="col-8 col-sm-4 px-2" >
              <Input autocomplete="nope"
                type="text"
                value={communication.website}
                name="website"
                id="eb_website"
                onChange={this.editBusinessHandle}
                placeholder=""
              />
            </div>
          </div>
          <div className="row mx-n2 mb-2" >
            <div className="col-4 col-sm-4 text-right px-2" >
              <Label htmlFor="eb_website" className="py-form-field__label pt-2" id="link1">Affiliate Link</Label>
            </div>
            <div className="col-8 col-sm-4 px-2" >
              <Input autocomplete="nope"
                type="text"
                value={businessInfo.affiliateRef}
                name="affiliateRef"
                id="eb_affiliate"
                onChange={this.editBusinessHandle}
                placeholder=""
              />
            </div>
          </div>
          <div className="row mx-n2 mb-3" >
            <div className="col-4 col-sm-4 text-right px-2" >
              <Label id="link1" className="py-form-field__label pt-0">Currency</Label>
            </div>
            <div className="col-8 col-sm-8 px-2" >
              <span className="py-text m-0">{`${currency && currency.code} - ${currency && currency.name}`}</span>
              <FormText>
                This is your reporting currency and cannot be changed. You can still send invoices,
                track expenses and enter transactions in any currency and an exchange rate is applied for you.
                {/* <a className="Link__External" href="javascript: void(0)" > Learn more</a> */}
              </FormText>
            </div>
          </div>
          <div className="row mx-n2 mb-2" >
            <div className="col-4 col-sm-4 text-right px-2" ></div>
            <div className="col-8 col-sm-8 px-2" >
              <Button onClick={this.submitBusiness} color="primary"
                disabled={btnLoad}
              >{btnLoad ? <Spinner color="default" size="sm" /> : 'Save'}</Button>
            </div>
          </div>
          {
            !isPrimary && (
              <Fragment>
                <hr />
                <h3 className="py-heading--section-title">Archive This Business</h3>
                {
                  confrmArchv ?
                    (<ArchiveConfirmation archieve={this._handleArchive.bind(this)} load={archvLoad} closeConfrm={() => this.setState({ confrmArchv: false })} />)
                    : (
                      <div>
                        <p>
                          This will hide <span className="py-text--strong">{businessInfo.organizationName}</span> from every menu and you will no longer be able to access it. You can always restore this business later.
                        </p>
                        <Button color="danger" outline onClick={() => this.setState({ confrmArchv: true })}>Archive {businessInfo.organizationName}</Button>
                      </div>
                    )
                }
              </Fragment>
            )
          }
        </Form>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    businessInfo: state.businessReducer.selectedBusiness,
    allBusinesses: state.businessReducer.business
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
  mapStateToProps,
  mapDispatchToProps
)(EditBussinessInfo)
