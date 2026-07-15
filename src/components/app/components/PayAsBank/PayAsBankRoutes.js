import React from 'react';
import { Route, Switch } from 'react-router-dom';
import PayAsBank from '../../PayAsBank';

import MainRoute from '../../../../components/app/MainRoute';

export const PayAsBankRoutes = (url) => {
  return (
    <Switch>
      <MainRoute
        exact
        path={`${url}`}
        component={PayAsBank}
      />
    </Switch>
  );
};