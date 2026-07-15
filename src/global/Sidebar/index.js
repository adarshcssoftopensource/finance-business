import moment from 'moment';
import history from '../../customHistory';
import React, { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { Link, NavLink, withRouter } from 'react-router-dom';
import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    UncontrolledTooltip
} from 'reactstrap';
import { bindActionCreators } from 'redux';
import { get, get as _get } from 'lodash';
import CenterSpinner from '../CenterSpinner';
import Icon from '../../components/common/Icon';
import * as BusinessAction from '../../actions/businessAction';
import {
    colormode,
    customerSupportTooltipText,
    handleAclPermissions,
    help,
    isDisableHelpButtonForStarterPlan,
    logout,
    privacyPolicy,
    terms
} from '../../utils/GlobalFunctions';
import { _getUser } from '../../utils/authFunctions';
import { STATIC_USER } from '../../utils/static-auth';
import { fetchPaymentSettings } from '../../actions/paymentSettings';
import { openGlobalSnackbar } from '../../actions/snackBarAction';
import MobileOtpVerify from '../MobileVerify';
import symbolsIcon from '../../assets/icons/product/symbols.svg';
import { getActiveSubscriptionPlan } from '../../actions/subscriptionActions';
import { signOutSelectedSession } from '../../actions/deviceSessionAction';
import { PAYOUT_DISABLE } from '../../utils/Provider.const';
import Main_Logo from "../../assets/logo/finance-logo.png"
import Finance_Icon from "../../assets/logo/finance-icon.png"
import badgeImg from '../../assets/icons/businessicon.svg';
/*import Abc from '../../assets/'*/
export let openBlocks = {
    salesOpen: false,
    contactsOpen: false,
    purchaseOpen: false,
    accountingOpen: false,
    comingsoonOpen: false,
    debitcardOpen: false,
    bankingOpen: false,
    payRollOpen: false
};
class Sidebar extends PureComponent {
    state = {
        activeSelected: '',
        modal: false,
        blockOpen: openBlocks,
        loading: false,
        selected: null,
        permissions: [],
        isOnboardingApplicable: false,
        filterCountry: '',
        openPhoneModal: false,
        userData: {},
        showChatWithSupport: true
    };


    async componentDidMount() {
        const blockOpen = JSON.parse(localStorage.getItem('sidebarToggleHistory'));
        const token = localStorage.getItem('token')
        const refresh = localStorage.getItem('refreshToken')
        const user = _getUser(token) || {}
        const tokenPermissions = user?.acl?.permissions
        const permissions =
            Array.isArray(tokenPermissions) && tokenPermissions.length > 0
                ? tokenPermissions
                : STATIC_USER.acl.permissions

        this.setState({
            userData: {
                ...STATIC_USER,
                ...user,
                acl: { permissions },
                primaryEmail: user.primaryEmail || STATIC_USER.primaryEmail,
            },
            permissions,
        })
        if (!!blockOpen) {
            this.setState({
                blockOpen
            })
        }
        const { selectedBusiness } = this.props;
        // Demo: never treat missing plan title as session expiry (causes random logouts)
        if (
          process.env.REACT_APP_MY_ENVIRONMENT !== 'development' &&
          selectedBusiness &&
          selectedBusiness.subscription &&
          !selectedBusiness.subscription.title
        ) {
            this.props.showSnackbar("Your session has been expired", true)
            this.onSignOut()
        }
        this.props.getActiveSubscriptionPlan()
        this.props.fetchPaymentSettings()
        this.fetchBusiness();
        document.title = selectedBusiness ? `Finance - ${selectedBusiness.organizationName} - Products & Services` : "Finance"
    }

    componentDidUpdate(nextProps, prevState) {
        const blockOpen = JSON.parse(localStorage.getItem('sidebarToggleHistory'));

        if (blockOpen !== prevState.blockOpen) {
            if (!!blockOpen) {
                // this.setState({
                //     blockOpen
                // })
            }
        }
        if (nextProps.paymentSettings !== prevState.paymentSettings) {
            if (!!prevState.paymentSettings) {
                if (nextProps.paymentSettings.data.isOnboardingApplicable !== prevState.paymentSettings.data.isOnboardingApplicable) {
                    this.setState({ isOnboardingApplicable: nextProps.paymentSettings.data.isOnboardingApplicable })
                }
            } else {
                this.setState({ isOnboardingApplicable: nextProps.paymentSettings.data.isOnboardingApplicable })
            }
        }
    }

    fetchBusiness = async () => {
        // let res = await this.props.actions.fetchBusiness();
        this.setState({
            selected: localStorage.getItem('businessId')
        })
    };
    toggle = () => {
        this.setState(prevState => { return { activeSelected: !prevState.activeSelected } });
    };

    sideToggle = () => {
        this.setState(prevState => {
            return { modal: !prevState.modal }
        });
    };

    onSignOut = async () => {
        try {
            const {
                deviceSession: { sessions: { allUserSession = [] } = {} } = {},
                signOutSelectedSession
            } = this.props;
            const currentSession = (allUserSession || []).filter((value) => value.isCurrent);
            if (currentSession.length && signOutSelectedSession) {
                const payload = {
                    type: "single",
                    payload: {
                        status: "expired",
                        isDeleted: true
                    }
                };
                signOutSelectedSession(currentSession[0]._id, payload);
            }
        } catch (e) {
            /* ignore session cleanup errors in demo */
        }
        await logout()
    };

    changeBusiness = async (e, business) => {
        this.setState({ loader: true });
        let userId = localStorage.getItem('user.id');
        let res = await this.props.actions.setSelectedBussiness(business._id);
        if (res.type == 'SELECTED_BUSINESS') {
            this.setState({
                selected: res.selectedBusiness._id,
                blockOpen: {
                    ...openBlocks
                }
            })
        }
        localStorage.removeItem('sidebarToggleHistory');
        this.setState({ loader: true });
        this.sideToggle();
        window.location.href = `${process.env.REACT_APP_WEB_URL}/app/dashboard`
    };

    handleSearchInput = e => {
        this.setState({
            filterCountry: e.target.value
        })
    }

    businessItems() {
        const { business, selectedBusiness } = this.props;
        const list = (Array.isArray(business) && business.length
          ? business
          : selectedBusiness
            ? [selectedBusiness]
            : []
        ).filter(Boolean)
        const filterBusiness = list.filter(val =>
            (val.organizationName || val.name || '')
                .toLowerCase()
                .includes((this.state.filterCountry || '').toLowerCase())
        )
        let primary = localStorage.getItem('businessId');
        if (!filterBusiness.length) {
            return null
        }
        return filterBusiness.map((item, i) => {
            return (
                <li key={'4.' + i} onClick={e => this.changeBusiness(e, item)} className={`menu-item ${item.role !== 'Owner' ? "owner" : ""} ${!!primary ? item._id === primary ? "is-current" : "" : ""}`} >
                    <a href="javascript:void(0)" className={`item-link`}>
                        {/* Business-Name */}
                        <span className={`business-title`}>
                            {item.organizationName || item.name}
                        </span>
                        {item.isSubscribed && <span className="paid-badge px-1" ><img src={badgeImg} alt="badge" /></span>}
                        {/* User-Role */}
                        {item.role !== 'Owner' && <span className="badge badge-info" >{item.role}</span>}
                        <span className="role-check" >
                            {/* Active-User-Check */}
                            {!!primary
                                ? item._id === primary ? <span className="check-icon"><i className="fal fa-check" aria-hidden="true"></i></span> : ""
                                : ""
                            }
                        </span>
                    </a>
                </li>
            );
        });
    }

    createNewBusiness = (e) => {
        if (e) {
          e.preventDefault()
          e.stopPropagation()
        }
        this.setState({ modal: false }, () => {
          history.push(`/app/accounts/business/add`)
        })
    };

    _toggle = (from) => {
        let blockOpen = {
            ...openBlocks,
            [`${from}Open`]: !this.state.blockOpen[`${from}Open`]
        };
        this.setState({
            blockOpen
        });
        localStorage.setItem("sidebarToggleHistory", JSON.stringify(blockOpen))
    };

    _toggleStop = (from) => {
        this.setState({
            blockOpen: {
                ...openBlocks,
                [from]: true
            }
        })
    };

    componentWillReceiveProps(nextProps) {
        if (this.props.selectedBusiness !== nextProps.selectedBusiness) {
            this.setState({ loader: false })
        }
    }

    checkUserMobileValidation = () => {
        const user = this.state.userData;
        // if(user && user.securityCheck && !user.securityCheck.mobileVerified) {
        //     this.setState({
        //         openPhoneModal: true
        //     })
        // } if(user && user.securityCheck && !user.securityCheck.emailVerified){
        //     this.props.showSnackbar("Please verify your email, to use this feature", true)
        // } else {
        if (window.CRISP_WEBSITE_ID) {
            window.$crisp.push(['do', 'chat:open'])
        } else {
            help();
        }
        // }
    }

    closePhoneModal = () => {
        this.setState({
            openPhoneModal: false
        })
    }

    handleVerifyOtp = () => {
        const token = localStorage.getItem('token')
        const user = _getUser(token);
        this.setState({
            userData: user
        })
        help();
    }

    handleActiveClass = (status) => {
        const statusParams = new URLSearchParams(this.props.location.search)
        switch (statusParams.get("status")) {
            case "failed":
                if (status === "failed") {
                    return 'is-active'
                } else {
                    return "not-active"
                }
                break;
            case "refund":
                if (status === "refund") {
                    return 'is-active'
                } else {
                    return "not-active"
                }
                break;
            case "payout":
                if (status === "payout") {
                    return 'is-active'
                } else {
                    return "not-active"
                }
                break;
            case "disputes":
                if (status === "disputes") {
                    return 'is-active'
                } else {
                    return "not-active"
                }
                break;

            default:
                if (status === "success") {
                    return 'is-active'
                } else {
                    return "not-active"
                }
                break;
        }
    }

    render() {
        const {
            selectedBusiness,
            business,
            paymentSettings: { loading, data },
            isRewardEnabled,
            isReportsEnabled,
            isDebitCardEnabled,
            isSubscriptionCreateAllowed: propsIsSubscriptionCreateAllowed,
            isSubscriptionUpdateAllowed: propsIsSubscriptionUpdateAllowed,
        } = this.props
        const { permissions, openPhoneModal, userData } = this.state
        const { salesOpen, purchaseOpen, contactsOpen, accountingOpen, comingsoonOpen, debitcardOpen, bankingOpen, payRollOpen } = !!JSON.parse(localStorage.getItem('sidebarToggleHistory')) ? JSON.parse(localStorage.getItem('sidebarToggleHistory')) : this.state.blockOpen;
        const activePlanLevel = this.props.activeSubscription?.current?.planLevel;
        const activePlanName = this.props?.activeSubscription?.current?.planId?.title || 'NA'
        let buildVersion = `${process.env.BUILD_VERSION || 'dev'} - ${moment.unix(localStorage.getItem('expiryToken')).format('hh:mm:ss')}`;

        let userId = localStorage.getItem("user.id");
        let businessId = localStorage.getItem("businessId");
        const businessList = Array.isArray(business) ? business : []
        let primary = businessList.length > 0
          ? businessList.filter(item => item._id === businessId)
          : []
        const businessName =
          (primary.length > 0 && (primary[0].organizationName || primary[0].name)) ||
          selectedBusiness?.organizationName ||
          selectedBusiness?.name ||
          "Finance";
        const signedInEmail =
          localStorage.getItem('user.email') ||
          '';
        let boxClass = ["nav-dropdown-items nav-dropdown"];
        if (this.state.activeSelected) {
            boxClass.push('open');
        }
        const isViewer = handleAclPermissions(['Viewer'])
        const isOwner = handleAclPermissions(['Owner'])
        const subscriptionPlan = _get(selectedBusiness, "subscription.planLevel", 1);
        const isChatButtonDisable = isDisableHelpButtonForStarterPlan(subscriptionPlan);

        const isSubscriptionCreateAllowed = propsIsSubscriptionCreateAllowed && subscriptionPlan === 1;
        const isSubscriptionUpdateAllowed = propsIsSubscriptionUpdateAllowed && subscriptionPlan > 1;
        const isModifyPlanAllowed = isSubscriptionCreateAllowed || isSubscriptionUpdateAllowed;

        const isPayoutHidden = false; // PAYOUT_DISABLE[this.props?.selectedBusiness?.provider];

        return (
            <div className="side-nav">
                <div className="side-toggle" onClick={this.sideToggle} data-backdrop="false">
                    <div className="logo">
                        <img src={Finance_Icon} alt="Finance" />
                    </div>
                    <span className="business-name">{businessName}</span>
                    <span className="right-icon"><i className="fas fa-chevron-right"></i></span>
                </div>

                {
                    this.state.loader ?
                        (<Modal className="business-loader" isOpen={this.state.loader}><CenterSpinner /></Modal>)
                        : (
                            <div className={`nav-wrapper main-nav-wrapper ${isOwner && "plan-active"} ${activePlanLevel === 1 && "plan-starter"}`} >
                                <ul className="nav nav-main">
                                    {/*<li className="nav-item">
                                  <NavLink exact={true} className="nav-link" activeclassname='is-active'
                                    to='/app/launchpad/'>
                                    <Icon
                                        className="Icon"
                                        xlinkHref="/assets/icons/product/symbols.svg#nav--discover"
                                    />
                                    <span className="Nav__text">Launchpad</span>
                                  </NavLink>
                              </li>*/}
                                    <li className="nav-item">
                                        <NavLink exact={true} className="nav-link" activeclassname='is-active'
                                            to='/app/dashboard'>
                                            <Icon
                                                className="Icon"
                                                xlinkHref={`${symbolsIcon}#nav--dashboard`}
                                            />
                                            <span className="Nav__text">Dashboard</span>
                                        </NavLink>
                                    </li>
                                    {/* <li className="nav-item">
                                        <a onClick={this._toggle.bind(this, 'contacts')} className={contactsOpen ? "nav-link selected" : "nav-link"} activeclassname='is-active' href='javascript: void(0)'>
                                            <Icon
                                                className="Icon"
                                                xlinkHref="../../assets/icons/product/symbols.svg#nav--contacts"
                                            />
                                            <span className="Nav__text">Contacts</span>
                                            <span className="arrow">
                                                <i className={contactsOpen ? 'fas fa-chevron-up' : 'fas fa-chevron-up open'}></i>
                                            </span>
                                        </a>
                                        <div className={`sub-menu-item ${contactsOpen ? 'is-show' : 'is-hide'}`} >
                                            <ul className="Sidebar__subnav" onClick={this._toggleStop.bind(this, 'contactsOpen')}>
                                                <li className="nav-item">
                                                    <NavLink className="nav-link" activeclassname='is-active' to='/app/sales/customer'>
                                                        <span className="title">Customers</span>
                                                    </NavLink>
                                                </li>
                                                <li className="nav-item">
                                                    <NavLink className="nav-link" activeclassname='is-active' to="/app/purchase/vendors">
                                                        <span className="title">Vendors</span>
                                                    </NavLink>
                                                </li>
                                            </ul>
                                        </div>
                                    </li> */}

                                    {permissions.length > 0 && (
                                        <Fragment>

                                            <li className="nav-item">
                                                <a onClick={this._toggle.bind(this, 'sales')} className={salesOpen ? "nav-link selected" : "nav-link"} activeclassname='is-active' href='javascript: void(0)'>
                                                    <Icon
                                                        className="Icon"
                                                        xlinkHref={`${symbolsIcon}#nav--sales-4`}
                                                    />
                                                    <span className="Nav__text">Sales</span>
                                                    <span className="arrow">
                                                        <i className={salesOpen ? 'fas fa-chevron-up' : 'fas fa-chevron-up open'}></i>
                                                    </span>
                                                </a>
                                                <div className={`sub-menu-item ${salesOpen ? 'is-show' : 'is-hide'}`} >
                                                    <ul className="Sidebar__subnav">
                                                        <li className="nav-item">
                                                            <NavLink className="nav-link" activeclassname='is-active' to='/app/estimates'>
                                                                <span className="title">Estimates</span>
                                                            </NavLink>
                                                        </li>
                                                        {
                                                            permissions.find((per) => {
                                                                return per.resource === 'invoices' && per.allowed
                                                            }) && (
                                                                <li className="nav-item">
                                                                    <NavLink className="nav-link" activeclassname='is-active' to='/app/invoices'>
                                                                        <span className="title">Invoices</span>
                                                                    </NavLink>
                                                                </li>
                                                            )
                                                        }
                                                        <li className="nav-item">
                                                            <NavLink className="nav-link" activeclassname='is-active' to="/app/recurring" >
                                                                <span className="menu-badge beta-badge">Beta</span>
                                                                <span className="title">Recurring Invoices</span>
                                                            </NavLink>
                                                        </li>
                                                        {
                                                            !isViewer && (
                                                                <li className="nav-item">
                                                                    <NavLink className="nav-link" activeclassname='is-active' to="/app/sales/checkouts">
                                                                        {/* <span className="menu-badge new-badge">New</span> */}
                                                                        <span className="title">Checkouts</span>
                                                                    </NavLink>
                                                                </li>
                                                            )
                                                        }

                                                        <li className="nav-item">
                                                            <NavLink className="nav-link" activeclassname='is-active' to='/app/sales/products'>
                                                                <span className="title"> Products &amp; Services</span>
                                                            </NavLink>
                                                        </li>
                                                        <li className="nav-item">
                                                            <NavLink exact={true} className="nav-link" activeclassname='is-active' to="/app/sales/customerstatements">
                                                                <span className="title">Customer Statements</span>
                                                            </NavLink>
                                                        </li>
                                                        <li className="nav-item">
                                                            <NavLink className="nav-link" activeclassname='is-active' to='/app/sales/customer'>
                                                                <span className="title">Customers</span>
                                                            </NavLink>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </li>
                                            {/* <li className="nav-item">
                                                    <NavLink exact={true} className="nav-link" activeclassname='is-active'
                                                        to='/app/finix-payment-onboarding'><Icon
                                                            className="Icon"
                                                            xlinkHref="../../assets/icons/product/symbols.svg#nav--peyme"
                                                        />
                                                        <span className="Nav__text">Finix Payment On Boarding</span>
                                                    </NavLink>
                                                </li> */}
                                            {/* {
                                                    permissions.find((per) => {
                                                        return per.resource === 'banking' && per.allowed
                                                    }) && (
                                                        <li className="nav-item">
                                                            <a onClick={this._toggle.bind(this, 'banking')} className={bankingOpen ? "nav-link selected" : "nav-link"} activeclassname='is-active' href='javascript: void(0)'>
                                                                <Icon
                                                                    className="Icon"
                                                                    xlinkHref="../../assets/icons/product/symbols.svg#nav--banking"
                                                                />
                                                                <span className="Nav__text">Banking</span>
                                                                <span className="arrow">
                                                                    <i className={bankingOpen ? 'fas fa-chevron-up' : 'fas fa-chevron-up open'}></i>
                                                                </span>
                                                            </a>
                                                            <div className={`sub-menu-item ${ bankingOpen ? 'is-show' : 'is-hide' }`} >
                                                                <ul className="Sidebar__subnav" onClick={this._toggleStop.bind(this, 'bankingOpen')}>
                                                                    <li className="nav-item">
                                                                        <NavLink className="nav-link" activeclassname='is-active' to="/app/banking/bankconnections">
                                                                            <span className="title">Bank Connections</span>
                                                                        </NavLink>
                                                                    </li>
                                                                    {this.state.isOnboardingApplicable && <li className="nav-item">
                                                                        <NavLink className="nav-link" activeclassname='is-active' to="/app/banking/payouts">
                                                                            <span className="title">Payouts</span>
                                                                        </NavLink>

                                                                    </li>}
                                                                    <li className="nav-item">
                                                                        <a className="nav-link" activeclassname='is-active' href="javascript:void(0)">
                                                                            <span className="title">Insurance</span>
                                                                        </a>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </li>
                                                    )
                                                } */}
                                            {!isViewer &&
                                                permissions.find((per) => {
                                                    return per.resource === 'payments' && per.allowed
                                                }) && (

                                                    <li className="nav-item">
                                                        <NavLink onClick={this._toggle.bind(this, 'banking')} exact to={{ pathname: "/app/payments/", search: "status=success" }} className={bankingOpen ? "nav-link selected" : "nav-link"} activeclassname='is-active' >
                                                            <Icon
                                                                className="Icon"
                                                                xlinkHref={`${symbolsIcon}#nav--payemnt`}
                                                            />
                                                            <span className="Nav__text">Payments</span>
                                                            <span className="arrow">
                                                                <i className={bankingOpen ? 'fas fa-chevron-up' : 'fas fa-chevron-up open'}></i>
                                                            </span>
                                                        </NavLink>
                                                        <div className={`sub-menu-item ${bankingOpen ? 'is-show' : 'is-hide'}`} >
                                                            <ul className="Sidebar__subnav" onClick={this._toggleStop.bind(this, 'bankingOpen')}>
                                                                {!isViewer &&
                                                                    permissions.find((per) => {
                                                                        return per.resource === 'payments' && per.allowed
                                                                    }) && (
                                                                        <li className={`nav-item ${this.handleActiveClass("success")}`}>
                                                                            <NavLink className="nav-link" exact to={{ pathname: "/app/payments/", search: "status=success" }}>
                                                                                <span className="title">Successful</span>
                                                                            </NavLink>
                                                                        </li>
                                                                    )
                                                                }
                                                                {!isViewer &&
                                                                    permissions.find((per) => {
                                                                        return per.resource === 'payments' && per.allowed
                                                                    }) && (<li className={`nav-item ${this.handleActiveClass("failed")}`}>
                                                                        <NavLink className="nav-link" exact to={{ pathname: "/app/payments/", search: "status=failed" }}>
                                                                            <span className="title">Failed</span>
                                                                        </NavLink>
                                                                    </li>)}
                                                                {!isViewer &&
                                                                    permissions.find((per) => {
                                                                        return per.resource === 'payments' && per.allowed
                                                                    }) && (<li className={`nav-item ${this.handleActiveClass("refund")}`}>
                                                                        <NavLink className="nav-link" exact to={{ pathname: "/app/payments/", search: "status=refund" }}>
                                                                            <span className="title">Refunds</span>
                                                                        </NavLink>
                                                                    </li>)}
                                                                {/* {!isViewer && !isPayoutHidden &&
                                                                permissions.find((per) => {
                                                                    return per.resource === 'payments' && per.allowed
                                                                }) && (<li className={`nav-item ${this.handleActiveClass("payout")}`}>
                                                                <NavLink className="nav-link" exact to={{pathname:"/app/payments/", search:"status=payout"}}>
                                                                    <span className="title">Payouts</span>
                                                                </NavLink>
                                                            </li>)} */}
                                                                {!isViewer && _get(data, "onBoardingRules.isDisputeEnabled", false) &&
                                                                    permissions.find((per) => {
                                                                        return per.resource === 'payments' && per.allowed
                                                                    }) && (<li className={`nav-item ${this.handleActiveClass("disputes")}`}>
                                                                        <NavLink className="nav-link" exact to={{ pathname: "/app/payments/", search: "status=disputes" }}>
                                                                            <span className="title">Disputes</span>
                                                                        </NavLink>
                                                                    </li>)}
                                                            </ul>
                                                        </div>
                                                    </li>)}
                                            <li className="nav-item">
                                                <NavLink className="nav-link" activeclassname='is-active'
                                                    to='/app/payyitme'><Icon
                                                        className="Icon"
                                                        xlinkHref={`${symbolsIcon}#nav--peyme`}
                                                    />
                                                    <span className="Nav__text">My Finance.Me Lynk</span>
                                                </NavLink>
                                            </li>

                                            <li className="nav-item">
                                                <NavLink exact={true} className="nav-link" activeclassname='is-active' to='/app/give'>
                                                    <Icon
                                                        className="Icon"
                                                        xlinkHref={`${symbolsIcon}#ic-give`}
                                                    />
                                                    <span className="Nav__text">Give</span>
                                                </NavLink>
                                            </li>
                                            <li className="nav-item">
                                                <a onClick={this._toggle.bind(this, 'purchase')} className={purchaseOpen ? "nav-link selected" : "nav-link"} activeclassname='is-active' href='javascript: void(0)'>
                                                    {/* <svg viewBox="0 0 26 26" className="Icon__M" id="nav--purchases" xmlns="http://www.w3.org/2000/svg"><path d="M8.395 15.007h11.793c.413 0 .777-.29.896-.712l2.045-7.288H7.646l.749 8zm-1.18-10H23.13c1.033 0 1.871.896 1.871 2 0 .195-.027.389-.079.575l-2.045 7.287c-.356 1.27-1.449 2.138-2.688 2.138H7.548c-.48 0-.883-.389-.93-.9l-.936-10a1.093 1.093 0 0 1-.003-.032L4.227 4H1.88C1.394 4 1 3.552 1 3s.394-1 .88-1h2.64c.047 0 .092.004.137.012a.934.934 0 0 1 .74.399l1.819 2.596zM10 24a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm9 2a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path></svg> */}
                                                    <Icon
                                                        className="Icon"
                                                        xlinkHref={`${symbolsIcon}#nav--purchase`}
                                                    />
                                                    <span className="Nav__text">Purchases</span>
                                                    <span className="arrow">
                                                        <i className={purchaseOpen ? 'fas fa-chevron-up' : 'fas fa-chevron-up open'}></i>
                                                    </span>
                                                </a>
                                                <div className={`sub-menu-item ${purchaseOpen ? 'is-show' : 'is-hide'}`} >
                                                    <ul className="Sidebar__subnav" onClick={this._toggleStop.bind(this, 'purchaseOpen')}>
                                                        <li className="nav-item">
                                                            <NavLink className="nav-link" activeclassname='is-active' to='/app/purchase/bills'>
                                                                <span className="title">Bills</span>
                                                            </NavLink>
                                                        </li>
                                                        <li className="nav-item">
                                                            <NavLink className="nav-link" activeclassname='is-active'
                                                                to='/app/purchase/receipts'>
                                                                <span className="title">Receipts</span>
                                                            </NavLink>
                                                        </li>
                                                        <li className="nav-item">
                                                            <NavLink className="nav-link" activeclassname='is-active' to="/app/purchase/vendors">
                                                                <span className="title">Vendors</span>
                                                            </NavLink>
                                                        </li>
                                                        <li className="nav-item">
                                                            <NavLink className="nav-link" activeclassname='is-active' to="/app/purchase/products">
                                                                <span className="title">Products & Services</span>
                                                            </NavLink>
                                                        </li>

                                                    </ul>
                                                </div>
                                            </li>
                                            <li className="nav-item">
                                                {isReportsEnabled &&
                                                    <NavLink exact={true} className="nav-link" activeclassname='is-active' to={'/app/reports'}>
                                                        <Icon
                                                            className="Icon"
                                                            xlinkHref={`${symbolsIcon}#nav--reports-2`}
                                                        />
                                                        <span className="Nav__text">Reports</span>
                                                    </NavLink>
                                                }
                                            </li>
                                            {/* <li className="nav-item">
                                                <a onClick={this._toggle.bind(this, 'payRoll')} className="nav-link" activeclassname='is-active' href='javascript: void(0)'>
                                                <Icon
                                                    className="Icon"
                                                    xlinkHref="../../assets/icons/product/symbols.svg#nav--payroll"
                                                />
                                                    <span className="Nav__text">Payroll</span>
                                                    <span className="arrow">
                                                        <i className={payRollOpen ? 'fas fa-chevron-up' : 'fas fa-chevron-up open'}></i>
                                                    </span>
                                                </a>
                                                <div className={`sub-menu-item ${ payRollOpen ? 'is-show' : 'is-hide' }`} >
                                                    <ul className="Sidebar__subnav" onClick={this._toggleStop.bind(this, payRollOpen)}>
                                                        <li className="nav-item">
                                                            <a className="nav-link" activeclassname='is-active' href='javascript:void(0)'>
                                                                <span className="title">Run Payroll</span>
                                                            </a>
                                                        </li>
                                                        <li className="nav-item">
                                                            <a  className="nav-link" activeclassname='is-active' href='javascript:void(0)'>
                                                                <span className="title">Employees</span>
                                                            </a>
                                                        </li>
                                                        <li className="nav-item">
                                                            <a  className="nav-link" activeclassname='is-active' href="javascript:void(0)">
                                                                <span className="title">Timesheets</span>
                                                            </a>
                                                        </li>
                                                        <li className="nav-item">
                                                            <a  className="nav-link" activeclassname='is-active' href="javascript:void(0)">
                                                                <span className="title">Tax/VAT</span>
                                                            </a>
                                                        </li>
                                                        <li className="nav-item">
                                                            <a  className="nav-link" activeclassname='is-active' href="javascript:void(0)">
                                                                <span className="title">Tax Forms</span>
                                                            </a>
                                                        </li><li className="nav-item">
                                                            <a  className="nav-link" activeclassname='is-active' href="javascript:void(0)">
                                                                <span className="title">Direct Deposite</span>
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </li> */}
                                            {/*<li className="nav-item">
                                            <a className="nav-link" activeclassname='is-active' to='/app/setting/invoice-customization' href="javascript: void(0)">
                                            <Icon
                                                className="Icon"
                                                xlinkHref="../../assets/icons/product/symbols.svg#nav--reports"
                                            />
                                                <span className="title">Reports</span>
                                            </a>
                                        </li>*/}
                                            {/*<li className="nav-item">
                                            <NavLink className="nav-link extra-Link" to='/app/paymentPlus'>
                                                <Icon
                                                    className="Icon"
                                                    xlinkHref="../../assets/icons/product/symbols.svg#nav--payyit-plus"
                                                />
                                                <span className="title extraLink">Payyit Plus</span>
                                            </NavLink>
                                        </li>*/}

                                            {/* {
                                                isDebitCardEnabled && _get(selectedBusiness, "currency.code",  "") === "USD" &&
                                                <li className="nav-item">
                                                    <NavLink exact={true} className="nav-link" activeclassname='is-active' to='/app/debitcard'>
                                                        <Icon className="Icon" xlinkHref={`${symbolsIcon}#nav--debit-card`} />
                                                        <span className="Nav__text">Blue Visa Debit</span>
                                                    </NavLink>
                                                </li>
                                            } */}

                                            {/* {
                                                isRewardEnabled &&
                                                <li className="nav-item">
                                                    <NavLink exact={true} className="nav-link" activeclassname='is-active' to='/app/reward/reward'>
                                                        <Icon
                                                            className="Icon"
                                                            xlinkHref={`${symbolsIcon}#nav--reward`}
                                                        />
                                                        <span className="Nav__text">Membership Rewards</span>
                                                    </NavLink>
                                                </li>
                                            } */}
                                            <li className="nav-item">
                                                <NavLink exact={true} className="nav-link" activeclassname='is-active' to='/app/advisors/advisors'>
                                                    <Icon
                                                        className="Icon"
                                                        xlinkHref={`${symbolsIcon}#nav--advisor`}
                                                    />
                                                    <span className="Nav__text">Advisors</span>
                                                </NavLink>
                                            </li>
                                            {/* <li className="nav-item">
                                                <NavLink className="nav-link" activeclassname='is-active' to="/app/sales/mobile-landing-page">
                                                    <Icon
                                                        className="Icon"
                                                        xlinkHref={`${symbolsIcon}#app-file`}
                                                    />
                                                    <span className="Nav__text">Mobile App</span>
                                                </NavLink>
                                            </li> */}
                                            {/* <li className="nav-item">
                                                <a href="https://shop-with-peymynt.myshopify.com/" target="_blank" className="nav-link" activeclassname='is-active' >
                                                    <Icon
                                                        className="Icon"
                                                        xlinkHref={`${symbolsIcon}#nav--shop`}
                                                    />
                                                    <span className="Nav__text">Shop With Payyit</span>
                                                </a>
                                            </li>
                                            {/* <li className="nav-item">
                                                <a href={`${process.env.REACT_APP_PUBLIC_BASE_URL}/checkout/chk_Up8fclW9Qs`} target="_blank" className="nav-link" activeclassname='is-active' >
                                                    <Icon
                                                        className="Icon"
                                                        xlinkHref="../../assets/icons/product/symbols.svg#nav--investment"
                                                    />
                                                    <span className="Nav__text">Invest in Payyit</span>
                                                </a>
                                            </li> */}
                                            <div className="nav-divider"></div>
                                            <li className="nav-item comingsoon">
                                                <a onClick={this._toggle.bind(this, 'comingsoon')} className={comingsoonOpen ? "nav-link selected" : "nav-link"} activeclassname='is-active' href='javascript: void(0)'>
                                                    <Icon
                                                        className="Icon"
                                                        xlinkHref={`${symbolsIcon}#nav--comming_soon`}
                                                    />
                                                    <span className="Nav__text">Coming Soon</span>
                                                    <span className="arrow">
                                                        <i className={comingsoonOpen ? 'fas fa-chevron-up' : 'fas fa-chevron-up open'}></i>
                                                    </span>
                                                </a>
                                                <div className={`sub-menu-item ${comingsoonOpen ? 'is-show' : 'is-hide'}`} >
                                                    <ul className="Sidebar__subnav" onClick={this._toggleStop.bind(this, 'comingsoonOpen')}>
                                                        <li className="nav-item">
                                                            <NavLink className="nav-link" activeclassname='is-active' to="/app/coming-soon/appointments" >
                                                                <span className="title">Appointments</span>
                                                            </NavLink>
                                                        </li>
                                                        <li className="nav-item">
                                                            <NavLink className="nav-link" activeclassname='is-active' to="/app/coming-soon/banking" >
                                                                <span className="title">Banking</span>
                                                            </NavLink>
                                                        </li>
                                                        {/* <li className="nav-item">
                                                                <NavLink className="nav-link" activeclassname='is-active' to="/app/coming-soon/chargeback-insurance" >
                                                                    <span className="title">Chargeback Insurance</span>
                                                                </NavLink>
                                                            </li> */}
                                                        {/* <li className="nav-item">
                                                                <NavLink className="nav-link" activeclassname='is-active' to="/app/coming-soon/creditreporting" >
                                                                    <span className="title">Credit Reporting</span>
                                                                </NavLink>
                                                            </li> */}
                                                        <li className="nav-item">
                                                            <NavLink className="nav-link" activeclassname='is-active' to="/app/coming-soon/cryptocurrency" >
                                                                <span className="title">Cryptocurrency</span>
                                                            </NavLink>
                                                        </li>
                                                        <li className="nav-item">
                                                            <NavLink className="nav-link" activeclassname='is-active' to="/app/coming-soon/insurance" >
                                                                <span className="title">Insurance</span>
                                                            </NavLink>
                                                        </li>
                                                        <li className="nav-item">
                                                            <NavLink className="nav-link" activeclassname='is-active' to="/app/coming-soon/integrations" >
                                                                <span className="title">Integrations</span>
                                                            </NavLink>
                                                        </li>
                                                        {/* <li className="nav-item">
                                                                <NavLink className="nav-link" activeclassname='is-active' to='/app/sales/mobile-landing-page'>
                                                                    <span className="title">iOS and Android App</span>
                                                                </NavLink>
                                                            </li> */}
                                                        <li className="nav-item">
                                                            <NavLink className="nav-link" activeclassname='is-active' to="/app/coming-soon/mynt-club" >
                                                                <span className="title">Mynt Club</span>
                                                            </NavLink>
                                                        </li>
                                                        {/* <li className="nav-item">
                                                                <NavLink className="nav-link" activeclassname='is-active' to="/app/coming-soon/p2p-transfers" >
                                                                    <span className="title">P2P Transfers</span>
                                                                </NavLink>
                                                            </li> */}
                                                        <li className="nav-item">
                                                            <NavLink className="nav-link" activeclassname='is-active' to="/app/coming-soon/payroll" >
                                                                <span className="title">Payroll</span>
                                                            </NavLink>
                                                        </li>
                                                        {/* <li className="nav-item">
                                                                <NavLink className="nav-link" activeclassname='is-active' to="/app/coming-soon/recurring" >
                                                                    <span className="title">Recurring Invoices</span>
                                                                </NavLink>
                                                            </li> */}
                                                        <li className="nav-item">
                                                            <NavLink className="nav-link" activeclassname='is-active' to="/app/coming-soon/reviews" >
                                                                <span className="title">Reviews</span>
                                                            </NavLink>
                                                        </li>

                                                    </ul>
                                                </div>
                                            </li>

                                            {/*<div className="nav-divider"></div>
                                                <li className="nav-item">
                                                    <NavLink className="nav-link extra-Link" to='/app/paymentPlus'>
                                                        <Icon
                                                            className="Icon"
                                                            xlinkHref="../../assets/icons/product/symbols.svg#nav--payyit-plus"
                                                        />
                                                        <span className="title extraLink">Payyit Plus</span>
                                                    </NavLink>
                                                </li>*/}
                                        </Fragment>
                                    )
                                    }

                                    {/*<li className="nav-item no-icon">
                                  <a className="nav-link extra-Link" href="javascript:void(0)">
                                    <Icon
                                        className="Icon"
                                        xlinkHref="../../assets/icons/product/symbols.svg#nav--integrations"
                                    />
                                    <span className="title extraLink">Integrations</span>
                                  </a>
                              </li>
                              <li className="nav-item no-icon pb-4">
                                  <NavLink className="nav-link extra-Link" activeclassname='is-active' to='/app/setting/invoice-customization'>
                                    <Icon
                                        className="Icon"
                                        xlinkHref="../../assets/icons/product/symbols.svg#nav--settings"
                                    />
                                  <span className="title extraLink">Settings</span>
                                  </NavLink>
                              </li>*/}
                                </ul>
                            </div>

                        )
                }
                {
                    (<div className="nav-wrapper footer-nav-wrapper">
                        {/* <div className="plan-switch bg-primary ">
                            <a href="https://payyitinc.tapfiliate.com" target="_blank" className="btn btn-link p-0 text-white" >Refer new users to Payyit &amp; get paid</a>
                        </div> */}
                        {isOwner && <div className="plan-switch">
                            <div className={`switch-header ${activePlanLevel !== 1 ? 'mb-0' : ''}`}>Your plan: <strong>
                                {isModifyPlanAllowed || subscriptionPlan > 1 ?
                                    <Link to={activePlanLevel === 1 ? "/app/setting/subscription-plans" : "/app/setting/subscription-history"} >{activePlanName}</Link>
                                    :
                                    <span>{activePlanName}</span>
                                }
                            </strong></div>
                            {activePlanLevel === 1 && isModifyPlanAllowed && <Link to="/app/setting/subscription-plans" >
                                <button className="btn btn-primary btn-block" type="button" >Modify</button>
                            </Link>}
                        </div>}
                        <ul className={`nav nav-footer`} >
                            <li className="nav-item">
                                <div className='text-center'>
                                    {this.state.showChatWithSupport ?
                                        <>
                                            <UncontrolledTooltip
                                                placement="top"
                                                target="chat_toltip_target"
                                            >
                                                {customerSupportTooltipText(subscriptionPlan)}
                                            </UncontrolledTooltip>
                                            <div id="chat_toltip_target" className='d-inline-block'>
                                                <Button color="primary" className="btn-gray-accent mb-3 w-auto px-3" onClick={() => help()} disabled={isChatButtonDisable} >
                                                    <Icon
                                                        className="Icon me-1"
                                                        xlinkHref={`${symbolsIcon}#ic-chat`}
                                                    />
                                                    <span>Chat With Us</span>
                                                </Button>
                                            </div>
                                        </>
                                        : ""}
                                </div>
                                <MobileOtpVerify
                                    openPhoneModal={openPhoneModal}
                                    closePhoneModal={this.closePhoneModal}
                                    data={userData}
                                    handleVerifyOtp={this.handleVerifyOtp}
                                    showSnackbar={this.props.showSnackbar}
                                />
                                <div className="d-flex justify-content-center align-items-center">
                                    <UncontrolledTooltip placement="top" target="settings">
                                        Settings
                                    </UncontrolledTooltip>
                                    <NavLink className="btn btn-primary btn-gray-accent" activeclassname='is-active' to='/app/setting' id="settings">
                                        <Icon
                                            className="Icon"
                                            xlinkHref={`${symbolsIcon}#settings`}
                                        />
                                    </NavLink>
                                    {/* <UncontrolledTooltip placement="top" target="feedback">
                                        Feedback
                                    </UncontrolledTooltip>
                                    <Button color="primary" className="btn-gray-accent mx-4" id="feedback" onClick={() => feedback()}>
                                        <Icon
                                            className="Icon"
                                            xlinkHref="../../assets/icons/product/symbols.svg#feedback2"
                                        />
                                    </Button> */}
                                    <div id="help_button">
                                        <a href="https://finance.crisp.help" target={`blank`}>
                                            <Button color="primary" className="btn-gray-accent mx-2 w-auto px-3">
                                                <Icon
                                                    className="Icon me-1"
                                                    xlinkHref={`${symbolsIcon}#info2`}
                                                />
                                                <span>Help</span>
                                            </Button>
                                        </a>
                                    </div>
                                    <UncontrolledTooltip
                                        placement="top"
                                        target="color_mode"
                                    >
                                        {this.props.themeMode === 'dark-mode' ? 'Light mode' : 'Dark mode'}
                                    </UncontrolledTooltip>
                                    <Button color="primary" className="btn-gray-accent" id="color_mode" onClick={() => colormode()}>
                                        <Icon
                                            className="Icon"
                                            xlinkHref={`${symbolsIcon}#lightbulb`}
                                        />
                                    </Button>
                                </div>
                            </li>
                            {process.env.NODE_ENV != 'production' && <li className="nav-item">
                                <div style={{ fontSize: '10px', padding: '2px' }} id='deployDate'>build {buildVersion}</div>
                            </li>}
                        </ul>
                    </div>)
                }
                <Modal isOpen={this.state.modal} toggle={this.sideToggle} className="modal-side js-biz-modal-panel">
                    <ModalHeader toggle={this.sideToggle}>
                        <div className="py-biz-switcher--logo">
                            <img src={Main_Logo} alt="Finance" style={{ height: 48, width: 'auto' }} />
                        </div>
                        <div className="pm-biz-switcher--title font-bold">
                            Your Finance account
                        </div>
                    </ModalHeader>
                    <ModalBody>
                        <div className="menu-content">
                            {(businessList.length > 5) && (
                                <Input
                                    onChange={this.handleSearchInput}
                                    placeholder="Search by business name"
                                />
                            )}
                            <ul className="business-menu">
                                {this.businessItems()}
                                {/* <li>
                                    <a href="javascript:void(0)">
                                        <span className="">Personal</span>
                                    </a>
                                </li> */}
                            </ul>

                            <div className="business-menu-add">
                                <a className="py-text--link" onClick={this.createNewBusiness}>
                                    <svg viewBox="0 0 26 26" className="Icon__M text-black me-2" id="add--large" xmlns="http://www.w3.org/2000/svg"><path d="M13 24C6.925 24 2 19.075 2 13S6.925 2 13 2s11 4.925 11 11-4.925 11-11 11zm0-2a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path><path d="M12 8a1 1 0 0 1 2 0v10a1 1 0 0 1-2 0V8z"></path><path d="M8 14a1 1 0 0 1 0-2h10a1 1 0 0 1 0 2H8z"></path></svg>Create a new business</a>
                            </div>
                        </div>
                        <div className="pt-modal-foo">
                            <span className="py-text py-text--small">You're signed in as <span className="py-text--strong">{signedInEmail || 'finance@gmail.com'}</span></span>
                            <ul className="py-biz-switch__menu">
                                <li className="py-biz-switch__menu-item" key={'3.1'} onClick={this.sideToggle}>
                                    <NavLink className="py-text--link" to={`/app/accounts`}>
                                        <svg className="Icon__M text-black me-2" viewBox="0 0 26 26" id="profile--large" xmlns="http://www.w3.org/2000/svg"><path d="M13 24C6.925 24 2 19.075 2 13S6.925 2 13 2s11 4.925 11 11-4.925 11-11 11zm0-2a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path><path d="M13 14c-2.122 0-4-1.878-4-4s1.878-4 4-4 4 1.878 4 4-1.878 4-4 4zm0-2c1.017 0 2-.983 2-2s-.983-2-2-2-2 .983-2 2 .983 2 2 2zM6.894 20.447l-1.788-.894C6.615 16.535 9.3 15 13 15s6.385 1.535 7.894 4.553l-1.788.894C17.948 18.132 15.967 17 13 17s-4.948 1.132-6.106 3.447z"></path></svg>
                                        Manage your profile
                                    </NavLink>
                                </li>
                                <li className="py-biz-switch__menu-item" key={'3.2'}>
                                    <a className="py-text--link" href="javascript:void(0)" onClick={this.onSignOut}>
                                        <svg className="Icon__M text-black me-2" viewBox="0 0 26 26" id="logout--large" xmlns="http://www.w3.org/2000/svg"><path d="M11.3 21a1 1 0 0 1 0 2H6.8A2.8 2.8 0 0 1 4 20.2V5.8A2.8 2.8 0 0 1 6.8 3h4.5a1 1 0 1 1 0 2H6.8a.8.8 0 0 0-.8.8v14.4a.8.8 0 0 0 .8.8h4.5zM17.35 10.76a1 1 0 1 1 1.3-1.52l3.6 3.086a1 1 0 0 1 0 1.519l-3.6 3.086a1 1 0 0 1-1.3-1.519l2.713-2.326-2.714-2.327z"></path><path d="M20.8 12a1 1 0 0 1 0 2H10a1 1 0 1 1 0-2h10.8z"></path></svg>
                                        Sign out
                                    </a>
                                </li>
                            </ul>
                        </div>

                    </ModalBody>
                    <ModalFooter className="text-left">
                        <a className="text-muted link-primary" href={terms()} target="_blank">Terms</a>
                        <small className="text-muted">•</small>
                        <a className="text-muted link-primary" href={privacyPolicy()} target="_blank">Privacy</a>

                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const { settings: { featureFlags } = {} } = state
    const isRewardEnabled = get(featureFlags, 'reward.view', 'true') === 'true'
    const isMinimumOneReportEnabled = Object.values(
        get(featureFlags, 'reports', {})
    ).includes('true')
    const isReportsEnabled =
        get(featureFlags, 'reports.enabled', 'true') === 'true' &&
        isMinimumOneReportEnabled
    const isDebitCardEnabled =
        get(featureFlags, 'debitCard.enable', 'true') === 'true'
    const isSubscriptionCreateAllowed =
        get(featureFlags, 'subscriptions.create', 'true') === 'true'
    const isSubscriptionUpdateAllowed =
        get(featureFlags, 'subscriptions.update', 'true') === 'true'

    return {
        business: state.businessReducer.business,
        selectedBusiness: state.businessReducer.selectedBusiness,
        paymentSettings: state.paymentSettings,
        themeMode: state.themeReducer.themeMode,
        activeSubscription: state.subscriptionReducer.activeSubscription,
        deviceSession: state.deviceSession,
        isRewardEnabled,
        isReportsEnabled,
        isDebitCardEnabled,
        isSubscriptionCreateAllowed,
        isSubscriptionUpdateAllowed,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators(BusinessAction, dispatch),
        fetchPaymentSettings: () => {
            dispatch(fetchPaymentSettings())
        },
        showSnackbar: (message, error) => {
            dispatch(openGlobalSnackbar(message, error))
        },
        getActiveSubscriptionPlan: () => {
            dispatch(getActiveSubscriptionPlan())
        },
        signOutSelectedSession: (id, payload) => {
            dispatch(signOutSelectedSession(id, payload))
        },
    }
}


export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(Sidebar)
);
