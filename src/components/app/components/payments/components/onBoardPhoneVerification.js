import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { fetchPaymentSettings } from '../../../../../actions/paymentSettings';
import { openGlobalSnackbar } from '../../../../../actions/snackBarAction';
import CenterSpinner from '../../../../../global/CenterSpinner';
import { help, _documentTitle } from "../../../../../utils/GlobalFunctions";
import FormValidationError from "../../../../../global/FormValidationError";
import settingService from '../../../../../api/SettingService';
import {
  Form,
  Input,
  Button,
  FormGroup,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import history from '../../../../../customHistory'

const OnBoardPhoneVerification = props => {
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [openPhoneModal, setOpenPhoneModal] = useState(false);
  const [isPhoneError, setIsPhoneError] = useState(false);
  const [phone, setPhone] = useState("");
  const [countryCodeData, setCountryCodeData] = useState('')
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOTPError, setIsOTPError] = useState(false);
  const [requestId, setRequestId] = useState(false);

  useEffect(() => {
    props.fetchPaymentSettings();
    _documentTitle(props.businessInfo, ' On Boarding Phone Verification ');
  }, [])

  useEffect(() => {
    checkIfFix();
  }, [props.paymemntSettings])

  const checkIfFix = () => {
    const { paymemntSettings: { data } } = props
    if (data.kycStatus === 'verified') {
      history.push('/app/payments')
    }
  }

  const handlePhoneChange = (e, type, countryData) => {
    setIsPhoneError(false);
    setPhone(e);
    setCountryCodeData(countryData && countryData.dialCode);
  }

  const handleOTPChange = (e) => {
    setIsOTPError(false);
    setOtp(e.target.value);
  }

  const handlePhoneVerificationModal = () => {
    setOpenPhoneModal(true);
  }

  const closePhoneModal = () => {
    setOpenPhoneModal(false);
    setIsPhoneError(false);
    setIsOTPError(false)
    setIsOtpSent(false);
    setPhone("");
    setOtp("");
    setRequestId("");
  }

  const handlePhoneVerification = async () => {
    if (!phone || phone === "" || phone.length <= 4) {
      setIsPhoneError(true);
      return false;
    }
    const { paymemntSettings: { data } } = props
    const requestData = {
      purpose: 'on_boarding',
      mobile: { to: [`+${phone}`], countryCodeData },
      uuid: data.businessId,
      channelType: 'mobile',
      type: 'onBoarding'
    }
    setPhoneLoading(true);
    await settingService.sendOnBoardingOTP({ ...requestData })
      .then(response => {
        setPhoneLoading(false);
        if (response.statusCode === 200) {
          setRequestId(response.data.requestId);
          setIsOtpSent(true);
          props.showSnackbar(response.message);
        } else {
          props.showSnackbar(response.message, true)
        }
      })
      .catch(error => {
        setPhoneLoading(false);
        this.props.showSnackbar(error.message, true)
      })
  }

  const handleOTPVerification = async () => {
    if (!otp || otp === "") {
      setIsOTPError(true);
      return false;
    }
    setPhoneLoading(true);
    await settingService.verifyOnBoardingOTP({ code: otp, phoneNumber: phone, requestId })
      .then(response => {
        setPhoneLoading(false);
        if (response.statusCode === 200) {
          closePhoneModal();
          props.showSnackbar(response.message);
          history.push('/app/payments');
        } else {
          props.showSnackbar(response.message, true)
        }
      })
      .catch(error => {
        setPhoneLoading(false);
        this.props.showSnackbar(error.message, true)
      })
  }

  const { paymemntSettings: { loading, data } } = props

  if (loading) {
    return (<div className="content-wrapper__main__fixed text-center vh-100 d-flex align-items-center">
      <CenterSpinner />
    </div>)
  }
  else {
    return (
      <div className="content-wrapper__main__fixed text-center vh-100 d-flex align-items-center">
        <div className="py-status-page">
          <div className="py-box">
            <div className="py-box--content">
              <h1 className="py-heading--title mb-4">We need to verify your mobile phone number</h1>        
              <div className="py-heading--subtitle">                                
                <p>Below, you should see a “Verify Mobile Phone Number” button.</p>
                <p>Please click the button to resolve issues related to Know Your Customer.</p>
                <p>If you do not see “Verify Mobile Phone Number” or experiencing issues verifying your mobile phone number, please reach out to Finance Customer Support <a href="javascript: void(0)" className="Link__External" onClick={() => help()}>here</a>.</p>
              </div>
              <Button color="primary mt-4" onClick={handlePhoneVerificationModal}>Verify Mobile Phone Number</Button>
              <div>
                <Modal
                  isOpen={openPhoneModal}
                  toggle={closePhoneModal}
                  id="modal"
                  centered
                  size="medium"
                >
                  <ModalHeader
                    toggle={closePhoneModal}
                    id="modalHeader"
                  >
                    Verify your mobile phone number
                  </ModalHeader>
                  <ModalBody id="modalBody">
                    <div className='row'>
                      <div className='col-md-12'>
                        <FormGroup className="py-form-field py-form-field--inline mt-3 v-center w-100" id="modalFormGroup">
                          <PhoneInput
                            disableSearchIcon	
                            countryCodeEditable={false}
                            value={phone}
                            country={data && data.countryPhone || 'us'}
                            enableSearch
                            onChange={(e, countryData) => {
                              handlePhoneChange(e, 'phone', countryData)
                            }}
                            disabled={isOtpSent}
                            inputClass="w-100"
                          />
                        </FormGroup>
                        <FormValidationError
                          showError={isPhoneError}
                          message='This field is required'
                        />
                      </div>
                    </div>
                    {
                      isOtpSent ?
                        <div className='row'>
                          <div className='col-md-12'>
                            <FormGroup className="w-100">
                              <Input
                                type="text"
                                name="phone_otp"
                                id="phone_otp"
                                placeholder="Enter OTP"
                                value={otp}
                                disabled={phoneLoading}
                                onChange={(e) => handleOTPChange(e, 'otp')}
                              />
                              <FormValidationError showError={isOTPError} />
                            </FormGroup>
                          </div>
                        </div>
                      : null
                    }
                    <div className="tabfooter text-right">
                      <Button
                        type="button"
                        color="primary" outline 
                        onClick={closePhoneModal}
                        disabled={phoneLoading}
                      >Cancel</Button>
                      {
                        !isOtpSent ?
                          <Button
                            disabled={phoneLoading}
                            onClick={handlePhoneVerification}
                            color="primary"
                          >{ phoneLoading ? <Spinner size="sm" color="light" /> : 'Send one-time-passcode'}</Button>
                        : <Button
                            disabled={phoneLoading}
                            onClick={handleOTPVerification}
                            color="primary"
                          >{ phoneLoading ? <Spinner size="sm" color="light" /> : 'Verify one-time-passcode'}</Button>
                      }
                    </div>
                  </ModalBody>
                </Modal>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    businessInfo: state.businessReducer.selectedBusiness,
    paymemntSettings: state.paymentSettings
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchPaymentSettings: () => {
      dispatch(fetchPaymentSettings())
    },
    showSnackbar: (message, error) => {
      dispatch(openGlobalSnackbar(message, error))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OnBoardPhoneVerification)