import React, { useState, useEffect } from 'react';
import CenterSpinner from '../../../../../../../../global/CenterSpinner';
import { privacyPolicy } from "../../../../../../../../utils/GlobalFunctions";
import { Spinner, Button } from 'reactstrap';
//Import child component from global
import AccountList from '../../../../../../../../global/PlaidWrapper/accountList';
import ManualBank from '../../../../../../../../global/PlaidWrapper/ManualBank';

const Index = (props) => {
    const [accounts, setAccounts] = useState([]);
    const [isManual, setIsManual] = useState(false);

    useEffect(() => {
        if (props.data.bankAccount) {
            setAccounts([props.data.bankAccount]);
        }
    }, []);

    const onSubmit = (bankAccountId) => {
        let data = {
            step: 4,
            bankAccountId
        }
        props.onSubmit(data);
    }

    const handleCancel = () => {
        setAccounts([])
        setIsManual(false)
    }

    const handleManual = () => {
        setIsManual(true)
    }

    const addManualBank = (bankDetail) => {
        let data = {
            step: 4,
            manualBankAccount: bankDetail
        }
        props.onSubmit(data);
    }

    return (
        <div>
            <header className="py-header--page">
                <div className="h3 m-0">Add a bank account</div>
            </header>
            <div className="content-wrapper">
                <header className="py-header--page flex">
                    <div className="py-header--title mt-2">
                        <h2 className="text-center mt-2 py-heading--subtitle">
                            All your payouts will be credited to this account.
                        </h2>
                    </div>
                </header>
                {accounts.length > 0 || isManual ? (
                    isManual ?
                        (<ManualBank
                            country={props.data.country}
                            bankDetails={addManualBank}
                            onCancel={handleCancel}
                            loading={props.loading}
                        />) :
                        (<AccountList
                            accounts={accounts}
                            onSubmit={onSubmit}
                            loading={props.loading}
                            onCancel={handleCancel}
                        />))
                    :
                    <div className="row mx-n2 mt-4">
                        <div className="col-6 px-2">
                            <Button type="button" 
                                color="primary" outline
                                onClick={handleManual} 
                                className="w-100"
                            >Manually connect bank</Button>
                        </div>
                        <div className="col-6 px-2">
                            <Button type="button" onClick={() => props.onSubmit('skip')} color="primary" outline className="w-100">Skip {props.loading && (<Spinner size="sm" color="default" />)}</Button>
                        </div>
                    </div>
                }
                <div className="text-center Margin__t-32">
                    At Finance, the <a className="py-text--link" href={privacyPolicy()} target="_blank">Privacy</a> and <a className="py-text--link" href={`${process.env.REACT_APP_ROOT_URL}/security.html`} target="_blank">Security</a> of your information are top
                    priorities.
                </div>
            </div>
        </div >
    );
}

export default Index;