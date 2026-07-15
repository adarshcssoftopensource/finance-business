import React, { PureComponent } from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Form, Input, Label, Spinner } from 'reactstrap';
import { _isValidEmail } from '../GlobalFunctions';
import profileServices from '../../api/profileService';
import FormValidationError from '../../global/FormValidationError';


export class AddNewEmail extends PureComponent {
  state = {
    email: '',
    loading: false,
    btnLoad: false,
    emailError: false,
    emailInvalid: false
  };

  close = () => {
    this.setState({ email: '', loading: false });
    this.props.onClose();
  };

  handleInputChange = (email) => {
    this.setState({ email, emailError: false, emailInvalid: false });
  };

  save = async (e) => {
    if (e) {
      e.preventDefault();
    }
    if (!this.state.email) {
      this.setState({ emailError: true })
    } else if (!_isValidEmail(this.state.email)) {
      this.setState({ emailInvalid: true })
    } else {
      this.setState({ btnLoad: true })
      const payload = { emailProfileInput: { email: this.state.email, provider: 'local' } };
      try {
        const { statusCode, message } = await profileServices.addConnectedEmail(this.props.userId, payload);
        if (statusCode === 200 || statusCode === 201) {
          this.setState({ btnLoad: false })
          this.props.openGlobalSnackbar(message, false)
          this.props.callback();
        } else {
          this.setState({ btnLoad: false })
          this.props.openGlobalSnackbar(message, true)
        }
      } catch (err) {
        this.setState({ btnLoad: false })
        this.props.openGlobalSnackbar(err.message, true)
      }

      this.close();
    }

  };

  render() {
    const { openModal } = this.props;
    return (
      <Modal isOpen={openModal} toggle={this.close} id="addEmailModal" className="modal-add modal-confirm" centered>
        <ModalHeader toggle={this.close}>Add Another Email Address</ModalHeader>
        <Form onSubmit={this.save}>
          <ModalBody>
            <Label className="py-form-field__label is-required">New Email Address</Label>
            <Input
              type="text"
              className="form-control"
              onChange={e => this.handleInputChange(e.target.value)}
            />
            <FormValidationError showError={this.state.emailError} />
            <FormValidationError showError={this.state.emailInvalid} message="Valid email is required" />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" outline onClick={this.close}>Cancel</Button>
            <Button color="primary" className="ms-2" disabled={this.state.btnLoad}>
              {this.state.btnLoad ? <Spinner size={'sm'} /> : 'Add email address'}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    );
  }
}
