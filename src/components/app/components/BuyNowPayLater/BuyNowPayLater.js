import React from 'react';
import { Route, Switch } from 'react-router-dom';
import BuyNowPayLater from '../../BuyNowPayLater';

import MainRoute from '../../../../components/app/MainRoute';

export const BuyNowPayLaterRoutes = (url) => {
  return (
    <Switch>
      <MainRoute
        exact
        path={`${url}`}
        component={BuyNowPayLater}
      />
    </Switch>
  );
};