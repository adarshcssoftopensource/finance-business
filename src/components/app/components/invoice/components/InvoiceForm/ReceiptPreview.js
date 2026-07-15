import React, { Component } from "react";
import { invoiceInput } from "../../helpers";
import CenterSpinner from '../../../../../../global/CenterSpinner'
import { getInvoice, getInvoiceByUUID } from "../../../../../../api/InvoiceService";
import PaymeServices from '../../../../../../api/PaymeServices'
import CheckoutServices from '../../../../../../api/CheckoutService'
import CrowdFundingServices from "../../../../../../api/CrowdFundingServices";
import { Container, Spinner } from 'reactstrap'
import RecieptWrapper from "../../../../../../global/RecieptWrapper";


class ReceiptPreview extends Component {
  state = {
    openModal: false,
    dropdownOpen: false,
    dropdownOpenMore: false,
    modal: false,
    invoiceModal: false,
    selectedCustomer: null,
    invoiceData: invoiceInput(),
    salesSettings: null,
    userInfo: null,
  };

  componentDidMount() {
    const { id, receiptId } = this.props.match.params;
    if (this.props.location.pathname.includes('peyme')) {
      this.fetchPeymeData(receiptId);
    } else if (this.props.location.pathname.includes('checkout')) {
      this.fetchCheckoutData(receiptId);
    } else if (this.props.location.pathname.includes('funding')) {
      this.fetchCrowdFundingData(receiptId);
    } else {
      this.fetchInvoiceData(id);
    }
  }

  fetchPeymeData = async (id) => {
    try {
      let response;
      if (this.props.location.pathname.includes('readonly')) {
        response = await PaymeServices.fetchPeyMePayment(id)
      } else {
        response = await PaymeServices.fetchPeyMePayment(id)
      }
      const peymeData = response.data.peyme;
      const invoiceData = {
        ...peymeData,
        title: "Finance.Me",
        invoiceNumber: peymeData.peymeName,
        currency: response.data.payment.currency,
        receiptFor: 'peyme',
        businessId: peymeData.business,
        customer: { ...response.data.payment.customer, currency: response.data.payment.currency},
      };
      let salesSettings = response.data.salesSetting;
      const receiptData = response.data.payment;
      let userInfo = response.data.userInfo;
      this.setState({ invoiceData, receiptData, salesSettings, userInfo });
    } catch (error) {
    }
  }

  fetchCrowdFundingData = async (id) => {
    try {
      let response;
      if (this.props.location.pathname.includes('readonly')) {
        response = await CrowdFundingServices.fetchCrowdFundingPayment(id)
      } else {
        response = await CrowdFundingServices.fetchCrowdFundingPayment(id)
      }
      const crowdFundingData = response.data.funding;
      const invoiceData = {
        ...crowdFundingData,
        title: "Give",
        invoiceNumber: crowdFundingData.fundingName,
        currency: response.data.payment.currency,
        receiptFor: 'funding',
        businessId: crowdFundingData.business,
        customer: { ...response.data.payment.customer, currency: response.data.payment.currency},
      };
      const salesSettings = response.data.salesSetting;
      const receiptData = response.data.payment;
      const userInfo = response.data.userInfo;
      this.setState({ invoiceData, receiptData, salesSettings, userInfo });
    } catch (error) {}
  }

  fetchCheckoutData = async (id) => {
    try {
      let response;
      if (this.props.location.pathname.includes('readonly')) {
        response = await CheckoutServices.fetchCheckoutPayment(id)
      } else {
        response = await CheckoutServices.fetchCheckoutPayment(id)
      }
      const checkoutData = response.data.checkout;
      const invoiceData = {
        ...checkoutData,
        title: "Checkout",
        invoiceNumber: checkoutData.itemName,
        currency: response.data.payment.currency,
        receiptFor: 'checkout',
        businessId: checkoutData.business,
        customer: { ...response.data.payment.customer, currency: response.data.payment.currency},
      };
      let salesSettings = response.data.salesSetting;
      const receiptData = response.data.payment;
      let userInfo = response.data.userInfo;
      this.setState({ invoiceData, receiptData, salesSettings, userInfo });
    } catch (error) {
    }
  }

  fetchInvoiceData = async id => {
    try {
      const { receiptId } = this.props.match.params;
      let response;
      if(this.props.location.pathname.includes('readonly')){
        response = await getInvoiceByUUID(id)
      }else{
        response = await getInvoice(id);
      }
      const invoiceData = {...response.data.invoice, receiptFor: 'invoice'};
      let salesSettings = response.data.salesSetting;
      let userInfo = response.data.userInfo;
      const receiptData = response.data.payments.find(o => {
        return o.uuid === receiptId;
      });
      this.setState({ invoiceData, receiptData, salesSettings, userInfo });
    } catch (error) {
    }
  };

  render() {
    const { invoiceData, receiptData, salesSettings, userInfo } = this.state;
    const businessInfo = invoiceData.businessId;
    return (
      <div className="receipt-preview">
        {
          invoiceData && businessInfo && userInfo && receiptData ?
          <RecieptWrapper userInfo={userInfo} invoiceData={invoiceData} businessInfo={businessInfo} receiptData={receiptData} salesSettings={salesSettings} {...this.props}/>
          : <Container className="text-center mrT50" style={{height: '100vh', width: '100%'}}>
              <CenterSpinner />
            </Container>
        }
        </div>
    );
  }
}

export default ReceiptPreview;
