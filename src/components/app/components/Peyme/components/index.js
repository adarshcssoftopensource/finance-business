import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Redirect, withRouter } from 'react-router-dom'
import { Button, Label, Container, Spinner, Nav, NavItem, NavLink, Input, TabContent, TabPane } from 'reactstrap'
import { fetchSignedUrl, uploadImage } from '../../../../../api/businessService'
import PaymeServices from '../../../../../api/PaymeServices'
import history from '../../../../../customHistory'
import { openGlobalSnackbar } from '../../../../../actions/snackBarAction'
import AddPayme from './AddPayme'
import EditPayme from './EditPayme'
import PaymeIntro from './PaymeIntro'
import SharePayme from './SharePayme'
import ViewPeyme from './view'
import { fetchPaymentSetting } from '../../../../../api/SettingService'
import CenterSpinner from '../../../../../global/CenterSpinner'
import { imageUploadValidation, videoUploadValidation } from '../../sales/components/helpers'
import NoCheckouts from '../../../../common/NoCheckouts'
import { handleAclPermissions, help } from '../../../../../utils/GlobalFunctions'


class Index extends Component {
  constructor(props) {
    super(props)

    this.state = {
      imageUrl: null,
      imageLoading: false,
      userName: '',
      mediaType: "image",
      isLoading: true,
      peymeData: null,
      buttonLoading: false,
      loadingSuggestions: false,
      validateUserName: false,
      agreement: false,
      buttonDisabled: true,
      refreshPayment: false,
      peymeLink: "",
      activeTab: "1",
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
      peymeSuggestionList: [],
      peymeMemo: false,
      memoLabel: "What is this payment for?",
      isRequestTip: false,
      isBillingAddress: false,
      isShippingAddress: false,
    }
  }

  componentDidMount = () => {
    this.setState({
      isViewer: handleAclPermissions(['Viewer'])
    })

    this.handleRefreshStatus()
  }

  componentDidUpdate = (prevProps) => {
    const businessInfo = JSON.parse(JSON.parse(localStorage.getItem('reduxPersist:root')).businessReducer).selectedBusiness
    document.title = businessInfo
      ? `Finance - ${businessInfo.organizationName} - Finance.Me Lynk`
      : 'Finance - Finance.Me Lynk'
    if (this.props.match.params.state !== prevProps.match.params.state) {
      if (!this.props.match.params.state) {
        this.handleRefreshStatus()
      }
    }
  }

  handleCreateLink = path => {
    this.props.history.push(path)
  }

  handleBack = path => {
    this.props.history.push(path)
  }

  handleRefreshStatus = async () => {
    this.setState({
      refreshReport: true
    })
    const customerList = await PaymeServices.fetchPeymeLink()
      .then(res => {
        if (res.data === null) {
          this.handleCheckPayment()
        } else {
          this.setState({
            peymeData: res.data,
            paymentSetup: false,
            isLoading: false,
            activeTab: res.data.peyme.mediaType === "video" ? "2" : "1",
            mediaType: res.data.peyme.mediaType === "video" ? "video" : "image",
            refreshReport: false,
            shouldAskProcessingFee: res.data.peyme.shouldAskProcessingFee || false,
            isRequestTip: res.data.peyme.isRequestTip || false,
            isBillingAddress: res.data.peyme.isBillingAddress || false,
            isShippingAddress: res.data.peyme.isShippingAddress || false,
            showCustomLimit: res.data.peyme.isCustomLimitSet || false,
            customLimitAmount: res.data.peyme.amountLimit.toFixed(2) || null,
            peymeMemo: res.data.peyme.isMemo || false,
            memoLabel: res.data.peyme.memoLabel || "What is this payment for?"
          })
          history.push('/app/payyitme')
        }
      })
      .catch(e => { })
  }

  handlePeymeSuggestions = async (val) => {
    this.setState({ loadingSuggestions: true });
    const peymeSuggestions = await PaymeServices.peymeLinkSuggestions()
      .then(res => {
        this.setState({
          peymeSuggestionList: res.data,
          loadingSuggestions: false
        })
      })
      .catch(e => {
        this.setState({
          peymeSuggestionList: [],
          loadingSuggestions: false
        })
      })
  }

  handleValidateUserName = async (val, type) => {
    const userName = type ? val : val.target.value
    this.setState({
      userName
    })
    if (userName && userName !== "") {
      await PaymeServices.validatePeymeLink(userName)
        .then(res => {
          if (res.data.link) {
            this.setState({
              peymeLink: res.data.link,
              validateUserName: false,
              buttonDisabled: false
            })
          }
        })
        .catch(error =>
          this.setState({
            validateUserName: true,
            buttonDisabled: true
          })
        )
    } else {
      this.setState({
        buttonDisabled: true
      })
    }
  }

  onImageUpload = async (event, type) => {
    this.setState({
      imageLoading: true
    })
    if (event === "remove") {
      const payload = {
        peymeInput: {
          imageUrl: null,
          mediaType: "image"
        }
      }
      await PaymeServices.updatePeymeImage(payload)
        .then(res => {
          this.setState({
            imageUrl: null,
            peymeData: res.data,
            imageLoading: false
          })
        })
        .catch(error => {
          this.setState({
            imageLoading: false
          })
          this.props.openGlobalSnackbar(error.message, true)
        })
    } else {
      const file = event.target.files[0]
      let imageUrl
      if (file) {
        if (!imageUploadValidation(file)) {
          this.props.openGlobalSnackbar('Please upload only JPG, PNG or GIF file with size 10MB or below', true)
          this.setState({
            imageLoading: false
          })
        } else {
          if (type === "view") {
            imageUrl = await this.getSignedUrl(file)
            this.setState({
              imageUrl: type === "view" ? imageUrl : file,
              imageLoading: false
            })
            this.updateImage(type)
          } else {
            this.setState({
              imageUrl: type === "view" ? imageUrl : file,
              mediaType: this.state.activeTab === "2" ? "video" : "image",
              imageLoading: false
            })
          }
        }
      } else {
        this.setState({
          imageLoading: false
        })
      }
    }
  }

  onRemovePeyme = () => {
    this.setState({
      imageLoading: false,
      imageUrl: null
    })
  }

  onVideoUpload = async (event, type) => {
    this.setState({
      imageLoading: true
    })
    if (event === "remove") {
      const payload = {
        peymeInput: {
          imageUrl: null,
          mediaType: "video"
        }
      }
      await PaymeServices.updatePeymeImage(payload)
        .then(res => {
          this.setState({
            peymeData: res.data,
            imageUrl: null,
            imageLoading: false
          })
        })
        .catch(error => {
          this.setState({
            imageLoading: false
          })
          this.props.openGlobalSnackbar(error.message, true)
        })
    } else {
      const file = event.target.files[0]
      let imageUrl
      if (file) {
        if (!videoUploadValidation(file)) {
          this.props.openGlobalSnackbar('Please upload only WebM, MKV, MP4, MOV, or GIF file with size 500MB or below', true)
          this.setState({
            imageLoading: false
          })
        } else {
          if (type === "view") {
            imageUrl = await this.getSignedUrl(file)
            this.setState({
              imageUrl: type === "view" ? imageUrl : file,
              imageLoading: false
            })
            this.updateImage(type)
          } else {
            this.setState({
              imageUrl: type === "view" ? imageUrl : file,
              mediaType: this.state.activeTab === "2" ? "video" : "image",
              imageLoading: false
            })
          }
        }
      } else {
        this.setState({
          imageLoading: false
        })
      }
    }
  }

  getSignedUrl = async file => {
    try {
      const payload = {
        s3Input: {
          contentType: file.type,
          fileName: file.name,
          uploadType: 'peyme'
        }
      }
      const response = await fetchSignedUrl(payload)
      const { sUrl, pUrl } = response.data.signedUrl
      if (sUrl) {
        await uploadImage(sUrl, file, file.type)
        return pUrl
      }
    } catch (error) {
      //   logger.log(error, 'gggggggggggg');
      this.props.openGlobalSnackbar(
        'Something went wrong, please try again',
        true
      )
    }
  }

  handleCustomLimitChange = async (e) => {
    if (e.target.name === "limitCheck") {
      this.setState({
        showCustomLimit: !this.state.showCustomLimit
      })
      if (this.state.showCustomLimit && this.state.customLimitAmount) {
        const payload = {
          peymeInput: {
            isCustomLimitSet: false,
            amountLimit: 0
          }
        }
        await PaymeServices.updatePeymeImage(payload).then(res => {
          this.setState({
            customLimitAmount: null,
            peymeData: res.data,
          })
          this.props.openGlobalSnackbar("transaction limit disabled")
        })

      }
    } else {
      const regex = new RegExp('^0+(?!$)', 'g')
      this.setState({
        customLimitAmount: e.target.value > 0 ? e.target.value.toString().replaceAll(regex, '') : null
      })
    }

  }

  handleSubmitUserName = async () => {
    this.setState({
      buttonDisabled: true,
      buttonLoading: true
    })
    if (this.state.userName !== '') {
      this.setState({
        buttonDisabled: false,
        buttonLoading: false
      })
      this.handleCreateLink('edit')
    } else {
      this.setState({
        buttonLoading: false
      })
      this.props.openGlobalSnackbar('Please provide username', true)
    }
  }

  updateImage = async (type) => {
    this.setState({
      buttonLoading: true
    })
    if (!this.state.imageUrl && this.state.peymeData) {
      this.setState({
        buttonLoading: false
      })
      if (!type) {
        this.handleCreateLink('share')
      }
    } else {
      const payload = {
        peymeInput: {
          imageUrl: this.state.imageUrl,
          mediaType: this.state.activeTab === "2" ? "video" : "image"
        }
      }
      await PaymeServices.updatePeymeImage(payload)
        .then(res => {
          this.setState({
            peymeData: res.data,
            mediaType: this.state.activeTab === "2" ? "video" : "image",
            buttonLoading: false,
          })
          if (type !== "view") {
            this.handleCreateLink('share')
          }
        })
        .catch(error => {
          this.setState({
            buttonLoading: false
          })
          this.props.openGlobalSnackbar(error.message, true)
        })
    }
  }

  handlePeyMeProcessingFee = async () => {
    this.setState({ shouldAskProcessingFee: !this.state.shouldAskProcessingFee }, async () => {
      const payload = {
        peymeInput: {
          shouldAskProcessingFee: this.state.shouldAskProcessingFee
        }
      }
      await PaymeServices.updatePeymeImage(payload)
        .then(res => {
          this.setState({
            peymeData: res.data,
            shouldAskProcessingFee: res.data.peyme.shouldAskProcessingFee
          })
          this.props.openGlobalSnackbar(`Apply fees to customer ${this.state.shouldAskProcessingFee ? 'enabled' : 'disabled'}`)
        })
        .catch(error => {
          this.props.openGlobalSnackbar(error.message, true)
        })
    })
  }

  handleRequestTip = async () => {
    this.setState({ isRequestTip: !this.state.isRequestTip }, async () => {
      const payload = {
        peymeInput: {
          isRequestTip: this.state.isRequestTip
        }
      }
      await PaymeServices.updatePeymeImage(payload)
        .then(res => {
          this.setState({
            peymeData: res.data,
            isRequestTip: res.data.peyme.isRequestTip
          })
          this.props.openGlobalSnackbar(`Request fees to customer ${this.state.isRequestTip ? 'enabled' : 'disabled'}`)
        })
        .catch(error => {
          this.props.openGlobalSnackbar(error.message, true)
        })
    })
  }

  handleBillingAddress = async () => {
    this.setState({ isBillingAddress: !this.state.isBillingAddress }, async () => {
      const payload = {
        peymeInput: {
          isBillingAddress: this.state.isBillingAddress
        }
      }
      await PaymeServices.updatePeymeImage(payload)
        .then(res => {
          this.setState({
            peymeData: res.data,
            isBillingAddress: res.data.peyme?.isBillingAddress
          })
          this.props.openGlobalSnackbar(`Request for billing address ${this.state.isBillingAddress ? 'enabled' : 'disabled'}`)
        })
        .catch(error => {
          this.props.openGlobalSnackbar(error.message, true)
        })
    })
  }

  handleShippingAddress = async () => {
    this.setState({ isShippingAddress: !this.state.isShippingAddress }, async () => {
      const payload = {
        peymeInput: {
          isShippingAddress: this.state.isShippingAddress
        }
      }
      await PaymeServices.updatePeymeImage(payload)
        .then(res => {
          this.setState({
            peymeData: res.data,
            isShippingAddress: res.data.peyme?.isShippingAddress
          })
          this.props.openGlobalSnackbar(`Request for shipping address ${this.state.isShippingAddress ? 'enabled' : 'disabled'}`)
        })
        .catch(error => {
          this.props.openGlobalSnackbar(error.message, true)
        })
    })
  }

  handleCheckPayment = async () => {
    await fetchPaymentSetting().then(res => {
      if (!this.state.isViewer) {
        if (res.data.paymentSetting.isSetupDone || res.data.paymentSetting?.legalData?.isPayByBankEnabled || res.data.paymentSetting?.legalData?.isBnplEnabled) {
          history.push('/app/payyitme/start')
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
            paymentSetup: true
          })
        }
      }
    }).catch(error => {
      this.props.openGlobalSnackbar(error.message, true)
    })
  }

  handleTerms = e => {
    this.setState({
      agreement: e.target.checked
    })
  }

  handleRefreshPayment = () => {
    this.setState({
      refreshPayment: !this.state.refreshPayment
    })
  }


  handelSubmitPeyme = async () => {
    this.setState({
      buttonLoading: true
    })
    let imageUrl
    if (this.state.imageUrl) {
      imageUrl = await this.getSignedUrl(this.state.imageUrl);
    }
    const payload = {
      peymeInput: {
        peymeName: this.state.userName,
        imageUrl: imageUrl ? imageUrl : null,
        mediaType: this.state.activeTab === "2" ? "video" : "image"
      }
    }
    await PaymeServices.addPeymeLink(payload)
      .then(res => {
        this.setState({
          peymeData: res.data,
          mediaType: this.state.activeTab === "2" ? "video" : "image",
          buttonLoading: false
        })
        this.handleCreateLink('share')
      })
      .catch(error => {
        this.setState({
          buttonLoading: false
        })
        this.props.openGlobalSnackbar(error.message, true)
      })
  }


  handleStatus = async (status) => {
    this.setState({
      buttonLoading: true
    })
    const payload = {
      peymeInput: {
        status: status === "ON" ? "Online" : "Offline"
      }
    }
    await PaymeServices.updatePeymeImage(payload)
      .then(res => {
        this.setState({
          peymeData: res.data,
          buttonLoading: false
        })
      })
      .catch(error => {
        this.setState({
          buttonLoading: false
        })
        this.props.openGlobalSnackbar(error.message, true)
      })
  }

  handleMaxQuantity = async () => {
    this.setState({
      limitLoading: true
    })
    if (this.state.showCustomLimit && parseFloat(this.state.customLimitAmount) > 0) {
      const payload = {
        peymeInput: {
          isCustomLimitSet: this.state.showCustomLimit,
          amountLimit: parseFloat(parseFloat(this.state.customLimitAmount).toFixed(2))
        }
      }
      await PaymeServices.updatePeymeImage(payload).then(res => {
        this.props.openGlobalSnackbar("transaction limit enabled", false)
        this.setState({
          customLimitAmount: res.data.peyme.amountLimit.toFixed(2),
          editCustomLimit: false,
          peymeData: res.data,
          limitLoading: false
        })
      }).catch(err => {
        this.props.openGlobalSnackbar(err.message, true)
        this.setState({
          editCustomLimit: false,
          customLimitAmount: this.state.customLimitAmount,
          limitLoading: false
        })
      })
    }
  }

  handleAddMemo = async () => {
    this.setState({ memoLimitLoading: true });

    if (this.state.peymeMemo && this.state.memoLabel && this.state.memoLabel !== "") {
      const payload = {
        peymeInput: {
          isMemo: this.state.peymeMemo,
          memoLabel: this.state.memoLabel
        }
      };

      try {
        const res = await PaymeServices.updatePeymeImage(payload);

        const message = res.data.peyme.isMemo && this.state.memoLabel === res.data.peyme.memoLabel
          ? "Memo updated"
          : "Memo enabled";

        this.props.openGlobalSnackbar(message, false);

        this.setState({
          memoLabel: res.data.peyme.memoLabel,
          peymeMemo: res.data.peyme.isMemo,
          peymeData: res.data,
          memoLimitLoading: false
        });
      } catch (err) {
        this.props.openGlobalSnackbar(err.message, true);
        this.setState({ memoLimitLoading: false });
      }
    }
  };

  handleChangeEditToggle = (type) => {
    this.setState({
      editCustomLimit: !this.state.editCustomLimit,
      customLimitAmount: type === "close" ? this.state.peymeData.peyme.amountLimit : this.state.customLimitAmount
    })
  }

  handleIsMemoChange = async (e) => {
    const isMemo = e.target.checked;
    this.setState({
      peymeMemo: isMemo
    })
    const payload = {
      peymeInput: {
        isMemo: isMemo,
        memoLabel: "What is this payment for?"
      }
    }
    await PaymeServices.updatePeymeImage(payload).then(res => {
      this.setState({
        peymeMemo: isMemo,
        memoLabel: "What is this payment for?",
        peymeData: res.data,
      })
      this.props.openGlobalSnackbar(!isMemo ? "memo disabled" : "memo enabled")
    })
  }

  handleText = (e) => {
    this.setState({
      memoLabel: e.target.value
    })
  }

  handleOnTabChange = (tab, type) => {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      })
    }
  }

  handleTabSwitch = (type) => {
    const { activeTab, imageLoading, imageUrl, mediaType, peymeData, isLoading, isViewer } = this.state
    return (
      <div className="mb-3">
        <Nav className="nav nav-pills tab-2 mb-3">
          <NavItem>
            <NavLink active={this.state.activeTab === '1'} onClick={() => this.handleOnTabChange("1", type)}>Image</NavLink>
          </NavItem>
          <NavItem>
            <NavLink active={this.state.activeTab === '2'} onClick={() => this.handleOnTabChange("2", type)}>Videos</NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="1">
            {imageLoading ? (
              <div className="spinner-wrapper uploader-zone p-0">
                {' '}
                <Spinner size="md" color="default my-1" />
                {' '}
              </div>
            ) : (
              ((type && peymeData.peyme.imageUrl) || imageUrl) && mediaType === "image" ? (
                <div className="uploader-zone p-0">
                  <div>
                    <div className="uploaded-image">
                      <img height="170px" src={type ? peymeData.peyme.imageUrl : URL.createObjectURL(imageUrl)} alt="" />
                    </div>
                    {!isViewer && <Button className="remove-icon" color="danger" onClick={() => type ? this.onImageUpload('remove') : this.onRemovePeyme()}><i className="fal fa-times" /></Button>}
                  </div>
                </div>
              ) : (
                <Label className="uploader-zone">
                  {
                    imageLoading ?
                      <div className="spinner-wrapper">
                        {' '}
                        <Spinner size="md" color="default my-1" />
                        {' '}
                      </div> :
                      <div>
                        <span className="upload-icon"><i className="fal fa-upload" /></span>
                        <div className="py-text--browse">
                          <span className="py-text--link">Browse</span>{' '}
                          or drop your image here.
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
                          onChange={(e) => this.onImageUpload(e, type && "view")}
                          name="userPhoto"
                          accept=".jpg,.png,.jpeg"
                        />
                      </div>
                  }
                </Label>
              )
            )}
          </TabPane>
          <TabPane tabId="2">
            {imageLoading ? (
              <div className="spinner-wrapper uploader-zone p-0">
                {' '}
                <Spinner size="md" color="default my-1" />
                {' '}
              </div>
            ) : (((type && peymeData.peyme.imageUrl) || imageUrl) && mediaType === "video" ? (
              <div className="uploader-zone p-0">
                <div className="uploaded-video">
                  <video width="300px" height="170px" src={type ? peymeData.peyme.imageUrl : URL.createObjectURL(imageUrl)} controls>
                    <p>Your browser doesn't support HTML5 video. Here is
                      a <a href={type ? peymeData.peyme.imageUrl : URL.createObjectURL(imageUrl)}>link to the video</a> instead.
                    </p>
                  </video>
                </div>
                {!isViewer && <Button className="remove-icon" color="danger" onClick={() => type ? this.onVideoUpload('remove') : this.onRemovePeyme()}><i className="fal fa-times" /></Button>}
              </div>
            ) : (
              <Label className="uploader-zone">
                {imageLoading ?
                  <div className="spinner-wrapper">
                    {' '}
                    <Spinner size="md" color="default my-1" />
                    {' '}
                  </div>
                  :
                  <div>
                    <div>
                      <span className="upload-icon">
                        <i className="fal fa-upload" />
                      </span>
                      <div className="py-text--browse">
                        <span className="py-text--link">
                          Browse
                        </span>{' '}
                        or drop your video here.
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
                        onChange={(e) => this.onVideoUpload(e, type && "view")}
                        name="peymeVideo"
                        className="h-100"
                        accept=".webm,.gif,.mkv,.mp4,.mov"
                      />
                    </div>
                  </div>}
              </Label>
            )
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
      loadingSuggestions,
      imageLoading,
      validateUserName,
      peymeData,
      buttonDisabled,
      refreshPayment,
      userName,
      peymeLink,
      refreshReport,
      showCustomLimit,
      customLimitAmount,
      isViewer,
      editCustomLimit,
      shouldAskProcessingFee,
      limitLoading,
      memoLimitLoading,
      peymeMemo,
      memoLabel,
      peymeSuggestionList,
      activeTab,
      isRequestTip,
      isBillingAddress,
      isShippingAddress
    } = this.state
    switch (this.props.match.params.state) {
      case 'start':
        return <PaymeIntro handleCreateLink={this.handleCreateLink} />
        break
      case 'add':
        return (
          <AddPayme
            handleSubmitUserName={this.handleSubmitUserName}
            userName={userName}
            onImageUpload={this.onImageUpload}
            imageUrl={imageUrl}
            buttonLoading={buttonLoading}
            loadingSuggestions={loadingSuggestions}
            imageLoading={imageLoading}
            buttonDisabled={buttonDisabled}
            handleValidateUserName={this.handleValidateUserName}
            peymeSuggestionList={peymeSuggestionList}
            handlePeymeSuggestions={this.handlePeymeSuggestions}
            validateUserName={validateUserName}
            handleBack={this.handleBack}
            activeTab={activeTab}
            onTabChanges={this.handleOnTabChange}
            onVideoUpload={this.onVideoUpload}
            handleTabSwitch={this.handleTabSwitch}
            mediaType={this.state.mediaType}
          />
        )
        break
      case 'edit':
        return (
          <EditPayme
            handleBack={this.handleBack}
            onImageUpload={this.onImageUpload}
            imageUrl={imageUrl}
            peymeLink={peymeLink}
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
        break
      case 'share':
        return (
          <SharePayme
            peymeLink={peymeLink}
            handleBack={this.handleBack}
            openGlobalSnackbar={this.props.openGlobalSnackbar}
            handleDone={this.handleCreateLink}
          />
        )
        break

      default:
        return <ViewPeyme
          peymeData={peymeData}
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
          handlePeyMeProcessingFee={this.handlePeyMeProcessingFee}
          handleRequestTip={this.handleRequestTip}
          handleBillingAddress={this.handleBillingAddress}
          handleShippingAddress={this.handleShippingAddress}
          isBillingAddress={isBillingAddress}
          isShippingAddress={isShippingAddress}
          limitLoading={limitLoading}
          memoLimitLoading={memoLimitLoading}
          editCustomLimit={editCustomLimit}
          peymeMemo={peymeMemo}
          handlePeymeMemo={this.handleIsMemoChange}
          peymeMemoLabel={memoLabel}
          handleText={this.handleText}
          handleAddMemo={this.handleAddMemo}
          handleCustomLimitChange={this.handleCustomLimitChange} />
        break
    }
  }

  render() {
    const { buttonLoading, isViewer, peymeData, showCustomLimit, customLimitAmount, paymentSettings } = this.state
    const status = peymeData ? peymeData.peyme.status : ""
    const isVerified = peymeData ? peymeData.peyme.isVerified : ""
    return (
      <div className="content-wrapper__main__fixed checkoutWrapper pdT0">
        {this.state.isLoading ?
          <Container className="mrT50 text-center">
            <CenterSpinner />
          </Container>
          : this.state.paymentSetup ?
            <NoCheckouts
              paymentSettings={paymentSettings}
              type="peyme"
              isViewer={isViewer}
            /> : <div>
              <header className="py-header--page ">
                <div className="py-header--title d-flex" style={{ alignItems: "center" }}>
                  <h1 className="py-heading--title me-2">My Finance.Me Lynk</h1>
                  {!this.props.match.params.state &&
                    <div className="d-flex align-items-center">
                      <Button className="mt-2 ms-2" id="onlinePayment" disabled={buttonLoading || isViewer} color="primary" onClick={() => this.handleStatus(status === "Online" ? 'OFF' : 'ON')} outline>
                        <div>
                          {buttonLoading ? (<Spinner size="sm" color="default ms-3" />)
                            : <span className={`status-${status === "Online" ? 'online' : 'OFF'}`}>
                              <div className={`devider-circle ${status === "Online" ? 'online' : 'OFF'}`}></div>
                              <strong> {status === "Online" ? 'Online' : 'Offline'}</strong>
                            </span>}
                        </div>
                      </Button>
                      {/* <span className={isVerified === true ? "badge badge-success ms-3 py-2 mt-2" : "badge badge-danger ms-3 py-2 mt-2"}>{isVerified === true ? 'Verified' : 'not Verified'}</span>
                      {isVerified === true ? '' :
                        <span className='verifiedbox text-center mt-2 ms-3 py-2' style={{display: 'flex'}}>
                          <span className='text-center ms-2'>
                          To Verify your Peyme <br />
                          Please Contact to Support
                          </span>
                          <button type="button" className="btn btn-outline-primary mt-2 ms-3 me-2 py-3" onClick={() => help()}>Chat with Us</button>
                        </span>
                      } */}
                    </div>
                  }
                </div>
              </header>
              <main>
                <div className="container-fluid peyme-container">
                  {this.renderComponent()
                  }
                </div>
              </main>
            </div>
        }
      </div>
    )
  }
}

const mapPropsToState = ({ snackbar }) => ({
  updateData: snackbar.updateData
})

export default withRouter(
  connect(mapPropsToState, { openGlobalSnackbar })(Index)
)
