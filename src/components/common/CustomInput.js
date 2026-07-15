import React, { Component } from 'react'
import { Label, Input } from 'reactstrap'
import FormValidationError from '../../global/FormValidationError'
export default class CustomInput extends Component {
    render() {
        const { label, type = 'text', name, id, required = false, disabled = false, value = '', onChange, autoFocus = true, req = false,
        isError=false,message } = this.props
        return (
            <div className="py-form-field py-form-field--inline">
                {
                    !!label && (
                        <Label htmlFor={id} className={`py-form-field__label___noWidth ${(req||required) ? 'is-required' : '' }`}>{label}</Label>
                    )
                }
                <div className="py-form-field__element">
                    <Input type={type}
                        value={value}
                        name={name}
                        id={id}
                        // required={required}
                        disabled={disabled}
                        onChange={onChange}
                        autoFocus={autoFocus}
                        {...this.props}
                    />
                    <FormValidationError
                        showError={isError}
                        message={message}
                    />
                </div>
            </div>
        )
    }
}
