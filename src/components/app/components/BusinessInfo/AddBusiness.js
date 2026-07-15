import BusinessService from "../../../../api/businessService";
import history from "../../../../customHistory";

import { cloneDeep, find } from "lodash";
import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Button, Form, Input, Label, Spinner } from "reactstrap";
import { bindActionCreators } from "redux";
import SelectBox from "../../../../utils/formWrapper/SelectBox";
import * as BusinessAction from "../../../../actions/businessAction";
import { openGlobalSnackbar } from "../../../../actions/snackBarAction";
import { createCustomerAndSubscription } from '../../../../api/subscriptionService'
import { getPlans } from '../../../../api/plansService'
import { BUSINESS_TYPE, ORGANIZATION_TYPE } from "../../../../constants/businessConst";
import FormValidationError from "../../../../global/FormValidationError";
import { getBusinessMcc } from '../../../../actions/utilityAction';
import APPCONFIG from '../../../../constants/Config';
import { resetProviderData } from "../../../../actions/paymentAction";
import { getActiveSubscriptionPlan } from "../../../../actions/subscriptionActions";

class AddBusiness extends PureComponent {
  state = {
    countries: [],
    currencies: [],
    subTypeList: [],
    addBusiness: {
      organizationName: "",
      organizationType: "",
      country: {
        name: "",
        id: ""
      },
      currency: {
        code: "",
        name: "",
        symbol: "",
        displayName: ""
      },
      businessType: "",
      businessSubType: "",
    },
    loading: false,
    compNameErr: false,
    businessTypeErr: false,
    organizationTypeErr: false,
    countryErr: false,
    currenciesErr: false,
    businessCategories: [],
  };
  countries = [];
  currencies = [];

  componentDidMount() {
    document.title = "Finance - Add Business";
    const authToken = localStorage.getItem("token");
    if (!authToken) {
      history.push("/signin");
      window.location.reload(true);
      return;
    }
    this.fetchFormData();
    this.props.getBusinessMcc();
  }

  componentWillUpdate(prevProps) {
    if (this.props !== prevProps) {
      this.fetchFormData();
    }
    if (JSON.stringify(this.props.getAllMCC.data) !== JSON.stringify(prevProps.getAllMCC.data) && this.props.getAllMCC.data) {
      this.setState({ businessCategories: this.props.getAllMCC.data });
    }
  }

  fetchFormData = async () => {
    const countriesAndCurrency = await BusinessService.fetchBusinessCountries();
    const currencies = await this.currenciesList(countriesAndCurrency.data.countries);
    this.setState({ businessCategories : this.props.getAllMCC.data })
    this.setState({ countries: countriesAndCurrency.data.countries });
    this.setState({ currencies: currencies });
  };

  currenciesList = (countries) => {
    let currencies = [];
    countries.forEach(element => {
      const currObj = element.currencies[0];
      currencies.push(currObj)
    });
    return currencies
  };

  handleText = (event, fieldName) => {
    let updateBusiness = cloneDeep(this.state.addBusiness);
    let subTypeList = cloneDeep(this.state.subTypeList);
    if (fieldName === 'currencies') {
      updateBusiness["currency"] = event;
      if (!!event) {
        this.setState({ [`${fieldName}Err`]: false })
      }
      else {
        this.setState({ [`${fieldName}Err`]: true })
      }
      // this.setState({[`${fieldName}Err`]: false})
    } else {
      const { name, id, value } = event.target;
      if (name === "businessType") {
        // updateBusiness.businessSubType = "";
        // let data = BUSINESS_TYPE;
        // const selectedType = data.filter(item => {
        //   if (item.value === value.value) {
        //     return item;
        //   }
        // });
        // subTypeList = selectedType[0].options;
        // updateBusiness.businessSubType = subTypeList[0].value;
        updateBusiness[name] = value;
        if (!!value) {
          this.setState({ [`${name}Err`]: false })
        }
        else {
          this.setState({ [`${name}Err`]: true })
        }
      } else if (name === "country") {
        updateBusiness["currency"] = this.mapCurrencyWithCountry(value.id);
        updateBusiness[name] = this.prepareCountryObj(value.id);
        this.setState({ [`${name}Err`]: false })
        this.setState({ [`${'currencies'}Err`]: false })
      } else if (name === "currency") {
        updateBusiness["currency"] = updateBusiness.currency;
        if (!!updateBusiness.currency) {
          this.setState({ [`${'currencies'}Err`]: false })
        }
        else {
          this.setState({ [`${'currencies'}Err`]: false })
        }
      } else if (name === "businessSubType") {
        updateBusiness[name] = value.value;
        if (!!value.value) {
          this.setState({ [`${name}Err`]: false })
        }
        else {
          this.setState({ [`${name}Err`]: true })
        }
      } else if (name === "organizationType") {
        updateBusiness[name] = value.value;
        if (!!value.value) {
          this.setState({ [`${name}Err`]: false })
        }
        else {
          this.setState({ [`${name}Err`]: true })
        }
      } else {
        updateBusiness[name] = value;
        if (!!value) {
          this.setState({ [`${id}Err`]: false })
        } else {
          this.setState({ [`${id}Err`]: true })
        }
      }
    }
    this.setState({ addBusiness: updateBusiness, subTypeList });
  };

  prepareCountryObj = id => {
    const { countries } = this.state;
    const countryObject = find(countries, { id: parseInt(id) });
    let countryObj = {
      name: countryObject.name,
      id: countryObject.id
    };
    return countryObj;
  };

  mapCurrencyWithCountry = id => {
    const { countries } = this.state;
    const currencyObject = find(countries, { id: parseInt(id) });
    return currencyObject.currencies[0];
  };

  handleSubmit = async event => {
    event.preventDefault();
    let payload = {
      businessInput: this.state.addBusiness
    };
    const { organizationName, organizationType, businessType, country, currency, businessSubType } = this.state.addBusiness;
    if (!!organizationName) {
      this.setState({ compNameErr: false })
    } else {
      const elem = document.getElementById('compName')
      if (!!elem) {
        elem.focus()
      }
      this.setState({ compNameErr: true })
    }
    if (!!businessType) {
      this.setState({ businessTypeErr: false })
    } else {
      const elem = document.getElementById('businessType')
      if (!!elem) {
        elem.focus()
      }
      this.setState({ businessTypeErr: true })
    }
    // if (!!businessSubType) {
    //   this.setState({ businessSubTypeErr: false })
    // } else {
    //   const elem = document.getElementById('businessSubType')
    //   if (!!elem) {
    //     elem.focus()
    //   }
    //   this.setState({ businessSubTypeErr: true })
    // }
    if (!!organizationType) {
      this.setState({ organizationTypeErr: false })
    } else {
      const elem = document.getElementById('organizationType')
      if (!!elem) {
        elem.focus()
      }
      this.setState({ organizationTypeErr: true })
    }
    if (!!country.id) {
      this.setState({ countryErr: false })
    } else {
      const elem = document.getElementById('country')
      if (!!elem) {
        elem.focus()
      }
      this.setState({ countryErr: true })
    }
    if (!!currency.code) {
      this.setState({ currenciesErr: false })
    } else {
      const elem = document.getElementById('currency')
      if (!!elem) {
        elem.focus()
      }
      this.setState({ currenciesErr: true })
    }
    if (!!organizationName && !!organizationType && businessType && !!country.id && !!currency.code) {
      try {
        this.setState({ loading: true });
        const response = await BusinessService.addCompany(payload);
        if (response.statusCode === 201) {
          this.props.resetProviderData();
          await this.props.actions.setSelectedBussiness(response.data.business._id, false);
          this.props.getActiveSubscriptionPlan();
          this.props.openGlobalSnackbar(response.message, false);
          this.setState({ loading: false });
          history.push(`/app/accounts/business`)
        }
      } catch (error) {
        this.setState({ loading: false });
        this.props.openGlobalSnackbar(error.message, true);
      }
    }
  };

  render() {

    const {
      organizationName,
      organizationType,
      country,
      currency,
      businessSubType,
      businessType,
    } = this.state.addBusiness;
    const { countries, businessCategories, subTypeList, currencies, compNameErr, businessTypeErr, businessSubTypeErr, organizationTypeErr, countryErr, currenciesErr } = this.state;
    return (
      <div className="content-wrapper__main__fixed content-wrapper__small">
        <header className="py-header--page flex">
          <div className="py-header--title">
            <div className="py-heading--title">Create a business</div>
          </div>
        </header>
        <Form
          className="py-form--vertical m-0"
          role="form"
          onSubmit={this.handleSubmit}
        >

          <div className="py-box py-box--xlarge">
            <div className="py-form-field">
              <Label
                className="py-form-field__label is-required"
                htmlFor="compName">
                Company name
              </Label>

              <div className="py-form-field__element">
                <Input
                  onChange={this.handleText}
                  className="py-form__element__fluid"
                  type="text"
                  name="organizationName"
                  id="compName"
                  value={organizationName}
                />
                <FormValidationError
                  showError={compNameErr}
                />
              </div>
            </div>
            <div className="py-form-field">
              <Label
                className="py-form-field__label is-required"
                htmlFor="businessType"
              >
                Type of business
              </Label>
              <div className="py-form-field__element">
                <div className="py-select--native  py-form__element__fluid">
                  <SelectBox
                    id='businessType'
                    getOptionValue={(value)=>(value["mcc"])}
                    getOptionLabel={(value)=>(value["type"])}
                    isOptionSelected={(value) => value["value"] === businessType}
                    defaultValue={organizationType ? {value: businessType} : null}
                    onChange={e => this.handleText({ ...e, target: { ...e.target, name: 'businessType', value: e ? e.mcc : '' } })}
                    placeholder="Select a type of business"
                    options={businessCategories || []}
                    clearable={false}
                  />
                  <FormValidationError
                    showError={businessTypeErr}
                  />
                </div>
                <p className="py-text--hint pt-2"> This helps Finance display the right accounts, saving you time. Choose the option that best represents your business.</p>

              </div>
            </div>
            {businessType != "" && (
              <div className="py-form-field d-none">
                <div className="col-sm-3" />
                <div className="py-form-field__element">
                  <div className="py-select--native  py-form__element__fluid">
                    <SelectBox
                      value={!!businessSubType ? businessSubType : ''}
                      id={'businessSubType'}
                      getOptionValue={(value)=>(value["value"])}
                      getOptionLabel={(value)=>(value["label"])}
                      onChange={e => {
                        this.handleText({ ...e, target: { ...e.target, name: 'businessSubType', value: e } })
                      }}
                      placeholder="Select a business sub type"
                      options={subTypeList.length > 0 ? subTypeList : []}
                      clearable={false}
                    />
                    <FormValidationError
                      showError={businessSubTypeErr}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="py-form-field">
              <Label
                className="py-form-field__label is-required"
                htmlFor="organizationType"
              >
                Type of entity
              </Label>
              <div className="py-form-field__element">

                <div className="py-select--native  py-form__element__fluid">
                  <SelectBox
                    isOptionSelected={(value) => value["value"] === organizationType}
                    defaultValue={organizationType ? {value: organizationType} : null}
                    id={'organizationType'}
                    getOptionLabel={(value)=>(value["label"])}
                    getOptionValue={(value)=>(value["value"])}
                    onChange={e => this.handleText({ ...e, target: { ...e.target, name: 'organizationType', value: e } })}
                    placeholder="Select a type of entity"
                    options={ORGANIZATION_TYPE}
                    clearable={false}
                  />
                  <FormValidationError
                    showError={organizationTypeErr}
                  />
                </div>
                <p className="py-text--hint pt-2" >Choose Sole Proprietor if you have not incorporated (and do not plan to), and are not in partnership with anyone else.</p>
              </div>
            </div>
            <div className="py-form-field">
              <Label
                className="py-form-field__label is-required"
                htmlFor="country"
              >
                Country
              </Label>

              <div className="py-form-field__element">
                <div className="py-select--native py-form__element__fluid">
                  <SelectBox
                    value={country}
                    id={'country'}
                    getOptionLabel={(value)=>(value["name"])}
                    getOptionValue={(value)=>(value["id"])}
                    onChange={e => this.handleText({ ...e, target: { ...e.target, name: 'country', value: e } })}
                    placeholder="Select a country"
                    options={countries}
                    clearable={false}
                    autoComplete={"country"}
                    isSearchable={true}
                  />
                  <FormValidationError
                    showError={countryErr}
                  />
                </div>
                <p className="py-text--hint pt-2" >If you do business in one country but are based in another, choose the country where you file your taxes, or where your business is incorporated.</p>
              </div>
            </div>
            <div className="py-form-field">
              <Label
                className="py-form-field__label is-required"
                htmlFor="currency"
              >Business currency</Label>

              <div className="py-form-field__element">
                <SelectBox
                  options={currencies}
                  value={!!currency && !!currency.code ? currency : ''}
                  id="currency"
                  getOptionLabel={(value)=>(value["displayName"])}
                  onChange={e => this.handleText(e, 'currencies')}
                  placeholder="Select a business currency"
                  isDisabled
                  clearable={false}
                />
                <FormValidationError
                  showError={currenciesErr}
                />
                <p className="py-text--hint pt-2" >This is your reporting currency and cannot be changed. You can still send invoices, track expenses and enter transactions in any currency and an exchange rate is applied for you.</p>
              </div>
            </div>
          </div>

          <div className="py-form-field">
            <div className="py-form-field__blank">
            </div>
            <div className="py-form-field__element">
              <div className="ajax-button">
                <div className="fal fa-check btn-status text-success success" />
                <div className="fal fa-times btn-status text-danger failed" />
                <Button
                  type="submit"
                  color="primary"
                  className="width100"
                  disabled={this.state.loading}
                >
                  {
                    this.state.loading ?
                      (<Spinner size="sm" color="default" />)
                      : "Create"
                  }
                </Button>
              </div>
            </div>
          </div>
        </Form>
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
    openGlobalSnackbar: bindActionCreators(openGlobalSnackbar, dispatch),
    getBusinessMcc: () => { dispatch(getBusinessMcc()) },
    resetProviderData: bindActionCreators(resetProviderData, dispatch),
    getActiveSubscriptionPlan: () => {
      dispatch(getActiveSubscriptionPlan())
    }
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AddBusiness)
);
