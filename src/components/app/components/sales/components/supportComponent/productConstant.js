import * as productTable from './productTable';

export const columns = [
    {
        dataField: 'name',
        text: 'Name',
        classes: 'py-table__cell',
        formatter: productTable.nameRender,
        sort: false
    },
    {
        dataField: 'price',
        text: 'Price',
        classes: 'py-table__cell-amount',
        formatter: productTable.priceRender,
        sort: false
    },
    {
        dataField: 'actions',
        text: 'Actions',
        classes: 'py-table__cell__action',
        formatter: productTable.actionRender,
        sort: false
    }
]