import React, { useState } from 'react';
import { Spinner, Button } from 'reactstrap';
import { connect } from 'react-redux';
import {
 fetchKycUrl
} from '../../../../../../../../actions/paymentAction'

const Index = (props) => {
 const [isLoading, setIsLoading] = useState(false);

 const generateUrl = async () => {
  try {
   setIsLoading(true)
   await props.fetchKycUrl((res) => {
    setIsLoading(false)
    if (res.data && res.data.urlInfo && res.data.urlInfo.url) {
     window.open(res.data.urlInfo.url, '_blank')
    } else {
     props.showSnackbar(res.message ? res.message : "Something went wrong", true)
    }
   })
  } catch (error) {
   setIsLoading(false);
   props.showSnackbar(error.message, true)
  }
 }
 return (
  <div className="content-wrapper">
   <header className="py-header--page flex">
    <div className="py-header--title mt-2">
     <h2 className="text-center mt-2 py-heading--subtitle">
      Please Turn Off Your Ad Blocker Before Proceeding.
        </h2>
    </div>
   </header>
   <div className="d-flex align-items-center m-4 text-center">
    <Button color="primary" disabled={isLoading} onClick={generateUrl}>Start Onboarding {isLoading && (<Spinner size="sm" color="default" />)}</Button>
   </div>
  </div>
 );
}

const mapDispatchToProps = dispatch => {
 return {
  fetchKycUrl: (cb) => {
   dispatch(fetchKycUrl(cb))
  }
 }
}

export default connect(null, mapDispatchToProps)(Index)