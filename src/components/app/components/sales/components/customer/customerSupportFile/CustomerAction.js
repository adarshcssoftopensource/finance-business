import React, { Component, Fragment } from 'react'
import { Tooltip } from 'reactstrap'
import { _getUser } from '../../../../../../../utils/authFunctions'
import { DeleteModal } from '../../../../../../../utils/PopupModal/DeleteModal';
import { connect } from 'react-redux';
import { deleteCustomer, fetchCustomers } from '../../../../../../../actions/CustomerActions';
import history from '../../../../../../../customHistory';
import Icon from '../../../../../../../components/common/Icon';
import { handleAclPermissions } from '../../../../../../../utils/GlobalFunctions'
import symbolsIcon from "../../../../../../../assets/icons/product/symbols.svg";
class CustomerAction extends Component {
    state = {
        openDelete: false,
        deleteBtn: false
    }

    onDeleteConfirmation = (event, item) => {
        this.setState({
          openDelete: true,
          selectedDeleteCustomer: item
        });
    };

    onDeleteCall = () => {
        const { selectedDeleteCustomer } = this.state;
        this.setState({deleteBtn: true})
        this.deleteCustomer(selectedDeleteCustomer._id)
    };
    deleteCustomer = async (id) => {
        try {
          await this.props.deleteCustomer(id);
          this.props.fetchCustomers(`pageNo=1&pageSize=10`)
            this.setState({ openDelete: false, deleteBtn: false })
        } catch (error) {
            this.setState({deleteBtn: false})
        }
    };

    toggle = key => {
        this.setState({
            [key]: !!this.state[key] ? !this.state[key] : true
        })
    }
    render() {
        const { row, paymentSettings: {load, data} } = this.props;
        const {acl} = _getUser(localStorage.getItem('token'))
        return (
            <Fragment>
                {
                    acl.permissions[3].scope.includes("write") && (

                        <div className="align-center-right" >
                            <Tooltip placement="top" isOpen={this.state[`edit-${row._id}`] === true}
                                target={`edit-${row._id}`}
                                toggle={() => this.toggle(`edit-${row._id}`)}
                            >
                                Edit
                            </Tooltip>
                            <a onClick={e => history.push(`/app/sales/customer/edit/${row._id}?payment=${false}`)}
                            id={`edit-${row._id}`}
                            href="javascript:void(0)" className="py-table__action Icon"
                            data-toggle="tooltip"
                            >
                            <svg viewBox="0 0 20 20" id="edit" xmlns="http://www.w3.org/2000/svg"><path d="M8.75 13.836L16.586 6 14 3.414 6.164 11.25l2.586 2.586zm-1.528 1.3l-2.358-2.358-.59 2.947 2.948-.59zm11.485-8.429l-10 10a1 1 0 0 1-.51.274l-5 1a1 1 0 0 1-1.178-1.177l1-5a1 1 0 0 1 .274-.511l10-10a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1 0 1.414z"></path></svg>
                            </a>
                            {
                                !load && !handleAclPermissions(['Viewer']) && !!data && !!data.isOnboardingApplicable && (
                                    <Fragment>
                                        <Tooltip placement="top" isOpen={this.state[`payment-${row._id}`] === true}
                                            target={`payment-${row._id}`}
                                            toggle={() => this.toggle(`payment-${row._id}`)}
                                        >
                                            View payment method
                                        </Tooltip>
                                        <a id={`payment-${row._id}`} onClick={e => history.push(`/app/sales/customer/edit/${row._id}?payment=${true}`)}
                                        href="javascript:void(0)" className="py-table__action Icon"
                                        data-toggle="tooltip"
                                        >
                                        <svg viewBox="0 0 20 20" id="creditcard" xmlns="http://www.w3.org/2000/svg"><path d="M17 6v-.545A.455.455 0 0 0 16.545 5H3.5a.5.5 0 0 0-.5.5V6h14zm0 2H3v6.545c0 .251.204.455.455.455h13.09a.455.455 0 0 0 .455-.455V8zM3.5 3h13.045A2.455 2.455 0 0 1 19 5.455v9.09A2.455 2.455 0 0 1 16.545 17H3.455A2.455 2.455 0 0 1 1 14.545V5.5A2.5 2.5 0 0 1 3.5 3zM5 13a1 1 0 1 1 0-2h5a1 1 0 1 1 0 2H5z"></path></svg>
                                        </a>
                                    </Fragment>
                                )
                            }
                            {!handleAclPermissions(['Viewer'])&& (
                                    <Fragment>
                            <Tooltip placement="top" isOpen={this.state[`delete-${row._id}`] === true}
                                target={`delete-${row._id}`}
                                toggle={() => this.toggle(`delete-${row._id}`)}
                            >
                                Delete
                            </Tooltip>
                            <a id={`delete-${row._id}`} href="javascript:void(0)" className="py-table__action py-table__action__danger  Icon"
                            onClick={e => this.onDeleteConfirmation(e, row)}
                            data-toggle="tooltip"
                            >
                                <Icon className="Icon" xlinkHref={`${symbolsIcon}#delete`} />
                            </a>
                                    </Fragment>
                                )
                            }
                        </div>
                    )
                }
                {
                    this.state.openDelete && (
                        <DeleteModal
                            message={"Are you sure you want to delete this customer?"}
                            openModal={this.state.openDelete}
                            onDelete={this.onDeleteCall}
                            onClose={() => this.setState({ openDelete: false, deleteBtn: false })}
                            btnLoad={this.state.deleteBtn}
                        />
                    )
                }
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        paymentSettings: state.paymentSettings
    };
}
export default connect(mapStateToProps, {deleteCustomer, fetchCustomers})(CustomerAction)