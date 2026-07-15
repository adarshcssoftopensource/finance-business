import React, { Component } from "react";
import { Button } from 'reactstrap';
import { invoiceInput } from "../../helpers";
import { getInvoice } from "../../../../../../api/InvoiceService";
import { fetchEstimateById } from "../../../../../../api/EstimateServices";
import { privacyPolicy, terms, getAmountToDisplay, getLogoURL } from "../../../../../../utils/GlobalFunctions";
import CenterSpinner from "../../../../../../global/CenterSpinner";
import { getRecurringInvoice } from "../../../../../../api/RecurringService";
import { _displayDate } from "../../../../../../utils/globalMomentDateFunc";

class MailPreview extends Component {
  state = {
    openModal: false,
    dropdownOpen: false,
    dropdownOpenMore: false,
    modal: false,
    invoiceModal: false,
    selectedCustomer: null,
    invoiceData: invoiceInput(),
    settings: null,
    loading: false
  };

  componentDidMount() {
    const { id } = this.props.match.params;
    document.title = "Finance"
    this.fetchInvoiceData(id);
  }

  fetchInvoiceData = async id => {
    this.setState({ loading: true })
    let response, invoiceData
    try {
      if (this.props.location.pathname.includes('invoice')) {
        response = await getInvoice(id);
        invoiceData = response.data.invoice;
      } else if (this.props.location.pathname.includes('estimate')) {
        response = await fetchEstimateById(id)
        invoiceData = response.data.estimate;
      } else {
        response = await getRecurringInvoice(id)
        invoiceData = response.data.invoice;
      }
      this.setState({ invoiceData, settings: response.data.salesSetting, loading: false });
    } catch (error) {
      this.setState({ loading: false })
    }
  };

  render() {
    const { invoiceData, settings, loading } = this.state;
    const businessInfo = invoiceData.businessId;
    const userInfo = invoiceData.userId;
    const customer = invoiceData.customer;

    if (!!businessInfo) {
      return (
        <div className="mail-preview height-100 py-5">

          <div className="row justify-content-center">
            <div className="col-md-5">
              <div className="py-notify py-notify--info">
                <div className="py-notify__icon-holder">
                  {/* <img src="/assets/information.svg" /> */}
                  <svg viewBox="0 0 20 20" className="Icon" id="info" xmlns="http://www.w3.org/2000/svg"><path d="M10 19a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-2a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm0-11a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 3a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0v-4a1 1 0 0 1 1-1z"></path></svg>
                </div>
                <div className="py-notify__content-wrapper">
                  <div className="py-notify__content">
                    This is a preview of the email that your customer will see.
              </div>
                  <div className="py-notify__action">
                    <Button
                      onClick={() => {
                        window.close();
                      }}
                      color="primary"
                      outline
                    >Close this tab</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {
            loading ? <CenterSpinner />
              : (

                <div className="mailpreview__box">
                  {
                    !!settings ? !!settings.companyLogo ? (
                      <div className="mailpreview__image text-center">
                        <img alt="companyLogo" src={`${settings.companyLogo}`} />
                      </div>
                    )
                      : "" : ""
                  }
                  <div className="mailpreview__details">
                    <div className="mailpreview__details__text">
                      <strong className="py-text--strong">
                        {businessInfo.organizationName}
                      </strong>{" "}
                    has sent you an invoice for
                    {invoiceData && invoiceData.currency && (
                        <div className="mailpreview__details__subtitle">
                          {getAmountToDisplay(invoiceData.currency, invoiceData.totalAmount)}
                        </div>
                      )}
                      {invoiceData && (
                        <div className="mailpreview__details__text__due_date">
                          {" "}
                        Due on {_displayDate(invoiceData.dueDate, 'MMMM DD, YYYY')}{" "}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mailpreview__details__button">
                    {
                      invoiceData && invoiceData.onlinePayments && invoiceData.onlinePayments.onlinePaymentAllowed ? (
                        <Button
                          onClick={() =>
                            window.open(
                              `${process.env.REACT_APP_PUBLIC_BASE_URL}/invoice/${invoiceData.uuid}`
                            )
                          }
                          color="primary"
                        >Review & Pay</Button>
                      )
                        : (
                          <Button
                            onClick={() =>
                              window.open(
                                `${process.env.REACT_APP_WEB_URL}/invoices/readonly/${invoiceData._id}`
                              )
                            }
                            color="primary"
                          >
                            View invoice
                          </Button>
                        )
                    }
                  </div>

                  <div className="divider-full-width">
                    <div className="py-divider"> </div>
                  </div>
                  <div className="mailpreview__contact py-text--hint py-text--small">
                    For questions about this invoice, please contact <br />
                    <a className="Py-text--link" href="#">
                      {userInfo.email}
                    </a>
                    <div className="mailpreview__box__address__details">
                      <strong>{businessInfo.organizationName}</strong>
                      {businessInfo && businessInfo.address && (
                        <div className="con-temp-address">
                          <div className="address__field">
                            {businessInfo.address.addressLine1}
                          </div>
                          <div className="address__field">
                            {`${businessInfo.address.city},`}{" "}
                            {businessInfo.address.state && businessInfo.address.state.name} {businessInfo.address.postal}
                          </div>
                          <div className="address__field">
                            {businessInfo.address.country && businessInfo.address.country.name}
                          </div>
                          <div className="address__field" />
                        </div>
                      )}
                      <br />
                      {businessInfo && businessInfo.communication && (
                        <div className="con-temp-address">
                          {businessInfo.communication.phone && (
                            <div className="address__field">
                              {" "}
                            Phone: {businessInfo.communication.phone}
                            </div>
                          )}
                          {businessInfo.communication.fax && (
                            <div className="address__field">
                              Fax: {businessInfo.communication.fax}
                            </div>
                          )}
                          {businessInfo.communication.mobile && (
                            <div className="address__field">
                              {" "}
                            Mobile: {businessInfo.communication.mobile}
                            </div>
                          )}
                          {businessInfo.communication.tollFree && (
                            <div className="address__field">
                              {" "}
                            Toll-Free: {businessInfo.communication.tollFree}
                            </div>
                          )}
                          {businessInfo.communication.website && (
                            <div className="address__field">
                              {businessInfo.communication.website}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
          }
          <div className="text-center mt-4">
            <div className="receipt-preview-email__footer mb-3">
              <span className="receipt-preview-email__footer__powered-by">
                Powered by
              </span>
              <a href="#">
                <img 
                src={getLogoURL()}
                width="auto" height="32" />{" "}
              </a>
            </div>
            <div className="py-text--smal py-text--hint">
              © {_displayDate(new Date(), 'YYYY')} Finance LLC. All Rights Reserved.
              <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>{" "}
              <a className="py-text--link" href={privacyPolicy()} target="_blank" >Privacy Policy</a>
              <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
              <a className="py-text--link" href={terms()} target="_blank">Terms of Use </a>
            </div>
          </div>
        </div>
      );
    } else {
      return null
    }
  }
}

export default MailPreview;