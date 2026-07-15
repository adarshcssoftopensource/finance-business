import React, { Component } from 'react'
import { Col, Container, Row, Form, FormGroup, Label, Input } from 'reactstrap'
import {
  GoogleReCaptchaProvider,
  withGoogleReCaptcha,
} from 'react-google-recaptcha-v3'

import * as BusinessAction from '../../../../../actions/businessAction'
import { openGlobalSnackbar } from '../../../../../actions/snackBarAction'
import profileServices from '../../../../../api/profileService'
import LoginService from '../../../../../api/LoginService'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter, NavLink } from 'react-router-dom'
import ConfirmationPopup from './ConfirmationPopup'
import SelectBox from '../../../../../utils/formWrapper/SelectBox'
import FormValidationError from '../../../../../global/FormValidationError'
import { getLogoURL } from '../../../../../utils/GlobalFunctions'
class CloseUserAccount extends Component {
  state = {
    reason: '',
    details: '',
    open: false,
    password: '',
  }

  componentDidMount() {
    this.fetchBusiness()
  }

  fetchBusiness = async () => {
    await this.props.actions.fetchBusiness()
  }

  handleSelect = (e) => {
    const { name, value } = e.target
    this.setState({ [name]: value })
  }

  handleFormSubmission = async (e) => {
    e.preventDefault()
    this.setState({ open: true })
  }

  closeModal = (e) => {
    this.setState({ open: false })
  }

  handleText = (e) => {
    this.setState({ password: e.target.value })
  }

  confirmClose = async (e) => {
    let id = localStorage.getItem('user.id'),
      email = localStorage.getItem('user.email'),
      password = this.state.password
    const { executeRecaptcha } = this.props.googleReCaptchaProps
    if (!executeRecaptcha) {
      console.log('Recaptcha has not been loaded')
      return
    }
    const captchaToken = await executeRecaptcha('login')
    if (!!password && captchaToken) {
      try {
        let auth = await LoginService.authenticate({
          email,
          password,
          reCaptchaToken: captchaToken,
          deleteUser: true,
        })
        if (auth.statusCode === 200) {
          try {
            await profileServices.deletePass(id)
            const basicAuthToken = localStorage.getItem('basicAuthToken')
            localStorage.clear()
            localStorage.setItem('basicAuthToken', basicAuthToken)
            this.props.history.push('/')
          } catch (err) {
            this.props.openGlobalSnackbar(
              'Something went wrong, please try again later.',
              true,
            )
          }
        }
      } catch (err) {
        this.props.openGlobalSnackbar(
          'Something went wrong, please try again later.',
          true,
        )
      }
    } else {
      if (!captchaToken)
        this.props.openGlobalSnackbar('Verification failed', true)
      else this.props.openGlobalSnackbar('Please enter password.', true)
    }
  }

  render() {
    const { business, params, businessInfo } = this.props
    const { open } = this.state
    let id = localStorage.getItem('businessId')
    return (
      <div className="bg-white">
        <div className="container py-4">
          <header className="AccountTerminate__Header mb-5 text-center">
            <div className="mb-3">
              {/* <img src="https://storage.googleapis.com/finance_storage_bucket/static/payyit/icon-logo.png" width="80" /> <span className="logo_heading">Payyit</span> */}
              <img src={getLogoURL()} width="130" />
            </div>

            <h1 className="py-heading--title">Close Your Finance Account</h1>
          </header>
          <p className="py-text--strong">
            Are you sure you want to permanently close all of your businesses in
            finance?
          </p>
          <p>
            We’re sorry to see you go. Please note that the action you’re about
            to take will
            <a className="text-danger" href="javascript: void(0)">
              {' '}
              permanently close all of the following business and personal
              finance accounts:
            </a>
          </p>
          <ul>
            {!!business ? (
              business.length > 0 ? (
                business.map((item, i) => {
                  return <li key={i}>{item.organizationName}</li>
                })
              ) : (
                <li>No Business..</li>
              )
            ) : (
              <li>No Business..</li>
            )}
          </ul>
          <p>
            <b>Closing your account is permanent, and cannot be reversed.</b> If
            you are looking to archive any of your businesses, you can archive
            it here{' '}
            <NavLink className="py-text--link" to={`/app/accounts/business`}>
              going to this link.
            </NavLink>
          </p>
          <Form onSubmit={this.handleFormSubmission.bind(this)}>
            <FormGroup>
              <Label
                for="companyName"
                className="py-form-field__label is-required"
              >
                Reason for leaving
              </Label>
              <div className="py-form-field">
                <div className="py-select--native py-form__element__large">
                  <SelectBox
                    getOptionLabel={(value) => value['label']}
                    getOptionValue={(value) => value['value']}
                    placeholder="Select"
                    name="businessType"
                    value={this.state.reason}
                    name="reason"
                    onChange={(e) =>
                      this.handleSelect({
                        target: { value: e, name: 'reason' },
                      })
                    }
                    options={[
                      { value: 'Missing Features', label: 'Missing Features' },
                      { value: 'Customer Support', label: 'Customer Support' },
                      {
                        value: 'My Business Is Closing',
                        label: 'My Business Is Closing',
                      },
                      {
                        value: 'Cost of Payroll or Payments',
                        label: 'Cost of Payroll or Payments',
                      },
                      {
                        value: 'I don not understand how to use Payyit',
                        label: 'I don not understand how to use Finance',
                      },
                      { value: 'Other', label: 'Other' },
                    ]}
                    clearable={false}
                  />
                  {/* <FormValidationError showError={errors.btypeErr} /> */}
                  {/* <select
                                        name="country"
                                        className="form-control py-form__element"
                                        // value={'userInput.address'.country.id}
                                        onChange={(e) => handleText(e)}
                                    >
                                        <option value={"Missing Features"}>
                                            {"Missing Features"}
                                        </option>
                                        <option value={"Customer Support"}>
                                            {"Customer Support"}
                                        </option><option value={"My Business Is Closing"}>
                                            {"My Business Is Closing"}
                                        </option><option value={"Cost of Payroll or Payments"}>
                                            {"Cost of Payroll or Payments"}
                                        </option><option value={"I don't understand how to use Payyit"}>
                                            {"I don't understand how to use Payyit"}
                                        </option><option value={"Other"}>
                                            {"Other"}
                                        </option>
                                    </select> */}
                </div>
              </div>
            </FormGroup>
            <FormGroup>
              <Label for="details" className="py-form-field__label">
                Details{' '}
              </Label>
              <div className="py-form-field__element">
                <textarea
                  name="details"
                  rows="5"
                  className="form-control py-form__element__large"
                  onChange={this.handleText.bind(this)}
                />
              </div>
            </FormGroup>
            <FormGroup row>
              <Col xs={12} sm={8} md={8} lg={8}>
                <button type="submit" className="btn btn-danger me-2">
                  Permanently close all businesses
                </button>
                <NavLink to={`/app/accounts`} className="py-text--link ms-2">
                  Cancel
                </NavLink>
              </Col>
            </FormGroup>
          </Form>
          <ConfirmationPopup
            open={open}
            closeModal={this.closeModal.bind(this)}
            confirmClose={this.confirmClose.bind(this)}
            id={id}
            handleText={this.handleText.bind(this)}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    business: state.businessReducer.business,
    businessInfo: state.businessReducer.selectedBusiness,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(BusinessAction, dispatch),
    openGlobalSnackbar: bindActionCreators(openGlobalSnackbar, dispatch),
  }
}

const CloseUserAccountForm = withRouter(
  withGoogleReCaptcha(
    connect(mapStateToProps, mapDispatchToProps)(CloseUserAccount),
  ),
)

export default () => {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.REACT_APP_RECAPTCHA_CLIENT_KEY}
    >
      <CloseUserAccountForm />
    </GoogleReCaptchaProvider>
  )
}
