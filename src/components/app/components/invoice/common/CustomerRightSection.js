import React, { Component } from 'react';
import {
    Col,
    Input,
    Label,
    Tooltip,
    FormGroup
  } from 'reactstrap'
import DatepickerWrapper from '../../../../../utils/formWrapper/DatepickerWrapper'
import SelectBox from '../../../../../utils/formWrapper/SelectBox'
import FormValidationError from '../../../../../global/FormValidationError';
import { _getDiffDate, _toDateConvert } from '../../../../../utils/globalMomentDateFunc';

class CustomerRightSection extends Component{
    constructor(props){
        super(props);
    }
    render(){
        let {
            invoiceInput,
            handleOnInputChange,
            tooltipAutoGenDate,
            tooltipAutoGenNo,
            toggleToolTip,
            PAYMENT_DUE_OPTION,
            invoiceNumErr
        } = this.props;

        return(
        <Col md={5} sm={7} >
            <div className="py-form-field--condensed create-inovice-right-field">
              <div className="py-form-field py-form-field--inline v-center">
                <Label
                  htmlFor="invoiceNumber"
                  className="py-form-field__label is-required"
                >
                  Invoice number
                </Label>
                {
                  window.location.pathname.includes('/app/recurring') ? (
                    <div
                      className="py-form-field py-form-field__element"
                      id="autoGenerateRecurringNumber"
                    >
                      <Label>Auto-generated</Label>
                      <Tooltip
                        placement="top"
                        id="invoice_date"
                        isOpen={tooltipAutoGenNo}
                        target="autoGenerateRecurringNumber"
                        toggle={() =>
                          toggleToolTip(
                            'Auto-generated-Number'
                          )
                        }
                      >
                        <strong>
                          The invoice number will be automatically
                          assigned.
                        </strong>
                      </Tooltip>
                    </div>
                  ) : (
                    <div className="py-form-field__element">
                      <Input
                        type="text"
                        value={invoiceInput.invoiceNumber}
                        name="invoiceNumber"
                        id="invoiceNumber"
                        className="py-form__element__small"
                        onChange={handleOnInputChange}
                      />
                      <FormValidationError
                        showError={invoiceNumErr}
                      />
                    </div>
                  )
                }
              </div>
              <div className="py-form-field py-form-field--inline v-center">
                <Label
                  htmlFor="purchaseOrder"
                  className="py-form-field__label"
                >
                  P.O./S.O. number
                </Label>
                <div className="py-form-field py-form-field__element">
                  <Input
                    type="Text"
                    value={invoiceInput.purchaseOrder}
                    name="purchaseOrder"
                    className="py-form__element__small"
                    onChange={handleOnInputChange}
                    id="purchaseOrder"
                  />
                </div>
              </div>

              {window.location.pathname.includes('/app/recurring') ? (
                <div>
                  <FormGroup className="py-form-field py-form-field--inline v-center">
                    <Label
                      htmlFor="invoice_date"
                      className="py-form-field__label is-required"
                    >
                      Invoice date
                    </Label>
                    <div
                      className="py-form-field py-form-field__element"
                      id="autoGenerateRecurringDate"
                    >
                      <Label>Auto-generated</Label>
                      <Tooltip
                        placement="top"
                        id="invoice_date"
                        isOpen={tooltipAutoGenDate}
                        target="autoGenerateRecurringDate"
                        toggle={() =>
                          toggleToolTip(
                            'Auto-generated-Date'
                          )
                        }
                      >
                        <strong>
                          The invoice date will be automatically
                          assigned based on the invoice schedule
                          and frequency.
                        </strong>
                      </Tooltip>
                    </div>
                  </FormGroup>
                  <FormGroup className="py-form-field py-form-field--inline v-center">
                    <Label
                      htmlFor="payment_due"
                      className="py-form-field__label is-required"
                    >
                      Payment due
                    </Label>
                    <div className="py-form-field py-form-field__element">
                      <SelectBox
                        getOptionLabel={(value)=>(value["value"])}
                        getOptionValue={(value)=>(value["key"])}
                        value={invoiceInput.notifyStatus}
                        onChange={e =>
                          handleOnInputChange(
                            e,
                            'notifyStatus'
                          )
                        }
                        options={PAYMENT_DUE_OPTION}
                        clearable={false}
                        className="py-form__element__small"
                        id="payment_due"
                      />
                    </div>
                  </FormGroup>
                </div>
              ) : (
                <div>
                  <div className="py-form-field py-form-field--inline v-center">
                    <Label
                      htmlFor="invoiceDate"
                      className="py-form-field__label is-required"
                    >
                      Invoice date
                    </Label>
                    <div className="py-form-field__element">
                    <DatepickerWrapper
                      selected={invoiceInput.invoiceDate ? new Date(invoiceInput.invoiceDate) : new Date()}
                      onChange={date =>
                        handleOnInputChange(
                          date,
                           'invoiceDate'
                          )
                        }
                        maxDate={
                          invoiceInput.dueDate && new Date(invoiceInput.dueDate) > new Date()
                            ? new Date(invoiceInput.dueDate)
                            : null
                        }
                      className="py-form__element__small form-control"
                      popperPlacement="top-end"
                      id="invoiceDate"
                  />
                    </div>
                  </div>
                  <div className="py-form-field py-form-field--inline">
                    <Label
                      htmlFor="dueDate"
                      className="py-form-field__label mt-1 is-required"
                    >
                      Payment due
                    </Label>
                    <div className="py-form-field__element">
                    <DatepickerWrapper
                        selected={invoiceInput.dueDate ? new Date(invoiceInput.dueDate) : new Date()}
                        onChange={date => 
                          handleOnInputChange(
                            date,
                             'dueDate'
                            )
                          }
                        minDate={invoiceInput.invoiceDate ? new Date(invoiceInput.invoiceDate): ''}
                        className="py-form__element__small form-control"
                        popperPlacement="top-end"
                        id="dueDate"
                    />
                      <span className="py-text--hint mt-0">
                        {' '}
                        {invoiceInput.dueDate &&
                        invoiceInput.invoiceDate &&
                        _getDiffDate(invoiceInput.dueDate, invoiceInput.invoiceDate) > 0
                          ? `Within ${invoiceInput.dueDate &&
                              invoiceInput.invoiceDate &&
                              _getDiffDate(invoiceInput.dueDate, invoiceInput.invoiceDate)} days`
                          : 'On Receipt'}{' '}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Col>
          )
    }

};

export default CustomerRightSection;
