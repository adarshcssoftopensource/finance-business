import React, { Component, Fragment } from 'react'
import { Button } from 'reactstrap';
import EmailCard from './EmailCard'
import UserRoleForm from './UserRoleForm'
import profileServices from '../../../../../../api/profileService'
import { connect } from 'react-redux'
import CenterSpinner from '../../../../../../global/CenterSpinner'
import { INVITE_USER_SUCCESS, DELETE_DELEGATE_SUCCESS, UPDATE_USER_SUCCESS } from '../../../../../../constants/ActionTypes'
import BusinessInit from './BusinessInit'
import { handleAclPermissions } from '../../../../../../utils/GlobalFunctions'
import history from '../../../../../../customHistory'
class UserManagement extends Component {
    state = {
        isInvite: false,
        isEdit: false,
        selectedUser: null,
        users: [],
        loading: false,
        isInit: true,
        selectedRole: null
    }

    componentDidMount() {
        const { businessInfo } = this.props;
        document.title = businessInfo && businessInfo.selectedBusiness ? `Finance - ${businessInfo.selectedBusiness.organizationName} - Users` : "Finance - Users";
        this._fetchUsers()
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.profile !== nextProps.profile) {
            if (nextProps.profile.type === INVITE_USER_SUCCESS) {
                this.setState({
                    isInvite: false
                })
                this._fetchUsers();
            }
            if (nextProps.profile.type === DELETE_DELEGATE_SUCCESS || nextProps.profile.type === UPDATE_USER_SUCCESS) {
                this.setState({
                    [`isEdit-${nextProps.profile.data.delegateUser._id}`]: false
                })
                this._fetchUsers();
            }
        }
    }
    _fetchUsers = async () => {
        this.setState({ loading: true })
        const users = await profileServices.fetchDeligateUsers()
        if (!!users && users.statusCode === 200) {
            this.setState({ users: users.data.delegateUsers, loading: false, isInit: users.data.delegateUsers.length > 1 ? false : true })
        }
    }

    _onClickEdit = (data) => {
        if (!!data.acl.role && data.acl.role === 'Owner') {
            window.open(`${process.env.REACT_APP_WEB_URL}/app/accounts`)
        } else {
            if (!!this.state.users && this.state.users.length > 0) {
                this.state.users.map((item) => {
                    this.setState({
                        [`isEdit-${item._id}`]: false,
                        [`isEdit-${data._id}`]: true,
                        selectedUser: data
                    })
                })
            }
        }
    }

    _setRole = id => {
        const { selectedBusiness } = this.props.businessInfo;
        if (selectedBusiness.subscription && !selectedBusiness.subscription.isSubscribed) {
            this.redirectToUpgrade()
        } else {
            this.setState({
                isInvite: true,
                isInit: false,
                selectedRole: { _id: id }
            })
        }
    }

    _onClickCancel = e => {
        e.preventDefault();
        this.setState({
            [`isEdit-${this.state.selectedUser._id}`]: false
        })
    }

    inviteUserClick = () => {
        const { selectedBusiness } = this.props.businessInfo;
        const { users } = this.state
        if (selectedBusiness.subscription && !selectedBusiness.subscription.isSubscribed && users.length >= 1) {
            this.redirectToUpgrade()
        } else if (selectedBusiness.subscription && selectedBusiness.subscription.isSubscribed && selectedBusiness.subscription.title ==='Professional' && users.length >= 7) {
            this.redirectToUpgrade()
        } else {
            this.setState({ isInvite: true })
        }
    }

    redirectToUpgrade = () => {
        history.push('/app/subscription/upgrade')
    }

    render() {
        const { users, isEdit, isInit, isInvite, loading, selectedUser, selectedRole } = this.state
        if (!isInit) {

            return (
                <div className="py-page__content">
                    <div className="py-page__inner users_contents">
                        <header className="py-header--page">
                            {!handleAclPermissions(['Viewer', 'Editor']) && <div className="py-header--action pull-right">
                                <button className="btn btn-primary" onClick={this.inviteUserClick}>Invite an user</button>
                            </div>}
                            <div className="py-header--title">
                                <h2 className="py-heading--title">{this.props.businessInfo.selectedBusiness.organizationName}</h2>
                            </div>
                        </header>
                        <p className="py-text">You can invite a new user to access your Finance account. Only give access to people you trust, since users can see your transactions and other business information.</p>
                        {
                            isInvite && (
                                <div className="invite-sec">
                                    <UserRoleForm
                                        switchMode={() => this.setState({ isInvite: false, isInit: users.length > 1 ? false : true })}
                                        selectedRole={selectedRole}
                                    />
                                </div>
                            )
                        }
                        <div className="py-editable-user-list">
                            {
                                loading ? (
                                    <CenterSpinner />
                                ) : (
                                        <div className="card-table">
                                            {
                                                !!users && users.length > 1 &&
                                                users.map((user, i) => {
                                                    return (
                                                        <Fragment>
                                                            <EmailCard
                                                                data={user} key={i}
                                                                isEdit={isEdit}
                                                                onClickEdit={this._onClickEdit}
                                                            />
                                                            {
                                                                (this.state[`isEdit-${user._id}`]) && (
                                                                    <div className="invite-sec">
                                                                        <UserRoleForm
                                                                            isEdit={this.state[`isEdit-${user._id}`]}
                                                                            selectedData={selectedUser}
                                                                            switchMode={this._onClickCancel}
                                                                        />
                                                                    </div>
                                                                )
                                                            }
                                                        </Fragment>
                                                    )
                                                })
                                            }
                                        </div>
                                    )
                            }
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <BusinessInit
                    setRole={this._setRole}
                    businessInfo={this.props.businessInfo}
                />
            )
        }
    }
}

const stateToProps = state => {
    return {
        profile: state.profile,
        businessInfo: state.businessReducer
    }
}

export default connect(stateToProps, null)(UserManagement)