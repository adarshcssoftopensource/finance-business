import React from 'react'

import { Switch } from 'react-router-dom'
import MainRoute from '../../../../components/app/MainRoute'

// Include all component here
import Upgrade from './';


export function UpgradeSubscriptionRoute(url) {
 return (     
  <Switch>
   <MainRoute exact path={`${url}/upgrade`} component={Upgrade} url={url} />
  </Switch>
 )
};
