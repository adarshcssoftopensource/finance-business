import React,{Component} from 'react';
import InvoiceItemsHeader from './InvoiceItemsHeader';
import RenderInvoiceItems from './RenderInvoiceItems';

class InvoiceItems extends Component{
    constructor(props){
        super(props);
    }
    render(){
        const { invoiceInfo , userSettings , invoiceItems} = this.props;
        return(
            <div className="contemporary-template__items">
            <table className="table">
              <InvoiceItemsHeader
                invoiceInfo={invoiceInfo}
                userSettings={userSettings}
              />
              <RenderInvoiceItems
                invoiceInfo={invoiceInfo}
                invoiceItems={invoiceItems}
              />
            </table>
          </div>
        )
    }
}


export default InvoiceItems;