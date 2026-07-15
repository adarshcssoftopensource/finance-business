import React from 'react'
import moment from 'moment'
import { Label, UncontrolledTooltip } from 'reactstrap'
import DatepickerWrapper from '../../../../../utils/formWrapper/DatepickerWrapper'
import SelectBox from '../../../../../utils/formWrapper/SelectBox'
import { _toDateConvert } from '../../../../../utils/globalMomentDateFunc'

const rangeList = [
  {
    label: new Date().getFullYear(),
    value: {
      startDate: moment(new Date()).startOf('year').toDate(),
      endDate: moment(new Date()).endOf('year').toDate(),
    }
  },
  {
    label: new Date().getFullYear() - 1,
    value: {
      startDate: moment(moment().subtract(1, 'year')).startOf('year').toDate(),
      endDate: moment(moment().subtract(1, 'year')).endOf('year').toDate(),
    }
  },
  {
    label: new Date().getFullYear() - 2,
    value: {
      startDate: moment(moment().subtract(2, 'year')).startOf('year').toDate(),
      endDate: moment(moment().subtract(2, 'year')).endOf('year').toDate(),
    }
  },
  {
    label: 'This Week',
    value: {
      startDate: moment(new Date()).startOf('isoWeek').toDate(),
      endDate: moment(new Date()).endOf('isoWeek').toDate(),
    }
  },
  {
    label: 'Last Week',
    value: {
      startDate: moment(moment().subtract(1, 'week')).startOf('isoWeek').toDate(),
      endDate: moment(moment().subtract(1, 'week')).endOf('isoWeek').toDate(),
    }
  },
  {
    label: 'This Month',
    value: {
      startDate: moment(new Date()).startOf('month').toDate(),
      endDate: moment(new Date()).endOf('day').toDate(),
    }
  },
  {
    label: 'Last Month',
    value: {
      startDate: moment(moment().subtract(1, 'month')).startOf('month').toDate(),
      endDate: moment(moment().subtract(1, 'month')).endOf('month').toDate(),
    }
  },
  {
    label: 'Last 4 Weeks',
    value: {
      startDate: moment(moment().subtract(4, 'week')).startOf('isoWeek').toDate(),
      endDate: moment(moment().subtract(1, 'week')).endOf('isoWeek').toDate(),
    }
  },
  {
    label: 'Last 60 Days',
    value: {
      startDate: moment(moment().subtract(60, 'day')).startOf('day').toDate(),
      endDate: moment(moment().subtract(0, 'day')).endOf('day').toDate(),
    }
  },
  {
    label: 'Last 90 Days',
    value: {
      startDate: moment(moment().subtract(90, 'day')).startOf('day').toDate(),
      endDate: moment(moment().subtract(0, 'day')).endOf('day').toDate(),
    }
  },
];

const Filter = ({ startDate, endDate, showCustom, customDate, handleDateChange, resetFilters }) => {
  const fromDateKey = startDate ? moment(startDate).format('YYYY-MM-DD') : 'empty-start';
  const toDateKey = endDate ? moment(endDate).format('YYYY-MM-DD') : 'empty-end';
  return (
    <div className="py-box py-box--large customer-statements--filter__container">
      <div className="py-box--content">
        {showCustom &&
          <div className="customer-statements--filter__content">
            <div className="py-form-field py-form-field--inline">
              <Label for="date-range" className="is-required mt-2 w-25">Date Range</Label>
              <div className="py-form-field">
                <SelectBox
                  id='date-range'
                  getOptionLabel={(value) => (value["label"])}
                  getOptionValue={(value) => (value["value"])}
                  placeholder="Select Date Range"
                  value={customDate}
                  onChange={date => handleDateChange(date, 'custom')}
                  options={rangeList}
                  isClearable
                />
              </div>
            </div>
          </div>
        }
        <div className="customer-statements--filter__range">
          {/* {startDate && */}
            <div className="d-flex align-items-center me-3">
              <Label for="from" className="me-3 is-required">From</Label>
              <DatepickerWrapper
                key={`from-${fromDateKey}`}
                className="form-control"
                strictParsing
                popperPlacement="top-end"
                openToDate={startDate ? _toDateConvert(startDate) : ""}
                id="from"
                maxDate={endDate ? _toDateConvert(endDate) : new Date()}
                selected={startDate ? _toDateConvert(startDate) : ''}
                onChange={date => handleDateChange(date, 'startDate')}
              />
            </div>
          {/* } */}
          <div className="d-flex align-items-center">
            <Label for="to" className="me-3 is-required">{!startDate && endDate ? 'As of' : 'To'}</Label>
            <DatepickerWrapper
              key={`to-${toDateKey}`}  // Force re-render when date changes
              className="form-control"
              strictParsing
              popperPlacement="top-end"
              id="to"
              minDate={startDate ? _toDateConvert(startDate) : ''}
              selected={endDate ? _toDateConvert(endDate) : ''}
              openToDate={endDate ? _toDateConvert(endDate) : ""}
              onChange={date => handleDateChange(date, 'endDate')}
            />
          </div>
          <a className="fillter__action__btn" href="javascript:void(0)" id="reset" onClick={resetFilters}>
                <span className='fa fa-refresh'></span>
            </a>
            <UncontrolledTooltip placement="top" target="reset">
                <span>Reset Filters</span>
            </UncontrolledTooltip>
        </div>
      </div>
    </div>
  )
}

export default Filter