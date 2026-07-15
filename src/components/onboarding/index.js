import BusinessService from '../../api/businessService'
import history from '../../customHistory'
import { cloneDeep, find } from 'lodash';
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux'
import { NavLink, withRouter } from 'react-router-dom'
import { Container, Form, FormGroup, Input, Label, Row, Spinner, Button } from 'reactstrap';
import { bindActionCreators } from 'redux'
import * as BusinessAction from "../../actions/businessAction";
import { BUSINESS_TYPE, ORGANIZATION_TYPE } from '../../constants/businessConst';
import { getIp, getLocationIP } from '../../api/ipInfo'
import { _getUser } from '../../utils/authFunctions';
import FormValidationError from '../../global/FormValidationError';
import SelectBox from '../../utils/formWrapper/SelectBox';
import { openGlobalSnackbar } from "../../actions/snackBarAction";
import { Helmet } from 'react-helmet'
import { getLogoURL } from '../../utils/GlobalFunctions';
import { getBusinessMcc } from '../../actions/utilityAction';
import SnakeBar from '../../global/SnakeBar'
import anime1Png from "../../assets/images/anime/anime-1.png"
import anime2Png from "../../assets/images/anime/anime-2.png"
import anime3Png from "../../assets/images/anime/anime-3.png"
import anime4Png from "../../assets/images/anime/anime-4.png"
import anime5Png from "../../assets/images/anime/anime-5.png"
import anime6Png from "../../assets/images/anime/anime-6.png"
import anime7Png from "../../assets/images/anime/anime-7.png"
import anime8Png from "../../assets/images/anime/anime-8.png"
import Main_Logo from "../../assets/logo/finance-logo.png"
class Onboarding extends PureComponent {
  state = {
    errors: {},
    countries: [],
    currencies: [],
    subTypeList: [],
    addBusiness: {
      organizationName: "",
      organizationType: '',
      country: {
        name: '',
        id: ''
      },
      currency: {
        code: '',
        name: '',
        symbol: '',
        displayName: ''
      },
      businessType: '',
      businessSubType: ''
    },
    showCurrency: false,
    btnLoad: false,
    isLoading: true,
    businessCategories: [],
  };
  countries = [];
  currencies = [];

  componentDidMount() {
    document.title = "Finance - Register";
    const authToken = localStorage.getItem("token");
    if (!authToken) {
      history.push('/signin');
      window.location.reload(true);
      return
    } else {
      const userData = _getUser(authToken)
      if (!!userData.businessIds && userData.businessIds.length > 0) {
        this.props.actions.setSelectedBussiness(userData.businessIds[0], authToken)
        history.push('/app/dashboard')
      } else {
        this.fetchFormData()
        this.props.getBusinessMcc();
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (
      JSON.stringify(this.props.getAllMCC.data) !== JSON.stringify(prevProps.getAllMCC.data) &&
      this.props.getAllMCC.data
    ) {
      this.setState({ businessCategories: this.props.getAllMCC.data });
    }
  }

  fetchFormData = async () => {
    let updateBusiness = cloneDeep(this.state.addBusiness);
    const loc = await getLocationIP();
    const countriesAndCurrency = await BusinessService.fetchBusinessCountries();
    this.setState({ businessCategories: this.props.getAllMCC.data });
    const currencies = await this.currenciesList(
      countriesAndCurrency.data.countries
    );

    let country = countriesAndCurrency.data.countries.filter(item => {
      if (!!loc && !!loc.country_code) {
        return item.sortname === loc.country_code
      } else {
        return item.sortname === 'US'
      }
    })

    this.setState({
      countries: countriesAndCurrency.data.countries,
      currencies: currencies,
      showCurrency: false,
      isLoading: false,
      addBusiness: {
        ...updateBusiness,
        country: {
          name: country[0].name,
          id: country[0].id
        },
        currency: { ...country[0].currencies[0] }
      }
    });
  };

  currenciesList = (countries) => {
    let currencies = [];
    countries.forEach(element => {
      const currObj = element.currencies[0];
      currencies.push(currObj)
    });
    return currencies
  };


  // handleText = (event) => {
  //   const { name, value } = event.target;
  //   let updateBusiness = cloneDeep(this.state.addBusiness);
  //   let subTypeList = cloneDeep(this.state.subTypeList);
  //   if (name === 'businessType') {

  //     // updateBusiness.businessSubType = '';
  //     // let data = BUSINESS_TYPE;
  //     // const selectedType = data.filter(item => {
  //     //   if (item.value === value) {
  //     //     return item
  //     //   }
  //     // });
  //     // subTypeList = selectedType[0].options;
  //     // updateBusiness.businessSubType = subTypeList[0].value;
  //     updateBusiness[name] = value
  //   } else if (name === 'country') {
  //     updateBusiness['currency'] = this.mapCurrencyWithCountry(value);
  //     updateBusiness[name] = this.prepareCountryObj(value);
  //   } else if (name === 'currency') {
  //     updateBusiness['currency'] = value
  //   } else {
  //     updateBusiness[name] = value
  //   }
  //   this.setState({ addBusiness: updateBusiness, subTypeList, errors: {} })
  // };
handleText = (event) => {
  const { name, value } = event.target;
  let cleanedValue = value;

  const noSpaceFields = ["organizationName", "businessName"];

  if (noSpaceFields.includes(name)) {
    cleanedValue = cleanedValue.replace(/\s+/g, "");
  }

  if (name === "organizationName") {
    cleanedValue = cleanedValue.replace(/[^a-zA-Z0-9]/g, "");

    // prevent numeric-only values
    if (/^\d+$/.test(cleanedValue)) {
      cleanedValue = "";
      this.setState(prev => ({
        errors: {
          ...prev.errors,
          cmpnyErr: "Company name cannot be only numbers."
        }
      }));
    } else {
      this.setState(prev => ({
        errors: {
          ...prev.errors,
          cmpnyErr: ""
        }
      }));
    }
  }

  this.setState(prev => ({
    addBusiness: {
      ...prev.addBusiness,
      [name]: cleanedValue
    }
  }));

  let updateBusiness = cloneDeep(this.state.addBusiness);
  let subTypeList = cloneDeep(this.state.subTypeList);

  if (name === "businessType") {
    updateBusiness[name] = cleanedValue;
  } else if (name === "country") {
    updateBusiness["currency"] = this.mapCurrencyWithCountry(cleanedValue);
    updateBusiness[name] = this.prepareCountryObj(cleanedValue);
  } else if (name === "currency") {
    updateBusiness["currency"] = cleanedValue;
  } else {
    updateBusiness[name] = cleanedValue;
  }

  this.setState(prev => ({
    addBusiness: updateBusiness,
    subTypeList,
    errors: {
      ...prev.errors,
      [name]: ""
    }
  }));
};


  prepareCountryObj = id => {
    const { countries } = this.state;
    const countryObject = find(countries, { 'id': parseInt(id) });
    let countryObj = {
      name: countryObject.name,
      id: countryObject.id
    };
    return countryObj;
  };

  mapCurrencyWithCountry = id => {
    const { countries } = this.state;
    const countryObj = find(countries, { 'id': parseInt(id) });
    return countryObj.currencies[0];
  };
  updateError = (key, value) => {
    this.setState(prevState => ({
      ...prevState, errors: {
        ...prevState.errors,
        [key]: value
      }
    }));
  }

  validateForm = (data) => {
    let errors = true;
    if (!data.organizationName) {
      errors = false;
      this.updateError('cmpnyErr', true)
    }
    if (!data.businessType) {
      errors = false;
      this.updateError('btypeErr', true)
    }
    // if (!data.businessSubType) {
    //   errors = false;
    //   this.updateError('stypeErr', true)
    // }
    if (!data.organizationType) {
      errors = false;
      this.updateError('otypeErr', true)
    }
    if (this.state.showCurrency) {
      if (!data.country || (data.country && !data.country.id)) {
        errors = false;
        this.updateError('countryErr', true)
      }
      if (!data.currency || (data.currency && !data.currency.name)) {
        errors = false;
        this.updateError('currencyErr', true)
      }
    }


    return errors;
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const { addBusiness } = this.state
      if (this.validateForm(addBusiness)) {
        let payload = {
          businessInput: addBusiness
        };
        this.setState({ btnLoad: true })
        const response = await BusinessService.addCompany(payload);
        if (response.statusCode === 201) {
          if (!!response.data) {
            localStorage.setItem('businessId', response.data.business._id)
            const { search } = this.props.location
            const url = search.includes('planType') ? `/subscription${search}` : '/subscription'
            history.push(url)
            this.setState({ btnLoad: false })
          } else {
            this.props.showSnackbar('Business created successfully', false);
            this.setState({ btnLoad: false })
          }
        }
      }
    } catch (error) {
      this.setState({ btnLoad: false })
      if (!!error) {
        this.props.showSnackbar(error.message || error.data.message, true);
      } else {
        this.props.showSnackbar('Something went wrong, please try again in some time.', true);
      }
    }
  };

  _clearLocal(e) {
    const basicAuthToken = localStorage.getItem('basicAuthToken')
    localStorage.clear();
    localStorage.setItem('basicAuthToken', basicAuthToken)
  }

  render() {
    const { organizationName, organizationType, country,
      currency, businessSubType, businessType
    } = this.state.addBusiness;
    const { countries, businessCategories, subTypeList, showCurrency, btnLoad, errors, currencies, isLoading } = this.state;
    return (
      <div className="py-page__auth">
        <Helmet>
          <meta charSet="utf-8" />
          <title>Finance - Onboarding</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Helmet>
        {/* Animation-Content */}
        <div className="anime-content" >
          <div className="anime-item one"><img src={anime1Png} alt="Animation" /> </div>
          <div className="anime-item two"><img src={anime2Png} alt="Animation" /> </div>
          <div className="anime-item three"><img src={anime3Png} alt="Animation" /> </div>
          <div className="anime-item four"><img src={anime4Png} alt="Animation" /> </div>
          <div className="anime-item five"><img src={anime5Png} alt="Animation" /> </div>
          <div className="anime-item six"><img src={anime6Png} alt="Animation" /> </div>
          <div className="anime-item seven"><img src={anime7Png} alt="Animation" /> </div>
          <div className="anime-item eight"><img src={anime8Png} alt="Animation" /> </div>
        </div>


        <div className="row no-gutters d-flex align-items-center my-auto">
          <SnakeBar isAuth={false} />
          <div className="col-lg-8 col-xl-6 col-md-12 d-flex flex-column align-items-center justify-content-center log-form-box" >
            {/* Finance Logo At Header */}
            <div className="text-center mb-5 mt-5" >
              <a href={`${process.env.REACT_APP_ROOT_URL}`} className="step-logo"><img src={Main_Logo} alt="Paymynt" /></a>
            </div>
            <div className="py-page__login mb-5">
              {/* Form Heading Title */}
              <div className="row mx-n2">
                <div className="col-sm-12 mb-3 mb-lg-4 pb-1 px-2">
                  <h1 className="py-heading--title mb-0">About your business</h1>
                </div>
              </div>
              <div style={{ minHeight: '400px', position: 'relative' }}>
                {isLoading ? (
                  <div className="d-flex justify-content-center align-items-center"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0
                    }}
                  >
                    <Spinner color="primary" size={"md"} className="loader" />
                  </div>
                ) : (<Form className="login-form" role="form" onSubmit={this.handleSubmit}>
                  <div className="row mx-Int32Array">
                    <div className="col-sm-12 px-3 mb-3">
                      <div className="icon-input" >
                        <Label for="organizationName" className="label is-required" >Company name</Label>
                        <Input
                          onChange={this.handleText}
                          type="text"
                          className="ps-3"
                          placeholder="Company name"
                          name="organizationName"
                          id="organizationName"
                          value={organizationName}
                        />
                        <FormValidationError showError={errors.cmpnyErr} />
                      </div>
                    </div>
                    <div className="col-sm-12 px-3 mb-3">
                      <div className="icon-input">
                        <Label for="businessType" className="label is-required" >Type of business</Label>
                        <SelectBox
                          getOptionLabel={(value) => (value["type"])}
                          getOptionValue={(value) => (value["mcc"])}
                          placeholder="Type of business"
                          className="py-form__element__fluid"
                          name="businessType"
                          id="businessType"
                          isOptionSelected={(value) => value["mcc"] === businessType}
                          onChange={(e) => this.handleText({ target: { value: e ? e.mcc : '', name: 'businessType' } })}
                          options={businessCategories}
                          clearable={false}
                        />
                        <FormValidationError showError={errors.btypeErr} />
                      </div>
                    </div>
                  </div>
                  {businessType != '' &&
                    <div className="row mx-n3 d-none">
                      <div className="col-sm-12 px-3 mb-3">
                        <div className="icon-input">
                          <Label for="businessSubType" className="label is-required" >Subtype</Label>
                          <SelectBox
                            getOptionLabel={(value) => (value["label"])}
                            getOptionValue={(value) => (value["value"])}
                            placeholder=""
                            className="py-form__element__fluid"
                            name="businessSubType"
                            id="businessSubType"
                            isOptionSelected={(value) => (value["value"] === businessSubType)}
                            onChange={(e) => this.handleText({ target: { value: e.value, name: 'businessSubType' } })}
                            options={subTypeList}
                            clearable={false}
                          />
                          <FormValidationError showError={errors.stypeErr} />
                        </div>
                      </div>
                    </div>
                  }
                  {showCurrency && (
                    <Fragment>
                      <div className="row mx-n3">
                        <div className="col-sm-12 px-3 mb-3">
                          <div className="icon-input">
                            <Label className="label is-required" for="country">Country</Label>
                            <SelectBox
                              getOptionLabel={(value) => (value["name"])}
                              getOptionValue={(value) => (value["id"])}
                              placeholder="Country"
                              className="py-form__element__fluid"
                              name="country"
                              id="country"
                              value={country ? country : ''}
                              onChange={(e) => this.handleText({ target: { value: e.id, name: 'country' } })}
                              options={countries}
                              clearable={false}
                            />
                            <FormValidationError showError={errors.countryErr} />
                          </div>
                        </div>
                      </div>
                      <div className="row mx-n2">
                        <div className="col-sm-12 px-3 mb-3">
                          <div className="icon-input">
                            <Label className="label is-required" for="currency">Business Currency</Label>
                            <SelectBox
                              placeholder="Business currency"
                              className="py-form__element__fluid"
                              getOptionLabel={(value) => (value["displayName"])}
                              isDisabled
                              name="currency"
                              id="currency"
                              value={currency.code ? currency : ''}
                              onChange={(e) => this.handleText({ target: { value: e, name: 'currency' } })}
                              options={currencies}
                              clearable={false}
                            />
                            <FormValidationError showError={errors.currencyErr} />
                          </div>
                        </div>
                      </div>
                    </Fragment>
                  )
                  }
                  <div className="row mx-n2 mb-3">
                    <div className="col-sm-12 px-3">
                      <div className="icon-input" >
                        <Label className="py-form-field__label is-required" for="organizationType">Type of entity</Label>
                        <SelectBox
                          getOptionLabel={(value) => (value["label"])}
                          getOptionValue={(value) => (value["value"])}
                          placeholder="Type of entity"
                          className="py-form__element__fluid"
                          name="organizationType"
                          id="organizationType"
                          isOptionSelected={(value) => (value["value"] === organizationType)}
                          onChange={(e) => this.handleText({ target: { value: e.value, name: 'organizationType' } })}
                          options={ORGANIZATION_TYPE}
                          clearable={false}
                        />
                        <FormValidationError showError={errors.otypeErr} />
                      </div>
                    </div>
                  </div>
                  {!showCurrency && country.name &&
                    <div className="row mx-n2 mt-n2 mb-4">
                      <div className="col-sm-12 px-3">
                        <div className="py-text mt-0 text-left">Looks like your business is in <b>{country.name}</b> and you do business in <b>{currency.displayName}</b>. <a href="javascript: void(0)" onClick={() => this.setState({ showCurrency: true })}>Change this</a>. </div>
                      </div>
                    </div>
                  }
                  <div className="row mx-n2">
                    <div className="col-sm-12 px-3">
                      <div className="ajax-button">
                        <div className="fal fa-check btn-status text-success success"></div>
                        <div className="fal fa-times btn-status text-danger failed"></div>
                        <Button type="submit" block color="primary" className="btn-sq" disabled={btnLoad} >{btnLoad ? <Spinner size="sm" color="default" /> : 'Get started'}</Button>
                        <span className="py-text mt-4 pt-2">Want to use different account? <NavLink to='/signin' onClick={() => {
                          const basicAuthToken = localStorage.getItem('basicAuthToken')
                          localStorage.clear();
                          localStorage.setItem('basicAuthToken', basicAuthToken)
                        }}>Sign In</NavLink></span>
                      </div>
                    </div>
                  </div>
                </Form>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    getAllMCC: state.getAllMCC,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators(BusinessAction, dispatch),
    showSnackbar: (message, error) => {
      dispatch(openGlobalSnackbar(message, error))
    },
    getBusinessMcc: () => { dispatch(getBusinessMcc()) },
  };
};


export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Onboarding)
);
