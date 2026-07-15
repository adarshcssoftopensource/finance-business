import React from 'react';
import { toMoney, getAmountToDisplay } from '../../../../../../utils/GlobalFunctions';

export const AccountOption = ({account, logo}) => {
    return (
        <div className="d-flex align-items-start bank-account-item" >
            <div className="me-2 d-flex align-items-center">
                <img src={`data:image/png;base64,${logo}`} alt={account.name} style={{verticalAlign: 'middle', minWidth: '35px', minHeight: '35px', maxWidth:'35px', marginTop: '0'}}/>
            </div>  
            <div className="d-flex flex-column align-items-start">
                <div className="bank-name" >{account.name} (•••• {account.mask})</div>
                <small className="py-text--hint" style={{lineHeight: '1'}}>Available balance {account.balances ? `${getAmountToDisplay(account.balances.currency, account.balances.available)}` : 'NA'}</small>
            </div>
        </div>
    )
}