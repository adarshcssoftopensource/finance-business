import React from 'react';
import { StripeProvider, Elements } from 'react-stripe-elements';
import { getStripeKey } from '../../../../../../utils/common';
import InjectedPayoutForm from './cardPayoutForm';

export const PreAuthorize = ({invoiceData, changeManual, showSnackbar, refreshData, openAlert, _setAmount, recurring}) => {
    return(
        <StripeProvider apiKey={getStripeKey()}>
            <Elements>
                <InjectedPayoutForm invoiceData={invoiceData}
                    showSnackbar={(message, err) => showSnackbar(message, err)}
                    refreshData={() => refreshData()}
                    openAlert={(item) => openAlert(item)}
                    _setAmount={e => _setAmount(e)}
                    preAuthorize={true}
                    recurring={recurring}
                    changeManual={changeManual}
                />
            </Elements>
        </StripeProvider>
    )
}