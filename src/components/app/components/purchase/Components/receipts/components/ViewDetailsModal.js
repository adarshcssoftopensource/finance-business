import React, { Component } from 'react';
import { Button, Form, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import { toMoney } from '../../../../../../../utils/GlobalFunctions';
import taxServices from '../../../../../../../api/TaxServices';
import { dateRender } from '../constants/listConstants';
import { truncate } from 'lodash';

export default class ViewDetailsModal extends Component {
  state = {
    taxes: [],
  };

  componentDidMount() {
    this.fetchTaxes();
  }

  async fetchTaxes() {
    const response = (await taxServices.fetchTaxes())?.data?.taxes || [];
    response.forEach(row => {
      row.id = row._id;
      delete row._id;
    });
    this.setState({ taxes: response })
  }

  renderMedia() {
    const { data: { fileUrl, previewUrl, source } = {} } = this.props;

    return (
      <div className="preview-section">
        <a target="_blank" href={fileUrl} className="media-wrapper py-text--link">
          <img src={previewUrl} alt="receipt preview" className="media" />
          <span className="original-button">View original receipt</span>
        </a>
        <span className="source">Source: {source}</span>
      </div>
    );
  }

  renderAmount(taxId) {
    const { data: { amountBreakup: { taxes = [] } = {} } = {} } = this.props;
    const row = taxes.find(r => r.id === taxId);
    if (!row) {
      return null;
    }

    return toMoney(row.amount || 0);
  }

  renderTaxes() {
    if (!this.state.taxes.length) {
      return null;
    }

    return this.state.taxes.map((tax) => (
      this.renderAmount(tax.id) && (
        <React.Fragment key={tax.id}>
          <div className="py-form-field py-form-field--inline align-items-center">
            <Label className="py-form-field__label">
              Tax
            </Label>
            <div className="py-form-field__element">
              <div className="checkbox-custom me-2">
                <Label>
                  {truncate(tax.abbreviation, { 'length': 35, 'separator': '...' })}
                </Label>
              </div>
              <div className="values">
                <Label>
                  {this.renderAmount(tax.id)}
                </Label>
              </div>
            </div>
          </div>
        </React.Fragment>
      )
    ));
  }

  renderInformation() {
    const { data: { merchant, receiptDate, notes, subTotal, currency = {}, totalAmount, amountBreakup = {} } = {} } = this.props;
    return (
      <Form className="py-form-field--condensed" onSubmit={e => e.preventDefault()}>
        <div className="py-form-field py-form-field--inline align-items-center">
          <Label className="py-form-field__label">
            Merchant
          </Label>
          <div className="py-form-field__element">
            {merchant}
          </div>
        </div>
        <div className="py-form-field py-form-field--inline align-items-center">
          <Label className="py-form-field__label">
            Date
          </Label>
          <div className="py-form-field__element">
            {dateRender(null, { receiptDate })}
          </div>
        </div>
        <div className="py-form-field py-form-field--inline align-items-center">
          <Label className="py-form-field__label">
            Notes
          </Label>
          <div className="py-form-field__element">
            {notes}
          </div>
        </div>
        <div className="py-form-field py-form-field--inline align-items-center">
          <Label className="py-form-field__label">
            Subtotal
          </Label>
          <div className="py-form-field__element">
            {toMoney(amountBreakup.subTotal || 0)}
          </div>
        </div>
        <div className="py-form-field py-form-field--inline align-items-center">
          <Label className="py-form-field__label">
            Currency
          </Label>
          <div className="py-form-field__element">
            {currency ? currency.displayName : ''}
          </div>
        </div>
        <div className="py-form-field py-form-field--inline align-items-center">
          <Label className="py-form-field__label">
            Total
          </Label>
          <div className="py-form-field__element">
            {toMoney(totalAmount || 0)}
          </div>
        </div>
        {this.renderTaxes()}
      </Form>
    );
  }

  render() {
    const { onClose, data } = this.props;
    return (
      <Modal centered isOpen={!!data} className="modal-common receipt-details">
        <ModalHeader toggle={onClose}>
          Receipt details
        </ModalHeader>
        <ModalBody>
          <div className="receipt-container">
            {this.renderMedia()}
            <div className="information-section">
              {this.renderInformation()}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" outline onClick={onClose} >Close</Button>
        </ModalFooter>
      </Modal>
    )
  }
}
