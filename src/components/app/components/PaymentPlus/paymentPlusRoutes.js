import React from 'react'

import { Switch } from 'react-router-dom'

import MainRoute from '../../../../components/app/MainRoute'
import ComingSoon from '../../../../components/comingSoon'


export function PaymentPlusRoutes(url) {
    return (

        <Switch>
            <MainRoute exact path={`${url}`} component={ComingSoon} />
            {/* <MainRoute exact path={`${url}/start`} component={InvoiceStart} />
            <MainRoute exact path={`${url}/add`} component={AddInvoice} />
            <MainRoute exact path={`${url}/edit/:id`} component={EditInvoice} />
            <MainRoute exact path={`${url}/view/:id`} component={ViewInvoice} /> */}
        </Switch>
    )
};
