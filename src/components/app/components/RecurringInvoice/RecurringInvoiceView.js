import history from "../../../../customHistory";
import { cloneDeep, groupBy } from "lodash";
import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Popover, PopoverBody, Tooltip } from "reactstrap";
import { DeleteModal } from "../../../../utils/PopupModal/DeleteModal";
import { closeMailBox, closePayment } from "../../../../actions";
import { openGlobalSnackbar, updateData } from "../../../../actions/snackBarAction";
import {
  cloneRecurringInvoice, getRecurringInvoice,
  // removePayment, sendInvoice, deleteInvoice,
  updateRecurringInvoice, endRecurringInvoice, deleteRecurringInvoice
} from "../../../../api/RecurringService";
import { sendInvoice, removePayment, deleteInvoice } from "../../../../api/InvoiceService";
import AlertBox from "../../../../global/AlertBox";
import { toDisplayDate } from "../../../../utils/common";
import GetAShareLink from "../invoice/components/InvoiceForm/GetAShareLink";
import SendAReminder from "../invoice/components/InvoiceForm/SendAReminder";
import InvoicePayment, { ACCOUNT } from "../invoice/components/InvoicePayment";
import SendReceipt from "../invoice/components/SendReceipt";
import { invoiceInputRecurring, setStartDate } from "./helpers";
import RecurringStep2 from "./helpers/RecurringStep2";
import RecurrintStep3 from "./helpers/RecurringStep3";
import RecurringStep4 from "./helpers/RecurringStep4";
import RecurringStep5 from "./helpers/RecurringStep5";
import { fetchSalesSetting } from "../../../../api/SettingService";
import { invoiceSettingPayload } from "../setting/components/supportFunctionality/helper";
import { toMoney, _documentTitle, _isValidEmail, getAmountToDisplay, handleAclPermissions, calculateRecurringDueDate } from "../../../../utils/GlobalFunctions";
import CenterSpinner from "../../../../global/CenterSpinner";
import { fetchUsersEmails } from "../../../../api/EstimateServices";
import MailModal from "../../../../global/MailModal";

import Icon from '../../../common/Icon';
import Popup from "../Estimates/components/Popup";
import { _getDateOrdinal, _formatDate, _timeZoneMoment, _toDateConvert, _addDate, _getStartOf, _displayDate, _getDiffDate } from "../../../../utils/globalMomentDateFunc";
import axios from 'axios'
import EventsTimeLine from '../../../common/EventsTimeLine'
import symbolsIcon from "../../../../assets/icons/product/symbols.svg";

class RecurringInvoiceView extends Component {
  state = {
    dropdownOpen: false,
    openReminder: false,
    popoverOpen: false,
    openModal: false,
    stepTwoEdit: false,
    stepThreeEdit: false,
    stepFourEdit: false,
    step2Load: false,
    step4Load: false,
    dropdownOpenMore: false,
    onRecordModal: false,
    modal: false,
    invoiceModal: false,
    selectedCustomer: null,
    invoiceData: invoiceInputRecurring(null, this.props.businessInfo),
    onPrint: false,
    openMail: false,
    openAlert: false,
    openReceiptMail: false,
    isDelete: false,
    paymentMethods: ACCOUNT,
    userSettings: invoiceSettingPayload(),
    loading: false,
    isDuplicate: false,
    fromErr: false,
    fromMsg: '',
    toErr: [],
    tooltipOpen: false,
    iframeHeight: 100,
    renderInvoiceTemplate: null
  };

  componentDidMount = () => {
    const { businessInfo } = this.props;
    _documentTitle(businessInfo, "Recurring Invoice")
    const id = this.props.match.params.id;
    this.fetchInvoiceData(id);
  };

  componentDidUpdate(prevProps) {
    const { updateData } = this.props;
    if (prevProps.updateData !== updateData) {
      const id = this.props.match.params.id;
      this.fetchInvoiceData(id);
    }
  }

  fetchInvoiceData = async (id = this.props.match.params.id) => {
    try {
      this.setState({ loading: true })
      const {
        closePayment,
        closeMailBox,
        isPayment,
        isMailBox,
      } = this.props;
      let response = await getRecurringInvoice(id);

      // const settingRequest = await fetchSalesSetting()
      let sumofTax = await response.data.invoice.amountBreakup.taxTotal.length > 0 ? response.data.invoice.amountBreakup.taxTotal.reduce((a,b) => {
        return a + b.amount
      },0) : 0
      const processingTipAmount =  response.data.invoice.amountBreakup.tip || 0
      let totalWithTax =  sumofTax + response.data.invoice.amountBreakup.subTotal + processingTipAmount || 0
      response.data.invoice.amountBreakup["totalWithTax"] = totalWithTax;
      const getDueData = await calculateRecurringDueDate(response.data.invoice)
      const getInvoiceDate = response.data.invoice.nextInvoiceDate ? response.data.invoice.nextInvoiceDate : null
      await this.fetchTemplateHtml({ ...response.data, invoice: { ...response.data.invoice, dueAmount: response.data.invoice.totalAmount, invoiceNumber:"Auto-generated", invoiceDate: getInvoiceDate, dueDate: getDueData } })
      const email = await fetchUsersEmails(localStorage.getItem('user.id'))
      this.setState({ emails: email.data.emails })
      let invoiceData = response.data.invoice;

      // invoiceData.isManual = invoiceData.currency.code != invoiceData.businessId.currency.code ? true : invoiceData.isManual
      const defaultEmail = invoiceData && invoiceData.customer ? [invoiceData.customer.email] : ['']
      invoiceData.sendMail.to = invoiceData.sendMail.to.length > 0 ? invoiceData.sendMail.to : defaultEmail
      invoiceData.sendMail.from = invoiceData.sendMail.from ? invoiceData.sendMail.from : this.state.emails[0].email
      // invoiceData.sendMail.autoSendEnabled = response.data.invoice.sendMail.autoSendEnabled ? response.data.invoice.sendMail.autoSendEnabled : null
      invoiceData = {
        ...invoiceData, recurrence: { ...this.state.invoiceData.recurrence, ...invoiceData.recurrence }
      };

      const userSettings = response.data.salesSetting
      this.setState({
        invoiceData,
        userSettings,
        loading: false
      }, () => {
        if (isMailBox) {
          this.openMailBox();
          closeMailBox();
        } else if (isPayment) {
          this.onRecordClick();
          closePayment();
        }
      });
    } catch (error) {
      console.log(error)
      if (error.data) {
        this.props.showSnackbar(error.message, true);
        history.push("/app/recurring");
      }
    }
  };

  onLoad = () => {
    this.iframeRef && this.iframeRef.contentWindow && this.iframeRef.contentWindow.addEventListener('resize', this.handleResize);
    this.handleResize();
  }
  componentWillUnmount() {
    this.iframeRef && this.iframeRef.contentWindow && this.iframeRef.contentWindow.removeEventListener('resize', this.handleResize);
  }
  fetchTemplateHtml = (data) => {
    axios
      .post(
        `${process.env.REACT_APP_TEMPLATE_SERVICE_URL}/template-service/invoice.${data.salesSetting.template}/gcs`,
        { ...data }
      )
      .then((res) => {
        return axios.get(res.data.url)
      })
      .then((htmlRes) => this.setState({ renderInvoiceTemplate: htmlRes.data, onPrint: true }, () => this.handleResize()))
      .catch((error) => console.log(error));
  }

  handleResize = () => {
    if (this.iframeRef && this.iframeRef.contentWindow) {
      if (this.iframeRef.contentWindow && this.iframeRef.contentWindow.document) {
        const { body, documentElement } = this.iframeRef && this.iframeRef.contentWindow.document;

        if (body && documentElement) {
          const iframeHeight = Math.max(
            body.clientHeight,
            body.offsetHeight,
            body.scrollHeight,
            documentElement.clientHeight,
            documentElement.offsetHeight,
            documentElement.scrollHeight
          );
          if (iframeHeight !== this.state.iframeHeight) {
            this.setState({ iframeHeight });
          }
        }
      }
    }
  };

  handleEditMode = (type) => {
    let {
      stepTwoEdit,
      stepThreeEdit,
      stepFourEdit
    } = this.state
    switch (type) {
      case 'step2':
        stepTwoEdit = !stepTwoEdit
        stepThreeEdit = false
        stepFourEdit = false
        if (!stepTwoEdit) {
          this.fetchInvoiceData()
        }
        break;
      case 'step3':
        stepTwoEdit = false
        stepThreeEdit = !!this.state.invoiceData.paid.isPaid ? !stepThreeEdit : false
        stepFourEdit = false
        if (!stepThreeEdit) {
          this.fetchInvoiceData()
        }
        break;
      case 'step4':
        stepTwoEdit = false
        stepThreeEdit = false
        stepFourEdit = !stepFourEdit
        if (!stepFourEdit) {
          this.fetchInvoiceData()
        }
        break;
    }
    this.setState({
      stepTwoEdit,
      stepThreeEdit,
      stepFourEdit
    })
  }

  toggleDropdown = () => {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  };

  toggle = () => {
    this.setState({
      popoverOpen: !this.state.popoverOpen
    });
  };

  onCloseMail = () => {
    this.setState({
      openMail: false
    });
  };

  openMailBox = () => {
    this.setState({
      openMail: true
    });
  };

  scheduleRecurringInvoice = async (step, mode) => {
    const invoiceData = cloneDeep(this.state.invoiceData);
    let {
      stepTwoEdit,
      stepThreeEdit,
      stepFourEdit
    } = this.state
    let isErr = true;
    const id = invoiceData._id
    if (step === "step2") {
      const { type, endDate, startDate } = invoiceData.recurrence

      if (type === 'on' && _getDiffDate(endDate, startDate) < 0) {
        this.props.showSnackbar("End date should be greater than start date", true)
        isErr = false
        this.setState({ step2Load: false })
      } if (type === 'after' && !invoiceData.recurrence.maxInvoices) {
        this.props.showSnackbar("Please enter value of after invoice", true)
        isErr = false
        this.setState({ step2Load: false })
      } else {
        if (type === 'never') {
          let d = _addDate(new Date(), 100, 'years')
          invoiceData.recurrence.endDate = _getStartOf(d, 'month');
        }
        stepTwoEdit = false
        invoiceData.recurrence.isSchedule = true
        this.setState({ step2Load: true })
      }

    } else if (step === 'step3') {
      stepThreeEdit = false
      invoiceData.paid.isPaid = true
      invoiceData.paid.manualPayment = true
    } else if (step === 'step4') {
      if (!!invoiceData.sendMail.autoSendEnabled) {
        if (!!invoiceData.sendMail.from) {
          if (_isValidEmail(invoiceData.sendMail.from)) {
            this.setState({ fromErr: false, fromMsg: '' })
          } else {
            this.setState({ fromErr: true, fromMsg: 'Please enter a valid email' })
            isErr = false
          }
        } else {
          this.setState({ fromErr: true, fromMsg: 'This field is required' })
          isErr = false
        }
        let err = this.state.toErr
        if (!!invoiceData.sendMail.to && invoiceData.sendMail.to.length > 0) {
          invoiceData.sendMail.to.map((item, i) => {
            if (!!item) {
              if (_isValidEmail(item)) {
                err = err.filter(erObj => erObj[`to-${i}`] !== true)
              } else {
                err = err.filter(errO => errO[`to-${i}`] !== true)
                err = err.concat({ [`to-${i}`]: true, message: 'Please enter a valid email' })
                isErr = false
              }
            } else {
              err = err.filter(errO => errO[`to-${i}`] !== true)
              err = err.concat({ [`to-${i}`]: true, message: 'This field is required' })
              isErr = false
            }
          })
        } else {
          err = err.filter((errO,i) => errO[`to-${i}`] !== true)
          err = err.concat({ [`to-${err.length}`]: true, message: 'This field is required' })
          isErr = false
        }
        invoiceData.sendMail['autoSendEnabled'] = invoiceData.sendMail.autoSendEnabled === null ? !invoiceData.isManual : invoiceData.sendMail.autoSendEnabled
        this.setState({ toErr: err })
      }

      if (!!isErr) {
        stepFourEdit = false
        invoiceData.sendMail.isSent = true
        this.setState({ step4Load: true })
      }
    }
    else if (step === 'approve') {
      invoiceData.status = 'active'
    }
    if (!!isErr) {
      invoiceData.businessId = typeof (invoiceData.businessId) === 'object' ? invoiceData.businessId._id : invoiceData.businessId
      invoiceData.customer = invoiceData.customer._id
      invoiceData.userId = typeof (invoiceData.userId) === 'object' ? invoiceData.userId._id : invoiceData.userId
      delete invoiceData._id
      delete invoiceData.createdAt
      delete invoiceData.updatedAt
      delete invoiceData.__v
      try {
        const recurringData = await updateRecurringInvoice(id, { invoiceInput: invoiceData });
        if (recurringData.statusCode === 200 || recurringData.statusCode === 201) {
          this.setState({
            stepTwoEdit,
            stepThreeEdit,
            stepFourEdit,
            step2Load: false,
            step4Load: false
          })
          this.props.refreshData()
        } else {
          this.setState({ step2Load: false, step4Load: false })
          this.props.showSnackbar(recurringData.message, true)
        }
      } catch (err) {
        this.setState({ step2Load: false, step4Load: false })
        this.props.showSnackbar(err.message, true)
      }
    } else {
      this.setState({ step2Load: false, step4Load: false })
    }
  }

  addRecipientAddress = () => {
    const invoiceData = cloneDeep(this.state.invoiceData)
    invoiceData.sendMail.to.push("")
    this.setState({ invoiceData })
  }

  removeRecipientAddress = idx => {
    let invoiceData = cloneDeep(this.state.invoiceData);
    invoiceData.sendMail.to = invoiceData.sendMail.to.filter((item, index) => {
      return index !== idx;
    });
    if (invoiceData.sendMail.to.length <= 0) {
      invoiceData.sendMail.to.push("");
    }
    this.setState({ invoiceData });
  };

  onOpenReceiptMail = (item, index) => {
    this.setState({
      openReceiptMail: true,
      receiptItem: item,
      receiptIndex: index,
      openAlert: false
    })
  }

  onCloseReceiptMail = () => {
    this.setState({
      openReceiptMail: false
    })
  }

  onRecordClick = (item, index) => {
    if (index !== null) {
      this.setState({
        onRecordModal: true,
        receiptItem: item,
        receiptIndex: index
      })
    } else {
      this.setState({
        onRecordModal: true
      });
    }
  };

  onRecordClose = () => {
    this.setState({
      onRecordModal: false,
    });
  };

  openCloseReminder = () => {
    this.setState(prevState => ({
      openReminder: !prevState.openReminder
    }));
  };

  onConfirmDelete = () => {
    this.setState({ isDelete: true });
  };

  onCloseModal = () => {
    this.setState({ isDelete: false });
  };

  onDeleteClick = async () => {
    const { refreshData, showSnackbar } = this.props;
    const { invoiceData } = this.state;
    try {
      await deleteInvoice(invoiceData._id);
      refreshData();
      this.onCloseModal();
      history.push("/app/recurring");
    } catch (error) {
      showSnackbar(error.message, true)
    }
  };

  onOpenAlert = (item) => {
    this.setState({
      openAlert: true,
      receiptItem: item
    })
    this.onRecordClose()
  }

  onCloseAlert = () => {
    this.setState({
      openAlert: false
    })
  }


  onShareLink = () => {
    this.setState({
      openShareLink: !this.state.openShareLink
    })
  }

  openPopup = () => {
    const { openMail, openShareLink, openAlert, invoiceData, receiptItem, receiptIndex, onRecordModal, openReminder, openReceiptMail, isDelete } = this.state;
    return (
      <Fragment>
        {
          openMail && (
            <MailModal
              from="Invoice"
              openMail={openMail}
              mailData={invoiceData}
              onClose={this.onCloseMail}
            />
          )
        }
        <GetAShareLink
          openShareLink={openShareLink}
          onClose={this.onShareLink}
          invoiceData={invoiceData}
        />
        <SendReceipt
          openRecord={openReceiptMail}
          invoiceData={invoiceData}
          receipt={receiptItem}
          receiptIndex={receiptIndex}
          onClose={this.onCloseReceiptMail}
          showSnackbar={this.props.showSnackbar}
          refreshData={this.props.refreshData}
        />
        <SendAReminder
          openReminder={openReminder}
          invoiceData={invoiceData}
          onClose={this.openCloseReminder}
        />
        <InvoicePayment
          openRecord={onRecordModal}
          paymentData={invoiceData}
          receipt={receiptItem}
          receiptIndex={receiptIndex}
          onClose={this.onRecordClose}
          openAlert={this.onOpenAlert}
          showSnackbar={this.props.showSnackbar}
          refreshData={this.props.refreshData}
        />
        <DeleteModal
          message={"Are you sure you want to delete this invoice?"}
          openModal={isDelete}
          onDelete={this.onDeleteClick}
          onClose={this.onCloseModal}
          refreshData={this.props.refreshData}
        />
        <AlertBox
          showAlert={openAlert}
          receipt={receiptItem}
          receiptIndex={receiptIndex}
          onConfirm={this.onOpenReceiptMail}
          onCancel={this.onCloseAlert}
        />
      </Fragment>
    );
  };

  onUpdateStatusCall = async status => {
    const invoiceData = this.state.invoiceData;
    if (invoiceData.items.length > 0) {
      try {
        let payload = {};
        if (status === "approve") {
          payload.invoiceInput = { status: "saved" }
        } else {
          if (invoiceData.skipped) {
            payload = {
              invoiceInput: {
                sentVia: "marked_sent",
                lastSent: new Date(),
                skipped: false,
                skippedDate: new Date()
              }
            };

            if (invoiceData.status != "overdue") {
              payload.invoiceInput.status = "sent";
            }
          } else {
            payload = {
              invoiceInput: {
                skipped: true,
                skippedDate: new Date()
              }
            };
          }
        }
        let response = await sendInvoice(invoiceData._id, payload);
        this.setState({ invoiceData: response.data.invoice });
      } catch (error) {
        this.props.showSnackbar(error.message, true);
      }
    } else {
      this.props.showSnackbar(
        "A non-draft invoice must have one or more items",
        true
      );
    }
  };

  setCSSClass = () => {
    const { invoiceData } = this.state;
    if (invoiceData.status === "overdue") {
      return "badge badge-danger";
    } else if (invoiceData.status === "saved") {
      return "badge badge-primary";
    } else if (invoiceData.status === "draft") {
      return "badge badge-gray";
    } else if (invoiceData.status === "paid" || invoiceData.status === "end") {
      return "badge badge-success";
    } else if (invoiceData.status === "partial") {
      return "badge badge-alert";
    } else if (invoiceData.status === "completed") {
      return "badge badge-success";
    } else if (invoiceData.status === "active") {
      return "badge badge-info";
    } else {
      return "";
    }
  };

  onEnd = async () => {
    const id = this.state.invoiceData._id;
    const response = await endRecurringInvoice(id);
    const invoiceId = response.data.invoice._id;
    this.fetchInvoiceData(invoiceId)
  };

  onDuplicate = async () => {
    const id = this.state.invoiceData._id;
    const response = await cloneRecurringInvoice(id);
    const invoiceId = response.data.invoice._id;
    this.fetchInvoiceData(invoiceId)
    history.push(`/app/recurring/view/${invoiceId}?duplicate=true`);
    this.props.showSnackbar("A new duplicate of the recurring invoice has been created.", false);
  };

  onDelete = async () => {
    try {
      const id = this.state.invoiceData._id;
      const response = await deleteRecurringInvoice(id);
      if(response.message === "Success"){
        this.props.showSnackbar("Recurring invoice deleted", false);
        history.push(`/app/recurring`)
      }
      else {
        this.props.showSnackbar(response.message, true);
      }
    } catch (error) {
      this.props.showSnackbar(error.message, true);
    }
  }

  onCustomerViewClick = () => {
    window.open(`${process.env.REACT_APP_WEB_URL}/invoices/readonly/${this.state.invoiceData._id}`)
  }

  onRemovePayment = async (item) => {
    const id = this.state.invoiceData._id;
    await removePayment(id, item._id)
    this.props.refreshData()
  }

  handleScheduler = (event, name, index, selected = null) => {
    let updateInvoice = cloneDeep(this.state.invoiceData)
    if (name === 'unit') {
      updateInvoice.recurrence = {
        ...updateInvoice.recurrence, ...this.setSchedulePaylaod(event.target.value, updateInvoice.recurrence)
      };
    } else if (name === 'subUnit') {
      updateInvoice.recurrence = {
        ...updateInvoice.recurrence, ...this.setSubUnitInPayload(event.target.value, updateInvoice.recurrence)
      }
    } else if (name === 'type') {
      updateInvoice.recurrence = {
        ...updateInvoice.recurrence, ...this.setEndDate(updateInvoice.recurrence, event.target.value)
      }
    } else if (name === 'isSchedule') {
      updateInvoice.recurrence[name] = false
    } else if (name.includes('Date')) {
      if (name === 'startDate' && updateInvoice.recurrence.type === 'on') {
        updateInvoice.recurrence['endDate'] = _formatDate(event)
      }
      updateInvoice.recurrence[name] = _formatDate(event)
    } else if (name === 'monthOfYear') {
      const { startDate } = updateInvoice.recurrence
      updateInvoice.recurrence['startDate'] = setStartDate(event.target.value, 'yearly', startDate)
      updateInvoice.recurrence[name] = event.target.value
    } else if (name === 'dayofMonth') {
      const { unit, startDate } = updateInvoice.recurrence
      updateInvoice.recurrence['startDate'] = setStartDate(event.target.value, unit == 'yearly' ? 'yearlyDays' : 'monthly', startDate)
      updateInvoice.recurrence[name] = event.target.value
    } else if (name === 'dayOfWeek') {
      updateInvoice.recurrence['startDate'] = setStartDate(event.target.value, 'weekly')
      updateInvoice.recurrence[name] = event.target.value
    }
    else if (name === 'timezone') {
      updateInvoice.recurrence[name] = {
        name: event.value,
        offSet: parseInt(_formatDate(_timeZoneMoment(new Date, event.value), 'Z')),
        zoneAbbr: _formatDate(_timeZoneMoment(new Date, event.value), 'z')
      }
    } else if (name === 'autoSendEnabled') {
      updateInvoice.sendMail[name] = event
    } else if (name === 'sendMail') {
      if (!!selected) {
        updateInvoice.sendMail.from = selected.email
      } else {
        if (['copyMyself', 'attachPdf'].includes(event.target.name)) {
          updateInvoice.sendMail[event.target.name] = !updateInvoice.sendMail[event.target.name]
        } else if (event.target.name === 'to') {
          updateInvoice.sendMail[event.target.name][index] = event.target.value
        } else {
          updateInvoice.sendMail[event.target.name] = event.target.value
        }
      }
    } else {
      if (name === 'maxInvoices') {
        updateInvoice.recurrence[name] = event.target ? parseInt(event.target.value) < 1 ? 1 : event.target.value : event.value
      } else {
        updateInvoice.recurrence[name] = event.target ? event.target.value : event.value
      }

    }
    this.setState({ invoiceData: updateInvoice })
  }

  setSubUnitInPayload = (value, recurrence) => {
    switch (value) {
      case 'Day(s)': return {
        isSchedule: recurrence.isSchedule,
        type: recurrence.type,
        interval: recurrence.inter,
        unit: recurrence.unit,
        subUnit: value,
        startDate: _toDateConvert(new Date()),
        timezone: recurrence.timezone
      }
      case 'Year(s)': return {
        isSchedule: recurrence.isSchedule,
        subUnit: value,
        type: recurrence.type,
        interval: recurrence.interval,
        unit: recurrence.unit,
        startDate: _getStartOf(_addDate(new Date(), 1, 'M'), 'month'),
        dayofMonth: _getDateOrdinal(new Date()),
        monthOfYear: _formatDate(new Date(), "MMMM"),
        timezone: recurrence.timezone
      }
      case 'Month(s)': return {
        isSchedule: recurrence.isSchedule,
        subUnit: value,
        type: recurrence.type,
        interval: recurrence.interval,
        unit: recurrence.unit,
        startDate: _getStartOf(_addDate(new Date(), 1, 'M'), 'month'),
        timezone: recurrence.timezone,
        dayofMonth: '1',
      }
      case 'Week(s)': return {
        isSchedule: recurrence.isSchedule,
        type: recurrence.type,
        subUnit: value,
        interval: recurrence.interval,
        unit: recurrence.unit,
        dayOfWeek: _displayDate(new Date(), "dddd"),
        startDate: _toDateConvert(new Date()),
        timezone: recurrence.timezone
      }
    }
  }

  setSchedulePaylaod = (value, recurrence) => {
    switch (value) {
      case 'daily': return {
        isSchedule: recurrence.isSchedule,
        type: recurrence.type,
        interval: recurrence.interval,
        unit: value,
        subUnit: recurrence.subUnit,
        startDate: _toDateConvert(new Date()),
        timezone: recurrence.timezone
      }
      case 'weekly': return {
        isSchedule: recurrence.isSchedule,
        type: recurrence.type,
        subUnit: undefined,
        interval: recurrence.interval,
        unit: value,
        dayOfWeek: _displayDate(new Date(), 'dddd'),
        startDate: _toDateConvert(new Date()),
        timezone: recurrence.timezone
      }
      case 'monthly': return {
        isSchedule: recurrence.isSchedule,
        subUnit: undefined,
        type: recurrence.type,
        interval: recurrence.interval,
        unit: value,
        startDate: _getStartOf(_addDate(new Date(), 1, 'M'), 'month'),
        timezone: recurrence.timezone,
        dayofMonth: '1'
      }
      case 'yearly': return {
        isSchedule: recurrence.isSchedule,
        subUnit: undefined,
        type: recurrence.type,
        interval: recurrence.interval,
        unit: value,
        startDate: _toDateConvert(new Date()),
        dayofMonth: _getDateOrdinal(new Date()),
        monthOfYear: _displayDate(new Date(), 'MMMM'),
        timezone: recurrence.timezone
      }
      case 'custom': return {
        isSchedule: recurrence.isSchedule,
        type: recurrence.type,
        interval: recurrence.interval,
        unit: value,
        subUnit: 'Month(s)',
        dayofMonth: '1',
        monthOfYear: recurrence.monthOfYear,
        startDate: _getStartOf(_addDate(new Date(), 1, 'M'), 'month'),
        timezone: recurrence.timezone
      }
    }
  }

  setEndDate = (recurrence, type) => {
    let updateData = cloneDeep(recurrence)
    updateData.type = type
    switch (type) {
      case 'after':
        delete updateData.endDate
        updateData["maxInvoices"] = 1
        return updateData
      case 'on':
        delete updateData.maxInvoices
        updateData["endDate"] = recurrence.unit === 'daily' ? _getStartOf(_addDate(new Date(), 1, 'M'), 'month') : updateData.startDate
        return updateData
      default:
        delete updateData.endDate
        delete updateData.maxInvoices
        return updateData
    }
  }

  _handleEditCustomer(e) {
    e.preventDefault()
    this.setState({ openPopup: true, editCustomer: true })
    this.toggle()
  }

  onPopupClose = async type => {
    this.setState({ openPopup: !this.state.openPopup })
  }

  setData = selected => {
    const { businessInfo } = this.props
    let { invoiceData, selectedCurency, currencies } = this.state
    invoiceData.customer = selected || ''
    this.setState({
      invoiceData
    })
  }

  updatePaymentModeSettings = (update) => {
    let { invoiceData } = this.state
    let invoiceCurrencyCode = invoiceData.currency && invoiceData.currency.code;
    let invoiceCurrencyCodeFromBusiness = invoiceData.businessId && invoiceData.businessId.currency && invoiceData.businessId.currency.code;
    if (invoiceCurrencyCode !== invoiceCurrencyCodeFromBusiness) {
      invoiceData.paymentModeSetting = {
        allowOnline: false,
        preAuthorized: false
      }
    } else {
      invoiceData.paymentModeSetting = update
    }

    this.setState({ invoiceData })
  }

  toggleTooltip = () => {
    const isOpen = this.state.tooltipOpen;
    this.setState({
      tooltipOpen: !isOpen,
    });
  };

  render() {
    const { userSettings, invoiceData, onPrint, paymentMethods, stepTwoEdit, stepThreeEdit, stepFourEdit, loading, emails, step2Load, step4Load, openPopup, type } = this.state;
    const { customer } = invoiceData;
    return (
      <Fragment>
        <div>
          <div className="content-wrapper__main__fixed">
            <div className="invoice-view-header">
              <header className="py-header--page">
                <div className="py-header--title">
                  <h2 className="py-heading--title text-left">Recurring invoice</h2>
                </div>
                {!handleAclPermissions(['Viewer']) && <div className="py-header--content">
                  <Dropdown
                    className="d-inline-block mrR10"
                    isOpen={this.state.dropdownOpen}
                    toggle={this.toggleDropdown}
                  >
                    <DropdownToggle color="primary" outline caret>More actions</DropdownToggle>
                    <DropdownMenu className="dropdown-menu-center">
                      <DropdownItem key={2} onClick={() => history.push(`/app/invoices?tab=all&rcId=${invoiceData._id}`)} disabled={invoiceData.status === 'draft' || invoiceData.status === 'end'} >View created invoice</DropdownItem>
                      <DropdownItem key={1} onClick={this.onDuplicate} disabled={invoiceData.status === 'end'}>Duplicate</DropdownItem>
                      <DropdownItem key={3} onClick={this.onEnd} disabled={invoiceData.status === 'draft'} >End</DropdownItem>
                      <DropdownItem key={4} onClick={this.onDelete} disabled={invoiceData.status === 'end'} >Delete</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                  <Button
                    onClick={() => history.push("/app/recurring/add")}
                    color="primary" >Create another recurring invoice</Button>
                </div>}
              </header>
            </div>
            <div>
              {
                loading ?
                  <CenterSpinner />
                  :
                  <div>
                    <div className="shadow-box border-0 card-wizard">
                      <div className="invoice-view__body">
                        <div className="invoice-view-summary">
                          <div className="invoice-view-summary__status">
                            <div className="block-label"> Status</div>
                            <div className={this.setCSSClass()}>
                              {" "}
                              {invoiceData.status === "saved"
                                ? "Unsent"
                                : invoiceData.status === 'end' ? 'Ended' : invoiceData.status}{" "}
                            </div>
                          </div>
                          <div className="invoice-view-summary__customer">
                            <div className="block-label"> Customer</div>
                            <div className="summary__customer__name">
                              <button id="Popover1" type="button" onClick={this.toggle}>{customer && customer.customerName}<i className="fal fa-info-circle ms-2" />
                              </button>
                            </div>
                          </div>
                          <div className="invoice-view-summary__amount">
                            <div className="block-label"> Invoice amount</div>
                            <div className="summary__Amount__value">
                              {" "}
                              {invoiceData && `${getAmountToDisplay(invoiceData.currency, invoiceData.totalAmount)}`}
                            </div>
                          </div>
                          <div className="invoice-view-summary__due-date">
                            <div className="block-label">Created to date</div>
                            <div className={`summary__customer__name ${invoiceData.invoiceCount > 0 ? '' : 'd-none'}`}>
                              <button type="button" id="createdInvoices"
                                onClick={() => invoiceData.invoiceCount > 0 && history.push(`/app/invoices/?tab=all&rcId=${invoiceData._id}`)}
                              >
                                {invoiceData.invoiceCount > 0
                                  ? `${invoiceData.invoiceCount} ${invoiceData.invoiceCount > 1 ? 'invoices' : 'invoice'} `
                                  : null}
                              </button>
                            </div>
                            <div className="summary__amount__datevalue ">
                              {invoiceData.invoiceCount > 0
                                ? null
                                : "0 invoice"}
                            </div>
                          </div>
                        </div>
                        <Tooltip placement="top" isOpen={this.state.tooltipOpen}
                          target={`createdInvoices`}
                          toggle={this.toggleTooltip}>
                          View created invoices
                          </Tooltip>
                        <div className="recurring-invoice-view__body">
                          <div className="py-box py-box--large">
                            <div className="invoice-steps-card__options">
                              <div className="invoice-step-Collapsible__header-content recurring-invoice-Collapsible__header-content">

                                <div className={`step-indicate`}>
                                  <div className="step-icon step-done docs-icon">
                                    <Icon
                                      className="Icon"
                                      xlinkHref={`${symbolsIcon}#document`}
                                    />
                                  </div>
                                </div>
                                <div className="py-heading--subtitle">Create Invoice</div>
                                <div className="step-btn-box">
                                  {(invoiceData.status == 'active' || invoiceData.status == 'draft') && !handleAclPermissions(['Viewer']) ? <Button onClick={() => history.push(`/app/recurring/edit/${invoiceData._id}`)} color="primary" outline >Edit</Button> : null}
                                </div>
                              </div>
                            </div>

                            <div className="invoice-steps-card__content mt-3 ms-4 me-2 ps-5">
                              <div className="invoice-create-info">
                                <strong> Created on:&nbsp;</strong>
                                <span>{toDisplayDate(invoiceData.createdAt, false, 'MMMM DD, YYYY')}</span>
                              </div>
                              <div className="invoice-create-info">
                                <strong>Payment terms:</strong>
                                <span> {invoiceData.notifyStatus && invoiceData.notifyStatus.value && invoiceData.notifyStatus.value}</span>
                              </div>
                            </div>
                          </div>

                          <div className="invoice-view__body__vertical-line"></div>

                          {invoiceData ? <RecurringStep2
                            editMode={stepTwoEdit}
                            handleEditMode={this.handleEditMode}
                            invoiceData={invoiceData}
                            handleScheduler={this.handleScheduler}
                            scheduleRecurringInvoice={this.scheduleRecurringInvoice}
                            step2Load={step2Load}
                            isViwer={handleAclPermissions(['Viewer'])}
                          /> : null}
                          <div className="invoice-view__body__vertical-line"></div>
                          {invoiceData ? <RecurrintStep3
                            editMode={stepThreeEdit}
                            stepTwoEdit={stepTwoEdit}
                            handleEditMode={this.handleEditMode}
                            invoiceData={invoiceData}
                            handleGetPaid={this.scheduleRecurringInvoice}
                            updatePaymentModeSettings={this.updatePaymentModeSettings}
                            isViwer={handleAclPermissions(['Viewer'])}
                          /> : null}
                          <div className="invoice-view__body__vertical-line"></div>
                          {invoiceData ? <RecurringStep4
                            editMode={stepFourEdit}
                            stepThreeEdit={stepThreeEdit}
                            handleEditMode={this.handleEditMode}
                            invoiceData={invoiceData}
                            handleSendMail={this.scheduleRecurringInvoice}
                            addRecipientAddress={this.addRecipientAddress}
                            removeRecipientAddress={this.removeRecipientAddress}
                            handleScheduler={this.handleScheduler}
                            step4Load={step4Load}
                            emails={emails}
                            fromErr={this.state.fromErr}
                            fromMsg={this.state.fromMsg}
                            toErr={this.state.toErr}
                            isViwer={handleAclPermissions(['Viewer'])}
                          /> : null}
                          {invoiceData.recurrence.isSchedule &&
                            invoiceData.paid.isPaid &&
                            invoiceData.sendMail.isSent &&
                            invoiceData.status == 'draft' &&
                            <RecurringStep5
                              invoiceData={invoiceData}
                              approveRecurringInvoice={this.scheduleRecurringInvoice}
                              isViwer={handleAclPermissions(['Viewer'])}
                            />
                          }
                          <div>
                            <div className="invoice-view__body__vertical-line"></div>
                            <EventsTimeLine
                              entityId={this.props.match.params.id}
                              loading={this.state.loading}
                            />
                          </div>
                        </div>
                        {this.openPopup()}
                        {onPrint ? <div
                          id="printInvoice"
                          style={{
                            height: `${onPrint ? '100%' : '100%'}`,
                            width: `${onPrint ? '100%' : '100%'}`,
                            padding: '0px',
                          }}
                          className="d-flex align-items-center"
                          ref={el => (this.componentRef = el)}
                        >
                          <iframe
                            className="templateIframe"
                            onLoad={this.onLoad}
                            ref={(e) => { this.iframeRef = e }}
                            style={{
                              width: `820px`,
                              height: `${this.state.iframeHeight}px`
                            }}
                            srcDoc={this.state.renderInvoiceTemplate}
                            frameborder="0"
                            scrolling="no"
                          />
                        </div> : <CenterSpinner />}
                      </div>
                      <Popover
                        placement="bottom"
                        isOpen={this.state.popoverOpen}
                        target="Popover1"
                        toggle={this.toggle}
                      >
                        <PopoverBody className="popover__panel">
                          <i className="fal fa-times pull-right" onClick={this.toggle} />
                          <strong> {customer && customer.customerName} </strong>
                          <div className="address-box">
                            {customer && customer.firstName && (
                              <span> {`${customer.firstName} ${customer.lastName}`} </span>
                            )}
                            {customer && customer.email && <span>{customer.email}</span>}
                            {customer && customer.communication && customer.communication.phone && (
                              <span> {`Tel: ${customer.communication.phone}`}</span>
                            )}
                            {customer && customer.communication && customer.communication.mobile && (
                              <span> {`Mobile: ${customer.communication.mobile}`}</span>
                            )}
                            {customer && customer.communication && customer.communication.website && (
                              <span>{`Website: ${customer.communication.website}`}</span>
                            )}
                          </div>
                          <div className="invoice-view-summary__customer__edit">
                            <a href="javascript:void(0);"
                              onClick={this._handleEditCustomer.bind(this)}
                            >Edit customer information</a>
                          </div>
                        </PopoverBody>
                      </Popover>
                      <Popup
                        type={type}
                        openPopup={openPopup}
                        onClosePopup={this.onPopupClose.bind(this)}
                        setData={this.setData.bind(this)}
                        isEditMode={this.state.editCustomer}
                        customer={customer}
                      />
                    </div>
                  </div>
              }
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

const mapPropsToState = ({ snackbar, settings, businessReducer }) => ({
  updateData: snackbar.updateData,
  isPayment: settings.isPayment,
  isMailBox: settings.isMailBox,
  businessInfo: businessReducer.selectedBusiness,
});

const mapDispatchToProps = dispatch => {
  return {
    refreshData: () => {
      dispatch(updateData());
    },
    showSnackbar: (message, error) => {
      dispatch(openGlobalSnackbar(message, error));
    },
    closePayment: () => {
      dispatch(closePayment());
    },
    closeMailBox: () => {
      dispatch(closeMailBox());
    }
  };
};

export default withRouter(
  connect(
    mapPropsToState,
    mapDispatchToProps
  )(RecurringInvoiceView)
);
