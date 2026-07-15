import React,{Component , Fragment} from 'react';
import { toMoney, getAmountToDisplay } from '../../../../../utils/GlobalFunctions';

export default class InvoiceTaxes extends Component{
    constructor(props){
        super(props);
    }
    render(){
        let {invoiceItems, invoiceData} = this.props;
        return invoiceItems.length > 0
      ? invoiceItems.map((tax, index) => {
          return (
            <Fragment key={'taxtotal' + index}>
              <div className="py-invoice-template__row py-invoice-template__history">
                <div className="py-invoice-template__row-label text-right">
                  <span>
                    {typeof tax.taxName === 'object'
                      ? `${tax.taxName.abbreviation} ${tax.rate}%${
                          tax.taxName.other.showTaxNumber
                            ? ` (${tax.taxName.taxNumber}):`
                            : ':'
                        }`
                      : ` ${tax.taxName}:`}
                  </span>
                  {'  '}
                </div>
                <div className="py-invoice-template__row-amount monospace">
                  <span>{getAmountToDisplay(!!invoiceData.currency && invoiceData.currency, tax.amount)}</span>
                </div>
              </div>
            </Fragment>
          )
        })
      : ''
    }
}

