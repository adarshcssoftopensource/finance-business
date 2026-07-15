import { openGlobalSnackbar } from '../../../../../actions/snackBarAction';
import history from '../../../../../customHistory';
import React, { Component, Fragment } from "react";
import { connect } from 'react-redux';
import CenterSpinner from '../../../../../global/CenterSpinner';
import ReactToPrint from "react-to-print";
import { Button, ButtonDropdown, Container, DropdownItem, DropdownMenu, DropdownToggle, Spinner } from "reactstrap";
import { getInvoicePayments } from "../../../../../actions/invoiceActions";
import { getInvoiceByUUID, downloadPdf, sendReceiptMail, sendReceiptMailPublic } from "../../../../../api/InvoiceService";
import SnakeBar from "../../../../../global/SnakeBar";
import SweetAlertSuccess from "../../../../../global/SweetAlertSuccess";
import { toMoney, getAmountToDisplay, _downloadPDF } from "../../../../../utils/GlobalFunctions";
import PoweredBy from "../../../../common/PoweredBy";
import { invoiceSettingPayload } from "../../setting/components/supportFunctionality/helper";
import { invoiceInput } from "../helpers";
import InvoicePreview from "./InvoicePreview";
import InvoicePreviewClassic from "./InvoicePreviewClassic";
import InvoicePreviewModern from "./InvoicePreviewModern";
import Payout from "./Payout";
import SendReceipt from "./SendReceipt";
import ExportPdfModal from "../../../../../utils/PopupModal/ExportPdfModal";
import MailModal from "../../../../../global/MailModal";
import MailInvoice from "../../Estimates/components/MailInvoice";
import { PreAuthorize } from "./Payout/PreAuthorize";
import { _displayDate, _toDateConvert, _formatDate } from '../../../../../utils/globalMomentDateFunc';

let link;
class InvoiceViewBrowser extends Component {
  state = {
    openModal: false,
    dropdownOpen: false,
    dropdownOpenMore: false,
    modal: false,
    invoiceModal: false,
    selectedCustomer: null,
    invoiceData: invoiceInput(),
    userSettings: invoiceSettingPayload(),
    loading: false,
    openAlert: false,
    openReceiptMail: false,
    openExportModal: false,
    downloadLoading: false,
    btnLoading: false,
    sendLoad: false,
    recurring: null
  };

  componentDidMount() {
    const { businessInfo } = this.props;
    const { invoiceData } = this.state;
    this.fetchInvoiceData();
    document.title = `Finance - ${businessInfo && !!businessInfo.organizationName ? `${businessInfo.organizationName} - ` : ""}Invoice`
  }

  fetchInvoiceData = async () => {
    const id = this.props.match.params.id;
    const { businessInfo } = this.props;
    try {
      this.setState({ loading: true });
      const token = localStorage.getItem('token')
      let response = await getInvoiceByUUID(id, !!token ? true : false);
      if (response.statusCode === 200) {
        const invoiceData = response.data.invoice;
        const userSettings = response.data.invoice.businessId;
        const salesSetting = response.data.salesSetting;
        const userInfo = response.data.userInfo
        const payments = response.data.payments
        const recurring = response.data.recurring;
        if (!!recurring) {
          this.setState({ recurring })
        }
        document.title = `Finance - ${userSettings && !!userSettings.organizationName ? `${userSettings.organizationName} - ` : ""}Invoice ${invoiceData && invoiceData.invoiceNumber}`;
        this.setState({ invoiceData, userSettings: salesSetting, payments, userInfo, loading: false });
      } else {
        // Static demo: no redirect to /app/404
        this.setState({ loading: false });
      }
      let elem = document.getElementById('divIdToPrint');

    } catch (error) {
      this.setState({ loading: false });
      if (error.data && error.status == 404) {
        this.props.openGlobalSnackbar(error.data.message, true);
      } else {
        this.props.openGlobalSnackbar(error.message, true);
      }
    }
  };

  exportPDF = async (download) => {
    const date = _formatDate(new Date());
    const { invoiceData } = this.state;
    this.setState({
      btnLoading: true
    })
    if (!download) {
      this.setState({ openExportModal: true, downloadLoading: true })
      try {
        link = await _downloadPDF(invoiceData, 'invoices');
      } catch (err) {
        this.props.openGlobalSnackbar("Something went wrong, please try again later.", true)
        this.setState({ openExportModal: false })
      }
    }
    if (!!link) {
      this.setState({ downloadLoading: false, btnLoading: false })
      if (download) {
        this.setState({ openExportModal: false, btnLoading: false })
        link.download = `Invoice_${invoiceData.invoiceNumber}_${date}.pdf`;
        link.click();
      }
    } else {
      this.setState({ downloadLoading: false })
      this.props.openGlobalSnackbar("Failed to download PDF. Please try again after sometime.", true)
    }
  };

  printPDF = () => {
    window.print();
  };

  renderTemplate = () => {
    const { invoiceData, userSettings, payments } = this.state;
    const { allPayments } = this.props;
    const businessInfo = invoiceData ? invoiceData.businessId : {};

    if (userSettings.template === "classic") {
      return (<InvoicePreviewClassic
        ref={el => (this.componentRef = el)}
        businessInfo={businessInfo}
        invoiceData={invoiceData}
        userSettings={userSettings}
        payments={payments}
        showPayment={true}
      />)
    } else if (userSettings.template === "modern") {
      return (<InvoicePreviewModern
        ref={el => (this.componentRef = el)}
        businessInfo={businessInfo}
        invoiceData={invoiceData}
        userSettings={userSettings}
        payments={payments}
        showPayment={true}
      />)
    } else {
      return (<InvoicePreview
        ref={el => (this.componentRef = el)}
        businessInfo={businessInfo}
        invoiceData={invoiceData}
        userSettings={userSettings}
        payments={payments}
        showPayment={true}
      />)
    }
  };

  toggleDropdown = (event) => {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });

    if (event && event.target && event.target.innerText != 'Toggle Dropdown') {
      this.saveCheckoutSubMenuAction();
    }
  };

  onOpenReceiptMail = async (item, index) => {
    if (!!item) {
      try {
        this.setState({ sendLoad: true })
        const { invoiceData, userInfo } = this.state;
        const businessInfo = invoiceData ? invoiceData.businessId : {};
        let mailInvoice = {
          from: "",
          to: [""],
          subject: ``,
          message: "",
          self: false,
          attachPDF: false
        }
        const customerName = invoiceData.customer ? invoiceData.customer.customerName : ''
        const customerEmail = invoiceData.customer ? invoiceData.customer.email : ''
        const currencySymbol = invoiceData.customer && !!invoiceData.customer.currency.symbol ? invoiceData.customer.currency.symbol : businessInfo.currency.symbol
        const currencyCode = invoiceData.customer && !!invoiceData.customer.currency.code ? invoiceData.customer.currency.code : businessInfo.currency.code
        mailInvoice.subject = `Payment Receipt for ${invoiceData.title} #${invoiceData.invoiceNumber}`;
        mailInvoice.from = userInfo.email;
        mailInvoice.to = [`${customerEmail}`]
        mailInvoice.message = `Hi ${customerName},

        Here's your payment receipt for
          ${invoiceData.title} #${invoiceData.invoiceNumber}, for ${currencySymbol}${item.amount} ${currencyCode}.

          You can always view your receipt
          online, at:
          ${process.env.REACT_APP_WEB_URL}/invoice/${invoiceData.uuid}/public/reciept-view/readonly/${item.uuid}

          If you have any questions, please let us know.

          Thanks,
        ${businessInfo.organizationName}`
        const mailRes = await sendReceiptMailPublic(invoiceData.uuid, item.uuid);
        if (mailRes.statusCode === 200) {
          this.props.openGlobalSnackbar('Email sent successfully', false)
          this.setState({ sendLoad: false })
          this.setState({
            receiptItem: item,
            receiptIndex: index,
            openAlert: false
          })
        } else {
          this.setState({ sendLoad: false })
          this.props.openGlobalSnackbar(mailRes.message, true)
        }
      } catch (err) {
        this.props.openGlobalSnackbar(err.message, true)
        this.setState({ sendLoad: false })
      }
    }
  };

  onCloseReceiptMail = () => {
    this.setState({
      openReceiptMail: false
    })
  };

  onOpenAlert = (item) => {
    this.setState({
      openAlert: true,
      receiptItem: item
    })
  };

  onCloseAlert = () => {
    this.setState({
      openAlert: false
    })
  };

  _changePreAuthorize = e => {
    e.preventDefault();
    this.setState({
      recurring: {
        ...this.state.recurring,
        paymentModeSetting: {
          ...this.state.recurring.paymentModeSetting,
          preAuthorized: !this.state.recurring.paymentModeSetting.preAuthorized
        }
      }
    })
  }

  render() {
    const { invoiceData, loading, openAlert, receiptIndex, receiptItem, openReceiptMail, payments, openExportModal, downloadLoading, btnLoading, recurring } = this.state;
    const businessInfo = invoiceData ? invoiceData.businessId : {};
    let url = new URL(window.location.href);
    return (
      <div>
        <SnakeBar />
        {loading ?
          <Container className="text-center" style={{ height: '100vh', width: '100%' }}>
            <div className="mrT50" ><CenterSpinner /></div>
          </Container> :
          <Fragment>
            <div className="readonly-payment-information">
              <div className="py-heading--title readonly-payment-information__title">{invoiceData && invoiceData.onlinePayments && invoiceData.onlinePayments.systemEnabled && invoiceData.dueAmount > 0 ? `Request for Payment from ${businessInfo && businessInfo.organizationName}` : `${invoiceData && invoiceData.title} ${invoiceData && invoiceData.invoiceNumber} from ${businessInfo && businessInfo.organizationName}`}</div>
              <div className="invoice-payment-details text-center">
                <div className="invoice-payment-details__item">
                  {invoiceData && invoiceData.title} {invoiceData && invoiceData.invoiceNumber}
                </div>
                <div className="invoice-payment-details__item__seperator"></div>
                <div className="invoice-payment-details__item">
                  Amount due: {
                    invoiceData ? getAmountToDisplay(invoiceData.currency, invoiceData.dueAmount) : ''
                  }
                </div>
                <div className="invoice-payment-details__item__seperator"></div>
                <div className="invoice-payment-details__item">
                  Due: {invoiceData && _displayDate(invoiceData.dueDate)}
                </div>
              </div>
            </div>
            {!url.searchParams.get('isReadOnly') && <Fragment>
              {
                invoiceData.status !== 'draft' &&
                  invoiceData.status !== 'paid' &&
                  !!recurring && !recurring.isManual && !!recurring.paymentModeSetting.preAuthorized ? (
                    <Payout
                      invoiceData={invoiceData}
                      showSnackbar={(message, err) => this.props.openGlobalSnackbar(message, err)}
                      refreshData={this.fetchInvoiceData}
                      openAlert={this.onOpenAlert}
                      recurring={recurring}
                      changeManual={this._changePreAuthorize.bind(this)}
                      {...this.props}
                    />
                  ) :
                  (invoiceData.onlinePayments && invoiceData.onlinePayments.systemEnabled ||
                    invoiceData.onlinePayments && invoiceData.onlinePayments.businessEnabled)
                    ?
                    <Payout onlinePayments={invoiceData && invoiceData.onlinePayments} {...this.props}
                      showSnackbar={(message, err) => this.props.openGlobalSnackbar(message, err)}
                      refreshData={this.fetchInvoiceData}
                      openAlert={this.onOpenAlert}
                    />
                    : ""
              }
            </Fragment>
            }
            <div
              id="divIdToPrint"
              style={{
                // height: "100%",
                // width: "60%",
                padding: "none",
                margin: "auto",
                marginLeft: 'auto',
                marginRight: 'auto'
              }}
              className="my-3 public-preview-page"
            >

              {!url.searchParams.get('isReadOnly') && <div className="mt-2 d-flex justify-content-center align-items-center">
                <div className="print-buttons">
                  <ReactToPrint
                    trigger={() => <Button color="primary" outline className="d-none-sm">Print</Button>}
                    content={() => this.componentRef}
                  />

                  <Button color="primary" outline className="me-2" onClick={this.exportPDF.bind(this, false)}>Download PDF</Button>
                  {
                    payments && payments.length > 0 &&
                    (
                      <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown}>
                        <DropdownToggle color="primary" outline caret >Receipts</DropdownToggle>
                        <DropdownMenu className="dropdown-menu-center">
                          {
                            payments.map((item, i) => {
                              return (
                                <DropdownItem key={i} onClick={() => window.open(`${process.env.REACT_APP_WEB_URL}/invoice/${invoiceData.uuid}/public/reciept-view/readonly/${item.uuid}`)}>
                                  {_displayDate(item.paymentDate)}
                                </DropdownItem>
                              )
                            })
                          }
                        </DropdownMenu>
                      </ButtonDropdown>
                    )
                  }
                </div>
                {invoiceData && invoiceData.status === 'paid' &&
                  <span className="badge badge-success">{'paid'}</span>
                }
              </div>}
              <div ref={el => (this.componentRef = el)}>
                {this.renderTemplate(invoiceData)}
              </div>
            </div>
            <PoweredBy />
          </Fragment>
        }
        <SweetAlertSuccess
          showAlert={openAlert}
          receipt={receiptItem}
          receiptIndex={receiptIndex}
          onConfirm={this.onOpenReceiptMail}
          onCancel={this.onCloseAlert}
          title="Record a payment"
          message="The payment was recorded."
          load={this.state.sendLoad}
        />
        {
          openReceiptMail && (
            <MailModal
              from={!!openReceiptMail ? "Receipt" : "Invoice"}
              openMail={openReceiptMail}
              item={invoiceData}
              receipt={receiptItem}
              onClose={this.onCloseReceiptMail.bind(this)}
              businessInfo={businessInfo}
            />
          )
        }
        <ExportPdfModal
          openModal={openExportModal}
          onClose={() => this.setState({ openExportModal: !this.state.openExportModal })}
          onConfirm={this.exportPDF.bind(this, true)}
          loading={downloadLoading}
          from="invoice"
          btnLoading={btnLoading}
        />
      </div>
    );
  }
}
const mapPropsToState = state => ({
  businessInfo: state.businessReducer.selectedBusiness,
  allPayments: state.getAllInvoicePayments
});
export default connect(mapPropsToState, { openGlobalSnackbar, getInvoicePayments })(InvoiceViewBrowser);
