import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { Spinner, Button } from 'reactstrap';
import { terms } from "../../../../../../../../utils/GlobalFunctions";

//import child component
import { requiredMsg } from '../../data';
import CardStatement from './cardStatement';

const Index = (props) => {
    const [validated, setValidated] = useState(false);
    const [businessName, setBusinessName] = useState('');
    const [accepted, setAccepted] = useState(false)
    const { loading } = props;

    useEffect(() => {

        if (props.data && props.data.statement && props.data.statement.displayName) {
            setBusinessName(props.data.statement.displayName)
        } else if (props.selectedBusiness) {
            setBusinessName(props.selectedBusiness.organizationName)
        }
    }, []);

    const handleSubmit = async (event) => {
        const form = event.currentTarget;
        event.preventDefault();
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            try {
                const data = {
                    step: 5,
                    statement: {
                        displayName: businessName.toUpperCase().slice(0, 19)
                    }
                }
                props.onSubmit(data);

            } catch (error) { }
        }
        setValidated(true);
    };
    return (
        <div className="onboarding__business__details">
            <header className="py-header py-header--page mb-0">
                <div className="py-header--title">
                    <div className="mb-3 h3">Customize your customer's statement</div>
                    <div className="py-text">
                        When customers pay you, your business name appears on their statements.
                        Customize your name so they can instantly recognize your brand.
                    </div>
                </div>
            </header>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="py-box py-box--gray py-box--large text-left" controlId="business">
                    <Form.Label className="py-form-field__label is-required">Business Name</Form.Label>
                    <div>
                        <Form.Control
                            placeholder="Business Name"
                            aria-label="Business Name"
                            maxLength="19"
                            required
                            name="business"
                            className="py-form__element__fluid form-control-lg text-uppercase"
                            aria-describedby="basic-addon1"
                            defaultValue={businessName ? businessName.toUpperCase().slice(0, 19) : ''}
                            onChange={(e) => {
                                setBusinessName(e.target.value ? e.target.value.toUpperCase() : e.target.value)
                            }}
                        />
                        <Form.Control.Feedback type="invalid">{requiredMsg}</Form.Control.Feedback>
                        <span className="py-text--hint">{19 - (businessName ? businessName.length : businessName.slice(0, 19).length)} Characters Remaining</span>
                    </div>
                </Form.Group>

                <CardStatement displayName={businessName ? businessName.toUpperCase().slice(0, 19) : ''} />

                <div className="mb-4 mt-3">
                    <label for="privacy-policy" className="py-checkbox">
                        <input type="checkbox"
                            id="privacy-policy"
                            onChange={(e) => {
                                e.target.checked ? setAccepted(true) : setAccepted(false)
                            }}
                        />
                        <span className="py-form__element__faux"></span>
                        <span className="py-form__element__label">
                            I agree to the Payments by Finance <a className="py-text--link" href={terms()} target="_blank">Terms of Use.</a>
                        </span>
                    </label>
                </div>
                <div className="d-flex jusitfy-content-between align-items-center mt-4">
                    <Button type="submit" color="primary"
                        disabled={!accepted || loading}>
                        Save and continue &nbsp;  {loading && <Spinner size="sm" color="default" />}
                    </Button>
                </div>
            </Form>
        </div>
    );
}

export default Index;