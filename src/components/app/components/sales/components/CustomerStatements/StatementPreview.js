import React, { PureComponent, Fragment } from "react";
import {
    Input,
    Container,
    Label,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from "reactstrap";
import history from '../../../../../../customHistory'
import StatementView from './StatementView';
import CenterSpinner from '../../../../../../global/CenterSpinner';
import * as CustomerStatementActions from '../../../../../../actions/CustomerStatementActions';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import MailStatement from "./MailStatement";
import { statementMailMessage } from "../helpers";
import SnakeBar from "../../../../../../global/SnakeBar";
class StatementPreview extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            invoicesStatementData: {},
            filterData: {
                status: "",
                customer: "",
                startDate: new Date(),
                endDate: new Date()
            },
            isShowUndepaid: false,
            selectedCustomer: {},
            statmentPublicUrl: window.location.href,
            isLoadingData: true,
            openMail: false,
            invoicesStatementuuid: null
        };
    }


    componentDidMount() {
        document.title = `Customer Statements`;
        let { uuid } = this.props.match.params;
        this.setState({ invoicesStatementuuid: uuid })
        this.getPublicStatement(uuid);
    }

    toggleDropdown = () => {
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    }

    getPublicStatement = async (uuid) => {

        this.setState({ isLoadingData: true });
        const response = await this.props.actions.getPublicStatement(uuid);
        if (response) {
            document.title = response.payload.statements.business ? `Finance - ${response.payload.statements.business.organizationName} - Customer Statements` : `Finance-Customer Statements`;
            this.setState({ invoicesStatementData: response.payload.statements, isLoadingData: false });
            if (this.state.invoicesStatementData && this.state.invoicesStatementData.filter) {
                const filter = this.state.invoicesStatementData.filter;
                const customer = this.state.invoicesStatementData.customer;
                this.setState(prevState => ({
                    selectedCustomer: customer,
                    filterData: filter
                }));
                this.setState(prevState => ({
                    isShowUndepaid: (filter.scope == "unpaid") ? true : false
                }));
            }
        }
    };

    openMailBox = () => {
        this.setState({
            openMail: true
        });
    };

    onCloseMail = () => {
        this.setState({
            openMail: false
        });
    };

    sendMailToUser = (e, type) => {
        const { invoicesStatementData, statmentPublicUrl } = this.state;
        const selectedBusiness = (invoicesStatementData) ? invoicesStatementData.business : {};

        if (invoicesStatementData && statmentPublicUrl && selectedBusiness) {
            const url = statementMailMessage(invoicesStatementData, statmentPublicUrl, type, selectedBusiness)
            window.open(url)
        }
    }

    handleFocus = (event) => {
        event.target.select()
        // this.setState({dropdownOpen: true})
    }

    render() {
        const { invoicesStatementuuid, openMail, filterData, invoicesStatementData, isShowUndepaid, selectedCustomer, statmentPublicUrl, isLoadingData } = this.state;
        const { selectedBusiness } = this.props;
        const token = localStorage.getItem("token")
        return (
            <div className="back-white statement-preview">
                <SnakeBar />
                {
                    (isLoadingData) ?
                        <Container className="mrT50 text-center">
                            <h3>Loading your customer statement...</h3>
                            <CenterSpinner />
                        </Container>
                        : ''
                }

                {
                    (!!invoicesStatementData && !!invoicesStatementData.statements && invoicesStatementData.statements.length > 0) ?
                        <React.Fragment>
                            <MailStatement
                                openMail={openMail}
                                invoicesStatementData={invoicesStatementData}
                                statementUuid={invoicesStatementuuid}
                                onClose={this.onCloseMail}
                            />

                            {
                                !!token && (
                                    <Container fluid className="d-flex justify-content-between align-items-center flex-wrap shadow py-2">
                                        <div className="py-2"><span className="pull-left">You are previewing your customer's copy of their statement.</span></div>
                                        <div className="py-2 d-flex align-items-center">
                                            <a href="" className="py-text--link" onClick={() => history.push({ pathname: '/app/sales/customerstatements', search: '', state: { filterData: filterData } })}>Go back to Finance</a> <span className="mx-2" >or</span> <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown}>
                                                <DropdownToggle color="primary" className="ms-1" caret>Send</DropdownToggle>
                                                <DropdownMenu right style={{ width: '300px' }}>
                                                        <DropdownItem onClick={this.openMailBox}>Send with Finance</DropdownItem>
                                                        {/* <span className="dropdown-item-divider" />
                                                        <Label className="mrL20"><strong>Send using</strong></Label>
                                                        <DropdownItem onClick={(e) => this.sendMailToUser(e, 'gmail')}>Gmail</DropdownItem>
                                                        <DropdownItem onClick={(e) => this.sendMailToUser(e, 'yahoo')}>Yahoo! Mail</DropdownItem>
                                                        <DropdownItem onClick={(e) => this.sendMailToUser(e, 'outlook')}>Outlook</DropdownItem> */}
                                                        <DropdownItem divider />
                                                        <Label className="dropdown-menu-item--header py-text--hint py-text--small px-4">Share URL</Label>
                                                        <DropdownItem toggle={false}>
                                                        <Input
                                                            type="text"
                                                            name="shareLink"
                                                            onClick={this.handleFocus}
                                                            ref="publicUrl"
                                                            className="js-public--link"
                                                            value={statmentPublicUrl} />
                                                        </DropdownItem>
                                                        <span className="py-text--hint py-text--small px-4">Press Cmd+C or Ctrl+C to copy to clipboard</span>
                                                </DropdownMenu>
                                            </Dropdown>
                                        </div>

                                    </Container>
                                )
                            }
                            <div className="content-wrapper__main__fixed back-white my-3">
                                    <Container className="px-0">
                                        {
                                            invoicesStatementData.statements.map((item, idx) => (
                                                <div key={idx}>
                                                    <StatementView isPublic={token ? false : true} invoicesStatementData={item} isShowUndepaid={isShowUndepaid} selectedBusiness={selectedBusiness} selectedCustomer={selectedCustomer} filterData={filterData} {...this.props} />
                                                </div>
                                            ))
                                        }
                                    </Container>
                            </div>
                        </React.Fragment>
                        :
                        ''
                }
            </div>
        );
    }
}

// export default StatementPreview;

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators(CustomerStatementActions, dispatch)
    };
}

const mapStateToProps = state => {
    return {
    };
};

export default withRouter((connect(mapStateToProps, mapDispatchToProps)(StatementPreview)))
