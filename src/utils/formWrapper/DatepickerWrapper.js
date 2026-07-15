import React, { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import FormValidationError from '../../global/FormValidationError'

const DatepickerWrapper = (props) => {
  const { dateFormat, className, selected, value, onChange } = props

  const [selectedDate, setSelectedDate] = useState(value || selected)
  const [inputValue, setInputValue] = useState('') 
  const [error, setError] = useState('')

  useEffect(() => {
    if (value instanceof Date && !isNaN(value.getTime())) {
      setSelectedDate(value)
      setInputValue(formatDate(value))
      setError('')
    }
  }, [value])


  const formatDate = (date) => {
    return date ? date.toISOString().split('T')[0] : ''
  }

  const handleDateChange = (date) => {
    if (!date || (date instanceof Date && !isNaN(date.getTime()))) {
      setSelectedDate(date)
      setInputValue(formatDate(date))
      setError('') 
      onChange(date)
    } else {
      setError('Invalid date format')
      setSelectedDate(null)
      setInputValue('') 
      onChange(null)
    }
  }

  const handleInputChange = (e) => {
    const inputVal = e.target.value
    const inputValue = e.target.value
    if (inputVal === "" || /^[\d-]+$/.test(inputVal)) {
      const parsedDate = new Date(inputVal)
      const isValid = parsedDate instanceof Date && !isNaN(parsedDate.getTime())
      if (isValid) {
        setInputValue(parsedDate)
      }
    } else {
      e.preventDefault();
    }

  }

  return (
    <div>
      <DatePicker
        {...props}
        selected={selectedDate}
        onChange={handleDateChange}
        onChangeRaw={handleInputChange}
        onSelect={(date) => {
          setSelectedDate(date)
          setInputValue(formatDate(date)) // Update input field
          setError('')
          onChange(date)
        }}
        className={`${className || 'form-control'} ${
          error ? 'is-invalid' : ''
        }`}
        dateFormat={dateFormat || 'yyyy-MM-dd'}
        showYearDropdown
        showMonthDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={50}
        placeholderText="YYYY-MM-DD"
        dropdownMode="select"
        placeholderText="YYYY-MM-DD"
        autoComplete="off"
      />
      {error && <FormValidationError message={error} showError />}
    </div>
  )
}

export default DatepickerWrapper
