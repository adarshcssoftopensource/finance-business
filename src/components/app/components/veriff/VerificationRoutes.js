import React from 'react'

import { Switch } from 'react-router-dom'
import MainRoute from '../../MainRoute'

import IdentityVerification from '.';


function VerificationRoutes(url) {
  return (
    <Switch>
      <MainRoute exact path={`${url}`} component={IdentityVerification} url={url} />
    </Switch>
  )
};

export default VerificationRoutes;