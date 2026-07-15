import React, { useState, useEffect } from 'react';
import { Col, Form, InputGroup, Row } from 'react-bootstrap';
import { Spinner, Button } from 'reactstrap';
import bankData from './banksData.json';

const ManualBank = (props) => {
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState({});
  const [bankFields, setBankFields] = useState(null);

  useEffect(() => {
      setBankFields(bankData[props.country] ? bankData[props.country].bankKeys : bankData["US"].bankKeys)
  }, [])

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      props.bankDetails(formData);
    }
    setValidated(true);
  };

  const handleInputChange = ({ target }) => {
    const { name, value } = target;
    setFormData({
      ...formData,
      [name]: value
    })
  }
  return (
    <React.Fragment>
      <div>
      <h6 className="mt-3 text-left">Select the account in which you want payout to be credited.</h6>
      <div className="mt-4 text-left">
        <Form noValidate validated={validated} onSubmit={handleSubmit} id="addOwnerForm">
          <Row>
            {bankFields && bankFields.map((fields, idx) => (<Form.Group as={Col} xs={12} controlId={fields.name}>
              <Form.Label className="is-required">{fields.placeholder}</Form.Label>
              <Form.Control
                required
                type="text"
                name={fields.name}
                placeholder={fields.placeholder}
                // maxLength={fields.maxLength}
                // minLength={fields.tminLengthype}
                defaultValue={''}
                onChange={(e) => handleInputChange(e)}
              />
              <Form.Control.Feedback type="invalid">This field is required</Form.Control.Feedback>
            </Form.Group>))}
            <div className="mx-n2 mt-4 d-flex">
              <div className="px-2">
                <Button type="submit" color="primary" >
                  Save and continue {props.loading && <Spinner size="sm" color="default" />}
                </Button>
              </div>
              <div className="px-2">
                <Button type="button" onClick={props.onCancel} color="primary" outline className="ms-2">Cancel</Button>
              </div>
            </div>
          </Row>
        </Form>
      </div>
      </div>
    </React.Fragment>
  );
}

export default ManualBank;