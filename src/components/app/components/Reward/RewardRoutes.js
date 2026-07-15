import React from 'react'
import { Switch } from 'react-router-dom'
import MainRoute from '../../../../components/app/MainRoute'
import Reward from './components/reward';
import History from './components/history';

export function RewardRoutes(url) {
    
    return (
        <Switch>
            <MainRoute exact path={`${url}/reward`} component={Reward} />
            <MainRoute exact path={`${url}/history`} component={History} />
        </Switch>
    )
};
