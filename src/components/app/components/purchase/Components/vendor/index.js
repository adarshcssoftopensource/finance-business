import { openGlobalSnackbar } from '../../../../../../actions/snackBarAction';
import { deleteVendor, getAllVendors } from '../../../../../../actions/vendorsAction'
import history from "../../../../../../customHistory";
import { StatusBadge } from '../../../../../../global/StatusBadge';
import React, { Component } from 'react';
import CenterSpinner from '../../../../../../global/CenterSpinner';
import { connect } from 'react-redux'
import { NavLink, withRouter } from 'react-router-dom'
import {
  Button,
  Card,
  CardBody,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  ButtonDropdown,
  Spinner,
  Table
} from 'reactstrap';
import _, { debounce } from "lodash"
import { _documentTitle } from '../../../../../../utils/GlobalFunctions';
import { DeleteModal } from '../../../../../../utils/PopupModal/DeleteModal';
import ActionDropDown from '../../constants/ActionDropDown';
import { NoDataMessage } from '../../../../../../global/NoDataMessage';
import { handleAclPermissions } from '../../../../../../utils/GlobalFunctions'

class Vendor extends Component {
  state = {
    dropdownOpen: false,
    openConfirmationModal: false,
    selectedDeleteVendor: {},
    searchInput: ''
  };

  debouncedSearch = debounce((value) => {this.props.getAllVendors(value ? `keyword=${value}` : '')}, 500)

  componentDidMount() {
    const { businessInfo, getAllVendors } = this.props;
    getAllVendors();
    _documentTitle(businessInfo, "Vendors")
  }

  onDeleteConfirmation = (event, item) => {
    this.setState({
      openConfirmationModal: true,
      selectedDeleteVendor: item
    });
  };

  onCloseModal = () => {
    this.setState({
      openConfirmationModal: false,
      selectedDeleteVendor: {}
    });
  };

  onDeleteCall = () => {
    const { selectedDeleteVendor } = this.state;
    this.deleteVendor(selectedDeleteVendor.id)
  };

  deleteVendor = async (id) => {
    try {
      await this.props.deleteVendor(id);
      this.onCloseModal();
    } catch (err) {
    }
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.deleteVendorState !== nextProps.deleteVendorState) {
      if (nextProps.deleteVendorState.success) {
        this.props.getAllVendors();
        this.props.openGlobalSnackbar(nextProps.deleteVendorState.message, false)
      } else if (nextProps.deleteVendorState.error) {
        this.props.openGlobalSnackbar(nextProps.deleteVendorState.message, true)
      }
    }
  }

  onRowClick = (e, row, rowIndex) => {
    if (['a', 'button', 'svg'].indexOf(e.target.tagName.toLowerCase()) !== -1 || ['a', 'button', 'svg'].indexOf(e.target.parentElement.tagName.toLowerCase()) !== -1 || e.target.onClick) {
      e.stopPropagation();
      return;
    }

    history.push(`${this.props.url}/vendors/edit/${row.id}`);
  };

  handleInputChange = (e) => {
    const value = e.target.value
    this.setState({ searchInput: value })
    this.debouncedSearch(value)
  }

  vendorInfo(data) {
    const { nonUSBusiness } = this.props;
    const tableData = data.vendors.length ? data.vendors.map((item, i) => {
      return (
        <tr className="py-table__row" key={i} onClick={e => this.onRowClick(e, item, i)}>
          {nonUSBusiness ? null : (<td className="py-table__cell" >
            <StatusBadge
              text={_.includes(item.vendorType, 'contractor') ? '1099 Contractor' : 'Vendor'}
              bgColor={_.includes(item.vendorType, 'contractor') ? '#b3e4f5' : "#c7d3dc"}
              textColor={_.includes(item.vendorType, 'contractor') ? '#11637e' : "#395260"}
              className="badge-gray"
            />
          </td>)}
          <td className="py-table__cell">
            <span className="py-table__cell-content">{item.vendorName}</span>
            <span className="py-text--hint">{item.firstName} {item.lastName}</span>
          </td>
          <td className="py-table__cell"><span className="py-table__cell-content">{item.email}</span></td>
          {nonUSBusiness ? <td className="py-table__cell" style={{ width: '200px' }}><span className="py-table__cell-content">{item.phone}</span></td> : (
            <td className="py-table__cell" style={{ width: '200px' }}>
              {
                _.includes(item.vendorType, 'contractor') ?
                  item.isAccountAdded ?
                    <NavLink className="py-text--link"
                      to={`/app/purchase/vendors/${item.id}/bank-details`}>View bank details</NavLink> :
                    <NavLink className="py-text--link"
                      to={`/app/purchase/vendors/${item.id}/bank-details/edit`}>Add bank details</NavLink>
                  : <span className="py-text--hint">Not available</span>
              }
            </td>
          )}
          {!handleAclPermissions(['Viewer']) &&<td className="py-table__cell__action" >
            <div className="align-center-right">
              <NavLink to={`/app/purchase/bills/add/${item.id}`} className="py-text--link">
                Create bill
              </NavLink>
              <ActionDropDown
                url={this.props.url}
                data={item}
                deleteVendor={this.onDeleteConfirmation}
              />
            </div>
          </td>}
        </tr>
      );
    }) : null;
    return tableData
  }

  renderVendors() {
    const { url, allVendors, nonUSBusiness } = this.props;
    const { loading, success, error, data } = allVendors;

    if (loading) {
      return (<CenterSpinner />);
    }

    if (!success) {
      return null;
    }

    if (!data.vendors.length) {
      return (
        <NoDataMessage
          title="vendor"
          buttonTitle="vendor"
          add={() => history.push('/app/purchase/vendors/add')}
          filter={false}
          secondryMessage="Create a new vendor, such as internet or utility providers, or independent contractors, and track their bills."
        />
        // <div className="text-center" style={{ marginTop: '10px' }}>
        //   <div className="py-heading--section-title">
        //     You do not have any vendors.
        //   </div>
        //   {!nonUSBusiness && (
        //     <p className="lead">Add vendors here, such as internet or utility providers, or independent contractors that
        //       require a 1099 tax form.</p>
        //   )}
        //   <NavLink to="/app/purchase/vendors/add" className="btn btn-primary me-2">
        //     Add a Vendor
        //   </NavLink>
        // </div>
      );
    }

    return (
      <div className="vendor-list-table">
        <Table className="py-table py-table__hover py-table__v__center table-clean">
          <thead className="py-table__header">
          <tr className="py-table__row">
            {nonUSBusiness ? null : <th style={{ width: '156px' }}>Type</th>}
            <th>Name</th>
            <th>Email address</th>
            {nonUSBusiness ? <th>Phone</th> :
              <th>Direct deposit</th>}
              {!handleAclPermissions(['Viewer']) && <th className="text-right" >Actions</th>}
          </tr>
          </thead>
          <tbody>
          {this.vendorInfo(data)}
          </tbody>
        </Table>
      </div>
    )
  }

  render() {
    const { url, allVendors, nonUSBusiness } = this.props;
    const { loading, success, error, data } = allVendors;

    return (
      <div className="content-wrapper__main vendorWrapper">
        <header className="py-header--page d-flex flex-wrap">
          <div className="py-header--title">
            <h2 className="py-heading--title">Vendors</h2>
          </div>
          {!handleAclPermissions(['Viewer']) && <div className="py-header--actions">
            <ButtonDropdown className="me-2" isOpen={this.state.dropdownOpen} toggle={() => this.setState({ dropdownOpen: !this.state.dropdownOpen })}>
              <DropdownToggle color="primary" outline caret>Import from..</DropdownToggle>
              <DropdownMenu left>
                  <DropdownItem onClick={() => history.push(`${url}/vendors/import-csv`)}>Import CSV</DropdownItem>
              </DropdownMenu>
            </ButtonDropdown>
            <Button onClick={() => history.push(`${url}/vendors/add`)} color="primary" >Add a vendor</Button>
          </div>}
        </header>
        <div className='mb-5'>
          <input
            name='searchInput'
            className="form-control py-select--small"
            placeholder="Search by vendor name"
            value={this.state.searchInput}
            onChange={this.handleInputChange}
          />
        </div>
        <div className="content">
          <Card className="shadow-box card-wizard">
            <CardBody>
              {this.renderVendors()}
            </CardBody>
          </Card>
        </div>
        <DeleteModal
          message={"Are you sure you want to delete this vendor?"}
          openModal={this.state.openConfirmationModal}
          onDelete={this.onDeleteCall}
          onClose={this.onCloseModal}
        />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    nonUSBusiness: state.businessReducer.selectedBusiness.country.id.toString() !== '231',
    allVendors: state.getAllVendors,
    businessInfo: state.businessReducer.selectedBusiness,
    deleteVendorState: state.deleteVendor,
  }
};

export default withRouter(connect(mapStateToProps, { getAllVendors, deleteVendor, openGlobalSnackbar })(Vendor))
