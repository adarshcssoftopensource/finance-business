import React, { Fragment } from 'react';
import {
  Button,
  Form,
  FormGroup,
  Input,
  Spinner, UncontrolledTooltip
} from 'reactstrap';
import _ from "lodash";
import DatepickerWrapper from "../../../../../utils/formWrapper/DatepickerWrapper";
import SelectBox from "../../../../../utils/formWrapper/SelectBox";
import { INVOICE_END, monthlyList, MONTH_YEAR, REAPAT_INVOICE, SUB_UNIT, WEEKLY_LIST } from "../../../../../constants/recurringConst";
import { _displayDate, _getAllTimeZone, _getStartOf, _toDateConvert } from '../../../../../utils/globalMomentDateFunc';
import Icon from '../../../../common/Icon';
import symbolsIcon from "../../../../../assets/icons/product/symbols.svg";

const RecurringStep2 = props => {
  const { invoiceData, editMode, scheduleRecurringInvoice, handleScheduler, handleEditMode, step2Load, isViwer} = props
  let { isSchedule, subUnit, unit, dayOfWeek, monthOfYear, dayofMonth, startDate, interval, endDate, type, maxInvoices, timezone } = invoiceData.recurrence
  const {timeznList, defaultTimezone} = timeZoneList(timezone);
  return (
    <div className={`py-box py-box--large ${!isSchedule || editMode ? "is-highlighted" : ""}`}>
      <div className="invoice-steps-card__options">
        <div className="invoice-step-Collapsible__header-content recurring-invoice-Collapsible__header-content">
          <div
            className={`${
              invoiceData.skipped
                ? "step-indicate de-activate"
                : "step-indicate"
              }`}
          >
            {isSchedule ? (
              <div className="step-icon step-done cale-icon">
                <Icon
                  className="Icon"
                  xlinkHref={`${symbolsIcon}#date-calender`}
                />
              </div>
            ) : (
                <div className="step-icon cale-icon">
                  <Icon
                    className="Icon"
                    xlinkHref={`${symbolsIcon}#date-calender`}
                  />
                </div>
              )}
          </div>
          <div className="py-heading--subtitle">Set Schedule</div>
          {!isViwer && (invoiceData.status == 'active' || invoiceData.status == 'draft') && <div className="step-btn-box">
            {editMode && <Button
              onClick={e => handleEditMode('step2')}
              className="me-2"
              color="primary" outline
              disabled={!isSchedule}>Cancel</Button>}
            {!isViwer && (isSchedule && !editMode) && invoiceData.status !== 'end' &&
            <>
              {
                invoiceData.invoiceCount > 0 ?
                  <UncontrolledTooltip
                    placement="top"
                    target="schedule-edit-button-with-invoice"
                  >
                    You can not edit schedule after one invoice has been created.
                  </UncontrolledTooltip>
                  : null
              }
              <div id={"schedule-edit-button-with-invoice"} >
                <Button
                  onClick={e => handleEditMode('step2')}
                  color={`primary`}
                  outline={isSchedule || editMode}
                  className={invoiceData.invoiceCount > 0 ? "disabled" : ''}
                  // disabled={!invoiceData.paid.isPaid || !invoiceData.sendMail.isSent}
                >
                  Edit
                </Button>
              </div>
            </>
            }
            {(!isSchedule || editMode) && !isViwer &&
              <Button
                onClick={e => scheduleRecurringInvoice('step2')}
                color="primary"
                outline={isSchedule || editMode}
                disabled={step2Load}>
                {step2Load ? <Spinner size="sm" color="default" /> : !isSchedule ? 'Next' : editMode ? 'Save' : 'Edit'}
              </Button>
            }
          </div>}
        </div>
      </div>
      {editMode || !isSchedule ?
        <div className="invoice-steps-card__content mt-3 ms-4 me-2 ps-5">
          <div className="">
            {/* <Card> */}
            <Form className="recurring__schedule__container">
              <FormGroup className="py-box py-box--card">
                <div className="py-box__header">
                  <div className="py-box__header-title">
                    Repeat this invoice
                    </div>
                </div>
                <div className="py-box--content">
                  <div className="schedule-settings-container__row__content">
                    <div className="py-select--native  py-form__element__small">
                      <SelectBox
                        getOptionLabel={(value) => (value['label'])}
                        getOptionValue={(value) => (value['value'])}
                        isOptionSelected={(value) => value["value"] === unit}
                        defaultValue={{label: _.capitalize(unit), value: unit}}
                        onChange={e => handleScheduler({ ...e, target: { ...e.target, name: 'unit', value: e.value } }, 'unit')}
                        placeholder="Select"
                        options={REAPAT_INVOICE}
                        clearable={false}
                      />
                    </div>


                    {unit === 'custom' &&
                      <Fragment>
                        <span className="py-text">every</span>
                        <div className="recurring__schedule__content-joined group-box">
                          <Input
                            value={interval}
                            className="py-form__element__xsmall"
                            onChange={e => handleScheduler(e, "interval")}
                          />
                          <div className="py-select--native py-form__element__small">
                            <SelectBox
                              getOptionLabel={(value)=>(value["label"])}
                              getOptionValue={(value)=>(value["value"])}
                              isOptionSelected={(value) => value["value"] === subUnit}
                              defaultValue={{label: _.capitalize(subUnit), value: subUnit}}
                              onChange={e => handleScheduler({ ...e, target: { ...e.target, name: 'subUnit', value: e.value } }, 'subUnit')}
                              placeholder="Select"
                              options={SUB_UNIT}
                              clearable={false}
                            />
                          </div>
                        </div>
                      </Fragment>
                    }
                    {/* {unit === 'custom' &&

                      } */}
                    {(unit === 'weekly' || subUnit === 'Week(s)') &&
                      <Fragment>
                        <span className="py-text">every</span>

                        <div className="py-select--native py-form__element__small">
                          <SelectBox
                            getOptionLabel={(value)=>(value["label"])}
                            getOptionValue={(value)=>(value["value"])}
                            isOptionSelected={(value) => value["value"] === dayOfWeek}
                            defaultValue={{label: _.capitalize(dayOfWeek), value: dayOfWeek}}
                            onChange={e => handleScheduler({ ...e, target: { ...e.target, name: 'dayOfWeek', value: e.value } }, 'dayOfWeek')}
                            placeholder="Select"
                            options={WEEKLY_LIST}
                            clearable={false}
                          />

                        </div>

                      </Fragment>
                    }
                    {(unit === 'yearly' || (unit === 'custom' && subUnit === 'Year(s)')) &&
                      <Fragment>
                        <span className="py-text">every</span>
                        <div className="py-select--native py-form__element__small">
                          <SelectBox
                            getOptionLabel={(value)=>(value["label"])}
                            getOptionValue={(value)=>(value["value"])}
                            isOptionSelected={(value) => value["value"] === monthOfYear}
                            defaultValue={{label: _.capitalize(monthOfYear), value: monthOfYear}}
                            onChange={e => handleScheduler({ ...e, target: { ...e.target, name: 'monthOfYear', value: e.value } }, 'monthOfYear')}
                            placeholder="Select"
                            options={MONTH_YEAR}
                            clearable={false}
                          />
                        </div>
                      </Fragment>
                    }
                    {(["monthly", "yearly"].includes(unit) || (unit === "custom" && ['Month(s)', 'Year(s)'].includes(subUnit))) &&
                      <Fragment>
                        <span className="py-text">on the every</span>

                        <div className="py-select--native py-form__element__small">
                          <SelectBox
                            getOptionLabel={(value)=>(value["label"])}
                            getOptionValue={(value)=>(value["value"])}
                            isOptionSelected={(value) => value["value"] === dayofMonth}
                            defaultValue={monthlyList[0]}
                            onChange={e => handleScheduler({ ...e, target: { ...e.target, name: 'dayofMonth', value: e.value } }, 'dayofMonth')}
                            placeholder="Select"
                            options={monthlyList}
                            clearable={false}
                          />
                        </div>
                        <span className="py-text">day of the month</span>
                      </Fragment>
                    }
                  </div>
                </div>

              </FormGroup>
              <div className="py-box py-box--card">
                <div className="py-box__header">
                  <div className="py-box__header-title">
                    Create first invoice on
                    </div>
                </div>
                <div className="py-box--content">
                  <div className="schedule-settings-container__row__content">
                    <div className="date-calender">
                      <DatepickerWrapper
                        minDate={_toDateConvert(_getStartOf(new Date(), unit))}
                        selected={_toDateConvert(startDate)}
                        onChange={date => handleScheduler(date, "startDate")}
                        className="form-control py-form__element__small"
                        popperPlacement="top-end"
                      />
                    </div>
                    <span className="py-text">and end</span>

                    <div className="recurring__schedule__content-joined">
                      <div className="py-select--native  py-form__element__small">
                        <SelectBox
                          getOptionLabel={(value)=>(value["label"])}
                          getOptionValue={(value)=>(value["value"])}
                          isOptionSelected={(value) => value["value"] === type}
                          defaultValue={{label: _.capitalize(type), value: type}}
                          onChange={e => handleScheduler({ ...e, target: { ...e.target, name: 'type', value: e.value } }, 'type')}
                          placeholder="Select"
                          options={INVOICE_END}
                          clearable={false}
                        />
                      </div>

                      {type === 'after' ?
                        <div className="d-flex align-items-center ms-2">
                          <Input
                            type='number'
                            value={maxInvoices}
                            onChange={e =>  handleScheduler(e, "maxInvoices")}
                            options={INVOICE_END}
                            onKeyDown={e => e.key === '-' && e.preventDefault()}
                            className="py-form__element__small"
                            clearable={false}
                          /><div class="py-text">invoices</div>
                        </div>
                        : type === 'on' &&

                        <div className="date-calender">
                          <DatepickerWrapper
                            minDate={_toDateConvert(startDate)}
                            selected={_toDateConvert(endDate)}
                            onChange={date => handleScheduler(date, "endDate")}
                            className="form-control py-form__element__small"
                          />
                        </div>

                      }
                    </div>

                  </div>

                </div>
                {/* end::settings */}
              </div>
              <div className="py-box py-box--card">
                <div className="py-box__header">
                  <div className="py-box__header-title">Choose a timezone</div>
                </div>
                <div className="py-box--content">
                  <div className="schedule-settings-container__row__content">
                    <SelectBox
                      getOptionLabel={(value)=>(value["label"])}
                      getOptionValue={(value)=>(value["value"])}
                      isOptionSelected={(value) => value["value"] === !!timezone && !!timezone.name && timezone.name}
                      defaultValue={defaultTimezone}
                      onChange={e => handleScheduler(e, "timezone")}
                      options={timeznList}
                      clearable={false}
                      className="py-form__element__medium"
                      placeholder="Select a time zone"
                    />
                    <div className="py-text">Time zone</div>
                  </div>
                  <div className="py-text--hint" >Set a time zone to ensure invoice delivery in the morning based on the recipient's time zone.</div>
                </div>
              </div>
            </Form>
            {/* </Card> */}
          </div>
        </div>
        :
        <div className="invoice-steps-card__content mt-3 ms-4 me-2 ps-5">
          <div className="pz-text-strong">
            <strong className="py-text--strong">Repeat {unit}:</strong> {showRepeatOn(invoiceData.recurrence)}
            <br />
            <strong className="py-text--strong">Dates:</strong> {showCreateDate(invoiceData.recurrence)}
            <br />
            <strong className="py-text--strong">Time zone:</strong> {!!timezone && timezone.name}
          </div>
        </div>}
    </div>

  )

}

const timeZoneList = (timezone= null) => {
  let listOfTimeZone = _getAllTimeZone()
  let defaultTimezone = null;
  const timeznList =  listOfTimeZone.map(item => {
    const option = {
      label: item,
      value: item
    }
    if(item === timezone?.name) {
      defaultTimezone = {
        ...option
      }
    }
    return option
  })
  return {defaultTimezone, timeznList}
}

const showRepeatOn = data => {
  switch (data.unit) {
    case 'daily':
      return 'Every day of the week'
    case 'weekly':
      return `Every ${data.dayOfWeek}`
    case 'monthly':
      return `On the ${data.dayofMonth < 2 || data.dayofMonth === "1" ? 'first' : data.dayofMonth} day of each month`
    case 'yearly':
      return `Every ${data.monthOfYear} on the ${data.dayofMonth < 2 || data.dayofMonth === "1" ? 'first' : data.dayofMonth} day of the month`
    case 'custom':
      if (data.subUnit =='Day(s)'){
        return `Every ${data.interval} ${data.subUnit}`
      }else{
        return `Every ${data.interval} ${data.subUnit} on the ${data.dayofMonth < 2 || data.dayofMonth === "1" ? 'first' : data.dayofMonth} day of the month`
      }

  }
}

const showCreateDate = data => {
  switch (data.type) {
    case 'after': return `Create first invoice on ${_displayDate(data.startDate, "MMMM DD, YYYY")}, end after ${data.maxInvoices} invoice`
    case 'on': return `Create first invoice on ${_displayDate(data.startDate, "MMMM DD, YYYY")}, end on ${_displayDate(data.endDate, "MMMM DD, YYYY")}`
    case 'never': return `Create first invoice on ${_displayDate(data.startDate, "MMMM DD, YYYY")}, and end never`
  }
}

export default RecurringStep2
