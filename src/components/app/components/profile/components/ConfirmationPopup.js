import React, { Component } from 'react'
import { Col, FormGroup, Label, Input, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { NavLink } from 'react-router-dom';

export default class ConfirmationPopup extends Component {
  render() {
    const { open, closeModal, confirmClose, id, handleText } = this.props;
    return (
      <div>
        <Modal isOpen={open} toggle={closeModal} className="modal-md modal-common" centered>
          <ModalHeader>Are you sure? This cannot be undone.</ModalHeader>
          <ModalBody>
            <Label for="password_com">Please enter your password to close account. </Label>
            <form>
              <FormGroup>
                  <Input type="text"
                    id="password_com"
                    name="password"
                    placeholder="Password"
                    size="sm"
                    onChange={(e) => handleText(e)} />
              </FormGroup>
            </form>
            {/* <= */}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={confirmClose}>Yes, I'm sure</Button>{' '}
            <NavLink to={`/app/accounts`} >
                <Button color="primary" outline onClick={closeModal}>No</Button>
            </NavLink>
          </ModalFooter>
        </Modal>
      </div>
    )
  }
}