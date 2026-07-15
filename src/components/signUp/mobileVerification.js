import React, { useState } from 'react'
import PhoneInput from 'react-phone-input-2'
import { Button, Input, Label, Spinner } from 'reactstrap'

const MobileVerification = ({mobileNumber, handleBackNavigation, handleResendOtp, handleVerifyOtp, btnLoad, email}) => {
  const [otpData, setOtpData] = useState('')
  const [emailOtpData, setEmailOtpData] = useState('')
  return (
    <div className=''>
      <div className="row mx-n3">
        <div className="signup_form_phone col-sm-12 px-3 mb-3">
          <Label for="AccountSignup__Mobile" className="label is-required">Phone number</Label>
          <PhoneInput
            disableSearchIcon
            name="phone"
            country='us'
            value={mobileNumber}
            countryCodeEditable={false}
            disabled
            enableSearch
            id="signup_user_phone"
            inputClass="feild-height w-100"
            containerClass="custom-select-div signup_form_phone"
          />
        </div>
        <div className="row col-sm-12 px-3 mb-3">
          <div className="col-md-9">
            <Label for="AccountSignup__Mobile" className="label is-required">Enter your phone OTP</Label>
            <Input
              type="text"
              name="otp__Verification"
              id="OTP__Verification__Input"
              placeholder="Enter your phone OTP"
              value={otpData}
              onChange={(e) => setOtpData(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <Button color="primary" outline className="btn-resend" onClick={() => handleResendOtp('phone_otp')}>Resend</Button>
          </div>
        </div>
        <div className="col-sm-12 px-3 mb-3">
          <Label for="AccountSignup__Mobile" className="label is-required">Email address</Label>
          <Input
            type="text"
            name="email"
            id="AccountSignup__Email"
            placeholder="Email address"
            value={email}
            disabled
          />
          
        </div>
        <div className="row col-sm-12 px-3 mb-3">
          <div className="col-md-9">
            <Label for="AccountSignup__Mobile" className="label"><span className={"is-required"}
                                                                       style={{ paddingRight: 15 }}>Enter your email OTP</span>
              <span>check spam</span></Label>
            <Input
              type="text"
              name="otp__Verification"
              id="OTP__Verification__Input"
              placeholder="Enter your email OTP"
              value={emailOtpData}
              onChange={(e) => setEmailOtpData(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <Button color="primary" outline className="btn-resend" onClick={() => handleResendOtp('email_otp')}>Resend</Button>
          </div>
        </div>
        <div className="col-md-6 px-3 mb-3">
        </div>
        <div className="col-md-6 px-3 mb-3 d-flex justify-content-around">
          <Button color="primary" className="btn-sq" onClick={handleBackNavigation}>Back</Button>
          <Button color="primary" className="btn-sq" onClick={() => handleVerifyOtp(otpData, emailOtpData)} disabled={btnLoad}>{btnLoad ? <Spinner color="default" size="sm" /> : 'Submit'}</Button>
        </div>
      </div>
    </div>
  )
}

export default MobileVerification
