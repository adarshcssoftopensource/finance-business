import React, { Fragment } from 'react';
import { Button, Col } from 'reactstrap';
import {
  EstimateBillToComponent,
  RenderShippingAddress
} from '../../Estimates/components/EstimateInvoiceComponent';
import SelectBox from '../../../../../utils/formWrapper/SelectBox'
import addUser from "../../../../../assets/add-user.svg"

class AddCustomer extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    let {
      handleEditCustomer,
      onCustomerChange,
      showCustomer,
      onShowCustomer,
      selectedCustomer,
      handleCustomer,
      customers,
      invoiceData
    } = this.props;
    return (
      <Col md={7} sm={5} >
        {selectedCustomer && selectedCustomer.customerName ? (
          <Fragment>
            <div className="classic-template__metadata">
              <EstimateBillToComponent estimateKeys={selectedCustomer} />
              <RenderShippingAddress
                addressShipping={selectedCustomer.addressShipping}
                isShipping={selectedCustomer.isShipping}
              />
            </div>
            <div className="my-2 py-text--strong">
              <a className="py-text--link" onClick={handleEditCustomer}>
                {`Edit ${selectedCustomer.customerName}`}
              </a>
              <span className="py-text--hint d-inline-block mx-2">{' • '}</span>
              <a className={`py-text--link ${!!invoiceData && !!invoiceData.invoiceCount && invoiceData.invoiceCount > 0 ? 'disabled' : ''}`} onClick={!!invoiceData && !!invoiceData.invoiceCount && invoiceData.invoiceCount > 0 ? null : onCustomerChange} disabled={!!invoiceData && !!invoiceData.invoiceCount && invoiceData.invoiceCount > 0}>
                {'Choose a different customer'}
              </a>
            </div>
            {/* <a
                    onClick={this.onCustomerChange}
                    className="additem"
                  >
                    <strong>Choose a different customer</strong>
                  </a> */}
          </Fragment>
        ) : (
            <Fragment>
              <div className="invoice-add-customer">
                {showCustomer ? (
                  <Button onClick={onShowCustomer} 
                    color="primary" 
                    outline 
                    className="add-customer-btn">
                    <img src={addUser} />
                  Add a customer
                  </Button>
                ) : (
                    <SelectBox
                      onBlur={!!selectedCustomer ? false : onShowCustomer}
                      autoFocus={true}
                      defaultMenuIsOpen={true}
                      getOptionLabel={(value)=>(value["customerName"])}
                      getOptionValue={(value)=>(value["_id"])}
                      value={selectedCustomer}
                      onChange={handleCustomer}
                      options={customers}
                      clearable={false}
                      placeholder={'Type a customer name'}
                    />
                  )}
              </div>
            </Fragment>
          )}
      </Col>
    )
  }
}

export default AddCustomer;
