import history from "../../../../../customHistory";
import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";
import { DeleteModal } from "../../../../../utils/PopupModal/DeleteModal";
import { openGlobalSnackbar, updateData } from "../../../../../actions/snackBarAction";
import { getAllRecurringInvoices, getRecurringCounts } from "../../../../../actions/recurringInvoiceActions";
import {
  cloneRecurringInvoice,
  // deleteInvoice, sendInvoice,
  endRecurringInvoice
} from "../../../../../api/RecurringService";
import { sendInvoice, deleteInvoice } from "../../../../../api/InvoiceService";
import AlertBox from "../../../../../global/AlertBox";
import { handleAclPermissions } from '../../../../../utils/GlobalFunctions'

class RecurringDropDown extends Component {
  state = {
    dropdownOpen: false,
    openReceiptMail: false,
    isDelete: false,
    openMail: false,
    openAlert: false,
  };

  toggle = () => {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  };
  onViewClick = () => {
    const id = this.props.row._id;
    history.push("/app/recurring/view/" + id);
  };
  onEditClick = () => {
    const id = this.props.row._id;
    history.push("/app/recurring/edit/" + id);
  };

  onEnd = async () => {
    const id = this.props.row._id;
    const response = await endRecurringInvoice(id);
    const invoiceId = response.data.invoice._id;
    this.props.getAllRecurringInvoices('pageNo=1&pageSize=10&tab=active')
    this.props.getRecurringCounts()
    this.props.showSnackbar("Recurring Invoice Ended Successfully", false)
    // history.push("/app/recurring/edit/" + id);
  };

  onConfirmDelete = () => {
    this.setState({ isDelete: true });
  };

  onCloseModal = () => {
    this.setState({ isDelete: false });
  };

  onDuplicate = async () => {
    const id = this.props.row._id;
    const response = await cloneRecurringInvoice(id);
    const invoiceId = response.data.invoice._id;
    history.push(`/app/recurring/view/${invoiceId}?duplicate=true`);
    this.props.showSnackbar("A new duplicate of the recurring invoice has been created.", false);
  };

  onDeleteClick = async () => {
    const { row, refreshData, showSnackbar } = this.props
    try {
      await deleteInvoice(row._id);
      await refreshData();
      this.onCloseModal();
      window.location.reload();
    } catch (error) {
      showSnackbar(error.message, true)
    }
  };

  handleMail = () => {
    this.setState({
      openMail: !this.state.openMail
    });
  };

  exportPDF = () => {
    window.open(`${process.env.REACT_APP_WEB_URL}/invoices/readonly/${this.props.row._id}`);
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

  onOpenAlert = (item) => {
    this.setState({
      openAlert: true,
      receiptItem: item
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
      refreshData();
    } catch (error) {
      showSnackbar(error.message, true)
    }
  };

  renderStatusLabel = () => {
    const { row } = this.props;
    if (row.status === "paid") {
      return <a href={`/app/recurring/view/${row._id}`}>View</a>;
    }
    if (row.status === "saved") {
      return <a onClick={this.handleMail}>Send</a>;
    }
    if (row.status === "draft") {
      return <a onClick={this.updateStatus}>Approve</a>;
    }
    if (row.status === "sent") {
      return (
        <a onClick={this.onRecordClick}>
          Record payment
        </a>
      );
    }
    if (row.status === "overdue" && row.sentDate) {
      return <a onClick={this.openCloseReminder}>Send a reminder</a>;
    } else if (row.status === "overdue") {
      return <a onClick={this.onRecordClick}>Record a payment</a>;
    }

    if (row.status === "partial") {
      return <a onClick={this.onRecordClick}>Record a payment</a>;
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

  viewCreated = () => {
    history.push(`/app/invoices?tab=all&rcId=${this.props.row._id}`)
  }


  render() {
    const {
      onRecordModal,
      isDelete,
      dropdownOpen,
      openReceiptMail,
      openMail,
      openReminder,
      receiptItem,
      openAlert } = this.state;
    let { row, from, index } = this.props;
    let isHidden = !handleAclPermissions(['Viewer'])

    return (
      <Fragment>
        <Dropdown
          isOpen={dropdownOpen}
          toggle={this.toggle}
          direction={'right'}
        >
          <DropdownToggle color="circle" id="action"><i className="fas fa-caret-down" id="dropIcon"></i></DropdownToggle>
          <DropdownMenu className="dropdown-menu-right">
            <div>
              <DropdownItem id="dropItem0" key={0} onClick={this.onViewClick}>View</DropdownItem>
              {isHidden && <DropdownItem id="dropItem1" key={1} onClick={this.onEditClick}>Edit</DropdownItem>}
              {isHidden && <DropdownItem id="dropItem8" key={8} onClick={this.onEnd} disabled={from !== 'active'}>End</DropdownItem>}
              {isHidden && <div key={5} className="dropdown-item-divider"></div>}
              <DropdownItem id="dropItem9" key={9} onClick={this.viewCreated} disabled={from !== 'active'}>View created invoices</DropdownItem>
              {isHidden && <React.Fragment>
                <div className="dropdown-item-divider"></div>
                <DropdownItem id="dropItem10" key={10} onClick={this.onDuplicate}>Duplicate</DropdownItem>
              </React.Fragment>}
            </div>
          </DropdownMenu>
        </Dropdown>
        <DeleteModal
          message="Are you sure you want to delete this invoice?"
          openModal={isDelete}
          onDelete={this.onDeleteClick}
          onClose={this.onCloseModal}
        />
        <AlertBox
          showAlert={openAlert}
          receipt={receiptItem}
          onConfirm={this.onOpenReceiptMail}
          onCancel={this.onCloseAlert}
        />
      </Fragment>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    refreshData: () => {
      dispatch(updateData());
    },
    showSnackbar: (message, error) => {
      dispatch(openGlobalSnackbar(message, error));
    },
    getAllRecurringInvoices: (flag) => {
      dispatch(getAllRecurringInvoices(flag))
    },
    getRecurringCounts: () => {
      dispatch(getRecurringCounts())
    }
  };
};

export default connect(
  null,
  mapDispatchToProps
)(RecurringDropDown);
