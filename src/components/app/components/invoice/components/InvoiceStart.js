import React, { Component } from 'react'
import { Progress, Spinner, Button } from 'reactstrap';
import { ChromePicker } from 'react-color';
import { fetchSalesSetting, addSalesSetting } from '../../../../../api/SettingService';
import { invoiceSettingPayload } from '../../setting/components/supportFunctionality/helper';
import { fetchSignedUrl, uploadImage, updateCompany } from '../../../../../api/businessService';
import { connect } from 'react-redux';
import { setUserSettings } from '../../../../../actions/loginAction';
import { setSelectedBussiness } from '../../../../../actions/businessAction';
import history from '../../../../../customHistory';
import { Fragment } from 'react';
import { SELECTED_BUSINESS } from '../../../../../constants/ActionTypes';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import * as Vibrant from 'node-vibrant';
import { logger } from '../../../../../utils/GlobalFunctions';

const items = [
    { url: `${process.env.REACT_APP_CDN_URL}/static/web-assets/invoice-onboarding-template/contemporary.png`, template: 'contemporary' },
    { url: `${process.env.REACT_APP_CDN_URL}/static/web-assets/invoice-onboarding-template/classic.png`, template: 'classic' },
    { url: `${process.env.REACT_APP_CDN_URL}/static/web-assets/invoice-onboarding-template/modern.png`, template: 'modern' }
]
class InvoiceStart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeIndex: 0,
            invoiceSettingsInput: invoiceSettingPayload(),
            loading: false,
            imgLoading: false,
            loader: false
        };
        this.next = this.next.bind(this);
        this.previous = this.previous.bind(this);
        this.goToIndex = this.goToIndex.bind(this);
        this.onExiting = this.onExiting.bind(this);
        this.onExited = this.onExited.bind(this);
    }

    componentDidMount() {
        const { businessInfo } = this.props
        document.title =
            businessInfo && businessInfo.organizationName
                ? `Finance - ${businessInfo.organizationName} - Invoice onboarding`
                : `Finance - Invoices`
        this.fetchSettingData()
    }

    fetchSettingData = async () => {
        setTimeout(this.setState({ loading: true }), 300);
        try {
            const request = await fetchSalesSetting()
            if (request.data && request.data.salesSetting) {
                this.setState({ invoiceSettingsInput: request.data.salesSetting, loading: false })
            }
        } catch (error) {
        }
    }
    onExiting() {
        this.animating = true;
    }

    onExited() {
        this.animating = false;
    }

    next() {
        if (this.animating) return;
        const nextIndex = this.state.activeIndex === items.length - 1 ? 0 : this.state.activeIndex + 1;
        this.setState({ activeIndex: nextIndex });
    }

    previous() {
        if (this.animating) return;
        const nextIndex = this.state.activeIndex === 0 ? items.length - 1 : this.state.activeIndex - 1;
        this.setState({ activeIndex: nextIndex });
    }

    goToIndex(newIndex) {
        if (this.animating) return;
        this.setState({ activeIndex: newIndex });
    }

    handleChangeColor(color, e) {
        if (!!color) {
            this.setState({
                invoiceSettingsInput: {
                    ...this.state.invoiceSettingsInput,
                    accentColour: color.hex
                }
            })
        }
    }

    handleSkip = async e => {
        try {
            let { selectedBusiness } = JSON.parse(JSON.parse(localStorage.getItem('reduxPersist:root')).businessReducer)
            const updateBusiness = await updateCompany(selectedBusiness._id, { businessInput: { meta: { invoice: { firstVisit: false } } } })
            if (updateBusiness.statusCode === 200) {
                const refresh = localStorage.getItem('refreshToken')
                const res = await this.props.setSelectedBussiness(selectedBusiness._id, refresh, false);
                if (!!res && !!res.type && res.type === SELECTED_BUSINESS) {
                    this.setState({ loader: false })
                    history.push('/app/invoices/add');
                }
            }
        } catch (err) {
            this.setState({ loader: false })
        }
    }

    handleSubmit = async (e) => {
        e.preventDefault()
        let invoiceSettingsInput = this.state.invoiceSettingsInput;
        let { selectedBusiness } = JSON.parse(JSON.parse(localStorage.getItem('reduxPersist:root')).businessReducer)
        delete invoiceSettingsInput._id
        delete invoiceSettingsInput.createdAt
        delete invoiceSettingsInput.updatedAt
        delete invoiceSettingsInput.__v
        let salesSettingInput = {
            ...invoiceSettingsInput
        }
        try {
            this.setState({ loader: true })
            let request = await addSalesSetting({ salesSettingInput });
            this.props.setUserSettings(request.data.salesSetting);
            selectedBusiness.meta.invoice.firstVisit = false;
            const updateBusiness = await updateCompany(selectedBusiness._id, { businessInput: { meta: selectedBusiness.meta } })
            if (updateBusiness.statusCode === 200) {
                const refresh = localStorage.getItem('refreshToken')
                const res = await this.props.setSelectedBussiness(selectedBusiness._id, refresh, false);
                if (!!res && !!res.type && res.type === SELECTED_BUSINESS) {
                    this.setState({ loader: false })
                    history.push('/app/invoices?pre=true');
                }
            }
        } catch (error) {
            this.setState({ loader: false })
        }
    }

    onImageUpload = async (event) => {
        this.setState({
            imgLoading: true
        })
        let updateSettings = this.state.invoiceSettingsInput
        const file = event.target.files[0]
        let imageUrl
        if (file) {
            imageUrl = await this.getSignedUrl(file)
        }
        updateSettings["companyLogo"] = file ? imageUrl : undefined
        updateSettings["displayLogo"] = file ? true : false
        Vibrant.from(imageUrl).getPalette()
            .then(palette => {
                updateSettings.accentColour = palette.Vibrant.hex
                this.setState({ invoiceSettingsInput: updateSettings, imgLoading: false })
            })
            .catch(error => {
                this.setState({ invoiceSettingsInput: updateSettings, imgLoading: false })
                logger.error("error in vibrant", error)
            });
    }

    _templateSelect = temp => {
        let updateSettings = this.state.invoiceSettingsInput
        if (!!temp) {
            updateSettings.template = temp
            this.setState({ invoiceSettingsInput: updateSettings })
        }
    }

    getSignedUrl = async (file) => {
        try {
            const payload = {
                s3Input: {
                    contentType: file.type,
                    fileName: file.name,
                    uploadType: 'logo'
                }
            }
            const response = await fetchSignedUrl(payload)
            const { sUrl, pUrl } = response.data.signedUrl
            if (sUrl) {
                await uploadImage(sUrl, file, file.type)
                return pUrl
            }
        } catch (error) {
        }
    }
    render() {
        const { activeIndex, invoiceSettingsInput, imgLoading, loader } = this.state;
        const { accentColour, companyLogo } = invoiceSettingsInput;
        const slides = items.map((item, i) => {
            if (item.template === 'contemporary') {
                return (
                    <div
                        key={item}
                        style={{
                            backgroundColor: `${accentColour}`
                        }}
                        className="carousel__template contemporary"
                        onClick={() => this._templateSelect(item.template)}
                    >
                        <div className="py-carousel__logo">
                            {
                                !!companyLogo && (
                                    <img src={companyLogo} alt="logo" />
                                )
                            }
                        </div>
                        <div className="py-text-body">
                            <span className="services">
                                Services
                        </span>
                            <span className="quantity">
                                Quantity
                        </span>
                            <span className="rate">
                                Rate
                        </span>
                            <span className="amount">
                                Amount
                        </span>
                        </div>
                        <img src={item.url} alt={item.template} />
                    </div>
                )
            } else if (item.template === 'modern') {
                return (
                    <div
                        key={item}
                        style={{
                            backgroundColor: `${accentColour}`
                        }}
                        className="carousel__template modern"
                        onClick={() => this._templateSelect(item.template)}
                    >
                        <div className="py-carousel__logo">
                            {!!companyLogo && (
                                <img src={companyLogo} alt="logo" />
                            )}
                        </div>

                        <div className="left-carousel__content" >
                            INVOICE
                            <span class="subheading" >Robinson Wedding</span>
                        </div>

                        <div className="right-carousel__content" >
                            <span class="subheading" >Amount Due</span>
                            &#36;2,632.75
                        </div>

                        <img src={item.url} alt={item.template} />

                    </div>
                )
            } else {
                return (
                    <div
                        key={item}
                        style={{
                            backgroundColor: `${accentColour}`
                        }}
                        className="carousel__template classic"
                        onClick={() => this._templateSelect(item.template)}
                    >
                        <div className="py-carousel__logo">
                            {!!companyLogo && (
                                <img src={companyLogo} alt="logo" />
                            )}
                        </div>
                        <img src={item.url} alt={item.template} />

                    </div>
                )
            }
        })
        return (
            <div className="content-wrapper__main__fixed invoice-onBoarding__wrapper">
                <div className="py-header py-header--page justify-content-center text-center">
                    <div className="py-header--title">
                        <div className="py-heading--title">Create the perfect invoice to match your brand.</div>
                    </div>
                </div>
                <div className="py-box py-box--xlarge invoice__onboarding__container">
                    <div className="py-box--content">
                        <div className="invoice__onboarding__content__body">
                            <div className="invoice__onboarding__content__left">
                                <div className="invoice__onboarding__logo__upload__handle">
                                    <div className="py-heading--subtitle">Add your logo</div>
                                    {
                                        !!companyLogo ?
                                            (
                                                <label for="InvoiceLogoUpload" className="py-uploader choose-logo">
                                                    <img src={companyLogo} />
                                                    <a href="javascript: void(0)" onClick={() => this.setState({
                                                        invoiceSettingsInput: {
                                                            ...this.state.invoiceSettingsInput,
                                                            companyLogo: ""
                                                        }
                                                    })}>Remove logo</a>
                                                </label>
                                            ) : (

                                                <label for="InvoiceLogoUpload" className="py-uploader choose-logo">
                                                    <span className="py-upload__cloud-logo">
                                                        <svg className="img-fluid" viewBox="0 0 54 41" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                                            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                                <g transform="translate(1.000000, 1.000000)">
                                                                    <path d="M43.63,19.493 C43.63,10 39,0 28,0 C17,0 11.63,9 11.63,15.466 C5.63,15.466 0.114,18.401 0.001,27 C-0.112,35.599 6.932,38.52 10.712,38.52 L43.63,38.52 C47.31,38.52 52,36 52,29 C52,22 46.987,19.5 43.63,19.493 Z" id="Path" stroke="#B2C2CD"></path>
                                                                    <path d="M27,12 L20.917,18.083 M27,12 L33,18 M27,12 L27,30" id="Shape" stroke="#136acd" fill="#D8D8D8" fill-rule="nonzero" stroke-linecap="round" stroke-linejoin="round"></path>
                                                                </g>
                                                            </g>
                                                        </svg>
                                                    </span>
                                                    <span className="py-form__element__label">
                                                        {
                                                            imgLoading ? (<Fragment>
                                                                <span className="py-text--strong">
                                                                    <Progress animated color="success" value="100" />
                                                                Uploading logo
                                                            </span>
                                                            </Fragment>) : (
                                                                    <Fragment>
                                                                        <span className="py-text--strong">Browse your logo here. </span>
                                                                        <span className="py-text--hint"> Maximum 10MB in size. <br />JPG, PNG, or GIF formats.</span>
                                                                        <span className="py-text--hint"> Recommended size: 200 x 200 pixels.</span>
                                                                        <input type="file" id="InvoiceLogoUpload" className="py-form__element" name='companyLogo' accept=".jpg,.png,.jpeg" onChange={this.onImageUpload} />
                                                                    </Fragment>
                                                                )
                                                        }
                                                    </span>
                                                </label>
                                            )
                                    }
                                </div>
                                <div className="invoice__onboarding__content__color__handle">
                                    <div className="py-heading--subtitle">Pick your accent color</div>
                                    <div className="py-box">
                                        <span className="py-text--hint mb-3">Tip: Drag both circles to change color.</span>
                                        <div className="py-form-field__element py-color-picker__element">
                                            <div className="d-flex align-items-center py-color-picker__element-saturation-container">
                                                <ChromePicker
                                                    color={`${accentColour}`}
                                                    onChange={this.handleChangeColor.bind(this)}
                                                    disableAlpha={true}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="invoice__onboarding__content__right">
                                <div className="py-heading--subtitle">
                                    Choose your template
                            </div>
                                <div className="invoice-onboarding-template-carousel">
                                    <Carousel
                                        centerMode
                                        infiniteLoop={false}
                                        showIndicators={false}
                                        showThumbs={false}
                                    >
                                        {slides}
                                    </Carousel>
                                </div>
                            </div>

                        </div>

                        <div className="invoice__onboarding__content__footer">
                            <Button 
                                className="mb-3"
                                color="primary"
                                onClick={this.handleSubmit.bind(this)}
                                disabled={loader}
                            >{loader ? <Spinner size="sm" color="default" /> : "Looks good, let's go"}</Button>

                            <span className="py-text--hint">You can <span className="py-text--strong text-link" onClick={this.handleSkip.bind(this)}>skip this</span> and make changes later by going to Settings.</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapPropsToState = (state) => {
    return {
        businessInfo: state.businessReducer.selectedBusiness
    }
}

export default connect(mapPropsToState, { setUserSettings, setSelectedBussiness })(InvoiceStart)