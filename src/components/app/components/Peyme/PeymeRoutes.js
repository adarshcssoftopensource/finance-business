import React from 'react'
import { Switch } from 'react-router-dom'
import MainRoute from '../../../../components/app/MainRoute'
import Peyme from './components/index';
import PaymeIntro from './components/PaymeIntro';
import AddPayme from './components/AddPayme';
import EditPayme from './components/EditPayme';
import SharePayme from './components/SharePayme';
import ViewPeyme from './components/view';

export function PeymeRoutes(url) {
    
    return (
        <Switch>
            <MainRoute path={`${url}/:state?`} component={Peyme} />
            {/* <MainRoute exact path={`${url}/start`} component={PaymeIntro} />
            <MainRoute exact path={`${url}/add`} component={AddPayme} />
            <MainRoute exact path={`${url}/edit/:id`} component={EditPayme} />
            <MainRoute exact path={`${url}/share/:id`} component={SharePayme} /> */}
            {/* <MainRoute exact path={`${url}`} component={Peyme} /> */}
            <MainRoute exact path={`${url}/view`} component={ViewPeyme} />
        </Switch>
    )
};
