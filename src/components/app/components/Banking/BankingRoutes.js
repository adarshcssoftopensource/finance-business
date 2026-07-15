import React from 'react'
import { Switch } from 'react-router-dom'
import MainRoute from '../../../../components/app/MainRoute'
import BankConnections from './components/BankConnections'
import BankOnboard from './components/BankingOnboard'
import BankImport from './components/BankImport'
import Payouts from './components/Payouts/'
import PayoutDetails from './components/Payouts/PayoutDetails'

export function BankingRoutes(url) {
    return (

        <Switch>
            <MainRoute exact path={`${url}/onboard`} component={BankOnboard} />
            <MainRoute exact path={`${url}/bankconnections`} component={BankConnections} />
            <MainRoute exact path={`${url}/import`} component={BankImport} />
            <MainRoute exact path={`${url}/payouts`} component={Payouts} />
            <MainRoute exact path={`${url}/payout-detail/:id`} component={PayoutDetails} />
        </Switch>
    )
};