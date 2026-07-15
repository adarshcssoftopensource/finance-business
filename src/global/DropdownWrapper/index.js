import history from "../../customHistory";
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { DeleteModal } from "../../utils/PopupModal/DeleteModal";
import { openGlobalSnackbar } from "../../actions/snackBarAction";
import { cloneEstimate, convertEstimateToInvoice, deleteEstimate } from "../../api/EstimateServices";
import MailInvoice from '../../components/app/components/Estimates/components/MailInvoice';
import ConfirmationModal from '../ConfirmationModal';
import ExportPdfModal from "../../utils/PopupModal/ExportPdfModal";
import { _downloadPDF, handleAclPermissions } from "../../utils/GlobalFunctions";
import MailModal from "../MailModal";
import { getEstimates } from "../../actions/estimateAction";
import { _formatDate } from "../../utils/globalMomentDateFunc";


let link;
class DropdownWrapper extends Component {
  state = {
    dropdownOpen: false,
    isDelete: false,
    openMail: false,
    confirmConvert: false,
    modalContent: null,
    openExportModal: false,
    downloadLoading: false,
    btnLoading: false,
    convertLoading: false
  };

  toggle = () => {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  };
  onViewClick = () => {
    const id = this.props.row._id;
    history.push("/app/estimates/view/" + id);
  };
  onEditClick = () => {
    const id = this.props.row._id;
    history.push("/app/estimates/edit/" + id);
  };

  onConfirmDelete = () => {
    this.setState({ isDelete: true })
  };

  onCloseModal = () => {
    this.setState({ isDelete: false })
  };

  onDuplicate = async () => {
    const id = this.props.row._id;
    const response = await cloneEstimate(id);
    const estimateId = response.data.estimate._id;
    history.push(`/app/estimates/edit/${estimateId}?duplicate=true`);
    this.props.openGlobalSnackbar("A new duplicate of the estimate has been created.", false)
  };

  onDeleteClick = async () => {
    const id = this.props.row._id;
    this.setState({ deleteBtn: true })
    try {
      const res = await deleteEstimate(id);
      if (res.statusCode === 200) {
        this.setState({ deleteBtn: false })
        this.props.openGlobalSnackbar(res.message, false)
        this.props.getEstimates()
      } else {
        this.setState({ deleteBtn: false })
        this.props.openGlobalSnackbar(res.message, true)
      }
    } catch (err) {
      this.setState({ deleteBtn: false })
      this.props.openGlobalSnackbar(err.message, true)
    }
  };

  handleMail = (refetch) => {
    if (refetch && refetch._id) {
      this.props.getEstimates()
      this.props.openGlobalSnackbar("Email sent successfully", false)
    }
    this.setState({
      openMail: !this.state.openMail
    });
  };

  exportPDF = async (download) => {
    const invoiceData = this.props.row;
    const date = _formatDate(invoiceData.expiryDate);
    this.setState({
      btnLoading: true
    })
    if (!download) {
      this.setState({ openExportModal: true, downloadLoading: true })
      try {
        link = await _downloadPDF(invoiceData, 'estimates');
      } catch (err) {
        this.props.openGlobalSnackbar("Something went wrong, please try again later.", true)
        this.setState({ openExportModal: false })
      }
    }
    if (!!link) {
      this.setState({ downloadLoading: false, btnLoading: false })
      if (download) {
        this.setState({ openExportModal: false, btnLoading: false })
        link.download = `Estimate_${invoiceData.estimateNumber}_${date}.pdf`;
        link.click();
      }
    } else {
      this.setState({ downloadLoading: false })
      this.props.openGlobalSnackbar("Failed to download PDF. Please try again after sometime.", true)
    }
  };

  onPrintClick = () => {
    window.open(`${this.props.row.publicView.shareableLinkUrl}`)
  };

  convertEstimate = async () => {
    this.setState({ convertLoading: true })
    let estimateId = this.props.row._id;
    const invoiceData = await convertEstimateToInvoice(estimateId);
    const invoiceId = invoiceData.data.invoice._id;
    this.setState({ convertLoading: false })
    history.push(`/app/invoices/edit/${invoiceId}`);
  };

  convertEstimateConfirm = (e) => {
    e.preventDefault();
    let modalContent = {
      heading: 'Convert an estimate to an invoice',
      body: 'Convert this estimate to a draft invoice?'
    };
    this.setState({ confirmConvert: true, modalContent })
  };

  render() {
    const { isDelete, dropdownOpen, openMail, modalContent, confirmConvert, openExportModal, downloadLoading, btnLoading } = this.state;

    return (
      <Fragment>
        <Dropdown className="dropdown-circle dropdown-menu-new3" isOpen={dropdownOpen}
          toggle={this.toggle}
          direction={'left'}
        >
          <DropdownToggle color="circle" id="action"><i className="fas fa-caret-down" aria-hidden="true" id="dropIcon"></i></DropdownToggle>
          <DropdownMenu 
          style={{
            position: "relative",
            inset: "auto 0px 0px auto",
          }}    
          >
            <div>
              <DropdownItem id="dropItem0" key={0} onClick={this.onViewClick}>View</DropdownItem>
              {!handleAclPermissions(['Viewer']) && <DropdownItem id="dropItem1" key={1} onClick={this.onEditClick}>Edit</DropdownItem>}
              {!handleAclPermissions(['Viewer']) && <DropdownItem id="dropItem9" key={9} onClick={this.onDuplicate}>Duplicate</DropdownItem>}
              <DropdownItem id="dropItem2" key={2} onClick={this.onPrintClick} >Print</DropdownItem>
              {!handleAclPermissions(['Viewer']) && <div className="dropdown-item-divider"></div>}
              {!handleAclPermissions(['Viewer']) && <DropdownItem id="dropItem4" key={4} onClick={this.convertEstimateConfirm.bind(this)}>Convert to invoice</DropdownItem>}
              {!handleAclPermissions(['Viewer']) && <div className="dropdown-item-divider"></div>}
              {!handleAclPermissions(['Viewer']) && <DropdownItem id="dropItem6" key={6} onClick={this.handleMail} >Send</DropdownItem>}
              <DropdownItem id="dropItem7" key={7} onClick={this.exportPDF.bind(this, false)}>Export as PDF</DropdownItem>
              {!handleAclPermissions(['Viewer']) && <div className="dropdown-item-divider"></div>}
              {!handleAclPermissions(['Viewer']) && <DropdownItem id="dropItem8" key={8} onClick={this.onConfirmDelete}>Delete</DropdownItem>}
            </div>
          </DropdownMenu>
        </Dropdown>
        <DeleteModal
          message='Are you sure you want to delete this estimate?'
          openModal={isDelete}
          onDelete={this.onDeleteClick}
          onClose={this.onCloseModal}
          btnLoad={this.state.deleteBtn}
        />
        {
          openMail && (
            <MailModal
              from="estimate"
              openMail={openMail}
              mailData={this.props.row}
              onClose={this.handleMail.bind(this)}
              businessInfo={this.props.businessInfo}
            />
          )
        }
        <ConfirmationModal
          open={confirmConvert}
          text={modalContent}
          onConfirm={this.convertEstimate}
          onClose={() => this.setState({ confirmConvert: false })}
          convertLoading={this.state.convertLoading}
        />
        <ExportPdfModal
          openModal={openExportModal}
          onClose={() => this.setState({ openExportModal: !this.state.openExportModal })}
          onConfirm={this.exportPDF.bind(this, true)}
          loading={downloadLoading}
          from="estimate"
          btnLoading={btnLoading}
        />
      </Fragment>
    );
  }
}

const statesM = state => {
  return {
    businessInfo: state.businessReducer.selectedBusiness,
  }
}
export default connect(statesM, { openGlobalSnackbar, getEstimates })(DropdownWrapper)
