import * as customerTable from './tableRender';
import { logger } from '../../../../../../../utils/GlobalFunctions';

export const initialCustomerObject = (state, isEditMode, businessInfo) => {
    let data = {
        id: state && state._id || '',
        customerName: state && state.customerName || '',
        email: state && state.email || '',
        firstName: state && state.firstName || '',
        lastName: state && state.lastName || '',
        userId: state && state.userId || localStorage.getItem('user.id'),
        // businessId: state && state.businessId || localStorage.getItem('businessId'),
        communication: state && state.communication || communicationPayload(),
        addressBilling: state && state.addressBilling || addressBillingPayload(businessInfo),
        addressShipping: state && state.addressShipping || addressShippingPayload(businessInfo),
        currency: currencyObject(isEditMode, state, businessInfo),
        isShipping: state && state.isShipping || false,
        internalNotes: state && state.internalNotes || ""
    };
    if (!isEditMode) {
        delete data.id
    }
    return data
};

export const currencyObject = (isEdit, state, businessInfo) => {
    let defaultObject = {
        name: '',
        code: '',
        displayName: '',
        symbol: ''
    };
    if (isEdit) {
        if (state && state.currency && state.currency.name === '') {
            defaultObject = businessInfo && businessInfo.currency || defaultObject
        } else {
            defaultObject = state && state.currency || defaultObject
        }
    } else {
        if (!!businessInfo && !!businessInfo.currency && !!businessInfo.currency.code) {
            defaultObject = businessInfo.currency;
        }
    }
    return defaultObject
};

export const communicationPayload = () => {
    const data = {
        accountNumber: '',
        phone: '',
        fax: '',
        mobile: '',
        tollFree: '',
        website: ''
    };
    return data
};

export const addressBillingPayload = (businessInfo) => {
    try {
        if (businessInfo) {
            businessInfo.country["id"] = parseInt(businessInfo.country.id);
        }
    } catch (error) {
        logger.error("error in address", error)
    }
    let data = {
        country: {
            id: 0,
            name: '',
            sortname: ''
        },
        state: {
            id: '',
            name: '',
            country_id: ''
        },
        city: '',
        addressLine1: '',
        addressLine2: '',
        postal: ""
    };
    return data
};

export const addressShippingPayload = (businessInfo) => {
    try {
        if (businessInfo) {
            businessInfo.country["id"] = parseInt(businessInfo.country.id);
        }
    } catch (error) {
    }
    const data = {
        contactPerson: '',
        phone: '',
        country: {
            id: 0,
            name: '',
            sortname: ''
        },
        state: {
            id: '',
            name: '',
            country_id: ''
        },
        city: '',
        postal: "",
        addressLine1: '',
        addressLine2: '',
        deliveryNotes: ''
    };
    return data
};

export const columns = [
    {
        dataField: 'name',
        text: 'Name',
        classes: 'py-table__cell',
        formatter: customerTable.nameRender,
        sort: false
    },
    {
        dataField: 'email',
        text: 'Email address',
        classes: 'py-table__cell',
        formatter: customerTable.emailRender,
        sort: false
    },
    {
        dataField: 'phone',
        text: 'Phone',
        classes: 'py-table__cell',
        formatter: customerTable.phoneRender,
        sort: false
    },
    {
        dataField: 'paymentMethods',
        text: 'Payment methods',
        classes: 'py-table__cell',
        formatter: customerTable.paymntRender,
        sort: false
    },
    {
        dataField: 'blockStatus',
        text: 'Block Status',
        classes: 'py-table__cell',
        formatter: customerTable.blockStatusRender,
        sort: false
    },
    {
        dataField: 'actions',
        text: 'Actions',
        classes: 'py-table__cell',
        formatter: customerTable.actionRender,
        sort: false
    }
]
export const columnsWithoutPayment = [
    {
        dataField: 'name',
        text: 'Name',
        classes: 'py-table__cell',
        formatter: customerTable.nameRender,
        sort: false
    },
    {
        dataField: 'email',
        text: 'Email address',
        classes: 'py-table__cell',
        formatter: customerTable.emailRender,
        sort: false
    },
    {
        dataField: 'phone',
        text: 'Phone',
        classes: 'py-table__cell',
        formatter: customerTable.phoneRender,
        sort: false
    },
    {
        dataField: 'actions',
        text: 'Actions',
        classes: 'py-table__cell',
        formatter: customerTable.actionRender,
        sort: false
    }
]