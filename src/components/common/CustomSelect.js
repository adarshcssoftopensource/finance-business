import React, { Component } from 'react'
import { Label, Input } from 'reactstrap'
import SelectBox from '../../utils/formWrapper/SelectBox'
import FormValidationError from '../../global/FormValidationError'
export default class CustomSelect extends Component {
    render() {
        const { label, name, id, required = false, disabled = false, value = '', className = '',
            onChange, options, req = false, isError = false, message, placeholder =  "Select a position"} = this.props
        return (
            <div className={`py-form-field py-form-field--inline ${className}`}>
                {
                    !!label && (

                        <Label
                            for="state"
                            className={`py-form-field__label___noWidth ${(req||required) ? 'is-required' : '' }`}
                        >{label}</Label>
                    )
                }
                <div className="py-form-field__element">
                    <div className="py-select--native">
                        <SelectBox
                            value={value}
                            getOptionLabel={(value)=>(value["name"])}
                            getOptionValue={(value)=>(value["value"])}
                            onChange={e => onChange({ ...e, target: { ...e.target, name: name, value: e.value } })}
                            placeholder={placeholder}
                            options={options}
                            clearable={false}
                            // required={required}
                            isDisabled={disabled}
                            id={id}
                        />
                        <FormValidationError
                            showError={isError}
                            message={message}
                        />
                    </div>
                </div>
            </div>
        )
    }
}
