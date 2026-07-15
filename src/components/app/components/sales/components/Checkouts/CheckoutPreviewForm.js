import React, { Component, Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import history from '../../../../../../customHistory'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Button,
  Col,
  Row,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Form,
  Input,
  ButtonDropdown,
  ButtonGroup,
  Spinner,
  FormGroup
} from 'reactstrap'

import * as CheckoutActions from '../../../../../../actions/CheckoutActions'
import { updateCheckoutById } from '../../../../../../api/CheckoutService'
import {
  fetchCountries,
  fetchStatesByCountryId
} from '../../../../../../api/globalServices'
import {
  _documentTitle
} from '../../../../../../utils/GlobalFunctions'
import { openGlobalSnackbar } from '../../../../../../actions/snackBarAction'
import {
  toDollar,
  getStripeKey,
  setCountries,
  setCountryStates,
  getCountryById,
  getRegionById,
  isEmpty
} from '../../../../../../utils/common'
import {
  StripeProvider,
} from 'react-stripe-elements'
import StripeCheckout from './StripeCheckout'
import Badge from '../../../../../../global/Badge'
import PoweredBy from '../../../../../common/PoweredBy'
import SelectBox from '../../../../../../utils/formWrapper/SelectBox'
import FormValidationError from '../../../../../../global/FormValidationError'
import { _isValidEmail, getAmountToDisplay } from '../../../../../../utils/GlobalFunctions'
import AddressAutoComplete from "../../../../../common/AddressAutoComplete";

const initialCheckout = (state, isEditMode) => {
  let data = {
    id: (state && state._id) || '',
    userId: (state && state.userId) || localStorage.getItem('user.id'),
    businessId:
      (state && state.businessId) || localStorage.getItem('businessId'),
    business: (state && state.business) || {},
    fields: (state && state.fields) || '',
    firstName: (state && state.firstName) || '',
    lastName: (state && state.lastName) || '',
    email: (state && state.email) || '',
    phone: (state && state.phone) || '',
    address: (state && state.address) || '',
    address2: (state && state.address2) || '',
    country: (state && state.country) || {},
    region: (state && state.region) || {},
    city: (state && state.city) || '',
    postal: (state && state.postal) || '',
    cardNumber: (state && state.cardNumber) || '',
    cardExpiryDate: (state && state.expiryDate) || '',
    cvv: (state && state.cvv) || '',
    cardHolderName: (state && state.cardHolderName) || '',
    cardZip: (state && state.cardZip) || '',
    isSaveCard: state
      ? state.isSaveCard
      : {
        allowed: false
      }
  }
  if (!isEditMode) {
    delete data.id
  }
  return data
}

class CheckoutPreviewForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modal: false,
      errorMessage: '',
      activeTab: '3',
      collapse: false,
      previewModel: initialCheckout(),
      selectedBusiness: {},
      checkoutDetails: {},
      stripe: getStripeKey(),
      isPaymentSuccess: false,
      isSavingData: false,
      countries: [],
      statesOptions: [],
      contactDetailsError: false,
      firstNameError: '',
      lastNameError: '',
      phoneNumberError: '',
      validEmailError: '',
      addressError: '',
      countryError: '',
      stateError: '',
      postalError: '',
      cityError: '',
      isTurnOffStatus: false
    }
    this.doPayment = this.doPayment.bind(this)
  }

  toggleDropdown = () => {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }))
  }

  componentDidMount() {
    const {
      isEditMode,
      selectedCheckout,
      errorMessage,
      selectedBusiness,
      publicCheckout
    } = this.props

    const onSelect = isEditMode ? selectedCheckout : null
    const formatedData = initialCheckout(onSelect, isEditMode)
    this.setState({ previewModel: formatedData })
    this.setState({ stripe: getStripeKey() })
    if (selectedCheckout) {
      this.setState({ selectedBusiness: selectedCheckout.business })

      this.setState({ checkoutDetails: selectedCheckout })
    }
    this.fetchCountryData()
    // this.fetchStatesByCountry(
    //   !!this.state.previewModel.country && this.state.previewModel.country.id
    // )
  }

  componentDidUpdate(prevProps) {
    const {
      isEditMode,
      selectedCheckout,
      publicCheckout,
      selectedBusiness
    } = this.props

    if (prevProps.selectedCheckout != selectedCheckout) {
      const onSelect = isEditMode ? selectedCheckout : null
      const formatedData = initialCheckout(onSelect, isEditMode)
      this.setState({ previewModel: formatedData })
    }

    if (
      (prevProps.selectedCheckout != selectedCheckout ||
        isEmpty(this.state.checkoutDetails)) &&
      selectedCheckout
    ) {
      let checkoutDetails = this.state.checkoutDetails
        ? this.state.checkoutDetails
        : this.props.location.state.detail
      this.setState({ selectedBusiness: selectedCheckout.business })

      this.setState({ checkoutDetails })
    }
    let checkoutDetails = this.state.checkoutDetails
    if (this.state.isPaymentSuccess) {
      window.scrollTo(0, 0)
    }
    _documentTitle(
      this.state.selectedBusiness,
      !!publicCheckout
        ? publicCheckout.itemName
        : checkoutDetails && checkoutDetails.status
          ? checkoutDetails.itemName
          : ''
    )
  }

  fetchCountryData = async () => {
    const countries = (await fetchCountries()).countries
    this.setState({ countries })
  }

  fetchStatesByCountry = async id => {
    const statesList = await fetchStatesByCountryId(id)
    this.setState({ statesOptions: statesList.states })
  }

  handleModalToggle = () => {
    this.setState({
      modal: !this.state.modal
    })
  }

  handleTabToggle = tab => {
    if (this.state.activeTab !== tab) {
      this.setState({ activeTab: tab })
    }
  }

  handleFormError = (name, value) => {
    this.setState({ contactDetailsError: true })
    if (name == 'firstName') {
      const err = !!value ? false : true
      this.setState({ firstNameError: err })
    } else if (name == 'lastName') {
      const err = !!value ? false : true
      this.setState({ lastNameError: err })
    } else if (name == 'email') {
      if (value) {
        value = _isValidEmail(value)
      }
      const err = !!value ? false : true
      this.setState({ validEmailError: err })
    } else if (name == 'address') {
      const err = !!value ? false : true
      this.setState({ addressError: err })
    } else if (name == 'country') {
      const err = !!value ? false : true
      this.setState({ countryError: err })
    } else if (name == 'region') {
      const err = !!value ? false : true
      this.setState({ stateError: err })
    } else if (name == 'postal') {
      const err = !!value ? false : true
      this.setState({ postalError: err })
    } else if (name == 'city') {
      const err = !!value ? false : true
      this.setState({ cityError: err })
    } else if (name == 'phone') {
      const err = !!value ? false : true
      this.setState({ phoneNumberError: err })
    }
  }

  handleText = async (event) => {
    const target = event.target
    const { name, value } = event.target
    let modal = this.state.previewModel
    if (name !== 'customerName') {
      this.handleFormError(name, value)
    }
    if (target.type === 'checkbox') {
      if (name === 'sell') {
        modal.sell.allowed = !modal.sell.allowed
        modal.sell.account = ''
      } else {
        modal.buy.allowed = !modal.buy.allowed
        modal.buy.account = ''
      }
      this.setState({ previewModel: modal })
    } else if (target.type === 'select-one') {
      if (name === 'country') {
        await this.fetchStatesByCountry(value)
        let _country = getCountryById(value, this.state.countries)
        modal.country = _country
      } else if (name === 'region') {
        let _region = getRegionById(value, this.state.statesOptions)
        modal.region = _region
      }
    } else if (name === 'taxes') {
      modal.taxes.push(value)
    } else {
      this.setState({
        previewModel: {
          ...this.state.previewModel,
          [name]: value
        }
      })
    }
  }

  handleAutoComplete = async (data) => {
    if (data.country) {
      const getCountry = this.state.countries.find((country) => country.sortname == data.country)
      await this.handleText({ target: { name: 'country', value: getCountry.id, type: 'select-one' } });
      if (data.state && this.state.statesOptions) {
        const getState = this.state.statesOptions.find((state) => state.name == data.state)
        this.handleText({ target: { name: 'region', value: getState.id, type: 'select-one' } });
      }
    }
    if (!!data.postalCode) {
      this.handleText({ target: { name: 'postal', value: data.postalCode } });
    } else {
      this.handleText({ target: { name: 'postal', value: '' } });
    }
    if (!!data.city) {
      this.handleText({ target: { name: 'city', value: data.city } });
    } else {
      this.handleText({ target: { name: 'city', value: '' } });
    }
    if (!!data.oneLine) {
      this.handleText({ target: { name: 'address', value: data.addressLine1 } });
      this.handleText({ target: { name: 'address2', value: data.oneLine } });
    } else {
      this.handleText({ target: { name: 'address', value: data.addressLine1 } });
      this.handleText({ target: { name: 'address2', value: '' } });
    }

  }

  handleSelectChange = selectedOption => {
    let previewModel = this.state.previewModel
    let selectedTax = selectedOption.map(item => {
      return item.value
    })
    previewModel.taxes = selectedTax
    this.setState({ previewModel })
  }

  doPayment = () => {

  }

  handlePaymentStatus = value => {
    this.setState({
      isPaymentSuccess: value == true ? true : false
    })
  }

  onTurnOff = value => {
    this.setState({
      isTurnOffStatus: value == true ? true : false
    })
  }

  saveCheckoutMenuAction = () => {
    this.props.checkoutFormSumbit(1)
  }

  saveCheckoutSubMenuAction = () => {
    this.props.checkoutFormSumbit(2)
  }

  //checkoutFormSumbit = flag => {
  // const { isEditMode, selectedCheckout } = this.props
  // let isShare = false
  // let checkoutObj = this.props.location.state
  //   ? this.props.location.state.detail
  //   : this.state.checkoutDetails
  // let status = checkoutObj.status

  // if (
  //   ((selectedCheckout.status === 'Draft' ||
  //     selectedCheckout.status === 'Offline') &&
  //     flag === 2) ||
  //   (selectedCheckout.status === 'Online' && flag === 1)
  // ) {
  //   isShare = true
  // } else if (selectedCheckout.status === 'Online' && flag === 2) {
  //   status = 'Offline'
  // } else if (selectedCheckout.status === 'Offline' && flag === 1) {
  //   status = 'Online'
  // }

  // checkoutObj.status = checkoutObj.id ? status : ''
  // const checkoutId = checkoutObj.id
  // delete checkoutObj.id
  // let payload = {
  //   checkoutInput: checkoutObj
  // }

  // this.saveCheckout(payload, checkoutId, status, isShare)
  //}

  //saveCheckout = async (payload, checkoutId, status, isShare) => {
  // let checkoutInput = payload['checkoutInput']
  // // checkoutInput['status'] = status;
  // if (!checkoutInput['itemName'] || !checkoutInput['price']) {
  //   this.props.showSnackbar('Please enter service name and price.', true)
  // } else {
  //   const { isEditMode, actions, type, updateList } = this.props
  //   try {
  //     this.toggleIsSavingStatus()
  //     if (!checkoutId) {
  //       let _price = parseFloat(payload.checkoutInput.price).toFixed(2)
  //       delete payload.checkoutInput.total
  //       delete payload.checkoutInput.price
  //       delete payload.checkoutInput.userId
  //       payload.checkoutInput['price'] = parseFloat(_price)
  //       let response = await actions.addCheckout(payload)
  //       this.toggleIsSavingStatus()
  //       this.props.showSnackbar('Checkout added successfully', false)
  //       history.push('/app/sales/checkouts')
  //     } else {
  //       let _price = parseFloat(payload.checkoutInput.price).toFixed(2);
  //       delete payload.checkoutInput.total;
  //       delete payload.checkoutInput.price;
  //       delete payload.checkoutInput.userId

  //       payload.checkoutInput['price'] = parseFloat(_price);
  //       await updateCheckoutById(checkoutId, payload)
  //       this.toggleIsSavingStatus()
  //       this.props.showSnackbar('Checkout updated successfully', false)

  //       if (isShare === true && checkoutId) {
  //         history.push('/app/sales/checkouts/share/' + checkoutId)
  //       } else {
  //         history.push('/app/sales/checkouts')
  //       }
  //     }
  //   } catch (error) {
  //     this.toggleIsSavingStatus()
  //     this.props.showSnackbar(
  //       error.message,
  //       true
  //     )
  //   }
  // }
  //}

  goToAddEditCheckout = checkoutDetails => {
    if (checkoutDetails && checkoutDetails._id) {
      history.push('/app/sales/checkouts/edit/' + checkoutDetails._id)
    } else {
      this.props.toggleView()
    }
  }

  toggleIsSavingStatus = () => {
    this.setState({
      isSavingData: !this.state.isSavingData
    })
  }

  contactDetailsUpdate = value => {
    this.setState(prevState => ({
      contactDetailsError: value,
      firstNameError: prevState.previewModel.firstName ? false : true,
      lastNameError: prevState.previewModel.lastName ? false : true,
      phoneNumberError: prevState.previewModel.phone ? false : true,
      emailError: prevState.previewModel.email ? false : true,
      addressError: prevState.previewModel.address ? false : true,
      countryError:
        prevState.previewModel.country && prevState.previewModel.country.id
          ? null
          : 'Country',
      stateError:
        prevState.previewModel.region && prevState.previewModel.region.id
          ? null
          : 'State',
      postalError: prevState.previewModel.postal ? false : true,
      cityError: prevState.previewModel.city ? false : true
    }))
  }
  renderBusinessDetails = (selectedBusiness) => {
    if (!selectedBusiness) {
      return <React.Fragment></React.Fragment>
    } else {
      return (
        <React.Fragment>
          <div className="checkout-browser-preview__header d-flex justify-content-between pt-1">
            <div className="checkout-browser-preview__header-item">
              {selectedBusiness && selectedBusiness.businessLogo ? (
                <img
                  src={selectedBusiness.businessLogo}
                  className="py-logo--lg"
                  alt="business-logo"
                />
              ) : (
                  ''
                )}
            </div>
            <div
              className={
                selectedBusiness && selectedBusiness.businessLogo
                  ? 'text-right pull-right pd0'
                  : 'text-right pd0'
              }
            >
              {selectedBusiness && selectedBusiness.organizationName ? (
                <div className="pre-title" >
                  <strong>{selectedBusiness.organizationName}</strong>
                </div>
              ) : (
                  ''
                )}
              {selectedBusiness && selectedBusiness.address ? (
                <span>
                  <p className="m-0">{selectedBusiness.address.addressLine1}</p>
                  <p className="m-0">{selectedBusiness.address.addressLine2}</p>
                  <p className="m-0">{selectedBusiness.address.city}</p>
                  <p className="m-0">{selectedBusiness.address.postal}</p>
                  <p className="m-0">
                    {selectedBusiness.address.country
                      ? selectedBusiness.address.country.name
                      : ''}
                  </p>
                </span>
              ) : (
                  ''
                )}
            </div>
          </div>
        </React.Fragment>
      )
    }
  }



  renderOfflineStatusText() {
    const { selectedBusiness } = this.state

    return (
      <React.Fragment>
        <Row className="text-center mrT55">
          <Col className="mrT105" xs={12} sm={12} md={12} lg={12}>
            <span>
              This checkout is currently offline. Please contact
              <strong> {selectedBusiness.organizationName}</strong>
            </span>
          </Col>
        </Row>
      </React.Fragment>
    )
  }

  render() {
    const {
      isPublic,
      publicLink,
      publicCheckout
    } = this.props
    const {
      previewModel,
      isPaymentSuccess,
      countries,
      statesOptions,
      isSavingData,
      contactDetailsError,
      isTurnOffStatus,
      firstNameError,
      lastNameError,
      phoneNumberError,
      validEmailError,
      addressError,
      countryError,
      stateError,
      postalError,
      cityError,
      checkoutDetails
    } = this.state
    return (
      <div className="content-wrapper__main__fixed checkoutWrapper" hidden={!checkoutDetails}>
        {!isPublic ? (
          <header className="py-header--page d-flex align-items-center justify-content-between">
            <div className="py-header--title">
              <h4 className="py-heading--title">
                Preview{' '}
                {/* {!isPublic ? <Badge status={checkoutDetails.status} /> : ''} */}
              </h4>
            </div>
            <div className="py-header--actions">
              <Button
                className="me-2"
                color="primary" outline
                onClick={() => this.goToAddEditCheckout(checkoutDetails)}
              >
                Edit
              </Button>



            <ButtonGroup>                    
                <Button
                color="primary"
                onClick={this.saveCheckoutMenuAction}
                disabled={isSavingData}
                >{!!isSavingData ? <Spinner size="sm" color="default" /> : checkoutDetails.status === 'Online' ? 'Save and share' : 'Save and turn on'}</Button>
                <ButtonDropdown 
                    isOpen={this.state.dropdownOpen}
                    toggle={this.toggleDropdown}
                >
                    <DropdownToggle color="primary" className="ps-2 pe-3 border-left" caret />
                        <DropdownMenu left>
                            <DropdownItem onClick={this.saveCheckoutSubMenuAction}>{checkoutDetails.status === 'Online' ? 'Save and turn off' : checkoutDetails.id ? 'Save and share' : 'Save as draft'}</DropdownItem>
                        </DropdownMenu>
                </ButtonDropdown>
            </ButtonGroup>  




            </div>
          </header>
        ) : (
            ''
          )}

        <div className={!isPublic ? 'mt-3' : ''}>
          {!isPublic ? (
            <div>
              <div className="mb-3">
                Below is a preview of your checkout. To change your logo, accent
                color, or address, go to your
                <a
                  className="py-text--link"
                  target="_blank"
                  href="/app/setting/invoice-customization"
                >
                  {' '}
                  customization settings
                </a>
                .
              </div>
            </div>
          ) : (
              ''
            )}
          <div
            className={`py-box p-0 ${
              !isPublic ? 'shadow' : ''
              } no-border u-o--hidden`}
          >
            {!isPublic && (
              <div className="checkout-preview__browser__container">
                <div className="checkouts-preview checkouts-preview__browser-header">
                  <div className="circle-container">
                    <div className="circle circle__red"></div>
                    <div className="circle circle__yellow"></div>
                    <div className="circle circle__green"></div>
                  </div>
                  <div className="checkouts-preview__browser-address-input">
                    <i className="fal fa-lock mrR5"></i>
                    {publicLink}
                  </div>
                </div>
              </div>
            )}

            <div className={!isPublic ? 'accent-bar' : 'no-border'}>
              <div className={isPublic ? 'checkout-public-preview' : 'pd30 d-none'}>
                {this.renderBusinessDetails(checkoutDetails.business)}
                {(!!checkoutDetails &&
                  checkoutDetails.status === 'Offline' &&
                  !!isPublic) ? (
                    <Row className="text-center mrT55">
                      <Col className="mrT105" xs={12} sm={12} md={12} lg={12}>
                        <span>
                          <strong>{checkoutDetails.itemName} is not available.</strong>
                          &nbsp;Please contact {!!publicCheckout && !!publicCheckout.business && publicCheckout.business.organizationName} if you are looking to purchase a product or service.
                        </span>
                      </Col>
                    </Row>
                  ) : (
                    <div className="public-checkout__inner-container">
                      <div className="text-center">
                        <span className="py-heading--section-title">
                          {checkoutDetails.itemName}
                        </span>
                        <span className="py-text py-text--body public-checkout__price">
                          {checkoutDetails.total >= 0.51
                            ? getAmountToDisplay(checkoutDetails.currency, checkoutDetails.total)
                            : getAmountToDisplay(checkoutDetails.currency, '0.51')}
                        </span>
                      </div>

                      <div className="py-3" hidden={isPaymentSuccess == false}>
                        <div className="d-flex flex-column align-items-center">
                          <span className="text-primary">
                            <svg
                              className="Icon--xlg"
                              viewBox="0 0 23 21"
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g
                                stroke="none"
                                strokeWidth="1"
                                fill="none"
                                fillRule="evenodd"
                              >
                                <g
                                  transform="translate(-1132.000000, -196.000000)"
                                  fill="currentColor"
                                  fillRule="nonzero"
                                >
                                  <path d="M1149.5,206 C1152.533,206 1155,208.467 1155,211.5 C1155,214.533 1152.533,217 1149.5,217 C1146.467,217 1144,214.533 1144,211.5 C1144,208.467 1146.467,206 1149.5,206 Z M1149.5,207 C1147.019,207 1145,209.019 1145,211.5 C1145,213.981 1147.019,216 1149.5,216 C1151.981,216 1154,213.981 1154,211.5 C1154,209.019 1151.981,207 1149.5,207 Z M1151.497,209.501 C1151.602,209.501 1151.702,209.533 1151.788,209.595 C1151.896,209.672 1151.968,209.787 1151.99,209.919 C1152.012,210.051 1151.981,210.183 1151.904,210.292 L1149.747,213.312 C1149.716,213.356 1149.68,213.398 1149.641,213.437 C1149.451,213.625 1149.2,213.729 1148.932,213.729 C1148.665,213.729 1148.414,213.625 1148.225,213.437 L1147.142,212.354 C1146.947,212.159 1146.947,211.842 1147.142,211.647 C1147.236,211.553 1147.362,211.501 1147.496,211.501 C1147.63,211.501 1147.755,211.553 1147.85,211.647 L1148.933,212.73 L1151.09,209.71 C1151.184,209.579 1151.336,209.501 1151.497,209.501 Z M1147.5,196 C1148.878,196 1150,197.121 1150,198.5 L1150,199.457 C1150.002,199.472 1150.004,199.488 1150.004,199.5 C1150.004,199.519 1150.002,199.536 1149.999,199.55 L1150,205 C1150,205.276 1149.776,205.5 1149.5,205.5 C1149.224,205.5 1149,205.276 1149,205 L1149,200 L1133,200 L1133,206.5 C1133,207.327 1133.673,208 1134.5,208 L1143,208 C1143.276,208 1143.5,208.224 1143.5,208.5 C1143.5,208.776 1143.276,209 1143,209 L1134.5,209 C1133.121,209 1132,207.879 1132,206.5 L1132,198.5 C1132,197.121 1133.121,196 1134.5,196 L1147.5,196 Z M1138.504,203 C1138.78,203 1139.004,203.224 1139.004,203.5 C1139.004,203.776 1138.78,204 1138.504,204 L1135.504,204 C1135.228,204 1135.004,203.776 1135.004,203.5 C1135.004,203.224 1135.228,203 1135.504,203 L1138.504,203 Z M1140.504,201 C1140.78,201 1141.004,201.224 1141.004,201.5 C1141.004,201.776 1140.78,202 1140.504,202 L1135.504,202 C1135.228,202 1135.004,201.776 1135.004,201.5 C1135.004,201.224 1135.228,201 1135.504,201 L1140.504,201 Z M1147.504,201 C1147.78,201 1148.004,201.224 1148.004,201.5 C1148.004,201.776 1147.78,202 1147.504,202 L1145.504,202 C1145.228,202 1145.004,201.776 1145.004,201.5 C1145.004,201.224 1145.228,201 1145.504,201 L1147.504,201 Z M1147.5,197 L1134.5,197 C1133.673,197 1133,197.673 1133,198.5 L1133,199 L1149,199 L1149,198.5 C1149,197.673 1148.327,197 1147.5,197 Z"></path>
                                </g>
                              </g>
                            </svg>
                          </span>
                          <h1 className="py-heading--title my-4">
                            {checkoutDetails.message &&
                              checkoutDetails.message.success
                              ? checkoutDetails.message.success
                              : 'Payment made successfully'}
                          </h1>
                        </div>
                      </div>
                      <div hidden={isPaymentSuccess == true}>
                        <Form>
                          <Row className="mx-n2" >
                            <Col sm="12 px-2">
                              <div className="py-heading--section-title">Contact details</div>
                            </Col>
                          </Row>
                          <div className="py-form-fieldset">
                            <div className="py-form-field py-form-field--condensed mb-0">
                              <div className="py-form-field__element">
                                <Row className="d-flex align-items-center mx-n2" >
                                  <Col sm="6" className="px-2 pb-2" >
                                    <Input
                                      required
                                      type="text"
                                      name="firstName"
                                      placeholder="First name"
                                      id="PublicForm__FirstName"
                                      className="public-checkout__first-name"
                                      value={previewModel.firstName}
                                      onChange={this.handleText}
                                    />
                                    <FormValidationError
                                      showError={!!firstNameError}
                                    />
                                  </Col>
                                  <Col sm="6" className="px-2 pb-2" >
                                    <Input
                                      required
                                      type="text"
                                      name="lastName"
                                      id="PublicForm__LastName"
                                      placeholder="Last name"
                                      className="public-checkout__last-name"
                                      value={previewModel.lastName}
                                      onChange={this.handleText}
                                    />
                                    <FormValidationError
                                      showError={!!lastNameError}
                                    />
                                  </Col>
                                </Row>
                                <Row className="mx-n2" >
                                  <Col sm={!checkoutDetails.fields || (!!checkoutDetails.fields && !checkoutDetails.fields.phone ? '12' : '6')} className="px-2 pb-2" >
                                    <Input
                                      required
                                      type="email"
                                      name="email"
                                      id="PublicForm__Email"
                                      className={`public-checkout__input--has-input-above public-checkout__email`}
                                      placeholder="Email address"
                                      value={previewModel.email}
                                      onChange={this.handleText}
                                    />
                                    <FormValidationError
                                      showError={!!validEmailError}
                                      message={'Please enter a valid email'}
                                    />
                                  </Col>
                                  {!!checkoutDetails.fields && (!!checkoutDetails.fields.phone && (
                                    <Col sm="6" className="px-2 pb-2" >
                                      <Input
                                        required
                                        type="number"
                                        name="phone"
                                        autocomplete="nope"
                                        placeholder="Phone"
                                        className="public-checkout__input--has-input-above  public-checkout__phone"
                                        value={previewModel.phone}
                                        onChange={this.handleText}
                                      />
                                      <FormValidationError
                                        showError={!!phoneNumberError}
                                      />
                                    </Col>
                                  ))}
                                </Row>
                              </div>
                            </div>
                          </div>
                          <div className="py-form-fieldset" hidden={!checkoutDetails.fields || checkoutDetails.fields.address != true} >
                            <div className="py-form-field py-form-field--condensed">
                              <div className="row mx-n2">
                                <div className="col-sm-12 px-2 pb-2" >
                                  <AddressAutoComplete
                                    isFull={true}
                                    isClass="public-checkout__input--has-input-above-below py-form__element__fluid"
                                    placeholder="Address line 1"
                                    value={{ ...previewModel, addressLine1: previewModel.address }}
                                    handleSet={(addrObj) => this.handleAutoComplete(addrObj)}
                                  />
                                  <FormValidationError
                                    showError={!!addressError}
                                  />
                                </div>
                              </div>
                              <div className="row mx-n2">
                                <div className="col-sm-12 px-2 pb-2" >
                                  <Input
                                    className="public-checkout__input--has-input-above-below py-form__element__fluid"
                                    type="text"
                                    name="address2"
                                    placeholder="Address line 2"
                                    value={previewModel.address2}
                                    onChange={this.handleText}
                                  />
                                </div>
                              </div>

                              <div className="row mx-n2">
                                <div className="col-sm-6 px-2 pb-2" >
                                  <Input
                                    className="public-checkout__city"
                                    required
                                    type="text"
                                    name="city"
                                    placeholder="City"
                                    value={previewModel.city}
                                    onChange={this.handleText}
                                  />
                                  <FormValidationError
                                    showError={!!cityError}
                                  />
                                </div>
                                <div className="col-sm-6 px-2 pb-2" >
                                  <SelectBox
                                    className={"mt-1"}
                                    getOptionLabel={(value)=>(value["name"])}
                                    getOptionValue={(value)=>(value["id"])}
                                    value={!!previewModel.region.id ? previewModel.region : ''}
                                    onChange={e => this.handleText({ ...e, target: { ...e.target, name: 'region', value: e.id, type: 'select-one' } })}
                                    placeholder="Province/State"
                                    options={statesOptions}
                                    clearable={false}
                                  />
                                  <FormValidationError
                                    showError={!!stateError}
                                  />
                                </div>
                              </div>

                              <div className="row mx-n2">
                                <div className="col-sm-6 px-2 pb-2" >
                                  <Input
                                    className="public-checkout__postal"
                                    required
                                    type="zip"
                                    name="postal"
                                    minLength={2}
                                    maxLength={10}
                                    placeholder="Postal code"
                                    value={previewModel.postal}
                                    onChange={this.handleText}
                                  />
                                  <FormValidationError
                                    showError={!!postalError}
                                  />
                                </div>
                                <div className="col-sm-6 px-2 pb-2" >
                                  <SelectBox
                                    getOptionLabel={(value)=>(value["name"])}
                                    getOptionValue={(value)=>(value["id"])}
                                    value={
                                      !!previewModel.country.id ? previewModel.country : null}
                                    onChange={e => this.handleText({ ...e, target: { ...e.target, name: 'country', value: e.id, type: 'select-one' } })}
                                    placeholder="Country"
                                    options={countries}
                                    clearable={false}
                                    className={"mt-1"}
                                  />
                                  <FormValidationError
                                    showError={!!countryError}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </Form>
                        {
                          checkoutDetails.status !== "Draft" && (
                            <div className="">
                              <StripeProvider apiKey={getStripeKey()}>
                                <StripeCheckout
                                  previewModel={previewModel}
                                  showError={value =>
                                    this.contactDetailsUpdate(value)
                                  }
                                  checkoutDetails={checkoutDetails}
                                  {...this.props}
                                  onPayment={this.handlePaymentStatus}
                                  onTurnOff={this.onTurnOff}
                                  handleText={this.handleText.bind(this)}
                                  isPublic={isPublic}
                                  handleFormError={this.handleFormError}
                                />
                              </StripeProvider>
                            </div>
                          )
                        }
                      </div>
                    </div>
                  )}
              </div>
              {publicLink &&
                <iframe
                  src={publicLink}
                  title="Public Checkout Page"
                  width={962}
                  height={650}
                />
              }
            </div>

            {/* <PoweredBy /> */}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    selectedBusiness: state.businessReducer.selectedBusiness,
    errorMessage: state.checkoutReducer.errorMessage,
    legalDetails: state.businessReducer.legalDetails
  }
}

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators(CheckoutActions, dispatch),
    showSnackbar: (message, error) => {
      dispatch(openGlobalSnackbar(message, error))
    }
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(CheckoutPreviewForm))
