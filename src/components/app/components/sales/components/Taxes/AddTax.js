import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  Button,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap'
import { openGlobalSnackbar } from '../../../../../../actions/snackBarAction'
import taxServices from '../../../../../../api/TaxServices'
import { Spinner } from 'reactstrap'
import FormValidationError from '../../../../../../global/FormValidationError'
import { handleAclPermissions } from '../../../../../../utils/GlobalFunctions'
const taxPayload = {
  name: '',
  userId: localStorage.getItem('user.id'),
  businessId: localStorage.getItem('businessId'),
  abbreviation: '',
  rate: '',
  description: '',
  taxNumber: '',
  other: {
    showTaxNumber: false,
    isRecoverable: false,
    isCompound: false,
  },
}

class AddTax extends Component {
  state = {
    modal: false,
    disabled: '',
    addTax: taxPayload,
    loading: false,
  }

  handelTextChange = (e) => {
    const { name, value } = e.target
    let updateTax = this.state.addTax
    const otherArray = ['showTaxNumber', 'isRecoverable', 'isCompound']
    if (otherArray.includes(name)) {
      updateTax.other[name] = !updateTax.other[name]
      this.setState({ addTax: updateTax })
    } else {
      if (name === 'rate') {
        if (
          (e.which != 8 && e.which != 0 && e.which < 48) ||
          e.which > 57 ||
          value < 0
        ) {
          e.preventDefault()
        } else {
          this.setState({
            addTax: { ...updateTax, [name]: value },
          })
        }
      } else {
        this.setState({
          addTax: { ...updateTax, [name]: value },
        })
      }
    }
    // this.setDisable()
  }

  setDisable = () => {
    let addTax = this.state.addTax
    let disabled = ''
    if (
      addTax.name === '' ||
      addTax.abbreviation === '' ||
      addTax.rate === '' ||
      (addTax.other.showTaxNumber && addTax.taxNumber)
    ) {
      disabled = 'This field is required.'
    }
    if (addTax.other.showTaxNumber) {
      if (!addTax.taxNumber) {
        disabled = 'This field is required.'
      } else {
        disabled = ''
      }
    }
    this.setState({ disabled })
    return disabled !== ''
  }

  submitTax = async (event) => {
    let disable = this.setDisable()
    if (disable) {
      return false
    }
    let taxInput = { ...this.state.addTax }
    if (!taxInput.userId) {
      taxInput.userId = localStorage.getItem('user.id')
    }

    if (!taxInput.businessId) {
      taxInput.businessId = localStorage.getItem('businessId')
    }
    try {
      this.setState({
        loading: true,
      })
      delete taxInput.businessId
      const response = await taxServices.addTax({ taxInput })
      this.setState({
        loading: false,
      })
      if (response.statusCode === 201) {
        let result = response.data.tax
        let selectedOption = {
          value: result._id,
          label: `${result.abbreviation} ${result.rate}%`,
        }
        this.props.onAddTax(event, selectedOption)
        this.setState({
          addTax: taxPayload,
        })
        this.props.showSnakebar(response.message, false)
      }
    } catch (error) {
      this.props.showSnakebar(error.message, true)
      this.setState({
        loading: false,
      })
    }
  }
  _handleKeypress = (e) => {
    const invalidKey = [69, 107, 109, 189]
    if (invalidKey.includes(e.keyCode)) {
      e.preventDefault()
    }
  }

  render() {
    const { openAddTax, onClose } = this.props
    const { disabled, addTax, loading } = this.state
    const { name, abbreviation, rate, description, taxNumber, other } = addTax
    return (
      <Modal
        isOpen={openAddTax}
        toggle={onClose}
        className="modal-Select a tax/vat-modal"
      >
        <ModalHeader toggle={onClose}>Select a tax/vat</ModalHeader>
        <ModalBody>
          <Form className="py-form-field--condensed">
            <div className="py-form-field py-form-field--inline">
              <Label
                htmlFor="exampleEmail"
                className="py-form-field__label is-required"
              >
                Tax name
              </Label>
              <div className="py-form-field__element">
                <Input
                  className={
                    !!disabled && !name.trim()
                      ? 'has-errors'
                      : 'py-form__element__large'
                  }
                  required
                  type="text"
                  name="name"
                  value={name}
                  onChange={this.handelTextChange}
                />
                <FormValidationError showError={disabled && !name.trim()} />
              </div>
            </div>

            <div className="py-form-field py-form-field--inline">
              <Label
                htmlFor="exampleEmail"
                className="py-form-field__label is-required"
              >
                Abbreviation
              </Label>
              <div className="py-form-field__element">
                <Input
                  required
                  className={
                    !!disabled && !abbreviation.trim()
                      ? 'has-errors'
                      : 'py-form__element__large'
                  }
                  type="text"
                  name="abbreviation"
                  value={abbreviation}
                  onChange={this.handelTextChange}
                  maxLength={10}
                />
                <FormValidationError
                  showError={disabled && !abbreviation.trim()}
                />
              </div>
            </div>
            <div className="py-form-field py-form-field--inline">
              <Label
                htmlFor="exampleEmail"
                className="py-form-field__label is-required"
              >
                Tax rate (%)
              </Label>
              <div className="py-form-field__element">
                <Input
                  required
                  className={
                    !!disabled && !rate
                      ? 'has-errors'
                      : 'py-form__element__large'
                  }
                  type="number"
                  step="any"
                  name="rate"
                  value={rate}
                  onChange={this.handelTextChange}
                  onKeyDown={this._handleKeypress}
                />
                <div className="py-form-field__hint !grid">
                  Tax rate should be a number only, without a percent sign.
                </div>
                <FormValidationError showError={disabled && !rate} />
              </div>
            </div>
            <div className="py-form-field py-form-field--inline">
              <Label htmlFor="exampleEmail" className="py-form-field__label">
                {' '}
                Description
              </Label>
              <div className="py-form-field__element">
                <Input
                  type="text"
                  name="description"
                  className="py-form__element__large"
                  value={description}
                  onChange={this.handelTextChange}
                />
              </div>
            </div>
            <div className="py-form-field py-form-field--inline">
              <Label htmlFor="exampleEmail" className="py-form-field__label">
                Tax number
              </Label>
              <div className="py-form-field__element">
                {/* <Input
                  type="text"
                  required={other.showTaxNumber}
                  name="taxNumber"
                  className="py-form__element__large"
                  value={taxNumber}
                  onChange={this.handelTextChange}
                /> */}
                <Input
                  type="number"
                  required={other.showTaxNumber}
                  name="taxNumber"
                  className="py-form__element__large"
                  value={taxNumber}
                  onChange={this.handelTextChange}
                />

                <FormValidationError
                  showError={disabled && other.showTaxNumber && !taxNumber}
                />
              </div>
            </div>

            <div className="py-form-field py-form-field--inline">
              <div
                htmlFor="exampleEmail"
                className="py-form-field__label"
              ></div>
              <div className="py-form-field__element">
                <label className="py-checkbox">
                  <Input
                    type="checkbox"
                    name={'showTaxNumber'}
                    value={other.showTaxNumber}
                    checked={other.showTaxNumber}
                    onChange={this.handelTextChange}
                  />
                  <span className="py-form__element__faux"></span>
                  <span className="py-form__element__label">
                    Show Tax number on Invoices
                  </span>
                </label>
              </div>
            </div>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" outline onClick={onClose}>
            Cancel
          </Button>
          <Button
            // type='submit'
            disabled={handleAclPermissions(['Viewer']) || loading}
            onClick={this.submitTax}
            color="primary"
          >
            {loading ? <Spinner size="sm" color="light" /> : 'Add a tax'}
          </Button>{' '}
        </ModalFooter>
      </Modal>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    showSnakebar: (message, error) => {
      dispatch(openGlobalSnackbar(message, error))
    },
  }
}

export default withRouter(connect(null, mapDispatchToProps)(AddTax))
