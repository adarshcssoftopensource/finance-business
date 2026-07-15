/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import {
  Button,
  Spinner,
  UncontrolledTooltip, InputGroup,
  InputGroupText, Input, Label, TabContent, TabPane,
} from 'reactstrap';

import Icon from '../../../../../common/Icon';
import symbolsIcon from "../../../../../../assets/icons/product/symbols.svg";
import PaymeServices from '../../../../../../api/PaymeServices';
import { PROVIDER_NAME } from '../../../../../../utils/Provider.const';

const ShareLink = (props) => {
  const { toggleShareLink,
    shareLinkOpen,
    peymeData,
    imageUrl,
    showCustomLimit,
    peymeMemo,
    handlePeymeMemo,
    peymeMemoLabel,
    handleText,
    customLimitAmount,
    handleMaxQuantity,
    isViewer,
    shouldAskProcessingFee,
    handlePeyMeProcessingFee,
    isRequestTip,
    handleRequestTip,
    limitLoading,
    memoLimitLoading,
    handleAddMemo,
    handleTabSwitch,
    isBillingAddress,
    isShippingAddress,
    handleBillingAddress,
    handleShippingAddress,
    handleCustomLimitChange } = props
  const shareLink = peymeData ? peymeData.peyme.publicView.shareableLinkUrl : "";
  const provider = peymeData?.peyme?.provider;
  const copyText = () => {
    const cb = navigator.clipboard;
    const paragraph = document.getElementById('shareLink');
    cb.writeText(paragraph.innerText);
  };
  const [errorClass, setErrorClass] = useState('');
  const [memoErrorClass, setMemoErrorClass] = useState('');
  const [paymentButtons, setPaymentButtons] = useState({
    payWithPaypal: peymeData?.peyme?.paymentButtons?.payWithPaypal || false,
    payLaterWithPaypal: peymeData?.peyme?.paymentButtons?.payLaterWithPaypal || false,
    payWithVenmo: peymeData?.peyme?.paymentButtons?.payWithVenmo || false,
  });
  const [numbersOnlyMemo, setNumbersOnlyMemo] = useState(peymeData?.peyme?.numbersOnlyMemo || false);
  const [hideProcessingFee, setHideProcessingFee] = useState(peymeData?.peyme?.hideProcessingFee || false);

  useEffect(() => {
    setErrorClass(parseFloat(customLimitAmount) <= 0 || customLimitAmount === null ? "error-limit-input" : "")
    setMemoErrorClass(peymeMemoLabel === "" ? "error-limit-input" : "")
    setTimeout(() => {
      setErrorClass('');
      setMemoErrorClass("")
    }, 1000);
  }, [customLimitAmount]);

  const handleAddLimit = () => {
    if (parseFloat(customLimitAmount) > 0) {
      handleMaxQuantity();
    } else {
      setErrorClass('error-limit-input');
      setTimeout(() => {
        setErrorClass('');
      }, 1000);
    }
  };

  const handleLimitChange = (e) => {
    setErrorClass("error-limit-input")
    setTimeout(() => {
      setErrorClass("")
    }, 1000);
    handleCustomLimitChange(e)
  }

  const handleMemoChange = (e) => {
    if (peymeMemoLabel === "") {
      setMemoErrorClass("error-limit-input")
      setTimeout(() => {
        setMemoErrorClass("")
      }, 1000);
    }
    handlePeymeMemo(e)
  }

  const handleEnableMemo = (e) => {
    if (peymeMemoLabel === "") {
      setMemoErrorClass("error-limit-input")
      setTimeout(() => {
        setMemoErrorClass("")
      }, 1000);
    } else {
      handleAddMemo(e)
    }
  }

  const handlePaymentButtons = async (e, buttonType) => {
    const payload = {
      peymeInput: {
        [buttonType]: e.target.checked
      }
    }
    setPaymentButtons({
      ...paymentButtons,
      [buttonType]: e.target.checked
    })
    await PaymeServices.updatePeymeImage(payload)
  }

  const handleNumbersOnlyMemoChange = async (e) => {
    const value = e.target.checked;
    setNumbersOnlyMemo(value);

    const payload = { peymeInput: { numbersOnlyMemo: value } };

    try {
      await PaymeServices.updatePeymeImage(payload);
      props.openGlobalSnackbar(`Numbers only memo ${value ? 'Enabled' : 'Disabled'}`);
    } catch (err) {
      console.error(err);
      props.openGlobalSnackbar('Failed to update numbers only memo');
    }
  };

  const handleHideProcessingFeeChange = async (e) => {
    const value = e.target.checked;
    setHideProcessingFee(value);

    const payload = { peymeInput: { hideProcessingFee: value } };

    try {
      await PaymeServices.updatePeymeImage(payload);
      props.openGlobalSnackbar(`Hide processing fee ${value ? 'Enabled' : 'Disabled'}`);
    } catch (err) {
      console.error(err);
      props.openGlobalSnackbar('Failed to update hide processing fee');
    }
  };


  return (
    <div>
      <div className="py-box py-box--large">
        <div className="invoice-steps-card__options">
          <div className="invoice-step-Collapsible__header-content">
            <div className="step-indicate">
              <div className="step-icon plane-icon">
                <Icon
                  className="Icon"
                  xlinkHref={`${symbolsIcon}#external-link`}
                />
              </div>
            </div>
            <div className="d-flex cursor-pointer w-100" onClick={toggleShareLink}>
              <div className="py-heading--subtitle">Your link </div>
              <div className="invoice-step-card__actions">
                <div className={`collapse-arrow ms-auto ${shareLinkOpen && 'collapsed'}`}>
                  <i className="fas fa-chevron-up" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </div>
        {shareLinkOpen
          && (
            <div className="invoice-steps-card__content mt-3 ms-4 me-2 ps-5 peyme-share-wrapper">
              <div className="invoice-create-info">
                <div className="row align-items-start">
                  <div className="col-8">
                    <p className="py-text mb-4 mt-0">
                      Copy this link to share with your friends, family, and
                      customers to get paid instantly.
                    </p>
                    <div className="py-share-link">
                      <span className="link-icon">
                        <i className="far fa-link" />
                      </span>
                      <a
                        id="shareLink"
                        href={`${shareLink}?isUser=true`}
                        target="_blank"
                        className="link-content"
                      >
                        {shareLink}
                      </a>
                      <Button className="copy-action" disabled={isViewer} color="link" onClick={copyText}>
                        <Icon
                          className="Icon"
                          xlinkHref={`${symbolsIcon}#copy`}
                        />
                      </Button>
                    </div>

                    <div className="request-address-and-phone-row d-flex mt-4" style={{ alignItems: 'center' }}>
                      {!isViewer
                        && (
                          <div className="py-table__cell ps-0">
                            <label htmlFor="limitCheck" className="py-switch m-0">
                              <span className="py-toggle__label ms-0 me-2">Per transaction limit</span>
                              <input
                                type="checkbox"
                                id="limitCheck"
                                disabled={isViewer}
                                name="limitCheck"
                                className="py-toggle__checkbox"
                                checked={showCustomLimit}
                                onChange={(e) => handleLimitChange(e)}
                              />
                              <span className="py-toggle__handle" />
                            </label>
                          </div>)}
                      {showCustomLimit ?
                        <div className="py-table__cell ps-0 peyme-limit-input" style={{ width: "calc(100% - 220px)" }}>
                          <InputGroup className={errorClass}>
                            <InputGroupText className="cursor-pointer rounded-left">{peymeData.peyme.business.currency.symbol}</InputGroupText>
                            <Input
                              type="number"
                              name="maxQuantity"
                              min="1"
                              step=".01"
                              placeholder="Enter limit"
                              className={parseFloat(customLimitAmount) <= 0 || !customLimitAmount ? "mt-0 error-input-box" : "mt-0 normal-input-box"}
                              disabled={isViewer}
                              value={customLimitAmount}
                              onChange={handleCustomLimitChange}
                              id="maxQuantity"
                            />
                            {!isViewer &&
                              <InputGroupText
                                className="cursor-pointer btn-primary limit-button"
                                disabled
                                onClick={!limitLoading && handleAddLimit}
                              >
                                {limitLoading ? <Spinner size="sm" style={{ height: "18px", width: "18px" }}
                                  color="default" /> : "Set limit"}
                              </InputGroupText>
                            }
                          </InputGroup>
                        </div> : null}
                    </div>

                    <div className="request-address-and-phone-row mt-4 d-flex flex-column">
                      <div className="me-3 w-25">
                        <label htmlFor="memo" className="py-switch m-0">
                          <span className="py-toggle__label ms-0 me-3">Memo</span>
                          <input
                            type="checkbox"
                            id="memo"
                            disabled={isViewer}
                            name="memo"
                            className="py-toggle__checkbox"
                            checked={peymeMemo}
                            onChange={(e) => handleMemoChange(e)}
                          />
                          <span className="py-toggle__handle" />
                        </label>
                      </div>

                      {peymeMemo ?
                        <div className="d-flex align-items-center mt-2">
                          <Input
                            type="text"
                            name="memoLabel"
                            placeholder="What would you like to request?"
                            className={`mt-0 d-inline-block ${peymeMemoLabel === "" ? "error-input-box" : "normal-input-box"}`}
                            disabled={isViewer}
                            value={peymeMemoLabel}
                            onChange={handleText}
                          />
                          <Button
                            color="primary"
                            size="sm"
                            disabled={memoLimitLoading || peymeMemoLabel === ""}
                            onClick={handleEnableMemo}
                            className="ms-2"
                          >
                            {memoLimitLoading ? <Spinner size="sm" /> : "Save"}
                          </Button>
                        </div>
                        : null}

                      {peymeMemo &&
                        <div className="py-table__cell ps-0 mt-4">
                          <label htmlFor="numbersOnlyMemo" className="py-switch m-0">
                            <span className="py-toggle__label ms-0 me-2">Memo should be numbers only</span>
                            <input
                              type="checkbox"
                              id="numbersOnlyMemo"
                              name="numbersOnlyMemo"
                              className="py-toggle__checkbox"
                              checked={numbersOnlyMemo}
                              onChange={handleNumbersOnlyMemoChange}
                              disabled={isViewer}
                            />
                            <span className="py-toggle__handle" />
                          </label>
                        </div>
                      }

                    </div>
                    <div className="py-table__cell ps-0 mt-4">
                      <label htmlFor="shouldAskProcessingFee" className="py-switch m-0">
                        <UncontrolledTooltip placement="top" target="fees_toltip" style={{ "min-width": "280px" }}>By enabling this feature, you can pass your credit/debit card processing fees on to your customers. The line item will show as a “Convenience/Technology Fee” on your invoices and/or checkouts, when enabled. Please note, in some jurisdictions, charging processing fees to your customers is prohibited by law. It is your responsibility to act in accordance with applicable law.</UncontrolledTooltip>
                        <span className="py-toggle__label ms-0 me-2">Automatically pass fees to customer&nbsp;
                          <button className="btn p-0 m-0" disabled={isViewer} id="fees_toltip">
                            <i className="fal fa-info-circle" />
                          </button>
                        </span>
                        <input
                          type="checkbox"
                          id="shouldAskProcessingFee"
                          name="shouldAskProcessingFee"
                          className="py-toggle__checkbox"
                          checked={shouldAskProcessingFee}
                          onChange={handlePeyMeProcessingFee}
                          disabled={isViewer}
                        />
                        <span className="py-toggle__handle" />
                      </label>
                    </div>
                    <div className="py-table__cell ps-0 mt-4 d-flex align-items-center justify-content-start">
                      <span className="py-toggle__label me-2">Hide add the processing fees</span>
                      <label htmlFor="hideProcessingFee" className="py-switch m-0">
                        <input
                          type="checkbox"
                          id="hideProcessingFee"
                          name="hideProcessingFee"
                          className="py-toggle__checkbox"
                          checked={hideProcessingFee}
                          onChange={handleHideProcessingFeeChange}
                          disabled={isViewer}
                        />
                        <span className="py-toggle__handle" />
                      </label>
                    </div>
                    <div className="py-table__cell ps-0 mt-4">
                      <label htmlFor="isRequestTip" className="py-switch m-0">
                        <span className="py-toggle__label ms-0 me-2">
                          Allow tips/gratuity
                        </span>
                        <input
                          type="checkbox"
                          id="isRequestTip"
                          name="isRequestTip"
                          className="py-toggle__checkbox"
                          checked={isRequestTip}
                          onChange={handleRequestTip}
                          disabled={isViewer}
                        />
                        <span className="py-toggle__handle" />
                      </label>
                    </div>
                    <div className="py-table__cell ps-0 mt-4 d-none">
                      <label htmlFor="isBillingAddress" className="py-switch m-0">
                        <span className="py-toggle__label ms-0 me-2">
                          Billing address
                        </span>
                        <input
                          type="checkbox"
                          id="isBillingAddress"
                          name="isBillingAddress"
                          className="py-toggle__checkbox"
                          checked={isBillingAddress}
                          onChange={handleBillingAddress}
                          disabled={isViewer}
                        />
                        <span className="py-toggle__handle" />
                      </label>
                    </div>
                    <div className="py-table__cell ps-0 mt-4 d-none">
                      <label htmlFor="isShippingAddress" className="py-switch m-0">
                        <span className="py-toggle__label ms-0 me-2">
                          Shipping address
                        </span>
                        <input
                          type="checkbox"
                          id="isShippingAddress"
                          name="isShippingAddress"
                          className="py-toggle__checkbox"
                          checked={isShippingAddress}
                          onChange={handleShippingAddress}
                          disabled={isViewer}
                        />
                        <span className="py-toggle__handle" />
                      </label>
                    </div>
                    {provider === PROVIDER_NAME.PROVIDER_PAYPAL &&
                      <>
                        <div className="py-table__cell ps-0 mt-4">
                          <label htmlFor="payWithPaypal" className="py-switch m-0">
                            <span className="py-toggle__label ms-0 me-2">PayPal&nbsp;</span>
                            <input
                              type="checkbox"
                              id="payWithPaypal"
                              name="payWithPaypal"
                              className="py-toggle__checkbox"
                              checked={paymentButtons['payWithPaypal']}
                              onChange={e => handlePaymentButtons(e, 'payWithPaypal')}
                              disabled={isViewer}
                            />
                            <span className="py-toggle__handle" />
                          </label>
                        </div>
                        <div className="py-table__cell ps-0 mt-4">
                          <label htmlFor="payLaterWithPaypal" className="py-switch m-0">
                            <span className="py-toggle__label ms-0 me-2">Pay Later&nbsp;</span>
                            <input
                              type="checkbox"
                              id="payLaterWithPaypal"
                              name="payLaterWithPaypal"
                              className="py-toggle__checkbox"
                              checked={paymentButtons['payLaterWithPaypal']}
                              onChange={e => handlePaymentButtons(e, 'payLaterWithPaypal')}
                              disabled={isViewer}
                            />
                            <span className="py-toggle__handle" />
                          </label>
                        </div>
                        <div className="py-table__cell ps-0 mt-4">
                          <label htmlFor="payWithVenmo" className="py-switch m-0">
                            <span className="py-toggle__label ms-0 me-2">Venmo&nbsp;</span>
                            <input
                              type="checkbox"
                              id="payWithVenmo"
                              name="payWithVenmo"
                              className="py-toggle__checkbox"
                              checked={paymentButtons['payWithVenmo']}
                              onChange={e => handlePaymentButtons(e, 'payWithVenmo')}
                              disabled={isViewer}
                            />
                            <span className="py-toggle__handle" />
                          </label>
                        </div>
                      </>
                    }
                  </div>
                  <div className="col-4 position-relative d-flex justify-content-end">
                    <div className='upload-option'>
                      {!isViewer ? handleTabSwitch("share") : ""}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
      <div className="invoice-view__body__vertical-line" />
    </div>
  );
};

export default ShareLink;
