import { parse } from 'query-string';
import React, { Component, Fragment, useState } from 'react';
import Form from '@rjsf/core';
import { Spinner } from 'reactstrap';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { get as _get } from 'lodash';
import { _documentTitle } from '../../../../../utils/GlobalFunctions';
import { Helmet } from 'react-helmet';
import PaymentService from '../../../../../api/paymentService';
import 'react-phone-input-2/lib/style.css';
// import AddressAutoComplete from '../../../common/AddressAutoComplete'
import CenterSpinner from '../../../../../global/CenterSpinner';
import { uiSchema, uiSchema1 } from './common/ui-schema';
import BannerService from '../../../../../api/bannerService';
import { openGlobalSnackbar } from '../../../../../actions/snackBarAction';

let halfCount = 0

export function CustomFieldTemplate(props) {
  const {
    id,
    classNames,
    label,
    rawDescription,
    help,
    required,
    description,
    errors,
    children,
    schema
  } = props
  halfCount = schema.data === 'half' && halfCount++
  return (
    <div className={`${classNames} ${schema.data} ${id.toLowerCase()} ${label?.replace(/\s/g, '').toLowerCase()}`}>
      {!_get(schema, 'isLabelHide', false) ? (
        <label className={`${_get(schema, 'isLabelAsTitle', false) ? 'label-title' : 'label'}`} htmlFor={id}>
          {label}
          {schema.isAsterhide ? " " : (required ? '*' : null)}

        </label>
      ) : (
        ''
      )}

      {!_get(schema, 'isDescriptionHide', false)
        ? rawDescription && (
        <div className="field-description" dangerouslySetInnerHTML={{ __html: rawDescription }} />
          )
        : ''}

      {halfCount <= 1 ? (
        <div className="row">
          <div className={'col-lg-12 col-md-12 col-sm-12 col-xs-12 in-field'} key={id}>
            {children}
          </div>
          {
            (errors &&errors.props && errors.props.errors) ? <div style={{color:"red",marginLeft:"15px"}}>{errors.props.errors[0]}</div>:""
          }
        </div>
      ) : (
        <div className="row">
          <div className={'col-lg-6 col-md-6 col-sm-6 col-xs-6 in-field'} key={id}>
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

function transformErrors(errors) {
  return errors.map(error => {
    if (error.name === 'pattern') {
      error.message = `${error?.property?.replace(".", "")} is not valid`
    }
    if (error.name === 'oneOf' || error.name === 'enum') error.message = ''
    return error
  })
}

const validate = (formData, errors) => {
  if(formData && formData.merchantAgreementAccepted === false){
    errors.merchantAgreementAccepted.addError("Accept Terms and Condition.")
  }
  if(formData && formData.annualCardVolume < formData.maxTransactionAmount) {
    errors.maxTransactionAmount.addError("The projected maximum transactional amount cannot exceed projected annual transactional volume.")
  }
  if(formData && formData.idNumber && formData.idNumber.includes("_")){
      errors.idNumber.addError("should not be shorter than 9 characters")
  }
  if(formData && formData.taxNumber && formData.taxNumber.includes("_")){
    errors.taxNumber.addError("should not be shorter than 9 characters")
  }
  if(formData && formData.telephone && formData.telephone.length < 9) {
    errors.telephone.addError("Phone number is not valid")
  }
  if(formData && formData.personalPhone && formData.personalPhone.length < 9) {
    errors.personalPhone.addError("Phone number is not valid")
  }
  return errors;
}

class PaymentOnBoarding extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: {},
      step: 1,
      loading: false,
      savedData: {
        businessType: '',
        legalName: '',
        flagforsuccess: false,
        Ownership: '',
        savebuttonflag: false
      },
      flagAdditionalOwner: false,
      additionalFieldSchema: {},
      ownermainData: {},
      openSummary: false,
      setShowFunc: null,
      isSavedClicked: false,
      additionalOwners: [],
      flagterm : true
    }
  }

  componentWillReceiveProps(props) {
    let limit = this.parseLimit(props)
    if (props.onBoardingData) {
      if (
        props.onBoardingData.properties &&
        props.onBoardingData.properties.additionalOwners
      ) {
        this.setState({
          additionalFieldSchema:
            props.onBoardingData.properties.additionalOwners,
            additionalOwners: _get(props.formData,'additionalOwners',[])

        })
        delete props.onBoardingData.properties.additionalOwners
        this.setState({
          data: props.onBoardingData
        })
      }
      if(props.onBoardingData.properties && props.onBoardingData.properties.hasAcceptedCreditCardInPast){
          {(props.formData.hasAcceptedCreditCardInPast)?
            props.formData.hasAcceptedCreditCardInPast = "true":
            props.formData.hasAcceptedCreditCardInPast = "false"
          }
      }
      if (
        this.state.savedData.businessType === 'INDIVIDUAL_SOLE_PROPRIETORSHIP'
      ) {
        delete props.onBoardingData.properties.taxNumber
        // props?.formData && props.formData.taxNumber == ''
      }
      this.setState({
        flagterm : true,
        data: props.onBoardingData,
        step: props.activeStep + 1,
        flagAdditionalOwner: props.newOwnerflag
      })
    }

    if (this.state.limit !== limit) {
      this.setState({ limit })
    }

    if (this.state.openSummary) {
      this.setState({ openSummary: false })
    }

    if (_get(props, "onBoardingData.title", "") !== "Business Type") {
      Object.keys(_get(props, "onBoardingData.properties", [])).forEach((item) => {
        if (_get(props.onBoardingData.properties[item], "disabled", false)) {
          uiSchema[item] = {
            'ui:readonly': true
          };
        }
      })
    }
  }

  ArrayFieldTemplate1 = props => {
    const [show, setShow] = useState(true)
    if (!this.state.setShowFunc) {
      this.setState({ setShowFunc: setShow, isSavedClicked: true })
    }
    return (
      <div>
        <div className="py-header--title">
          <div className="mb-3 h5"> {props.schema.title}</div>
          <hr />
          <div className="py-text">{props.schema.description}</div>
          {show ? (
            <div>
              <div className="row">
                <div className="col text-left stepthreelisthead">You</div>
              </div>
              <div className="row">
                <div className="col text-left stepthreelist">
                  {props.formContext.firstName}
                </div>
                <div className="col text-left stepthreelist">
                  {props.formContext.ownership}% Ownership
                </div>
              </div>
              {props.formContext.ownership !== 100 ? (
                <div>
                  <div className="row">
                    <div className="col text-left stepthreelisthead">
                      Additional Owners
                    </div>
                  </div>
                  {_get(
                    props.formContext,
                    'additionalOwners',
                    props.formData
                  ).map((val, i) => {
                    return (
                      <div className="row" key={i}>
                        <div className="col text-left stepthreelist">
                          {val.firstName}
                        </div>
                        <div className="col text-left stepthreelist">
                          {val.ownership}% Ownership
                        </div>
                      </div>
                    )
                  })}
                  <div className="text-center">
                    <button
                      type="button"
                      className="additionalOwnerButton"
                      onClick={() => {
                        setShow(false)
                        setTimeout(() => {
                          this.setState({ openSummary: false })
                        }, 1000)
                      }}
                    >
                      { (this.state.additionalOwners.length === 0) ? "Add" : "Edit" } aditional owner
                    </button>
                  </div>
                </div>
              ) : (
                ''
              )}
            </div>
          ) : (
            <div>
              {props.items.map((element, index) => (
                <div>
                  <div className="additional_field">
                    <div key={index}>{element.children}</div>
                  </div>
                  {/* <hr /> */}

                  {props.items.length != 0 ? (
                    <div>
                      {props.items[index].hasRemove && (
                        <button
                          type="danger"
                          aria-label="Remove"
                          className="array-item-remove btn btn-danger"
                          tabIndex="-1"
                          style={{ float: 'right', margin: '15px' }}
                          disabled={props.disabled || props.readonly}
                          onClick={props.items[index].onDropIndexClick(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ) : (
                    ''
                  )}
                </div>
              ))}
              {props.canAdd && (
                <div className="text-left">
                  <button
                    type="button"
                    className="additionalOwnerButton"
                    onClick={props.onAddClick}
                  >
                    + Add aditional owner
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <br />
      </div>
    )
  }

  async componentDidMount() {
    const { businessInfo } = this.props
    _documentTitle(businessInfo, 'Dashboard')

  }

  parseLimit(props) {
    const {
      location: { search }
    } = props
    const params = parse(search.substring(1))
    let limit = parseInt(params.limit || 'a')

    if (isNaN(limit)) {
      limit = undefined
    }

    return limit
  }

  toggleDropdown = () => {
    this.setState({ dropdownOpen: !this.state.dropdownOpen })
  }

  onSubmit = async ({ formData }) => {
    if (this.state.isSavedClicked) {
      this.state.setShowFunc(true)
    }

    if (this.state.setShowFunc) {
      this.setState({ setShowFunc: null })
    }

    if(formData && formData.legalName){
      this.setState({
        savedData :{
          ...this.state.savedData,
          legalName : formData.legalName
        }
      })
    }

    if (formData.ownership && formData.ownership !== 100) {
      this.setState(
        {
          flagAdditionalOwner: true,
          ownermainData: formData
        },
        () => {
          this.setState({ openSummary: true })
        }
      )
      return
    }
    if (
      Object.keys(this.state.additionalFieldSchema).length !== 0 &&
      this.state.savedData.businessType != 'INDIVIDUAL_SOLE_PROPRIETORSHIP' &&
      formData.ownership < 100 &&
      !this.state.flagAdditionalOwner
    ) {
      this.setState({
        flagAdditionalOwner: true,
        ownermainData: formData
      })
      return
    }
    if (
      Object.keys(this.state.additionalFieldSchema).length !== 0 &&
      this.state.flagAdditionalOwner &&
      this.state.ownermainData.ownership < 100
    ) {
      let a = formData
      formData = this.state.ownermainData
      formData.additionalOwners = a
    }
    if (
      this.state.isSavedClicked &&
      formData.additionalOwners.length &&
      formData.additionalOwners[0].ownership
    ) {
      this.setState({
        isSavedClicked: false,
        openSummary: true,
        additionalOwners: formData.additionalOwners
      })
      return
    }
    if (
      this.state.step &&
      1 <= this.state.step &&
      this.state.step <= this.props.stepperData.length
    ) {
      this.setState({
        loading: true
      })

      formData.step = this.state.step

      await PaymentService.submitData(formData)
        .then(async res => {
          this.setState({
            loading: false,
            isSavedClicked: false,
            setShowFunc: null
          })
          if (res.statusCode == 200) {
            if (this.state.step != this.props.stepperData.length) {
              this.props.handleSteps(this.state.step)
            }
            if(this.state.step == this.props.stepperData.length) {
              await BannerService.fetchAllBanners()
              this.props.checkStage();
              this.props.disablestep();
              this.setState({
                savedData: {
                  ...this.state.savedData,
                  flagforsuccess: true
                }
              })
              this.setState({
                data: this.props.onBoardingData,
              })
            }else{
              this.setState({
                data: this.props.onBoardingData,
                step: this.state.step + 1
              })
            }
          }
        })
        .catch(err => {
          this.setState({
            loading: false
          })
          this.props.onShowSnackbar(err.message)
        })
    }
  }

  onCancel = async () => {
    if (
      this.state.step &&
      1 < this.state.step &&
      this.state.step <= this.props.stepperData.length
    ) {
      const onBoardingStepData = await PaymentService.fetchPaymentOnboardingSteps(
        this.state.step - 1
      )
      if (onBoardingStepData && onBoardingStepData.data) {
        this.setState({
          data: onBoardingStepData.data.stepSchema,
          step: this.state.step - 1
        })
      }
    }
  }

  handleOpenSummary = val => {
    this.setState({ openSummary: val })
  }

  onChange = props => {
    if(props.schema && props.schema.properties && props.schema.properties.statement && this.props.formData && this.props.formData.statement){
      this.setState({
        flagterm : props.formData.merchantAgreementAccepted && props.formData.attestation
      })
      this.props.formData.merchantAgreementAccepted = props.formData.merchantAgreementAccepted
      this.props.formData.attestation = props.formData.attestation
      this.props.formData.statement.displayName = props.formData.statement.displayName
      this.props.formData.referredBy = props.formData?.referredBy
    }

  }
  render() {
    const queryParams = new URLSearchParams(window.location.search)
    const step = queryParams.get("step")
    const displayAdditional =
      Object.keys(this.state.additionalFieldSchema).length !== 0 &&
      this.state.flagAdditionalOwner &&
      this.state.ownermainData.ownership < 100
    const isPersonalInformation =
      this.props.stepperData[this.state.step - 1] &&
      this.props.stepperData[this.state.step - 1].name ===
        'Personal Information'

    let  localFormContext =  displayAdditional
      ? this.state.ownermainData
      : this.state.savedData
    localFormContext = {
      ...(localFormContext || {}),
      showSnackbar: this.props.showSnackbar
    };
    return (
      <Fragment>
        <Helmet>
          <meta name="viewport" content="" />
        </Helmet>
        <div className="content-wrapper__main dashboard-wrapper">
            <div>
              <div>
                {Object.keys(this.state.data).length !== 0 ? (
                  <Form
                    schema={
                      displayAdditional
                        ? this.state.additionalFieldSchema
                        : this.state.data
                    }
                    uiSchema={displayAdditional ? uiSchema1 : uiSchema}

                    showErrorList={false}
                    className="onboarding-form-wrapper"
                    FieldTemplate={CustomFieldTemplate}
                    onSubmit={this.onSubmit}
                    validate={validate}
                    onChange={this.onChange}
                    noHtml5Validate={true}
                    formContext={localFormContext}
                    ArrayFieldTemplate={this.ArrayFieldTemplate1}
                    transformErrors={transformErrors}
                    formData={
                      displayAdditional
                        ? (this.state.additionalOwners.length &&
                            this.state.additionalOwners) ||
                          this.props.additionaFieldData
                        : this.props.formData
                    }
                  >
                    <div className="text-center mt-4">
                      {isPersonalInformation && !this.state.openSummary ? (
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={this.state.loading}
                        >
                          &nbsp; Save &nbsp;
                          {this.state.loading && (
                            <Spinner size="sm" color="default" />
                          )}
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={this.state.loading || !this.state.flagterm}
                          onClick={() => {
                            if (isPersonalInformation) {
                              this.setState({ isSavedClicked: false })
                            }
                          }}
                        >
                          &nbsp; Save and continue &nbsp;
                          {this.state.loading && (
                            <Spinner size="sm" color="default" />
                          )}
                        </button>
                      )}
                    </div>
                  </Form>
                ) : (
                  <CenterSpinner />
                )}
              </div>
            </div>
        </div>
      </Fragment>
    )
  }
}

const mapStateToProps = state => {
  return {}
}
const mapDispatchToProps = dispatch => {
  return {
    showSnackbar: (message, error) => {
      dispatch(openGlobalSnackbar(message, error));
    }
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PaymentOnBoarding))
