import React, { useEffect } from 'react';
import CenterSpinner from '../../../../../global/CenterSpinner';
import { connect } from 'react-redux'
import { openGlobalSnackbar } from '../../../../../actions/snackBarAction'
import { googleEmailConnects } from '../../../../../actions/profileActions'
import history from '../../../../../customHistory'

function GoogleAuthentication(props) {
 useEffect(() => {
  if (props.location.search.includes('code=')) {
   props.googleEmailConnects(props.location.search, (res) => {
    if (res.statusCode == 200) {
     props.showSnackbar(res.message, true)
     let url = `/app/accounts/email-connected`;
     history.push(url)
    } else {
     history.push('/signin')
     props.showSnackbar(res.message, false)
    }
   });
  } else {
   history.push('/signin')
  }
 }, [])

 return (
  <div className="container" style={{
   display: 'flex',
   minHeight: '100vh',
   justifyContent: 'center',
   alignItems: 'center'
  }}>
   <div className="col-12 col-sm-8 col-md-6 m-auto mt-4">
    <div className="card shadow text-center">
     <div className="py-heading--section-title mb-0"> Verifying your email. </div>
     <CenterSpinner />
     <div className="py-heading--subtitle mb-4 mt-0">This may take a few minutes</div>
    </div>
   </div>
  </div>
 );
}

const mapDispatchToProps = dispatch => ({
 showSnackbar: (message, error) => {
  dispatch(openGlobalSnackbar(message, error))
 },
 googleEmailConnects: (data, cb) => {
  dispatch(googleEmailConnects(data, cb))
 }
})
export default connect(null, mapDispatchToProps)(GoogleAuthentication)