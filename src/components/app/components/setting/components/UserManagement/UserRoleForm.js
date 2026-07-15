import React, { Component } from 'react';
import { Form, Container, Row, Col, Label, Spinner, Button } from 'reactstrap';
import CustomInput from '../../../../../common/CustomInput';
import CustomSelect from '../../../../../common/CustomSelect';
import { inviteUserAct, deleteUserAct, updateUserAct } from '../../../../../../actions/profileActions';
import { connect } from 'react-redux';
import profileServices from '../../../../../../api/profileService';
import { INVITE_USER_LOADING, DELETE_DELEGATE_LOADING, UPDATE_USER_LOADING } from '../../../../../../constants/ActionTypes';
import { CustomDeleteModal } from '../../../../../../utils/PopupModal/DeleteModal';
import { _isValidEmail } from '../../../../../../utils/GlobalFunctions';
import Icon from '../../../../../../components/common/Icon';
import symbolsIcon from "../../../../../../assets/icons/product/symbols.svg";
const positionList = [
    { name: 'Partner/Co-owner', value: 'Partner/Co-owner' },
    { name: 'Accountant/Bookkeeper', value: 'Accountant/Bookkeeper' },
    { name: 'Family member', value: 'Family member' },
    { name: 'Salesperson', value: 'Salesperson' },
    { name: 'Assistant', value: 'Assistant' },
    { name: 'Other', value: 'Other' },
]
class UserRoleForm extends Component {
    state = {
        firstName: '',
        lastName: '',
        email: '',
        position: '',
        role: '',
        roles: [],
        users: [],
        isDelete: false,
        otherPosition: ''
    }
    componentDidMount() {
        this._fetchRoles()
        const { selectedData, selectedRole, isEdit } = this.props;
        if (!!isEdit) {
            if (!!selectedData) {
                this.setState({
                    firstName: selectedData.firstName,
                    lastName: selectedData.lastName,
                    email: selectedData.email,
                    role: { _id: selectedData.roleId },
                    position: this.checkIfOtherPositionIsAdded(selectedData.position) ? selectedData.position : 'Other',
                    otherPosition: this.checkIfOtherPositionIsAdded(selectedData.position) ? '' : selectedData.position
                })
            }
        }
        if (!!selectedRole) {
            this.setState({
                role: selectedRole
            })
        }
    }

    componentDidUpdate(prevProps) {
        const { selectedData, selectedRole, isEdit } = this.props;
    
        if (isEdit && selectedData && selectedData !== prevProps.selectedData) {
            this.setState({
                firstName: selectedData.firstName,
                lastName: selectedData.lastName,
                email: selectedData.email,
                role: { _id: selectedData.roleId },
                position: this.checkIfOtherPositionIsAdded(selectedData.position) ? selectedData.position : 'Other',
                otherPosition: this.checkIfOtherPositionIsAdded(selectedData.position) ? '' : selectedData.position
            });
        }
    
        if (selectedRole && selectedRole !== prevProps.selectedRole && !this.state.role) {
            this.setState({
                role: selectedRole
            });
        }
    }
    

    _fetchRoles = async () => {
        const roles = await profileServices.fetchRoles()
        if (!!roles && roles.statusCode === 200) {
            this.setState({ roles: roles.data })
            if (!this.state.role) {
                this.setState({
                    role: { _id: roles.data[0]._id }
                })
            }
        }
    }

    checkIfOtherPositionIsAdded = (position) => positionList.some((pos) => pos.value === position)


    _checkFormValidity() {
        let isValid = true;
        ['firstName', 'lastName', 'email', 'position', 'role', 'otherPosition'].map(item => {
            if (!this.state[item]) {
                if (this.state.position && this.state.position === 'Other' && item === 'otherPosition') {
                    this.setState({ [`${item}Err`]: true })
                    isValid = false;
                } else if (item !== 'otherPosition') {
                    this.setState({ [`${item}Err`]: true })
                    isValid = false;
                }
            } else {
                if (item === 'email') {
                    if (!_isValidEmail(this.state.email)) {
                        this.setState({ [`${item}Err`]: true, emailMessage: 'Valid email is required' })
                        //  isValid = false;
                    } else {
                        this.setState({ [`${item}Err`]: false, })

                    }
                } else {
                    this.setState({ [`${item}Err`]: false })
                }
            }
        })
        return isValid
    }
    formSubmit(e) {
        e.preventDefault()
        const { firstName, lastName, email, position, role, otherPosition } = this.state
        let data = {
            firstName,
            lastName,
            email,
            position: otherPosition ? otherPosition : position,
            roleId: role._id
        }
        if (this._checkFormValidity()) {
            if (!!this.props.isEdit) {
                delete data.email
                this.props.updateUserAct(data, this.props.selectedData._id)
            } else {
                this.props.inviteUserAct(data)
            }
        }
    }
    onChange = ({ target: { name, value } }) => {
        if (name === 'role') {
            this.setState({
                role: { _id: value }
            })
        } else {
            this.setState({ [`${name}Err`]: false })
            this.setState({
                [name]: value
            })

        }
    }

    _deleteUser = e => {
        e.preventDefault();
        this._toggleDeleteModal(e)
        this.props.deleteUserAct(this.props.selectedData._id)
    }

    _toggleDeleteModal = e => {
        e.preventDefault()
        this.setState({
            isDelete: !this.state.isDelete
        })
    }
    render() {

        const { firstName, lastName, position, role, email, roles, isDelete, otherPosition } = this.state;
        const { profile: { data, type }, selectedData, isEdit } = this.props
        return (
            <div className="py-page__inner-content p-4">
                <header className="py-header--page flex">
                    <div className="py-header--title">
                        <h4 className="">
                            {isEdit ? `Edit ${selectedData.firstName} ${selectedData.lastName}` : 'Invite new user'}
                        </h4>
                    </div>
                </header>
                <Form className="py-form-field--condensed invite-user-form" onSubmit={this.formSubmit.bind(this)} >
                    <div className="container card-table-row-title-section" >
                        <div className="row invite_form_field mx-n2">
                            <div className="col-3 col-sm-2 px-2 text-right" >
                                <label for="firstName" class="py-form-field__label___noWidth is-required p-2">Name</label>
                            </div>
                            <div className="col-4 col-sm-3 px-2" >
                                <CustomInput
                                    name="firstName"
                                    id="firstName"
                                    className="mb-0"
                                    type="text"
                                    required={true}
                                    value={firstName}
                                    onChange={this.onChange}
                                    placeholder="First Name"
                                    isError={this.state.firstNameErr}
                                // disabled={isEdit}
                                // autoFocus={true}
                                />
                            </div>
                            <div className="col-4 col-sm-3 px-2" >
                                <CustomInput
                                    name="lastName"
                                    id="lastName"
                                    label=""
                                    className="mb-0"
                                    type="text"
                                    placeholder="Last Name"
                                    value={lastName}
                                    onChange={this.onChange}
                                    isError={this.state.lastNameErr}
                                // disabled={isEdit}
                                />
                            </div>
                        </div>
                        <div className="row invite_form_field mx-n2">
                            <div className="col-3 col-sm-2 px-2 text-right" >
                                <label for="email" class="py-form-field__label___noWidth is-required p-2">Email</label>
                            </div>
                            <div className="col-8 col-sm-6 px-2" >
                                <CustomInput
                                    name="email"
                                    id="email"
                                    type="text"
                                    required={true}
                                    value={email}
                                    onChange={this.onChange}
                                    placeholder="Email Address"
                                    disabled={isEdit}
                                    isError={this.state.emailErr}
                                    message={this.state.emailMessage}
                                />
                            </div>
                        </div>
                        <div className="row invite_form_field mx-n2">
                            <div className="col-3 col-sm-2 px-2 text-right" >
                                <label for="position" class="py-form-field__label___noWidth is-required p-2">Position</label>
                            </div>
                            <div className="col-8 col-sm-6 px-2" >
                                <CustomSelect
                                    name="position"
                                    id="position"
                                    required={true}
                                    getOptionLabel={(value) => value["name"]}
                                    options={positionList}
                                    className="mb-0"
                                    value={position ? {name: position, value: position} : null}
                                    onChange={this.onChange}
                                    isError={this.state.positionErr}
                                />
                                {position === 'Other' && <CustomInput
                                    name="otherPosition"
                                    id="otherPosition"
                                    label=""
                                    className="mb-0 mt-1"
                                    type="text"
                                    placeholder="Enter other position"
                                    value={otherPosition}
                                    onChange={this.onChange}
                                    isError={this.state.otherPositionErr}
                                />}
                            </div>
                        </div>
                        <div className="row invite_form_field mx-n2">
                            <div className="col-3 col-sm-2 px-2 text-right" >
                                <Label htmlFor="exampleText" className="slectedDatapy-form-field__label___noWidth--align-top p-2 is-required">Role</Label>
                            </div>
                            <div div className="col-8 col-sm-6 px-2" >
                                <div className="py-form-field__element">
                                    <ul className="py-list--small">
                                        {roles.map((itemType, index) => {
                                            return (
                                                <div key={itemType + index}>
                                                    <li> <label className="py-radio">
                                                        <input type="radio"
                                                            name="role"
                                                            id="role"
                                                            checked={role._id === itemType._id}
                                                            value={itemType._id}
                                                            onChange={this.onChange}
                                                        />
                                                        <span className="py-form__element__faux"></span>
                                                        <span className="py-form__element__label">{itemType.name}
                                                            {/* <span className="py-form-field__hint py-text__emphasized ms-1">{itemType === "Items" ? "Default" : ""}</span> */}
                                                        </span>
                                                        {/* {itemType === "Other" ? <Input type="text" name="column1" value={(itemHeading.column1.name !== "Items" && itemHeading.column1.name !== "Services" && itemHeading.column1.name !== "Products") ? itemHeading.column1.name : ""} onChange={e => this.handleItemHeading(e, "Other")} className="py-form__element__small" /> : ""} */}
                                                    </label>
                                                    </li>
                                                </div>
                                            )
                                        })}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="row mx-n2 invite-form-footer">
                            <div className="col-4 col-sm-6 px-2">
                                {
                                    isEdit && (
                                        <Button color="danger" className="btn-trash pull-left"
                                            onClick={this._toggleDeleteModal}
                                            disabled={type === DELETE_DELEGATE_LOADING}
                                        > {type === DELETE_DELEGATE_LOADING ? <Spinner size={'sm'} color="default" /> : <Icon className="Icon" xlinkHref={`${symbolsIcon}#delete`} />}</Button>
                                    )
                                }
                            </div>
                            <div className="col-8 col-sm-6 px-2 text-right" >
                                <Button color="primary" outline onClick={this.props.switchMode} >Cancel</Button>
                                <Button color="primary" className="ms-2" disabled={type === INVITE_USER_LOADING || type === UPDATE_USER_LOADING} > {(type === INVITE_USER_LOADING || type === UPDATE_USER_LOADING) ? <Spinner size={'sm'} color="default" /> : isEdit ? 'Update Info' : 'Invite User'}</Button>
                            </div>
                        </div>
                    </div>
                </Form>
                {
                    isDelete && (
                        <CustomDeleteModal
                            title="Remove Access"
                            openModal={isDelete}
                            onDelete={this._deleteUser}
                            onClose={this._toggleDeleteModal}
                            btnText="Remove User"
                        >
                            <span>
                                Are you sure you want to remove <br /><b>{selectedData.email}</b> from this business?<br /> This user will no longer have access to your business.
                            </span>
                        </CustomDeleteModal>
                    )
                }
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        profile: state.profile
    }
}

export default connect(mapStateToProps, { inviteUserAct, updateUserAct, deleteUserAct })(UserRoleForm)
