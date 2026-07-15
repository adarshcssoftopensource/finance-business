import React, { Component, Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import history from '../../../../../../customHistory'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  FormGroup,
  Row,
  Col,
  Container,
  Button,
  Label,
  Input,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  ButtonGroup,
  ButtonDropdown,
  UncontrolledTooltip
} from 'reactstrap'
import * as CheckoutActions from '../../../../../../actions/CheckoutActions'
import taxServices from '../../../../../../api/TaxServices'
import { imageUploadValidation, videoUploadValidation } from '../helpers/index'
import Taxes from '../Taxes'
import { openGlobalSnackbar } from '../../../../../../actions/snackBarAction'
import { toDollar, convertToPrice } from '../../../../../../utils/common'
import Badge from '../../../../../../global/Badge'
import CenterSpinner from '../../../../../../global/CenterSpinner'
import { updateCheckoutById, fetchBusinessCheckoutFee } from '../../../../../../api/CheckoutService'
import { Spinner } from 'reactstrap'
import CheckoutPreviewForm from './CheckoutPreviewForm'
import {
  fetchSignedUrl,
  uploadImage
} from '../../../../../../api/businessService'
import { cloneDeep } from 'lodash'
import { getAmountToDisplay } from '../../../../../../utils/GlobalFunctions'
import { fetchCurrencies } from '../../../../../../api/globalServices'
import SelectBox from '../../../../../../utils/formWrapper/SelectBox'
import { setCurrencyList } from '../../../invoice/helpers'
import FormValidationError from "../../../../../../global/FormValidationError";
import MediaTypeSwitches from './MediaTypeSwitches'
import { PROVIDER_NAME } from '../../../../../../utils/Provider.const'

const getTaxes = taxes => {
  let _taxes = []
  if (taxes) {
    taxes.forEach(tax => {
      if (typeof tax == 'string') {
        _taxes.push(tax)
      } else {
        _taxes.push(tax.id)
      }
    })
  }
  return _taxes
}

const initialCheckout = (state, isEditMode) => {
  let data = {
    id: (state && state._id) || '',
    currency: state && state.currency ? state.currency : '',
    userId: (state && state.userId) || localStorage.getItem('user.id'),
    itemName: (state && state.itemName) || '',
    description: (state && state.description) || '',
    bannerUrl: (state && state.bannerUrl) || '',
    mediaType:(state && state.mediaType) || "image",
    message: {
      success: (state && state.message.success) || '',
      failure: (state && state.message.failure) || ''
    },
    price: (state && state.price) || 0.0,
    total: (state && state.total) || 0,
    fields: state
      ? state.fields
      : {
          phone: true,
          address: false,
          shippingAddress: false,
          email: true,
          shouldAskProcessingFee: true,

        },
    status: (state && state.status) || '',
    maxQuantity: state ? state.maxQuantity : 9999,
    showQuantity: state ? state.showQuantity : true,
    memo: state && state.memo ? state.memo : false,
    memoLabel: state && state.memoLabel ? state.memoLabel : '',
    // shippingAddress: state ? state.shippingAddress : false,
    taxes:
      (state && isEditMode && getTaxes(state.taxes)) ||
      (state && !isEditMode && state.taxes) ||
      [],
    fee: state ? state.fee : [],
  }
  if (!isEditMode) {
    delete data.id
  }
  return data
}

class CheckoutForm extends Component {
  constructor() {
    super()
    this.state = {
      dropdownOpen: false,
      modal: false,
      errorMessage: '',
      collapse: false,
      checkoutModel: initialCheckout(),
      isSaveDraft: false,
      isSaveOnline: false,
      isSavingData: false,
      selectedTaxes: [],
      totalAmt: 0,
      allTaxes: [],
      priceLess: false,
      loading: false,
      imageLoading: false,
      currencies:[],
      isMemoError: false,
      memoRequiredMessage: "Memo is required",
      activeTab:"1",
      selectedPaymentMethod: 'card',
      paymentButtons: {
        payWithPaypal: false,
        payLaterWithPaypal: false,
        payWithVenmo: false,
      }
    }
  }
  fetchtaxList = async () => {
    let taxResponse = (await taxServices.fetchTaxes()).data.taxes
    this.setState({
      allTaxes: taxResponse
    })
  }
  fetchCheckoutFee = async () => {
    let feeResponse = (await fetchBusinessCheckoutFee()).data.processingFee;
    this.setState({
      checkoutModel: { ...this.state.checkoutModel, fee: feeResponse }
    })
  }
  componentDidMount = async () => {
    await this.fetchtaxList()
    const {
      isEditMode,
      selectedCheckout,
      selectedBusiness,
      paymentSettings
    } = this.props

    this.setState({
      paymentButtons: {
        payWithPaypal: isEditMode ? selectedCheckout?.paymentButtons?.payWithPaypal : paymentSettings?.paymentButtons?.payWithPaypal,
        payLaterWithPaypal: isEditMode ? selectedCheckout?.paymentButtons?.payLaterWithPaypal : paymentSettings?.paymentButtons?.payLaterWithPaypal,
        payWithVenmo: isEditMode ? selectedCheckout?.paymentButtons?.payWithVenmo : paymentSettings?.paymentButtons?.payWithVenmo,
      }
    })
    const addCheckoutDetails =
      this.props.location &&
      this.props.location.state &&
      this.props.location.state.addCheckoutDetails
        ? this.props.location.state.addCheckoutDetails
        : null
    const currencies = await fetchCurrencies();
    this.setState({ currencies: setCurrencyList(currencies) })
    const onSelect = isEditMode ? selectedCheckout : null
    const formatedData = initialCheckout(onSelect, isEditMode)
    formatedData.currency = selectedBusiness.currency
    this.setState({
      checkoutModel: formatedData
    })

    if (addCheckoutDetails && addCheckoutDetails.taxes) {
      let filteredTaxes = this.state.allTaxes.filter(el => {
        return addCheckoutDetails.taxes.indexOf(el._id) != -1
      })

      let taxArray = []
      filteredTaxes.map(item => {
        taxArray.push({
          value: item._id,
          label: `${item.abbreviation}  ${item.rate}%`,
          rate: item.rate
        })
      })

      this.handleSelectChange(taxArray)
    }
    await this.fetchCheckoutFee()
  }

  componentDidUpdate = prevProps => {
    const {
      isEditMode,
      selectedCheckout,
      isSaveDraft,
      isSaveOnline
    } = this.props
    if (prevProps.selectedCheckout != selectedCheckout) {
      const onSelect = isEditMode ? selectedCheckout : null
      const formatedData = initialCheckout(onSelect, isEditMode)
        
      this.setState({
        checkoutModel: formatedData,
        selectedTaxes: selectedCheckout.taxes,
        activeTab: selectedCheckout.mediaType ? selectedCheckout.mediaType === "image" ? "1" : "2" : "1"
      })
    }
  }

  toggleDropdown = event => {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    })

    if (
      event &&
      event.target &&
      (event.target.innerText === 'Save and turn off' ||
        event.target.innerText === 'Save as draft' ||
        event.target.innerText === 'Save and share')
    ) {
      this.saveCheckoutSubMenuAction()
    }
  }

  handleModalToggle = () => {
    this.setState({
      modal: !this.state.modal
    })
  }

  handleMaxQuantity = e => {
    let { value, min, max } = e.target
    if (!value) {
      value = 9999
    }

    value = Math.max(Number(min), Math.min(Number(max), Number(value)))

    this.setState({
      checkoutModel: { ...this.state.checkoutModel, maxQuantity: value }
    })
  }

  handleMemoLabel = e => {
    this.setState({
      checkoutModel: { ...this.state.checkoutModel, memoLabel: e.target.value }
    })
  }

  handleText = event => {
    const target = event.target
    let { name, value } = event.target
    let modal = this.state.checkoutModel
    if (target.type === 'checkbox') {
      if (name === 'phone') {
          modal.fields.phone = !modal.fields.phone
      } else if (name === 'shippingAddress') {
          modal.fields.shippingAddress = !modal.fields.shippingAddress
      } else if (name === 'shouldAskProcessingFee') {
          modal.fields.shouldAskProcessingFee = !modal.fields.shouldAskProcessingFee
      } else if (name === 'showQuantity') {
          modal.showQuantity = !modal.showQuantity
        if (!modal.showQuantity) {
          modal.maxQuantity = 9999
        }
      } else if (name === 'memo') {
        modal.memo = !modal.memo
        modal.memoLabel = ''
      } else {
        modal.fields.address = !modal.fields.address
      }
      this.setState({
        checkoutModel: modal
      })
    } else if (name === 'taxes') {
      modal.taxes.push(value)
    }
    else if (name === 'message') {
      modal.message.success = value
      this.setState({
        checkoutModel: modal
      })
    } else if (name === 'price') {
      if (!value) {
        value = 0
      }
      this.setState({
        checkoutModel: { ...this.state.checkoutModel, [name]: value }
      })
    } else if (name === "memoLabel") {
      let isMemoError = false;
      if (!value) {
        isMemoError = true;
      }
      this.setState({
        checkoutModel: { ...this.state.checkoutModel, [name]: value },
        isMemoError
      })
    } else {
      this.setState({
        checkoutModel: { ...this.state.checkoutModel, [name]: value }
      })
    }
  }

  convertToDecimal = event => {
    const { value } = event.target
    if (value > 0) {
      const price = convertToPrice(value)
      const priceLess = price < 0.51 ? true : false
      this.setState({
        checkoutModel: { ...this.state.checkoutModel, price },
        priceLess
      })
    }
  }

  handleSelectChange = selectedOption => {
    this.setState({
      selectedTaxes: selectedOption
    })

    let checkoutModel = this.state.checkoutModel
    let selectedTax = selectedOption.map(item => {
      return item.value
    })
    checkoutModel.taxes = selectedTax
    this.setState({ checkoutModel })
  }

  calculateTotalUSD = () => {
    let totalAmt = this.state.checkoutModel.price
    if (!this.state.selectedTaxes) {
      return totalAmt
    }

    this.state.checkoutModel.taxes.forEach(taxId => {
      this.getTaxRateById(taxId, rate => {
        let taxAmt = (this.state.checkoutModel.price * rate) / 100
        totalAmt = parseFloat(totalAmt) + parseFloat(taxAmt)
      })
    })
    if (this.state.checkoutModel.total != totalAmt) {
      this.setState({
        checkoutModel: { ...this.state.checkoutModel, total: totalAmt }
      })
    }
    return totalAmt
  }

  calculateTaxById = taxId => {
    let taxAmt = 0
    if (this.state.selectedTaxes) {
      this.getTaxRateById(taxId, rate => {
        taxAmt = (this.state.checkoutModel.price * rate) / 100
      })
      return toDollar(
        taxAmt,
        !!this.props.selectedBusiness &&
          !!this.props.selectedBusiness.currency &&
          this.props.selectedBusiness.currency.symbol
      )
    } else {
      return toDollar(
        taxAmt,
        !!this.props.selectedBusiness &&
          !!this.props.selectedBusiness.currency &&
          this.props.selectedBusiness.currency.symbol
      )
    }
  }

  getTaxRateById(taxId, callback) {
    this.state.allTaxes.forEach(tax => {
      if (tax._id === taxId) {
        callback(tax.rate)
      }
    })
  }

  getGrandTotal = () => {
    let taxAmt = 0
    this.state.selectedTaxes.map((singleTax => {
      taxAmt += ((this.state.checkoutModel.price * singleTax.rate) / 100)
    }))

    const totalWithTax = parseFloat(this.state.checkoutModel.price) + parseFloat(taxAmt)
    let proceFee = 0;
    if (this.state.checkoutModel.fee && this.state.checkoutModel.fee.length) {
      const card = this.state.checkoutModel.fee.find((el) => el.type === this.state.selectedPaymentMethod);
      if(totalWithTax && card && Object.keys(card.international_fee).length > 0 ){
        proceFee = parseFloat(totalWithTax * card.international_fee.dynamic + card.international_fee.fixed).toFixed(2)
      }
    }
    const grandTotal = totalWithTax + parseFloat(proceFee)

    return totalWithTax.toFixed(2)
  }

  saveCheckoutMenuAction = () => {
    this.checkoutFormSumbit(1)
  }

  saveCheckoutSubMenuAction = () => {
    this.checkoutFormSumbit(2)
  }

  checkoutFormSumbit = flag => {
    if (this.state.checkoutModel.memo && this.state.isMemoError) {
      this.props.showSnackbar(this.state.memoRequiredMessage, true);
      return false;
    }
    if (this.state.checkoutModel.memo && !this.state.checkoutModel.memoLabel) {
      this.setState({ isMemoError: true });
      this.props.showSnackbar(this.state.memoRequiredMessage, true);
      return false;
    }
    const { isEditMode, selectedCheckout } = this.props
    let isShare = false
    let checkoutObj = this.state.checkoutModel
    let status = checkoutObj.status ? checkoutObj.status : 'Online'
    if (isEditMode === false) {
      status = flag === 1 ? 'Online' : 'Draft'
    } else {
      if (checkoutObj.status === 'Online' && flag === 2) {
        status = 'Offline'
      } else if (
        checkoutObj.status === 'Draft' ||
        (checkoutObj.status === 'Offline' && flag === 1)
      ) {
        status = 'Online'
      }
    }
    isShare = isEditMode

    checkoutObj.status = status
    checkoutObj.message = checkoutObj.message
    checkoutObj.paymentButtons = this.state.paymentButtons
    const checkoutId = checkoutObj.id
    delete checkoutObj.id
    delete checkoutObj.userId
    delete checkoutObj.fee
    let payload = {
      checkoutInput: checkoutObj
    }
    this.saveCheckout(payload, checkoutId, status, isShare)
  }

  saveCheckout = async (payload, checkoutId, status, isShare) => {
    let checkoutInput = payload['checkoutInput']
    let _data = payload
    this.toggleIsSavingStatus()
    checkoutInput['status'] = status
    if (!checkoutInput['itemName'] || !checkoutInput['price']) {
      this.props.showSnackbar('Please enter service name and price.', true)
      this.state.checkoutModel.status = ''
    } else if (checkoutInput['price'] < 0.51) {
      this.props.showSnackbar('Minimum price should be 0.51.', true)
      this.state.checkoutModel.status = ''
    } else {
      this.setState({ loading: true })
      const { isEditMode, actions, type, updateList } = this.props
      try {
        let _price = parseFloat(_data.checkoutInput.price).toFixed(2)
        delete _data.checkoutInput.total
        delete _data.checkoutInput.price
        _data.checkoutInput['price'] = parseFloat(_price)
        if (isEditMode) {
          const res = await updateCheckoutById(checkoutId, _data)
          if (res.statusCode === 200) {
            this.toggleIsSavingStatus()
            this.props.showSnackbar(res.message, false)
            this.setState({ loading: false })
            if (checkoutId && res.data.checkout.status !== 'Draft') {
              history.push('/app/sales/checkouts/share/' + checkoutId)
            } else {
              history.push('/app/sales/checkouts')
            }
          } else {
            this.setState({ loading: false })
            this.props.showSnackbar(res.message, true)
          }
        } else {
          let response = await actions.addCheckout(_data)
          if (response.statusCode === 201) {
            this.toggleIsSavingStatus()
            this.props.showSnackbar(response.message, false)
            this.setState({ loading: false })
            if (
              response &&
              response.data.checkout._id &&
              response.data.checkout.status !== 'Draft'
            ) {
              history.push(
                '/app/sales/checkouts/share/' + response.data.checkout._id
              )
            } else {
              history.push('/app/sales/checkouts')
            }
          } else {
            this.setState({ loading: false })
            this.props.showSnackbar(response.message, true)
          }
        }
      } catch (error) {
        this.setState({ loading: false })
        this.toggleIsSavingStatus()
        this.state.checkoutModel.status = ''
        this.props.showSnackbar(error.message, true)
      }
    }
  }

  toggleIsSavingStatus = () => {
    this.setState({
      isSavingData: !this.state.isSavingData
    })
  }

  goToPreview = () => {
    // history.push({
    //     pathname: '/app/sales/checkouts/preview',
    //     search: '',
    //     state: { detail: this.state.checkoutModel }
    // })
    this.setState({ preview: !this.state.preview })
  }

  onImageUpload = async event => {
    this.setState({ imageLoading: true })
    let checkoutInput = cloneDeep(this.state.checkoutModel)
    const file = event.target.files[0]
	if (!imageUploadValidation(file)) {
      this.props.showSnackbar('Please upload only JPG, PNG or GIF file with size 10MB or below', true)
      this.setState({
        imageLoading: false
      })
    } else {
    let imageUrl
    if (file) {
      imageUrl = await this.getSignedUrl(file)
    }
    checkoutInput['bannerUrl'] = file ? imageUrl : undefined
    this.setState({
      ...this.state.checkoutModel,
      checkoutModel: checkoutInput,
      imageLoading: false
    })
	}
  }

  onVideoUpload = async event => {
    this.setState({ imageLoading: true })
    let checkoutInput = cloneDeep(this.state.checkoutModel)
    const file = event.target.files[0]
	if (!videoUploadValidation(file)) {
      this.props.showSnackbar('Please upload only WebM, MKV, MP4, MOV, MPEG-4, M4V or GIF file with size 500MB or below', true)
      this.setState({
        imageLoading: false
      })
    } else {
    let imageUrl
    if (file) {
      imageUrl = await this.getSignedUrl(file)
    }
    checkoutInput['bannerUrl'] = file ? imageUrl : undefined
    this.setState({
      ...this.state.checkoutModel,
      checkoutModel: checkoutInput,
      imageLoading: false
    })
	}
  }

  getSignedUrl = async file => {
    try {
      const payload = {
        s3Input: {
          contentType: file.type,
          fileName: file.name,
          uploadType: 'checkout_banner'
        }
      }
      const response = await fetchSignedUrl(payload)
      const { sUrl, pUrl } = response.data.signedUrl
      if (sUrl) {
        await uploadImage(sUrl, file, file.type)
        return pUrl
      }
    } catch (error) {
      this.props.openGlobalSnackbar(
        'Something went wrong, please try again later.',
        true
      )
    }
  }

  renderHeader() {
    const { checkoutModel } = this.state
    const { isEditMode } = this.props
    return (
      <React.Fragment>
        <div className="py-header--title">
          <h4 className="py-heading--title">
            <span>
              {isEditMode === false
                ? 'New checkout'
                : checkoutModel.status === 'Draft'
                ? checkoutModel.itemName
                : 'Edit a checkout'}
            </span>
            {isEditMode === true ? <Badge status={checkoutModel.status} /> : ''}
          </h4>
        </div>
      </React.Fragment>
    )
  }

  removeLogoConfirmation = () => {
    this.setState({
      checkoutModel: { ...this.state.checkoutModel, bannerUrl: '' }
    })
  }

  handleCurrency = (e) => {
    this.setState({
      checkoutModel: { ...this.state.checkoutModel, currency: e }
    })
  }

  handleOnTabChange = (tab) => {
if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
        checkoutModel: { ...this.state.checkoutModel, bannerUrl: '',mediaType: tab==="1" ? "image" : "video" }
      })
    }
  }

  handlePaymentButtons = async (e, buttonType) => {
    const payload = {
      peymeInput: {
        [buttonType]: e.target.checked
      }
    }
    this.setState({
      paymentButtons: {
        ...this.state.paymentButtons,
        [buttonType]: e.target.checked
      }
    })
  }
  
  render() {
    const { isEditMode, flag, selectedBusiness, selectedCheckout, isLoadingData } = this.props
    const {
      activeTab,
      collapse,
      modal,
      addNewIncome,
      checkoutModel,
      allTaxes,
      priceLess,
      loading,
      preview,
      imageLoading,
      currencies
    } = this.state
    const _currency =
      selectedBusiness && selectedBusiness.currency
        ? selectedBusiness.currency.code
        : 'USD'
    return (
      <Fragment>
        {preview ? (
          <CheckoutPreviewForm
            checkoutFormSumbit={this.checkoutFormSumbit}
            selectedCheckout={checkoutModel}
            publicLink={
              selectedCheckout &&
              selectedCheckout.publicView &&
              selectedCheckout.publicView.shareableLinkUrl
            }
            isEditMode={true}
            toggleView={this.goToPreview}
          />
        ) : 
          isLoadingData ?
            <Container className="mrT50 text-center">
                <CenterSpinner />
            </Container> :
(          <div className="content-wrapper__main__fixed checkout">
            <header className="py-header py-header--page">
              {this.renderHeader()}
              <div className="py-header--actions">
                {/* <Button
                  onClick={this.goToPreview}
                  color="primary"
                  outline
                  className="me-2"
                >
                  Preview
                </Button>{' '} */}
                <ButtonGroup>
                  <Button
                    color="primary"
                    onClick={loading ? null : this.saveCheckoutMenuAction}
                    disabled={loading}
                  >
                    {loading ? (
                      <Spinner size="sm" color="default" />
                    ) : checkoutModel.status === 'Online' ? (
                      'Save and share'
                    ) : (
                      'Save and turn on'
                    )}
                  </Button>
                  <ButtonDropdown
                    isOpen={this.state.dropdownOpen}
                    toggle={this.toggleDropdown}
                  >
                    <DropdownToggle
                      color="primary"
                      className="ps-2 pe-3 border-left"
                      caret
                    />
                    <DropdownMenu left>
                      <DropdownItem key={0}>
                        {' '}
                        {isEditMode === false
                          ? 'Save as draft'
                          : checkoutModel.status === 'Online'
                          ? 'Save and turn off'
                          : 'Save and share'}
                      </DropdownItem>
                    </DropdownMenu>
                  </ButtonDropdown>
                </ButtonGroup>
              </div>
            </header>
            
            <div className="checkouts-add">
              <div className="checkouts-add__body">
                  <div className="py-table--form">
                      <div className="py-table__header">
                          <Row className="py-table__row">
                              <Col className="py-table__cell" xs={4} md={4}>
                                  <strong>Upload Image/Video</strong>
                              </Col>
                              <Col className="py-table__cell" xs={6} md={6}>
                                  <strong>Product or Service</strong>
                              </Col>
                              <Col className="py-table__cell-amount" xs={2} md={2}>
                                  <strong>Price</strong>
                              </Col>
                          </Row>
                      </div>
                      <div className="py-form--body">                                                
                      <Row className="py-table__row align-items-start product-price-details-row">
                          <Col className="py-table__cell pe-0" xs={4} md={4}>
                            <MediaTypeSwitches
                              onTabChanges={this.handleOnTabChange}
                              activeTab={activeTab}
                              checkoutModel={checkoutModel}
                              imageLoading={imageLoading}
                              removeLogoConfirmation={this.removeLogoConfirmation}
                              onVideoUpload={this.onVideoUpload}
                              onImageUpload={this.onImageUpload}
                            />
                          </Col>
                          <Col className="py-table__cell p-0" xs={8} md={8}>
                              <Row className="py-table__row align-items-start">
                                  <Col className="py-table__cell pe-0" xs={7} md={7}>
                                    <Input
                                      required
                                      type="text"
                                      name="itemName"
                                      className="d-block"
                                      placeholder="What product or service will you be providing?"
                                      value={checkoutModel.itemName}
                                      onChange={this.handleText} />
                                  </Col>
                                  <Col className="py-table__cell text-right" xs={5} md={5}>
                                    <SelectBox
                                      name="currency"
                                      getOptionLabel={(value)=>(value["displayName"])}
                                      getOptionValue={(value)=>(value["code"])}
                                      value={checkoutModel.currency}
                                      onChange={(e) => this.handleCurrency(e)}
                                      options={currencies}
                                      className="d-inline-block text-left py-select--medium"
                                      clearable={false}
                                    />
                                  </Col>                                                        
                                  {/* <Col className="py-table__cell-amount" xs={3} md={2}>
                                      <span className="pull-right variant-numeric">{toDollar(checkoutModel.price, !!selectedBusiness && !!selectedBusiness.currency && selectedBusiness.currency.symbol)}</span>
                                  </Col> */}
                              </Row>
                              <Row className="py-table__row align-items-start py-table__row--taxes">
                                  <Col xs={7} md={7} className="pe-0" >
                                      <Label htmlFor="taxes2" className="checkout-item-row-tax-section__desc__add__label mb-1">Description</Label>
                                      <Input 
                                          name="description" 
                                          id="description" 
                                          placeholder="Describe your product or service" 
                                          type="textarea"
                                          className="checkout-item-row-tax-section__desc__add__field"
                                          value={checkoutModel.description}
                                          onChange={this.handleText}
                                      />
                                  </Col>
                                  <Col xs={5} md={5}>
                                    <Input
                                          type="number"
                                          step='any'
                                          name="price"
                                          className={"text-right  " + (priceLess ? 'less-price w-100' : 'w-100')}
                                          value={checkoutModel.price}
                                          onChange={this.handleText}
                                          onBlur={this.convertToDecimal} />
                                      <Label htmlFor="taxes2" className="checkout-item-row-tax-section__tax__add__label mb-1 mt-2">Tax/VAT</Label>
                                      <div className="checkout-item-row-tax-section__taxes">
                                          <div className="checkout-item-row-tax-section__tax__add">
                                              <Taxes
                                                fetchtaxList={this.fetchtaxList}
                                                taxList={allTaxes}
                                                taxValue={checkoutModel}
                                                isEditMode={true}
                                                onChange={this.handleSelectChange}
                                                placeholder="Select a tax/vat"
                                              />
                                          </div>
                                      </div>
                                      <div>
                                      </div>
                                      <label for="shouldAskProcessingFee" className="py-switch m-0 mt-3">                  
                                          <UncontrolledTooltip placement="top" target="fees_toltip" style={{ "min-width": "280px"}} >By enabling this feature, you can pass your credit/debit card processing fees on to your customers. The line item will show as a “Convenience/Technology Fee” on your invoices and/or checkouts, when enabled. Please note, in some jurisdictions, charging processing fees to your customers is prohibited by law. It is your responsibility to act in accordance with applicable law.</UncontrolledTooltip>
                                          <b className="py-toggle__title me-2">Apply fees to customer&nbsp;
                                            <button className="btn p-0 m-0" id="fees_toltip">
                                              <i className="fal fa-info-circle"></i>
                                            </button>
                                          </b>
                                          <input 
                                            type="checkbox"
                                            id="shouldAskProcessingFee"
                                            name="shouldAskProcessingFee"
                                            className="py-toggle__checkbox"
                                            checked={checkoutModel.fields && checkoutModel.fields.shouldAskProcessingFee}
                                            onChange={this.handleText}
                                          />
                                          <span className="py-toggle__handle"></span>
                                      </label>
                                      {checkoutModel && checkoutModel.fields && checkoutModel.fields.shouldAskProcessingFee &&
                                        <Label htmlFor="grandTotal" className="checkout-item-row-tax-section__tax__add__label mb-1 mt-2">
                                          Total: {getAmountToDisplay(((checkoutModel && checkoutModel.currency) || (selectedBusiness && selectedBusiness.currency)), this.getGrandTotal())}
                                        </Label>
                                      }
                                  </Col>
                                  {/* <Col xs={2} md={2} className="p-0">
                                      <div className="checkout-item-row-tax-section__tax__amount pt-3">
                                          <ul className="list-unstyled w-100 m-0 variant-numeric">
                                              <li>
                                                  {
                                                      checkoutModel['taxes'].length > 0 ?
                                                          checkoutModel['taxes'].map((item, index) => {
                                                              return (
                                                                  <div htmlFor="taxes" className="py-text" key={index} data={item}>{this.calculateTaxById(item)}</div>
                                                              );
                                                          }) : <div htmlFor="taxes" className="py-text">—</div>
                                                  }
                                              </li>
                                          </ul>
                                      </div>
                                  </Col> */}
                              </Row>
                          </Col>
                      </Row>
                          
                      <div className="py-table__row request-address-and-phone-row justify-content-center align-items-end">
                              <div className="py-table__cell">
                                <strong>Request the following:</strong>                                  
                                  <label htmlFor="card" className="py-switch mb-1 mt-1">
                                      <span className="py-toggle__label me-3">Phone number</span>
                                      <input type="checkbox"
                                          id="card"
                                          name="phone"
                                          autocomplete="nope"
                                          className="py-toggle__checkbox"
                                          checked={checkoutModel.fields && checkoutModel.fields.phone}
                                          onChange={this.handleText}
                                      />
                                      <span className="py-toggle__handle"></span>
                                  </label>
                              </div>
                              <div className="py-table__cell">
                                  <label htmlFor="address" className="py-switch mb-1 mt-1">
                                      <span className="py-toggle__label me-3">Billing address</span>
                                      <input
                                          type="checkbox"
                                          id="address"
                                          name="address"
                                          className="py-toggle__checkbox"
                                          checked={checkoutModel.fields && checkoutModel.fields.address}
                                          onChange={this.handleText}
                                      />
                                      <span className="py-toggle__handle"></span>
                                  </label>
                              </div>
                              <div className="py-table__cell">
                                  <label htmlFor="shippingAddress" className="py-switch mb-1 mt-1">
                                      <span className="py-toggle__label me-3">Shipping address</span>
                                      <input
                                          type="checkbox"
                                          id="shippingAddress"
                                          name="shippingAddress"
                                          className="py-toggle__checkbox"
                                          checked={checkoutModel.fields && checkoutModel.fields.shippingAddress}
                                          onChange={this.handleText}
                                      />
                                      <span className="py-toggle__handle"></span>
                                  </label>
                              </div>
                          </div>
                          <div className="py-table__row request-address-and-phone-row justify-content-center">
                            <div className="py-table__cell">
                              <label htmlFor="memo" className="py-switch mb-1 mt-1">
                                <span className="py-toggle__label me-3">Memo</span>
                                <input
                                  type="checkbox"
                                  id="memo"
                                  name="memo"
                                  className="py-toggle__checkbox"
                                  checked={checkoutModel.fields && checkoutModel.memo}
                                  onChange={this.handleText}
                                />
                                <span className="py-toggle__handle"></span>
                              </label>
                            </div>
                            {checkoutModel.memo
                              ? <div className="py-table__cell ps-0">
                                  <label htmlFor="memoLabel" className="pull-right w-100px">
                                    <Input
                                      type="text"
                                      name="memoLabel"
                                      placeholder="What would you like to request?"
                                      value={checkoutModel.memoLabel}
                                      onChange={this.handleText}
                                      onBlur={this.handleMemoLabel}
                                      className="form-control"
                                      value={checkoutModel.memoLabel}
                                    />
                                    <span className='memo-error'>
                                      <FormValidationError
                                        message={this.state.memoRequiredMessage}
                                        showError={this.state.isMemoError}
                                      />
                                    </span>
                                  </label>
                              </div>
                              : null
                            }
                          </div>
                          {this.props?.selectedBusiness?.provider === PROVIDER_NAME.PROVIDER_PAYPAL &&
                            <div className="py-table__row request-address-and-phone-row justify-content-center">
                              <strong>Enable the following:</strong>
                              <div className="py-table__cell">
                                <label htmlFor="payWithPaypal" className="py-switch mb-1 mt-1">
                                  <span className="py-toggle__label me-3">PayPal&nbsp;</span>
                                  <input
                                    type="checkbox"
                                    id="payWithPaypal"
                                    name="payWithPaypal"
                                    className="py-toggle__checkbox"
                                    checked={this.state.paymentButtons['payWithPaypal']}
                                    onChange={e => this.handlePaymentButtons(e, 'payWithPaypal')}
                                  />
                                  <span className="py-toggle__handle" />
                                </label>
                              </div>
                              <div className="py-table__cell">
                                <label htmlFor="payLaterWithPaypal" className="py-switch mb-1 mt-1">
                                  <span className="py-toggle__label me-3">Pay Later&nbsp;</span>
                                  <input
                                    type="checkbox"
                                    id="payLaterWithPaypal"
                                    name="payLaterWithPaypal"
                                    className="py-toggle__checkbox"
                                    checked={this.state.paymentButtons['payLaterWithPaypal']}
                                    onChange={e => this.handlePaymentButtons(e, 'payLaterWithPaypal')}
                                  />
                                  <span className="py-toggle__handle" />
                                </label>
                              </div>
                              <div className="py-table__cell">
                                <label htmlFor="payWithVenmo" className="py-switch mb-1 mt-1">
                                  <span className="py-toggle__label me-3">Venmo&nbsp;</span>
                                  <input
                                    type="checkbox"
                                    id="payWithVenmo"
                                    name="payWithVenmo"
                                    className="py-toggle__checkbox"
                                    checked={this.state.paymentButtons['payWithVenmo']}
                                    onChange={e => this.handlePaymentButtons(e, 'payWithVenmo')}
                                  />
                                  <span className="py-toggle__handle" />
                                </label>
                              </div>
                            </div>
                          }
                          <div className="py-table__row request-address-and-phone-row justify-content-center">                         
                            <div className="py-table__cell">
                                  <label htmlFor="showQuantity" className="py-switch mb-1 mt-1">
                                      <span className="py-toggle__label me-3">Per customer limit</span>
                                      <input
                                          type="checkbox"
                                          id="showQuantity"
                                          name="showQuantity"
                                          className="py-toggle__checkbox"
                                          checked={checkoutModel && checkoutModel.showQuantity}
                                          onChange={this.handleText}
                                      />
                                      <span className="py-toggle__handle"></span>
                                  </label>
                              </div>
                              {checkoutModel.showQuantity
                                  ? <div className="py-table__cell ps-0">
                                      <label htmlFor="maxQuantity" className="pull-right w-100px">
                                          {/* <span className="me-3 mb-1 d-inline-block">Max quantity</span> */}
                                          <Input
                                              type="number"
                                              name="maxQuantity"
                                              min="1"
                                              max="99999"
                                              value={checkoutModel.maxQuantity}
                                              onChange={this.handleText}
                                              onBlur={this.handleMaxQuantity}
                                              className="text-right form-control"
                                              value={checkoutModel.maxQuantity} />
                                      </label>
                                  </div>
                                  : null
                              }
                          </div>
                          <Row className="py-table__row">
                              <Col md={12} className="py-table__cell">
                                  <Label htmlFor="message" className="mt-2 mb-1">After successful payment, display the following message:</Label>
                                  <Input
                                      type="textarea"
                                      id="message"
                                      className="message-textarea"
                                      name="message"
                                      placeholder="e.g. Thank you for your payment."
                                      value={checkoutModel && checkoutModel.message && checkoutModel.message.success}
                                      onChange={this.handleText} />
                              </Col>
                          </Row>

                      </div>
                  </div>
              </div>
          </div>
          </div>
        )}
      </Fragment>
    )
  }
}

const mapStateToProps = state => {
  return {
    selectedCheckout: state.checkoutReducer.selectedCheckout,
    selectedBusiness: state.businessReducer.selectedBusiness,
    errorMessage: state.checkoutReducer.errorMessage,
    isCheckoutAdd: state.checkoutReducer,
    paymentSettings: state?.paymentSettings?.data
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
  connect(mapStateToProps, mapDispatchToProps)(CheckoutForm)
)
