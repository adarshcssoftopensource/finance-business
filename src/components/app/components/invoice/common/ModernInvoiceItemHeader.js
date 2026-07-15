import React,{Component} from 'react';

class ModernInvoiceItemHeader extends Component{
    constructor(props){
        super(props);
    }
    render(){
        let { invoiceData } = this.props;
        return(
            <tr className="py-table__row">
            {!invoiceData.itemHeading.hideItem && (
              <th colSpan="4" className="py-table__cell">
                {invoiceData.itemHeading.column1.name}
              </th>
            )}
            {!invoiceData.itemHeading.hideQuantity && (
              <th
                colSpan="1"
                className="py-table__cell modern-template__cell-center "
              >
                {invoiceData.itemHeading.column2.name}
              </th>
            )}
            {!invoiceData.itemHeading.hidePrice && (
              <th
                colSpan="1"
                className="py-table__cell py-table__cell-amount"
              >
                {invoiceData.itemHeading.column3.name}
              </th>
            )}
            {!invoiceData.itemHeading.hideAmount && (
              <th
                colSpan="1"
                className="py-table__cell py-table__cell-amount"
              >
                {invoiceData.itemHeading.column4.name}
              </th>
            )}
          </tr>
        )
    }
}


export default ModernInvoiceItemHeader;