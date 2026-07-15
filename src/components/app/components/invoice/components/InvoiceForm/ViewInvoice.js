import history from '../../../../../../customHistory'
import OnlinePaymentWrapper from '../../../../../../global/OnlinePaymentWrapper'
import * as PaymentIcon from '../../../../../../global/PaymentIcon'
import { cloneDeep, get, get as _get } from 'lodash';
import moment from 'moment'
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { NavLink, withRouter } from 'react-router-dom'
import ReactToPrint from 'react-to-print'
import Icon from '../../../../../common/Icon'
import {
  Button,
  Dropdown,
  ButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Popover,
  PopoverBody,
  Spinner,
  Tooltip,
  Modal
} from 'reactstrap'
import DatepickerWrapper from '../../../../../../utils/formWrapper/DatepickerWrapper'
import { DeleteModal, PaymentConfirmation } from '../../../../../../utils/PopupModal/DeleteModal'
import {
  getAmountToDisplay,
  _showPaymentText,
  _showExchangeRate,
  _showAmount,
  _calculateExchangeRate,
  _downloadPDF
} from '../../../../../../utils/GlobalFunctions'
import { closeMailBox, closePayment } from '../../../../../../actions'
import { getInvoicePayments } from '../../../../../../actions/invoiceActions'
import {
  openGlobalSnackbar,
  updateData
} from '../../../../../../actions/snackBarAction'
import { ReactSVG } from 'react-svg'
import {
  cloneInvoice,
  deleteInvoice,
  getInvoice,
  patchInvoice,
  removePayment,
  sendInvoice
} from '../../../../../../api/InvoiceService'
import { fetchSalesSetting } from '../../../../../../api/SettingService'
import CenterSpinner from '../../../../../../global/CenterSpinner'
import SweetAlertSuccess from '../../../../../../global/SweetAlertSuccess'
import {
  _dueText,
  _paymentMethodDisplay,
  _invoiceDateTime, handleAclPermissions,
  customTimeAgo
} from '../../../../../../utils/GlobalFunctions'
import Popup from '../../../Estimates/components/Popup'
import { invoiceSettingPayload } from '../../../setting/components/supportFunctionality/helper'
import { invoiceInput } from '../../helpers'
import InvoicePayment, { ACCOUNT } from '../InvoicePayment'
import GetAShareLink from './GetAShareLink'
import SendAReminder from './SendAReminder'
import ExportPdfModal from '../../../../../../utils/PopupModal/ExportPdfModal'
import MailModal from '../../../../../../global/MailModal'
import TextMessageModal from '../../../../../../global/TextMessageModal'
import { addRecurringFromInvoice } from '../../../../../../api/RecurringService'
import { _getDiffDate, _subDate, _formatDate, _addDate, _toDateConvert, _convertIntoLocal } from '../../../../../../utils/globalMomentDateFunc'
import axios from 'axios'
import EventsTimeLine from '../../../../../common/EventsTimeLine'
import { fetchBusinessCheckoutFee } from '../../../../../../api/CheckoutService'
import symbolsIcon from "../../../../../../assets/icons/product/symbols.svg";
import icInfoSvg from "../../../../../../assets/icons/ic_info.svg"

let link
class ViewInvoice extends Component {
  constructor(props) {
    super(props);
    this.iframeRef = React.createRef();
  }
  state = {
    dropdownOpen: false,
    invoiceDropdown: false,
    openReminder: false,
    popoverOpen: false,
    openModal: false,
    dropdownOpenMore: false,
    onRecordModal: false,
    modal: false,
    openPaymentConfirm: false,
    invoiceModal: false,
    selectedCustomer: null,
    invoiceData: invoiceInput(),
    onPrint: false,
    openMail: false,
    openText: false,
    openAlert: false,
    openReceiptMail: false,
    isDelete: false,
    paymentMethods: ACCOUNT,
    userSettings: invoiceSettingPayload(),
    loading: true,
    openPopup: false,
    type: 'CustomerPopup',
    editCustomer: false,
    newSentState: new Date(),
    recordStep: '',
    editRecord: false,
    allPayments: null,
    isEditable: true,
    alertTitle: '',
    alertMsg: '',
    from: '',
    paymentIsEdit: false,
    openExportModal: false,
    downloadLoading: false,
    btnLoading: false,
    copyLoad: false,
    convertRecurringLoad: false,
    creditCardDisabled: false,
    bankModeDisabled: false,
    renderInvoiceTemplate: null,
    responseInvoiceData: null,
    iframeHeight: 100,
    businessFee: [],
    businessCreatedAt: null,
    paymentButtons: {
      payWithPaypal: false,
      payLaterWithPaypal: false,
      payWithVenmo: false,
    }
  }

  componentDidMount = async () => {
    await this.fetchInvoiceFee();
    const { businessInfo } = this.props
    document.title =
      businessInfo && businessInfo.organizationName
        ? `Finance - ${businessInfo.organizationName} - Invoices`
        : `Finance - Invoices`
    const id = this.props.match.params.id
    await this.fetchInvoiceData(id);
  }

  componentDidUpdate(prevProps) {
    const { updateData } = this.props
    if (prevProps.updateData !== updateData) {
      const id = this.props.match.params.id
      this.fetchInvoiceData(id)
    }
  }

  fetchInvoiceFee = async () => {
    let feeResponse = (await fetchBusinessCheckoutFee()).data.processingFee;
    this.setState({
      businessFee: feeResponse
    })
  }

  fetchInvoiceData = async () => {
    const id = this.props.match.params.id

    try {
      this.setState({ loading: true })
      const {
        closePayment,
        closeMailBox,
        isPayment,
        isMailBox,
        businessInfo
      } = this.props
      let response = await getInvoice(id)
      let sumofTax = await response.data.invoice.amountBreakup.taxTotal.length > 0 ? response.data.invoice.amountBreakup.taxTotal.reduce((a, b) => {
        return a + b.amount
      }, 0) : 0
      const processingTipAmount = response.data.invoice.amountBreakup.tip || 0
      let totalWithTax = sumofTax + response.data.invoice.amountBreakup.subTotal + processingTipAmount || 0
      response.data.invoice.amountBreakup["totalWithTax"] = totalWithTax;
      await this.fetchTemplateHtml(response.data)
      const settingRequest = await fetchSalesSetting()
      // this.props.getInvoicePayments(id)
      // this.props.getInvoiceEventTimeLine(id);
      const userSettings = response.data.salesSetting
      const invoiceData = invoiceInput(
        response.data.invoice,
        businessInfo,
        userSettings
      )
      this.setState(
        {
          invoiceData,
          businessCreatedAt: _get(response.data.invoice, "businessId.createdAt", null),
          userSettings,
          loading: false,
          newSentState: invoiceData.lastSent,
          allPayments: response.data.payments,
          isEditable: response.data.invoice && response.data.invoice.isEditable,
          responseInvoiceData: response.data,
          paymentButtons: invoiceData.paymentButtons
        },
        () => {
          if (isMailBox) {
            this.openMailBox()
            closeMailBox()
          } else if (isPayment) {
            this.onRecordClick()
            closePayment()
          }


        }
      )
    } catch (error) {
      if (error.data) {
        this.props.showSnackbar(error.message, true)
        history.push('/app/invoices')
      }
    }
  }
  onLoad = () => {
    this.iframeRef.contentWindow.addEventListener('resize', this.handleResize);
    this.handleResize();
  }
  componentWillUnmount() {
    if (this.iframeRef && this.iframeRef.contentWindow) {
      this.iframeRef.contentWindow.removeEventListener('resize', this.handleResize);
    }
  }

  fetchTemplateHtml = (data) => {
    let proceFee = 0
    let amountBreakup = {};
    let dueAmountWithFee = parseFloat(data.invoice.dueAmount);

    const totalProcessingFees = _get(data, "payments", []).reduce((prev, next) => prev + next?.amountBreakup?.fee, 0);
    const totalInvoiceAmount = _get(data, "payments", []).reduce((prev, next) => prev + next?.amountBreakup?.net, 0);

    /*if(data.invoice.shouldAskProcessingFee && data.invoice.amountBreakup.totalWithTax && this.state.businessFee && this.state.businessFee.length > 0 ){
      const card = this.state.businessFee.find((el) => el.type === 'card');
      const tipAmount = parseFloat(data.invoice.tipAmount.paidTip)
      let totalAmount = data.invoice.amountBreakup.totalWithTax + tipAmount
      // proceFee = parseFloat(totalAmount * card.international_fee.dynamic + card.international_fee.fixed).toFixed(2)
      proceFee = parseFloat(parseFloat(
        (totalAmount / (1 - card?.international_fee?.dynamic)) + card?.international_fee?.fixed
      ) - parseFloat(totalAmount)).toFixed(2)

      if (data.invoice.status === 'paid') {
        proceFee = totalProcessingFees;
        totalAmount = totalInvoiceAmount;
      }

      amountBreakup = {
        ...data.invoice.amountBreakup,
        feeStructure: card.international_fee,
        fee: proceFee,
        tip: data.invoice.tipAmount.paidTip,
        total: parseFloat(parseFloat(totalAmount) + parseFloat(proceFee)).toFixed(2)
      }
      if (data.invoice.paidAmount === 0) {
        const dueAmountProceFee = parseFloat(parseFloat(
          (data.invoice.dueAmount / (1 - card?.international_fee?.dynamic)) + card?.international_fee?.fixed
        ) - parseFloat(data.invoice.dueAmount))
        dueAmountWithFee = parseFloat(parseFloat(data.invoice.dueAmount) + dueAmountProceFee).toFixed(2)
      }
    }*/

    // if (!data.invoice.shouldAskProcessingFee) {
    const tipAmount = parseFloat(data.invoice.tipAmount.paidTip)
    amountBreakup = {
      ...data.invoice.amountBreakup,
      tip: data.invoice.tipAmount.paidTip,
      total: parseFloat(parseFloat(data.invoice.amountBreakup.total) + parseFloat(tipAmount)).toFixed(2)
    }
    dueAmountWithFee = data.invoice.dueAmount;
    // }
    axios
      .post(
        `${process.env.REACT_APP_TEMPLATE_SERVICE_URL}/template-service/invoice.${data.salesSetting.template}/gcs`,
        {
          ...data,
          invoice: {
            ...data.invoice,
            amountBreakup: { ...amountBreakup },
            dueAmount: dueAmountWithFee,
          },
        }
      )
      .then((res) => {
        return axios.get(res.data.url)
      })
      .then((htmlRes) => this.setState({ renderInvoiceTemplate: htmlRes.data, onPrint: true }, () => this.handleResize()))
      .catch((error) => console.log(error))
  }

  handleResize = () => {
    if (this.iframeRef && this.iframeRef.contentWindow && this.iframeRef.contentWindow.document) {
      const { body, documentElement } = this.iframeRef.contentWindow.document;
      const iframeHeight = Math.max(
        body.clientHeight,
        body.offsetHeight,
        body.scrollHeight,
        documentElement.clientHeight,
        documentElement.offsetHeight,
        documentElement.scrollHeight
      );
      const minHeight = 1024;
      const height = Math.max(iframeHeight, minHeight);

      if (height !== this.state.iframeHeight) {
        this.setState({ iframeHeight: height });
      }

      // if (iframeHeight !== this.state.iframeHeight) this.setState({ iframeHeight });
    }
  };

  toggleDropdown = () => {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }))
  }

  toggleSendInvoiceDropdown = () => {
    this.setState(prevState => ({
      invoiceDropdown: !prevState.invoiceDropdown
    }))
  }

  toggle = () => {
    this.setState({
      popoverOpen: !this.state.popoverOpen
    })
  }

  onCloseMail = (status, alertTitle, alertMsg, from) => {
    this.setState({
      openMail: false,
      openReceiptMail: false
    })
    if (status === true) {
      this.onOpenAlert(this.state.receiptItem, alertTitle, alertMsg, from)
      this.fetchInvoiceData()
    }
  }

  onCloseText = (status, alertTitle, alertMsg, from) => {
    this.setState({
      openText: false,
      openReceiptMail: false
    })
    if (status === true) {
      this.onOpenAlert(this.state.receiptItem, alertTitle, alertMsg, from)
      this.fetchInvoiceData()
    }
  }

  openMailBox = () => {
    this.setState({
      openMail: true
    })
  }

  openTextBox = () => {
    this.setState({
      openText: true
    })
  }

  onOpenReceiptMail = (item, index) => {
    this.setState({
      openReceiptMail: true,
      openMail: true,
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

  onRecordClick = () => {
    this.setState({
      onRecordModal: true
    });
  };

  onRecordClose = refresh => {
    // ('in close', this.state.onRecordModal)
    this.setState({
      onRecordModal: false
    })
    if (refresh === true) {
      this.fetchInvoiceData()
    }
  }

  setReminder = e => {
    const { name, value } = e.target
    let invoiceData = cloneDeep(this.state.invoiceData)
    invoiceData = {
      ...this.state.invoiceData,
      schedule: {
        ...this.state.invoiceData.schedule,
        [name]: {
          ...this.state.invoiceData.schedule[name],
          enable: !this.state.invoiceData.schedule[name].enable
        }
      }
    }
    const remiderCheck = [
      'beforeFourteen',
      'beforeSeven',
      'beforeThree',
      'onDueDate',
      'afterThree',
      'afterSeven',
      'afterFourteen'
    ]
    const isReminder = remiderCheck?.filter(item => {
      return invoiceData.schedule[item].enable === true
    })
    invoiceData.isReminder = isReminder.length > 0
    const invoiceDueDate = new Date(invoiceData.dueDate);
    switch (name) {
      case 'beforeFourteen':
        invoiceData.schedule[name].notifyDate = _formatDate(
          _subDate(invoiceDueDate, 14, 'd')
        )
        break
      case 'beforeSeven':
        invoiceData.schedule[name].notifyDate = _formatDate(_subDate(invoiceDueDate, 7, 'd'))
        break
      case 'beforeThree':
        invoiceData.schedule[name].notifyDate = _formatDate(_subDate(invoiceDueDate, 3, 'd'))
        break
      case 'onDueDate':
        invoiceData.schedule[name].notifyDate = _formatDate(invoiceDueDate)
        break
      case 'afterThree':
        invoiceData.schedule[name].notifyDate = _formatDate(_addDate(invoiceDueDate, 3, 'd'))
        break
      case 'afterSeven':
        invoiceData.schedule[name].notifyDate = _formatDate(_addDate(invoiceDueDate, 7, 'd'))
        break
      case 'afterFourteen':
        invoiceData.schedule[name].notifyDate = _formatDate(_addDate(invoiceDueDate, 14, 'd'))
        break
    }
    this.setState(
      {
        invoiceData
      },
      () => {
        this.addReminder(invoiceData)
      }
    )
  }

  addReminder = async (invoiceData) => {
    try {
      let invoice = invoiceInput(invoiceData)
      const id = invoice._id
      delete invoice._id
      delete invoice.onlinePayments
      // invoice.customer
      delete invoice.businessId
      await patchInvoice(id, { invoiceInput: invoice })
    } catch (error) {
      this.props.showSnackbar(error.message, true)
    }
  }

  openCloseReminder = () => {
    this.setState(prevState => ({
      openReminder: !prevState.openReminder
    }))
  }

  onConfirmDelete = () => {
    this.setState({ isDelete: true })
  }

  onCloseModal = () => {
    this.setState({ isDelete: false })
  }

  onDeleteClick = async () => {
    const { refreshData, showSnackbar } = this.props
    const { invoiceData } = this.state
    try {
      await deleteInvoice(invoiceData._id)
      // refreshData();
      this.onCloseModal()
      history.push('/app/invoices')
    } catch (error) {
      showSnackbar(error.message, true)
    }
  }

  onOpenAlert = (item, title, msg, from) => {
    this.setState({
      openAlert: true,
      receiptItem: item,
      alertTitle: title,
      alertMsg: msg,
      from
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
    const {
      openMail,
      openText,
      openPaymentConfirm,
      openShareLink,
      openAlert,
      invoiceData,
      receiptItem,
      receiptIndex,
      onRecordModal,
      openReminder,
      openReceiptMail,
      isDelete,
      editRecord,
      alertMsg,
      alertTitle,
      from,
      paymentIsEdit,
      openExportModal,
      downloadLoading,
      btnLoading,
      copyLoad
    } = this.state
    return (
      <Fragment>
        {
          openMail && (
            <MailModal
              from={!!openReceiptMail ? "Receipt" : "Invoice"}
              openMail={openMail}
              mailData={invoiceData}
              receipt={receiptItem}
              onClose={this.onCloseMail.bind(this)}
              businessInfo={this.props.businessInfo}
            />
          )
        }
        {
          openText && (
            <TextMessageModal
              from={!!openReceiptMail ? "Receipt" : "Invoice"}
              openMail={openText}
              textData={invoiceData}
              receipt={receiptItem}
              textMessage={`${this.props.businessInfo.organizationName} has sent you an invoice via Finance. Click the link below to view & pay.`}
              onClose={this.onCloseText.bind(this)}
              businessInfo={this.props.businessInfo}
            />
          )
        }
        <GetAShareLink
          openShareLink={openShareLink}
          onClose={this.onShareLink}
          invoiceData={invoiceData}
          copyMarkSent={() => this._markAsSent(new Date())}
          copyLoad={copyLoad}
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
          refreshData={() => this.fetchInvoiceData()}
          recordStep={this.state.recordStep}
          onOpenReceiptMail={this.onOpenReceiptMail}
          edit={editRecord}
          isEdit={paymentIsEdit}
        />
        <PaymentConfirmation
          openModal={openPaymentConfirm}
          paymentData={invoiceData}
          payment={receiptItem}
          onConfirm={this.onRemovePayment}
          onClose={this.onPaymentClick}
        />
        <DeleteModal
          message={'Are you sure you want to delete this invoice?'}
          openModal={isDelete}
          onDelete={this.onDeleteClick}
          onClose={this.onCloseModal}
          refreshData={this.props.refreshData}
          number={invoiceData.invoiceNumber}
        />
        <SweetAlertSuccess
          showAlert={openAlert}
          receipt={receiptItem}
          receiptIndex={receiptIndex}
          onConfirm={this.onOpenReceiptMail}
          onCancel={this.onCloseAlert}
          title={alertTitle}
          message={alertMsg}
          from={from}
        />
        <ExportPdfModal
          openModal={openExportModal}
          onClose={() =>
            this.setState({ openExportModal: !this.state.openExportModal })
          }
          onConfirm={this.exportPDF.bind(this, true)}
          loading={downloadLoading}
          from="invoice"
          btnLoading={btnLoading}
        />
      </Fragment>
    )
  }

  onEditOnlinePayment = async e => {
    let invoiceData = invoiceInput(this.state.invoiceData)
    const id = invoiceData._id
    const { name, value } = e.target
    invoiceData = {
      ...this.state.invoiceData,
      onlinePayments: {
        ...this.state.invoiceData.onlinePayments,
        [name]: !this.state.invoiceData.onlinePayments[name]
      }
    }
    this.setState({ invoiceData })
    try {
      this.setState({ creditCardDisabled: true, bankModeDisabled: true })
      // delete invoiceData._id
      // invoiceData.businessId = typeof invoiceData.businessId === "object" ? invoiceData.businessId._id : invoiceData.businessId;
      let res = await sendInvoice(id, {
        invoiceInput: {
          onlinePayments: {
            modeCard: invoiceData.onlinePayments.modeCard,
            modeBank: invoiceData.onlinePayments.modeBank
          }
        }
      })
      if (res.statusCode === 200) {
        this.setState({ invoiceData: res.data.invoice })
        this.setState({
          creditCardDisabled: false,
          bankModeDisabled: false
        })
      }
      this.setState({
        creditCardDisabled: false,
        bankModeDisabled: false
      })
    } catch (error) {
      this.props.showSnackbar(error.message, true)
      let invoiceData = {
        ...this.state.invoiceData,
        onlinePayments: {
          ...this.state.invoiceData.onlinePayments,
          [name]: !this.state.invoiceData.onlinePayments[name]
        }
      }
      this.setState({ creditCardDisabled: false, bankModeDisabled: true, invoiceData })
    }
  }

  onUpdateStatusCall = async status => {
    const invoiceData = this.state.invoiceData
    if (invoiceData.items.length > 0) {
      try {
        this.setState({ appLoad: true })
        let payload = {}
        if (status === 'approve') {
          payload.invoiceInput = { status: 'saved' }
        } else {
          if (invoiceData.skipped) {
            payload = {
              invoiceInput: {
                sentVia: 'marked_sent',
                lastSent: new Date(),
                skipped: false,
                skippedDate: new Date()
              }
            }

            if (invoiceData.status != 'overdue') {
              payload.invoiceInput.status = 'sent'
            }
          } else {
            payload = {
              invoiceInput: {
                skipped: true,
                skippedDate: new Date()
              }
            }
          }
        }
        let response = await sendInvoice(invoiceData._id, payload)
        if (response.statusCode === 200) {
          this.setState({
            invoiceData: response.data.invoice,
            openShareLink: false,
            appLoad: false
          })
        } else {
          this.setState({ appLoad: false })
          this.props.showSnackbar(response.message, true)
        }
      } catch (error) {
        this.setState({ appLoad: false })
        this.props.showSnackbar(error.message, true)
      }
    } else {
      this.setState({ appLoad: false })
      this.props.showSnackbar(
        'A non-draft invoice must have one or more items',
        true
      )
    }
  }

  _markAsSent = async date => {
    const invoiceData = this.state.invoiceData
    if (invoiceData.items.length > 0) {
      try {
        this.setState({ copyLoad: true, loading: true })
        let payload = {}
        if (invoiceData.status === 'approve') {
          payload.invoiceInput = { status: 'saved' }
        } else {
          payload = {
            invoiceInput: {
              sentVia: 'marked_sent',
              lastSent: new Date(date),
              skipped: false,
              skippedDate: new Date()
            }
          }

          if (invoiceData.status !== 'overdue') {
            payload.invoiceInput.status = 'sent'
          }
        }
        let response = await sendInvoice(invoiceData._id, payload)
        if (response.statusCode === 200) {
          this.setState({
            invoiceData: response.data.invoice,
            openShareLink: false,
            newSentState: response.data.invoice.lastSent,
            editDate: false,
            loading: false
          })
          this.setState({ copyLoad: false })
        } else {
          this.setState({ copyLoad: false })
          this.props.showSnackbar(response.message, true)
        }
      } catch (error) {
        this.setState({ copyLoad: false })
        this.props.showSnackbar(error.message, true)
      }
    } else {
      this.setState({ copyLoad: false })
      this.props.showSnackbar(
        'A non-draft invoice must have one or more items',
        true
      )
    }
  }

  setCSSClass = () => {
    const { invoiceData } = this.state
    if (invoiceData.status === 'overdue') {
      return 'badge badge-danger'
    } else if (invoiceData.status === 'saved') {
      return 'badge badge-secondary'
    } else if (invoiceData.status === 'draft') {
      return 'badge badge-gray'
    } else if (invoiceData.status === 'paid') {
      return 'badge badge-success'
    } else if (invoiceData.status === 'completed') {
      return 'badge badge-success'
    } else if (invoiceData.status === 'partial') {
      return 'badge badge-alert'
    } else if (invoiceData.status === 'sent') {
      return 'badge badge-info'
    } else if (invoiceData.status === 'viewed') {
      return 'badge badge-warning'
    } else if (invoiceData.status === 'refunded') {
      return 'badge badge-warning'
    } else {
      return 'badge badge-gray'
    }
  }

  exportPDF = async (download) => {
    try {
      const date = _formatDate(new Date(), 'YYYY-MM-DD')
      const { responseInvoiceData } = this.state
      const data = responseInvoiceData
      this.setState({
        btnLoading: true
      })
      if (!download) {
        this.setState({ openExportModal: true, downloadLoading: true })
        try {
          data.salesSetting.template = 'modern';
          const res = await axios
            .post(
              `${process.env.REACT_APP_TEMPLATE_SERVICE_URL}/template-service/invoice.${data.salesSetting.template}/pdf`,
              { ...data },
              {
                headers: {
                  Accept: 'application/pdf',
                },
              }
            )
          const blob = `data:application/pdf;base64,${res.data}`
          link = document.createElement('a')
          link.href = blob
        } catch (err) {
          this.props.showSnackbar('Something went wrong.', true)
          this.setState({ openExportModal: false })
        }
      }
      if (link) {
        this.setState({ downloadLoading: false, btnLoading: false })
        if (download) {
          this.setState({ openExportModal: false, btnLoading: false })
          link.download = `Invoice_${date}.pdf`
          link.click()
        }
      } else {
        this.setState({ downloadLoading: false })
        this.props.showSnackbar(
          'Failed to download PDF. Please try again after sometime.',
          true
        )
      }
    } catch (err) {
      console.log(err)
    }

  }

  onDuplicate = async () => {
    const id = this.state.invoiceData._id
    const response = await cloneInvoice(id)
    const invoiceId = response.data.invoice._id
    history.push(`/app/invoices/edit/${invoiceId}`)
    this.props.showSnackbar("A new duplicate of the invoice has been created.", false);
  }


  onRemovePayment = async () => {
    const { invoiceData, receiptItem } = this.state
    try {
      let response = await removePayment(invoiceData._id, receiptItem._id)
      if (response.statusCode === 200) {
        this.props.refreshData()
        this.onPaymentClick(undefined)
      } else {
        this.props.showSnackbar(response.message, true)
      }
    } catch (err) {
      this.props.showSnackbar(err.message, true)
    }
  }

  onPaymentClick = item => {
    this.setState(prevState => ({
      openPaymentConfirm: !prevState.openPaymentConfirm,
      receiptItem: item
    }))
  }


  createRecurringFromInvoice = async () => {
    this.setState({ convertRecurringLoad: true })
    try {
      const recurringAdd = await addRecurringFromInvoice(this.state.invoiceData._id)
      if (recurringAdd.statusCode === 201) {
        this.setState({ convertRecurringLoad: false })
        this.props.showSnackbar(recurringAdd.message, false)
        history.push({
          pathname: `/app/recurring/view/${recurringAdd.data.invoice._id}`,
        })
      }
    } catch (err) {
      this.setState({ convertRecurringLoad: false })
      this.props.showSnackbar(err.message, true)
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

  renderCreatedDate = (date) => {

    const localDate = _convertIntoLocal(date);
    return _invoiceDateTime(localDate, false, 'MMM DD, YYYY', true, 'ha z')
  }

  handlePaymentButtons = async (e, buttonType) => {
    let invoiceData = invoiceInput(this.state.invoiceData)
    const id = invoiceData._id

    this.setState({
      paymentButtons: {
        ...this.state.paymentButtons,
        [buttonType]: e.target.checked
      }
    })

    try {
      await sendInvoice(id, {
        invoiceInput: {
          paymentButtons: {
            ...this.state.paymentButtons,
            [buttonType]: e.target.checked
          }
        }
      })
    } catch (error) {
      this.props.showSnackbar(error.message, true)
    }
  }

  render() {
    let { businessInfo, paymentSettings, isChargeCardEnabled } = this.props
    const {
      invoiceData,
      onPrint,
      userSettings,
      loading,
      type,
      openPopup,
      appLoad,
      allPayments,
      isEditable
    } = this.state
    const { currency } = invoiceData
    let paymentsInvoice = []
    if (!!allPayments) {
      if (allPayments.length > 0) {
        paymentsInvoice = allPayments
      }
    }

    if (paymentsInvoice.length > 0) {
      paymentsInvoice.map(item => {
        item.text = '<span>'
        if (item.method === 'manual') {
          item.text += `${_showPaymentText(
            item.paymentDate,
            currency,
            item.type,
            item.amount
          )}
            ${_showExchangeRate(
            businessInfo.currency,
            currency,
            item.exchangeRate
          ) && item.exchangeRate
              ? `(${getAmountToDisplay(
                businessInfo.currency,
                item.amountInHomeCurrency ? item.amountInHomeCurrency : _calculateExchangeRate(item.exchangeRate, item.amount)
              )} ${businessInfo.currency.code} ${item.exchangeRate ? `@ ${item.exchangeRate}` : ''})`
              : ''
            } was made${_paymentMethodDisplay(item.methodToDisplay)}.`
        } else if (item.method === 'card') {
          item.text += `${_showPaymentText(
            item.paymentDate,
            currency,
            item.type,
            item.amount
          )}
            ${_showExchangeRate(
            businessInfo.currency,
            currency,
            item.exchangeRate
          ) && item.exchangeRate
              ? `(${getAmountToDisplay(
                businessInfo.currency,
                item.amountInHomeCurrency ? item.amountInHomeCurrency : _calculateExchangeRate(item.exchangeRate, item.amount)
              )} ${businessInfo.currency.code} ${item.exchangeRate ? `@ ${item.exchangeRate}` : ''})`
              : ''
            }
            was made using ${!!item.card.type ? `<img
            src=${process.env.REACT_APP_WEB_URL.includes('localhost') && PaymentIcon
                ? `/${PaymentIcon[item.card.type]}`
                : `${PaymentIcon[item.card.type]}`
              }
            style='height:24px; width:38px; vertical-align:sub' /> ending in ${item.card.number
              }.` : 'card'}
           `
        } else if (item.method === 'bank') {
          item.text += `${_showPaymentText(
            item.paymentDate,
            currency,
            item.type,
            item.amount
          )}
            ${_showExchangeRate(
            businessInfo.currency,
            currency,
            item.exchangeRate
          ) && item.exchangeRate
              ? `(${getAmountToDisplay(
                businessInfo.currency,
                item.amountInHomeCurrency ? item.amountInHomeCurrency : _calculateExchangeRate(item.exchangeRate, item.amount)
              )} ${businessInfo.currency.code} ${item.exchangeRate ? `@ ${item.exchangeRate}` : ''})`
              : ''
            } was made using
            <img
              src=${process.env.REACT_APP_WEB_URL.includes('localhost') && PaymentIcon
              ? `/${PaymentIcon['bank']}`
              : `${PaymentIcon['bank']}`
            } style="height:24px; width:38px; vertical-align:sub"/> (${item.bank &&
            item.bank.name &&
            item.bank.name}${!!item.bank &&
              !!item.bank.number ?
              ` ••• ${item.bank.number}` : ''}).`
        }
        item.text += `<div><small className="color-muted">${!!item.memo ? item.memo : ''
          }</small></div></span>`
        return item
      })
    }
    const isSendMailToCust =
      invoiceData.status !== 'draft' && invoiceData.skipped
    const dateDiffrence = _getDiffDate(invoiceData.dueDate)
    const { customer, payments } = invoiceData
    const isViewer = handleAclPermissions(['Viewer'])
    let isFourteenDaysCompleted = false;
    if (this.state.businessCreatedAt) {
      const days = moment(new Date(), 'YYYY-MM-DD').utc().diff(moment(this.state.businessCreatedAt, "YYYY-MM-DD").utc(), "days")
      if (days >= 14) {
        isFourteenDaysCompleted = true;
      }
    }

    return (
      <Fragment>
        <div className="content-wrapper__main__fixed invoiceWrapper">
          {loading ? (
            <CenterSpinner />
          ) : (
            this.state.convertRecurringLoad ? <Modal className="business-loader" isOpen={this.state.convertRecurringLoad}><CenterSpinner /></Modal> :
              <Fragment>
                <div className="invoice-view">
                  <div className="invoice-view-header">
                    <header className="py-header--page">
                      <div className="py-header--title">
                        <h2 className="py-heading__title text-break">
                          {' '}
                          {invoiceData.title.substr(0, 99)} #{invoiceData.invoiceNumber}{' '}
                        </h2>
                      </div>
                      <div className="py-header--actions">
                        {
                          (!isViewer && !!paymentSettings && !paymentSettings.loading && !!paymentSettings.data && !!paymentSettings.data.isOnboardingApplicable) && (
                            <OnlinePaymentWrapper
                              status={
                                invoiceData &&
                                invoiceData.onlinePayments.businessEnabled || invoiceData.onlinePayments.modePayByBank
                              }
                              offScreen={
                                invoiceData &&
                                invoiceData.onlinePayments &&
                                invoiceData.onlinePayments.systemEnabled
                              }
                              handleChangeMode={e => this.onEditOnlinePayment(e)}
                              invoiceData={invoiceData.onlinePayments}
                              creditCardDisabled={this.state.creditCardDisabled}
                              bankModeDisabled={this.state.bankModeDisabled}
                              handlePaymentButtons={this.handlePaymentButtons}
                              paymentButtons={this.state.paymentButtons}
                            />
                          )
                        }
                        <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown} >
                          <DropdownToggle color="primary" outline caret>More actions</DropdownToggle>
                          <DropdownMenu className="dropdown-menu-center">
                            {!isViewer && <DropdownItem key={1} onClick={this.onDuplicate}>Duplicate</DropdownItem>}
                            {/* {!isViewer && <DropdownItem key={2} onClick={this.createRecurringFromInvoice} >Make recurring</DropdownItem>} */}
                            {!isViewer && <DropdownItem divider />}
                            <DropdownItem key={3} onClick={this.exportPDF.bind(this, false)} >Export as PDF</DropdownItem>
                            {!isViewer && <DropdownItem key={4} onClick={this.onShareLink}>Get share link</DropdownItem>}
                            <ReactToPrint trigger={() => <DropdownItem key={5}><a className="print"> Print </a></DropdownItem>} content={() => this.componentRef} />
                            {!isViewer && <DropdownItem divider />}
                            {!isViewer && <DropdownItem key={6} onClick={() => history.push('/app/setting/invoice-customization')} >Customize</DropdownItem>}
                            <DropdownItem key={7} onClick={() => window.open(`${invoiceData.publicView.shareableLinkUrl}?isUser=false`, "_blank")} >Preview as customer</DropdownItem>
                            {!isViewer && <DropdownItem divider />}
                            {!isViewer && <DropdownItem key={8} onClick={this.onConfirmDelete} >Delete</DropdownItem>}
                          </DropdownMenu>
                        </ButtonDropdown>
                        {!isViewer && <Button onClick={() => history.push('/app/invoices/add')} color="primary" >Create another invoice</Button>}
                      </div>
                    </header>
                  </div>

                  <div className="invoice-view__body">
                    <div className="invoice-view-summary">
                      <div className="invoice-view-summary__status">
                        <div className="block-label"> Status</div>
                        <div
                          style={{ marginTop: '8px' }}
                          className={this.setCSSClass()}
                        >
                          {' '}
                          {invoiceData.status === 'saved'
                            ? 'Unsent'
                            : invoiceData.status}{' '}
                        </div>
                      </div>
                      <div className="invoice-view-summary__customer">
                        <div className="block-label"> Customer</div>
                        <div className="summary__customer__name">
                          <button
                            id="Popover1"
                            type="button"
                            onClick={this.toggle}
                          >{invoiceData.customer.customerName}
                            <i className="fal fa-info-circle ms-2" />
                            {/* <span className="fa-stack fa-sm">
                                  <i className="fal fa-circle-o fa-stack-1x"></i>
                                  <i className="fal fa-info fa-stack-1x"></i>
                                </span> */}
                          </button>
                        </div>
                      </div>
                      <div className="invoice-view-summary__amount">
                        <div className="block-label"> Amount due</div>
                        <div className="summary__Amount__value">
                          {' '}
                          {invoiceData
                            ? getAmountToDisplay(
                              invoiceData.currency,
                              invoiceData.dueAmount
                            )
                            : ''}
                        </div>
                      </div>
                      <div className="invoice-view-summary__due-date">
                        <div className="block-label">
                          {_dueText(invoiceData.dueDate)}
                        </div>
                        <div className="summary__amount__datevalue">
                          {' '}
                          {invoiceData.dueAmount > 0
                            ? customTimeAgo(invoiceData.dueDate, '1')
                            : '--'}{' '}
                        </div>
                      </div>
                    </div>
                    <div className="py-box py-box--large">
                      {invoiceData.status.toLowerCase() === 'draft' ? (
                        <div
                          className={`py-notify py-notify--sm py-notify--info invoice-state-${invoiceData.status.toLowerCase()}`}
                        >
                          <ReactSVG
                            src={icInfoSvg}
                            afterInjection={(error, svg) => {
                              if (error) {
                                return
                              }
                            }}
                            beforeInjection={svg => {
                              svg.classList.add('py-svg-icon')
                            }}
                            renumerateIRIElements={false}
                            className="py-notify__icon-holder"
                          />
                          <div className="py-notify__content-wrapper">
                            <div className="py-notify__content">
                              This is a{' '}
                              <span className="py-text--strong py-text--uppercase">
                                draft
                              </span>{' '}
                              invoice. You can take further actions once you
                              approve it.
                            </div>
                          </div>
                        </div>
                      ) : (
                        ''
                      )}
                      <div className="invoice-steps-card__options">
                        <div className="invoice-step-Collapsible__header-content">
                          <div className="step-indicate">
                            {invoiceData.status === 'draft' ? (
                              <div className="step-icon docs-icon">
                                <Icon
                                  className="Icon"
                                  xlinkHref={`${symbolsIcon}#document`}
                                />
                              </div>
                            ) : (
                              <div className="step-icon step-done docs-icon">
                                <Icon
                                  className="Icon"
                                  xlinkHref={`${symbolsIcon}#document`}
                                />
                              </div>
                            )}
                          </div>

                          <div className="py-heading--subtitle">Create invoice</div>
                          {!isViewer && <div className="invoice-step-card__actions">
                            {invoiceData.status === 'draft' && (
                              <Button
                                onClick={() => this.onUpdateStatusCall('approve')}
                                color="primary"
                                disabled={appLoad}
                              >{appLoad ? <Spinner size="sm" color="default" /> : "Approve draft"}</Button>
                            )}
                            <Button
                              onClick={() =>
                                history.push(
                                  `/app/invoices/edit/${invoiceData._id}`
                                )
                              }
                              disabled={!isEditable}
                              color="primary"
                              outline
                            >
                              {invoiceData.status === 'draft'
                                ? `Edit draft`
                                : `Edit invoice`}
                            </Button>
                          </div>}
                        </div>
                      </div>
                      <div className="invoice-steps-card__content mt-3 ms-4 me-2 ps-5">
                        <div className="invoice-create-info mt-0">
                          <span className="py-text--strong">Created:&nbsp;</span>
                          <span>
                            {this.renderCreatedDate(invoiceData.createdAt)}
                            {invoiceData.isRecurring ? (
                              <span>
                                {' '}from a{' '}
                                <NavLink
                                  to={`recurring/view/${'5cc4a012fe5cbf100cef6ed6'}`}
                                  className="py-text--strong"
                                >
                                  recurring invoice
                                </NavLink>
                              </span>
                            ) : (
                              ''
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="invoice-view__body__vertical-line"></div>

                    <div
                      className={
                        invoiceData.status === 'draft'
                          ? 'py-box py-box--large disabled'
                          : 'py-box py-box--large'
                      }
                    >
                      <div className="invoice-steps-card__options">
                        <div className="invoice-step-Collapsible__header-content">
                          <div
                            className={`${invoiceData.skipped ||
                              invoiceData.status === 'draft'
                              ? 'step-indicate de-activate'
                              : 'step-indicate'
                              }`}
                          >
                            {(['sent', 'partial', 'paid'].includes(
                              invoiceData.status
                            ) &&
                              invoiceData.skipped) ||
                              invoiceData.sentVia === 'marked_sent' ? (
                              <div className="step-icon step-done plane-icon">
                                <Icon
                                  className="Icon"
                                  xlinkHref={`${symbolsIcon}#paper_plane`}
                                />
                              </div>
                            ) : (
                              <div className="step-icon plane-icon">
                                <Icon
                                  className="Icon"
                                  xlinkHref={`${symbolsIcon}#paper_plane`}
                                />
                              </div>
                            )}
                          </div>
                          <div className="py-heading--subtitle">Send invoice</div>
                          {!isViewer && <React.Fragment>
                            {['sent', 'partial', 'overdue'].includes(
                              invoiceData.status
                            ) &&
                              !invoiceData.skipped &&
                              !!invoiceData.sentVia ? (
                              <div className="invoice-step-card__actions">
                                <ButtonDropdown color="primary" isOpen={this.state.invoiceDropdown} outline={!!invoiceData.sentVia} toggle={this.toggleSendInvoiceDropdown} >
                                  <DropdownToggle color="primary" outline={!!invoiceData.sentVia} caret>Resend invoice via</DropdownToggle>
                                  <DropdownMenu className="dropdown-menu-center">
                                    <DropdownItem key={1} onClick={this.openMailBox}>Email Address</DropdownItem>
                                    <DropdownItem key={2} onClick={this.openTextBox} >Text Message</DropdownItem>
                                  </DropdownMenu>
                                </ButtonDropdown>
                                <Button
                                  onClick={this.onShareLink}
                                  color="primary"
                                  outline
                                >Get share link</Button>
                              </div>
                            ) : (
                              invoiceData.status !== 'draft' && (
                                <div className="invoice-step-card__actions">
                                  <ButtonDropdown isOpen={this.state.invoiceDropdown} outline={invoiceData.sentVia === ''} toggle={this.toggleSendInvoiceDropdown} >
                                    <DropdownToggle color="primary" disabled={this.state.copyLoad} outline={invoiceData.sentVia === ''} caret>Send invoice via</DropdownToggle>
                                    <DropdownMenu className="dropdown-menu-center">
                                      <DropdownItem key={1} onClick={this.openMailBox}>Email Address</DropdownItem>
                                      <DropdownItem key={2} onClick={this.openTextBox} >Text Message</DropdownItem>
                                    </DropdownMenu>
                                  </ButtonDropdown>
                                  {invoiceData.status !== 'draft' ? (
                                    <Button
                                      onClick={this.onShareLink}
                                      color="primary"
                                      outline
                                      disabled={this.state.copyLoad}
                                    >Get share link</Button>
                                  ) : (
                                    <Button
                                      onClick={this.onUpdateStatusCall}
                                      color="primary"
                                      outline
                                      disabled={this.state.copyLoad}
                                    >
                                      {this.state.copyLoad ? <Spinner size={'sm'} color="default" /> : invoiceData.skipped
                                        ? `Mark as sent`
                                        : `Skip Sending`}
                                    </Button>
                                  )}
                                </div>
                              )
                            )}
                          </React.Fragment>}
                        </div>
                      </div>
                      <div className="invoice-steps-card__content mt-3 ms-4 me-2 ps-5">
                        {invoiceData.skipped ? (
                          <div className="invoice-create-info">
                            {/* <strong>Skipped:</strong> */}
                            <span> {`This invoice was marked as sent.`} </span>
                          </div>
                        ) : (
                          <div className="invoice-create-info mt-3">
                            <div className="">
                              <span className="py-text--strong">
                                Last sent:&nbsp;
                              </span>
                              <Fragment>
                                {!!invoiceData.sentVia ? (
                                  invoiceData.lastSent ? (
                                    <span style={{ left: '10px' }}>
                                      {/* Marked as sent{' '} */}
                                      {_invoiceDateTime(invoiceData.lastSent, false, 'MMM DD, YYYY', true, 'ha z')}
                                      {' '}
                                      {!isViewer && <Fragment>
                                        {this.state.editDate ? (
                                          <Fragment>
                                            &nbsp;
                                            <div className="py-form-field__element">
                                              <DatepickerWrapper
                                                selected={!!this.state.newSentState && _toDateConvert(this.state.newSentState)}
                                                popperPlacement="top-end"
                                                onChange={date => {
                                                  this.setState({
                                                    newSentState: new Date(date)
                                                  })
                                                }}
                                                maxDate={_toDateConvert(new Date())}
                                                className="form-control"
                                                style={{
                                                  width: '140px',
                                                  marginTop: '10px'
                                                }}
                                              />
                                            </div>
                                            &nbsp;
                                            <a
                                              href="javascript: void(0)"
                                              className="py-text--strong"
                                              disabled={isViewer}
                                              onClick={() => {
                                                this._markAsSent(
                                                  this.state.newSentState
                                                )
                                              }}
                                            >
                                              Save
                                            </a>
                                            &nbsp;or&nbsp;
                                            <a
                                              href="javascript: void(0)"
                                              className="py-text--strong"
                                              onClick={() => {
                                                this.setState({ editDate: false })
                                              }}
                                            >
                                              Cancel
                                            </a>
                                          </Fragment>
                                        ) : (
                                          <Fragment>
                                            {this.state.editDateTool && (
                                              <Tooltip placement="top" isOpen={this.state.editDateTool === true}
                                                target={`edit-date`}
                                                toggle={() => this.setState({ editDateTool: !this.state.editDateTool })}
                                              >
                                                Edit date
                                              </Tooltip>)}
                                            <a
                                              href="javascript: void(0)"
                                              className="py-text--strong text-underline Icon"
                                              onClick={() => {
                                                this.setState({ editDate: true })
                                              }}
                                              disabled={isViewer}
                                              id="edit-date"
                                            >
                                              <Icon
                                                className="Icon"
                                                xlinkHref={`${symbolsIcon}#edit-pen`}
                                              />
                                            </a>
                                          </Fragment>
                                        )}
                                      </Fragment>}
                                    </span>
                                  ) : (
                                    <span>
                                      Never —{' '}
                                      <a
                                        href="javascript: void(0)"
                                        className="py-text--strong"
                                        disabled={isViewer}
                                        onClick={() => !isViewer ? this._markAsSent(new Date()) : ''}
                                      >

                                        {this.state.copyLoad ? <Spinner size={'sm'} color="default" style={{ height: '20px', width: '20px', borderWidth: '2px' }} /> : 'Mark as sent'}
                                      </a>{' '}
                                      to set up reminders
                                    </span>
                                  )
                                ) : invoiceData.status === 'draft' ? (
                                  'Never'
                                ) : (
                                  <span>
                                    Never —{' '}
                                    <a
                                      href="javascript: void(0)"
                                      className="py-text--strong"
                                      disabled={isViewer}
                                      onClick={() => !isViewer ? this._markAsSent(new Date()) : ''}
                                    >
                                      {this.state.copyLoad ? <Spinner size={'sm'} color="default" style={{ height: '20px', width: '20px', borderWidth: '2px' }} /> : 'Mark as sent'}
                                    </a>{' '}
                                    to set up reminders
                                  </span>
                                )}{' '}
                              </Fragment>
                            </div>
                            {invoiceData.lastViewedOn && (
                              <span>
                                <strong>Last viewed by customer: </strong>
                                <span>
                                  {_invoiceDateTime(
                                    invoiceData.lastViewedOn,
                                    true,
                                    'lll',
                                    true,
                                    'ha z',
                                    'pastWithTime'
                                  )}
                                </span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="invoice-view__body__vertical-line"></div>
                    {invoiceData.status === 'draft' ||
                      invoiceData.sentVia === '' ? (
                      <div
                        className={
                          invoiceData.status === 'draft' ||
                            invoiceData.sentVia === ''
                            ? 'py-box py-box--large'
                            : 'py-box py-box--large'
                        }
                      >
                        <div className="invoice-steps-card__options">
                          <div className="invoice-step-Collapsible__header-content">
                            <div
                              className={
                                invoiceData.status === 'draft'
                                  ? 'step-indicate de-activatEventsTimeLineEventsTimeLinee'
                                  : 'step-indicate'
                              }
                            >
                              <div className="step-icon card-icon">
                                <Icon
                                  className="Icon"
                                  xlinkHref={`${symbolsIcon}#creditcard`}
                                />
                              </div>
                            </div>
                            <div className="py-heading--subtitle">Get paid</div>

                            {!isViewer && <div className="invoice-step-card__actions">
                              {!invoiceData.status.includes('draft') &&
                                isFourteenDaysCompleted &&
                                invoiceData.dueAmount > 0 && (
                                  <Fragment>
                                    {(!!paymentSettings && !paymentSettings.loading && !!paymentSettings.data && !!paymentSettings.data.isConnected && !!paymentSettings.data.isOnboardingApplicable && !paymentSettings.data.isKycIssue) ? (
                                      <Button
                                        onClick={() =>
                                          this.onRecordClick(null, null, 1)
                                        }
                                        color="primary d-none"
                                        disabled={invoiceData.sentVia === ''}
                                      >
                                        Charge a credit card
                                      </Button>
                                    ) : (
                                      ''
                                    )}
                                  </Fragment>
                                )}
                            </div>}
                          </div>
                        </div>

                        <div className="invoice-steps-card__content mt-3 ms-4 me-2 ps-5">
                          <div className="invoice-create-info">
                            <span className="py-text--strong">
                              Amount due:{' '}
                              <span className="py-text--normal">
                                {invoiceData
                                  ? getAmountToDisplay(
                                    invoiceData.currency,
                                    invoiceData.dueAmount
                                  )
                                  : ' '}
                              </span>
                            </span>
                            <span>
                              <a
                                href="javascript: void(0)"
                                onClick={this.onRecordClick}
                                className="py-text--strong"
                              >
                                &nbsp;record a payment
                              </a>{' '}
                              manually
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={
                          invoiceData.sentVia === ''
                            ? 'py-box py-box--large disabled'
                            : 'py-box py-box--large'
                        }
                      >
                        <div className="invoice-steps-card__options">
                          <div className="invoice-step-Collapsible__header-content">
                            <div className="step-indicate">
                              {invoiceData.status === 'paid' ? (
                                <div className="step-icon step-done card-icon">
                                  <Icon
                                    className="Icon"
                                    xlinkHref={`${symbolsIcon}#creditcard`}
                                  />
                                </div>
                              ) : (
                                <div className="step-icon card-icon">
                                  <Icon
                                    className="Icon"
                                    xlinkHref={`${symbolsIcon}#creditcard`}
                                  />
                                </div>
                              )}
                            </div>
                            <div className="py-heading--subtitle">Get paid</div>
                            {!isViewer && <div className="invoice-step-card__actions">
                              {!invoiceData.status.includes('draft') && !invoiceData.status.includes('paid') && (
                                <Fragment>
                                  {/* && invoiceData.onlinePayments && invoiceData.onlinePayments.modeCard */}
                                  {(!!paymentSettings && !paymentSettings.loading && !!paymentSettings.data && !!paymentSettings.data.isConnected && !!paymentSettings.data.isOnboardingApplicable && !paymentSettings.data.isKycIssue && isFourteenDaysCompleted) ? (
                                    <Button
                                      onClick={() =>
                                        this.onRecordClick(null, null, 1)
                                      }
                                      color={`primary ${isChargeCardEnabled ? '' : 'd-none'}`}
                                      outline
                                      disabled={invoiceData.sentVia === ''}
                                    >Charge a card on file</Button>
                                  ) : (
                                    ''
                                  )}

                                  <Button
                                    onClick={() =>
                                      this.onRecordClick(null, null, 2)
                                    }
                                    color="primary"
                                    outline={currency.code == businessInfo.currency.code && invoiceData &&
                                      invoiceData.onlinePayments &&
                                      invoiceData.onlinePayments.systemEnabled}
                                    disabled={invoiceData.sentVia === ''}
                                  >Record payment</Button>
                                </Fragment>
                              )}
                              {/* <Button onClick={() => history.push('/app/sales/customer/add')} className="btn btn-rounded btn-gray">Skip Sending</Button> */}
                            </div>}
                          </div>
                        </div>
                        <div className="invoice-steps-card__content mt-3 ms-4 me-2 ps-5">
                          <div className="invoice-create-info d-flex justify-content-between">
                            <div>
                              <span className="py-text--strong">
                                {' '}
                                Amount due:&nbsp;
                              </span>
                              <span>
                                {invoiceData
                                  ? getAmountToDisplay(
                                    invoiceData.currency,
                                    invoiceData.dueAmount
                                  )
                                  : ''}
                              </span>
                            </div>
                            <span className="invoice-view-payment-section__content__info__status">
                              <span className="py-text--strong">Status:&nbsp;</span>

                              {invoiceData.status === 'paid'
                                ? 'Your invoice is paid in full'
                                : invoiceData.status === 'partial'
                                  ? 'Your invoice is partially paid'
                                  : 'Your invoice is awaiting payment'}
                            </span>
                          </div>
                        </div>

                        {invoiceData.status !== 'paid' &&
                          !!invoiceData.sentVia ? (
                          <div className="if-scheduling">
                            <div className="invoice-view-payment-section__content">
                              <div className="invoice-payment-reminders">
                                <div className="invoice-payment-reminders__description-header">
                                  <strong className="py-text--strong">
                                    Get paid on time by scheduling payment
                                    reminders for your customer:
                                  </strong>
                                </div>
                                {isSendMailToCust && (
                                  <Fragment>
                                    <br />
                                    <div className={`alert-action alert-warning`}>
                                      <div className="alert-icon"><i className="fal fa-exclamation-triangle" /></div>
                                      <div className="alert-content">
                                        <div className="alert-desc">To schedule payment reminders for your customer, you must first send the invoice or mark it as sent.</div>
                                      </div>
                                    </div>
                                  </Fragment>
                                )}
                                {!invoiceData.customer.email && (
                                  <Fragment>
                                    <br />
                                    <div className={`alert-action alert-warning`}>
                                      <div className="alert-icon"><i className="fal fa-exclamation-triangle" /></div>
                                      <div className="alert-content">
                                        <div className="alert-desc">Reminders are disabled, because your customer doesn't have an email address on file.</div>
                                      </div>
                                    </div>
                                  </Fragment>
                                )}
                                <div
                                  className={`invoice-payment-reminders__reminders invoice-payment-reminders__reminders--disabled`}
                                >
                                  <div className="invoice-payment-reminders__reminders__row invoice-payment-reminders__reminders__header">
                                    <div className="invoice-payment-reminders__reminders__row__item mrB0">
                                      <span className=" fs-med color-muted">
                                        Remind before due date
                                      </span>
                                    </div>
                                    <div className="invoice-payment-reminders__reminders__row__item mrB0">
                                      <span className=" fs-med color-muted">
                                        Remind on due date
                                      </span>
                                    </div>
                                    <div className="invoice-payment-reminders__reminders__row__item mrB0">
                                      <span className=" fs-med color-muted">
                                        Remind after due date
                                      </span>
                                    </div>
                                  </div>
                                  <div className="invoice-payment-reminders__reminders__row">
                                    <div className="invoice-payment-reminders__reminders__row__item mrT0">
                                      <div className="invoice-payment-reminders__reminders__row__item__reminder">
                                        <div
                                          className={
                                            isSendMailToCust ||
                                              !(dateDiffrence >= 14) ||
                                              invoiceData.dueAmount === 0 ||
                                              !invoiceData.customer.email
                                              ? 'checkbox disable'
                                              : 'checkbox'
                                          }
                                          disabled={
                                            isSendMailToCust ||
                                            !(dateDiffrence >= 14) ||
                                            invoiceData.dueAmount === 0 ||
                                            !invoiceData.customer.email
                                          }
                                        >
                                          <label className="py-checkbox">
                                            <input
                                              type="checkbox"
                                              className="py-form__element"
                                              name={'beforeFourteen'}
                                              onChange={this.setReminder}
                                              checked={
                                                invoiceData.schedule.beforeFourteen &&
                                                invoiceData.schedule.beforeFourteen.enable
                                              }
                                              disabled={
                                                isSendMailToCust ||
                                                !(dateDiffrence >= 14) ||
                                                invoiceData.dueAmount === 0 ||
                                                !invoiceData.customer.email
                                              }
                                            />
                                            <span className="py-form__element__faux"></span>
                                            <span className="py-form__element__label">
                                              14 days before
                                            </span>
                                          </label>
                                        </div>
                                      </div>
                                      <div className="invoice-payment-reminders__reminders__row__item__reminder">
                                        <div
                                          className={
                                            isSendMailToCust ||
                                              !(dateDiffrence >= 7) ||
                                              invoiceData.dueAmount === 0 ||
                                              !invoiceData.customer.email
                                              ? 'checkbox disable'
                                              : 'checkbox'
                                          }
                                          disabled={
                                            isSendMailToCust ||
                                            !(dateDiffrence >= 7) ||
                                            invoiceData.dueAmount === 0 ||
                                            !invoiceData.customer.email
                                          }
                                        >
                                          <label className="py-checkbox">
                                            <input
                                              type="checkbox"
                                              name={'beforeSeven'}
                                              className="py-form__element"
                                              onChange={this.setReminder}
                                              checked={
                                                invoiceData.schedule.beforeSeven &&
                                                invoiceData.schedule.beforeSeven.enable
                                              }
                                              disabled={
                                                isSendMailToCust ||
                                                !(dateDiffrence >= 7) ||
                                                invoiceData.dueAmount === 0 ||
                                                !invoiceData.customer.email
                                              }
                                            />
                                            <span className="py-form__element__faux"></span>
                                            <span className="py-form__element__label">
                                              7 days before
                                            </span>
                                          </label>
                                        </div>
                                      </div>
                                      <div className="invoice-payment-reminders__reminders__row__item__reminder">
                                        <div
                                          className={
                                            isSendMailToCust ||
                                              !(dateDiffrence >= 3) ||
                                              invoiceData.dueAmount === 0 ||
                                              !invoiceData.customer.email
                                              ? 'checkbox disable'
                                              : 'checkbox'
                                          }
                                          disabled={
                                            isSendMailToCust ||
                                            !(dateDiffrence >= 3) ||
                                            invoiceData.dueAmount === 0 ||
                                            !invoiceData.customer.email
                                          }
                                        >
                                          <label className="py-checkbox">
                                            <input
                                              type="checkbox"
                                              name={'beforeThree'}
                                              onChange={this.setReminder}
                                              checked={
                                                invoiceData.schedule.beforeThree &&
                                                invoiceData.schedule.beforeThree.enable
                                              }
                                              disabled={
                                                isSendMailToCust ||
                                                !(dateDiffrence >= 3) ||
                                                invoiceData.dueAmount === 0 ||
                                                !invoiceData.customer.email
                                              }
                                            />
                                            <span className="py-form__element__faux"></span>
                                            <span className="py-form__element__label">
                                              3 days before
                                            </span>
                                          </label>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="invoice-payment-reminders__reminders__row__item mrT0">
                                      <div className="invoice-payment-reminders__reminders__row__item__reminder">
                                        <div
                                          className={
                                            isSendMailToCust ||
                                              !(dateDiffrence > 0) ||
                                              invoiceData.dueAmount === 0 ||
                                              !invoiceData.customer.email
                                              ? 'checkbox disable'
                                              : 'checkbox'
                                          }
                                          disabled={
                                            isSendMailToCust ||
                                            !(dateDiffrence > 0) ||
                                            invoiceData.dueAmount === 0 ||
                                            !invoiceData.customer.email
                                          }
                                        >
                                          <label className="py-checkbox">
                                            <input
                                              type="checkbox"
                                              name={'onDueDate'}
                                              onChange={this.setReminder}
                                              checked={
                                                invoiceData.schedule.onDueDate &&
                                                invoiceData.schedule.onDueDate.enable
                                              }
                                              disabled={
                                                isSendMailToCust ||
                                                !(dateDiffrence > 0) ||
                                                invoiceData.dueAmount === 0 ||
                                                !invoiceData.customer.email
                                              }
                                            />

                                            <span className="py-form__element__faux"></span>
                                            <span className="py-form__element__label">
                                              {' '}
                                              On due date
                                            </span>
                                          </label>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="invoice-payment-reminders__reminders__row__item mrT0">
                                      <div className="invoice-payment-reminders__reminders__row__item__reminder">
                                        <div
                                          className={
                                            isSendMailToCust ||
                                              !(dateDiffrence >= -2) ||
                                              invoiceData.dueAmount === 0 ||
                                              !invoiceData.customer.email
                                              ? 'checkbox disable'
                                              : 'checkbox'
                                          }
                                          disabled={
                                            isSendMailToCust ||
                                            !(dateDiffrence >= -2) ||
                                            invoiceData.dueAmount === 0 ||
                                            !invoiceData.customer.email
                                          }
                                        >
                                          <label className="py-checkbox">
                                            <input
                                              type="checkbox"
                                              name={'afterThree'}
                                              onChange={this.setReminder}
                                              checked={
                                                invoiceData.schedule.afterThree &&
                                                invoiceData.schedule.afterThree.enable
                                              }
                                              disabled={
                                                isSendMailToCust ||
                                                !(dateDiffrence >= -2) ||
                                                invoiceData.dueAmount === 0 ||
                                                !invoiceData.customer.email
                                              }
                                            />

                                            <span className="py-form__element__faux"></span>
                                            <span className="py-form__element__label">
                                              3 days after
                                            </span>
                                          </label>
                                        </div>
                                      </div>
                                      <div className="invoice-payment-reminders__reminders__row__item__reminder">
                                        <div
                                          className={
                                            isSendMailToCust ||
                                              !(dateDiffrence >= -2) ||
                                              invoiceData.dueAmount === 0 ||
                                              !invoiceData.customer.email
                                              ? 'checkbox disable'
                                              : 'checkbox'
                                          }
                                          disabled={
                                            isSendMailToCust ||
                                            !(dateDiffrence >= -2) ||
                                            invoiceData.dueAmount === 0 ||
                                            !invoiceData.customer.email
                                          }
                                        >
                                          <label className="py-checkbox">
                                            <input
                                              type="checkbox"
                                              name={'afterSeven'}
                                              onChange={this.setReminder}
                                              checked={
                                                invoiceData.schedule.afterSeven &&
                                                invoiceData.schedule.afterSeven.enable
                                              }
                                              disabled={
                                                isSendMailToCust ||
                                                !(dateDiffrence >= -2) ||
                                                invoiceData.dueAmount === 0 ||
                                                !invoiceData.customer.email
                                              }
                                            />
                                            <span className="py-form__element__faux"></span>
                                            <span className="py-form__element__label">
                                              7 days after
                                            </span>
                                          </label>
                                        </div>
                                      </div>
                                      <div className="invoice-payment-reminders__reminders__row__item__reminder">
                                        <div
                                          className={
                                            isSendMailToCust ||
                                              !(dateDiffrence >= -2) ||
                                              invoiceData.dueAmount === 0 ||
                                              !invoiceData.customer.email
                                              ? 'checkbox disable'
                                              : 'checkbox'
                                          }
                                          disabled={
                                            isSendMailToCust ||
                                            !(dateDiffrence >= -2) ||
                                            invoiceData.dueAmount === 0 ||
                                            !invoiceData.customer.email
                                          }
                                        >
                                          <label className="py-checkbox">
                                            <input
                                              type="checkbox"
                                              name={'afterFourteen'}
                                              onChange={this.setReminder}
                                              checked={
                                                invoiceData.schedule.afterFourteen &&
                                                invoiceData.schedule.afterFourteen.enable
                                              }
                                              disabled={
                                                isSendMailToCust ||
                                                !(dateDiffrence >= -2) ||
                                                invoiceData.dueAmount === 0 ||
                                                !invoiceData.customer.email
                                              }
                                            />

                                            <span className="py-form__element__faux"></span>
                                            <span className="py-form__element__label">
                                              14 days after
                                            </span>
                                          </label>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          ''
                        )}
                        <div className="if-paid">
                          <div className="invoice-view-payment-section__content">
                            {invoiceData.dueAmount > 0 && (
                              <Fragment>
                                <span>
                                  <a
                                    className="py-text--link "
                                    onClick={() =>
                                      window.open(
                                        `${process.env.REACT_APP_WEB_URL}/invoices-preview/${invoiceData._id}`
                                      )
                                    }
                                  >
                                    {'See a preview '}
                                  </a>
                                  of the reminder email
                                  {invoiceData.customer &&
                                    typeof invoiceData.customer === 'object' &&
                                    invoiceData.customer.customerEmail && (
                                      <Fragment>
                                        ,or{' '}
                                        <a
                                          onClick={this.openCloseReminder}
                                          className=""
                                        >
                                          {' '}
                                          send a reminder
                                        </a>
                                        &nbsp;now.
                                      </Fragment>
                                    )}
                                </span>
                                <br />
                                {/* <span>
                                    3 reminders were sent for this invoice. The last
                                    reminder was sent yesterday.
                                  </span> */}
                              </Fragment>
                            )}
                            {allPayments &&
                              allPayments.length > 0 && (
                                // invoiceData.payments.map((item, index) => {
                                //   return (
                                <div className="invoice-view-payment-section__content__payment-details">
                                  <div className="py-divider"> </div>
                                  <div>
                                    <strong className="py-text--strong">
                                      Payments received:
                                    </strong>
                                  </div>
                                  {allPayments.map(
                                    (item, index) => {
                                      return (
                                        <div
                                          className="invoice-view-payment-section__content__payment-details__description"
                                          key={index}
                                        >
                                          <div
                                            dangerouslySetInnerHTML={{
                                              __html: item.text
                                            }}
                                          />
                                          {!isViewer && <div className="invoice-view-payment-section__content__payment-details__actions">
                                            <a
                                              onClick={() =>
                                                this.onOpenReceiptMail(
                                                  item,
                                                  index
                                                )
                                              }
                                              className="py-text--link "
                                            >
                                              Send a receipt
                                            </a>
                                            <span className="bullet-divider">
                                              ·
                                            </span>
                                            <a
                                              className="py-text--link "
                                              onClick={() =>
                                                this.onRecordClick(
                                                  item,
                                                  index,
                                                  2,
                                                  item.method !== 'manual',
                                                  true
                                                )
                                              }
                                            >
                                              Edit payment
                                            </a>
                                            <span>
                                              <span className="bullet-divider">
                                                ·
                                              </span>
                                              {item.method === 'manual' ? (
                                                <a
                                                  onClick={() =>
                                                    this.onPaymentClick(item)
                                                  }
                                                  className="py-text--link "
                                                >
                                                  Remove payment
                                                </a>
                                              ) : (
                                                <a
                                                  onClick={() =>
                                                    window.open(
                                                      `${process.env.REACT_APP_WEB_URL
                                                      }/app/payments/${item.type === 'refund'
                                                        ? 'refunds'
                                                        : 'view-payment'
                                                      }/${item._id}`
                                                    )
                                                  }
                                                  className="Link__External"
                                                >
                                                  View Details
                                                </a>
                                              )}
                                              {/* <Button onClick={() => this.onPaymentClick(item)} className="py-text--link">
                                                      Remove payment
                                                    </Button> */}
                                            </span>
                                          </div>}
                                        </div>
                                      )
                                    }
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    )}
                    <div>
                      <div class="invoice-view__body__vertical-line"></div>
                      <EventsTimeLine
                        entityId={this.props.match.params.id}
                        loading={this.state.loading}
                        status={invoiceData.status}
                      />
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
                        srcdoc={this.state.renderInvoiceTemplate}
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
                      <i
                        className="fal fa-times pull-right"
                        onClick={this.toggle}
                      />
                      <strong> {customer.customerName} </strong>
                      <div className="address-box">
                        {customer.firstName && (
                          <span>
                            {' '}
                            {`${customer.firstName} ${customer.lastName}`}{' '}
                          </span>
                        )}
                        {customer.email && <span>{customer.email}</span>}
                        {customer.communication &&
                          customer.communication.phone && (
                            <span> {`Tel: ${customer.communication.phone}`}</span>
                          )}
                        {customer.communication &&
                          customer.communication.mobile && (
                            <span>
                              {' '}
                              {`Mobile: ${customer.communication.mobile}`}
                            </span>
                          )}
                        {customer.communication &&
                          customer.communication.website && (
                            <span>{`Website: ${customer.communication.website}`}</span>
                          )}
                        {/* <span>Notes: Create first user</span> */}
                      </div>
                      <div className="invoice-view-summary__customer__edit">
                        <a
                          className="py-text--link"
                          href="javascript:void(0);"
                          onClick={this._handleEditCustomer.bind(this)}
                        >
                          Edit customer information
                        </a>
                      </div>
                    </PopoverBody>
                  </Popover>
                </div>
                <Popup
                  type={type}
                  openPopup={openPopup}
                  onClosePopup={this.onPopupClose.bind(this)}
                  setData={this.setData.bind(this)}
                  isEditMode={this.state.editCustomer}
                  customer={customer}
                />
              </Fragment>
          )}
        </div>
      </Fragment>
    )
  }
}

const mapPropsToState = ({
  snackbar,
  settings,
  businessReducer,
  getAllInvoicePayments,
  paymentSettings,
  // timelines
}) => {
  const provider = businessReducer.selectedBusiness.provider;
  const isChargeCardEnabled = get(settings.featureFlags, `${provider}PaymentMode.manualCharge`, 'false') === 'true';
  return {
    updateData: snackbar.updateData,
    isPayment: settings.isPayment,
    isMailBox: settings.isMailBox,
    businessInfo: businessReducer.selectedBusiness,
    // allPayments: getAllInvoicePayments,
    paymentSettings,
    isChargeCardEnabled
  }
}

const mapDispatchToProps = dispatch => {
  return {
    refreshData: () => {
      dispatch(updateData())
    },
    showSnackbar: (message, error) => {
      dispatch(openGlobalSnackbar(message, error))
    },
    closePayment: () => {
      dispatch(closePayment())
    },
    closeMailBox: () => {
      dispatch(closeMailBox())
    },
    getInvoicePayments: id => {
      dispatch(getInvoicePayments(id))
    }
  }
}

export default withRouter(
  connect(mapPropsToState, mapDispatchToProps)(ViewInvoice)
)
