import React from 'react'

//Below both module are latest version 
// We're using older version in whole projects
import BootstrapTable from 'react-bootstrap-table-next-v4';
import paginationFactory from 'react-bootstrap-table2-paginator-v2';
//but for expandable we need latest so we use both as dulplicate 
//and placed in our src/plugins folder


const ExpandableDataTableWrapper = (props) => {
    const _handlePageChange = (type, { page, sizePerPage }) => {
        const { changePage = () => console.log() } = props
        changePage(type, { page, sizePerPage })
    }

    const pagination = paginationFactory({
        page: props.page,
        sizePerPage: props.limit,
        totalSize: props.totalData,
        sizePerPageList: [{
            text: '5', value: 5
        }, {
            text: '10', value: 10
        }, {
            text: '25', value: 25
        }, {
            text: '50', value: 50
        }, {
            text: '100', value: 100
        }],
    });

    const expandRow = {
        onlyOneExpanding: true,
        renderer: row => props.expandDetails(row)
    };
    return (
        <BootstrapTable
            remote={{
                filter: false,
                pagination: true,
                sort: false,
                cellEdit: false
            }}
            keyField="id"
            data={props.data}
            columns={props.columns}
            rowClasses="py-table__row"
            classes="py-table"
            hover
            pagination={pagination}
            {...props}
            expandRow={expandRow}
            onTableChange={_handlePageChange}
        />
    )
}

export default ExpandableDataTableWrapper;