import React from 'react'
import { Switch } from 'react-router-dom'
import MainRoute from '../../../../components/app/MainRoute'
import ComingSoon from '.'


export function ComingSoonRoutes(url) {
    return (
        <Switch>
            <MainRoute exact path={`${url}/accounting`} component={ComingSoon} />
            <MainRoute exact path={`${url}/advancepayments`} component={ComingSoon} />
            <MainRoute exact path={`${url}/advisors`} component={ComingSoon} />
            <MainRoute exact path={`${url}/appointments`} component={ComingSoon} />
            <MainRoute exact path={`${url}/banking`} component={ComingSoon} />
            <MainRoute exact path={`${url}/chargeback-insurance`} component={ComingSoon} />
            <MainRoute exact path={`${url}/mynt-club`} component={ComingSoon} />
            <MainRoute exact path={`${url}/creditreporting`} component={ComingSoon} />
            <MainRoute exact path={`${url}/cryptocurrency`} component={ComingSoon} />
            <MainRoute exact path={`${url}/debit-cards`} component={ComingSoon} />
            <MainRoute exact path={`${url}/insurance`} component={ComingSoon} />
            <MainRoute exact path={`${url}/integrations`} component={ComingSoon} />
            <MainRoute exact path={`${url}/investments`} component={ComingSoon} />
            <MainRoute exact path={`${url}/ios-android-app`} component={ComingSoon} />
            <MainRoute exact path={`${url}/management`} component={ComingSoon} />
            <MainRoute exact path={`${url}/payroll`} component={ComingSoon} />
            <MainRoute exact path={`${url}/p2p-transfers`} component={ComingSoon} />
            <MainRoute exact path={`${url}/payment-gateway`} component={ComingSoon} />
            <MainRoute exact path={`${url}/payyit-plus`} component={ComingSoon} />
            <MainRoute exact path={`${url}/reports`} component={ComingSoon} />
            <MainRoute exact path={`${url}/reviews`} component={ComingSoon} />  
            <MainRoute exact path={`${url}/working-capitals`} component={ComingSoon} />
            <MainRoute exact path={`${url}/launchpad`} component={ComingSoon} />
        </Switch>
    )
};