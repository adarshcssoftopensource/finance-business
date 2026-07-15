import { duplicateBill } from '../../../../../../../actions/billsAction';
import { openGlobalSnackbar } from "../../../../../../../actions/snackBarAction";
import { deleteBill } from '../../../../../../../api/billsService';
import history from "../../../../../../../customHistory";
import ConfirmationModal from '../../../../../../../global/ConfirmationModal';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, ButtonDropdown } from 'reactstrap';
import { DeleteModal } from "../../../../../../../utils/PopupModal/DeleteModal";
import { getAllBills } from '../../../../../../../actions/billsAction';
import { handleAclPermissions } from '../../../../../../../utils/GlobalFunctions'
class DropdownWrapper extends Component {
  state = {
    dropdownOpen: false,
    isDelete: false,
    openMail: false,
    confirmConvert: false,
    modalContent: null,
    deleteLoader: false
  };

  toggle = () => {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  };

  onEditClick = () => {
    const id = this.props.row.id;
    history.push("/app/purchase/bills/" + id);
  };

  onConfirmDelete = () => {
    this.setState({ isDelete: true })
  };

  onCloseModal = () => {
    this.setState({ isDelete: false })
  };

  onDuplicate = async () => {
    const { row: { id }, duplicateBill } = this.props;
    duplicateBill(id, (bill) => {
      history.push(`/app/purchase/bills/${bill.id}`);
    });
  };

  onDeleteClick = async () => {
    const id = this.props.row.id;
    this.setState({ deleteLoader: true })
    const deleteBillRes = await deleteBill(id);
    this.setState({ deleteLoader: false })
    this.props.openGlobalSnackbar(deleteBillRes.message);
    this.props.getAllBills()
    this.onCloseModal()
  };


  render() {
    const { row: { status, vendor } } = this.props;
    const { isDelete, dropdownOpen, openMail, modalContent, confirmConvert, deleteLoader } = this.state;

    return (
      <Fragment>        
        <ButtonDropdown isOpen={dropdownOpen} toggle={this.toggle} direction={'top right'} >
          <DropdownToggle color="circle" id="action" right top caret><i className="fas fa-caret-down" id="dropIcon"></i></DropdownToggle>
          <DropdownMenu left>
            {!handleAclPermissions(['Viewer']) && <div>
              <DropdownItem id="dropItem0" key={0} onClick={this.props.onRecord}>{vendor && vendor.vendorType == 'contractor' ? 'Pay contractor' : 'Record payment'}</DropdownItem>
              <DropdownItem id="dropItem1" key={1} onClick={this.onEditClick}>{status !== 'paid' ? 'View/Edit' : 'View'}</DropdownItem>
              <DropdownItem id="dropItem9" key={9} onClick={this.onDuplicate}>Duplicate</DropdownItem>
              {status !== 'paid' && (
                <Fragment>
                  <DropdownItem divider />
                  <DropdownItem id="dropItem8" key={8} onClick={this.onConfirmDelete}>Delete</DropdownItem>
                </Fragment>
              )}
            </div>}
            {handleAclPermissions(['Viewer']) && <div>
              <DropdownItem id="dropItem1" key={1} onClick={this.onEditClick}>{status !== 'paid' ? 'View/Edit' : 'View'}</DropdownItem>
            </div>}
          </DropdownMenu>
        </ButtonDropdown>       
        <DeleteModal
          message='Are you sure you want to delete this bill?'
          openModal={isDelete}
          onDelete={this.onDeleteClick}
          onClose={this.onCloseModal}
          btnLoad={deleteLoader}
        />
        <ConfirmationModal
          open={confirmConvert}
          text={modalContent}
          onConfirm={this.convertEstimate}
          onClose={() => this.setState({ confirmConvert: false })}
        />
      </Fragment>
    );
  }
}

export default connect(null, { openGlobalSnackbar, duplicateBill, getAllBills })(DropdownWrapper)
