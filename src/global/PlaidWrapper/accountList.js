import React, { useState, useEffect } from 'react';
import { ListGroup } from 'react-bootstrap';
import { Spinner, Button } from 'reactstrap';

const AccountList = (props) => {
    const [isSelected, setIsSelected] = useState(null);
    const { accounts, loading } = props;

    useEffect(() => {
        if (accounts.length == 1) {
            setIsSelected(accounts[0]._id);
        }
    })

    return (
        <div>
            <h6 className="mt-3 text-left">Select the account in which you want payout to be credited.</h6>
            <ListGroup as="ul" className="mt-4 cursor-pointer text-left">
                {accounts.map((account, i) => (<ListGroup.Item as="li" key={account._id}
                    onClick={() => setIsSelected(account._id)}
                    active={isSelected === account._id}>
                    <span>{account.name || account.bankName}</span><br />
                    <span>{account.subtype}<span> ••••&nbsp;{account.mask}</span></span>
                </ListGroup.Item>))}
            </ListGroup>
            <div className="row mx-n2 mt-4">
                <div className="col-6 px-2">
                    <Button type="submit" color="primary" block disabled={!isSelected || loading} onClick={() => props.onSubmit(isSelected)}>
                        Save and continue &nbsp;  {loading && <Spinner size="sm" color="light" />}
                    </Button>    
                </div>
                <div className="col-6 px-2">
                    <Button type="button" color="primary" block outline onClick={props.onCancel}>Cancel or select other</Button>    
                </div>    
            </div>
        </div>
    );
}

export default AccountList;