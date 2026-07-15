import React, { useState, Component } from 'react'
import {
  Button,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap'
import Icon from '../../../../common/Icon'
import Reports from './PeymeSections/Reports'
import Payments from './PeymeSections/Payments'
import ShareLink from './PeymeSections/ShareLink'
import QRCodeSection from './PeymeSections/QRCodeSection'

export default class ViewPeyme extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
      shareLinkOpen: true,
      qrCodeOpen: true,
      reportOpen: true,
      paymentsOpen: true 
    }
  }

  toggleShareLink = () => {
    this.setState(prevState => ({
        shareLinkOpen: !prevState.shareLinkOpen,
    }));
  }
  toggleQRCode = () => {
    this.setState(prevState => ({
        qrCodeOpen: !prevState.qrCodeOpen,
    }));
  }
  toggleReport = () => {
    this.setState(prevState => ({
        reportOpen: !prevState.reportOpen,
    }));
  }
  togglePayment = () => {
    this.setState(prevState => ({
        paymentsOpen: !prevState.paymentsOpen,
    }));
  }

  render() {
    const {shareLinkOpen, qrCodeOpen, reportOpen, paymentsOpen} = this.state
    return (
      <div>
        <Reports {...this.props} toggleReport={this.toggleReport} reportOpen={reportOpen}/>
        <ShareLink {...this.props} toggleShareLink={this.toggleShareLink} shareLinkOpen={shareLinkOpen}/>
        <QRCodeSection {...this.props} toggleQRCode={this.toggleQRCode} qrCodeOpen={qrCodeOpen}/>
        {!this.props.isViewer &&
        <Payments {...this.props} togglePayment={this.togglePayment} paymentsOpen={paymentsOpen}/>}
      </div>
    )
  }
}
