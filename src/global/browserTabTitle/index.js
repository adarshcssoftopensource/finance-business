import React from 'react';
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux';

function Index({ businessInfo,title}) {
 return (
  <Helmet>
   <title>{businessInfo && businessInfo.organizationName ? `Finance - ${businessInfo.organizationName}` :'Finance'} - {title}</title>
  </Helmet>
 );
}

const mapPropsToState = ({ businessReducer }) => ({
 businessInfo: businessReducer.selectedBusiness,
});

export default connect(mapPropsToState, {})(Index)