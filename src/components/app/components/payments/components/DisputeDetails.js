import React, { Component, Fragment } from 'react';
import { isEmpty } from 'lodash';
import compose from 'recompose/compose'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'
import { openGlobalSnackbar } from '../../../../../actions/snackBarAction'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from 'reactstrap';
import CenterSpinner from '../../../../../global/CenterSpinner';
import { getAmountToDisplay } from "../../../../../utils/GlobalFunctions";
import Icon from '../../../../common/Icon'
import symbolsIcon from '../../../../../assets/icons/product/symbols.svg'

import disputeService from '../../../../../api/disputeService';
import Timeline from './disputes/timeline';
import DisputeDocumentUpload from './disputes/DocumentUploadModal';

import history from '../../../../../customHistory'

class DisputeDetails extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      dispute: null,
      internalDisputeId: this.splitId(),
      btnLoad: false,
      openConcedeModal: false,
      openChallengeModal: false,
      selectedDocument: undefined,
      documentType: "",
      explanation: "",
      documentTypeError: false,
      explanationError: false,
      selectedDocumentError: false,
      timelineOpen: false,
    };
  }

  splitId = () => location.pathname.split('/disputes/')[1]

  async componentDidMount() {
    await this.fetchBusinessDispute(this.state.internalDisputeId);
    await this.configureWepay();
  }

  configureWepay = async () => {
    const myAppId = process.env.REACT_APP_WE_PAY_APP_ID || "872295";
    const apiVersion = "3.0";
    const error = window.WePay.configure(process.env.REACT_APP_WE_PAY_ENV || "stage", myAppId, apiVersion);
    if (error) {
      console.log(error);
    }
  }

  fetchBusinessDispute = async () => {
    this.setState({ isLoading: true });
    await disputeService.getDispute(this.state.internalDisputeId)
      .then(response => {
        this.setState({ isLoading: false });
        if (response.statusCode === 200) {
          this.setState({ dispute: response?.data?.dispute || {} });
        } else {
          this.props.openGlobalSnackbar(response.message, true)
        }
      })
      .catch(error => {
        this.setState({ isLoading: false });
        this.props.openGlobalSnackbar(error.message, true)
      })
  }

  openConcedeModal = async () => {
    this.setState({ openConcedeModal: true });
  }

  onConcedeClose = async () => {
    this.setState({ openConcedeModal: false });
  }

  manageDispute = async (disputeId, requestData) => {
    await disputeService.manageDispute(disputeId, requestData)
      .then(async response => {
        this.setState({ isLoading: false, btnLoad: false });
        if (response.statusCode === 200) {
          this.props.openGlobalSnackbar(response?.message, false)
          await this.fetchBusinessDispute(this.state.internalDisputeId);
          this.onConcedeClose();
          this.onChallengeModalClose();
          history.push('/app/payments?status=disputes');
        } else {
          this.props.openGlobalSnackbar(response.message, true)
        }
      })
      .catch(error => {
        this.setState({ isLoading: false, btnLoad: false });
        this.props.openGlobalSnackbar(error.message, true)
      })
  }

  handleConcedeDispute = async () => {
    const disputeId = this.state?.dispute?.providerData?.disputeId;
    if (!disputeId) {
      this.props.openGlobalSnackbar("Dispute ID is required", true);
    }
    this.setState({ btnLoad: true });
    const requestData = {
      disputeAction: 'concede',
      businessId: this.state?.dispute?.business?.id,
    }
    await this.manageDispute(disputeId, requestData);
  }

  renderStatus = status => {
    let statusObj = {
      class: 'default',
    }
    if (status === 'resolved') {
      statusObj = {
        class: 'success',
      }
    } else if (status === 'pending') {
      statusObj = {
        class: 'default',
      }
    } else if (status === 'review') {
      statusObj = {
        class: 'warning',
      }
    }
    return <span className={`font-size-12 badge badge-${statusObj.class}`}>{status}</span>
  }

  renderResolution = resolution => {
    let statusObj = {
      class: 'success',
    }
    if (resolution?.type === 'lost') {
      statusObj = {
        class: 'danger',
      }
    }
    return <span className={`font-size-12 badge badge-${statusObj.class}`}>{resolution?.type}</span>
  }

  onChallengeModalClose = () => {
    this.setState({ openChallengeModal: false });
  }

  onChallengeModalOpen = () => {
    this.setState({ openChallengeModal: true });
  }

  handleChallengeDispute = async () => {
    const disputeId = this.state?.dispute?.providerData?.disputeId;
    if (!disputeId) {
      this.props.openGlobalSnackbar("Dispute ID is required", true);
    }

    let error = false;
    if (!this.state.documentType || isEmpty(this.state.documentType)) {
      this.setState({ documentTypeError: true });
      error = true;
    } else {
      this.setState({ documentTypeError: false });
    }

    if (!this.state.selectedDocument) {
      this.setState({ selectedDocumentError: true });
      error = true;
    } else {
      this.setState({ selectedDocumentError: false });
    }

    if (!this.state.explanation) {
      this.setState({ explanationError: true });
      error = true;
    } else {
      this.setState({ explanationError: false });
    }

    if (error) {
      return false
    }

    const requestData = {
      disputeAction: 'challenge',
      businessId: this.state?.dispute?.business?.id,
      documentType: this.state.documentType?.type,
      documents: [],
      explanation: this.state.explanation
    }

    const body = {
      type: this.state.documentType?.type,
      account_id: this.state?.dispute?.account_id,
      file: this.state.selectedDocument
    }
    this.setState({ btnLoad: true });
    window.WePay.documents.create(body, {}, async (res) => {
      if (res?.error_message) {
        this.setState({ btnLoad: false });
        this.props.openGlobalSnackbar(res?.error_message, true);
      } else {
        requestData.documents = [res.id];
        await this.manageDispute(disputeId, requestData);
      }
    })
  }

  handleDocumentType = (event) => {
    this.setState({ documentType: event || {}, documentTypeError: false });
  }

  handleUploadDocuments = (event) => {
    if (!event.target.files?.length) {
      this.setState({ selectedDocumentError: true });
    } else {
      this.setState({ selectedDocument: event.target.files[0], selectedDocumentError: false });
    }
  }

  handleTextChange = (event) => {
    if (!event?.target?.value) {
      this.setState({ explanation: event?.target?.value, explanationError: true })
    } else {
      this.setState({ explanation: event?.target?.value, explanationError: false });
    }
  }

  toggleTimeline = () => {
    this.setState({ timelineOpen: !this.state.timelineOpen });
  }

  render() {
    if (this.state.isLoading) {
      return <CenterSpinner />
    }
    return (
      <Fragment>
        <div className="content-wrapper__main PaymentList__Container">
          <div className='dispute-view-header'>
            <header className="py-header--page">
              <div className="py-header--title">
                <h2 className="py-heading--title text-break">Dispute Details</h2>
              </div>
              <div className="py-header--actions">
                <Button color="primary" outline
                  onClick={this.onChallengeModalOpen}
                  disabled={this.state?.dispute?.status !== 'pending'}
                >Challenge</Button>&nbsp;&nbsp;
                <Button color="primary"
                  onClick={this.openConcedeModal}
                  disabled={this.state?.dispute?.status !== 'pending'}
                >Concede</Button>
              </div>
            </header>
          </div>
          {/* Dispute-Header-Information-Start */}
          <div className="dispute-header-info">
            <ul>
              <li>
                <h5>Dispute ID</h5>
                <span>{this.state?.dispute?.providerData?.disputeId}</span>
              </li>
              <li>
                <h5>Status</h5>
                <span>{this.renderStatus(this.state?.dispute?.status)}</span>
              </li>
              <li>
                <h5>Transaction Amount</h5>
                <span>{getAmountToDisplay(this.state?.dispute?.business?.currency, this.state?.dispute?.transactionAmount)}</span>
              </li>
              <li>
                <h5>Disputed Amount</h5>
                <span>{getAmountToDisplay(this.state?.dispute?.business?.currency, this.state?.dispute?.disputedAmount)}</span>
              </li>
              <li>
                <h5>Reason</h5>
                <span>{this.state?.dispute?.reason?.reason_message || ''}</span>
              </li>
              <li>
                <h5>Payment For</h5>
                <span>
                  <a href={`${this.state?.dispute?.url || ''}`} target="_balnk">
                    <span className="font-weight-bold text-primary">{this.state?.dispute?.paymentFor || ''}</span>
                  </a>
                </span>
              </li>
              <li>
                <h5>Payment ID</h5>
                <span>{this.state?.dispute?.paymentId || ''}</span>
              </li>
              <li>
                <h5>Provider Payment Transaction ID</h5>
                <span>{this.state?.dispute?.paymentTransactionId || ''}</span>
              </li>
              <li>
                <h5>Resolution</h5>
                <span>{this.renderResolution(this.state?.dispute?.resolution)}</span>
              </li>
            </ul>
          </div>
          <div className="py-box py-box--large">
            <div className="invoice-steps-card__options">
              <div className="invoice-step-Collapsible__header-content" >
                <div className="step-indicate de-activate">
                  <div className="step-icon plane-icon">
                    <Icon className="Icon" xlinkHref={`${symbolsIcon}#timeline`} />
                  </div>
                </div>
                <div className="d-flex cursor-pointer w-100" onClick={this.toggleTimeline}>
                  <div className="py-heading--subtitle cursor-pointer">Timeline</div>
                  <div className={`collapse-arrow cursor-pointer ${this.state.timelineOpen && 'collapsed'}`}>
                    <i className="fas fa-chevron-up" aria-hidden="true"></i>
                  </div>
                </div>
              </div>
            </div>
            {
              this.state.timelineOpen ?
                <div className="invoice-steps-card__content mt-3 ms-4 me-2 ps-5">
                  <Timeline histories={this.state?.dispute?.history} />
                </div>
                : null
            }
          </div>
        </div>
        {/* Dispute-Header-Information-End */}


        {/* Challenge Modal */}
        {
          this.state.openChallengeModal ?
            <DisputeDocumentUpload
              onChallengeModalClose={this.onChallengeModalClose}
              openChallengeModal={this.state.openChallengeModal}
              handleChallengeDispute={this.handleChallengeDispute}
              btnLoad={this.state.btnLoad}
              handleUploadDocuments={this.handleUploadDocuments}
              documentType={this.state.documentType}
              explanation={this.state.explanation}
              handleDocumentType={this.handleDocumentType}
              handleTextChange={this.handleTextChange}
              documentTypeError={this.state.documentTypeError}
              explanationError={this.state.explanationError}
              selectedDocumentError={this.state.selectedDocumentError}
              selectedDocument={this.state.selectedDocument}
            />
            : null
        }
        {/* Concede Modal */}
        <Modal isOpen={this.state.openConcedeModal} toggle={this.onConcedeClose} className="modal-add modal-confirm" centered>
          <ModalHeader className="delete" toggle={this.onConcedeClose}>
            Concede Dispute
          </ModalHeader>
          <ModalBody className="text-center">
            Are you sure you want to Concede Dispute? Once a dispute has been conceded, it cannot be
            challenged.
          </ModalBody>
          <ModalFooter>
            <Button color="primary" outline onClick={this.onConcedeClose}>Close</Button>
            <Button color="danger" onClick={this.handleConcedeDispute} disabled={this.state.btnLoad}>
              {this.state.btnLoad ? <Spinner size="sm" color="default" /> : 'Concede'}
            </Button>
          </ModalFooter>
        </Modal>
      </Fragment>
    )
  }
}

const mapStateToProps = state => {
  return {
    businessInfo: state.businessReducer.selectedBusiness
  }
}

// export default DisputeDetails;
export default withRouter(compose(connect(mapStateToProps, { openGlobalSnackbar }))(DisputeDetails))