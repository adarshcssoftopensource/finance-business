import React, { Component, Fragment } from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner, Col, Input, Label, Form, FormGroup } from 'reactstrap';

import disputeService from '../../../../../../api/disputeService';
import SelectBox from "../../../../../../utils/formWrapper/SelectBox";
import FormValidationError from "../../../../../../global/FormValidationError";

class DisputeDocumentUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      documents: [],
    };
  }

  async componentDidMount() {
    await this.fetchBusinessDisputeDocuments();
  }

  fetchBusinessDisputeDocuments = async () => {
    this.setState({ isLoading: true });
    await disputeService.getDisputeDocuments()
      .then(response => {
        this.setState({ isLoading: false });
        if (response.statusCode === 200) {
          this.setState({ documents: response?.data?.documents || [] });
        }
      })
      .catch(error => {
        this.setState({ isLoading: false });
        console.log(error?.message);
      })
  }
  

  render() {

    return (
      <Fragment>
        <Modal isOpen={this.props.openChallengeModal} toggle={this.props.onChallengeModalClose} className="modal-add modal-confirm" centered>
          <ModalHeader className="delete" toggle={this.props.onChallengeModalClose}>
            Challenge Dispute
          </ModalHeader>
          <ModalBody>
            <div className="row mx-n2 mb-2">
              <div className="col-4 col-sm-4 text-right px-2">
                <Label htmlFor="document_type" className="py-form-field__label is-required mt-2" id="link1">Document Type</Label>
              </div>
              <div className="col-8 col-sm-8 px-2">
                <SelectBox
                  id="document_type"
                  value={this.props.documentType}
                  getOptionLabel={(value)=>(value["label"])}
                  getOptionValue={(value)=>(value["type"])}
                  onChange={e => this.props.handleDocumentType(e)}
                  placeholder="Select a Document Type"
                  options={this.state?.documents}
                  clearable={false}
                />
                <FormValidationError
                  showError={this.props.documentTypeError}
                />
              </div>
            </div>
            <div className="row mx-n2 mb-2">
              <div className="col-4 col-sm-4 text-right px-2" >
                <Label htmlFor="document_upload" className="py-form-field__label is-required mt-2" id="link1">Document Upload</Label>
              </div>
              <div className="col-8 col-sm-8 px-2">
                <div className="uploader-zone">
                  <div className="py-text--browse text-capitalize">
                    Upload Document
                  </div>
                  <div className="py-text--hint">
                    {' '}
                    Maximum 10MB in size. <br />
                    JPG, PNG, JPEF, PDF formats.
                  </div>
                  <Input
                    type='file'
                    onChange={this.props.handleUploadDocuments}
                    accept=".jpg,.png,.jpeg,.pdf"
                  />
                  <span className='text-success'>{this.props.selectedDocument?.name}</span>
                </div>
                <FormValidationError
                  showError={this.props.selectedDocumentError}
                />
              </div>
            </div>
            <div className="row mx-n2 mb-2">
              <div className="col-4 col-sm-4 text-right px-2" >
                <Label htmlFor="explanation" className="py-form-field__label is-required mt-2" id="link1">Explanation</Label>
              </div>
              <div className="col-8 col-sm-8 px-2">
                <textarea
                  name="explanation"
                  rows={5}
                  className="form-control"
                  value={this.props.explanation}
                  onChange={this.props.handleTextChange}
                />
                <FormValidationError
                  showError={this.props.explanationError}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
              <Button color="primary" outline onClick={this.props.onChallengeModalClose}>Close</Button>
              <Button color="danger" onClick={this.props.handleChallengeDispute} disabled={this.props.btnLoad}>
                {this.props.btnLoad ? <Spinner size="sm" color="default" /> : 'Challenge'}
              </Button>
          </ModalFooter>
        </Modal>
      </Fragment>
    )
  }
}

export default DisputeDocumentUpload