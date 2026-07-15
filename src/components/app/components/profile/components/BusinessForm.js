import React from 'react';
import { Form, FormGroup, Label, Col, Input, FormText, Button } from 'reactstrap';

export const BusinessForm = ({ handleFormSubmission, handleText }) => (
    <Form onSubmit={e => handleFormSubmission(e)}>
        <FormGroup row>
            <Label htmlFor="companyName" className="text-right is-required" xs={12} sm={4} md={3} lg={3}>Company name</Label>
            <Col xs={12} sm={8} md={8} lg={8}>
                <Input autocomplete="nope" required type="text"
                    value={'userInput.firstName'}
                    name="companyName"
                    id="companyName"
                    onChange={(e) => handleText(e)}
                />
            </Col>
        </FormGroup>
        <FormGroup row>
            <Label htmlFor="addressLine1" className="text-right" xs={12} sm={4} md={3} lg={3}>Address Line 1 </Label>
            <Col xs={12} sm={8} md={8} lg={8}>
                <Input autocomplete="nope" type="text"
                    value={'userInput.firstName'}
                    name="addressLine1"
                    id="addressLine1"
                    onChange={(e) => handleText(e)}
                />
            </Col>
        </FormGroup>
        <FormGroup row>
            <Label htmlFor="addressLine2" className="text-right" xs={12} sm={4} md={3} lg={3}>Address Line 2 </Label>
            <Col xs={12} sm={8} md={8} lg={8}>
                <Input autocomplete="nope" type="text"
                    value={'userInput.firstName'}
                    name="addressLine2"
                    id="addressLine2"
                    onChange={(e) => handleText(e)}
                />
            </Col>
        </FormGroup>
        <FormGroup row>
            <Label htmlFor="city" className="text-right" xs={12} sm={4} md={3} lg={3}>City </Label>
            <Col xs={12} sm={8} md={8} lg={8}>
                <Input autocomplete="nope" type="text"
                    value={'userInput.firstName'}
                    name="city"
                    id="city"
                    onChange={(e) => handleText(e)}
                />
            </Col>
        </FormGroup>
        <FormGroup row>
            <Label htmlFor="country" className="text-right is-required" xs={12} sm={4} md={3} lg={3}>Country</Label>
            <Col xs={12} sm={6} md={6} lg={6}>
                <Input autocomplete="nope"
                    type="select"
                    id="country"
                    name="country"
                    // value={'userInput.address'.country.id}
                    onChange={(e) => handleText(e)}
                >
                    <option key={-1} value={""}>
                        {"Select Country"}
                    </option>
                    {setCountries(countries)}
                </Input>
                <FormText>
                    If you do business in one country but are based in another, choose the country where you file your taxes, or where your business is incorporated.
                    </FormText>
            </Col>
        </FormGroup>
        <FormGroup row>
            <Label
                htmlFor="state"
                className="text-right"
                xs={12}
                sm={4}
                md={3}
                lg={3}
            >
                Province/State
                </Label>
            <Col xs={12} sm={6} md={6} lg={6}>
                <Input autocomplete="nope"
                    type="select"
                    name="state"
                    id="state"
                    // value={parseInt('userInput.address'.state.id)}
                    onChange={(e) => handleText(e)}
                >
                    <option key={-2} value={""}>
                        {"Select State"}
                    </option>
                    {/* {setCountryStates(states)} */}
                </Input>
            </Col>
        </FormGroup>
        <FormGroup row>
            <Label htmlFor="postal" className="text-right" xs={12} sm={4} md={3} lg={3}>Postal/Zip Code </Label>
            <Col xs={12} sm={6} md={6} lg={4}>
                <Input autocomplete="nope" type="zip"
                    value={'userInput.postal'}
                    name="postal"
                    id="postal"
                    minLength={2}
                    maxLength={10}
                    onChange={(e) => handleText(e)} />
            </Col>
        </FormGroup>
        <FormGroup row>
            <Label htmlFor="timeZone" className="text-right" xs={12} sm={4} md={3} lg={3}>Time zone</Label>
            <Col xs={12} sm={8} md={8} lg={8}>
                <Input autocomplete="nope" type="text"
                    value={'userInput.address'.city}
                    name="timeZone"
                    id="timeZone"
                    placeholder="Select a time zone"
                    onChange={(e) => handleText(e)} />
            </Col>
        </FormGroup>
        <FormGroup row>
            <Label htmlFor="phone" className="text-right" xs={12} sm={4} md={3} lg={3}>Phone </Label>
            <Col xs={12} sm={6} md={6} lg={4}>
                <Input autocomplete="nope" type="text"
                    value={'userInput.dateOfBirth'}
                    name="phone"
                    id="phone"
                    onChange={(e) => handleText(e)} />
            </Col>
        </FormGroup>
        <FormGroup row>
            <Label htmlFor="fax_no" className="text-right" xs={12} sm={4} md={3} lg={3}>Fax </Label>
            <Col xs={12} sm={6} md={6} lg={4}>
                <Input autocomplete="nope" type="text"
                    value={'userInput.dateOfBirth'}
                    name="fax"
                    id="fax_no"
                    onChange={(e) => handleText(e)} />
            </Col>
        </FormGroup>
        <FormGroup row>
            <Label htmlFor="mobile" className="text-right" xs={12} sm={4} md={3} lg={3}>Mobile </Label>
            <Col xs={12} sm={6} md={6} lg={4}>
                <Input autocomplete="nope" type="text"
                    value={'userInput.dateOfBirth'}
                    name="mobile"
                    id="mobile"
                    onChange={(e) => handleText(e)} />
            </Col>
        </FormGroup>
        <FormGroup row>
            <Label htmlFor="website" className="text-right" xs={12} sm={4} md={3} lg={3}>Website </Label>
            <Col xs={12} sm={6} md={6} lg={4}>
                <Input autocomplete="nope" type="text"
                    value={'userInput.dateOfBirth'}
                    name="website"
                    id="website"
                    onChange={(e) => handleText(e)} />
            </Col>
        </FormGroup>
        <FormGroup row>
            <Label htmlFor="business_cur" className="text-right" xs={12} sm={4} md={3} lg={3}>Buisiness Currency </Label>
            <Col xs={12} sm={6} md={6} lg={6}>
                <Input autocomplete="nope" type="text"
                    value={'userInput.dateOfBirth'}
                    id="business_cur"
                    name="website" readOnly />
                <FormText className="helpingText no-mg">
                    This is your reporting currency and cannot be changed. You can still send invoices, track expenses and enter transactions in any currency and an exchange rate is applied for you. <a href="javascript: void(0)">Learn more</a>
                </FormText>
            </Col>
        </FormGroup>
        <FormGroup row>
            <Col xs={12} sm={6} md={6} lg={4} className="btnSave btnWrp">
                <Button color="primary" > Save</Button>
            </Col>
        </FormGroup>
    </Form>
)