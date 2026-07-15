import history from "../../../../../customHistory";
import React, { PureComponent, Fragment } from "react";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { connect } from "react-redux";
import CenterSpinner from '../../../../../global/CenterSpinner'
import ReactToPrint from "react-to-print";
import {
  Button,
  Col,
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
  FormGroup,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Spinner,
  ButtonDropdown
} from "reactstrap";
import { DeleteModal } from "../../../../../utils/PopupModal/DeleteModal";
import { openGlobalSnackbar } from "../../../../../actions/snackBarAction";
import {
  cloneEstimate,
  convertEstimateToInvoice,
  deleteEstimate,
  fetchEstimateById,
} from "../../../../../api/EstimateServices";

import { invoiceSettingPayload } from "../../setting/components/supportFunctionality/helper";
import { estimatePayload, mailMessage } from "./constant";
import { EstimateHeader, RenderShippingAddress } from "./EstimateInvoiceComponent";
import { _downloadPDF, _documentTitle,handleAclPermissions } from '../../../../../utils/GlobalFunctions';
import ExportPdfModal from '../../../../../utils/PopupModal/ExportPdfModal';
import MailInvoice from './MailInvoice';
import InvoicePreviewClassic from '../../invoice/components/InvoicePreviewClassic';
import InvoicePreviewModern from '../../invoice/components/InvoicePreviewModern';
import InvoicePreview from '../../invoice/components/InvoicePreview';
import MailModal from '../../../../../global/MailModal';
import { _formatDate } from "../../../../../utils/globalMomentDateFunc";
import axios from 'axios'
let link;
class EstimateInvoice extends PureComponent {
  state = {
    openModal: false,
    dropdownOpen: false,
    dropdownOpenMore: false,
    modal: false,
    invoiceModal: false,
    selectedCustomer: null,
    invoiceData: estimatePayload(),
    userSettings: invoiceSettingPayload(),
    loading: false,
    btnLoading: false,
    convertLoader: false,
    onPrint: false,
    iframeHeight:100,
    responseInvoiceData:null,
  };

  componentDidMount() {
    const { businessInfo } = this.props;
    _documentTitle(businessInfo, `Estimate`)
    const id = this.props.match.params.id;
    this.fetchInvoiceData(id);
  }

  fetchInvoiceData = async id => {
    const { businessInfo } = this.props;
    this.setState({ loading: true });
    try {
      let response = await fetchEstimateById(id);
      await this.fetchTemplateHtml(response.data)
      const invoiceData = response.data.estimate;
      const userSettings = response.data.salesSetting;
      _documentTitle(businessInfo, `${invoiceData.name} ${invoiceData.estimateNumber}`)

      this.setState({ invoiceData, userSettings, loading: false, responseInvoiceData:response.data});
    } catch (error) {
      if (error.data) {
        this.props.showSnackbar(error.message, true);
        history.push("/404")
      }
    }
  };

  fetchTemplateHtml = (data) => {
    this.setState({onPrint:false})
    axios
      .post(
        `${process.env.REACT_APP_TEMPLATE_SERVICE_URL}/template-service/estimate.${data.salesSetting.template}/gcs`,
        { ...data }
      )
      .then((res) => {
        return axios.get(res.data.url)
      })
      .then((htmlRes) => this.setState({ renderInvoiceTemplate: htmlRes.data, onPrint: true }, () => this.handleResize()))
      .catch((error) => console.log(error));
  }
  handleResize = () => {
    if(this.iframeRef && this.iframeRef.contentWindow){
    const { body, documentElement } = this.iframeRef.contentWindow.document;
    const iframeHeight = Math.max(
      body.clientHeight,
      body.offsetHeight,
      body.scrollHeight,
      documentElement.clientHeight,
      documentElement.offsetHeight,
      documentElement.scrollHeight
    );
    if (iframeHeight !== this.state.iframeHeight) this.setState({ iframeHeight });
    }
  };
  onLoad = () => {
    this.iframeRef && this.iframeRef.contentWindow.addEventListener('resize', this.handleResize);
    this.handleResize();
  }
  componentWillUnmount() {
    this.iframeRef && this.iframeRef.contentWindow.removeEventListener('resize', this.handleResize);
 }

  exportPDF =async(download) => {
    try{
    const date = _formatDate(new Date(), 'YYYY-MM-DD')
    const { responseInvoiceData } = this.state
    const data = responseInvoiceData
    this.setState({
      btnLoading: true
    })
    if (!download) {
      this.setState({ openExportModal: true, downloadLoading: true })
      try {
         const res=await axios
          .post(
            `${process.env.REACT_APP_TEMPLATE_SERVICE_URL}/template-service/estimate.${data.salesSetting.template}/pdf`,
            { ...data },
            {
              headers: {
                Accept: 'application/pdf',
              },
            }
          )
            const blob = `data:application/pdf;base64,${res.data}`
            link = document.createElement('a')
            link.href = blob
      } catch (err) {
        this.props.showSnackbar('Something went wrong.', true)
        this.setState({ openExportModal: false })
      }
    }
    if (link) {
      this.setState({ downloadLoading: false, btnLoading: false })
      if (download) {
        this.setState({ openExportModal: false, btnLoading: false })
        link.download = `Estimate_${date}.pdf`
        link.click()
      }
    } else {
      this.setState({ downloadLoading: false })
      this.props.showSnackbar(
        'Failed to download PDF. Please try again after sometime.',
        true
      )
    }
   } catch (err) {
      console.log(err)
    }

  }

  handleDropdown = () => {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  };

  handleDropdownMore = () => {
    this.setState(prevState => ({
      dropdownOpenMore: !prevState.dropdownOpenMore
    }));
  };

  handleModal = (refetch) => {
    if (refetch && refetch._id) {
      this.fetchInvoiceData(refetch._id);
      this.props.showSnackbar("Email sent successfully", false)
    }
    this.setState({
      modal: !this.state.modal
    });
  };

  handleInvoiceModal = () => {
    this.setState({
      invoiceModal: !this.state.invoiceModal
    });
  };

  deleteAlert = () => {
    this.setState({ openModal: true })
  };

  onCloseModal = () => {
    this.setState({ openModal: false })
  };

  onDeleteEstimate = async (e) => {
    e.preventDefault();
    try {
      const estimateId = this.state.invoiceData._id;
      const response = await deleteEstimate(estimateId);
      if (response.statusCode === 200) {
        this.props.showSnackbar(response.message, false);
        history.push("/app/estimates")
      } else {
        this.props.showSnackbar(response.message, false)
      }
    } catch (error) {
      this.props.showSnackbar(error.message, true)
    }
  };

  onEditButton = (e) => {
    e.preventDefault();
    const { invoiceData } = this.state;
    history.push("/app/estimates/edit/" + invoiceData._id)
  };

  onDuplicateClick = async () => {
    const id = this.state.invoiceData._id;
    const response = await cloneEstimate(id);
    const estimateId = response?.data?.estimate?._id;  
    history.push(`/app/estimates/edit/${estimateId}?duplicate=true`);
    this.props.showSnackbar('A new duplicate of the estimate has been created.', false)
  };

  sendMailToUser = (e, type) => {

    const { invoiceData } = this.state;
    const businessInfo = this.props.businessInfo;
    const url = mailMessage(invoiceData, type, businessInfo);
    window.open(url)
  };

  renderShipToAddress = (addressShipping) => {
    return <RenderShippingAddress addressShipping={addressShipping} />;
  };

  renderEstimateDropdown = () => {
    const { publicView, uuid, name } = this.state.invoiceData;
    const link = (publicView && publicView.shareableLinkUrl ? publicView.shareableLinkUrl
      : `${process.env.REACT_APP_WEB_URL}/api/v1/estimatesharelink${uuid}`);
    return (
        <div>
            {
            !handleAclPermissions(['Viewer']) &&
            <DropdownItem onClick={this.handleModal}>Send with Finance</DropdownItem>
            }
            <DropdownItem header>Share URL</DropdownItem>
              <CopyToClipboard text={link}>
                <div className="dropdown-item" >
                  <input type="text" onFocus={event=>{event.target.select()}} value={link} className="form-control js-public--link" />
                  <span className="py-text--hint copy-helper">Press Cmd+C or Ctrl+C to copy to clipboard</span>
                </div>
              </CopyToClipboard>
              <DropdownItem divider />
               <DropdownItem onClick={this.exportPDF.bind(this, false)}>Export as PDF</DropdownItem>
                <ReactToPrint
                  trigger={() => <DropdownItem className="dropdown-item">Print {name}</DropdownItem>}
                  content={() => this.componentRef}
                />
        </div>
      )
  }; 

  onCloseExport = () => {
    this.setState({ onPrint: false })
  };


  redirectToEditBusiness = ()=>{
    history.push(`/app/accounts/business/${localStorage.getItem('businessId')}/edit`)
  };

  onCustomizeClick = () => {
    history.push(`/app/setting/invoice-customization`);

  };

  renderEstimateInvoiceDropdwon = () => {

    return <div>
      <DropdownItem onClick={this.onCustomizeClick}>Customize & Set Defaults</DropdownItem >
      {!handleAclPermissions(['Viewer','Editor']) && <Fragment>
      <DropdownItem  onClick={this.redirectToEditBusiness}>Edit Business Information</DropdownItem >
      <DropdownItem divider/>
      <DropdownItem onClick={this.onDuplicateClick}>Duplicate</DropdownItem>
      </Fragment>}
      <DropdownItem  target={'_blank'}  onClick={this.exportPDF.bind(this, false)}>Export as PDF</DropdownItem>
        <ReactToPrint
          trigger={() => <a className="dropdown-item">  Print </a>}
          content={() => this.componentRef}
        />
      {!handleAclPermissions(['Viewer']) &&<Fragment>
      <DropdownItem divider/>
      <DropdownItem onClick={this.deleteAlert}>Delete</DropdownItem>
      </Fragment>}
    </div>
  };


  renderEstimateHeader = () => {
    const {
      dropdownOpen,
      dropdownOpenMore,
      invoiceData
    } = this.state;
    return <Fragment>
     <div className="mb-3 d-flex align-items-center" >
        <Button 
            className="me-2"
            color="primary"
            outline
            onClick={this.onEditButton} disabled={handleAclPermissions(['Viewer'])}
          >Edit</Button>
        <Button
            color="primary"
            outline
            onClick={this.handleInvoiceModal}
            disabled={handleAclPermissions(['Viewer'])}
        >Convert to Invoice</Button>
      </div>
      <div className="mb-3 d-flex align-items-center" >
        <Button 
        onClick={()=>window.open(invoiceData.publicView.shareableLinkUrl, "_blank")} 
        color="primary"
        outline
        className="me-2">Customer view</Button>
        <ButtonDropdown className="me-2" isOpen={dropdownOpen} toggle={this.handleDropdown}>
            <DropdownToggle color="primary" caret>{invoiceData.status === "sent" || !!invoiceData.isSent ? "Resend" : "Send"}</DropdownToggle>
            <DropdownMenu className="dropdown-menu-center">
            {this.renderEstimateDropdown(invoiceData)}
            </DropdownMenu>
        </ButtonDropdown>      
        <ButtonDropdown
          isOpen={dropdownOpenMore}
          toggle={this.handleDropdownMore}
        >
          <DropdownToggle caret color="primary" outline >More</DropdownToggle>
          <DropdownMenu className="dropdown-menu-center">
            {this.renderEstimateInvoiceDropdwon()}
          </DropdownMenu>
        </ButtonDropdown>
      </div>
    </Fragment>
  };



  renderTemplates=()=>{
    const { invoiceData, userSettings } = this.state;
    const { businessInfo } = this.props;
    if (userSettings && userSettings.template === "classic") {
      return(<InvoicePreviewClassic
        ref={el => (this.componentRef = el)}
        businessInfo={businessInfo}
        invoiceData={invoiceData}
        userSettings={userSettings}
        showPayment={false}
      />)
    } else if (userSettings && userSettings.template === "modern") {
      return(<InvoicePreviewModern
        ref={el => (this.componentRef = el)}
        businessInfo={businessInfo}
        invoiceData={invoiceData}
        userSettings={userSettings}
        showPayment={false}
      />)
    } else {
      return(<InvoicePreview
        ref={el => (this.componentRef = el)}
        businessInfo={businessInfo}
        invoiceData={invoiceData}
        userSettings={userSettings}
        showPayment={false}
      />)
    }
  };

  convertEstimate = async () => {
    this.setState({convertLoader: true})
    let estimateId = this.state.invoiceData._id;
    try{
      const invoiceData = await convertEstimateToInvoice(estimateId);
      if(!!invoiceData){
        if(invoiceData.statusCode === 201){
          const invoiceId = invoiceData.data.invoice._id;
          this.setState({convertLoader: false})
          history.push(`/app/invoices/edit/${invoiceId}`);
          this.props.showSnackbar(invoiceData.message, false)
          this.setState({convertLoader: false})
        }else{
          this.setState({convertLoader: false})
          this.props.showSnackbar(invoiceData.message, true)
        }
      }else{
        this.setState({convertLoader: false})
        this.props.showSnackbar(invoiceData.message, true)
      }
    }catch(err){
      this.setState({convertLoader: false})
      this.props.showSnackbar(err.message, true)
    }
  };

  render() {
    const {
      modal,
      invoiceModal,
      invoiceData,
      onPrint,
      loading,
      openExportModal,
      downloadLoading,
      btnLoading,
      userSettings
    } = this.state;

    return (
      <div className="container">
        {
          loading ? <CenterSpinner /> :
            <div className="content-wrapper__main__fixed">
              <EstimateHeader estimate={invoiceData} handleModal={this.handleModal} />

                <div className="d-flex justify-content-between mb-2 flex-wrap">
                  {this.renderEstimateHeader()}
                </div>
              {
                modal && (
                  <MailModal
                    from="estimate"
                    openMail={modal}
                    mailData={invoiceData}
                    onClose={this.handleModal.bind(this)}
                    businessInfo={this.props.businessInfo}
                  />
                )
              }
              <Modal
                isOpen={invoiceModal}
                toggle={this.handleInvoiceModal}
                className="modal-add modal-email"
              >
                <ModalHeader toggle={this.handleInvoiceModal}>Convert an estimate to an invoice</ModalHeader>
                <ModalBody>
                  <p className="mrB0">Convert this estimate to a draft invoice?</p>
                </ModalBody>
                <ModalFooter>
                  <FormGroup row className="modal-foo">
                    <Col sm={12}>
                      <Button 
                        color="primary"
                        outline
                        onClick={this.handleInvoiceModal}>Cancel</Button>
                      <Button
                        onClick={this.convertEstimate}
                        color="primary"
                        className="ms-2"
                        disabled={this.state.convertLoader}
                      >
                        { this.state.convertLoader ? (<Spinner size="sm" color="light" />) : 'Convert' }
                      </Button>{" "}
                      {/* <span className="pdL5 pdR5">or</span> */}

                    </Col>
                  </FormGroup>
                </ModalFooter>
              </Modal>
              <DeleteModal
                message={"Are you sure you want to delete this estimate?"}
                openModal={this.state.openModal}
                onDelete={this.onDeleteEstimate}
                onClose={this.onCloseModal}
              />
              <ExportPdfModal
                openModal={openExportModal}
                onClose={() => this.setState({openExportModal: !this.state.openExportModal})}
                onConfirm={this.exportPDF.bind(this, true)}
                loading={downloadLoading}
                from="estimate"
                btnLoading={btnLoading}
              />
               { onPrint ? <div
                        id="printInvoice"
                        style={{
                          height: `${onPrint ? '100%' : '100%'}`,
                          width: `${onPrint ? '100%' : '100%'}`,
                        }}
                        className="d-flex align-items-center"
                        ref={el => (this.componentRef = el)}

                      >
                        <iframe
                          className="templateIframe"
                          onLoad={this.onLoad}
                           ref={(e) => { this.iframeRef = e}}
                          style={{
                            width: `820px`,
                            height: `${this.state.iframeHeight}px`
                          }}
                          srcdoc={this.state.renderInvoiceTemplate}
                          frameborder="0"
                          scrolling="no"
                         />


                      </div> : <CenterSpinner />}    
            </div>
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  businessInfo: state.businessReducer.selectedBusiness,
  // userSettings: state.settings.userSettings,
});

const mapDispatchToProps = (dispatch) => {
  return {
    showSnackbar: (message, error) => {
      dispatch(openGlobalSnackbar(message, error))
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EstimateInvoice);
