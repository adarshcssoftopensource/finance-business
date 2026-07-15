import React from 'react';
import ExpandableDataTableWrapper from '../../../../../../../utils/dataTableWrapper/ExpandableDataTableWrapper';
import { getColumns } from './columnsFormatter';
import ExpandDetails from './expandDetails'


const table = ({ data, handlgePagination }) => {
    const changePage = (type, pagin) => {
        handlgePagination(pagin)
    }

    const expandDetails = (row) => {
        return <ExpandDetails data={row} />
    }
    if (data && data.payouts && data.payouts.length > 0) {
        return (
            <ExpandableDataTableWrapper
                data={data ? data.payouts || [] : []}
                columns={getColumns()}
                hover={true}
                classes="py-table py-table__v__center payments-list payout-list"
                page={data && data.meta ? data.meta.pageNo : 1}
                limit={data && data.meta ? data.meta.pageSize : 10}
                expandDetails={expandDetails}
                changePage={changePage}
                totalData={data && data.meta ? data.meta.total : 0}
            />
        )
    }
    else {
        return (
            <div class="text-center vr-middle">
                <div class="py-heading--section-title">
                    You do not have any payouts scheduled at this time.<br/>
                    Please check back one business day after you have processed your first payment.</div>
            </div>
        )
    }



}

export default table;