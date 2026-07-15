import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { getTransactionColumns } from './columnsFormatter';

const payoutTransactions = (props) => {
    return (
        <BootstrapTable
            keyField="_id"
            data={props.data}
            columns={getTransactionColumns()}
            rowClasses="py-table__row"
            classes="py-table py-table__v__center payments-list payout-list"
            hover={false}
        />
    )
}

export default payoutTransactions;