import React from 'react'
import { Button } from 'reactstrap'
import Icon from '../../../../../components/common/Icon'
import ShareLinkWidget from '../../../../common/ShareLinkWidget'
import symbolsIcon from "../../../../../assets/icons/product/symbols.svg";

const ShareCrowdFunding = props => {
  const { openGlobalSnackbar, handleDone, peymeLink } = props
  return (
    <div>
      <div className="peyme-box-wrapper">
        <div className="peyme-success-box">
          <div className="check-icon">
            <Icon
              className="Icon"
              xlinkHref={`${symbolsIcon}#check-solid`}
            />
          </div>
          <h3 className="success-title">Your link is ready to share</h3>
          <div className="success-desc">
            <p>
              You can manage your profile and add more info to it in your
              settings.
            </p>
          </div>
          <div className="share-lable">Share your link</div>
          <ShareLinkWidget openGlobalSnackbar={openGlobalSnackbar} peymeLink={peymeLink}/>
          <Button
            color="primary"
            className="peyme-action"
            onClick={() => handleDone('/app/give')}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ShareCrowdFunding
