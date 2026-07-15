import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux'
import RecurlyCardForm from '../../../../../../global/recurlyCardForm'
import { updateCustomerCard } from '../../../../../../api/subscriptionService'
import { openGlobalSnackbar } from '../../../../../../actions/snackBarAction';
import history from '../../../../../../customHistory';

const Index = (props) => {
  const [isLoading, setIsLoading] = useState(false)
  const [threeDActionTokenId, setThreeDActionTokenId] = useState('')

  const handleSubscribe = async (data) => {
    setIsLoading(true)
    try {
      const dataObj = {
        paymentMethodId: data.paymentMethodId,
        cardHolderName: data.cardHolderName,
        subscriptionId: props.match.params.subscriptionId
      }
      if (data?.threeDSecureToken) {
        dataObj.threeDSecureToken = data?.threeDSecureToken
      }
      const response = await updateCustomerCard(dataObj)
      setIsLoading(false)
      if (response.statusCode === 200) {
        handleMessage(response.message, false)
        history.push('/app/setting/subscription-history')
      } else {
        throw new Error(response.error)
      }
    } catch (error) {
      const errorMessage = error?.message || error?.data?.message;
      if (errorMessage) {
        if (errorMessage?.startsWith('three_d_secure_action_required')) {
          setThreeDActionTokenId(errorMessage?.split(':')?.[1])
        }
      }
      setIsLoading(false)
      handleMessage(error.message, true)
    }
  }

  const handleMessage = (data, type) => {
    props.showSnackbar(data, type)
  }

  return (
    <div className="subs-card-update" >
      <div className="content-wrapper__main__fixed" >
        <div className="row mb-5">
          <div class="py-header--title mt-0 col-8"><h2 class="py-heading--title">
            <Link to="/app/setting/subscription-history"><button type="button" className="btn-back" ><i className="fas fa-arrow-left"></i></button></Link> Update credit card</h2></div>
        </div>
        <div className="price-items row" >
          <div className="col-7">
            {/* Billing-Details-Form */}
            <RecurlyCardForm
              type="updateCard"
              buttonText="Update card"
              showDisclaimer={false}
              isLoading={isLoading}
              showMessage={handleMessage}
              getCardDetails={(data) => handleSubscribe(data)}
              threeDActionTokenId={threeDActionTokenId}
            />
          </div>
          <div className="col-4 offset-sm-1">
            <figure className="me-md-n5 subscription-cradit-card">
              <img src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/subscription/credit-card.png`} alt="Cradit card" />
            </figure>
          </div>
        </div>
      </div>
    </div>
  );
}

const mapDispatchToProps = dispatch => {
  return {
    showSnackbar: (message, error) => {
      dispatch(openGlobalSnackbar(message, error))
    }
  }
}

export default connect(null, mapDispatchToProps)(Index)