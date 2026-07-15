import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  Alert,
  Button,
  Col,
  Container,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Row,
  Spinner,
  TabContent,
  TabPane,
} from 'reactstrap'
import { get } from 'lodash'
import { fetchSignedUrl, uploadImage } from '../../../../../api/businessService'
import CrowdFundingServices from '../../../../../api/CrowdFundingServices'
import history from '../../../../../customHistory'
import { openGlobalSnackbar } from '../../../../../actions/snackBarAction'
import AddCrowdFunding from './AddCrowdFunding'
import EditCrowdFunding from './EditCrowdFunding'
import CrowdFundingIntro from './CrowdFundingIntro'
import ShareCrowdFunding from './ShareCrowdFunding'
import ViewCrowdFunding from './view'
import { fetchPaymentSetting } from '../../../../../api/SettingService'
import { fetchCurrencies } from '../../../../../api/globalServices'
import { convertToPrice } from '../../../../../utils/common'
import SelectBox from '../../../../../utils/formWrapper/SelectBox'
import { setCurrencyList } from '../../invoice/helpers'
import CenterSpinner from '../../../../../global/CenterSpinner'
import {
  imageUploadValidation,
  videoUploadValidation,
} from '../../sales/components/helpers'
import NoCheckouts from '../../../../common/NoCheckouts'
import {
  getAmountToDisplay,
  handleAclPermissions,
} from '../../../../../utils/GlobalFunctions'

class Index extends Component {
  constructor(props) {
    super(props)

    this.state = {
      imageUrl: null,
      imageLoading: false,
      userName: '',
      mediaType: 'image',
      isLoading: true,
      crowdFundingData: null,
      buttonLoading: false,
      validateUserName: false,
      agreement: false,
      buttonDisabled: true,
      refreshPayment: false,
      crowdFundingLink: '',
      activeTab: '1',
      paymentSettings: {},
      paymentSetup: true,
      refreshReport: false,
      showCustomLimit: false,
      customLimitAmount: null,
      isViewer: false,
      editCustomLimit: false,
      shouldAskProcessingFee: false,
      limitLoading: false,
      memoLimitLoading: false,
      crowdFundingSuggestionList: [],
      crowdFundingMemo: false,
      memoLabel: 'What is this payment for?',
      isRequestTip: false,
      isEnableRecurringFunding: true,
      isOneTimePaymentScheduleAllowed: true,
      openItemPopup: false,
      itemMode: 'create',
      currencies: [],
      itemModel: {
        id: '',
        itemName: '',
        description: '',
        noFixedRate: true,
        price: 0,
      },
      priceLess: false,
    }
  }

  componentDidMount = async () => {
    const currencies = await fetchCurrencies()
    this.setState({
      isViewer: handleAclPermissions(['Viewer']),
      currencies: setCurrencyList(currencies),
    })
    this.handleRefreshStatus()
  }

  componentDidUpdate = (prevProps) => {
    const businessInfo = JSON.parse(
      JSON.parse(localStorage.getItem('reduxPersist:root')).businessReducer
    ).selectedBusiness
    document.title = businessInfo
      ? `Finance - ${businessInfo.organizationName} - Give Link`
      : 'Finance - Give Link'
    if (this.props.match.params.state !== prevProps.match.params.state) {
      if (!this.props.match.params.state) {
        this.handleRefreshStatus()
      }
    }
  }

  handleCreateLink = (path) => {
    this.props.history.push(path)
    if (path === '/app/give') {
      window.location.reload();
    }
  }

  handleBack = (path) => {
    this.props.history.push(path)
  }

  handleRefreshStatus = async () => {
    this.setState({
      refreshReport: true,
    })
    await CrowdFundingServices.fetchCrowdFundingLink()
      .then((res) => {
        if (res.data === null) {
          this.handleCheckPayment()
        } else {
          this.setState({
            crowdFundingData: res.data,
            paymentSetup: false,
            isLoading: false,
            activeTab: res.data.funding.mediaType === 'video' ? '2' : '1',
            mediaType:
              res.data.funding.mediaType === 'video' ? 'video' : 'image',
            refreshReport: false,
            shouldAskProcessingFee:
              res.data.funding.shouldAskProcessingFee || false,
            isRequestTip: res.data.funding.isRequestTip || false,
            isEnableRecurringFunding:
              res.data.funding.isRecurringFundingAllowed || false,
            isOneTimePaymentScheduleAllowed: res.data.funding.isOneTimePaymentScheduleAllowed || false,
            showCustomLimit: res.data.funding.isCustomLimitSet || false,
            customLimitAmount: res.data.funding.amountLimit.toFixed(2) || null,
            crowdFundingMemo: res.data.funding.isMemo || false,
            memoLabel:
              res.data.funding.memoLabel || 'What is this payment for?',
          })
          history.push('/app/give')
        }
      })
      .catch((e) => {})
  }

  handleCrowdFundingSuggestions = async (val) => {
    await CrowdFundingServices.crowdFundingLinkSuggestions()
      .then((res) => {
        this.setState({
          crowdFundingSuggestionList: res.data,
        })
      })
      .catch((e) => {
        this.setState({
          crowdFundingSuggestionList: [],
        })
      })
  }

  handleValidateUserName = async (val, type) => {
    const userName = type ? val : val.target.value
    this.setState({
      userName,
    })
    if (userName && userName !== '') {
      await CrowdFundingServices.validateCrowdFundingLink(userName)
        .then((res) => {
          if (res.data.link) {
            this.setState({
              crowdFundingLink: res.data.link,
              validateUserName: false,
              buttonDisabled: false,
            })
          }
        })
        .catch((error) =>
          this.setState({
            validateUserName: true,
            buttonDisabled: true,
          })
        )
    } else {
      this.setState({
        buttonDisabled: true,
      })
    }
  }

  onImageUpload = async (event, type) => {
    this.setState({
      imageLoading: true,
    })
    if (event === 'remove') {
      const payload = {
        fundingInput: {
          imageUrl: null,
          mediaType: 'image',
        },
      }
      await CrowdFundingServices.updateCrowdFundingImage(payload)
        .then((res) => {
          this.setState({
            imageUrl: null,
            crowdFundingData: res.data,
            imageLoading: false,
          })
        })
        .catch((error) => {
          this.setState({
            imageLoading: false,
          })
          this.props.openGlobalSnackbar(error.message, true)
        })
    } else {
      const file = event.target.files[0]
      let imageUrl
      if (file) {
        if (!imageUploadValidation(file)) {
          this.props.openGlobalSnackbar(
            'Please upload only JPG, PNG or GIF file with size 10MB or below',
            true
          )
          this.setState({
            imageLoading: false,
          })
        } else {
          if (type === 'view') {
            imageUrl = await this.getSignedUrl(file)
            this.setState({
              imageUrl: type === 'view' ? imageUrl : file,
              imageLoading: false,
            })
            this.updateImage(type)
          } else {
            this.setState({
              imageUrl: type === 'view' ? imageUrl : file,
              mediaType: this.state.activeTab === '2' ? 'video' : 'image',
              imageLoading: false,
            })
          }
        }
      } else {
        this.setState({
          imageLoading: false,
        })
      }
    }
  }

  onRemovePeyme = () => {
    this.setState({
      imageLoading: false,
      imageUrl: null,
    })
  }

  onVideoUpload = async (event, type) => {
    this.setState({
      imageLoading: true,
    })
    if (event === 'remove') {
      const payload = {
        fundingInput: {
          imageUrl: null,
          mediaType: 'video',
        },
      }
      await CrowdFundingServices.updateCrowdFundingImage(payload)
        .then((res) => {
          this.setState({
            crowdFundingData: res.data,
            imageUrl: null,
            imageLoading: false,
          })
        })
        .catch((error) => {
          this.setState({
            imageLoading: false,
          })
          this.props.openGlobalSnackbar(error.message, true)
        })
    } else {
      const file = event.target.files[0]
      let imageUrl
      if (file) {
        if (!videoUploadValidation(file)) {
          this.props.openGlobalSnackbar(
            'Please upload only WebM, MKV, MP4, MOV, or GIF file with size 500MB or below',
            true
          )
          this.setState({
            imageLoading: false,
          })
        } else {
          if (type === 'view') {
            imageUrl = await this.getSignedUrl(file)
            this.setState({
              imageUrl: type === 'view' ? imageUrl : file,
              imageLoading: false,
            })
            this.updateImage(type)
          } else {
            this.setState({
              imageUrl: type === 'view' ? imageUrl : file,
              mediaType: this.state.activeTab === '2' ? 'video' : 'image',
              imageLoading: false,
            })
          }
        }
      } else {
        this.setState({
          imageLoading: false,
        })
      }
    }
  }

  getSignedUrl = async (file) => {
    try {
      const payload = {
        s3Input: {
          contentType: file.type,
          fileName: file.name,
          uploadType: 'funding',
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
        'Something went wrong, please try again',
        true
      )
    }
  }

  handleCustomLimitChange = async (e) => {
    if (e.target.name === 'limitCheck') {
      this.setState({
        showCustomLimit: !this.state.showCustomLimit,
      })
      if (this.state.showCustomLimit && this.state.customLimitAmount) {
        const payload = {
          fundingInput: {
            isCustomLimitSet: false,
            amountLimit: 0,
          },
        }
        await CrowdFundingServices.updateCrowdFundingImage(payload).then(
          (res) => {
            this.setState({
              customLimitAmount: null,
              crowdFundingData: res.data,
            })
            this.props.openGlobalSnackbar('transaction limit disabled')
          }
        )
      }
    } else {
      const regex = new RegExp('^0+(?!$)', 'g')
      this.setState({
        customLimitAmount:
          e.target.value > 0
            ? e.target.value.toString().replaceAll(regex, '')
            : null,
      })
    }
  }

  handleSubmitUserName = async () => {
    this.setState({
      buttonDisabled: true,
      buttonLoading: true,
    })
    if (this.state.userName !== '') {
      this.setState({
        buttonDisabled: false,
        buttonLoading: false,
      })
      this.handleCreateLink('edit')
    } else {
      this.setState({
        buttonLoading: false,
      })
      this.props.openGlobalSnackbar('Please provide username', true)
    }
  }

  updateImage = async (type) => {
    this.setState({
      buttonLoading: true,
    })
    if (!this.state.imageUrl && this.state.crowdFundingData) {
      this.setState({
        buttonLoading: false,
      })
      if (!type) {
        this.handleCreateLink('share')
      }
    } else {
      const payload = {
        fundingInput: {
          imageUrl: this.state.imageUrl,
          mediaType: this.state.activeTab === '2' ? 'video' : 'image',
        },
      }
      await CrowdFundingServices.updateCrowdFundingImage(payload)
        .then((res) => {
          this.setState({
            crowdFundingData: res.data,
            mediaType: this.state.activeTab === '2' ? 'video' : 'image',
            buttonLoading: false,
          })
          if (type !== 'view') {
            this.handleCreateLink('share')
          }
        })
        .catch((error) => {
          this.setState({
            buttonLoading: false,
          })
          this.props.openGlobalSnackbar(error.message, true)
        })
    }
  }

  handlePeyMeProcessingFee = async () => {
    this.setState(
      { shouldAskProcessingFee: !this.state.shouldAskProcessingFee },
      async () => {
        const payload = {
          fundingInput: {
            shouldAskProcessingFee: this.state.shouldAskProcessingFee,
          },
        }
        await CrowdFundingServices.updateCrowdFundingImage(payload)
          .then((res) => {
            this.setState({
              crowdFundingData: res.data,
              shouldAskProcessingFee: res.data.funding.shouldAskProcessingFee,
            })
            this.props.openGlobalSnackbar(
              `Apply fees to customer ${
                this.state.shouldAskProcessingFee ? 'enabled' : 'disabled'
              }`
            )
          })
          .catch((error) => {
            this.props.openGlobalSnackbar(error.message, true)
          })
      }
    )
  }

  handleRequestTip = async () => {
    this.setState({ isRequestTip: !this.state.isRequestTip }, async () => {
      const payload = {
        fundingInput: {
          isRequestTip: this.state.isRequestTip,
        },
      }
      await CrowdFundingServices.updateCrowdFundingImage(payload)
        .then((res) => {
          this.setState({
            crowdFundingData: res.data,
            isRequestTip: res.data.funding?.isRequestTip,
          })
          this.props.openGlobalSnackbar(
            `Request fees to customer ${
              this.state.isRequestTip ? 'enabled' : 'disabled'
            }`
          )
        })
        .catch((error) => {
          this.props.openGlobalSnackbar(error.message, true)
        })
    })
  }

  handleEnableRecurringCrowdFunding = async () => {
    this.setState(
      { isEnableRecurringFunding: !this.state.isEnableRecurringFunding },
      async () => {
        const payload = {
          fundingInput: {
            isRecurringFundingAllowed: this.state.isEnableRecurringFunding,
          },
        }
        await CrowdFundingServices.updateCrowdFundingImage(payload)
          .then((res) => {
            this.setState({
              crowdFundingData: res.data,
              isEnableRecurringFunding:
                res.data.funding?.isRecurringFundingAllowed,
            })
            this.props.openGlobalSnackbar(
              `Request recurring crowdfunding ${
                this.state.isEnableRecurringFunding ? 'enabled' : 'disabled'
              }`
            )
          })
          .catch((error) => {
            this.props.openGlobalSnackbar(error.message, true)
          })
      }
    )
  }

  handleEnableOneTimePaymentSchedule = async () => {
    this.setState(
      { isOneTimePaymentScheduleAllowed: !this.state.isOneTimePaymentScheduleAllowed },
      async () => {
        const payload = {
          fundingInput: {
            isOneTimePaymentScheduleAllowed: this.state.isOneTimePaymentScheduleAllowed,
          },
        }
        await CrowdFundingServices.updateCrowdFundingImage(payload)
          .then((res) => {
            this.setState({
              crowdFundingData: res.data,
              isOneTimePaymentScheduleAllowed:
                res.data.funding?.isOneTimePaymentScheduleAllowed,
            })
            this.props.openGlobalSnackbar(
              `Allow scheduling one-time payment ${
                this.state.isOneTimePaymentScheduleAllowed ? 'enabled' : 'disabled'
              }`
            )
          })
          .catch((error) => {
            this.props.openGlobalSnackbar(error.message, true)
          })
      }
    )
  }

  handleCheckPayment = async () => {
    await fetchPaymentSetting().then(res => {
      if (!this.state.isViewer) {
        const isSetupDone = res.data.paymentSetting.isSetupDone || res.data.paymentSetting?.legalData?.isPayByBankEnabled || res.data.paymentSetting?.legalData?.isBnplEnabled;
        if (isSetupDone) {
          history.push('/app/give/start')
          this.setState({
            paymentSettings: res.data.paymentSetting,
            isLoading: false,
            paymentSetup: false
          })
        }
        else {
          this.setState({
            paymentSettings: res.data.paymentSetting,
            isLoading: false,
            paymentSetup: true,
          })
        }
      }
    })
      .catch((error) => {
        this.props.openGlobalSnackbar(error.message, true)
      })
  }

  handleTerms = (e) => {
    this.setState({
      agreement: e.target.checked,
    })
  }

  handleRefreshPayment = () => {
    this.setState({
      refreshPayment: !this.state.refreshPayment,
    })
  }

  handelSubmitPeyme = async () => {
    this.setState({
      buttonLoading: true,
    })
    let imageUrl
    if (this.state.imageUrl) {
      imageUrl = await this.getSignedUrl(this.state.imageUrl)
    }
    const payload = {
      fundingInput: {
        fundingName: this.state.userName,
        imageUrl: imageUrl ? imageUrl : null,
        mediaType: this.state.activeTab === '2' ? 'video' : 'image',
      },
    }
    await CrowdFundingServices.addCrowdFundingLink(payload)
      .then((res) => {
        this.setState({
          crowdFundingData: res.data,
          mediaType: this.state.activeTab === '2' ? 'video' : 'image',
          buttonLoading: false,
        })
        this.handleCreateLink('share')
      })
      .catch((error) => {
        this.setState({
          buttonLoading: false,
        })
        this.props.openGlobalSnackbar(error.message, true)
      })
  }

  handleStatus = async (status) => {
    this.setState({
      buttonLoading: true,
    })
    const payload = {
      fundingInput: {
        isActive: status,
      },
    }
    await CrowdFundingServices.updateCrowdFundingImage(payload)
      .then((res) => {
        this.setState({
          crowdFundingData: res.data,
          buttonLoading: false,
        })
      })
      .catch((error) => {
        this.setState({
          buttonLoading: false,
        })
        this.props.openGlobalSnackbar(error.message, true)
      })
  }

  handleMaxQuantity = async () => {
    this.setState({
      limitLoading: true,
    })
    if (
      this.state.showCustomLimit &&
      parseFloat(this.state.customLimitAmount) > 0
    ) {
      const payload = {
        fundingInput: {
          isCustomLimitSet: this.state.showCustomLimit,
          amountLimit: parseFloat(
            parseFloat(this.state.customLimitAmount).toFixed(2)
          ),
        },
      }
      await CrowdFundingServices.updateCrowdFundingImage(payload)
        .then((res) => {
          this.props.openGlobalSnackbar('transaction limit enabled', false)
          this.setState({
            customLimitAmount: res.data.funding.amountLimit.toFixed(2),
            editCustomLimit: false,
            crowdFundingData: res.data,
            limitLoading: false,
          })
        })
        .catch((err) => {
          this.props.openGlobalSnackbar(err.message, true)
          this.setState({
            editCustomLimit: false,
            customLimitAmount: this.state.customLimitAmount,
            limitLoading: false,
          })
        })
    }
  }

  handleAddMemo = async () => {
    this.setState({
      memoLimitLoading: true,
    })
    if (
      this.state.crowdFundingMemo &&
      this.state.memoLabel &&
      this.state.memoLabel !== ''
    ) {
      const payload = {
        fundingInput: {
          isMemo: this.state.crowdFundingMemo,
          memoLabel: this.state.memoLabel,
        },
      }
      await CrowdFundingServices.updateCrowdFundingImage(payload)
        .then((res) => {
          this.props.openGlobalSnackbar('Memo enabled', false)
          this.setState({
            memoLabel: res.data.funding.memoLabel,
            crowdFundingMemo: res.data.funding.isMemo,
            crowdFundingData: res.data,
            memoLimitLoading: false,
          })
        })
        .catch((err) => {
          this.props.openGlobalSnackbar(err.message, true)
          this.setState({
            crowdFundingMemo: this.state.crowdFundingMemo,
            memoLabel: this.state.memoLabel,
            memoLimitLoading: false,
          })
        })
    }
  }

  handleChangeEditToggle = (type) => {
    this.setState({
      editCustomLimit: !this.state.editCustomLimit,
      customLimitAmount:
        type === 'close'
          ? this.state.crowdFundingData.funding.amountLimit
          : this.state.customLimitAmount,
    })
  }

  handleIsMemoChange = async (e) => {
    this.setState(
      {
        crowdFundingMemo: !this.state.crowdFundingMemo,
      },
      async () => {
        const payload = {
          fundingInput: {
            isMemo: this.state.crowdFundingMemo,
            memoLabel: this.state.memoLabel,
          },
        }
        await CrowdFundingServices.updateCrowdFundingImage(payload).then(
          (res) => {
            this.setState({
              crowdFundingMemo: this.state.crowdFundingMemo,
              memoLabel: this.state.memoLabel || 'What is this payment for?',
              crowdFundingData: res.data,
            })
            this.props.openGlobalSnackbar(
              `Memo ${this.state.crowdFundingMemo ? 'Enabled ' : 'Disabled'}`
            )
          }
        )
      }
    )
  }

  handleText = (e) => {
    this.setState({
      memoLabel: e.target.value,
    })
  }

  handleOnTabChange = (tab, type) => {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
      })
    }
  }

  handleCurrency = (e) => {
    this.setState({
      itemModel: { ...this.state.itemModel, currency: e },
    })
  }

  handleItemPopupOpen = async (mode, selectedItem) => {
    this.setState({ openItemPopup: true, itemMode: mode })
    if (mode === 'edit') {
      this.setState({
        itemModel: {
          id: selectedItem._id,
          itemName: selectedItem?.title || '',
          description: selectedItem?.description || '',
          noFixedRate: selectedItem?.priceType === 'fixed' ? false : true,
          price: selectedItem?.price || 0,
        },
      })
    }
  }

  handleItemPopupClose = () => {
    this.setState({
      openItemPopup: false,
      itemModel: {
        id: '',
        itemName: '',
        description: '',
        noFixedRate: true,
        price: 0,
      },
    })
  }

  convertToDecimal = (event) => {
    const { value } = event.target
    if (value > 0) {
      const price = convertToPrice(value)
      const priceLess = price < 0.51 ? true : false
      this.setState({
        itemModel: { ...this.state.itemModel, price },
        priceLess,
      })
    }
  }

  handleItemChange = (event) => {
    const target = event.target
    let { name, value } = event.target
    let modal = this.state.itemModel
    if (target.type === 'checkbox') {
      if (name === 'noFixedRate') {
        modal.noFixedRate = !modal.noFixedRate
        modal.price = 0
      }
      this.setState({
        itemModel: modal,
      })
    } else if (name === 'price') {
      if (!value) {
        value = 0
      }
      this.setState({
        itemModel: { ...this.state.itemModel, [name]: value },
      })
    } else {
      this.setState({
        itemModel: { ...this.state.itemModel, [name]: value },
      })
    }
  }

  handleEditCrowdFunding = async (
    itemId,
    requestData,
    isStatusUpdate = false
  ) => {
    await CrowdFundingServices.updateCrowdFundingItem(
      itemId,
      requestData,
      isStatusUpdate
    )
      .then((res) => {
        this.props.openGlobalSnackbar(res?.message)
        this.handleItemPopupClose()
        this.handleRefreshStatus()
      })
      .catch((error) => {
        this.props.openGlobalSnackbar(error?.message, true)
      })
  }

  handleItemSubmit = async () => {
    const itemData = this.state.itemModel
    if (!itemData?.itemName) {
      this.props.openGlobalSnackbar('Item name is required', true)
      return
    } else if (!itemData?.noFixedRate && itemData?.price <= 0) {
      this.props.openGlobalSnackbar('Price must be greater than 0', true)
      return
    }
    const requestData = {
      fundingItemInput: {
        title: itemData?.itemName,
        description: itemData?.description,
        priceType: itemData?.noFixedRate ? 'dynamic' : 'fixed',
        price: itemData?.price,
      },
    }
    if (this.state.itemMode === 'create') {
      await CrowdFundingServices.addCrowdFundingItem(requestData)
        .then((res) => {
          this.props.openGlobalSnackbar(res?.message)
          this.handleItemPopupClose()
          this.handleRefreshStatus()
        })
        .catch((error) => {
          this.props.openGlobalSnackbar(error?.message, true)
        })
    } else if (this.state.itemMode === 'edit') {
      await this.handleEditCrowdFunding(itemData?.id, requestData)
    }
  }

  handleTabSwitch = (type) => {
    const {
      activeTab,
      imageLoading,
      imageUrl,
      mediaType,
      crowdFundingData,
      isLoading,
      isViewer,
    } = this.state
    return (
      <div className="mb-3">
        <Nav className="nav nav-pills tab-2 mb-3">
          <NavItem>
            <NavLink
              active={this.state.activeTab === '1'}
              onClick={() => this.handleOnTabChange('1', type)}
            >
              Image
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              active={this.state.activeTab === '2'}
              onClick={() => this.handleOnTabChange('2', type)}
            >
              Videos
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="1">
            {imageLoading ? (
              <div className="spinner-wrapper uploader-zone p-0">
                {' '}
                <Spinner size="md" color="default my-1" />{' '}
              </div>
            ) : ((type && crowdFundingData.funding.imageUrl) || imageUrl) &&
              mediaType === 'image' ? (
              <div className="uploader-zone p-0">
                <div>
                  <div className="uploaded-image">
                    <img
                      height="170px"
                      src={
                        type
                          ? crowdFundingData.funding.imageUrl
                          : URL.createObjectURL(imageUrl)
                      }
                      alt=""
                    />
                  </div>
                  {!isViewer && (
                    <Button
                      className="remove-icon"
                      color="danger"
                      onClick={() =>
                        type
                          ? this.onImageUpload('remove')
                          : this.onRemovePeyme()
                      }
                    >
                      <i className="fal fa-times" />
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <Label className="uploader-zone">
                {imageLoading ? (
                  <div className="spinner-wrapper">
                    {' '}
                    <Spinner size="md" color="default my-1" />{' '}
                  </div>
                ) : (
                  <div>
                    <span className="upload-icon">
                      <i className="fal fa-upload" />
                    </span>
                    <div className="py-text--browse">
                      <span className="py-text--link">Browse</span> or drop your
                      image here.
                    </div>
                    <div className="py-text--hint">
                      Maximum 10MB in size. <br />
                      JPG, PNG, or GIF formats.
                    </div>
                    <div className="py-text--hint mb-0">
                      Recommended size: 500 x 300 pixels.
                    </div>
                    <Input
                      type="file"
                      id="userPhoto"
                      className="h-100"
                      onChange={(e) => this.onImageUpload(e, type && 'view')}
                      name="userPhoto"
                      accept=".jpg,.png,.jpeg"
                    />
                  </div>
                )}
              </Label>
            )}
          </TabPane>
          <TabPane tabId="2">
            {imageLoading ? (
              <div className="spinner-wrapper uploader-zone p-0">
                {' '}
                <Spinner size="md" color="default my-1" />{' '}
              </div>
            ) : ((type && crowdFundingData.funding.imageUrl) || imageUrl) &&
              mediaType === 'video' ? (
              <div className="uploader-zone p-0">
                <div className="uploaded-video">
                  <video
                    width="300px"
                    height="170px"
                    src={
                      type
                        ? crowdFundingData.funding.imageUrl
                        : URL.createObjectURL(imageUrl)
                    }
                    controls
                  >
                    <p>
                      Your browser doesn't support HTML5 video. Here is a{' '}
                      <a
                        href={
                          type
                            ? crowdFundingData.funding.imageUrl
                            : URL.createObjectURL(imageUrl)
                        }
                      >
                        link to the video
                      </a>{' '}
                      instead.
                    </p>
                  </video>
                </div>
                {!isViewer && (
                  <Button
                    className="remove-icon"
                    color="danger"
                    onClick={() =>
                      type ? this.onVideoUpload('remove') : this.onRemovePeyme()
                    }
                  >
                    <i className="fal fa-times" />
                  </Button>
                )}
              </div>
            ) : (
              <Label className="uploader-zone">
                {imageLoading ? (
                  <div className="spinner-wrapper">
                    {' '}
                    <Spinner size="md" color="default my-1" />{' '}
                  </div>
                ) : (
                  <div>
                    <div>
                      <span className="upload-icon">
                        <i className="fal fa-upload" />
                      </span>
                      <div className="py-text--browse">
                        <span className="py-text--link">Browse</span> or drop
                        your video here.
                      </div>
                      <div className="py-text--hint">
                        Maximum 500MB in size. <br />
                        WebM, MKV, MP4, MOV, or GIF formats.
                      </div>
                      <div className="py-text--hint mb-0">
                        Recommended size: 500 x 300 pixels.
                      </div>
                      <Input
                        type="file"
                        id="peymeVideo"
                        onChange={(e) => this.onVideoUpload(e, type && 'view')}
                        name="peymeVideo"
                        className="h-100"
                        accept=".webm,.gif,.mkv,.mp4,.mov"
                      />
                    </div>
                  </div>
                )}
              </Label>
            )}
          </TabPane>
        </TabContent>
      </div>
    )
  }

  renderComponent = () => {
    const {
      agreement,
      imageUrl,
      buttonLoading,
      imageLoading,
      validateUserName,
      crowdFundingData,
      buttonDisabled,
      refreshPayment,
      userName,
      crowdFundingLink,
      refreshReport,
      showCustomLimit,
      customLimitAmount,
      isViewer,
      editCustomLimit,
      shouldAskProcessingFee,
      limitLoading,
      memoLimitLoading,
      crowdFundingMemo,
      memoLabel,
      crowdFundingSuggestionList,
      activeTab,
      isRequestTip,
      isEnableRecurringFunding,
      isOneTimePaymentScheduleAllowed,
    } = this.state
    switch (this.props.match.params.state) {
      case 'start':
        return <CrowdFundingIntro handleCreateLink={this.handleCreateLink} />
      case 'add':
        return (
          <AddCrowdFunding
            handleSubmitUserName={this.handleSubmitUserName}
            userName={userName}
            onImageUpload={this.onImageUpload}
            imageUrl={imageUrl}
            buttonLoading={buttonLoading}
            imageLoading={imageLoading}
            buttonDisabled={buttonDisabled}
            handleValidateUserName={this.handleValidateUserName}
            crowdFundingSuggestionList={crowdFundingSuggestionList}
            handleCrowdFundingSuggestions={this.handleCrowdFundingSuggestions}
            validateUserName={validateUserName}
            handleBack={this.handleBack}
            activeTab={activeTab}
            onTabChanges={this.handleOnTabChange}
            onVideoUpload={this.onVideoUpload}
            handleTabSwitch={this.handleTabSwitch}
            mediaType={this.state.mediaType}
          />
        )
      case 'edit':
        return (
          <EditCrowdFunding
            handleBack={this.handleBack}
            onImageUpload={this.onImageUpload}
            imageUrl={imageUrl}
            crowdFundingLink={crowdFundingLink}
            imageLoading={imageLoading}
            agreement={agreement}
            buttonLoading={buttonLoading}
            updateImage={this.updateImage}
            handleTerms={this.handleTerms}
            handleCreateLink={this.handleCreateLink}
            handleSubmitPeyme={this.handelSubmitPeyme}
            activeTab={activeTab}
            onTabChanges={this.handleOnTabChange}
            onVideoUpload={this.onVideoUpload}
            handleTabSwitch={this.handleTabSwitch}
            mediaType={this.state.mediaType}
          />
        )
      case 'share':
        return (
          <ShareCrowdFunding
            crowdFundingLink={crowdFundingLink}
            handleBack={this.handleBack}
            openGlobalSnackbar={this.props.openGlobalSnackbar}
            handleDone={this.handleCreateLink}
          />
        )

      default:
        return (
          <ViewCrowdFunding
            crowdFundingData={crowdFundingData}
            isViewer={isViewer}
            onImageUpload={this.onImageUpload}
            imageUrl={imageUrl}
            activeTab={activeTab}
            onTabChanges={this.handleOnTabChange}
            handleTabSwitch={this.handleTabSwitch}
            onVideoUpload={this.onVideoUpload}
            imageLoading={imageLoading}
            buttonLoading={buttonLoading}
            mediaType={this.state.mediaType}
            handleChangeEditToggle={this.handleChangeEditToggle}
            refreshReport={refreshReport}
            openGlobalSnackbar={this.props.openGlobalSnackbar}
            refreshPayment={refreshPayment}
            handleRefreshPayment={this.handleRefreshPayment}
            handleRefreshStatus={this.handleRefreshStatus}
            handleStatusChange={this.handleStatus}
            showCustomLimit={showCustomLimit}
            customLimitAmount={customLimitAmount}
            handleMaxQuantity={this.handleMaxQuantity}
            shouldAskProcessingFee={shouldAskProcessingFee}
            isRequestTip={isRequestTip}
            isEnableRecurringFunding={isEnableRecurringFunding}
            isOneTimePaymentScheduleAllowed={isOneTimePaymentScheduleAllowed}
            handlePeyMeProcessingFee={this.handlePeyMeProcessingFee}
            handleRequestTip={this.handleRequestTip}
            handleEnableRecurringCrowdFunding={
              this.handleEnableRecurringCrowdFunding
            }
            handleEnableOneTimePaymentSchedule={this.handleEnableOneTimePaymentSchedule}
            limitLoading={limitLoading}
            memoLimitLoading={memoLimitLoading}
            editCustomLimit={editCustomLimit}
            crowdFundingMemo={crowdFundingMemo}
            handlePeymeMemo={this.handleIsMemoChange}
            peymeMemoLabel={memoLabel}
            handleText={this.handleText}
            handleAddMemo={this.handleAddMemo}
            handleItemPopupOpen={this.handleItemPopupOpen}
            handleEditCrowdFunding={this.handleEditCrowdFunding}
            handleCustomLimitChange={this.handleCustomLimitChange}
          />
        )
    }
  }

  render() {
    const {
      buttonLoading,
      isViewer,
      crowdFundingData,
      itemModel,
      paymentSettings,
      currencies,
      priceLess,
    } = this.state
    const { isCrowdfundingEnabled } = this.props
    const status = crowdFundingData?.funding?.isActive || false
    const { selectedBusiness } = this.props
    return (
      <div className="content-wrapper__main__fixed checkoutWrapper pdT0">
        {this.state.isLoading ? (
          <Container className="mrT50 text-center">
            <CenterSpinner />
          </Container>
        ) : this.state.paymentSetup ? (
          <NoCheckouts
            paymentSettings={paymentSettings}
            type="funding"
            isViewer={isViewer}
          />
        ) : (
          <div>
            <header className="py-header--page ">
              <div
                className="py-header--title d-flex"
                style={{ alignItems: 'center' }}
              >
                <h1 className="py-heading--title me-2">Give</h1>
                {!this.props.match.params.state && isCrowdfundingEnabled && (
                  <div className="d-flex align-items-center">
                    <Button
                      className="mt-2 ms-2"
                      id="onlinePayment"
                      disabled={buttonLoading || isViewer}
                      color="primary"
                      onClick={() => this.handleStatus(!status)}
                      outline
                    >
                      <div>
                        {buttonLoading ? (
                          <Spinner size="sm" color="default ms-3" />
                        ) : (
                          <span
                            className={`status-${status ? 'online' : 'OFF'}`}
                          >
                            <div
                              className={`devider-circle ${
                                status ? 'online' : 'OFF'
                              }`}
                            ></div>
                            <strong> {status ? 'Online' : 'Offline'}</strong>
                          </span>
                        )}
                      </div>
                    </Button>
                  </div>
                )}
              </div>
            </header>
            {isCrowdfundingEnabled ? (
              <main>
                <div className="container-fluid peyme-container">
                  {this.renderComponent()}
                </div>
              </main>
            ) : (
              <Alert
                color="danger"
                className="alertReciept alert-action alert-danger justify-content-start mt-4"
              >
                <div className="alert-icon">
                  <svg
                    viewBox="0 0 20 20"
                    className="Icon__M me-2"
                    id="info"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10 19a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-2a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm0-11a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 3a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0v-4a1 1 0 0 1 1-1z" />
                  </svg>
                </div>
                <div className="alert-content">
                  <div className="alert-desc">
                    This feature is disabled. Contact customer support for
                    assistance.
                  </div>
                </div>
              </Alert>
            )}
          </div>
        )}
        <Modal
          isOpen={this.state.openItemPopup}
          toggle={this.handleItemPopupClose}
          className="modal-add modal-common"
          centered
        >
          <ModalHeader toggle={this.handleItemPopupClose}>
            {this.state.itemMode === 'create'
              ? 'Create an'
              : this.state.itemMode === 'edit'
              ? 'Edit an'
              : ''}{' '}
            Item
          </ModalHeader>
          <ModalBody>
            <div className="content-wrapper__main__fixed checkout">
              <div className="checkouts-add">
                <div className="checkouts-add__body">
                  <div className="py-table--form">
                    <div className="py-table__header">
                      <Row className="py-table__row">
                        <Col className="py-table__cell" xs={8} md={8}>
                          <strong>Item</strong>
                        </Col>
                        <Col className="py-table__cell-amount" xs={4} md={4}>
                          <strong>Price</strong>
                        </Col>
                      </Row>
                    </div>
                    <div className="py-form--body">
                      <Row className="py-table__row align-items-start product-price-details-row">
                        <Col className="py-table__cell p-0" xs={12} md={12}>
                          <Row className="py-table__row align-items-start">
                            <Col className="py-table__cell pe-0" xs={6} md={6}>
                              <Input
                                required
                                type="text"
                                name="itemName"
                                className="d-block"
                                placeholder="Enter item name"
                                value={itemModel.itemName}
                                onChange={this.handleItemChange}
                              />
                            </Col>
                            <Col
                              className="py-table__cell text-right"
                              xs={6}
                              md={6}
                            >
                              <SelectBox
                                name="currency"
                                getOptionLabel={(value) => value['displayName']}
                                getOptionValue={(value) => value['code']}
                                value={selectedBusiness.currency}
                                onChange={(e) => this.handleCurrency(e)}
                                options={currencies}
                                className="d-inline-block text-left py-select--medium"
                                clearable={false}
                                isDisabled={true}
                              />
                            </Col>
                          </Row>
                          <Row className="py-table__row align-items-start py-table__row--taxes">
                            <Col xs={6} md={6} className="pe-0">
                              <Label
                                htmlFor="taxes2"
                                className="checkout-item-row-tax-section__desc__add__label mb-1"
                              >
                                Description
                              </Label>
                              <Input
                                name="description"
                                id="description"
                                placeholder="Describe your item"
                                type="textarea"
                                className="checkout-item-row-tax-section__desc__add__field"
                                value={itemModel.description}
                                onChange={this.handleItemChange}
                              />
                            </Col>
                            <Col xs={6} md={6} className="py-table__cell">
                              <label
                                for="noFixedRate"
                                className="py-switch m-0 mt-3 mb-2"
                              >
                                <b className="py-toggle__title me-2">
                                  No fixed rate
                                </b>
                                <input
                                  type="checkbox"
                                  id="noFixedRate"
                                  name="noFixedRate"
                                  className="py-toggle__checkbox"
                                  checked={itemModel.noFixedRate}
                                  onChange={this.handleItemChange}
                                />
                                <span className="py-toggle__handle"></span>
                              </label>
                              {!itemModel.noFixedRate ? (
                                <>
                                  <Input
                                    type="number"
                                    step="any"
                                    name="price"
                                    className={
                                      'text-right  ' +
                                      (priceLess ? 'less-price w-100' : 'w-100')
                                    }
                                    value={itemModel.price}
                                    onChange={this.handleItemChange}
                                    onBlur={this.convertToDecimal}
                                  />
                                  <Label
                                    htmlFor="grandTotal"
                                    className="checkout-item-row-tax-section__tax__add__label mb-1 mt-2"
                                  >
                                    Total:{' '}
                                    {getAmountToDisplay(
                                      selectedBusiness &&
                                        selectedBusiness.currency,
                                      itemModel.price
                                    )}
                                  </Label>
                                </>
                              ) : null}
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              outline
              className="me-2"
              onClick={this.handleItemPopupClose}
            >
              Cancel
            </Button>
            <Button color="primary" onClick={this.handleItemSubmit}>
              Save
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    )
  }
}

const mapPropsToState = ({
  snackbar,
  businessReducer,
  settings: { featureFlags } = {},
}) => {
  const isCrowdfundingEnabled =
    get(featureFlags, 'settings.isCrowdfundingEnabled', 'true') === 'true';

  return {
    updateData: snackbar.updateData,
    selectedBusiness: businessReducer.selectedBusiness,
    isCrowdfundingEnabled,
  }
}

export default withRouter(
  connect(mapPropsToState, { openGlobalSnackbar })(Index)
)
