import MiniSidebar from '../../../../../global/MiniSidebar';
import { find } from 'lodash';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { setCountrytStates } from '../../../../../actions/CustomerActions';
import { updateUser } from '../../../../../actions/profileActions';
import { openGlobalSnackbar } from '../../../../../actions/snackBarAction';
import { fetchStatesByCountryId } from "../../../../../api/CustomerServices";
import { fetchCountries } from '../../../../../api/globalServices';
import profileServices from '../../../../../api/profileService';
import CloseAccount from './CloseAccount';
import EditProfileForm from './EditProfileForm';
import { _getDiffDate } from '../../../../../utils/globalMomentDateFunc';
import { profileSidebarLinksArray } from '../../../../../utils/common';


export const VeriffStatus = {
    NOT_REQUIRED: 'not_required',
    REQUIRED: 'required',
    CREATED: 'created',
    NOT_STARTED: 'not_started',
    STARTED: 'started',
    PENDING: 'pending',
    SUBMITTED: 'submitted',
    APPROVED: 'approved',
    DECLINED: 'declined',
    RESUBMISSION_REQUESTED: 'resubmission_requested',
    UNDER_REVIEW: 'review',
    EXPIRED: 'expired',
    ABANDONED: 'abandoned'
}

export const verificationStatusEnum = {
    [VeriffStatus.NOT_REQUIRED]: 'VERIFIED', // If verification is not requested by Admin, i.e. Verified
    [VeriffStatus.REQUIRED]: 'UNVERIFIED',
    [VeriffStatus.CREATED]: 'CREATED',
    [VeriffStatus.NOT_STARTED]: 'NOT STARTED',
    [VeriffStatus.STARTED]: 'STARTED',
    [VeriffStatus.PENDING]: 'PENDING',
    [VeriffStatus.SUBMITTED]: 'SUBMITTED',
    [VeriffStatus.UNDER_REVIEW]: 'UNDER REVIEW',
    [VeriffStatus.APPROVED]: 'VERIFIED',
    [VeriffStatus.DECLINED]: 'REJECTED',
    [VeriffStatus.RESUBMISSION_REQUESTED]: 'RESUBMISSION REQUESTED',
    [VeriffStatus.EXPIRED]: 'NOT STARTED', // If User doesn't start in 7 days after session creation
    [VeriffStatus.ABANDONED]: 'NOT STARTED', // If User start and doesn't complete in 7 days after session creation
}

class Profile extends Component {
    state = {
        userInput: {},
        profLoad: false,
        nameErr: false,
        lastNameErr: false,
        dobErr: false,
        dobMessage: '',
        postErr: false,
        stateErr: false,
        countryErr: false
    };

    componentWillMount() {
        document.title = "Finance - Your Profile";
        this._fetchFormData();


    }

    _fetchFormData = async () => {
        let id = localStorage.getItem('user.id')
        const countries = (await fetchCountries()).countries;
        //    const { businessInfo } = this.props;
        let userInput = (await profileServices.getUserById(id)).data.user;
        if (!!userInput && !!userInput.address && !!userInput.address.country) {
            this._fetchStates(userInput.address.country.id)
        }
        this.setState({
            countries,
            userInput: {
                ...userInput
            }
        })
    };

    _fetchStates = async (id) => {
        const states = await fetchStatesByCountryId(id);
        this.setState({
            states: states.states
        });
        this.props.setCountrytStates(states);
        return states
    };

    _handleText = async (e) => {
        const { name, value } = e.target;
        if (name === 'state') {
            let setValue = this.mapWithStates(value.id);
            this.setState({
                userInput: {
                    ...this.state.userInput,
                    address: {
                        ...this.state.userInput.address,
                        [name]: setValue
                    }
                },
                stateErr: false
            })
        } else if (name === 'country') {
            let setValue = this.mapWithCountry(value.id);
            let states = await this._fetchStates(value.id);
            this.setState({
                userInput: {
                    ...this.state.userInput,
                    address: {
                        ...this.state.userInput.address,
                        [name]: setValue,
                        state: {}
                    }
                },
                countryErr: false
            })
        } else if (name === 'postal' || name === 'city') {
            this.setState({
                userInput: {
                    ...this.state.userInput,
                    address: {
                        ...this.state.userInput.address,
                        [name]: value
                    }
                }
            })
            if (name === 'postal') {
                this.setState({ postErr: value.length >= 6 ? false : true })
            }
        } else if (name === 'dateOfBirth') {
            if (!!value) {
                let date = new Date(value);
                this.setState({
                    userInput: {
                        ...this.state.userInput,
                        [name]: date
                    }
                })
                if (_getDiffDate(new Date(), date, "months") >= 192) {
                    this.setState({
                        dobErr: false,
                        dobMessage: ''
                    })
                } else {
                    this.setState({
                        dobErr: true,
                        dobMessage: 'Age should not be less than 16 years old'
                    })
                }
            } else {
                this.setState({
                    userInput: {
                        ...this.state.userInput,
                        [name]: ''
                    },
                    dobErr: true,
                    dobMessage: 'This field is required'
                })
            }
        } else {
            this.setState({
                userInput: {
                    ...this.state.userInput,
                    [name]: value
                }
            })
        }
    };

    mapWithCountry = id => {
        let countries = this.state.countries;
        if (countries && countries.length > 0) {
            let countryObject = find(countries, { 'id': parseInt(id) });
            let countryObj = {
                name: countryObject.name,
                id: countryObject.id,
                sortname: countryObject.sortname ? countryObject.sortname : ''
            };
            return countryObj;
        }
        return {};
    };


    mapWithStates = (id, addressType) => {

        let countryStates = this.props.selectedCountryStates;
        if (countryStates && countryStates.length > 0) {
            let selectedState = countryStates.filter(item => {
                return item.id === id
            });
            let stateObject = selectedState[0];
            return stateObject;

        }
        return {};
    };

    _handleFormSubmit = async (e) => {
        e.preventDefault();
        const { firstName, lastName, dateOfBirth, address, postal, _id } = this.state.userInput;
        delete address["addressLine1"];
        delete address["addressLine2"];
        delete address["yearsAtAddress"];
        if (!firstName) {
            document.getElementById('firstName').focus()
            this.setState({ nameErr: true })
        } else {
            this.setState({ nameErr: false })
        }
        if (!lastName) {
            document.getElementById('lastName').focus()
            this.setState({ lastNameErr: true })
        } else {
            this.setState({ lastNameErr: false })
        }
        if (address) {
            if (!address.country.name) {
                this.setState({ countryErr: true })
            } else {
                this.setState({ countryErr: false })
            }
            if (!address.state.name) {
                this.setState({ stateErr: true })
            } else {
                this.setState({ stateErr: false })
            }
            // if (!address.postal || (address.postal && address.postal.length < 6)) {
            //     this.setState({ postErr: true })
            // } else {
            //     this.setState({ postErr: false })
            // }
        } else {
            this.setState({ countryErr: true })
            this.setState({ stateErr: true })
            this.setState({ postErr: true })
        }

        if (!!firstName && !!lastName && !!address.state.name && !this.state.dobErr) {
            this.setState({ profLoad: true })
            let userInput = {
                firstName,
                lastName,
                dateOfBirth,
                address
            };
            let response;
            try {
                response = await this.props.updateUser({ userInput: userInput });
                if (!!response) {
                    this.props.openGlobalSnackbar(response.message, false);
                } else {
                    this.props.openGlobalSnackbar(response.message, true);
                }
                this.setState({ profLoad: false })
            } catch (error) {
                this.setState({ profLoad: false })
                this.props.openGlobalSnackbar(error.message, true);
            }
        }
    };

    render() {
        let { params } = this.props;
        const { states, countries, userInput, profLoad, nameErr, lastNameErr, postErr, stateErr, dobErr, dobMessage, countryErr } = this.state;
        let verificationStatus = this.state.userInput?.identityVerification?.status;
        verificationStatus = verificationStatusEnum[verificationStatus] || verificationStatusEnum.not_started;
        return (
            <div className="py-frame__page has-sidebar">
                <MiniSidebar heading={'Profile'} listArray={profileSidebarLinksArray} />
                <div className="py-page__content">
                    <div className="py-page__inner personal_information">
                        <div className="py-header--page flex">
                            <div className="py-header--title">
                                <h2 className="py-heading--title">Personal Information</h2>
                            </div>
                            <div className='mt-4'>
                                <strong>Verification Status:</strong> <div className="statusSuccess ml-2">{verificationStatus}</div>
                            </div>
                        </div>

                        <p className="py-text">
                            Provide as much or as little information as you’d like. Finance will never share or sell individual personal information or personally identifiable details.
                        </p>

                        <EditProfileForm
                            handleText={this._handleText.bind(this)}
                            handleFormSubmission={this._handleFormSubmit.bind(this)}
                            states={states}
                            countries={countries}
                            userInput={userInput}
                            profLoad={profLoad}
                            nameErr={nameErr}
                            lastNameErr={lastNameErr}
                            stateErr={stateErr}
                            dobErr={dobErr}
                            countryErr={countryErr}
                            dobMessage={dobMessage}
                        />
                        <hr className="py-divider" />
                        <CloseAccount />
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    updateUser: state.updateUser,
    businessInfo: state.businessReducer.selectedBusiness,
    selectedCustomer: state.customerReducer.selectedCustomer,
    selectedCountryStates: state.customerReducer.selectedCountryStates,
    verification: state.verification.verification,
});

export default withRouter((connect(mapStateToProps, { updateUser, setCountrytStates, openGlobalSnackbar })(Profile)));

