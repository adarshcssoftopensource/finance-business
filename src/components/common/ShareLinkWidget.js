import React from 'react'
import { Button } from 'reactstrap'
import {
  FacebookShareButton,
  FacebookIcon,
  FacebookMessengerShareButton,
  FacebookMessengerIcon,
  TwitterShareButton,
  TwitterIcon,
  LinkedinShareButton,
  LinkedinIcon,
  WhatsappShareButton,
  WhatsappIcon,
  EmailShareButton,
  EmailIcon,
  
} from 'react-share'

const ShareLinkWidget = props => {
  const { openGlobalSnackbar, peymeLink,isPeyme } = props
  const peymeURl = peymeLink ? peymeLink : ''
  const copyToClipboard = () => {
    const cb = navigator.clipboard
    cb.writeText(peymeURl).then(() => openGlobalSnackbar('Link copied!'), false)
  }
  return (
          <div className="social-share">
            {!isPeyme && 
            <a onClick={copyToClipboard} href="#">
              <i class="far fa-copy"></i>
            </a>
            }
            <FacebookShareButton
              url={peymeURl}
              className="Demo__some-network__share-button"
            >
              <FacebookIcon size={32} round />
            </FacebookShareButton>
            <FacebookMessengerShareButton
              url={peymeURl}
              className="Demo__some-network__share-button"
            >
              <FacebookMessengerIcon size={32} round />
            </FacebookMessengerShareButton>
            <TwitterShareButton
              url={peymeURl}
              className="Demo__some-network__share-button"
            >
              <TwitterIcon size={32} round />
            </TwitterShareButton>
            <LinkedinShareButton
              url={peymeURl}
              className="Demo__some-network__share-button"
            >
              <LinkedinIcon size={32} round />
            </LinkedinShareButton>
            <WhatsappShareButton
              url={peymeURl}
              className="Demo__some-network__share-button"
            >
              <WhatsappIcon size={32} round />
            </WhatsappShareButton>
            <EmailShareButton
              url={peymeURl}
              className="Demo__some-network__share-button"
            >
              <EmailIcon size={32} round />
            </EmailShareButton>
          </div>
  )
}

export default ShareLinkWidget
