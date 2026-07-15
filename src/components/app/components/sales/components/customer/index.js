import history from '../../../../../../customHistory'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from 'reactstrap';
import { bindActionCreators } from 'redux'
import { DeleteModal } from '../../../../../../utils/PopupModal/DeleteModal';
import * as CustomerActions from '../../../../../../actions/CustomerActions';
import { _paymentMethodIcons, handleAclPermissions } from '../../../../../../utils/GlobalFunctions';
import { NoDataMessage } from '../../../../../../global/NoDataMessage';
import { _getUser } from '../../../../../../utils/authFunctions';
import DataTableWrapper from '../../../../../../utils/dataTableWrapper/DataTableWrapper';
import { columns, columnsWithoutPayment } from './customerSupportFile/constant';
import CenterSpinner from '../../../../../../global/CenterSpinner';
import { debounce } from 'lodash';
import { Modal } from 'react-bootstrap';
import { StripeProvider, Elements } from 'react-stripe-elements';
import CardForm from '../../../../../../global/stripeCardForm/cardForm';
import { getStripeKey } from '../../../../../../utils/common';

let cachedCredits = null;
let fetchingCredits = false;
let fetchPromise = null;

class Customer extends Component {
  state = {
    openConfimationModal: false,
    selectedDeleteCustomer: {},
    dropdownOpen: false,
    loading: false,
    permissions: [],
    offset: 1,
    limit: 10,
    totalData: 0,
    searchInput: '',
    showMassModal: false,
    messageText: '',
    availableCredits: null,
    creditsLoading: false,
    showPaymentModal: false,
    creditDropdownOpen: false,
    monthlyBlastsUsed: 0,
    monthlyBlastsLimit: 0,
    plan: 'Starter',
    messageTitle: '',
    showHistory: false,
    historyLoading: false
  };

  resetMassModalState = () => {
    this.setState({
      showMassModal: false,
      messageText: '',
      showCreditDropdown: false,
      selectedPackage: null,
      showPaymentModal: false,
      messageTitle: '',
    });
  };

  debouncedSearch = debounce((value) => { this.fetchCustomers(value ? `keyword=${value}` : '') }, 500)

  componentDidMount() {
    const { selectedBusiness } = this.props;
    const { acl } = _getUser(localStorage.getItem('token')) || {}
    this.setState({ permissions: acl?.permissions?.[3]?.scope || ['read', 'write'] })
    document.title = selectedBusiness && selectedBusiness.organizationName ? `Finance - ${selectedBusiness.organizationName} - Customers` : `Finance - Customers`;
    const pageData = localStorage.getItem('paginationData')
    let queryData = `pageNo=${this.state.offset}&pageSize=${this.state.limit}`
    if (!!pageData) {
      const { limit } = JSON.parse(pageData)
      queryData = `pageNo=${this.state.offset}&pageSize=${limit}`
      this.setState({ queryData, limit })
    }
    this.fetchCustomers(queryData);
  }

  openMassModal = async () => {
    this.setState({ creditsLoading: true });

    try {
      const resBalance = await this.props.actions.fetchRewardBalance();
      const availableCredits = resBalance?.result?.statusCode === 200
        ? resBalance.result.data.balance.availableCredits
        : 0;

      const monthlyBlastsUsed = resBalance?.result?.data?.balance?.monthlyBlastsUsed || 0;
      const monthlyBlastsLimit = resBalance?.result?.data?.balance?.monthlyBlastsLimit || 0;
      const plan = resBalance?.result?.data?.balance?.plan || 'Starter';

      cachedCredits = availableCredits;

      const resPacks = await this.props.actions.fetchCreditPacksAction();
      const creditPackages = resPacks?.packs
        ? Object.entries(resPacks.packs).map(([sku, pack]) => ({ ...pack, sku }))
        : [];

      this.setState({
        availableCredits,
        creditPackages,
        monthlyBlastsUsed,
        monthlyBlastsLimit,
        plan,
        showMassModal: true
      });
    } catch (err) {
      console.error(err);
    } finally {
      this.setState({ creditsLoading: false });
    }
  };

  fetchHistory = async (query = '') => {
    this.setState({ historyLoading: true });
    try {
      await this.props.actions.fetchMessageRequestsAction(query);
    } catch (err) {
      console.error(err);
    } finally {
      this.setState({ historyLoading: false });
    }
  };

  sendMassMessage = async () => {
    const { messageText, messageTitle, availableCredits, monthlyBlastsUsed, monthlyBlastsLimit } = this.state;
    const recipientsCount = this.props.customers?.meta?.total || 0;
    if (!messageText.trim()) return;
    const creditsPerCustomer = Math.ceil(messageText.length / 140);
    const totalCredits = creditsPerCustomer * recipientsCount;
    const isFree = monthlyBlastsUsed < monthlyBlastsLimit;

    if (!isFree && availableCredits < totalCredits) {
      console.error("Not enough credits. Please buy more.");
      return;
    }

    const { selectedBusiness } = this.props;
    const userId = localStorage.getItem('user.id');

    const payload = {
      message: messageText.trim(),
      title: messageTitle.trim(),
      businessId: selectedBusiness._id,
      userId
    };

    try {
      const res = await this.props.actions.massMessage(payload);
      if (res?.statusCode === 200) {
        if (!res.data.isFree) {
          cachedCredits = availableCredits - totalCredits;
        } else {
          cachedCredits = availableCredits;
        }
        this.setState({
          availableCredits: cachedCredits,
          monthlyBlastsUsed: res.data.monthlyBlastsUsed ?? (this.state.monthlyBlastsUsed + (res.data.isFree ? 1 : 0)),
          messageText: '',
          showMassModal: false
        });
      } else {
        console.error(res?.message || "Failed to send message");
      }
    } catch (err) {
      console.error(err);
    }
  };

  insertAtCursor = (text) => {
    const textarea = this.textareaRef;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = this.state.messageText;

    const updated =
      current.substring(0, start) +
      text +
      current.substring(end);

    this.setState(
      { messageText: updated },
      () => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd =
          start + text.length;
      }
    );
  };

  fetchCustomers(query) {
    this.setState({ loading: true })
    this.props.actions.fetchCustomers(query)
      .then(result => {
        this.setState({ loading: false })
      });

  }
  succesStyle = {
    "background-color": "green"
  };

  purchaseCredits = async (pkg, paymentMethodId) => {
    if (!paymentMethodId) {
      alert('Payment method missing');
      return;
    }

    try {
      const skuString = typeof pkg.sku === 'string' ? pkg.sku : pkg.sku.sku;
      const res = await this.props.actions.purchaseCreditsAction(skuString, paymentMethodId);

      if (res.success) {
        this.setState(prev => ({
          availableCredits: (prev.availableCredits ?? 0) + pkg.credits
        }));
        cachedCredits = this.state.availableCredits;
      } else {
        alert(res.message || 'Failed to purchase credits');
      }
    } catch (err) {
      console.error(err);
    }
  };

  toggleDropdown = () => {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  };

  _handlePageChange = (type, { page, sizePerPage }) => {
    if (type === 'pagination') {
      let pageNo = !!page ? page : this.state.offset;
      if (sizePerPage !== this.state.limit) {
        pageNo = 1
      }
      const query = `pageNo=${pageNo}&pageSize=${!!sizePerPage ? sizePerPage : this.state.limit}`
      this.fetchCustomers(query)
      this.setState({ offset: pageNo, limit: sizePerPage })
      localStorage.setItem('paginationData', JSON.stringify({ offset: pageNo, query, limit: sizePerPage }))
    }
  }

  handleInputChange = (e) => {
    const value = e.target.value
    this.setState({ searchInput: value })
    this.debouncedSearch(value)
  }

  render() {
    const { openConfimationModal, searchInput, loading } = this.state;
    const { customers: { meta, customers }, paymentSettings } = this.props;
    const recipientsCount = this.props.customers?.meta?.total || 0;
    const chars = this.state.messageText.length;
    const creditsPerMessage = Math.ceil(chars / 140);
    const totalCredits = creditsPerMessage * recipientsCount;

    return (
      <div className="customerWrapper">
        <div className="content-wrapper__main">

          <header class="py-header--page estimate-header-page">
            <div class="pull-right">
              {
                !handleAclPermissions(['Viewer']) && this.state.permissions.includes('write') && (
                  <div className="py-header--actions" >
                    <Button
                      color="primary"
                      onClick={this.openMassModal}
                    >
                      Mass Communication
                    </Button>
                    <Dropdown className="d-inline-block mrR10" isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown}>
                      <DropdownToggle color="primary" outline caret>Import from..</DropdownToggle>
                      <DropdownMenu className="dropdown-menu-center">
                        <DropdownItem onClick={() => history.push('/app/sales/customer/csv')}>Import CSV</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                    <Button onClick={() => history.push('/app/sales/customer/add')} color="primary" >Add a customer</Button>
                  </div>
                )
              }
            </div>
            <div class="py-header--title">
              <h1 class="py-heading--title">Customers</h1>
            </div>
            <div className='mb-3 mt-3'>
              <input
                type="search"
                name='searchInput'
                className="form-control py-select--small"
                placeholder="Search by customer name"
                value={searchInput}
                onChange={this.handleInputChange}
              />
            </div>
          </header>
          <div className="customer-list-table mt-3"
            key={(!paymentSettings.loading && !!paymentSettings.data.isOnboardingApplicable) ? "customer-table-with-payment" : "customer-table"}>
            {
              loading ? <CenterSpinner /> :
                !!customers && customers.length > 0 ?
                  (
                    <DataTableWrapper
                      from="customerList"
                      data={customers}
                      selectable={false}
                      columns={(!paymentSettings.loading && !!paymentSettings.data.isOnboardingApplicable) ? columns : columnsWithoutPayment}
                      classes={'py-table py-table--condensed'}
                      changePage={this._handlePageChange}
                      page={this.state.offset}
                      limit={this.state.limit}
                      totalData={meta.total}
                      defaultSorted={""}
                    />
                  )
                  : (<NoDataMessage
                    secondryMessage="Create a new customer and send them an invoice."
                    title="customer"
                    buttonTitle="customer"
                    btnText="Add a"
                    add={() => history.push('/app/sales/customer/add')}
                    filter={false}
                  />)
            }
          </div>

          {this.state.showMassModal && (
            <Modal
              show={this.state.showMassModal}
              onHide={this.resetMassModalState}
              centered
              className='rounded-modal'
            >

              <Modal.Header className="bg-light text-dark" closeButton >
                <Modal.Title>
                  Mass Communication
                </Modal.Title>
                <div className="ml-auto mr-3">
                  <Button
                    color="link"
                    size="sm"
                    onClick={() => {
                      this.setState({ showHistory: !this.state.showHistory });
                      if (!this.state.showHistory) this.fetchHistory();
                    }}
                  >
                    {this.state.showHistory ? 'Back to Blast' : 'Recent Blasts'}
                  </Button>
                </div>
              </Modal.Header>

              <Modal.Body style={{ backgroundColor: '#f8f9fa' }}>
                {this.state.showHistory ? (
                  <div>
                    <h6>Recent Message Requests</h6>
                    {this.state.historyLoading ? <CenterSpinner /> : (
                      <div className="table-responsive">
                        <table className="table table-sm py-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Title</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.props.messageRequests?.requests?.length > 0 ? (
                              this.props.messageRequests.requests.map(req => (
                                <tr key={req._id}>
                                  <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                  <td>{req.requestData?.title || 'No Title'}</td>
                                  <td>
                                    {req.status === 'pending' ? (
                                      <span className="badge badge-warning">Pending Approval</span>
                                    ) : req.status === 'rejected' ? (
                                      <span className="badge badge-danger">Rejected</span>
                                    ) : req.requestData?.processed ? (
                                      <span className="badge badge-success">Sent</span>
                                    ) : req.requestData?.isProcessing ? (
                                      <span className="badge badge-primary">
                                        Sending ({req.requestData?.processedCount || 0}/{req.requestData?.recipientsCount || 0})
                                      </span>
                                    ) : (
                                      <span className="badge badge-info">Approved</span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr><td colSpan="3" className="text-center">No history found</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="d-flex justify-content-between">
                      <p>Number of recipients: <strong>{recipientsCount}</strong></p>
                      {this.state.monthlyBlastsLimit > 0 && (
                        <p className="text-primary">
                          Free monthly blasts: <strong>{Math.max(0, this.state.monthlyBlastsLimit - this.state.monthlyBlastsUsed)}/{this.state.monthlyBlastsLimit}</strong>
                        </p>
                      )}
                    </div>
                    <p>Credits available: <strong>{this.state.availableCredits}</strong></p>

                    <hr />

                    <div className="form-group">
                      <label>Blast Title</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. March Promotion"
                        value={this.state.messageTitle}
                        onChange={(e) => this.setState({ messageTitle: e.target.value })}
                      />
                    </div>

                    <p className="mb-1">
                      Message:{' '}
                      <span
                        className="tag-pill"
                        onClick={() => this.insertAtCursor('{{first_name}}')}
                      >
                        <strong>First name</strong>
                      </span>
                      <span
                        className="tag-pill"
                        onClick={() => this.insertAtCursor('{{last_name}}')}
                      >
                        <strong>Last name</strong>
                      </span>
                    </p>

                    <div className="position-relative">
                      <textarea
                        ref={(el) => (this.textareaRef = el)}
                        className="form-control pb-5"
                        rows={4}
                        placeholder="Enter message"
                        value={this.state.messageText}
                        onChange={(e) => {
                          this.setState({ messageText: e.target.value }, () => {
                            if (this.textareaRef) {
                              this.textareaRef.scrollTop = this.textareaRef.scrollHeight;
                            }
                          });
                        }}
                        style={{ resize: 'none', paddingBottom: '40px' }}
                      />

                      <div
                        style={{
                          position: 'absolute',
                          bottom: '40px',
                          left: '0',
                          width: '100%',
                          height: '1px',
                          backgroundColor: '#ccc',
                          pointerEvents: 'none'
                        }}
                      />

                      <div
                        style={{
                          position: 'absolute',
                          bottom: '14px',
                          right: '8px',
                          fontSize: '14px',
                          color: '#666'
                        }}
                      >
                        {`${this.state.messageText.length}/${Math.max(Math.ceil(this.state.messageText.length / 140) * 140, 140)}`}
                      </div>
                    </div>

                    <p className='text-center' style={{ marginTop: "10px" }}>1 credit per receipt (up to 140 characters)</p>
                  </>
                )}
              </Modal.Body>

              <Modal.Footer className="d-flex flex-column">
                <Button
                  color="primary"
                  block
                  disabled={
                    !this.state.messageText.trim() ||
                    (this.state.monthlyBlastsUsed >= this.state.monthlyBlastsLimit && totalCredits > (this.state.availableCredits ?? 0))
                  }
                  onClick={this.sendMassMessage}
                >
                  Send blast to {recipientsCount} recipients
                </Button>

                {this.state.monthlyBlastsUsed >= this.state.monthlyBlastsLimit && totalCredits > (this.state.availableCredits ?? 0) && (
                  <div className="mt-3 text-center" style={{ width: '100%' }}>
                    <div
                      onClick={() => this.setState({ showCreditDropdown: true })}
                      style={{
                        borderRadius: '4px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        display: 'inline-block',
                        fontWeight: 500,
                        textAlign: this.state.showCreditDropdown || this.state.selectedPackage ? 'left' : 'center',
                        width: '100%',
                      }}
                    >
                      {this.state.showCreditDropdown || this.state.selectedPackage
                        ? 'Add credits:'
                        : this.state.creditPackages?.[0] ? (
                          <>
                            <span style={{ color: 'blue' }}>
                              Add {this.state.creditPackages[0].credits.toLocaleString()} credits
                            </span>{' '}
                            to proceed
                          </>
                        ) : (
                          'Add credits to proceed'
                        )}
                    </div>

                    {this.state.showCreditDropdown && (
                      <div
                        style={{
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          marginTop: '6px',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          width: '100%',
                          backgroundColor: '#fff',
                          zIndex: 10,
                          position: 'relative',
                        }}
                      >
                        {this.state.creditPackages.map((pkg) => {
                          const isSelected = this.state.selectedPackage?.sku === pkg.sku;

                          return (
                            <div
                              key={pkg.sku}
                              onClick={() => this.setState({ selectedPackage: pkg })}
                              style={{
                                padding: '10px 12px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #eee',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: isSelected ? '#f5f9ff' : '#fff',
                                fontWeight: isSelected ? 600 : 400,
                              }}
                            >
                              <span>
                                Add {pkg.credits.toLocaleString()} Credits (${pkg.amount.toFixed(2)})
                              </span>

                              {isSelected && (
                                <span style={{ color: '#28a745', fontWeight: 'bold' }}>✔</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}



                    {this.state.selectedPackage && (
                      <div className="text-center mt-2">
                        <Button
                          color="primary"
                          onClick={() => this.setState({ showPaymentModal: true })}
                        >
                          Pay ${this.state.selectedPackage.amount.toFixed(2)}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <hr />

                <p className="text-center text-green-600">
                  ✔ SMS messages average 98% open rate
                </p>

              </Modal.Footer>
            </Modal>
          )}
          {this.state.showPaymentModal && (
            <Modal
              show={this.state.showPaymentModal}
              onHide={() => this.setState({ showPaymentModal: false })}
              centered
              backdrop="static"
            >
              <Modal.Header closeButton>
                <Modal.Title>Secure Payment</Modal.Title>
              </Modal.Header>

              <Modal.Body>
                {this.state.selectedPackage && (
                  <>
                    <p>
                      <strong>
                        Buy {this.state.selectedPackage.credits.toLocaleString()} Credits
                      </strong>
                    </p>
                    <p>Amount: ${this.state.selectedPackage.amount.toFixed(2)}</p>

                    <StripeProvider apiKey={getStripeKey()}>
                      <Elements>
                        <CardForm
                          getCardDetails={async ({ paymentMethodId }) => {
                            await this.purchaseCredits(this.state.selectedPackage, paymentMethodId);
                            this.setState({
                              showPaymentModal: false,
                              selectedPackage: null
                            });
                          }}
                          buttonText={`Pay $${this.state.selectedPackage.amount.toFixed(2)}`}
                        />
                      </Elements>
                    </StripeProvider>
                  </>
                )}
              </Modal.Body>
            </Modal>
          )}

          {/* Delete Modal */}
          <DeleteModal
            message={"Are you sure you want to delete this customer?"}
            openModal={openConfimationModal}
            onDelete={this.onDeleteCall}
            onClose={this.onCloseModal}
          />
        </div>
      </div >
    )
  }
}


const mapStateToProps = (state) => {
  return {
    customers: state.customerReducer.customers,
    isCustomerAdd: state.customerReducer.isCustomerAdd,
    isCustomerUpdate: state.customerReducer.isCustomerUpdate,
    selectedBusiness: state.businessReducer.selectedBusiness,
    messageRequests: state.customerReducer.messageRequests,
    paymentSettings: state.paymentSettings
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(CustomerActions, dispatch)
  };
};


export default withRouter((connect(mapStateToProps, mapDispatchToProps)(Customer)))
