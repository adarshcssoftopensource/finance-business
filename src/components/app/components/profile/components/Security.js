import React, {Component} from 'react'
import {Input, Button, TabContent, TabPane, Modal, ModalHeader, ModalBody, ModalFooter, Container} from 'reactstrap';
import MiniSidebar from '../../../../../global/MiniSidebar';
import {openGlobalSnackbar} from '../../../../../actions/snackBarAction';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import Icon from "../../../../common/Icon";
import symbolsIcon from "../../../../../assets/icons/product/symbols.svg";
import {createSecrets, removeAuthenticator, verifySecretCode} from "../../../../../actions/2FASecurityActions";
import CenterSpinner from "../../../../../global/CenterSpinner";
import { profileSidebarLinksArray } from '../../../../../utils/common';

class SetupSecurity extends Component {
    state = {
        activeTab: "1",
        authenticatorModalTab: "1",
        authenticatorModal: false,
        code: "",
        totp: {},
        isLoading: false,
        openRemoveAuthenticatorModal: false
    }

    changeTab = (tab) => {
        this.setState({...this.state, activeTab: tab})
    }

    setUpAuthenticator = async (open) => {
        this.setState({...this.state, authenticatorModal: open, isLoading: open, authenticatorModalTab: "1"})
        if (open) {
            this.props.createSecrets().then((response) => {
                this.setState((prevState) => ({
                    ...prevState, totp: {
                        ...response.data
                    }
                    , isLoading: false
                }))
            });
        }
    }

    onChangeAuthenticatorTab = (tab) => {
        this.setState({...this.state, authenticatorModalTab: tab})
    }

    onChangeCode = (e) => {
        this.setState({...this.state, code: e?.target?.value})
    }

    verifyCode = () => {
        this.props.verifySecretCode(this.state.code);
    }

    openRemoveModal = (open) => {
        this.setState({...this.state, openRemoveAuthenticatorModal: open})
    }

    removeAuthenticator = () => {
        // const {code} = this.state;
        // this.props.removeAuthenticator(code)
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {isTOTPLoading, isTOTPEnabled} = this.props
        const {authenticatorModal, openRemoveAuthenticatorModal} = this.state
        if (isTOTPEnabled && authenticatorModal && prevProps.isTOTPLoading && prevProps.isTOTPLoading !== isTOTPLoading) {
            this.setState({
                ...this.state,
                authenticatorModal: false,
                activeTab: "1",
                code: "",
            })
        } else if (!isTOTPEnabled && openRemoveAuthenticatorModal && prevProps.isTOTPLoading && prevProps.isTOTPLoading !== isTOTPLoading) {
            this.setState({
                ...this.state,
                openRemoveAuthenticatorModal: false,
                activeTab: "1",
                code: "",
            })
        }
    }

    render() {
        const {params, isTOTPEnabled, isTOTPLoading} = this.props;
        const {
            activeTab,
            authenticatorModal,
            authenticatorModalTab,
            totp,
            code,
            isLoading,
            openRemoveAuthenticatorModal,
        } = this.state;
        return (
            <div className="py-frame__page py-frame__settings has-sidebar">
                <MiniSidebar heading={'Profile'} listArray={profileSidebarLinksArray}/>
                <div className="py-page__content">
                    <div className="py-page__inner">
                        <TabContent activeTab={activeTab}>
                            <TabPane tabId={"1"}>
                                <div className="py-header--page flex">
                                    <div className="py-header--title">
                                        <h2 className="py-heading--title">Two-Step Authentication</h2>
                                    </div>
                                </div>
                                <div className={`py-box py-box--large ${!isTOTPEnabled ? "cursor-pointer" : ""}`}
                                     onClick={() => isTOTPEnabled ? null : this.changeTab("2")}>
                                    <div className="invoice-steps-card__options">
                                        <div className="invoice-step-Collapsible__header-content"
                                             style={{alignItems: "center"}}>
                                            <div className="step-indicate de-activate">
                                                <div className="step-icon plane-icon">
                                                    <Icon
                                                        className="Icon"
                                                        xlinkHref={`${symbolsIcon}#lock`}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="py-heading--subtitle p-0 mb-2">Authenticator app</h4>
                                                <div className='py-desc mb-3' >Use the Authenticator app to get verification codes at no charge, even when your phone is offline. Download the Authy app from the App Store (for iOS) or Google Play (for Android) store.</div>
                                                {isTOTPEnabled ? <div className="status-ON">
                                                    <div
                                                        className="devider-circle ON"/>
                                                    <strong>Enabled</strong></div> : null}
                                            </div>
                                            {!isTOTPEnabled ? <div className={`cursor-pointer`}>
                                                    <i className="fas fa-chevron-right"/>
                                                </div> :""
                                                /*<div className={`cursor-pointer status-OFF`}
                                                     onClick={() => this.openRemoveModal(true)}>
                                                    <i className="fas fa-trash"/>
                                                </div>*/
                                            }
                                        </div>
                                    </div>
                                </div>
                            </TabPane>
                            {!isTOTPEnabled ?
                                <TabPane tabId={"2"}>
                                    <div className="py-header--page flex">
                                        <div className="py-header--title">
                                            <h2 className="py-heading--title"><i
                                                className="fas fa-arrow-left me-4 cursor-pointer fw-normal"
                                                onClick={() => this.changeTab("1")}/> Authenticator app</h2>
                                        </div>
                                    </div>
                                    <div>
                                        <div>Instead of waiting for text messages, get verification codes from an
                                            authenticator app. It works even if your phone is offline.
                                        </div>
                                        <Button className={"mt-4"} color="primary"
                                                onClick={() => this.setUpAuthenticator(true)}><i
                                            className="fas fa-plus me-3"/>Set up
                                            authenticator</Button>

                                    </div>
                                    <Modal fade={false} isOpen={authenticatorModal}
                                           toggle={() => this.setUpAuthenticator(false)}>
                                        <ModalHeader toggle={() => this.setUpAuthenticator(false)}>Authenticator app setup</ModalHeader>
                                        {isLoading || isTOTPLoading ?
                                            <CenterSpinner/> :
                                            <>
                                                <ModalBody className="p-0">
                                                    <TabContent activeTab={authenticatorModalTab}>
                                                        <TabPane tabId={"1"}>
                                                            <div className={"p-3"}>
                                                                <ul>
                                                                    <li>Open iOS or Android store</li>
                                                                    <li>Download Google Authenticator app</li>
                                                                    <li>Tap the + to add an account</li>
                                                                    <li>Scan a QR code</li>
                                                                </ul>
                                                                <div className={"d-flex"}>
                                                                    <div className={"m-auto text-center"}>
                                                                        <div>
                                                                            <img
                                                                                style={{
                                                                                    width: "166px",
                                                                                    height: "166px"
                                                                                }}
                                                                                alt={"error"}
                                                                                src={totp?.qrCode}/>
                                                                        </div>
                                                                        <a className={"mt-4"} color="primary"
                                                                           onClick={() => this.onChangeAuthenticatorTab("2")}>Can't
                                                                            scan it ?</a>
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        </TabPane>
                                                        <TabPane tabId={"2"}>
                                                            <div className={"p-3"}>
                                                                <ol>
                                                                    <li>In the Google Authenticator app tap the + then
                                                                        tap Enter
                                                                        a
                                                                        setup key
                                                                    </li>
                                                                    <li>Enter your email address and this key (spaces
                                                                        don’t
                                                                        matter): <br/> <b> {totp?.secret}</b></li>

                                                                    <li>Make sure Time based is selected</li>
                                                                    <li>Tap Add to finish</li>
                                                                </ol>
                                                            </div>
                                                        </TabPane>
                                                        <TabPane tabId={"3"}>
                                                            <div className={"p-3"}>
                                                                Enter the 6-digit code you see in the app
                                                                <Input autocomplete="nope"
                                                                       type="number"
                                                                       id="company_name"
                                                                       name="code"
                                                                       value={code}
                                                                       maxLength={6}
                                                                       onChange={this.onChangeCode}
                                                                />
                                                            </div>
                                                        </TabPane>
                                                    </TabContent>
                                                </ModalBody>
                                                <ModalFooter>
                                                    {authenticatorModalTab !== "1" ?
                                                        <Button color="primary"
                                                                outline
                                                                onClick={() => this.onChangeAuthenticatorTab("1")}>Back</Button> : null}
                                                    <Button
                                                        color="primary"
                                                        outline
                                                        onClick={() => this.setUpAuthenticator(false)}>Cancel</Button>
                                                    <Button
                                                        color="primary"
                                                        onClick={() => authenticatorModalTab === "3" ? this.verifyCode() : this.onChangeAuthenticatorTab("3")}
                                                    >
                                                        {authenticatorModalTab === "3" ? 'Verify' : 'Next'}
                                                    </Button>
                                                </ModalFooter>
                                            </>}
                                    </Modal>
                                </TabPane>
                                :
                                ""
                                /*<Modal fade={false} isOpen={false}
                                       toggle={() => this.openRemoveModal(false)}>
                                    <ModalHeader toggle={() => this.openRemoveModal(false)}>Remove
                                        Authenticator</ModalHeader>
                                    {
                                        isLoading || isTOTPLoading ?
                                            <CenterSpinner/> :
                                            <>
                                                <ModalBody className="p-0">
                                                    <div className={"p-3"}>
                                                        Enter the 6-digit code you see in the app
                                                        <Input autocomplete="nope"
                                                               type="number"
                                                               id="company_name"
                                                               name="code"
                                                               value={code}
                                                               maxLength={6}
                                                               onChange={this.onChangeCode}
                                                        />
                                                    </div>
                                                </ModalBody>
                                                <ModalFooter>
                                                    <Button
                                                        color="primary"
                                                        outline
                                                        onClick={() => this.openRemoveModal(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        color="primary"
                                                        onClick={this.removeAuthenticator}
                                                    >
                                                        Confirm
                                                    </Button>
                                                </ModalFooter>
                                            </>
                                    }
                                </Modal>*/
                            }
                        </TabContent>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    isTOTPEnabled: state.userData?.user?.twoFAuth?.TOTP,
    isTOTPLoading: state.userData?.userAuth?.isLoading
})


export default withRouter((connect(mapStateToProps, {
    openGlobalSnackbar,
    createSecrets,
    verifySecretCode,
    removeAuthenticator
})(SetupSecurity)))
