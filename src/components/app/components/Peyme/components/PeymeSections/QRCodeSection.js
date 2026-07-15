import React from 'react'
import Icon from '../../../../../common/Icon'
import QRCode from 'qrcode.react'
import { Button } from 'reactstrap'
import ShareLinkWidget from '../../../../../common/ShareLinkWidget'
import symbolsIcon from "../../../../../../assets/icons/product/symbols.svg";

const QRCodeSection = props => {
  const { peymeData, toggleQRCode, qrCodeOpen, isViewer,shareLink, openGlobalSnackbar } = props
  const downloadQR = () => {
    const canvas = document.getElementById('share-peyme')
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream')
    let downloadLink = document.createElement('a')
    downloadLink.href = pngUrl
    downloadLink.download = 'PeymeQRCode.png'
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }
  return (
    <div>
      <div className="py-box py-box--large">
        <div className="invoice-steps-card__options">
          <div className="invoice-step-Collapsible__header-content">
            <div className="step-indicate">
              <div className="step-icon plane-icon">
                <Icon
                  className="Icon"
                  xlinkHref={`${symbolsIcon}#qrscan`}
                />
              </div>
            </div>
            <div className="d-flex cursor-pointer w-100" onClick={toggleQRCode}>
              <div className="py-heading--subtitle">Share your Finance.Me Lynk</div>
              <div className="invoice-step-card__actions">
                <div className={`collapse-arrow ms-auto ${qrCodeOpen && 'collapsed'}`}>
                  <i className="fas fa-chevron-up"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        {qrCodeOpen &&
        <div className="invoice-steps-card__content mt-3 ms-4 me-2 ps-5">
          <div className="invoice-create-info">
            <div className="row align-items-start">
              <div className="col-9">
                <p>
                  Download this QR code to share with your friends, family, and
                  customers to get paid instantly.
                </p>
                <p className="m-0">You can put this QR code on:</p>
                <ul className="ps-4">
                  <li>Your mail signature</li>
                  <li>Your website footer</li>
                  <li>Your portfolio page</li>
                  <li>Your business card or Ads</li>
                </ul>                
                <div className="mt-4"><ShareLinkWidget peymeLink={shareLink} openGlobalSnackbar={openGlobalSnackbar} isPeyme/></div>   
              </div>
              <div className="col-3 d-flex align-items-center flex-column">
                <QRCode
                  id="share-peyme"
                  value={
                    peymeData ? peymeData.peyme.publicView.shareableLinkUrl : ''
                  }
                  size={164}
                  level={'H'}
                  includeMargin={true}
                />
                <Button onClick={downloadQR} disabled={isViewer} color="primary px-4 mt-3">
                  Download code
                </Button>
              </div>
            </div>
          </div>
        </div>
        }
      </div>
      {!isViewer &&
      <div className="invoice-view__body__vertical-line"></div>}
    </div>
  )
}

export default QRCodeSection
