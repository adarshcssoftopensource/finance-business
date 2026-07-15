import React from 'react'
import { Switch } from 'react-router-dom'
import MainRoute from '../../../../components/app/MainRoute'
import Advisors from './components/advisors';

export function AdvisorsRoutes(url) {
    
    return (
        <Switch>
            <MainRoute exact path={`${url}/advisors`} component={Advisors} />
        </Switch>
    )
};
