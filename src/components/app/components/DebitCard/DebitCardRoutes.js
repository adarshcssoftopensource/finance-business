import React from 'react'
import { Switch } from 'react-router-dom'
import MainRoute from '../../../../components/app/MainRoute'
import DebitCard from './components/debitcard';
import Onboarding from './components/onboarding';

export function DebitCardRoutes(url) {
    return (
        <Switch>
            <MainRoute exact path={`${url}`} component={DebitCard} />
            <MainRoute exact path={`${url}/onboarding`} component={Onboarding} />
        </Switch>
    )
};
