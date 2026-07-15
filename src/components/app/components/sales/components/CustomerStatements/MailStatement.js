import React, { Fragment } from "react";
import {
    TabContent,
    TabPane,
    Nav,
    NavItem,
    NavLink,
    Card,
    Button,
    CardTitle,
    CardText,
    Row,
    Col,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FormGroup,
    Label,
    Input,
    Spinner
} from "reactstrap";
import { cloneDeep } from "lodash";
import { connect } from "react-redux";

import SelectBox from "../../../../../../utils/formWrapper/SelectBox";
import classnames from "classnames";
// import { sendMail, sendInvoice } from "../../../../../../api/InvoiceService";
import { updateData, openGlobalSnackbar } from "../../../../../../actions/snackBarAction";
import { mailMessage, statementMailMessage } from "../helpers";
import { fetchUsersEmails } from "../../../../../../api/EstimateServices";
import * as Services from "../../../../../../api/CustomerStatementServices";
import FormValidationError from '../../../../../../global/FormValidationError';
class MailStatement extends React.Component {
    state = {
        activeTab: "1",
        editSubject: false,
        sentVia: undefined,
        mailStatement: {
            from: "",
            to: [""],
            subject: ``,
            message: "",
            self: false,
        },
        mailFrom: [],
        loading: false,
        errors: {}
    };

    componentDidMount() {
        this.setMailStatementObj();
        this.fetchEmails()
    }

    async fetchEmails() {
        const res = await fetchUsersEmails();
        const emails = res.data.emails;
        this.setState({ emails })
    }

    componentDidUpdate(previousProps) {
        const { invoicesStatementData } = this.props;
        if (previousProps.invoicesStatementData != invoicesStatementData) {
            this.setMailStatementObj();
        }
    }

    async setMailStatementObj() {
        const { invoicesStatementData, businessInfo } = this.props;
        let { mailStatement } = this.state;
        mailStatement.subject = `Statement of Account from ${(businessInfo) ? businessInfo.organizationName : ''}`;
        mailStatement.from = localStorage.getItem("user.email");
        mailStatement.to = [`${(invoicesStatementData.customer && invoicesStatementData.customer.email) ? invoicesStatementData.customer.email : ""}`]
        this.setState({ mailStatement });
        this.setFromOptions(mailStatement.from);
    }

    setFromOptions(from) {
        let { mailFrom } = this.state;
        if (mailFrom && mailFrom.length <= 0) {
            mailFrom.push({
                value: from,
                label: from
            });
            this.setState({ mailFrom });
        }
    }

    toggleTab = tab => {
        let queryString = "";
        if (this.state.activeTab !== tab) {
            queryString = tab !== "all" ? `status=${tab}` : "";
            this.setState({
                activeTab: tab
            });
        }
    };

    addToMailAddress = () => {
        let mailStatement = cloneDeep(this.state.mailStatement);
        mailStatement.to.push("");
        this.setState({ mailStatement });
    };

    removeMailAddress = idx => {
        let mailStatement = cloneDeep(this.state.mailStatement);
        mailStatement.to = mailStatement.to.filter((item, index) => {
            return index !== idx;
        });
        if (mailStatement.to.length <= 0) {
            mailStatement.to.push("");
        }
        this.setState({ mailStatement });
    };

    handleMailInvoice = (event, index, selected) => {
        let mailStatement = this.state.mailStatement;
        this.setState({ errors: {} })
        if (!!selected) {
            mailStatement.from = selected.email
        } else {
            const { value, name, type } = event.target;
            if (index !== undefined) {
                mailStatement[name][index] = value;
            } else {
                if (type === "checkbox") {
                    mailStatement[name] = !mailStatement[name];
                } else {
                    mailStatement[name] = value;
                }
            }
        }
        this.setState({ mailStatement });
    };

    onCancelClick = () => {
        this.setState({
            activeTab: "1",
            editSubject: false,
            mailStatement: {
                from: "",
                to: [""],
                subject: "",
                message: "",
                self: false,
            }
        });
        this.props.on.Close();
    };

    onEditSubject = () => {
        this.setState({
            editSubject: true
        })
    }

    closeMailInvoice = () => {
        const { onClose } = this.props
        this.setState({ sentVia: undefined })
        onClose()
    }

    sendMailToCustomer = async (e) => {
        e.preventDefault();
        const { invoicesStatementData, refreshData, showSnackbar } = this.props
        let { mailStatement, sentVia } = this.state
        if (this.validateEmail(mailStatement.to)) {
            let payload
            try {
                this.setState({ loading: true });
                payload = {
                    emailInput: mailStatement
                }
                await Services.mailCustomerStatement(this.props.statementUuid, payload).then(res => {
                    showSnackbar("Email sent successfully", false);
                    refreshData();
                    this.closeMailInvoice()
                    this.setState({ loading: false });
                })

            } catch (error) {
                const errorMessage = error.message
                showSnackbar(errorMessage, true);
                this.setState({ loading: false });
            }
        }
    }

    validateEmail = (emails) => {
        let errors = []
        emails.map((email, i) => {
            if (!email) {
                errors[i] = true
            } else {
                errors[i] = false
            }
        })
        if (errors.length == 0 || errors.every(v => v === false)) {
            return true
        } else {
            this.setState({
                errors: {
                    emailsError: errors
                }
            })
            return false
        }
    }

    renderSendAddress = () => {
        const to = this.state.mailStatement.to;
        const { errors } = this.state;
        return (
            <FormGroup row style={{ marginBottom: '0' }}>
                <Label for="exampleEmail" sm={3} className="text-right pdR0">
                    To
                </Label>
                <Col sm={8}>
                    {to.map((address, index) => {
                        return index === 0 ? (
                            <div key={index} className="group-input" style={{ marginBottom: '0' }}>
                                <Input
                                    type="email"
                                    name="to"
                                    value={address}
                                    onChange={e => this.handleMailInvoice(e, index)}
                                />
                                <a onClick={this.addToMailAddress}>
                                    {" "}
                                    <i className="fal fa-plus"></i>
                                </a>
                                <FormValidationError showError={errors.emailsError ? errors.emailsError[index] : false} />
                            </div>
                        ) : (
                                <div key={index} className="group-input">
                                    <Input
                                        type="email"
                                        name="to"
                                        value={address}
                                        onChange={e => this.handleMailInvoice(e, index)}
                                    />
                                    <a onClick={() => this.removeMailAddress(index)}><i className="fal fa-times"></i></a>
                                    <FormValidationError showError={errors.emailsError ? errors.emailsError[index] : false} />
                                </div>
                            );
                    })}
                </Col>
            </FormGroup>
        );
    };

    render() {
        const { openMail, businessInfo, invoicesStatementData } = this.props;
        const { mailStatement, editSubject, sentVia, mailFrom, loading, emails } = this.state;
        return (
            <Modal
                isOpen={openMail}
                toggle={this.closeMailInvoice}
                // className="modal-add modal-confirm"
                centered
            >
                <ModalHeader toggle={this.closeMailInvoice}>Send customer statement by email</ModalHeader>
                <ModalBody>
                    <FormGroup row>
                        <Label for="exampleEmail" sm={3} className="text-right pdR0">
                            From
                        </Label>
                        <Col sm={8}>
                            <SelectBox
                                name="from"
                                getOptionLabel={(value)=>(value["email"])}
                                getOptionValue={(value)=>(value["email"])}
                                value={mailStatement.from}
                                onChange={(selected, e) => this.handleMailInvoice(e, '', selected)}
                                options={emails}
                                aria-required
                                inputProps={{
                                    onInvalid: (e) => e.target.setCustomValidity('This field is required.'),
                                    onInput: (e) => e.target.setCustomValidity(''),
                                }}
                                aria-errormessage={"This field is required."}
                                placeholder="Choose"
                                id="fromEmail"
                                className="py-form__element__large"
                            />
                        </Col>
                    </FormGroup>
                    {this.renderSendAddress()}
                    <FormGroup check row>
                        <Label for="exampleEmail" sm={3} className="text-right pdR0 pd0" />
                        <Label check sm={9}>
                            <Input
                                name="self"
                                type="checkbox"
                                value={mailStatement.self}
                                checked={mailStatement.self}
                                onChange={this.handleMailInvoice}
                                className="pd0 relative me-2"
                            />
                            Send a copy to <strong>{localStorage.getItem("user.email")}</strong>
                        </Label>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="exampleEmail" sm={3} className="text-right pdR0">
                            Subject
                        </Label>

                        <Col sm={8}>
                            <Input
                                type="email"
                                name="from"
                                value={mailStatement.subject}
                                onChange={this.handleMailInvoice}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="exampleEmail" sm={3} className="text-right pdR0">
                            Message
                        </Label>
                        <Col sm={8}>
                            <textarea
                                type="text"
                                name="message"
                                onChange={this.handleMailInvoice}
                                value={mailStatement.message}
                                className="form-control custom-textarea"
                                placeholder={`Enter your message to ${
                                    (businessInfo) ? businessInfo.organizationName : ''
                                    }`}
                            />
                        </Col>
                    </FormGroup>
                    <Row>
                        <Col className="pd0" xs={12} sm={12} md={12} lg={12}><hr></hr></Col>
                    </Row>
                    <div className="text-right" >
                        <Button
                            color="primary"
                            outline
                            className="me-2"
                            onClick={this.closeMailInvoice}
                        >Cancel</Button>
                        <Button
                            color="primary"
                            disabled={loading}
                            onClick={this.sendMailToCustomer} 
                        >{loading ? <Spinner size="sm" color="light" /> : 'Send'}</Button>
                    </div>
                </ModalBody>
            </Modal>
        );
    }
}

const mapPropsToState = state => ({
    businessInfo: state.businessReducer.selectedBusiness
});

const mapDispatchToProps = dispatch => {
    return {
        refreshData: () => {
            dispatch(updateData());
        },
        showSnackbar: (message, error) => {
            dispatch(openGlobalSnackbar(message, error));
        }
    };
};

export default connect(
    mapPropsToState,
    mapDispatchToProps
)(MailStatement);
