import React, { Fragment } from 'react';
import { connect } from "react-redux";
import Icon from '../../../../common/Icon';
import SelectBox from '../../../../../utils/formWrapper/SelectBox';
import { Spinner, Button } from 'reactstrap';
import FormValidationError from '../../../../../global/FormValidationError';
import {updateData} from "../../../../../actions/snackBarAction";
import symbolsIcon from "../../../../../assets/icons/product/symbols.svg";
const RecurringStep4 = props => {

  const { isViwer, invoiceData, editMode, handleEditMode, handleScheduler, handleSendMail, step4Load, addRecipientAddress, removeRecipientAddress, emails, fromErr, fromMsg, toErr } = props
  const { sendMail, isManual,paid } = invoiceData

  return (
    <div className={invoiceData.paid.isPaid ? "py-box py-box--large" : "py-box py-box--large disabled"}>
      <div className="invoice-steps-card__options">
        <div className="invoice-step-Collapsible__header-content recurring-invoice-Collapsible__header-content">
          <div className="step-indicate">
            {sendMail.isSent && !editMode ? (
              <div className="step-icon step-done plane-icon">
                <Icon
                  className="Icon"
                  xlinkHref={`${symbolsIcon}#paper_plane`}
                />
              </div>
            ) : (
                <div className="step-icon plane-icon">
                  <Icon
                    className="Icon"
                    xlinkHref={`${symbolsIcon}#paper_plane`}
                  />
                </div>
              )}
          </div>
          <div className="py-heading--subtitle">Send</div>
          {!isViwer && invoiceData.recurrence.isSchedule && paid.isPaid && (invoiceData.status == 'active' || invoiceData.status == 'draft') && (<React.Fragment>
            {sendMail.isSent ?
              <div className="step-btn-box">
                {editMode ?
                  <Fragment>
                    <Button onClick={e => handleEditMode('step4')} type="button" color="primary" outline >Cancel</Button>
                    <Button  onClick={e => handleScheduler(!sendMail.autoSendEnabled, 'autoSendEnabled')} type="button" color="primary" outline >{`Switch to ${sendMail.autoSendEnabled || !isManual ? 'manual' : 'automatic'} sending`}</Button>
                    <Button onClick={e => handleSendMail('step4')} type="button" color="primary" disabled={step4Load}>{step4Load ? <Spinner size="sm" color="default" /> : 'Save'}</Button>
                  </Fragment>
                  : <Button onClick={e => handleEditMode('step4')} type="button" color="primary" outline >Edit</Button>}
              </div>
              :
              <React.Fragment>
                {(sendMail.autoSendEnabled !== null || !isManual) ?  <div className="step-btn-box">
                  <Button disabled={!isManual} onClick={e => handleScheduler(!sendMail.autoSendEnabled, 'autoSendEnabled')} type="button" color="primary" outline >{`Switch to ${sendMail.autoSendEnabled || !isManual ? 'manual' : 'automatic'} sending`}</Button>
                <Button onClick={e => handleSendMail('step4')} type="button" color="primary" disabled={step4Load}>{step4Load ? <Spinner size="default" color="sm" /> : 'Next'}</Button>
              </div> : ''}
              </React.Fragment>
            }
          </React.Fragment>)}
        </div>
      </div>
      {
        invoiceData.paid.isPaid && (
          <div className="invoice-steps-card__content mt-3 ms-4 me-2 ps-5">
            {sendMail.isSent && !editMode ?
              <React.Fragment>
                {sendMail.autoSendEnabled !== null && sendMail.autoSendEnabled ?
                  <div className="pz-text-strong">
                    <span className="py-text py-text--body"><strong className="py-text--strong">Automatic sending: </strong> Email the invoice automatically to {!!invoiceData.sendMail.to && invoiceData.sendMail.to.length > 0 && invoiceData.sendMail.to.map((item, i) => (<a href={`mailto:${item}`}>{i === 0 ? item : `, ${item}`}</a>))} when the invoice is generated.</span>
                  </div>
                  :
                  <div className="pz-text-strong">                    
                    <span className="py-text py-text--body"><strong className="py-text--strong">Manual sending: </strong>I will send each invoice to my customer.</span>
                  </div>}
              </React.Fragment>
              : sendMail.autoSendEnabled === null  && isManual ?
                <div className="py-content--narrow-send-type">
                  <button onClick={e => handleScheduler(true, 'autoSendEnabled')} className="py-button--secondary">
                    <div className="py-decor-icon">
                      <img src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/paper-plain.png`} />
                    </div>
                    <div className="pt-2 pb-2"> <strong className="py-text--strong">Automatic sending</strong> </div>
                    <span> Each invoice will be automatically emailed to your customer. </span>
                  </button>
                  <button onClick={e => handleScheduler(false, 'autoSendEnabled')} className="py-button--secondary">
                    <div className="py-decor-icon">
                      <img src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/open_envelope.png`} />
                    </div>
                    <div className="pt-2 pb-2"> <strong className="py-text--strong">Manual sending</strong> </div>
                    <span> I will manually send each invoice to my customer. </span>
                  </button>
                </div>
                : <Fragment>
                  {sendMail.autoSendEnabled !== null && !sendMail.autoSendEnabled ? <div className="py-box is-active mt-3">
                    <div className="d-flex align-items-center justify-content-start">
                      <div className="py-decor-icon">
                        <img src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/open_envelope.png`} />
                      </div>
                      <div className="ps-3">
                        <strong className="py-text--strong">Manual sending </strong>
                        <p className="m-0"> I will manually send each invoice to my customer.</p>
                      </div>
                    </div>
                  </div> :
                    <Fragment>
                      <div className="py-box is-active mt-3">
                        <div className="d-flex align-items-center justify-content-start">
                          <div className="py-decor-icon">
                            <img src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/paper-plain.png`} alt="Paper plane" />
                          </div>
                          <div className="ps-3">
                            <span className="py-text--strong">Automatic sending </span>
                            <p className="py-text m-0"> The invoice will be automatically emailed to your customer.</p>
                          </div>
                        </div>
                      </div>

                      <div className="recurring-invoice-view-send-auto-section__form">
                        <div className="send-with-py py-box py-box--card">
                          <div className="py-box__header">
                            <h4 className="py-box__header-title size-sm">Send with Finance</h4>
                          </div>
                          <div className="py-box--content">
                            <div className="py-form-field py-form-field--inline">
                              <label htmlFor="exampleEmail" className="py-form-field__label pt-0">Send</label>
                              <div className="py-form-field__element">
                                <strong className="py-text--strong">Invoice only</strong>
                                <div className="py-text--hint">The invoice will be emailed to your customer automatically.</div>
                              </div>
                            </div>
                            <div className="py-form-field py-form-field--inline">
                              <label htmlFor="exampleEmail" className="py-form-field__label">From</label>
                              <div className="py-form-field__element">
                                <SelectBox
                                  name="from"
                                  getOptionLabel={(value)=>(value["email"])}
                                  getOptionValue={(value)=>(value["email"])}
                                  value={{email: sendMail?.from}}
                                  onChange={(selected, e) => handleScheduler(e, 'sendMail', '', selected)}
                                  options={emails}
                                  placeholder="Choose"
                                  id="fromEmail"
                                  aria-required
                                  className="py-form__element__medium"
                                  clearable={false}
                                />
                                <FormValidationError
                                  showError={fromErr}
                                  message={fromMsg}
                                />
                              </div>
                            </div>
                            <div className="py-form-field py-form-field--inline">
                              <label htmlFor="exampleEmail" className="py-form-field__label">To</label>
                              <div className="py-form-field__element">
                                {sendMail.to.map((address, index) => {
                                  return index === 0 ? (
                                    <div key={index} className="multirecipient">
                                      <input
                                        required
                                        name="to"
                                        type="email"
                                        className="form-control py-form__element__medium"
                                        value={address}
                                        onChange={e => handleScheduler(e, 'sendMail', index)} />
                                      <a className="multirecipient__icon py-text--link" onClick={addRecipientAddress}>
                                        <svg viewBox="0 0 26 26" className="Icon" id="add--large" xmlns="http://www.w3.org/2000/svg"><path d="M13 24C6.925 24 2 19.075 2 13S6.925 2 13 2s11 4.925 11 11-4.925 11-11 11zm0-2a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path><path d="M12 8a1 1 0 0 1 2 0v10a1 1 0 0 1-2 0V8z"></path><path d="M8 14a1 1 0 0 1 0-2h10a1 1 0 0 1 0 2H8z"></path></svg>
                                      </a>
                                      {
                                        toErr.length > 0 && (
                                          <FormValidationError
                                            showError={!!toErr.find(item => !!item[`to-${index}`] && item[`to-${index}`] === true) ? toErr.find(item => item[`to-${index}`] === true)[`to-${index}`] : false}
                                            message={!!toErr.find(item => !!item[`to-${index}`] && item[`to-${index}`] === true) ? toErr.find(item => item[`to-${index}`] === true).message : ''}
                                          />
                                        )
                                      }
                                    </div>
                                  ) :
                                    (<div key={index} className="multirecipient">
                                      <div>
                                        <input
                                          required
                                          name="to"
                                          type="email"
                                          className="form-control py-form__element__medium"
                                          value={address}
                                          onChange={e => handleScheduler(e, 'sendMail', index)} />
                                      </div>
                                      <a className="multirecipient__icon py-text--link" onClick={() => removeRecipientAddress(index)}>
                                        <svg viewBox="0 0 20 20" className="Icon" id="cancel" xmlns="http://www.w3.org/2000/svg"><path d="M11.592 10l5.078 5.078a1.126 1.126 0 0 1-1.592 1.592L10 11.592 4.922 16.67a1.126 1.126 0 1 1-1.592-1.592L8.408 10 3.33 4.922A1.126 1.126 0 0 1 4.922 3.33L10 8.408l5.078-5.078a1.126 1.126 0 0 1 1.592 1.592L11.592 10z"></path></svg>
                                      </a>
                                      {
                                        toErr.length > 0 && (
                                          <FormValidationError
                                            showError={!!toErr.find(item => !!item[`to-${index}`] && item[`to-${index}`] === true) ? toErr.find(item => item[`to-${index}`] === true)[`to-${index}`] : false}
                                            message={!!toErr.find(item => !!item[`to-${index}`] && item[`to-${index}`] === true) ? toErr.find(item => item[`to-${index}`] === true).message : ''}
                                          />
                                        )
                                      }
                                    </div>)
                                })}
                                <span className="py-text--hint"> An email address is required for automatic sending.</span>
                              </div>
                            </div>
                            <div className="py-form-field py-form-field--inline">
                              <label htmlFor="exampleEmail" className="py-form-field__label">Custom Message</label>
                              <div className="py-form-field__element">
                                <textarea type="text" name="message" value={sendMail.message} onChange={e => handleScheduler(e, 'sendMail')} style={{ height: '148px' }} className="form-control py-form__element__medium" placeholder="Enter message to your customer"></textarea>
                              </div>
                            </div>
                            {/* <div className="py-form-field py-form-field--inline">
                              <label htmlFor="exampleEmail" className="py-form-field__label"></label>
                              <div className="py-form-field__element">
                                <a target="_blank" className="Link__External" href={`${process.env.REACT_APP_WEB_URL}/recurring/${invoiceData._id}/mail-preview`} >Preview email</a>
                              </div>
                            </div> */}
                            <div className="py-form-field py-form-field--inline">
                              <div htmlFor="exampleEmail" className="py-form-field__label"></div>

                              <div className="py-form-field__element">
                                {/* <label className="py-checkbox">
                                  <input name="attachPdf" type="checkbox" onChange={e => handleScheduler(e, 'sendMail')} className="py-form__element" checked={sendMail.attachPdf} value={sendMail.attachPdf} />
                                  <span className="py-form__element__faux"></span>
                                  <span className="py-form__element__label">Attach PDF of the invoice to the email sent to the customer</span>
                                </label> */}

                                <label className="py-checkbox">
                                  <input name="copyMyself" onChange={e => handleScheduler(e, 'sendMail')} type="checkbox" className="py-form__element" checked={sendMail.copyMyself} value={sendMail.copyMyself} />
                                  <span className="py-form__element__faux"></span>
                                  <span className="py-form__element__label">Email a copy of each invoice to myself</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Fragment>
                  }
                </Fragment>
            }
          </div>
        )
      }
    </div>
  )
}

const mapStateToProps = state => ({
  businessInfo: state.businessReducer.selectedBusiness
});

const mapDispatchToProps = dispatch => {
  return {
    refreshData: () => {
      dispatch(updateData())
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(RecurringStep4);