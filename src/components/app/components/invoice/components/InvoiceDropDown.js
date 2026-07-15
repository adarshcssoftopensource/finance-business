import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import history from "../../../../../customHistory";
import { DeleteModal } from "../../../../../utils/PopupModal/DeleteModal";
import {
  cloneInvoice,
  deleteInvoice,
  sendInvoice,
} from "../../../../../api/InvoiceService";
import InvoicePayment from "./InvoicePayment";
import { updateData, openGlobalSnackbar } from "../../../../../actions/snackBarAction";
import SendAReminder from "./InvoiceForm/SendAReminder";
import SendReceipt from "./SendReceipt";
import SweetAlertSuccess from "../../../../../global/SweetAlertSuccess";
import ExportPdfModal from "../../../../../utils/PopupModal/ExportPdfModal";
import { _downloadPDF, handleAclPermissions } from "../../../../../utils/GlobalFunctions";
import MailModal from "../../../../../global/MailModal";
import { _formatDate } from "../../../../../utils/globalMomentDateFunc";

let link;
class InvoiceDropdown extends Component {
  state = {
    dropdownOpen: false,
    openReceiptMail: false,
    isDelete: false,
    openMail: false,
    openAlert: false,
    tab: null,
    alertTitle: "Record a payment",
    alertMsg: "The payment was recorded.",
    from: "",
    downloadLoading: false,
    btnLoading: false
  };

  toggle = () => {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  };
  onViewClick = () => {
    const id = this.props.row._id;
    history.push("/app/invoices/view/" + id);
  };
  onEditClick = () => {
    const id = this.props.row._id;
    history.push("/app/invoices/edit/" + id);
  };

  onConfirmDelete = () => {
    this.setState({ isDelete: true });
  };

  onCloseModal = () => {
    this.setState({ isDelete: false });
  };

  onDuplicate = async () => {
    const id = this.props.row._id;
    const response = await cloneInvoice(id);
    const invoiceId = response.data.invoice._id;
    history.push("/app/invoices/edit/" + invoiceId);
    this.props.showSnackbar("A new duplicate of the invoice has been created.", false);
  };

  onDeleteClick = async () => {
    const { row, refreshData, showSnackbar } = this.props
    try {
      await deleteInvoice(row._id);
      await refreshData();
      this.onCloseModal();
      // location.reload();
    } catch (error) {
      showSnackbar(error.message, true)
    }
  };

  handleMail = (status, alertTitle, alertMsg, from) => {
    this.setState({
      openMail: !this.state.openMail,
      tab: '1',
    });
    // if(status === true){
    //   this.onOpenAlert(this.state.receiptItem, alertTitle, alertMsg, from)
    // }
  };
  handleGmail = () => {
    this.setState({
      tab: '2',
      openMail: !this.state.openMail,
    });
  }

  exportPDF = async (download) => {
    const date = _formatDate(new Date());
    this.setState({
      btnLoading: true
    })
    if (!download) {
      this.setState({ openExportModal: true, downloadLoading: true })
      try {
        link = await _downloadPDF(this.props.row, 'invoices');
      } catch (err) {
        this.props.showSnackbar("Something went wrong.", true)
        this.setState({ openExportModal: false })
      }
    }
    if (!!link) {
      this.setState({ downloadLoading: false, btnLoading: false })
      if (download) {
        this.setState({ openExportModal: false, btnLoading: false })
        link.download = `Invoice_${this.props.row.invoiceNumber}_${date}.pdf`;
        link.click();
      }
    } else {
      this.setState({ downloadLoading: false })
      this.props.showSnackbar("Failed to download PDF. Please try again after sometime.", true)
    }
  };

  onPrintClick = () => {
    window.open(`${process.env.REACT_APP_WEB_URL}/invoices/readonly/${this.props.row._id}`);
  };

  onRecordClick = () => {
    this.setState({
      onRecordModal: true
    });
  };

  onRecordClose = () => {
    this.setState({
      onRecordModal: false
    });
  };

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

  updateStatus = async () => {
    const { row, refreshData, showSnackbar } = this.props;
    let payload = {
      invoiceInput: { status: "saved" }
    };
    try {
      await sendInvoice(row._id, payload);
      // window.reload()
      refreshData();
    } catch (error) {
      showSnackbar(error.message, true)
    }
  };

  renderStatusLabel = () => {
    const { row } = this.props;
    if (handleAclPermissions(['Viewer'])) {
      return <a className={'py-text--link'} id="textaction" href={`/app/invoices/view/${row._id}`}>View</a>;
    } else {
      if (row.status === "paid") {
        return <a className={'py-text--link'} id="textaction" href={`/app/invoices/view/${row._id}`}>View</a>;
      }
      if (row.status === "saved") {
        return <span className={'py-text--link'} id="textaction" onClick={this.handleMail}>Send</span>;
      }
      if (row.status === "draft") {
        return <span className={'py-text--link'} id="textaction" onClick={this.updateStatus}>Approve</span>;
      }
      if (row.status === "sent" || row.status === "viewed") {
        return (
          <span className={'py-text--link'} id="textaction" onClick={this.onRecordClick}>
            Record a payment
          </span>
        );
      }
      if (row.status === "overdue" && row.sentDate) {
        return <span className={'py-text--link'} id="textaction" onClick={this.openCloseReminder}>Send a reminder</span>;
      } else if (row.status === "overdue") {
        return <span className={'py-text--link'} id="textaction" onClick={this.onRecordClick}>Record a payment</span>;
      }

      if (row.status === "partial") {
        return <span className={'py-text--link'} id="textaction" onClick={this.onRecordClick}>Record a payment</span>;
      }
    }
  };

  openCloseReminder = () => {
    this.setState({ openReminder: !this.state.openReminder })
  }

  onOpenReceiptMail = (item, index) => {
    this.setState({
      openReceiptMail: true,
      receiptItem: item,
      receiptIndex: index,
      openAlert: false
    })
  }

  onCloseAlert = () => {
    this.setState({
      openAlert: false
    })
  }

  onCloseReceiptMail = () => {
    this.setState({
      openReceiptMail: false
    })
  }


  render() {
    const {
      onRecordModal,
      isDelete,
      dropdownOpen,
      openReceiptMail,
      openMail, btnLoading,
      openReminder, downloadLoading,
      receiptItem, openExportModal,
      openAlert, receiptIndex, alertMsg, alertTitle, from } = this.state;
    let { row } = this.props;
    const isEditable = row.isEditable
    return (
      <Fragment>
        <div className="py-table__actions-cell-content">
          {this.renderStatusLabel()}
          <Dropdown
            className="dropdown-circle dropdown-menu-new2"
            isOpen={dropdownOpen}
            toggle={this.toggle}
            direction={'right'}
          >
            <DropdownToggle color="circle" id="action">
              <i className="fas fa-caret-down" id="dropIcon"></i>
            </DropdownToggle>
            <DropdownMenu right>
              {!handleAclPermissions(['Viewer']) && <div>
                <DropdownItem id="dropItem0" key={0} onClick={this.onViewClick}>View</DropdownItem>
                {isEditable && <DropdownItem id="dropItem1" key={1} onClick={this.onEditClick}>Edit</DropdownItem>}
                <DropdownItem id="dropItem9" key={9} onClick={this.onDuplicate}>Duplicate</DropdownItem>
                {
                  row.status !== 'draft' ?
                    <div className="dropdown-item-divider"></div>
                    : ""
                }
                {
                  (row.action.toLowerCase() === 'send a reminder') ? "" :
                    ["partial", "viewed"].includes(row.status) && <DropdownItem id="dropItem" key={4} onClick={this.openCloseReminder}>Send a reminder</DropdownItem>}
                {
                  (row.action.toLowerCase() === 'record a payment') ?
                    "" :
                    (!(["draft", "partial", "viewed","paid"].includes(row.status)) || row.skipped) && <DropdownItem id="dropItem4" key={4} onClick={this.onRecordClick}>Record a payment</DropdownItem>}
                {
                  (row.action.toLowerCase() === 'send') ? "" :
                    row.status !== "draft" && <DropdownItem id="dropItem6" key={6} onClick={this.handleMail}>{row.sentDate ? "Resend" : "Send"}</DropdownItem>}
                <DropdownItem divider />
                <DropdownItem id="dropItem7" key={7} onClick={this.exportPDF.bind(this, false)}>Export as PDF</DropdownItem>
                <DropdownItem id="dropItem2" key={2} onClick={this.onPrintClick}>Print</DropdownItem>
                <DropdownItem id="dropItem8" key={8} onClick={this.onConfirmDelete}>Delete</DropdownItem>
              </div>}
              {handleAclPermissions(['Viewer']) && <div>
                <DropdownItem id="dropItem0" key={0} onClick={this.onViewClick}>View</DropdownItem>
                <DropdownItem id="dropItem7" key={7} onClick={this.exportPDF.bind(this, false)}>Export as PDF</DropdownItem>
                <DropdownItem id="dropItem2" key={2} onClick={this.onPrintClick}>Print</DropdownItem>
              </div>}
            </DropdownMenu>
          </Dropdown>
          {
            isDelete && (
              <DeleteModal
                message="Are you sure you want to delete this invoice?"
                openModal={isDelete}
                onDelete={this.onDeleteClick}
                onClose={this.onCloseModal}
                number={row.invoiceNumber}
              />
            )
          }
          {
            openMail && (
              <MailModal
                from="Invoice"
                openMail={openMail}
                mailData={row}
                onClose={this.handleMail}
                businessInfo={this.props.businessInfo}
              />
            )
          }
          {
            openReminder && (
              <SendAReminder
                invoiceData={row}
                openReminder={openReminder}
                onClose={this.openCloseReminder}
              />
            )
          }
          {
            onRecordModal && (
              <InvoicePayment
                openRecord={onRecordModal}
                paymentData={row}
                onClose={this.onRecordClose}
                openAlert={this.onOpenAlert}
                showSnackbar={this.props.showSnackbar}
                refreshData={this.props.refreshData}
              />
            )
          }
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
          {
            openReceiptMail && (
              <SendReceipt
                openRecord={openReceiptMail}
                invoiceData={row}
                receipt={receiptItem}
                onClose={this.onCloseReceiptMail}
                showSnackbar={this.props.showSnackbar}
                refreshData={this.props.refreshData}
                openAlert={this.onOpenAlert}
              />
            )
          }
          {
            openExportModal && (
              <ExportPdfModal
                openModal={openExportModal}
                onClose={() => this.setState({ openExportModal: !this.state.openExportModal })}
                onConfirm={this.exportPDF.bind(this, true)}
                loading={downloadLoading}
                from={"invoice"}
                btnLoading={btnLoading}
              />
            )
          }
        </div>
      </Fragment>
    );
  }
}

const statesM = state => {
  return {
    businessInfo: state.businessReducer.selectedBusiness,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    refreshData: () => {
      dispatch(updateData());
    },
    showSnackbar: (message, error) => {
      dispatch(openGlobalSnackbar(message, error));
    }
  };
};

export default connect(
  statesM,
  mapDispatchToProps
)(InvoiceDropdown);
