/* eslint-disable no-underscore-dangle */
import React, { useState } from 'react'
import PhoneInput from 'react-phone-input-2'
import {
  Button,
  FormGroup,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  Spinner
} from 'reactstrap'
import { refreshToken } from '../../actions/authAction'
import OtpServices from '../../api/otpService'
import profileServices from '../../api/profileService'
import { _setToken } from '../../utils/authFunctions'
import FormValidationError from '../FormValidationError'

const MobileOtpVerify = ({openPhoneModal, closePhoneModal, data, showSnackbar, handleVerifyOtp}) => {
  const [mobileNumber, setMobileNumber] = useState('')
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [requestId, setRequestId] = useState('')
  const [otp, setOtp] = useState("")
  const [isPhoneError, setIsPhoneError] = useState(false)
  const [isOTPError, setIsOTPError] = useState(false)
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [countryCodeData, setCountryCodeData] = useState(false)

  const handlePhoneChange = (e, type, countryData) => {
    setIsPhoneError(false);
    setMobileNumber(e);
    setCountryCodeData(countryData && countryData.dialCode);
  }

  const handleCloseModal = () => {
    setIsPhoneError(false);
    setIsOTPError(false)
    setIsOtpSent(false);
    setMobileNumber("");
    setOtp("");
    setRequestId("");
    closePhoneModal();
  }

  const handleOTPChange = (e) => {
    setIsOTPError(false);
    setOtp(e.target.value);
  }

  const handlePhoneVerification = async () => {
    if (!mobileNumber || mobileNumber === "" || mobileNumber.length <= 4) {
      setIsPhoneError(true);
      return false;
    }
    const requestData = {
      purpose: 'verify_user',
      mobile: { to: [`+${mobileNumber}`], countryCodeData },
      channelType: 'mobile',
    }
    setPhoneLoading(true);
    await OtpServices.send(requestData)
      .then(response => {
        setPhoneLoading(false);
        if (response.statusCode === 200) {
          setRequestId(response.data.requestId);
          setIsOtpSent(true);
          showSnackbar(response.message);
        } else {
          showSnackbar(response.message, true)
        }
      })
      .catch(error => {
        setPhoneLoading(false);
        showSnackbar(error.message, true)
      })
  }

  const handleOTPVerification = async () => {
    if (!otp || otp === "") {
      setIsOTPError(true);
      return false;
    }
    setPhoneLoading(true);
    await OtpServices.verify({ code: otp, phoneNumber: `+${mobileNumber}`, requestId })
      .then(async response => {
        setPhoneLoading(false);
        if (response.statusCode === 200) {
          closePhoneModal();
          showSnackbar(response.message);
          const userObj = {
            userInput:{
              securityCheck: {...data.securityCheck, mobileVerified: true},
              mobileNumber: `+${mobileNumber}`,
              firstName: data.firstName,
              lastName: data.lastName
            }
          }
          await profileServices.updateUser(userObj, data._id).then(async () => {
            handleCloseModal()
            const res = await refreshToken();
            _setToken(res)
            handleVerifyOtp();
          })
        } else {
          showSnackbar(response.message, true)
        }
      })
      .catch(error => {
        setPhoneLoading(false);
        showSnackbar(error.message, true)
      })
  }

  return (
    <Modal
      isOpen={openPhoneModal}
      toggle={handleCloseModal}
      id="modal"
      centered
      size="medium"
    >
      <ModalHeader toggle={handleCloseModal} id="modalHeader">
        Verify your mobile phone number
      </ModalHeader>
      <ModalBody id="modalBody">
        <div className="row">
          <div className="col-md-12">
            <FormGroup
              className="py-form-field py-form-field--inline mt-3 v-center w-100"
              id="modalFormGroup"
            >
              <PhoneInput
                disableSearchIcon
                countryCodeEditable={false}
                value={mobileNumber}
                country={(data && data.countryPhone) || 'us'}
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
              message="This field is required"
            />
          </div>
        </div>
        {isOtpSent ? (
          <div className="row">
            <div className="col-md-12">
              <FormGroup className="w-100">
                <Input
                  type="text"
                  name="phone_otp"
                  id="phone_otp"
                  placeholder="Enter OTP"
                  value={otp}
                  disabled={phoneLoading}
                  onChange={e => handleOTPChange(e, 'otp')}
                />
                <FormValidationError showError={isOTPError} />
              </FormGroup>
            </div>
          </div>
        ) : null}
        <div className="tabfooter text-right">
          <Button
            type="button"
            color="primary"
            outline
            onClick={handleCloseModal}
            disabled={phoneLoading}
          >
            Cancel
          </Button>
          {!isOtpSent ? (
            <Button
              disabled={phoneLoading}
              onClick={handlePhoneVerification}
              color="primary"
            >
              {phoneLoading ? (
                <Spinner size="sm" color="light" />
              ) : (
                'Send one-time-passcode'
              )}
            </Button>
          ) : (
            <Button
              disabled={phoneLoading}
              onClick={handleOTPVerification}
              color="primary"
            >
              {phoneLoading ? (
                <Spinner size="sm" color="light" />
              ) : (
                'Verify one-time-passcode'
              )}
            </Button>
          )}
        </div>
      </ModalBody>
    </Modal>
  )
}

export default MobileOtpVerify
