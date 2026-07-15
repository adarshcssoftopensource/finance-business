import React, { Component } from 'react'
import {
    Col,
    Button,
    Form,
    FormGroup,
    Input,
    FormText,
  } from "reactstrap";
import classnames from 'classnames';
import { find, orderBy, uniqBy, cloneDeep } from 'lodash';
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import CountryCodeList from "../../../../../data/country-code.json";
import FormValidationError from '../../../../../global/FormValidationError';
export default class ContactForm extends Component {
    constructor(props) {
        super(props)
        this.state = {
            country:null
        }
    }
    componentDidMount() {
        const selectedCountry = CountryCodeList.find(val => val.name === this.props.businessInfo.country.name);
        this.setState({
            country: selectedCountry || null
        })
    }
  render() {
    const {customerModel, errors} = this.props
    const {country} = this.state
    return (
      <div>
        <Form className="py-form-field--condensed">
            <FormGroup row>                              
                <Col xs={5} className="text-right pe-0" >
                    <label className="mt-3 pe-0 is-required">Customer</label>
                </Col>             
                <Col xs={6}>
                <Input
                    type="text"
                    value={this.props.customerModel.customerName}
                    name="customerName"
                    className={"feild-height"}
                    onChange={this.props.handleText}
                />
                <FormValidationError
                    showError={Boolean(errors.customerName)}
                    message={errors.customerName}
                />
                </Col>
            </FormGroup>
            <FormGroup row>
                <label className="col-md-5 pe-0 mt-3 text-right is-required">Email </label>
                <Col xs={6}>
                <Input
                    type="email"
                    // value={''}
                    value={this.props.customerModel.email}
                    name="email"
                    onChange={this.props.handleText}
                    className="feild-height"
                />
                <FormValidationError
                    showError={Boolean(errors.email)}
                    message={errors.email}
                />
                </Col>
            </FormGroup>
            <FormGroup row>
                <label className="col-md-5 pe-0 mt-3 text-right">Phone</label>
                <Col xs={6}>
                <PhoneInput
                  disableSearchIcon	
                  name="phone"
                  countryCodeEditable={false}
                  value={customerModel.communication.phone?
                            customerModel.communication.phone.includes("+") 
                            ? customerModel.communication.phone 
                            : `+${country && country.phoneCode}${customerModel.communication.phone}`
                        :`+${country && country.phoneCode}${customerModel.communication.phone}`
                        }
                  enableSearch
                  id="contact_phone"
                  inputClass="feild-height w-100"
                  containerClass="custom-select-div"
                  onChange={this.props.handlePhone}
                />
                </Col>
            </FormGroup>
            <FormGroup row>
                <label className="col-md-5 pe-0 mt-3 text-right is-required">First name </label>
                <Col xs={6}>
                <Input
                    type="text"
                    value={this.props.customerModel.firstName}
                    // value={''}
                    name="firstName"
                    // placeholder="First Name"
                    onChange={this.props.handleText}
                    className="feild-height input-placeholder"
                />
                <FormValidationError
                    showError={Boolean(errors.firstName)}
                    message={errors.firstName}
                />
                </Col>
            </FormGroup>
            <FormGroup row>
                <label className="col-md-5 pe-0 mt-3 text-right is-required">Last name </label>
                <Col xs={6}>
                <Input
                    type="text"
                    // value={''}
                    name="lastName"
                    value={this.props.customerModel.lastName}
                    // placeholder="Last Name"
                    onChange={this.props.handleText}
                    className="feild-height input-placeholder"
                />
                <FormValidationError
                    showError={Boolean(errors.lastName)}
                    message={errors.lastName}
                />
                </Col>
            </FormGroup>
        </Form>
      </div>
    )
  }
}
