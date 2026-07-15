/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import {
  Button,
  Input,
  InputGroup,
  InputGroupText,
  Spinner,
  UncontrolledTooltip
} from 'reactstrap';
import { connect } from 'react-redux';
import Icon from '../../../../../common/Icon';
import symbolsIcon from '../../../../../../assets/icons/product/symbols.svg';

const ShareLink = (props) => {
  const {
    toggleShareLink,
    shareLinkOpen,
    crowdFundingData,
    imageUrl,
    showCustomLimit,
    crowdFundingMemo,
    handlePeymeMemo,
    peymeMemoLabel,
    handleText,
    customLimitAmount,
    handleMaxQuantity,
    isViewer,
    shouldAskProcessingFee,
    handlePeyMeProcessingFee,
    isRequestTip,
    isEnableRecurringFunding,
    isOneTimePaymentScheduleAllowed,
    handleEnableRecurringCrowdFunding,
    handleEnableOneTimePaymentSchedule,
    handleRequestTip,
    limitLoading,
    memoLimitLoading,
    handleAddMemo,
    handleTabSwitch,
    handleCustomLimitChange,
    provider
  } = props;

  const shareLink = crowdFundingData?.funding?.publicView?.shareableLinkUrl || '';
  const copyText = () => {
    const cb = navigator.clipboard;
    const paragraph = document.getElementById('shareLink');
    cb.writeText(paragraph.innerText);
  };
  const [errorClass, setErrorClass] = useState('');
  const [memoErrorClass, setMemoErrorClass] = useState('');

  useEffect(() => {
    setErrorClass(parseFloat(customLimitAmount) <= 0 || customLimitAmount === null ? 'error-limit-input' : '');
    setMemoErrorClass(peymeMemoLabel === '' ? 'error-limit-input' : '');
    setTimeout(() => {
      setErrorClass('');
      setMemoErrorClass('');
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
    setErrorClass('error-limit-input');
    setTimeout(() => {
      setErrorClass('');
    }, 1000);
    handleCustomLimitChange(e);
  };

  const handleMemoChange = (e) => {
    if (peymeMemoLabel === '') {
      setMemoErrorClass('error-limit-input');
      setTimeout(() => {
        setMemoErrorClass('');
      }, 1000);
    }
    handlePeymeMemo(e);
  };

  const handleEnableMemo = (e) => {
    if (peymeMemoLabel === '') {
      setMemoErrorClass('error-limit-input');
      setTimeout(() => {
        setMemoErrorClass('');
      }, 1000);
    } else {
      handleAddMemo(e);
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
                    <Button className="copy-action" disabled={isViewer} color="link"
                            onClick={copyText}>
                      <Icon
                        className="Icon"
                        xlinkHref={`${symbolsIcon}#copy`}
                      />
                    </Button>
                  </div>

                  <div className="request-address-and-phone-row d-flex mt-4"
                       style={{ alignItems: 'center' }}>
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
                      <div className="py-table__cell ps-0 peyme-limit-input"
                           style={{ width: 'calc(100% - 220px)' }}>
                        <InputGroup className={errorClass}>
                          <InputGroupText
                            className="cursor-pointer rounded-left">{crowdFundingData?.funding?.business?.currency?.symbol || '$'}</InputGroupText>
                          <Input
                            type="number"
                            name="maxQuantity"
                            min="1"
                            step=".01"
                            placeholder="Enter limit"
                            className={parseFloat(customLimitAmount) <= 0 || !customLimitAmount ? 'mt-0 error-input-box' : 'mt-0 normal-input-box'}
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
                            {limitLoading ? <Spinner size="sm" style={{
                              height: '18px',
                              width: '18px'
                            }}
                                                     color="default" /> : 'Set limit'}
                          </InputGroupText>
                          }
                        </InputGroup>
                      </div> : null}
                  </div>
                  <div
                    className="request-address-and-phone-row mt-4 d-flex justify-content-start align-items-center">
                    <div className="me-3 w-25">
                      <label htmlFor="memo" className="py-switch m-0">
                        <span className="py-toggle__label ms-0 me-3">Memo</span>
                        <input
                          type="checkbox"
                          id="memo"
                          disabled={isViewer}
                          name="memo"
                          className="py-toggle__checkbox"
                          checked={crowdFundingMemo}
                          onChange={(e) => handleMemoChange(e)}
                        />
                        <span className="py-toggle__handle" />
                      </label>
                    </div>
                    {crowdFundingMemo ?
                      <div className="py-table__cell ps-0 peyme-limit-input w-100">
                        <InputGroup className={memoErrorClass}>
                          <Input
                            type="text"
                            name="memoLabel"
                            placeholder="What would you like to request?"
                            className={`mt-0" d-inline-block ${peymeMemoLabel === '' ? 'error-input-box' : 'normal-input-box'}`}
                            disabled={isViewer}
                            onBlur={peymeMemoLabel && !memoLimitLoading && handleEnableMemo}
                            value={peymeMemoLabel}
                            onChange={handleText}
                            id="peymeMemoLabel"
                          />
                        </InputGroup>
                      </div>
                      : null}
                  </div>
                  <div className="py-table__cell ps-0 mt-4">
                    <label htmlFor="shouldAskProcessingFee" className="py-switch m-0">
                      <UncontrolledTooltip placement="top" target="fees_toltip"
                                           style={{ 'min-width': '280px' }}>By enabling this
                        feature, you can pass your credit/debit card processing fees on to your
                        customers. The line item will show as a “Convenience/Technology Fee” on your
                        invoices and/or checkouts, when enabled. Please note, in some jurisdictions,
                        charging processing fees to your customers is prohibited by law. It is your
                        responsibility to act in accordance with applicable
                        law.</UncontrolledTooltip>
                      <span className="py-toggle__label ms-0 me-2"><b>Apply processing fees to customer</b>&nbsp;
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
                  <div className="py-table__cell ps-0 mt-4 d-none">
                    <label htmlFor="isRequestTip" className="py-switch m-0">
                    <span className="py-toggle__label ms-0 me-2">
                      <b>Request a tip</b>
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
                  {provider === 'paypal' ?
                    <>
                      <div className="py-table__cell ps-0 mt-4">
                        <label htmlFor="isEnableRecurringFunding" className="py-switch m-0">
                    <span className="py-toggle__label ms-0 me-2">
                    <b>Allow recurring payments</b>
                    </span>
                          <input
                            type="checkbox"
                            id="isEnableRecurringFunding"
                            name="isEnableRecurringFunding"
                            className="py-toggle__checkbox"
                            checked={isEnableRecurringFunding}
                            onChange={handleEnableRecurringCrowdFunding}
                            disabled={isViewer}
                          />
                          <span className="py-toggle__handle" />
                        </label>
                      </div>
                      <div className="py-table__cell ps-0 mt-4">
                        <label htmlFor="isOneTimePaymentScheduleAllowed" className="py-switch m-0">
                    <span className="py-toggle__label ms-0 me-2">
                    <b>Allow scheduling one-time payment</b>
                    </span>
                          <input
                            type="checkbox"
                            id="isOneTimePaymentScheduleAllowed"
                            name="isOneTimePaymentScheduleAllowed"
                            className="py-toggle__checkbox"
                            checked={isOneTimePaymentScheduleAllowed}
                            onChange={handleEnableOneTimePaymentSchedule}
                            disabled={isViewer}
                          />
                          <span className="py-toggle__handle" />
                        </label>
                      </div>
                    </> : null
                  }
                </div>
                <div className="col-4 position-relative d-flex justify-content-end">
                  <div className="upload-option">
                    {!isViewer ? handleTabSwitch('share') : ''}
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

const mapStateToProps = (state) => {
  const { businessReducer: { selectedBusiness: { provider } = {} } = {} } = state;
  return {
    provider
  };
};

export default connect(mapStateToProps, null)(ShareLink);
