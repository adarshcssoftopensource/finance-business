
import React, { PureComponent, useState } from 'react'
import CheckoutPreviewForm from './CheckoutPreviewForm';
import { Button, Col, Row, Card, CardHeader, CardBody, CardFooter, CardTitle, CardText, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Input, Spinner, Container, Alert } from 'reactstrap';
import { connect } from 'react-redux';
import CenterSpinner from '../../../../../../global/CenterSpinner';
import { bindActionCreators } from 'redux'
import { withRouter, Link } from 'react-router-dom'
import * as CheckoutActions from '../../../../../../actions/CheckoutActions';
import { getShareLink } from '../../../../../../utils/common';
import { openGlobalSnackbar } from '../../../../../../actions/snackBarAction';
import Badge from '../../../../../../global/Badge';
import history from '../../../../../../customHistory';
import { updateCheckoutById } from "../../../../../../api/CheckoutService";
import EventsTimeLine from '../../../../../common/EventsTimeLine';
import Icon from '../../../../../common/Icon';
import QRCode from 'qrcode.react';
import TextMessageModal from '../../../../../../global/TextMessageModal';
import SweetAlertSuccess from '../../../../../../global/SweetAlertSuccess';
import { getAmountToDisplay } from '../../../../../../utils/GlobalFunctions';
import symbolsIcon from "../../../../../../assets/icons/product/symbols.svg";

const getTaxes = (taxes) => {
    let _taxes = [];
    if(taxes){
        taxes.forEach((tax) => {
            if(typeof tax == 'string'){
                _taxes.push(tax);
            } else {
                _taxes.push(tax.id);
            }
        });
    }
    return _taxes;
}

const getCheckout = (checkout) => {
    let data = {
        userId: checkout && checkout.userId || localStorage.getItem('user.id'),
        // businessId: checkout && checkout.businessId || localStorage.getItem('businessId'),
        itemName: checkout && checkout.itemName || '',
        message: checkout && checkout.message || "",
        price: checkout && checkout.price || 0.00,
        total: checkout && checkout.total || 0,
        fields: checkout ? checkout.fields : { phone: false, address: false, email: true },
        status: checkout && checkout.status || '',
        taxes: checkout && getTaxes(checkout.taxes) || []
    }
    return data
}

class ShareCheckout extends PureComponent {
    constructor() {
        super()
        this.state = {
            shareLinkOpen: true,
            qrScanOpen: true,
            selectedCheckout: {},
            isLoadingData: true,
            shareLink: "",
            isTextCopied: false,
            openText:false,
            checkoutData:{},
            openAlert:false,
            receiptItem:{},
            alertTitle:"", 
            alertMsg:""
        };
    }

    toggleShareLink = () => {
        this.setState(prevState => ({
            shareLinkOpen: !prevState.shareLinkOpen,
        }));
    }

    toggleQrScane = () => {
        this.setState(prevState => ({
            qrScanOpen: !prevState.qrScanOpen,
        }));
    }

    componentDidMount() {
        const { selectedBusiness } = this.props;
        document.title = selectedBusiness && selectedBusiness.organizationName ? `Finance - ${selectedBusiness.organizationName} - Checkouts` : `Finance - Checkouts`;
        const checkoutId = this.props.match.params.id;
        this.setState({
            shareLink: getShareLink(checkoutId),
        });
        this.fetchCheckoutData();
    }

    fetchCheckoutData = () => {
        const checkoutId = this.props.match.params.id;
        const uuid = this.props.match.params.uuid;
        if(checkoutId){
            this.props.actions.fetchCheckoutById(checkoutId).then(result => {
                if (result) {
                    this.setState({ selectedCheckout: result.selectedCheckout, isLoadingData: false });
                } else {
                    this.redirectToCheckouts();
                }
            });
        } else if(uuid){
                this.props.actions.fetchCheckoutByUUID(checkoutId).then(result => {
                    if (result) {
                        this.setState({ selectedCheckout: result.selectedCheckout, isLoadingData: false });
                    } else {
                        this.redirectToCheckouts();
                    }
                });
        } else {
            this.redirectToCheckouts();
        }
    }

    saveCheckout = async() => {
        let selectedCheckout = getCheckout(this.state.selectedCheckout);
        let _checkoutId = this.state.selectedCheckout._id;
        selectedCheckout['status'] = 'Online';
        let _data = {
            checkoutInput: selectedCheckout
        }
        if(!selectedCheckout['itemName'] || !selectedCheckout['price']){
            this.props.showSnackbar("Please enter service name and price.", true);
            this.state.checkoutModel.status = '';
        } else {
            try {
                let _price = parseFloat(_data.checkoutInput.price).toFixed(2);
                delete _data.checkoutInput.total;
                delete _data.checkoutInput.price;
                delete _data.checkoutInput.userId
                _data.checkoutInput['currency']=this.props.selectedBusiness.currency;
                _data.checkoutInput['price'] = parseFloat(_price);
                await updateCheckoutById(_checkoutId, _data)
                this.props.showSnackbar("Checkout updated successfully", false);
                this.fetchCheckoutData();
            } catch (error) {
                this.props.showSnackbar(error.message, true)
            }
        }
    }

    openTextBox = () => {
        this.setState({
            openText: !this.state.openText,
            checkoutData:{
                _id: this.props.match.params.id,
                publicView:{
                    shareableLinkUrl:this.getShareLink()
                }
            }
        })
      }

    onCloseText = (status, alertTitle, alertMsg, from) => {
        this.setState({
          openText: false,
        })
        if (status === true) {
          this.onOpenAlert(this.state.receiptItem, alertTitle, alertMsg, 'Checkout')
          this.fetchCheckoutData()
        }
      }  

      onOpenAlert = (item, title, msg, from) => {
        this.setState({
          openAlert: true,
          receiptItem: item,
          alertTitle: title,
          alertMsg: msg,
          from
        })
      }

    onOpenReceiptMail = (item, index) => {
        this.setState({
          openReceiptMail: true,
          openMail: true,
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

    getShareLink(){
        return this.state.selectedCheckout && this.state.selectedCheckout.publicView && this.state.selectedCheckout.publicView.shareableLinkUrl
    }

    downloadQR = () => {
        const canvas = document.getElementById("share-checkout");
        const pngUrl = canvas
          .toDataURL("image/png")
          .replace("image/png", "image/octet-stream");
        let downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = "QRCode.png";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
     }


    copyText = () => {
        this.refs.input.select();
        document.execCommand('copy');
        this.setState({
            isTextCopied: true
        });
        setTimeout(() => {
            this.setState({
                isTextCopied: false
            });
        }, 2000);
        return false;
    }

    redirectToCheckouts(){
        history.push('/app/sales/checkouts');
    }

    render() {
        const { text, isTextCopied, isLoadingData,openText,checkoutData,openAlert, receiptItem,alertTitle, alertMsg } = this.state;
       
        return (
            <div className="checkoutWrapper">
                    {
                        isLoadingData ?
                        <Container className="mrT50 text-center">
                            <CenterSpinner />
                        </Container> :
                        <div className="content-wrapper__main__fixed">
                            <div className="checkouts-share__header">
                            <header className="py-header--page d-flex align-items-center justify-content-between">
                                {
                                    (this.state.selectedCheckout._id)?
                                    <div className="py-header--title">
                                            <h4 className="py-heading--title"> <strong> {this.state.selectedCheckout.itemName} </strong> </h4>
                                            {
                                                (this.state.selectedCheckout)?
                                                <Badge className="mt-2" status={this.state.selectedCheckout.status} /> : ''
                                            }

                                    </div>  : ''
                                }
                                <div className="py-header--actions">
                                    <Button onClick={() => history.push('/app/sales/checkouts/edit/' + this.state.selectedCheckout._id)} color="primary" outline >Edit</Button>
                                    {
                                        (this.state.selectedCheckout && this.state.selectedCheckout.status == "Offline")?
                                        <Button onClick={this.saveCheckout} color="primary">Turn On</Button>
                                        :
                                        <Button onClick={() => history.push('/app/sales/checkouts/add')} color="primary" outline >Create another checkout</Button>
                                    }
                                </div>
                            </header>
                            </div>
                            <div className="checkouts-share__body">
                                {
                                    (this.state.selectedCheckout && this.state.selectedCheckout.status == "Offline")?
                                    <div className="py-notify py-notify--warning">
                                        <div className="py-notify__icon-holder">
                                        <svg viewBox="0 0 20 20" className="Icon" xmlns="http://www.w3.org/2000/svg"><path d="M7.916 3.222C8.369 2.453 9.153 2 10 2c.848 0 1.632.453 2.085 1.222l6.594 12.196c.426.758.428 1.689.006 2.449-.424.765-1.147 1.122-2.084 1.133H3.391c-.928-.01-1.65-.368-2.075-1.133a2.51 2.51 0 0 1 0-2.436l6.6-12.21zm-4.76 12.904a.717.717 0 0 0-.002.696c.063.114.21.174.557.178h12.46c.356-.004.502-.064.565-.178a.723.723 0 0 0-.008-.708L10.564 4.298A.657.657 0 0 0 10 3.97a.656.656 0 0 0-.557.317l-6.287 11.84zM10 14a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-6a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0V9a1 1 0 0 1 1-1z"></path></svg>
                                        </div>
                                        <div className="py-notify__content-wrapper">
                                            <div className="py-notify__content">
                                            This checkout is turned off. Turn on this checkout to receive payments.
                                            </div>
                                        </div>
                                    </div> : ''
                                }
                                <div className="py-box py-box--large">
                                    <div class="invoice-steps-card__options">
                                        <div class="invoice-step-Collapsible__header-content" >
                                            <div class="step-indicate">
                                                <div class="step-icon plane-icon">                                                
                                                    <Icon
                                                        className="Icon"
                                                        xlinkHref={`${symbolsIcon}#external-link`}
                                                    />
                                                </div>
                                            </div>
                                            <div className="d-flex cursor-pointer w-100" onClick={this.toggleShareLink}>
                                                <div class="py-heading--subtitle">Share a direct link</div>
                                                <div class="invoice-step-card__actions">                                                                                      
                                                    <div className={`collapse-arrow ms-auto ${this.state.shareLinkOpen && 'collapsed'}`}>
                                                        <i className="fas fa-chevron-up"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {this.state.shareLinkOpen &&             
                                        <div className="invoice-steps-card__content mt-3 ms-4 me-2 ps-5">
                                            <div class="invoice-create-info">
                                                <div className="row">
                                                    <div className="col-9">
                                                        <p className="py-text mb-4">Copy this link and share it with your customers to get paid instantly.</p>
                                                        <div className="py-share-link mb-4" >
                                                            <span className="link-icon">
                                                                <i class="far fa-link"></i>
                                                            </span>
                                                            <a 
                                                                id="shareLink" 
                                                                href={this.getShareLink()} 
                                                                target="_blank" 
                                                                className="link-content"
                                                            >{this.getShareLink()}</a>
                                                            <Button onClick={this.copyText} className="copy-action" color="link" disabled={isTextCopied == true}>
                                                                {text}
                                                                <input
                                                                    ref="input"
                                                                    type="text"
                                                                    defaultValue={this.getShareLink()}
                                                                    style={{ position: 'fixed', top: '-1000px' }} />
                                                                {/* {(isTextCopied == false) ? 'Copy link' : 'Copied'} */}                                                                
                                                                <Icon
                                                                    className="Icon"
                                                                    xlinkHref={`${symbolsIcon}#copy`}
                                                                />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="col-3 d-flex justify-content-center flex-wrap align-items-center">
                                                    {/* <ButtonDropdown  isOpen={this.state.checkoutDropdown} outline={invoiceData.sentVia === ''} toggle={this.toggleSendCheckoutDropdown} >
                                                       <DropdownToggle color="primary" disabled={this.state.copyLoad} outline={checkoutData.sentVia === ''} caret>Send checkout via</DropdownToggle>
                                                       <DropdownMenu right>
                                                         <DropdownItem key={1} onClick={this.openMailBox}>Email Address</DropdownItem>
                                                         <DropdownItem key={2} onClick={this.openTextBox} >Text Message</DropdownItem>
                                                       </DropdownMenu>
                                                     </ButtonDropdown> */}
                                                    <Button
                                                      onClick={this.openTextBox}
                                                      color="primary"
                                                      outline
                                                    >Send via text</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }                                    
                                </div>
                                <div class="invoice-view__body__vertical-line"></div>
                                <div className="py-box py-box--large">
                                    <div class="invoice-steps-card__options">
                                        <div class="invoice-step-Collapsible__header-content" >
                                            <div class="step-indicate">
                                                <div class="step-icon plane-icon">                                                
                                                    <Icon
                                                        className="Icon"
                                                        xlinkHref={`${symbolsIcon}#qrscan`}
                                                    />
                                                </div>
                                            </div>
                                            <div className="d-flex cursor-pointer w-100" onClick={this.toggleQrScane}>
                                                <div class="py-heading--subtitle">Share a QR code</div>
                                                <div class="invoice-step-card__actions">                                                                                      
                                                    <div className={`collapse-arrow ms-auto ${this.state.qrScanOpen && 'collapsed'}`}>
                                                        <i className="fas fa-chevron-up"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {this.state.qrScanOpen &&             
                                        <div className="invoice-steps-card__content mt-3 ms-4 me-2 ps-5">
                                            <div class="invoice-create-info">
                                                <div className="row">
                                                    <div className="col-9">
                                                        <p>Download this QR code and share it with your customers to get paid instantly.</p>
                                                        <p className="m-0">You can put this QR code on:</p>
                                                        <ul className="ps-4">
                                                            <li>Your mail signature</li>
                                                            <li>Your website footer</li>
                                                            <li>Your portfolio page</li>
                                                            <li>Your business card or Ads</li>
                                                        </ul>

                                                    </div>
                                                    <div className="col-3 d-flex justify-content-center flex-wrap">
                                                        <div className="mt-n2">
                                                            <QRCode
                                                                id="share-checkout"
                                                                value={this.getShareLink()}
                                                                size={164}
                                                                level={"H"}
                                                                includeMargin={true}
                                                            />
                                                        </div>
                                                        <Button onClick={this.downloadQR} color="primary px-4">Download code</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }                                    
                                </div>      

                                <div>
                                    <div className="invoice-view__body__vertical-line"></div>
                                        <EventsTimeLine
                                            entityId={this.props.match.params.id}
                                            status={this.state.selectedCheckout.status}
                                        />
                                    </div>
                            </div>
                        </div>
                    }
                    {
                      openText && (
                        <TextMessageModal
                          from="Checkout"
                          openMail={openText}
                          textData={checkoutData}
                          onClose={this.onCloseText}
                          textMessage={`Here is my checkout link for ${this.props.selectedBusiness.organizationName} amounting to ${getAmountToDisplay(this.state.selectedCheckout.currency,this.state.selectedCheckout.price )}`}
                          businessInfo={this.props.selectedBusiness}
                        />
                      )
                    }
                <SweetAlertSuccess
                  showAlert={openAlert}
                  receipt={receiptItem}
                  receiptIndex="1"
                  onConfirm={this.onOpenReceiptMail}
                  onCancel={this.onCloseAlert}
                  title={alertTitle}
                  message={alertMsg}
                  from="Checkout"
                />
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators(CheckoutActions, dispatch),
        showSnackbar: (message, error) => {
            dispatch(openGlobalSnackbar(message, error))
        }
    };
}
const mapStateToProps = state => {
    return {
        selectedBusiness: state.businessReducer.selectedBusiness,
        selectedCheckout: state.checkoutReducer.selectedCheckout,
    };
};


export default withRouter((connect(mapStateToProps, mapDispatchToProps)(ShareCheckout)))