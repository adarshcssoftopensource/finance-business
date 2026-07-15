import React, { Component } from 'react'
import Reports from './CrowdFundingSections/Reports'
import Payments from './CrowdFundingSections/Payments'
import ShareLink from './CrowdFundingSections/ShareLink'
import QRCodeSection from './CrowdFundingSections/QRCodeSection'
import CrowdItems from './CrowdFundingSections/CrowdItems'
import OrderItems from './CrowdFundingSections/OrderItems';

export default class ViewCrowdFunding extends Component {
  constructor(props) {
    super(props)

    this.state = {
      shareLinkOpen: true,
      qrCodeOpen: true,
      reportOpen: true,
      paymentsOpen: true,
    }
  }

  toggleShareLink = () => {
    this.setState((prevState) => ({
      shareLinkOpen: !prevState.shareLinkOpen,
    }))
  }
  toggleQRCode = () => {
    this.setState((prevState) => ({
      qrCodeOpen: !prevState.qrCodeOpen,
    }))
  }
  toggleReport = () => {
    this.setState((prevState) => ({
      reportOpen: !prevState.reportOpen,
    }))
  }
  togglePayment = () => {
    this.setState((prevState) => ({
      paymentsOpen: !prevState.paymentsOpen,
    }))
  }

  render() {
    const { shareLinkOpen, qrCodeOpen, reportOpen, paymentsOpen } = this.state
    return (
      <div>
        <Reports
          {...this.props}
          toggleReport={this.toggleReport}
          reportOpen={reportOpen}
        />
        <ShareLink
          {...this.props}
          toggleShareLink={this.toggleShareLink}
          shareLinkOpen={shareLinkOpen}
        />
        <QRCodeSection
          {...this.props}
          toggleQRCode={this.toggleQRCode}
          qrCodeOpen={qrCodeOpen}
        />
        <CrowdItems {...this.props} />
        <OrderItems {...this.props} />
        {!this.props.isViewer && (
          <Payments
            {...this.props}
            togglePayment={this.togglePayment}
            paymentsOpen={paymentsOpen}
          />
        )}
      </div>
    )
  }
}
