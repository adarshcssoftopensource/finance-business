import React from 'react';
import { getRecurringInvoice } from '../../../../api/RecurringService';
import InvoiceForm from '../invoice/components/InvoiceForm';

class EditRecurring extends React.Component{
    state = {
        invoiceData: undefined,
        isEdit: true
    }

    componentDidMount() {
        if(this.props.history.location.state === undefined)
        {
        const id = this.props.match.params.id
        this.fetchRecurrungInvoiceInfo(id)
        }
        else{
            this.saveInvoiceInfo(this.props.history.location.state.invoiceDetail)
        }
    }

    fetchRecurrungInvoiceInfo = async (id) => {
        try {
            let response = await getRecurringInvoice(id);
            if (response.statusCode === 200) {
                this.setState({ invoiceData: response.data.invoice })
            } else {
                this.props.showSnackbar("Seems this recurring invoice doesn't exist", false)
                this.props.history('/app/recurring')
            }
        } catch (error) {
            this.props.showSnackbar('Something went wrong', true)
        }

    }

    saveInvoiceInfo = (data) => {
          this.setState({ invoiceData: data})
    }
    
    render(){
        const { invoiceData, isEdit } = this.state
        return (
            <InvoiceForm invoiceData={invoiceData} isEditMode={true}/>
        )
    }
}

export default EditRecurring