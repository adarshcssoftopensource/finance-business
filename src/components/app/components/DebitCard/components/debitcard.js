import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Icon from '../../../../common/Icon'
import {
  Button,
  Col,
  Container,
  Input,
  InputGroup,
  InputGroupText,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner,
  UncontrolledTooltip,
} from 'reactstrap'
import _, { cloneDeep, find, get, get as _get, isEmpty, pickBy } from 'lodash'
import {
  getAmountToDisplay,
  getAmountToDisplayWithColor,
  help,
  minimumTwoDigits,
} from '../../../../../utils/GlobalFunctions'
import debitCardService from '../../../../../api/DebitCardServices'
import { openGlobalSnackbar } from '../../../../../actions/snackBarAction'
import DataTableWrapper from '../../../../../utils/dataTableWrapper/DataTableWrapper'
import DatepickerWrapper from '../../../../../utils/formWrapper/DatepickerWrapper'
import queryString from 'query-string'
import { toDisplayDate } from '../../../../../utils/common'
import { columns } from './constant'
import history from '../../../../../customHistory'
import CenterSpinner from '../../../../../global/CenterSpinner'
import {
  _formatDate,
  _toDateConvert,
} from '../../../../../utils/globalMomentDateFunc'
import FormValidationError from '../../../../../global/FormValidationError'
import { fetchCountries } from '../../../../../api/globalServices'
import { fetchStatesByCountryId } from '../../../../../api/CustomerServices'
import ShippingAddress from './ShippingAddress'
import { addressBillingPayload } from '../../sales/components/customer/customerSupportFile/constant'
import * as CustomerActions from '../../../../../actions/CustomerActions'
import { _getUser } from '../../../../../utils/authFunctions'
import MobileOtpVerify from '../../../../../global/MobileVerify'
import symbolsIcon from '../../../../../assets/icons/product/symbols.svg'

class debitcard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            balance: 0.00,
            currency: {
                code: '',
                symbol: ''
            },
            debitCards: [],
            payoutBalance: 0.00,
            payoutPendingBalance: 0.00,
            transferAmount: 0.00,
            transactions: [],
            limit: 10,
            offset: 1,
            totalTransactions: 0,
            sort: true,
            isCardReveal: false,
            cvcNumber: '',
            cardNumber: '',
            cardStatus: '',
            isLoading:true,
            isPhysicalCardGenerated: false,
            isVirtualCardGenerated: false,
            physicalCard: [],
            virtual: 'inactive',
            isVirtualDebitCardUpdateLoading: false,
            isPhysicalDebitCardUpdateLoading: false,
            isRequestPhysicalCardLoading: false,
            isRequestVirtualCardLoading: false,
            filter: false,
            query: { startDate: '', endDate: '', transactionAmount: '', transactionDescription: ''},
            isTransactionsLoading: false,
            queryData: '',

            transactionColumns: [],
            isPayoutBalanceLoading: false,
            isAddWalletBalanceLoading: false,
            isConfirmButtonDisable: true,
            isValidationError: false,
            validationErrorMessage: "Transfer amount must exceed $1",
            isDebitCardWalletActive: false,
            checkCardType:false,
            isAddressModalOpen: false,
            isAddressModalLoading: false,
            countries: [],
            addressBilling: addressBillingPayload(),
            addressLine1Error: false,
            cityError: false,
            stateError: false,
            postalError: false,
            countryError: false,
            isPasswordRevealButtonDisable: true,
            isPasswordValidationError: false,
            passwordValidationMessage: "Password is required",
            isPasswordModalOpen: false,
            revealPassword: "",
            revealCardId: null,
            walletLoadStatus: "",
            userData: {},
            openPhoneModal: false
        };
        this.toggle = this.toggle.bind(this);
        this.toggleAddressModal = this.toggleAddressModal.bind(this);
    }

    toggle = async () => {
        this.setState({ isPayoutBalanceLoading: true });
        await debitCardService.payoutBalance()
            .then(response => {
                if (response.statusCode === 200) {
                    this.setState({
                        payoutBalance: response.data.amount,
                        payoutPendingBalance: _get(response, "data.pending", 0),
                        modal: !this.state.modal,
                        isPayoutBalanceLoading: false
                    })
                }
            })
            .catch(error => {
                this.setState({
                    modal: !this.state.modal,
                    isPayoutBalanceLoading: false
                })
                this.props.showSnackbar(error.message, true)
            })
    }

    toggleAddressModal = async () => {
        await this.fetchFormData();
        await debitCardService.getBusinessLegalAddress()
            .then(response => {
                if (response.statusCode === 200) {
                    this.setState({
                        addressBilling: {
                            ...this.state.addressBilling,
                            addressLine1: response.data.addressLine1,
                            addressLine2: response.data.addressLine2,
                            city: response.data.city,
                            postal: response.data.postal,
                            country: this.mapWithCountry(response.data.country.id),
                            state: response.data.state
                        },
                        isRequestPhysicalCardLoading: false
                    }, () => {
                        this.openPhysicalCardAddressModal();
                    })
                }
            })
            .catch(error => {
                this.setState({
                    isRequestPhysicalCardLoading: false
                })
                this.props.showSnackbar(error.message, true)
            })
    }

    componentDidMount() {
        if (_get(this.props.selectedBusiness, "currency.code",  "") !== "USD") {
            history.push(`/app/dashboard`);
            return false;
        }
        const pageData = localStorage.getItem('paginationData')

        let queryData = `pageNo=${this.state.offset}&pageSize=${this.state.limit}`;
        if (!!pageData) {
            const { limit } = JSON.parse(pageData)
            queryData = `pageNo=${this.state.offset}&pageSize=${limit}`
            this.setState({ limit })
        }
        const query = queryString.parse(this.props.location.search)
        if (!isEmpty(query)) {
            const queryString = Object.entries(query).map(([key, val]) => `${key}=${val}`).join("&");
            queryData += `&${queryString}`;
        }
        this.setState((prevState) => ({
            ...prevState,
            query: { ...prevState.query, ...query },
            queryData
        }))
        const transactionColumns = [...columns];
        const dateField = transactionColumns.find(column => column.dataField === 'date');
        dateField.formatter = (date) => toDisplayDate(date, true, 'MMM D, YYYY');
        const amountField = transactionColumns.find(column => column.dataField === 'amount');
        amountField.formatter = (amount, data) => getAmountToDisplayWithColor(amount, data.currency);
        this.setState({ transactionColumns });
        this.getWalletSummary()
        this.getTransactionRecords(queryData)
        const token = localStorage.getItem('token')
        const user = _getUser(token);
        this.setState({
            userData: user
        })
    }

    getWalletSummary = async () => {
        await debitCardService.checkPaymentOnBoarding()
        .then(async res => {
            if (res.statusCode === 200) {
                const paymentSetting = res.data.paymentSetting
                this.setState({ walletLoadStatus: paymentSetting.walletLoadStatus })
                if (paymentSetting.isWalletCreated) {
                    await debitCardService.getDebitCardSummary()
                    .then(response => {
                        if(response.statusCode === 200) {
                            const data = response.data
                            if (data !== null) {
                                const virtualCard = data.cards.find(card => card.cardType === "virtual");
                                const virtualCardList = data.cards.filter(card => card.cardType === "virtual")
                                const physicalCardList = data.cards.filter(card => card.cardType === "physical")
                                this.setState({
                                    checkCardType:virtualCard ? true : false,
                                    balance: data.balance,
                                    debitCards: virtualCardList,
                                    physicalCard: physicalCardList,
                                    currency: data.currency,
                                    cardStatus: virtualCard && virtualCard.status ? virtualCard.status : '',
                                    isLoading:false,
                                    isDebitCardWalletActive: _get(data, "isActive", false)
                                })
                            }
                        }
                    }).catch(error => {
                        this.props.showSnackbar(error.message, true)
                        if(error.statusCode === 404 && error.message === "Card details not available") {
                            this.setState({
                                isLoading: false,
                            })
                            history.push(`/app/debitcard/onboarding`)
                        }
                    })
                } else {
                    this.setState({
                        isLoading: false,
                    })
                    history.push(`/app/debitcard/onboarding`)
                }
            }})
            .catch(error => {
                this.props.showSnackbar(error.message, true)
            })
    }

    addWalletBalance = async (event) => {
        event.preventDefault();
        const amount = event.target.walletamount.value
        const payload = {
            "topupInput": {
                "amount": amount
            }
        }
        this.setState({ isAddWalletBalanceLoading: true });
        await debitCardService.addWalletBalance(payload)
            .then((response) => {
                if (response.statusCode === 200) {
                    this.props.showSnackbar("Amount added succesfully", false)
                    this.setState({
                        modal: !this.state.modal,
                        balance: response.data.balance,
                        isAddWalletBalanceLoading: false,
                        isConfirmButtonDisable: true,
                        isValidationError: false
                    }, () => {
                        this.getTransactionRecords();
                    });
                }
            })
            .catch((error) => {
                this.props.showSnackbar(error.message, true)
                this.setState({
                    modal: !this.state.modal,
                    isAddWalletBalanceLoading: false,
                    isConfirmButtonDisable: true,
                    isValidationError: false
                });
            })
    }

    getTransactionRecords = async (queryData) => {
        this.setState({ isTransactionsLoading: true });
        await debitCardService.getTransactionRecords(queryData)
            .then(response => {
                if (response.statusCode === 200) {
                    this.setState({
                        transactions: response.data.transactions,
                        totalTransactions: response.data.meta.total,
                        isTransactionsLoading: false
                    })
                }
            })
            .catch(error => {
                this.setState({ isTransactionsLoading: false });
                this.props.showSnackbar(error.message, true)
            })
    }

    openPasswordForRevealModal = (cardId) => {
        this.setState({ isPasswordModalOpen: true, revealCardId: cardId });
    }

    revelCardDetails = async (cardId) => {
        await debitCardService.revealCardDetails(cardId)
            .then(response => {
                if (response.statusCode === 200) {
                    const data = response.data
                    this.setState({
                        isCardReveal: !this.state.isCardReveal,
                        cvcNumber: data.cvc,
                        cardNumber: data.number
                    })
                }
            })
            .catch(error => {
                this.props.showSnackbar(error.message, true)
            })
    }

    updateDebitCardStatus = async (cardId, value, type) => {
        this.setState({
            ...this.state,
            virtual: value,
            physical: value,
            isVirtualDebitCardUpdateLoading: type === "virtual" ? true : false,
            isPhysicalDebitCardUpdateLoading: type === "physical" ? true : false,
        })
        const payload = {
            "cardStatus": value
        }
        await debitCardService.updateStatus(cardId, payload)
            .then(res => {
                if (res.statusCode === 200) {
                    if (res.data.type === "virtual") {
                        this.setState({
                            cardStatus: res.data.status,
                            virtual: res.data.status,
                            isVirtualDebitCardUpdateLoading: false,
                        })
                    }
                    if (res.data.type === "physical") {
                        const updatedArray = this.state.physicalCard.map(val => {
                            if(val._id === res.data.id){
                                return({
                                    ...res.data,
                                    _id: res.data.id,
                                    cardNumber: res.data.lastFour,
                                })
                            }
                        })
                        this.setState({
                            physical: res.data.status,
                            physicalCard: updatedArray,
                            isPhysicalDebitCardUpdateLoading: false
                        })
                    }
                    this.props.showSnackbar("Card status updated", false)
                }
            })
            .catch(err => {
                this.setState({
                    isVirtualDebitCardUpdateLoading: false,
                    isPhysicalDebitCardUpdateLoading: false
                })
                this.props.showSnackbar(err.message, true)
            })
    }

    requestPhysicalCard = async () => {
        this.setState({ isRequestPhysicalCardLoading: true });
        const payload = {
            "cardType": "physical",
            "shippingAddress": this.state.addressBilling
        }
        await debitCardService.generateDebitCard(payload)
            .then(res => {
                this.setState({
                    isPhysicalCardGenerated: true,
                    isRequestPhysicalCardLoading: false,
                    isAddressModalLoading: false,
                    isAddressModalOpen: false
                })
                this.getWalletSummary()
            })
            .catch(error => {
                this.setState({
                    isRequestPhysicalCardLoading: false,
                    isAddressModalLoading: false
                })
                this.props.showSnackbar(error.message, true)
            })
    }

    requestVirtualCard = async () => {
        this.setState({ isRequestVirtualCardLoading: true });
        const payload = {
            "cardType": "virtual"
        }
        await debitCardService.generateDebitCard(payload)
            .then(res => {
                this.setState({
                    isVirtualCardGenerated: true,
                    isRequestVirtualCardLoading: false
                })
                this.getWalletSummary()
            })
            .catch(error => {
                this.setState({
                    isRequestVirtualCardLoading: false
                })
                this.props.showSnackbar(error.message, true)
            })
    }

    _handlePageChange = (type, { page, sizePerPage }) => {
        let { queryData, offset, limit, sort, sortTye } = this.state;
        if (type === 'pagination') {
            let pageNo = !!page ? page : offset;
            if (this.state.limit !== sizePerPage) {
                pageNo = 1;
            }
            queryData = queryData.replace(`pageNo=${offset}`, `pageNo=${pageNo}`)
            queryData = queryData.replace(`pageSize=${limit}`, `pageSize=${!!sizePerPage ? sizePerPage : limit}`)
            localStorage.setItem('paginationData', JSON.stringify({ offset: pageNo, queryData, limit: sizePerPage }))
            this.setState({ offset: pageNo, queryData, limit: sizePerPage })
        } else if (type === 'sort') {
            const sortBy = !sort
            if (queryData.includes('sort')) {
                queryData = queryData.replace(`sortType=${!!sort ? 'asc' : 'desc'}`, `sortType=${!!sortBy ? 'asc' : 'desc'}`)
            } else {
                queryData += `&sortType=${!!sort ? 'asc' : 'desc'}&sortBy=${sortTye}`
            }
            this.setState({ queryData, sort: sortBy })
        }
        this.getTransactionRecords(queryData);
    }

    handleQueryString = () => {
        const { query, limit } = this.state;
        let queryString = '';
        let data = pickBy(query, _.identity)
        queryString = Object.entries(data).map(([key, val]) => `${key}=${val}`).join("&");
        const pathname = this.props.location.pathname;
        history.push({
            pathname,
            search: queryString
        });
        queryString += `&pageNo=1&pageSize=${limit}`;
        this.setState({offset: 1, queryData: queryString});
        this.getTransactionRecords(queryString);
    }

    _filter = (select, from) => {
        this.setState({ filter: true });
        let query = { ...this.state.query };
        if (from === 'transactionAmount') {
          query.transactionAmount = select;
        } else if (from === 'startDate') {
          query.startDate = select ? _formatDate(select) : null;
        } else if (from === 'endDate') {
          query.endDate = select ? _formatDate(select) : null;
        } else if (from === 'transactionDescription') {
          query.transactionDescription = select;
        } else {
          query = { startDate: '', endDate: '' };
        }

        this.setState((prevState) => ({
          ...prevState,
          query: { ...prevState.query, ...query }
        }), () => this.handleQueryString());
    }

    handlePasswordChange = (event) => {
        if (event.target.value) {
            this.setState({ revealPassword: event.target.value, isPasswordRevealButtonDisable: false, isPasswordValidationError: false });
        } else {
            this.setState({ revealPassword: "", isPasswordRevealButtonDisable: true, isPasswordValidationError: true });
        }
    }

    submitPassword = async () => {
        this.setState({ isPasswordSubmitLoading: true });
        const password = this.state.revealPassword;
        await debitCardService.revealCardAuthenticate({ password })
            .then(async (res) => {
                if (res.statusCode === 200) {
                    await this.revelCardDetails(this.state.revealCardId);
                    this.setState({
                        isPasswordSubmitLoading: false,
                        isPasswordModalOpen: false
                    })
                    this.props.showSnackbar("Card reveal successfully")
                } else {
                    this.setState({
                        isPasswordSubmitLoading: false
                    })
                    this.props.showSnackbar(res.message, true)
                }
            })
            .catch(error => {
                this.setState({
                    isPasswordSubmitLoading: false
                })
                this.props.showSnackbar(error.message, true)
            })
    }

    handleAddFundChange = (event) => {
        if (event.target.value && !isNaN(event.target.value) && event.target.value >= 1) {
            this.setState({ isConfirmButtonDisable: false, isValidationError: false });
        } else if (event.target.value < 1) {
            this.setState({ isConfirmButtonDisable: true, isValidationError: true });
        } else {
            this.setState({ isConfirmButtonDisable: true });
        }
    }

 downloadCSV = async (response) => {
  const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      let link
      link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = `debitCard-transaction.xlsx`
      this.props.showSnackbar("Transaction Downloaded", false)
      link.click()
};

    handleExportTransaction =async (val) => {
    await debitCardService.exportTransactionRecords()
            .then(response => {
            this.downloadCSV(response)
            })
            .catch(error => {
                this.setState({ isTransactionsLoading: false });
                this.props.showSnackbar(error.message, true)
            })
    }

    openPhysicalCardAddressModal = async () => {
        this.setState({ isAddressModalOpen: true, isRequestPhysicalCardLoading: true });
    }

    fetchFormData = async () => {
        const countries = (await fetchCountries()).countries;
        this.setState({ countries })
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

    fetchStates = async (id) => {
        if (id && id !== 0) {
            const statesList = await fetchStatesByCountryId(id);
            this.props.actions.setCountrytStates(statesList);
            return statesList;
        } else {
            return false
        }
    };

    mapWithStates = (id) => {
        let countryStates = this.props.selectedCountryStates;
        if (countryStates && countryStates.length > 0) {
            let stateObject = find(countryStates, { 'id': id });
            return stateObject;
        }
        return {};
    };

    setAddress = async (from, data) => {
        if (!!data.country) {
            const countries = this.state.countries;
            const countryObject = find(countries, { 'sortname': data.country });
            let countriesData = []
            const setValue = this.mapWithCountry(countryObject.id);
            countriesData = await this.fetchStates(countryObject.id)
            if (!!countriesData) {
                if (!!data.state) {
                const stateObject = find(countriesData.states, { 'name': data.state });
                const stateValue = this.mapWithStates(stateObject.id, from);
                    this.setState({
                        addressBilling: {
                            ...this.state.addressBilling,
                            state: stateValue
                        }
                    });
                }
            }
            this.setState({
                addressBilling: {
                    ...this.state.addressBilling,
                    country: setValue
                }
            });
        } else {
            this.setState({
                addressBilling: {
                    ...this.state.addressBilling,
                    country: '', state: ''
                }
            });
        }
        if (!!data.postalCode) {
            if (data.postalCode.length <= 6) {
                this.setState({
                    addressBilling: {
                        ...this.state.addressBilling,
                        postal: data.postalCode
                    }
                });
            }
        } else {
            this.setState({
                addressBilling: {
                    ...this.state.addressBilling,
                    postal: ''
                }
            });
        }
        if (!!data.city) {
            this.setState({
                addressBilling: {
                    ...this.state.addressBilling,
                    city: data.city
                }
            });
        } else {
            this.setState({
                addressBilling: {
                    ...this.state.addressBilling,
                    city: ''
                }
            });
        }
        if (!!data.oneLine) {
            this.setState({
                addressBilling: {
                    ...this.state.addressBilling,
                    addressLine2: data.oneLine, addressLine1: data.addressLine1
                }
            });
        } else {
            this.setState({
                addressBilling: {
                    ...this.state.addressBilling,
                    addressLine2: '',
                    addressLine1: data.addressLine1
                }
            });
        }
    }

    handleText = async (event) => {
        const { name, value } = event.target;
        if (name === 'city' ||
            name === 'addressLine1' || name === 'addressLine2' || name === 'postal') {
            if (name === 'postal') {
                if (value.length <= 6) {
                    this.setState({
                        addressBilling: {
                            ...this.state.addressBilling,
                            [name]: value.toUpperCase()
                        },
                        postalError: false
                    });
                }
            } else {
                this.setState({
                    addressBilling: {
                        ...this.state.addressBilling,
                        [name]: value,
                    },
                    [`${name}Error`]: false
                });
            }
        } else if (name === 'state') {
            let setValue = this.mapWithStates(value);
            this.setState({
                addressBilling: {
                    ...this.state.addressBilling,
                    [name]: setValue
                },
                stateError: false
            });
        } else if (name === 'country') {
            let setValue = this.mapWithCountry(value);
            await this.fetchStates(value);
            this.setState({
                addressBilling: {
                    ...this.state.addressBilling,
                    [name]: setValue
                },
                countryError: false
            });
        } else {
            this.setState({
                addressBilling: { ...this.state.addressBilling, [name]: value },
                [`${name}Error`]: true
            })
        }
    };

    handleSubmitPhysicalCardAddress = () => {
        if (!this.state.addressBilling.addressLine1) {
            this.setState({ addressLine1Error: true });
            return false
        }
        if (!this.state.addressBilling.country || isEmpty(this.state.addressBilling.country)) {
            this.setState({ countryError: true });
            return false
        }
        if (!this.state.addressBilling.state || isEmpty(this.state.addressBilling.state)) {
            this.setState({ stateError: true });
            return false
        }
        if (!this.state.addressBilling.state || isEmpty(this.state.addressBilling.state)) {
            this.setState({ stateError: true });
            return false
        }
        if (!this.state.addressBilling.city) {
            this.setState({ cityError: true });
            return false
        }
        if (!this.state.addressBilling.postal) {
            this.setState({ postalError: true });
            return false
        }
        this.setState({ isAddressModalLoading: true }, () => this.requestPhysicalCard());
    }

    checkUserMobileValidation = () => {
        const user = this.state.userData;
        if(user && user.securityCheck && !user.securityCheck.mobileVerified) {
            this.setState({
                openPhoneModal: true
            })
        } if(user && user.securityCheck && !user.securityCheck.emailVerified){
            this.props.showSnackbar("Please verify your email, to use this feature", true)
        } else {
            help();
        }
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

    render() {
      const {isAddBalanceEnabled, isDownloadTransactionsEnabled, isIssuePhysicalCardsEnabled, isIssueVirtualCardsEnabled, isShowTransactionsEnabled, isUpdateStatusVirtualCardEnabled, isUpdateStatusPhysicalCardEnabled, isViewPhysicalCardEnabled, isViewVirtualCardEnabled} = this.props;

        const { query: { transactionAmount, startDate, endDate, transactionDescription }, userData, openPhoneModal } = this.state;
        return (
            <div className="debitcard_wrapper">
                {this.state.isLoading ?
                    <Container className="mrT50 text-center">
                        <CenterSpinner />
                    </Container> :
                    !this.state.isDebitCardWalletActive ?
                    <div className="content-wrapper__main__fixed text-center vh-100 d-flex align-items-center">
                        <div className="py-status-page">
                            <div className="py-box">
                                <div className="py-box--content">
                                    <h1 className="py-heading--title mb-4">Your Blue Visa Debit Wallet Not Active</h1>
                                    <div className="py-heading--subtitle">
                                        <p>Please contact with admin</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    :
                    <div className="content-wrapper__main">
                        <main>
                            <div className="container-fluid">
                                <header className="py-header--page">
                                    <div className="py-header--action pull-right">
                                        {/* <button type='button' className='btn btn-outline-primary'>Export transaction data</button> */}
                                    </div>
                                    <div className="py-header--title">
                                        <h2 className="py-heading--title">My Finance Blue Visa Debit</h2>
                                    </div>
                                </header>
                                <Row className='blue-debit-cards'>
                                    <Col className='card-grid' lg={4} md={6}>
                                        <div className="blue-debit-card">
                                            <div className='map-bg'>
                                                <img src="../../../../../assets/images/debit-card/map-texture.png" alt="" />
                                            </div>
                                            <div className='header-part'>
                                                <h3 className="title">My Blue Debit Balance</h3>
                                            </div>
                                            <div className='body-part'>
                                                <div className="balance monospace">{getAmountToDisplay(this.state.currency, this.state.balance)}</div>
                                            </div>
                                            <div className='footer-part'>
                                            </div>
                                            {
                                                !this.state.isWalletLoadPaused ?
                                                    <Fragment>
                                                        {
                                                            !this.state.isPayoutBalanceLoading ?
                                                            <Fragment>
                                                            <UncontrolledTooltip placement="bottom" target="addamount_button">Add funds</UncontrolledTooltip>
                                                            {isAddBalanceEnabled && <button type="button" id='addamount_button' className="add-button" onClick={this.toggle}><i className="fas fa-plus"></i></button>}
                                                            </Fragment>
                                                            : <button type="button" id='spinner-add-amount' className="add-button">
                                                                <Spinner size="sm" style={{height:"18px",width:"18px"}} color="default" />
                                                            </button>
                                                        }
                                                    </Fragment>
                                                : null
                                            }

                                        </div>
                                        {isAddBalanceEnabled &&
                                            <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                                                <form onSubmit={this.addWalletBalance}>
                                                    <ModalHeader className="border-bottom-0 pt-3 pb-1" toggle={() =>{ this.setState({ modal: !this.state.modal, isConfirmButtonDisable: true, isValidationError: false })
                                                    }}>&nbsp;</ModalHeader>
                                                    <ModalBody>
                                                    <div class="row pb-4 mb-2">
                                                        <div class="col-6">
                                                            <div class="card p-4">
                                                                <div class="d-flex flex-wrap justify-content-between">
                                                                    <UncontrolledTooltip placement="bottom" target="av_balance_2" style={{maxWidth: "350px", padding: "10px"}}>The available balance reflects funds available for payout to your bank or Blue Visa Debit card.</UncontrolledTooltip>
                                                                    <h4 class="card-title mb-2">Available balance <small id='av_balance_2' className='fal fa-info-circle'></small></h4>
                                                                    <div class="card-balance text-center">{getAmountToDisplay(this.state.currency, this.state.payoutBalance)}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="col-6">
                                                            <div class="card p-4">
                                                                <div class="d-flex flex-wrap justify-content-between">
                                                                    <UncontrolledTooltip placement="bottom" target="pn_balance_2" style={{maxWidth: "350px", padding: "10px"}}>The pending balance reflects payments that have yet to complete processing settlement. Once the funds have settled, the funds will be available for payout to your bank or Blue Visa Debit card. </UncontrolledTooltip>
                                                                    <h4 class="card-title mb-2">Pending balance <small id='pn_balance_2' className='fal fa-info-circle'></small></h4>
                                                                    <div class="card-balance text-center">{getAmountToDisplay(this.state.currency, this.state.payoutPendingBalance)}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <h4 className="font-weight-bold">{`You can manually add up to `+ getAmountToDisplay(this.state.currency, this.state.payoutBalance)}</h4>
                                                    <p>How much would you like to add?</p>
                                                    <InputGroup>
                                                        <InputGroupText>$</InputGroupText>
                                                        <Input placeholder="0.00" className="mt-0" name="walletamount" onChange={(event) => this.handleAddFundChange(event)}/>
                                                    </InputGroup>
                                                    {
                                                        this.state.isValidationError &&
                                                        <FormValidationError
                                                            showError={this.state.isValidationError}
                                                            message={this.state.validationErrorMessage}
                                                        />
                                                    }
                                                    <div className='text-center mt-3 mb-3'>
                                                        {
                                                            this.state.isAddWalletBalanceLoading ?
                                                                <Button color="primary" type="button" className="w-25 ms-auto">
                                                                    <Spinner size="sm" style={{height:"18px",width:"18px"}} color="default" />
                                                                </Button>
                                                            : <Button color="primary" type="submit" className="w-25" disabled={this.state.isConfirmButtonDisable}>Confirm</Button>
                                                        }
                                                    </div>
                                                    </ModalBody>
                                                    <ModalFooter className="d-block">
                                                        <p className='text-center mb-1'>
                                                            Would you like to add funds from your pending balance?
                                                            <button id='fee_info_button' className='btn btn-link p-2' type='button'>
                                                                <i className="fal fa-info-circle"></i>
                                                            </button>
                                                        </p>
                                                        <p className='text-center'>
                                                            <button type="button" className="btn btn-outline-primary" onClick={() => this.checkUserMobileValidation()}>Chat with Us</button>
                                                        </p>
                                                        <MobileOtpVerify
                                                            openPhoneModal={openPhoneModal}
                                                            closePhoneModal= {this.closePhoneModal}
                                                            data={userData}
                                                            handleVerifyOtp={this.handleVerifyOtp}
                                                            showSnackbar={this.props.showSnackbar}
                                                        />
                                                    <UncontrolledTooltip placement="bottom" target="fee_info_button" style={{maxWidth: "400px", padding: "10px"}}>
                                                        For Starter plan users, a fee of 2% will apply.<br/>
                                                        For Professional plan users, a fee of 1% may apply.<br/>
                                                        For Ultimate Pro users, a fee of .5% may apply.
                                                    </UncontrolledTooltip>
                                                    </ModalFooter>
                                                </form>
                                            </Modal>
                                        }
                                    </Col>
                                    {
                                        this.state.physicalCard.length > 0 ?
                                        this.state.physicalCard.map((card, index) =>
                                        card.status !== "blocked" ?
                                        <Col className='card-grid' lg={4} md={6}>
                                                 <div className="blue-debit-card">
                                                     <div className='map-bg'>
                                                         <img src="../../../../../assets/images/debit-card/map-texture.png" alt="" />
                                                     </div>
                                                      <div className='header-part'>
                                                         <h3 className="title">My Blue Visa Debit</h3>
                                                     </div>
                                                     <div className='body-part'>
                                                            <div className="card-number monospace">
                                                                <span className='star'>**** **** ****</span>&nbsp;<span>{card.cardNumber}</span>
                                                            </div>
                                                    </div>
                                                    <div className='footer-part'>
                                                        <div className='card-logo'>
                                                            <figure className='visa-logo'>
                                                                <Icon className="Icon" xlinkHref={`${symbolsIcon}#visa-card-icon`} />
                                                            </figure>
                                                        </div>
                                                    </div>
                                                    {
                                                        card.status === "active" && isUpdateStatusPhysicalCardEnabled ?
                                                            <React.Fragment>
                                                                <UncontrolledTooltip placement="bottom" target="lock_or_unlock_physical_card">Your card is unlocked.<br/>Lock it now.</UncontrolledTooltip>
                                                                {
                                                                    this.state.isPhysicalDebitCardUpdateLoading ?
                                                                        <label htmlFor="physical_card_unlock" className="py-lock-switch" id='lock_or_unlock_physical_card'>
                                                                            <Spinner size="sm" style={{height:"18px",width:"18px"}} color="default" />
                                                                        </label>
                                                                    :
                                                                    <label htmlFor="physical_card_unlock"
                                                                        className="py-lock-switch" id='lock_or_unlock_physical_card'
                                                                        onClick={(e) => this.updateDebitCardStatus(card._id, "inactive", "physical")}>
                                                                        <span className="py-toggle__handle inactive" value="active"></span>
                                                                    </label>
                                                                }
                                                            </React.Fragment>
                                                        : null
                                                    }
                                                    {
                                                        card.status === "inactive" && isUpdateStatusPhysicalCardEnabled ?
                                                            <React.Fragment>
                                                                <UncontrolledTooltip placement="bottom" target="lock_or_unlock_physical_card">Your card is locked.<br/>Unlock it now.</UncontrolledTooltip>
                                                                {
                                                                    this.state.isPhysicalDebitCardUpdateLoading ?
                                                                        <label htmlFor="physical_card_lock" className="py-lock-switch" id='lock_or_unlock_physical_card'>
                                                                            <Spinner size="sm" style={{height:"18px",width:"18px"}} color="default" />
                                                                        </label>
                                                                    :
                                                                    <label htmlFor="physical_card_lock"
                                                                        className="py-lock-switch" id='lock_or_unlock_physical_card'
                                                                        onClick={(e) => this.updateDebitCardStatus(card._id, "active", "physical")}>
                                                                        <span className="py-toggle__handle active" value="inactive"></span>
                                                                    </label>
                                                                }
                                                            </React.Fragment>
                                                        : null
                                                    }
                                                </div>
                                            </Col>
                                        : null
                                    ) : <Col className='card-grid' lg={4} md={6}>
                                        {isViewPhysicalCardEnabled &&
                                                 <div className="blue-debit-card">
                                                     <div className='map-bg'>
                                                         <img src="../../../../../assets/images/debit-card/map-texture.png" alt="" />
                                                     </div>
                                                     <div className='header-part'>
                                                         <h3 className="title">My Blue Visa Debit</h3>
                                                     </div>
                                                    {isIssuePhysicalCardsEnabled &&
                                                        <div className='body-part'>
                                                            <div className="apply-physical-card">
                                                                {
                                                                    this.state.isRequestPhysicalCardLoading ?
                                                                        <Spinner size="sm" style={{ height: "18px", width: "18px" }} color="default" />
                                                                        : <button className="btn-apply" onClick={this.toggleAddressModal}>Request a physical card</button>
                                                                }
                                                            </div>
                                                        </div>
                                                    }
                                                    <div className='footer-part'>
                                                        <div className='card-logo'>
                                                            <figure className='visa-logo'>
                                                                <Icon className="Icon" xlinkHref={`${symbolsIcon}#visa-card-icon`} />
                                                            </figure>
                                                        </div>
                                                    </div>
                                                </div>
                                        }
                                        </Col>
                                    }
                                    {
                                    this.state.checkCardType ?
                                    this.state.debitCards !== null && this.state.cardStatus !== 'blocked' &&
                                    this.state.debitCards.map((card, index) => {
                                        return(
                                            <Col className='card-grid' lg={4} md={6} key={index}>
                                                <div className="blue-debit-card">
                                                    <div className='map-bg'>
                                                        <img src="../../../../../assets/images/debit-card/map-texture.png" alt="" />
                                                    </div>
                                                    <div className='header-part'>
                                                        <h3 className="title">My Blue Visa Debit | Virtual</h3>
                                                    </div>
                                                    <div className='body-part'>
                                                        <div className="card-number monospace">
                                                            {
                                                                !this.state.isCardReveal ?
                                                                <React.Fragment>
                                                                    <span className='star'>**** **** ****</span>&nbsp;<span>{card.cardNumber}</span>
                                                                </React.Fragment>
                                                                :
                                                                <React.Fragment>
                                                                    <span className='card-digits'>{this.state.cardNumber.match(/.{1,4}/g).join(' ')}</span>
                                                                    <button className="click-copy" onClick={() => {navigator.clipboard.writeText(this.state.cardNumber)}}><i className="fal fa-copy"></i></button>
                                                                </React.Fragment>
                                                            }
                                                    </div>
                                                    </div>
                                                    <div className='footer-part'>
                                                        <div className='card-logo'>
                                                            <figure className='visa-logo'>
                                                                <Icon className="Icon" xlinkHref={`${symbolsIcon}#visa-card-icon`} />
                                                            </figure>
                                                        </div>
                                                        <ul className="list">
                                                            <li>
                                                                <span className="item-label">Valid Thru</span>
                                                                <div className="item-value">
                                                                    {minimumTwoDigits(card.expiryMonth)+`/`+card.expiryYear}
                                                                    {
                                                                        this.state.isCardReveal ?
                                                                            <button className="click-copy" onClick={() => {navigator.clipboard.writeText(card.expiryMonth+`/`+card.expiryYear)}}>
                                                                                <i className="fal fa-copy"></i>
                                                                            </button>
                                                                        : null
                                                                    }
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <span className="item-label">CVV</span>
                                                                <div className="item-value">
                                                                    {
                                                                        !this.state.isCardReveal ? `***` :
                                                                        <React.Fragment>
                                                                            {this.state.cvcNumber}
                                                                            <button className="click-copy" onClick={() => {navigator.clipboard.writeText(this.state.cvcNumber)}}><i className="fal fa-copy"></i></button>
                                                                        </React.Fragment>
                                                                    }
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                    {isUpdateStatusVirtualCardEnabled &&
                                                        <>
                                                            {
                                                                this.state.cardStatus === "active" ?
                                                                    <React.Fragment>
                                                                        <UncontrolledTooltip placement="bottom" target="lock_or_unlock_virtual_card">Your card is unlocked.<br />Lock it now.</UncontrolledTooltip>
                                                                        {
                                                                            this.state.isVirtualDebitCardUpdateLoading ?
                                                                                <label htmlFor="virtual_card_unlock" className="py-lock-switch" id='lock_or_unlock_virtual_card'>
                                                                                    <Spinner size="sm" style={{ height: "18px", width: "18px" }} color="default" />
                                                                                </label>
                                                                                :
                                                                                <label htmlFor="virtual_card_unlock"
                                                                                    className="py-lock-switch" id='lock_or_unlock_virtual_card'
                                                                                    onClick={(e) => this.updateDebitCardStatus(card._id, "inactive", "virtual")}>
                                                                                    <span className="py-toggle__handle inactive" value="active"></span>
                                                                                </label>
                                                                        }
                                                                    </React.Fragment>
                                                                    :
                                                                    <React.Fragment>
                                                                        <UncontrolledTooltip placement="bottom" target="lock_or_unlock_virtual_card">Your card is locked.<br />Unlock it now.</UncontrolledTooltip>
                                                                        {
                                                                            this.state.isVirtualDebitCardUpdateLoading ?
                                                                                <label htmlFor="virtual_card_lock" className="py-lock-switch" id='lock_or_unlock_virtual_card'>
                                                                                    <Spinner size="sm" style={{ height: "18px", width: "18px" }} color="default" />
                                                                                </label>
                                                                                :
                                                                                <label htmlFor="virtual_card_lock"
                                                                                    className="py-lock-switch" id='lock_or_unlock_virtual_card'
                                                                                    onClick={(e) => this.updateDebitCardStatus(card._id, "active", "virtual")}>
                                                                                    <span className="py-toggle__handle active" value="inactive"></span>
                                                                                </label>
                                                                        }
                                                                    </React.Fragment>
                                                            }
                                                        </>
                                                    }
                                                    <button type='button' id='reveal_button1' className='add-button reveal'
                                                        onClick={(e) => this.state.isCardReveal ? this.revelCardDetails(card._id) : this.openPasswordForRevealModal(card._id)} >
                                                        {
                                                            this.state.isCardReveal ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>
                                                        }
                                                    </button>
                                                    <UncontrolledTooltip placement="bottom" target="reveal_button1">{this.state.isCardReveal ? 'Hide' : 'Reveal'} card details</UncontrolledTooltip>
                                                </div>
                                                <div className='pay_icons'>
                                                    <div>How to add to</div>
                                                    <a className='ms-3' href="https://support.apple.com/en-us/HT204506" target={`_blank`}><Icon className="Icon" xlinkHref={`${symbolsIcon}#apple-pay`} /></a>
                                                    <a className='ms-3' href="https://support.google.com/pay/answer/7625055?hl=en&co=GENIE.Platform%3DAndroid" target={`_blank`}><Icon className="Icon" xlinkHref={`${symbolsIcon}#google-pay`} /></a>
                                                </div>
                                            </Col>
                                        )
                                    }): this.state.cardStatus === 'blocked' ? null :
                                    <Col className='card-grid' lg={4} md={6}>
                                    {isViewVirtualCardEnabled &&
                                        <div className="blue-debit-card">
                                            <div className='map-bg'>
                                                <img src="../../../../../assets/images/debit-card/map-texture.png" alt="" />
                                            </div>
                                            <div className='header-part'>
                                                <h3 className="title">My Blue Visa Debit</h3>
                                            </div>
                                            {isIssueVirtualCardsEnabled &&
                                                <div className='body-part'>
                                                    <div className="apply-physical-card">
                                                        {
                                                            this.state.isRequestVirtualCardLoading ?
                                                                <Spinner size="sm" style={{ height: "18px", width: "18px" }} color="default" />
                                                                : <button className="btn-apply" onClick={this.requestVirtualCard}>Request a virtual card</button>
                                                        }
                                                    </div>
                                                </div>
                                            }
                                            <div className='footer-part'>
                                                <div className='card-logo'>
                                                    <figure className='visa-logo'>
                                                        <Icon className="Icon" xlinkHref={`${symbolsIcon}#visa-card-icon`} />
                                                    </figure>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    </Col>
                                    }
                                </Row>
                            </div>
                            {isShowTransactionsEnabled &&
                                <div className="debitcard-transactions">
                                    <header className="py-header--page d-flex flex-wrap align-items-end">
                                        <div className="py-header--title">
                                            <h2 className="py-heading--title">Transactions</h2>
                                            <span
                                                role="button"
                                                onClick={() => !this.state.isTransactionsLoading && this.getTransactionRecords()}
                                                className="filter__action"
                                            >
                                                {
                                                    this.state.isTransactionsLoading ? <Spinner size="sm" style={{ height: "16px", width: "16px" }} color="default" />
                                                        :
                                                        <Icon
                                                            className="Icon"
                                                            xlinkHref={`${symbolsIcon}#refresh`}
                                                        />
                                                }
                                            </span>
                                        </div>
                                    </header>
                                    <div className="transaction-filter">
                                        <div className="debit-card--filter__range">
                                            <div className="DateRange__control">
                                                <DatepickerWrapper
                                                    maxDate={endDate ? _toDateConvert(endDate) : ''}
                                                    isClearable={!!startDate ? true : false}
                                                    placeholderText="From"
                                                    className="form-control"
                                                    popperPlacement="top-start"
                                                    value={startDate ? _toDateConvert(startDate) : ''}
                                                    onChange={date => this._filter(date, 'startDate')}
                                                    name="startdate"
                                                />
                                                <span className="mx-1">&nbsp;</span>
                                                <DatepickerWrapper
                                                    minDate={startDate ? _toDateConvert(startDate) : ''}
                                                    isClearable={!!endDate ? true : false}
                                                    placeholderText="To"
                                                    popperPlacement="top-start"
                                                    className="form-control"
                                                    value={endDate ? _toDateConvert(endDate) : ''}
                                                    onChange={date => this._filter(date, 'endDate')}
                                                />
                                            </div>
                                        </div>
                                        <div className="input-group amount-filter">
                                            <InputGroup className="btn-search">
                                                <InputGroupText>$</InputGroupText>
                                                <Input
                                                    placeholder={'Search by amount'}
                                                    value={transactionAmount}
                                                    onChange={e => {
                                                        const { value } = e.target
                                                        let filterQuery = cloneDeep(this.state.query)
                                                        filterQuery.transactionAmount = isNaN(value) ? '' : value
                                                        this.setState((prevState) => ({
                                                            ...prevState,
                                                            query: { ...prevState.query, ...filterQuery }
                                                        }));
                                                    }}
                                                    onBlur={() => {
                                                        if (this.state.query.transactionAmount) {
                                                            this._filter(this.state.query.transactionAmount, 'transactionAmount')
                                                        }
                                                    }}
                                                    onKeyDown={(event) => {
                                                        if (event.key === 'Enter' && this.state.query.transactionAmount) {
                                                            event.target.blur();
                                                        }
                                                    }}
                                                    className={!!transactionAmount ? "cross" : ''}
                                                />
                                                {
                                                    !!transactionAmount && (
                                                        <a className="btn-close icon me-2 cross-placeholder append" href="javascript:void(0)" id="reset"
                                                            onClick={
                                                                e => this._filter('', 'transactionAmount')
                                                            }
                                                        >
                                                            <svg viewBox="0 0 20 20" className="py-svg-icon" id="cancel" xmlns="http://www.w3.org/2000/svg"><path d="M11.592 10l5.078 5.078a1.126 1.126 0 0 1-1.592 1.592L10 11.592 4.922 16.67a1.126 1.126 0 1 1-1.592-1.592L8.408 10 3.33 4.922A1.126 1.126 0 0 1 4.922 3.33L10 8.408l5.078-5.078a1.126 1.126 0 0 1 1.592 1.592L11.592 10z"></path></svg>
                                                        </a>
                                                    )
                                                }
                                            </InputGroup>
                                        </div>
                                        <div className="btn-search input-group description-filter">
                                            <InputGroup className="btn-search">
                                                <Input
                                                    placeholder={'Search by description'}
                                                    value={transactionDescription}
                                                    onChange={e => {
                                                        const { value } = e.target
                                                        let filterQuery = cloneDeep(this.state.query)
                                                        filterQuery.transactionDescription = value
                                                        this.setState({ query: filterQuery })
                                                    }}
                                                    className={!!transactionDescription ? "cross" : ''}
                                                />
                                                {
                                                    !!transactionDescription && (
                                                        <a className="btn-close icon me-2 cross-placeholder" href="javascript:void(0)" id="reset"
                                                            onClick={
                                                                e => this._filter('', 'transactionDescription')
                                                            }
                                                        >
                                                            <svg viewBox="0 0 20 20" className="py-svg-icon" id="cancel" xmlns="http://www.w3.org/2000/svg"><path d="M11.592 10l5.078 5.078a1.126 1.126 0 0 1-1.592 1.592L10 11.592 4.922 16.67a1.126 1.126 0 1 1-1.592-1.592L8.408 10 3.33 4.922A1.126 1.126 0 0 1 4.922 3.33L10 8.408l5.078-5.078a1.126 1.126 0 0 1 1.592 1.592L11.592 10z"></path></svg>
                                                        </a>
                                                    )
                                                }
                                                <InputGroupText addonType="append">
                                                    <Button
                                                        onClick={e => this._filter(transactionDescription, 'transactionDescription')}
                                                    ><i className="fal fa-search" aria-hidden="true" /></Button>
                                                </InputGroupText>
                                            </InputGroup>
                                        </div>
                                        {isDownloadTransactionsEnabled &&
                                            <div>
                                                <UncontrolledTooltip placement="bottom" target="exportButton">Export Transaction</UncontrolledTooltip>
                                                <Button id='exportButton' color="primary" onClick={this.handleExportTransaction}><i className="fal fa-download"></i></Button>
                                                {/* <Button color="primary" onClick={e => handleExportTransaction()} className="w-25">Export Transaction</Button> */}
                                            </div>
                                        }
                                    </div>
                                    <div className="react-bootstrap-table">
                                        {
                                            this.state.isTransactionsLoading ?
                                                <Container className="mrT50 text-center">
                                                    <CenterSpinner />
                                                </Container>
                                                :
                                                <DataTableWrapper
                                                    data={this.state.transactions}
                                                    columns={this.state.transactionColumns}
                                                    changePage={this._handlePageChange}
                                                    page={this.state.offset}
                                                    limit={this.state.limit}
                                                    totalData={this.state.totalTransactions}
                                                    sort={this.state.sort}
                                                    sortField='pending'
                                                />
                                        }
                                    </div>
                                </div>
                            }
                        </main>
                        {/* Physical Card Address Modal */}
                        <Modal isOpen={this.state.isAddressModalOpen} toggle={this.toggleAddressModal} className={this.props.className}>
                            <ModalHeader
                                className="pt-3 pb-1"
                                toggle={() =>{ this.setState({ isAddressModalOpen: !this.state.isAddressModalOpen, isRequestPhysicalCardLoading: false })
                            }}>&nbsp;
                                Shipping Address
                            </ModalHeader>
                            <ModalBody>
                                <ShippingAddress
                                    addressBilling={this.state.addressBilling}
                                    handleText={this.handleText}
                                    countryMenus={this.state.countries}
                                    handleSet={this.setAddress}
                                    addressLine1Error={this.state.addressLine1Error}
                                    cityError={this.state.cityError}
                                    stateError={this.state.stateError}
                                    postalError={this.state.postalError}
                                    countryError={this.state.countryError}
                                />
                            </ModalBody>
                            <ModalFooter className="d-block">
                                <div className='text-center mt-3 mb-3'>
                                    {
                                        this.state.isAddressModalLoading ?
                                            <Button color="primary" type="button" className="w-25 ms-auto">
                                                <Spinner size="sm" style={{height:"18px",width:"18px"}} color="default" />
                                            </Button>
                                        : <Button color="primary" type="submit" className="w-25" onClick={this.handleSubmitPhysicalCardAddress}>Confirm</Button>
                                    }
                                </div>
                            </ModalFooter>
                        </Modal>
                        {/* Password Modal */}
                        <Modal isOpen={this.state.isPasswordModalOpen} className={this.props.className}>
                            <ModalHeader
                                className="border-bottom-0 pt-3 pb-1"
                                toggle={() =>{
                                    this.setState({
                                        isPasswordModalOpen: !this.state.isPasswordModalOpen,
                                        isPasswordValidationError: false,
                                        isPasswordRevealButtonDisable: true,
                                        revealCardId: null
                                    })
                            }}>&nbsp;
                            </ModalHeader>
                            <ModalBody>
                            <b><p>Password</p></b>
                            <InputGroup>
                                <Input
                                    type="password"
                                    placeholder="Enter your account password"
                                    className="mt-0"
                                    name="password"
                                    onChange={(event) => this.handlePasswordChange(event)}
                                />
                            </InputGroup>
                            {
                                this.state.isPasswordValidationError &&
                                <FormValidationError
                                    showError={this.state.isPasswordValidationError}
                                    message={this.state.passwordValidationMessage}
                                />
                            }
                            <div className='text-center mt-3 mb-3'>
                                {
                                    this.state.isPasswordSubmitLoading ?
                                        <Button color="primary" type="button" className="w-25 ms-auto">
                                            <Spinner size="sm" style={{height:"18px",width:"18px"}} color="default" />
                                        </Button>
                                    : <Button color="primary" type="submit" className="w-25"
                                        disabled={this.state.isPasswordRevealButtonDisable}
                                        onClick={this.submitPassword}>Submit</Button>
                                }
                            </div>
                            </ModalBody>
                        </Modal>
                    </div>
                }
            </div>
        )
    }
}

const mapStateToProps = state => {
  const { settings: { featureFlags } = {} } = state;
  const isAddBalanceEnabled = get(featureFlags, 'debitCard.addBalance', 'true') === "true"
  const isDownloadTransactionsEnabled = get(featureFlags, 'debitCard.downloadTransactions', 'true') === "true";
  const isIssuePhysicalCardsEnabled = get(featureFlags, 'debitCard.issuePhysicalCard', 'true') === "true";
  const isIssueVirtualCardsEnabled = get(featureFlags, 'debitCard.issueVirtualCard', 'true') === "true";
  const isShowTransactionsEnabled = get(featureFlags, 'debitCard.showTransactions', 'true') === "true";
  const isUpdateStatusVirtualCardEnabled = get(featureFlags,'debitCard.updateStatusVirtualCard', "true")=== "true";
  const isUpdateStatusPhysicalCardEnabled = get(featureFlags,'debitCard.updateStatusPhysicalCard',"true")=== "true";
  const isViewPhysicalCardEnabled = get(featureFlags,'debitCard.viewPhysicalCard',"true")=== "true";
  const isViewVirtualCardEnabled = get(featureFlags,'debitCard.viewVirtualCard',"true")=== "true";
  // Todo => OnMonday
  // Did not get functionality for these 3 flags like where to put them, will check with Hamid on Monday and share updated PR

  // const isUpdateLimitEnabled = getFeatureFlags('debitCard', 'updateLimit');
  // const isUpdatePinPhysicalCardEnabled = getFeatureFlags('debitCard', 'updatePinPhysicalCard');
  // const isUpdatePinVirtualCardEnabled = getFeatureFlags('debitCard', 'updatePinVirtualCard');
  return {
    selectedBusiness: state.businessReducer.selectedBusiness,
    selectedCountryStates: state.customerReducer.selectedCountryStates,
    isAddBalanceEnabled,
    isDownloadTransactionsEnabled,
    isIssuePhysicalCardsEnabled,
    isIssueVirtualCardsEnabled,
    isShowTransactionsEnabled,
    isUpdateStatusVirtualCardEnabled,
    isUpdateStatusPhysicalCardEnabled,
    isViewPhysicalCardEnabled,
    isViewVirtualCardEnabled,
  }
};

const mapDispatchToProps = dispatch => {
    return {
        actions: bindActionCreators(CustomerActions, dispatch),
        showSnackbar: (message, error) => {
            dispatch(openGlobalSnackbar(message, error));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(debitcard)
