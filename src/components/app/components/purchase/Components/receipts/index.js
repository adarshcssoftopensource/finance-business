import {
  deleteReceipt,
  listReceipts,
  moveReceipt,
  patchReceipt,
  updateReceipt,
  uploadReceipt
} from '../../../../../../actions/recieptActions';
import history from '../../../../../../customHistory';
import queryString from 'query-string';
import classnames from 'classnames';
import React, { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Button, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import DataTableWrapper from '../../../../../../utils/dataTableWrapper/DataTableWrapper';
import { _documentTitle, handleAclPermissions } from '../../../../../../utils/GlobalFunctions';
import { NoDataMessage } from '../../../../../../global/NoDataMessage';
import EditDetailsModal from './components/EditDetailsModal';
import ViewDetailsModal from './components/ViewDetailsModal';
import { getColumns } from './constants/listConstants';
import CenterSpinner from '../../../../../../global/CenterSpinner';

class Receipts extends PureComponent {
  uploadInput = React.createRef();

  state = {
    viewDetails: undefined,
    editDetails: undefined,
    activeTab: "all",
    pageNo: 1,
    pageSize: 10
  };

  componentDidMount() {
    const { businessInfo } = this.props;
    _documentTitle(businessInfo, "Receipts");
    const queryData = queryString.parse(this.props.location.search);
    this.setState({ activeTab: queryData && queryData.status ? queryData.status : 'all' }, () => {
      this.fetchReceipts();
    });
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  fetchReceipts = () => {
    const { activeTab, pageNo, pageSize } = this.state;
    const pData = JSON.parse(localStorage.getItem('paginationData'))
    let query = `?pageNo=${pageNo}&pageSize=${pData && pData.limit ? pData.limit : pageSize}`;
    if (activeTab !== 'all') {
      query += `&status=${activeTab}`
    }
    const urlParams = new URLSearchParams(query);
    urlParams.delete('pageNo');
    urlParams.delete('pageSize');
    const pathname = this.props.location.pathname;
    history.push({
      pathname,
      search: urlParams.toString()
    });
    this.props.listReceipts(query, this.setTimer);
  };


  handleModal = () => {
    this.setState({
      modal: !this.state.modal
    });
  };

  setTimer = (receipts) => {
    const { activeTab } = this.state;
    if ((activeTab === 'Processing' && receipts.receipts.length) || (activeTab === 'all' && receipts.receipts.find(r => r.status === 'Processing'))) {
      this.timer = setTimeout(this.fetchReceipts, 10000);
      return;
    }

    if (this.timer) {
      clearTimeout(this.timer);
    }
  };

  toggleTab = tab => {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
        pageNo: 1,
        invoiceData: []
      }, () => this.fetchReceipts());
    }
  };

  openFilePicker = () => {
    this.uploadInput.current.click();
  };

  startUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    this.props.uploadReceipt(file, this.fetchReceipts);
  };

  closeViewDetails = () => {
    this.setState({ viewDetails: undefined });
  };

  closeEditDetails = () => {
    this.setState({ editDetails: undefined });
  };

  openViewDetails = (row) => {
    this.setState({ viewDetails: row });
  };

  openEditDetails = (row) => {
    this.setState({ editDetails: row });
  };

  editReceipt = (id, payload) => {
    this.props.updateReceipt(id, payload, () => {
      this.fetchReceipts();
      this.closeEditDetails();
    });
  };

  saveReceipt = (id, payload) => {
    this.props.patchReceipt(id, payload, () => {
      this.fetchReceipts();
      this.closeEditDetails();
    });
  };



  deleteReceipt = (id) => {
    this.props.deleteReceipt(id, () => {
      this.fetchReceipts();
      return id
    });
  };

  moveReceipt = (id, businessId) => {
    this.props.moveReceipt(id, businessId, () => {
      this.fetchReceipts();
    });
  };

  columns = getColumns(this.openViewDetails, this.openEditDetails, this.deleteReceipt, this.props.businesses, this.moveReceipt, this.props.businessInfo);

  renderNoContent() {
    const { activeTab } = this.state;
    return (
      <NoDataMessage
        title="receipt"
        buttonTitle="receipt"
        add={this.openFilePicker}
        filter={false}
        primaryMessage={activeTab != 'all' ? `You haven't any receipt in ${activeTab.toLowerCase()} yet` : "You haven't processed any receipts"}
        secondryMessage="Upload a receipt or invoice to get started."
      />
    );
  }

  onRowClick = (e, row, rowIndex) => {
    if (['a', 'button'].indexOf(e.target.tagName.toLowerCase()) !== -1 || ['a', 'button'].indexOf(e.target.parentElement.tagName.toLowerCase()) !== -1 || e.target.onClick) {
      return;
    }

    if (row.status === 'Ready' && !handleAclPermissions(['Viewer'])) {
      this.openEditDetails(row);
      return;
    }

    if (row.status === 'Done' || handleAclPermissions(['Viewer'])) {
      this.openViewDetails(row);

    }
  };

  renderContent() {
    const { receipts: { receipts, meta } } = this.props;
    return (
      <div className="receipts-list">
        <DataTableWrapper
          from="receipts"
          data={receipts ? receipts : []}
          columns={this.columns}
          rowEvents={{ onClick: this.onRowClick }}
          changePage={(type, pagin) => this._handlePageChange(type, pagin)}
          page={meta ? meta.pageNo : 1}
          limit={meta ? meta.pageSize : 10}
          totalData={meta ? meta.total : 0}
        />
      </div>
    );
  }

  renderTabLink(tabName, label) {
    const { activeTab } = this.state;
    const onClick = () => this.toggleTab(tabName);
    const active = activeTab === tabName;

    return (
      <NavItem>
        <NavLink className={classnames({ active })} onClick={onClick}>
          {label || tabName}
        </NavLink>
      </NavItem>
    );
  }

  renderTabPanel(tabName) {
    const { loading, receipts: { receipts } } = this.props;
    return (
      <TabPane tabId={tabName} className="tab-panel">
        {receipts && receipts.length == 0 ? this.renderNoContent() : this.renderContent()}
      </TabPane>
    )
  }

  renderProgressBar() {
    const { uploading, progress } = this.props;
    const classes = ['progress-container'];

    if (uploading) {
      classes.push('show');
    }

    return (
      <div className={classes.join(' ')}>
        <div className="track" />
        <div className="progress" style={{ width: `${progress}%` }} />
      </div>
    )
  }

  _handlePageChange = (type, { page, sizePerPage }) => {
    if (type === 'pagination') {
      let pageNo = !!page ? page : this.state.pageNo;
      if (this.state.pageSize !== sizePerPage) {
        pageNo = 1;
      }
      const pData = JSON.parse(localStorage.getItem('paginationData'))
      if (pData) {
        localStorage.setItem('paginationData', JSON.stringify({ offset: pData.offset, queryData: pData.queryData, limit: sizePerPage }))
      } else {
        localStorage.setItem('paginationData', JSON.stringify({ offset: 1, queryData: {}, limit: sizePerPage }))
      }
      this.setState((prevState) => ({
        ...prevState,
        pageNo,
        pageSize: sizePerPage
      }), () => this.fetchReceipts());
    }
  }

  render() {
    const { viewDetails, editDetails } = this.state;
    const { uploading, updating, businessInfo, loading } = this.props;
    return (
      <Fragment>
        <div className="content-wrapper__main receipts-wrapper">
          <header className="py-header--page d-flex flex-wrap" >
            <div className="py-header--title">
              <h2 className="py-heading--title">Receipts</h2>
            </div>
            {!handleAclPermissions(['Viewer']) &&<div className="py-header--actions">
              <Button disabled={uploading} onClick={this.openFilePicker} color="primary" >Upload a receipt</Button>
              <input type="file" accept="application/pdf, image/x-png,image/jpeg" onChange={this.startUpload} ref={this.uploadInput} style={{ display: 'none' }} />
            </div>}
          </header>
          {this.renderProgressBar()}

          <Nav tabs className="py-nav--tabs">
            {this.renderTabLink('all', 'All statuses')}
            {this.renderTabLink('Processing', 'Processing')}
            {this.renderTabLink('Ready', 'Ready')}
            {this.renderTabLink('Done', 'Done')}
          </Nav>
          {loading ? <CenterSpinner /> : <TabContent
            className="tab-container p-0"
            activeTab={this.state.activeTab}
          >
            {this.renderTabPanel('all')}
            {this.renderTabPanel('Processing')}
            {this.renderTabPanel('Ready')}
            {this.renderTabPanel('Done')}
          </TabContent>}

          <ViewDetailsModal onClose={this.closeViewDetails} data={viewDetails} />
          <EditDetailsModal
            updating={updating}
            data={editDetails}
            currency={businessInfo.currency}
            onClose={this.closeEditDetails}
            editReceipt={this.editReceipt}
            saveReceipt={this.saveReceipt}
          />
        </div>
      </Fragment>
    );
  }
}

const mapPropsToState = ({ snackbar, businessReducer, receipts }) => ({
  updateData: snackbar.updateData,
  businessInfo: businessReducer.selectedBusiness,
  businesses: businessReducer.business,
  loading: receipts.loading,
  uploading: receipts.uploading,
  updating: receipts.updating,
  receipts: receipts.list,
  progress: receipts.progress,
});

export default withRouter(connect(mapPropsToState, {
  uploadReceipt,
  listReceipts,
  updateReceipt,
  patchReceipt,
  deleteReceipt,
  moveReceipt,
})(Receipts));
