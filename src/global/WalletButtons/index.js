import React from 'react';
import { Tooltip, Button } from 'reactstrap';
import styled from "styled-components";


const PayButton = styled.div`
  .btn.disabled, 
  .btn:disabled {
      opacity: 1;
  }
`;


const WalletButtons = props => {
  const {
    applePay,
    paymentRequest,
    tooltipAppleOpen,
    toggleApple,
    tooltipGoogleOpen,
    toggleGoogle
  } = props
  return (
    <React.Fragment>
      <PayButton>
        <div className="row mx-n2 mb-3 mt-n2 justify-content-center">
          <div className="col-sm-4 p-2">
            <Button
              disabled={paymentRequest && applePay === true ? false : true}
              onClick={
                paymentRequest && applePay === true
                  ? () => paymentRequest.show()
                  : ''
              }
              color="default"
              block
              className="wellet-button"
              id="AppleToolTip"
            >
              <img
                src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/digital-payment/apple-pay-logo.svg`}
              />
            </Button>
            {paymentRequest && applePay === true ? (
              ''
            ) : (
              <Tooltip
                placement="top"
                isOpen={tooltipAppleOpen}
                target="AppleToolTip"
                toggle={toggleApple}
              >
                ApplePay only works in MacOS Sierra or later & iOS 10.1 or later
              </Tooltip>
            )}
          </div>
          <div className="col-sm-4 p-2">
            <Button
              disabled={paymentRequest && applePay === false ? false : true}
              onClick={
                paymentRequest && applePay === false
                  ? () => paymentRequest.show()
                  : ''
              }
              color="default"
              block
              className="wellet-button"
              id="GoogleToolTip"
            >
              <img
                src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/digital-payment/google-pay-logo.svg`}
              />
            </Button>
            {paymentRequest && applePay === false ? (
              ''
            ) : (
              <Tooltip
                placement="top"
                isOpen={tooltipGoogleOpen}
                target="GoogleToolTip"
                toggle={toggleGoogle}
              >
                Chrome 61, Microsoft Edge 16.1 or newer and An activated Google
                Pay card or a saved card
              </Tooltip>
            )}
          </div>
        </div>
        <div className="row mb-4 pb-2">
          <div className="col text-center">
            <div className="title-divider">or pay with</div>
          </div>
        </div>
      </PayButton>
    </React.Fragment>
  )
}

export default WalletButtons
