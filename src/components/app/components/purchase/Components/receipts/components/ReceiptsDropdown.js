import React, { Component, Fragment } from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { DeleteModal } from '../../../../../../../utils/PopupModal/DeleteModal';
import { handleAclPermissions } from '../../../../../../../utils/GlobalFunctions'

class ReceiptsDropdown extends Component {
  state = {
    dropdownOpen: false,
    openReceiptMail: false,
    isDelete: false,
    openMail: false,
    openAlert: false,
    tab: null,
    loading: false
  };

  toggle = () => {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  };

  onConfirmDelete = () => {
    this.setState({ isDelete: true });
  };

  onCloseModal = () => {
    this.setState({ isDelete: false });
  };


  onDeleteClick = async () => {
    this.setState({ loading: true });
    const res = await this.props.onDelete();
    if (res) {
      this.setState({ loading: false }, () => this.onCloseModal());
    }

  };

  onOpenReceiptMail = (item, index) => {
    this.setState({
      openReceiptMail: true,
      receiptItem: item,
      receiptIndex: index,
      openAlert: false
    })
  };

  onCloseAlert = () => {
    this.setState({
      openAlert: false
    })
  };

  render() {
    const {
      isDelete,
      dropdownOpen,
      loading
    } = this.state;
    const { row, onView, onEdit, businesses, onMove } = this.props;

    if (row.status === 'Processing') {
      return null;
    }

    return (
      <Fragment>
        <Dropdown
          isOpen={dropdownOpen}
          toggle={this.toggle}
          direction={'right'}
        >
          <DropdownToggle color="circle" id="action"><i className="fas fa-caret-down" id="dropIcon"></i></DropdownToggle>
          <DropdownMenu left>
            <div>
              {(row.status === 'Done' || handleAclPermissions(['Viewer'])) && (
                <DropdownItem id="dropItem0" key={0} onClick={onView}>View details</DropdownItem>
              )}
              {!handleAclPermissions(['Viewer']) && <React.Fragment>
                {row.status === 'Ready' && (
                  <DropdownItem id="dropItem1" key={1} onClick={onEdit}>View or edit details</DropdownItem>
                )}
                {row.status === 'Ready' && (
                  <DropdownItem id="dropItem2" key={2} divider />
                )}
                {row.status === 'Ready' && businesses.map((business, index) => (
                  <DropdownItem id={`dropItem${10 + index}`} key={business._id} onClick={() => onMove(business._id)}>Move to {business.organizationName}</DropdownItem>
                ))}
                 <DropdownItem divider />
                <DropdownItem id="dropItem8" key={8} onClick={this.onConfirmDelete}>Delete</DropdownItem>
              </React.Fragment>}
            </div>
          </DropdownMenu>
        </Dropdown>
        <DeleteModal
          message="Are you sure you want to delete this receipt?"
          openModal={isDelete}
          onDelete={this.onDeleteClick}
          onClose={this.onCloseModal}
          btnLoad={loading}
        />
      </Fragment>
    );
  }
}

export default ReceiptsDropdown;
