import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import {
  Card,
  CardBody,
  Button,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  Spinner,
} from 'reactstrap'
import { cloneDeep } from 'lodash'
import { SketchPicker, ChromePicker } from 'react-color'
import { connect } from 'react-redux'
import SelectBox from '../../../../../../utils/formWrapper/SelectBox'
import CenterSpinner from '../../../../../../global/CenterSpinner'
import {
  addSalesSetting,
  fetchSalesSetting,
} from '../../../../../../api/SettingService'
import {
  paymentTerms,
  invoiceSettingPayload,
} from '../supportFunctionality/helper'
import { setUserSettings } from '../../../../../../actions/loginAction'
import {
  openGlobalSnackbar,
  updateData,
} from '../../../../../../actions/snackBarAction'
import {
  fetchSignedUrl,
  uploadImage,
} from '../../../../../../api/businessService'
import {
  _documentTitle,
  handleAclPermissions,
} from '../../../../../../utils/GlobalFunctions'
import FormValidationError from '../../../../../../global/FormValidationError'

const TempalteImageUrl = {
  contemporary: `${process.env.REACT_APP_CDN_URL}/static/invoice-preview/contemporary.png`,
  classic: `${process.env.REACT_APP_CDN_URL}/static/invoice-preview/classic.png`,
  modern: `${process.env.REACT_APP_CDN_URL}/static/invoice-preview/modern.png`,
}

class InvoiceCustomization extends Component {
  state = {
    modal: false,
    removeCompanyLogo: false,
    invoiceSettingsInput: invoiceSettingPayload(),
    loading: false,
    displayColorPicker: false,
    color: '#000',
    btnLoad: false,
    column1: '',
    column2: '',
    column3: '',
    column4: '',
    defaultTitleErr: false,
    estDefaultTitleErr: false,
    columnErr: [],
  }

  componentDidMount() {
    const { businessInfo } = this.props
    _documentTitle(businessInfo, `Customization Settings`)
    this.fetchSettingData()
    document.addEventListener('click', this.handleClickOutside.bind(this))
  }

  componentDidUpdate(prevProps) {
    const { refreshData } = this.props
    if (refreshData !== prevProps.refreshData) {
      this.fetchSettingData()
    }
  }
  handleClickOutside(e) {
    if (!e.target.id.includes('swatch')) {
      this.setState({ displayColorPicker: false })
    }
  }

  fetchSettingData = async () => {
    setTimeout(this.setState({ loading: true }), 300)
    try {
      const request = await fetchSalesSetting()
      if (request.data && request.data.salesSetting) {
        const { itemHeading } = request.data.salesSetting
        this.setState({
          invoiceSettingsInput: request.data.salesSetting,
          loading: false,
        })
        if (!!itemHeading) {
          if (
            itemHeading.column1.name !== 'Items' &&
            itemHeading.column1.name !== 'Services' &&
            itemHeading.column1.name !== 'Products'
          ) {
            this.setState({
              column1: itemHeading.column1.name,
            })
          }
          if (
            itemHeading.column2.name !== 'Quantity' &&
            itemHeading.column2.name !== 'Hours'
          ) {
            this.setState({
              column2: itemHeading.column2.name,
            })
          }
          if (
            itemHeading.column3.name !== 'Price' &&
            itemHeading.column3.name !== 'Rate'
          ) {
            this.setState({
              column3: itemHeading.column3.name,
            })
          }
          if (itemHeading.column4.name !== 'Amount') {
            this.setState({
              column4: itemHeading.column4.name,
            })
          }
        }
      }
    } catch (error) {
      this.props.openGlobalSnackbar(
        'Something went wrong, please try again later.',
        true,
      )
    }
  }

  handleInvoiceSettings = (event, field) => {
    let invoiceSettingsInput = cloneDeep(this.state.invoiceSettingsInput)
    if (field === 'defaultPaymentTerm') {
      invoiceSettingsInput.invoiceSetting[field] = event
    } else {
      const { name, value } = event.target
      invoiceSettingsInput.invoiceSetting[name] = value
      if (!!value) {
        this.setState({
          [`${name}Err`]: false,
        })
      } else {
        this.setState({
          [`${name}Err`]: true,
        })
      }
    }
    this.setState({
      invoiceSettingsInput,
    })
  }

  handleItemChange = ({ target: { name, value } }) => {
    let updateSettings = cloneDeep(this.state.invoiceSettingsInput)
    updateSettings.itemHeading[name].name = value

    this.setState({
      [name]: value,
      invoiceSettingsInput: updateSettings,
    })
    if (!!value) {
      const err = this.state.columnErr.filter((item) => item !== name)
      this.setState({ columnErr: err })
    } else {
      let err = this.state.columnErr.filter((item) => item !== name)
      err = err.concat(name)
      this.setState({ columnErr: err })
    }
  }

  handleItemHeading = (event, isOther) => {
    let updateSettings = cloneDeep(this.state.invoiceSettingsInput)
    const { name, value } = event.target
    if (isOther) {
      updateSettings.itemHeading[name].name = value
    }

    if (name.includes('column')) {
      updateSettings.itemHeading[name].name = value
      if (!isOther) {
        this.setState({ [name]: '' })
      }
      if (!!value) {
        const err = this.state.columnErr.filter((item) => item !== name)
        this.setState({ columnErr: err })
      }
    } else {
      if (name === 'hideDescription') {
        updateSettings.itemHeading['hideItem'] = false
      } else if (name === 'hideItem') {
        updateSettings.itemHeading['hideDescription'] = false
      }
      updateSettings.itemHeading[name] = !updateSettings.itemHeading[name]
    }
    this.setState({ invoiceSettingsInput: updateSettings })
  }

  handleEstimateSetting = (event) => {
    let updateSettings = cloneDeep(this.state.invoiceSettingsInput)
    const { name, value } = event.target
    updateSettings.estimateSetting[name] = value
    if (name === 'defaultTitle') {
      if (!!value) {
        this.setState({ estDefaultTitleErr: false })
      } else {
        this.setState({ estDefaultTitleErr: true })
      }
    }
    this.setState({ invoiceSettingsInput: updateSettings })
  }

  handleField = (event) => {
    let updateSettings = cloneDeep(this.state.invoiceSettingsInput)
    const { name, value } = event.target
    if (name === 'removeCompanyLogo') {
      this.setState({ removeCompanyLogo: !this.state.removeCompanyLogo })
    } else {
      if (name === 'displayLogo') {
        updateSettings[name] = !updateSettings[name]
      } else {
        updateSettings[name] = value
      }
    }
    this.setState({
      invoiceSettingsInput: updateSettings,
    })
  }

  handleModal = (preview) => {
    this.setState({
      modal: !this.state.modal,
      preview,
    })
  }

  handleSubmit = async (e) => {
    e.preventDefault()
    let invoiceSettingsInput = cloneDeep(this.state.invoiceSettingsInput)
    let err = []
    if (this.state.removeCompanyLogo) {
      invoiceSettingsInput.companyLogo = ''
      invoiceSettingsInput.displayLogo = false
    }
    delete invoiceSettingsInput._id
    delete invoiceSettingsInput.createdAt
    delete invoiceSettingsInput.updatedAt
    delete invoiceSettingsInput.__v
    let salesSettingInput = {
      ...invoiceSettingsInput,
    }
    if (!!invoiceSettingsInput.invoiceSetting.defaultTitle) {
      this.setState({
        defaultTitleErr: false,
      })
    } else {
      this.setState({
        defaultTitleErr: true,
      })
    }

    if (!!invoiceSettingsInput.estimateSetting.defaultTitle) {
      this.setState({
        estDefaultTitleErr: false,
      })
    } else {
      this.setState({
        estDefaultTitleErr: true,
      })
    }
    if (!!invoiceSettingsInput.itemHeading) {
      const arr = ['column1', 'column2', 'column3', 'column4']
      err = arr.filter((item) => {
        return (
          invoiceSettingsInput.itemHeading[item].name === '' ||
          invoiceSettingsInput.itemHeading[item].name === 'Other'
        )
      })
      this.setState({ columnErr: err })
    }
    if (
      err.length === 0 &&
      !!invoiceSettingsInput.estimateSetting.defaultTitle &&
      !!invoiceSettingsInput.invoiceSetting.defaultTitle
    ) {
      try {
        this.setState({ btnLoad: true })
        let request = await addSalesSetting({ salesSettingInput })
        if (request.statusCode === 200) {
          this.props.updateData()
          this.props.setUserSettings(request.data.salesSetting)
          this.setState({ btnLoad: false })
          this.props.openGlobalSnackbar(request.message, false)
        } else {
          this.setState({ btnLoad: false })
          this.props.openGlobalSnackbar(request.message, true)
        }
      } catch (error) {
        this.setState({ btnLoad: false })
        this.props.openGlobalSnackbar(error.message, true)
      }
    }
  }

  // onImageUpload = async (event) => {
  //     let updateSettings = cloneDeep(this.state.invoiceSettingsInput)
  //     const file = event.target.files[0]
  //     let imageUrl
  //     if (file) {
  //         imageUrl = await this.getSignedUrl(file)
  //     }
  //     updateSettings["companyLogo"] = file ? imageUrl : undefined
  //     updateSettings["displayLogo"] = file ? true : false

  //     Vibrant.from(imageUrl).getPalette()
  //         .then(palette => {
  //             updateSettings.accentColour = palette.Vibrant.hex
  //             this.setState({ invoiceSettingsInput: updateSettings })
  //         })
  //         .catch(() => {
  //             this.setState({ invoiceSettingsInput: updateSettings })
  //         });
  // }
  onImageUpload = (event) => {
    try {
      const file = event.target.files[0]
      if (!file) return

      // Validate size < 10MB
      if (file.size > 10 * 1024 * 1024) {
        openGlobalSnackbar('File size must be less than 10MB')
        return
      }

      const reader = new FileReader()

      reader.onload = (e) => {
        this.setState((prev) => ({
          invoiceSettingsInput: {
            ...prev.invoiceSettingsInput,
            companyLogo: e.target.result,
          },
          removeCompanyLogo: false, // automatically turn off remove
        }))
      }

      reader.onerror = () => {
        openGlobalSnackbar('Error reading file. Please try again.')
      }

      reader.readAsDataURL(file)
    } catch (err) {
      console.error('Image upload error:', err)
      openGlobalSnackbar('Something went wrong while uploading the image.')
    }
  }

  getSignedUrl = async (file) => {
    try {
      const payload = {
        s3Input: {
          contentType: file.type,
          fileName: file.name,
          uploadType: 'logo',
        },
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
        true,
      )
    }
  }

  showTemplates = () => {
    const preview = this.state.preview
    switch (preview) {
      case 3:
        return <img src={TempalteImageUrl.modern} className="img-fluid" />
      case 2:
        return <img src={TempalteImageUrl.classic} className="img-fluid" />
      default:
        return <img src={TempalteImageUrl.contemporary} className="img-fluid" />
    }
  }

  handleColorPicker = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  }

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  }

  handleClose = () => {
    this.setState({ displayColorPicker: false })
  }

  handleChange = (color) => {
    this.setState((prevState) => ({
      invoiceSettingsInput: {
        ...prevState.invoiceSettingsInput,
        accentColour: color.hex === 'transparent' ? '#1c252c' : color.hex,
      },
      color: color.rgb,
    }))
  }

  handleColorInputChange = (e) => {
    this.setState({
      invoiceSettingsInput: {
        ...this.state.invoiceSettingsInput,
        accentColour: e.target.value,
      },
      color: e.target.value,
    })
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside.bind(this))
  }

  render() {
    const {
      modal,
      invoiceSettingsInput,
      removeCompanyLogo,
      preview,
      loading,
      displayColorPicker,
      color,
      btnLoad,
    } = this.state
    const { invoiceSetting, estimateSetting, itemHeading } =
      invoiceSettingsInput
    const { businessInfo } = this.props
    const colorStyle = {
      width: '16px',
      height: '16px',
      borderRadius: '2px',
      background: `${invoiceSettingsInput.accentColour}`,
    }
    const swatch = {
      padding: '3px',
      background: '#fff',
      borderRadius: '2px',
      border: '1px solid #ADC0C7',
      display: 'inline-block',
      cursor: 'pointer',
      marginLeft: '6px',
      marginTop: '8px',
    }
    const popover = {
      position: 'absolute',
      zIndex: '2',
    }
    const cover = {
      // position: 'fixed',
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px',
    }
    let userId = localStorage.getItem('user.id')
    return (
      <div className="py-page__content">
        <div className="py-page__inner">
          <header className="py-header--page flex">
            <div className="py-header--title">
              <h2 className="py-heading--title">Customization</h2>
            </div>
          </header>
          <p className="py-text">
            <strong>Tip:</strong> To add or edit your contact information
            (address, website, etc.) that appears on an invoice, visit{' '}
            <strong>
              <Link
                className="py-text--link"
                to={`/app/accounts/business/${businessInfo._id}/edit`}
              >
                your profile.
              </Link>
            </strong>
          </p>

          {loading ? (
            <div className="spinner-wrapper">
              <CenterSpinner />
            </div>
          ) : (
            <div className="content">
              <h4 className="py-heading--section-title">General settings</h4>
              <Form className="py-form-field--condensed">
                <div className="row mx-n2 mb-2">
                  <div className="col-sm-4 text-sm-end px-2">
                    <Label
                      htmlFor="exampleEmail"
                      className="py-form-field__label--align-top pt-2 pb-1"
                    >
                      Template
                    </Label>
                  </div>
                  <div className="col-sm-8 px-2">
                    <ul className="invoice-template">
                      <li>
                        <a
                          onClick={(e) => this.handleModal(1)}
                          href="javascript:void(0)"
                          className="invoice-preview"
                        >
                          <div
                            className="invoice-thumbnail"
                            style={{
                              overflow: 'hidden',
                              height: '200px',
                              borderRadius: '4px',
                            }}
                          >
                            <img
                              className="img-thumbnail"
                              src={TempalteImageUrl.contemporary}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'top',
                                marginTop: 0,
                              }}
                            />
                          </div>
                        </a>
                        <label
                          htmlFor="id_invoice_template_0"
                          className="py-radio"
                        >
                          <input
                            type="radio"
                            name="template"
                            value="contemporary"
                            id="id_invoice_template_0"
                            onChange={this.handleField}
                            checked={
                              invoiceSettingsInput.template === 'contemporary'
                            }
                          />
                          <span className="py-form__element__faux"></span>
                          <span className="py-form__element__label">
                            Contemporary
                          </span>
                        </label>
                      </li>
                      <li>
                        <a
                          onClick={(e) => this.handleModal(2)}
                          href="javascript:void(0)"
                          className="invoice-preview"
                        >
                          <div
                            className="invoice-thumbnail"
                            style={{
                              overflow: 'hidden',
                              height: '200px',
                              borderRadius: '4px',
                            }}
                          >
                            <img
                              className="img-thumbnail"
                              src={TempalteImageUrl.classic}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'top',
                                marginTop: 0,
                              }}
                            />
                          </div>
                        </a>
                        <label
                          htmlFor="id_invoice_template_1"
                          className="py-radio"
                        >
                          <input
                            name="template"
                            type="radio"
                            value="classic"
                            id="id_invoice_template_1"
                            checked={
                              invoiceSettingsInput.template === 'classic'
                            }
                            onChange={this.handleField}
                          />
                          <span className="py-form__element__faux"></span>
                          <span className="py-form__element__label">
                            Classic
                          </span>
                        </label>
                      </li>
                      <li>
                        <a
                          onClick={(e) => this.handleModal(3)}
                          href="javascript:void(0)"
                          className="invoice-preview"
                        >
                          <div
                            className="invoice-thumbnail"
                            style={{
                              overflow: 'hidden',
                              height: '200px',
                              borderRadius: '4px',
                            }}
                          >
                            <img
                              className="img-thumbnail"
                              src={TempalteImageUrl.modern}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'top',
                                marginTop: 0,
                              }}
                            />
                          </div>
                        </a>
                        <label
                          htmlFor="id_invoice_template_2"
                          className="py-radio"
                        >
                          <input
                            type="radio"
                            name="template"
                            id="id_invoice_template_2"
                            checked={invoiceSettingsInput.template === 'modern'}
                            value="modern"
                            onChange={this.handleField}
                          />
                          <span className="py-form__element__faux"></span>
                          <span className="py-form__element__label">
                            Modern
                          </span>
                        </label>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="row mx-n2 mb-2">
                  <div className="col-sm-4 text-sm-end px-2">
                    <Label className="py-form-field__label--align-top pt-2 pb-1">
                      Logo
                    </Label>
                  </div>
                  <div className="col-sm-8 px-2">
                    <div className="image_well">
                      <span
                        className="image d-flex"
                        style={{
                          background: `url(${invoiceSettingsInput.companyLogo ? '' : '/assets/icons/no-logo.gif'}) 50% 50% no-repeat`,
                          width: `${invoiceSettingsInput.companyLogo ? 'auto' : '77px'} `,
                        }}
                      >
                        {invoiceSettingsInput.companyLogo && (
                          <img
                            src={invoiceSettingsInput.companyLogo}
                            height="75"
                            width="auto"
                          />
                        )}
                      </span>
                      <div className="actions">
                        <span className="upload">
                          <input
                            name="companyLogo"
                            type="file"
                            accept="image/*"
                            onChange={this.onImageUpload}
                          />
                        </span>
                        {invoiceSettingsInput.companyLogo && (
                          <div className="checkbox">
                            <label className="py-checkbox remove-logo-checkbox">
                              <input
                                type="checkbox"
                                name={'removeCompanyLogo'}
                                value={removeCompanyLogo}
                                checked={removeCompanyLogo}
                                onChange={this.handleField}
                              />
                              <span className="py-form__element__faux"></span>
                              <span className="py-form__element__label">
                                Remove Logo
                              </span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="py-form-field__hint">
                      Upload an image that is less than 10MB in size.
                    </span>
                    <div className="checkbox">
                      <label className="py-checkbox">
                        <input
                          type="checkbox"
                          name={'displayLogo'}
                          value={invoiceSettingsInput.displayLogo}
                          checked={invoiceSettingsInput.displayLogo}
                          onChange={this.handleField}
                          disabled={invoiceSettingsInput.companyLogo === ''}
                        />
                        <span className="py-form__element__faux"></span>
                        <span className="py-form__element__label">
                          Display logo
                        </span>
                      </label>
                      {!invoiceSettingsInput.companyLogo && (
                        <div className="py-form-field__hint">
                          You must have an uploaded logo to display it
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="row mx-n2 mb-2">
                  <div className="col-4 col-sm-4 text-right px-2">
                    <Label
                      htmlFor="accent_color"
                      className="py-form-field__label is-required pt-3"
                    >
                      Accent color
                    </Label>
                  </div>
                  <div className="col-8 col-sm-8 px-2">
                    <div className="d-flex align-items-start">
                      <Input
                        type="text"
                        name="color"
                        className="py-form__element__small"
                        value={invoiceSettingsInput.accentColour}
                        id="accent_color"
                        placeholder="password placeholder"
                        onChange={this.handleColorInputChange}
                      />
                      <div className="position-relative">
                        <div style={swatch} onClick={this.handleClick}>
                          <div style={colorStyle} id="swatch-wrap" />
                        </div>
                        {displayColorPicker ? (
                          <div
                            style={popover}
                            id="swatch"
                            onBlur={this.handleClose}
                          >
                            <div style={cover} onClick={this.handleClose} />
                            <SketchPicker
                              color={color}
                              onChange={this.handleChange}
                              display={displayColorPicker}
                              disableAlpha={true}
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="py-form-field__hint">
                      Choose an accent color to use in the invoice.
                    </div>
                  </div>
                </div>
                {!handleAclPermissions(['Viewer', 'Editor']) && (
                  <div className="row mx-n2 mb-2 mt-4 custo-fixed-line">
                    <div className="col-4 col-sm-4 text-right px-2"></div>
                    <div className="col-8 col-sm-8 px-2">
                      <Button
                        onClick={this.handleSubmit}
                        color="primary"
                        disabled={btnLoad}
                      >
                        {btnLoad ? (
                          <Spinner size="sm" color="default" />
                        ) : (
                          'Save'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                <hr />
                <h5 className="py-heading--section-title">Invoice settings</h5>
                <div className="row mx-n2 mb-2">
                  <div className="col-4 col-sm-4 text-right px-2">
                    <Label
                      htmlFor="payment_terms"
                      className="py-form-field__label is-required mt-2"
                    >
                      Default payment terms
                    </Label>
                  </div>
                  <div className="col-8 col-sm-8 px-2">
                    <SelectBox
                      required
                      aria-required
                      clearable={false}
                      id="payment_terms"
                      getOptionLabel={(value) => value['value']}
                      getOptionValue={(value) => value['key']}
                      className="py-form__element__medium"
                      value={
                        invoiceSetting.defaultPaymentTerm
                          ? invoiceSetting.defaultPaymentTerm
                          : paymentTerms[0]
                      }
                      onChange={(item) =>
                        this.handleInvoiceSettings(item, 'defaultPaymentTerm')
                      }
                      options={paymentTerms}
                    />
                  </div>
                </div>
                <div className="row mx-n2 mb-2">
                  <div className="col-4 col-sm-4 text-right px-2">
                    <Label
                      htmlFor="default_title_1"
                      className="py-form-field__label is-required pt-3"
                    >
                      Default title
                    </Label>
                  </div>
                  <div className="col-8 col-sm-8 px-2">
                    <div className="inputError">
                      <Input
                        type="text"
                        className="py-form__element__medium"
                        id="default_title_1"
                        name="defaultTitle"
                        value={invoiceSetting.defaultTitle}
                        onChange={this.handleInvoiceSettings}
                      />
                      <FormValidationError
                        showError={this.state.defaultTitleErr}
                      />
                    </div>
                    <div className="py-form-field__hint">
                      The default title for all invoices. You can change this on
                      each invoice.
                    </div>
                  </div>
                </div>
                <div className="row mx-n2 mb-2">
                  <div className="col-4 col-sm-4 text-right px-2">
                    <Label
                      htmlFor="def_subhead"
                      className="py-form-field__label pt-3"
                    >
                      Default subheading
                    </Label>
                  </div>
                  <div className="col-8 col-sm-8 px-2">
                    <Input
                      type="text"
                      className="py-form__element__medium"
                      id="def_subhead"
                      name="defaultSubTitle"
                      value={invoiceSetting.defaultSubTitle}
                      onChange={this.handleInvoiceSettings}
                    />
                    <div className="py-form-field__hint">
                      This will be displayed below the title of each invoice.
                      Useful for things like business identification numbers.
                    </div>
                  </div>
                </div>
                <div className="row mx-n2 mb-2">
                  <div className="col-4 col-sm-4 text-right px-2">
                    <Label
                      htmlFor="def_footer_1"
                      className="py-form-field__label pt-3"
                    >
                      Default footer
                    </Label>
                  </div>
                  <div className="col-8 col-sm-8 px-2">
                    <Input
                      type="text"
                      className="py-form__element__medium"
                      id="def_footer_1"
                      name="defaultFooter"
                      value={invoiceSetting.defaultFooter}
                      onChange={this.handleInvoiceSettings}
                    />
                    <div className="py-form-field__hint">
                      This will be displayed at the bottom of each invoice.
                    </div>
                  </div>
                </div>
                <div className="row mx-n2 mb-2">
                  <div className="col-4 col-sm-4 text-right px-2">
                    <Label
                      htmlFor="standard_memo_1"
                      className="py-form-field__label"
                    >
                      Standard memo
                    </Label>
                  </div>
                  <div className="col-8 col-sm-8 px-2">
                    <Input
                      type="textarea"
                      className="py-form__element__medium textarea-height"
                      id="standard_memo_1"
                      name="defaultMemo"
                      value={invoiceSetting.defaultMemo}
                      onChange={this.handleInvoiceSettings}
                    />
                    <div className="py-form-field__hint">
                      Appears on each invoice. You can choose to override it
                      when you create an invoice.
                    </div>
                  </div>
                </div>
                {!handleAclPermissions(['Viewer', 'Editor']) && (
                  <div className="row mx-n2 mb-2 mt-4 custo-fixed-line">
                    <div className="col-4 col-sm-4 text-right px-2"></div>
                    <div className="col-8 col-sm-8 px-2">
                      <Button
                        onClick={this.handleSubmit}
                        color="primary"
                        disabled={btnLoad}
                      >
                        {btnLoad ? (
                          <Spinner size="sm" color="default" />
                        ) : (
                          'Save'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                <hr />
                <h5 className="py-heading--section-title">Estimate settings</h5>
                <div className="row mx-n2 mb-2">
                  <div className="col-4 col-sm-4 text-right px-2">
                    <Label
                      htmlFor="def_title_2"
                      className="py-form-field__label is-required pt-3"
                    >
                      Default title
                    </Label>
                  </div>
                  <div className="col-8 col-sm-8 px-2">
                    <div className="inputError">
                      <Input
                        required
                        type="text"
                        className="py-form__element__medium"
                        name="defaultTitle"
                        id="def_title_2"
                        value={estimateSetting.defaultTitle}
                        onChange={this.handleEstimateSetting}
                      />
                      <FormValidationError
                        showError={this.state.estDefaultTitleErr}
                      />
                    </div>
                    <div className="py-form-field__hint">
                      The default title for all estimates. You can change this
                      on each estimate.
                    </div>
                  </div>
                </div>
                <div className="row mx-n2 mb-2">
                  <div className="col-4 col-sm-4 text-right px-2">
                    <Label
                      htmlFor="def_sub_2"
                      className="py-form-field__label pt-3"
                    >
                      Default subheading
                    </Label>
                  </div>
                  <div className="col-8 col-sm-8 px-2">
                    <Input
                      type="text"
                      name="defaultSubTitle"
                      id="def_sub_2"
                      className="py-form__element__medium"
                      value={estimateSetting.defaultSubTitle}
                      onChange={this.handleEstimateSetting}
                    />
                    <div className="py-form-field__hint">
                      This will be displayed below the title of each estimate.
                      Useful for things like business identification numbers.
                    </div>
                  </div>
                </div>
                <div className="row mx-n2 mb-2">
                  <div className="col-4 col-sm-4 text-right px-2">
                    <Label
                      htmlFor="def_footer_2"
                      className="py-form-field__label pt-3"
                    >
                      Default footer
                    </Label>
                  </div>
                  <div className="col-8 col-sm-8 px-2">
                    <Input
                      type="text"
                      name="defaultFooter"
                      id="def_footer_2"
                      className="py-form__element__medium"
                      value={estimateSetting.defaultFooter}
                      onChange={this.handleEstimateSetting}
                    />
                    <div className="py-form-field__hint">
                      This will be displayed at the bottom of each estimate.
                    </div>
                  </div>
                </div>
                <div className="row mx-n2 mb-2">
                  <div className="col-4 col-sm-4 text-right px-2">
                    <Label
                      htmlFor="standard_2"
                      className="py-form-field__label--align-top pt-1"
                    >
                      Standard memo for new estimates
                    </Label>
                  </div>
                  <div className="col-8 col-sm-8 px-2">
                    <Input
                      type="textarea"
                      name="defaultMemo"
                      id="standard_2"
                      className="py-form__element__medium textarea-height"
                      value={estimateSetting.defaultMemo}
                      onChange={this.handleEstimateSetting}
                    />
                    <div className="py-form-field__hint">
                      Appears on each estimate. You can choose to override it
                      when you create an estimate.
                    </div>
                  </div>
                </div>
                {!handleAclPermissions(['Viewer', 'Editor']) && (
                  <div className="row mx-n2 mb-2 mt-4 custo-fixed-line">
                    <div className="col-4 col-sm-4 text-right px-2"></div>
                    <div className="col-8 col-sm-8 px-2">
                      <Button
                        onClick={this.handleSubmit}
                        color="primary"
                        disabled={btnLoad}
                      >
                        {btnLoad ? (
                          <Spinner size="sm" color="default" />
                        ) : (
                          'Save'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                <hr />
                <h5 className="py-heading--section-title">
                  Column header settings
                </h5>
                <p>
                  Edit the titles of the columns of your invoice & estimates:
                </p>
                <div className="row mx-n2 mb-2">
                  <div className="col-4 col-sm-4 text-right px-2">
                    <Label className="py-form-field__label--align-top">
                      Items
                    </Label>
                  </div>
                  <div className="col-8 col-sm-8 px-2">
                    <ul className="py-list--small">
                      {['Items', 'Services', 'Products', 'Other'].map(
                        (itemType, index) => {
                          return (
                            <div key={itemType + index}>
                              <li>
                                {' '}
                                <label className="py-radio">
                                  <input
                                    type="radio"
                                    name="column1"
                                    checked={
                                      itemType === 'Other'
                                        ? !['Items', 'Services', 'Products'].includes(
                                            itemHeading.column1.name,
                                          )
                                        : itemHeading.column1.name === itemType
                                    }
                                    value={itemType}
                                    onChange={this.handleItemHeading}
                                  />
                                  <span className="py-form__element__faux"></span>
                                  <span className="py-form__element__label">
                                    {itemType}
                                    <span className="py-form-field__hint py-text__emphasized ms-1">
                                      {itemType === 'Items' ? '(Default)' : ''}
                                    </span>
                                  </span>
                                  {itemType === 'Other' ? (
                                    <Fragment>
                                      <div className="inputError">
                                        <Input
                                          type="text"
                                          name="column1"
                                          value={this.state.column1}
                                          onChange={(e) =>
                                            this.handleItemChange(e, 'Other')
                                          }
                                          className="py-form__element__small"
                                        />
                                        <FormValidationError
                                          showError={this.state.columnErr.includes(
                                            'column1',
                                          )}
                                        />
                                      </div>
                                    </Fragment>
                                  ) : (
                                    ''
                                  )}
                                </label>
                              </li>
                            </div>
                          )
                        },
                      )}
                    </ul>
                  </div>
                </div>
                <div className="row mx-n2 mb-2">
                  <div className="col-4 col-sm-4 text-right px-2">
                    <Label
                      htmlFor="exampleText"
                      className="py-form-field__label--align-top"
                    >
                      Units
                    </Label>
                  </div>
                  <div className="col-8 col-sm-8 px-2">
                    <ul className="py-list--small">
                      {['Quantity', 'Hours', 'Other'].map((unitType, index) => {
                        return (
                          <li key={unitType + index}>
                            <label className="py-radio">
                              <input
                                type="radio"
                                name="column2"
                                checked={
                                  unitType === 'Other'
                                    ? !['Quantity', 'Hours'].includes(
                                        itemHeading.column2.name,
                                      )
                                    : itemHeading.column2.name === unitType
                                }
                                value={unitType}
                                onChange={this.handleItemHeading}
                              />
                              <span className="py-form__element__faux"></span>
                              <span className="py-form__element__label">
                                {unitType}{' '}
                                {unitType === 'Quantity' ? (
                                  <span className="py-form-field__hint py-text__emphasized">
                                    (Default)
                                  </span>
                                ) : (
                                  ''
                                )}
                              </span>
                              {unitType === 'Other' ? (
                                <Fragment>
                                  <div className="inputError">
                                    <Input
                                      type="text"
                                      name="column2"
                                      value={this.state.column2}
                                      onChange={(e) =>
                                        this.handleItemChange(e, 'other')
                                      }
                                      className="py-form__element__small"
                                    />
                                    <FormValidationError
                                      showError={this.state.columnErr.includes(
                                        'column2',
                                      )}
                                    />
                                  </div>
                                </Fragment>
                              ) : (
                                ''
                              )}
                            </label>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
                <div className="row mx-n2 mb-2">
                  <div className="col-4 col-sm-4 text-right px-2">
                    <Label
                      htmlFor="exampleText"
                      className="py-form-field__label--align-top"
                    >
                      Price
                    </Label>
                  </div>
                  <div className="col-8 col-sm-8 px-2">
                    <ul className="py-list--small">
                      {['Price', 'Rate', 'Other'].map((priceType, index) => {
                        return (
                          <li key={priceType + index}>
                            <label className="py-radio">
                              <input
                                type="radio"
                                name="column3"
                                value={priceType}
                                checked={
                                  priceType === 'Other'
                                    ? !['Price', 'Rate'].includes(
                                        itemHeading.column3.name,
                                      )
                                    : itemHeading.column3.name === priceType
                                }
                                onChange={this.handleItemHeading}
                              />
                              <span className="py-form__element__faux"></span>
                              <span className="py-form__element__label">
                                {priceType}{' '}
                                {priceType === 'Price' ? (
                                  <span className="py-form-field__hint py-text__emphasized">
                                    (Default)
                                  </span>
                                ) : (
                                  ''
                                )}
                              </span>
                              {priceType === 'Other' ? (
                                <Fragment>
                                  <div className="inputError">
                                    <Input
                                      type="text"
                                      name="column3"
                                      value={this.state.column3}
                                      onChange={(e) =>
                                        this.handleItemChange(e, 'other')
                                      }
                                      className="py-form__element__small"
                                    />
                                    <FormValidationError
                                      showError={this.state.columnErr.includes(
                                        'column3',
                                      )}
                                    />
                                  </div>
                                </Fragment>
                              ) : (
                                ''
                              )}
                            </label>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
                <div className="row mx-n2 mb-2">
                  <div className="col-4 col-sm-4 text-right px-2">
                    <Label
                      htmlFor="exampleText"
                      className="py-form-field__label--align-top"
                    >
                      Amount
                    </Label>
                  </div>
                  <div className="col-8 col-sm-8 px-2">
                    <ul className="py-list--small">
                      {['Amount', 'Other'].map((amountType, index) => {
                        return (
                          <li key={amountType + index} className="radio">
                            <label className="py-radio">
                              <input
                                type="radio"
                                name="column4"
                                value={amountType}
                                checked={
                                  amountType === 'Other'
                                    ? itemHeading.column4.name !== 'Amount'
                                    : itemHeading.column4.name === amountType
                                }
                                onChange={this.handleItemHeading}
                              />

                              <span className="py-form__element__faux"></span>
                              <span className="py-form__element__label">
                                {amountType}{' '}
                                {amountType === 'Amount' ? (
                                  <span className="py-form-field__hint py-text__emphasized">
                                    (Default)
                                  </span>
                                ) : (
                                  ''
                                )}
                              </span>
                              {amountType === 'Other' ? (
                                <Fragment>
                                  <div className="inputError">
                                    <Input
                                      type="text"
                                      name="column4"
                                      value={this.state.column4}
                                      onChange={(e) =>
                                        this.handleItemChange(e, 'other')
                                      }
                                      className="py-form__element__small"
                                    />
                                    <FormValidationError
                                      showError={this.state.columnErr.includes(
                                        'column4',
                                      )}
                                    />
                                  </div>
                                </Fragment>
                              ) : (
                                ''
                              )}
                            </label>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
                <p>Choose which columns on your invoices & estimate to hide:</p>
                <div className="row mx-n2 mb-2">
                  <div className="col-4 col-sm-4 text-right px-2">
                    <Label
                      htmlFor="exampleText"
                      className="py-form-field__label--align-top"
                    ></Label>
                  </div>
                  <div className="col-8 col-sm-8 px-2">
                    <div className="checkbox">
                      <label className="py-checkbox">
                        <input
                          type="checkbox"
                          name={'hideItem'}
                          value={itemHeading.hideItem}
                          checked={itemHeading.hideItem}
                          onChange={this.handleItemHeading}
                        />
                        <span className="py-form__element__faux"></span>
                        <span className="py-form__element__label">
                          Hide item
                        </span>
                      </label>
                    </div>
                    <div className="checkbox">
                      <label className="py-checkbox">
                        <input
                          type="checkbox"
                          name={'hideDescription'}
                          value={itemHeading.hideDescription}
                          checked={itemHeading.hideDescription}
                          onChange={this.handleItemHeading}
                        />
                        <span className="py-form__element__faux"></span>
                        <span className="py-form__element__label">
                          Hide description
                        </span>
                      </label>
                    </div>
                    <span className="py-form-field__hint my-2">
                      Your invoice & estimate must show at least one of the
                      above.
                    </span>
                    <div className="checkbox">
                      <label className="py-checkbox">
                        <input
                          type="checkbox"
                          name={'hideQuantity'}
                          value={itemHeading.hideQuantity}
                          checked={itemHeading.hideQuantity}
                          onChange={this.handleItemHeading}
                        />
                        <span className="py-form__element__faux"></span>
                        <span className="py-form__element__label">
                          Hide quantity
                        </span>
                      </label>
                    </div>
                    <div className="checkbox">
                      <label className="py-checkbox">
                        <input
                          type="checkbox"
                          name={'hidePrice'}
                          value={itemHeading.hidePrice}
                          checked={itemHeading.hidePrice}
                          onChange={this.handleItemHeading}
                        />
                        <span className="py-form__element__faux"></span>
                        <span className="py-form__element__label">
                          Hide price
                        </span>
                      </label>
                    </div>
                    <div className="checkbox">
                      <label className="py-checkbox">
                        <input
                          type="checkbox"
                          name={'hideAmount'}
                          value={itemHeading.hideAmount}
                          checked={itemHeading.hideAmount}
                          onChange={this.handleItemHeading}
                        />
                        <span className="py-form__element__faux"></span>
                        <span className="py-form__element__label">
                          Hide amount
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                {/* <hr className="py-divider" /> */}
                {!handleAclPermissions(['Viewer', 'Editor']) && (
                  <div className="row mx-n2 mb-2 mt-4 custo-fixed-line">
                    <div className="col-4 col-sm-4 text-right px-2"></div>
                    <div className="col-8 col-sm-8 px-2">
                      <Button
                        onClick={this.handleSubmit}
                        color="primary"
                        disabled={btnLoad}
                      >
                        {btnLoad ? (
                          <Spinner size="sm" color="default" />
                        ) : (
                          'Save'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </Form>
            </div>
          )}
          <Modal
            isOpen={modal}
            toggle={this.handleModal}
            className={this.props.className}
            className="py-modal"
          >
            <ModalHeader toggle={this.handleModal}>Invoice preview</ModalHeader>
            <ModalBody>{this.showTemplates()}</ModalBody>
          </Modal>
        </div>
      </div>
    )
  }
}

const mapPropsToState = ({ snackbar, businessReducer }) => ({
  refreshData: snackbar.updateData,
  businessInfo: businessReducer.selectedBusiness,
})

export default connect(mapPropsToState, {
  updateData,
  setUserSettings,
  openGlobalSnackbar,
})(InvoiceCustomization)
