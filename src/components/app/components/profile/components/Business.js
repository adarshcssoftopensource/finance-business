import React, { Component, Fragment } from 'react'
import { Button } from 'reactstrap';
import MiniSidebar from '../../../../../global/MiniSidebar'
import * as BusinessAction from "../../../../../actions/businessAction";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter, NavLink } from "react-router-dom";
import BusinessList from './BusinessList';
import ConfirmPrimary from './ConfirmPrimary';
import profilServices from '../../../../../api/profileService';
import BusinessService from '../../../../../api/businessService';
import { openGlobalSnackbar } from '../../../../../actions/snackBarAction';
import BusinessArchieveList from './BusinessArchieveList';
import { RestoreConfirmation } from './RestoreConfirmation';
import CenterSpinner from '../../../../../global/CenterSpinner';
import { logout } from '../../../../../utils/GlobalFunctions';
import { profileSidebarLinksArray } from '../../../../../utils/common';
class Business extends Component {
    state = {
        primary: false,
        primaryBusiness: '',
        loading: false,
        restoreConfirm: false,
        selectedRestore: null,
        archiveList: [],
        business: [],
        collaborater: [],
        initLoading: true
    }
    componentDidMount() {
        const { selectedBusiness } = this.props;
        this.fetchAll();
        document.title = "Finance - Your Businesses"
    }

    fetchAll = async () => {
        this.setState({ initLoading: true })
        let id = localStorage.getItem('user.id')
        const [business, users, archive] = await Promise.all([
            BusinessService.fetchBusiness(),
            profilServices.getUserById(id),
            BusinessService.fetchArchiveBusiness(),
        ]);
        await this.fetchBusiness(business);
        await this.fetchUser(users.data.user);
        await this.fetchArchive(archive);
        this.setState({ initLoading: false })
    }

    fetchBusiness = res => {
        try {
            if (!!res) {
                if (res.statusCode === 200) {
                    this.setState({
                        business: res.data.businesses.ownerAccess,
                        collaborater: res.data.businesses.collaboratorAccess,
                        businessLoad: false
                    })
                } else {
                    this.props.openGlobalSnackbar(res.message, true)
                }
            }
        } catch (err) {
            this.props.openGlobalSnackbar(err.message, true)
        }
    }

    fetchArchive = archive => {
        try {
            if (!!archive && archive.statusCode === 200) {
                this.setState({
                    archiveList: archive.data.businesses ? archive.data.businesses : []
                })
            } else {
                this.props.openGlobalSnackbar(archive.message, true)
            }
        } catch (err) {
            this.props.openGlobalSnackbar(err.message, true)
        }
    }

    fetchUser = response => {
        if (!!response) {
            this.setState({ primaryBusiness: response.primaryBusiness })
        }
    }

    _handleEdit = (e, id) => {
        e.preventDefault();
        this.props.history.push(`/app/accounts/business/${id}/edit`)
        // this.setState({openEdit})
    }


    _handleRemoveAccess = async ({ e, id }) => {
        e.preventDefault();
        const businessId = id
        const primaryBusiness = this.props.business.find((business) => business.isPrimary)
        const loggedInBusinessId = localStorage.getItem('businessId');
        try {
            let res;
            //If more than 1 businesss and trying to delete primary, show notification on it.
            if (this.props.business.length !== 1 && businessId === primaryBusiness._id) {
                this.props.openGlobalSnackbar("Primary business can't be archived, please make other business as your primary business first.", true);
                return;
            } else if (businessId === loggedInBusinessId) {
                //If trying to delete collaborator's own account
                res = await BusinessService.removeCollaboratorAccess();
            } else {
                //Previous condition
                res = await BusinessService.deleteBusinessById(businessId);
            }
            if (res && res.statusCode === 200) {
                this.props.openGlobalSnackbar(res.message, false);
                if (this.props.business.length !== 1) {
                    if (this.props.selectedBusiness._id !== businessId) {
                        const refresh = localStorage.getItem('refreshToken')
                        const selectedId = this.props.selectedBusiness._id === businessId ? null : this.props.selectedBusiness._id
                        this.props.actions.setSelectedBussiness(selectedId, refresh, true)
                    } else {
                        // const primaryBusinessId = this.props.business.find((business) => business.isPrimary)
                        this.props.actions.setSelectedBussiness(primaryBusiness._id)
                    }
                } else {
                    logout()
                }
            } else {
                this.props.openGlobalSnackbar(res.message, true)
            }
        } catch (error) {
            this.props.openGlobalSnackbar(error.message, true)
        }
    }

    _handlePrimary = (e, business) => {
        e.preventDefault();
        this.setState({ primary: true, business })
        // this.props.history.push(`/app/${this.props.params.userId}/accounts/business/${id}/primary`)
    }

    _setPrimary = async (e, id) => {
        e.preventDefault();
        let userId = this.props.params.userId
        if (!!id) {

            let data = {
                userInput: {
                    primaryBusiness: id
                }
            }
            try {
                this.setState({ loading: true })
                let response = await profilServices.updateUser(data, localStorage.getItem("user.id"))
                if (response.statusCode === 200) {
                    // localStorage.setItem('businessId', response.data.user.primaryBusiness)
                    this.setState({ primary: false, primaryBusiness: response.data.user.primaryBusiness })
                    // this.fetchBusiness()
                    this.fetchAll()
                    this.props.openGlobalSnackbar("Business set as default", false)
                    this.setState({ loading: false })
                    window.location.reload()
                } else {
                    this.setState({ loading: false })
                    this.props.openGlobalSnackbar("Something went wrong, please try again later.", true)
                }
            } catch (err) {
                this.setState({ loading: false })
                this.props.openGlobalSnackbar("Something went wrong, please try again later.", true)
            }
        }

    }

    _toggleRestoreConfrm = e => {
        this.setState({
            restoreConfirm: !this.state.restoreConfirm
        })
    }

    _setRestoreConfrm = (data, e) => {
        this._toggleRestoreConfrm();
        this.setState({
            selectedRestore: data
        })
    }

    _handleRestore = async e => {
        e.preventDefault();
        let restore = await BusinessService.restoreBusiness(this.state.selectedRestore.id);
        if (!!restore) {
            if (restore.statusCode === 200) {
                const { _id } = this.props.selectedBusiness
                this.props.openGlobalSnackbar(restore.message, false)
                const refresh = localStorage.getItem('refreshToken')
                this.props.actions.setSelectedBussiness(_id, refresh, false)
                this._toggleRestoreConfrm();
                this.fetchAll();
            } else {
                this.props.openGlobalSnackbar(restore.message, true)
            }
        }
    }



    render() {
        const { params, selectedBusiness, location } = this.props;
        const { selectedRestore, business, collaborater, restoreConfirm, primary, archiveList, initLoading,
            openConfimationModal } = this.state;
        return (
            <div id="business-list-wrap" className="py-frame__page py-frame__settings has-sidebar">

                <MiniSidebar heading={'Profile'} listArray={profileSidebarLinksArray} />

                <div className="py-page__content">
                    <div className="py-page__inner">
                        <header className="py-header--page">
                            <div className="ms-auto pull-right">
                                {
                                    primary || restoreConfirm ?
                                        ""
                                        : (
                                            <NavLink to={`${location.pathname}/add`}>
                                                <Button color="primary" > Create a business</Button>
                                            </NavLink>
                                        )
                                }
                            </div>
                            <div className="py-header--title">
                                <h2 className="py-heading--title">{restoreConfirm ? "Confirm" : "Businesses"}</h2>
                            </div>
                        </header>

                        {
                            this.state.primary ?
                                (<ConfirmPrimary  {...this.props}
                                    info={this.state.business}
                                    _cancelPrimary={() => {
                                        this.fetchAll()
                                        this.setState({ primary: false })
                                    }
                                    }
                                    _setPrimary={this._setPrimary.bind(this)}
                                    btnLoad={this.state.loading}
                                />)
                                : this.state.loading ? (<CenterSpinner />)
                                    : restoreConfirm ? (
                                        <RestoreConfirmation
                                            selected={selectedRestore}
                                            _toggleRestoreConfrm={this._toggleRestoreConfrm.bind(this)}
                                            restore={this._handleRestore.bind(this)}
                                        />) : (<Fragment>
                                            <BusinessList list={business}
                                                key={this.state.primary}
                                                selected={selectedBusiness}
                                                _handleEdit={this._handleEdit.bind(this)}
                                                _handlePrimary={this._handlePrimary.bind(this)}
                                                primary={this.state.primaryBusiness}
                                                showDel={false}
                                                {...this.props}
                                            />
                                            {!!initLoading ? <CenterSpinner /> :
                                                <Fragment>
                                                  { !!collaborater && collaborater.length > 0 && (
                                                    <Fragment>
                                                        <div>
                                                            <h2 className="py-heading--section-title">Collaborator</h2>
                                                        </div>
                                                        <BusinessList
                                                            list={collaborater}
                                                            selected={selectedBusiness}
                                                            _handleEdit={this._handleEdit.bind(this)}
                                                            _handlePrimary={this._handlePrimary.bind(this)}
                                                            primary={this.state.primaryBusiness}
                                                            showDel={true}
                                                            _handleRemoveAccess={this._handleRemoveAccess.bind(this)}
                                                            {...this.props}
                                                        />
                                                    </Fragment>
                                                )}
                                                { archiveList.length > 0 && (
                                                       <BusinessArchieveList
                                                        _setRestoreConfrm={this._setRestoreConfrm.bind(this)}
                                                        archiveList={archiveList}
                                                    />
                                                )}
                                                </Fragment>
                                            }

                                        </Fragment>)
                        }

                    </div>
                </div>

            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        business: state.businessReducer.business,
        selectedBusiness: state.businessReducer.selectedBusiness,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        actions: bindActionCreators(BusinessAction, dispatch),
        openGlobalSnackbar: (message, error) => {
            dispatch(openGlobalSnackbar(message, error));
        }
    };
};


export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(Business)
);