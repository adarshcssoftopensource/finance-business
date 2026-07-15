import React from 'react'
import { Switch } from 'react-router-dom'
import MainRoute from '../../../../components/app/MainRoute'
import CrowdFunding from './components/index';
import ViewCrowdFunding from './components/view';

export function CrowdFundingRoutes(url) {
  return (
    <Switch>
      <MainRoute path={`${url}/:state?`} component={CrowdFunding} />
      <MainRoute exact path={`${url}/view`} component={ViewCrowdFunding} />
    </Switch>
  )
};
