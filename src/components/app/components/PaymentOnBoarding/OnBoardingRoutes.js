import React from 'react'

import { Switch } from 'react-router-dom'

import MainRoute from '../../../../components/app/MainRoute'
import PaymentOnboarding from './index';

export function PaymentOnBoardingRoutes(url) {
  return (
    <Switch>
      <MainRoute exact path={`${url}`} component={PaymentOnboarding} />
    </Switch>
  )
};