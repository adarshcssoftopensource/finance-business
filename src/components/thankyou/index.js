import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import CenterSpinner from '../../global/CenterSpinner';
import { openGlobalSnackbar } from "../../actions/snackBarAction";
import * as BusinessAction from "../../actions/businessAction";
import { tapfilateConversion } from '../../tapfilate';

function Index(props) {
 useEffect(() => {
  // window.gtag('event', 'sign_up', {
  //  'event_label': 'Signup Completed',
  //  'event_category': 'auth'
  // });
  // window.gtag('send', 'sign_up');

  setTimeout(() => {
    setupSelectedBiz()
  }, 5000);
 });

 const setupSelectedBiz = async () => {
  await props.actions.setSelectedBussiness(localStorage.getItem('businessId'))
  props.showSnackbar('Business setup successfully', false);
 }

 return (
  <div>
   <Helmet>
    <meta charSet="utf-8" />
    <title>Finance - Business Setup</title>
    {process.env.NODE_ENV == 'production' ? tapfilateConversion.initialize(localStorage.getItem("user.email")) : ''}
   </Helmet>
   <div className="container" style={{
    display: 'flex',
    minHeight: '100vh',
    justifyContent: 'center',
    alignItems: 'center'
   }}>
    <div className="col-12 col-sm-8 col-md-6 m-auto mt-4">
     <div className="card shadow text-center">
      <div className="py-heading--section-title mb-0"> Please wait while we're setting up your business. </div>
      <CenterSpinner />
      <div className="py-heading--subtitle mb-4 mt-0">This may take a few minutes</div>
     </div>
    </div>
   </div>
  </div>
 );
}

const mapDispatchToProps = dispatch => {
 return {
  actions: bindActionCreators(BusinessAction, dispatch),
  showSnackbar: (message, error) => {
   dispatch(openGlobalSnackbar(message, error))
  },
 };
};


export default
 connect(
  null,
  mapDispatchToProps
 )(Index);