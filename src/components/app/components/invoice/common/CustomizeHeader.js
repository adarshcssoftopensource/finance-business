import React from 'react'
import {
  Button,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap';
import { connect } from 'react-redux';
import { cloneDeep } from 'lodash';
import { setUserSettings } from '../../../../../actions/loginAction';
import { patchSalesSetting } from '../../../../../api/SettingService';
import FormValidationError from '../../../../../global/FormValidationError';

class CustomizeHeader extends React.Component {
  state = {
    invoiceColumnSettings: this.props.invoice,
    invoiceColumnValidation: {
      column1: false,
      column2: false,
      column3: false,
      column4: false
    },

    column1:'',
    column2:'',
    column3:'',
    column4:''
  }

  componentDidMount(){
    const { invoice } = this.props
    this.setState({ invoiceColumnSettings: invoice })
    const { itemHeading } = invoice
    if(!!itemHeading){
      if((itemHeading.column1.name !== "Items" && itemHeading.column1.name !== "Services" && itemHeading.column1.name !== "Products")){
        this.setState({
          column1: itemHeading.column1.name
        })
      }
      if((itemHeading.column2.name !== "Quantity" && itemHeading.column2.name !== "Hours")){
        this.setState({
          column2: itemHeading.column2.name
        })
      }
      if((itemHeading.column3.name !== "Price" && itemHeading.column3.name !== "Rate")){
        this.setState({
          column3: itemHeading.column3.name
        })
      }
      if((itemHeading.column4.name !== "Amount")){
        this.setState({
          column4: itemHeading.column4.name
        })
      }
    }
  }

  componentDidUpdate(prevProps) {
    const { invoice } = this.props
    if (invoice !== prevProps.invoice) {
      this.setState({ invoiceColumnSettings: invoice })
      const { itemHeading } = invoice
      if(!!itemHeading){
        // ["Items", "Services", "Products", "Other"].map((itemType, index) => {
          if((itemHeading.column1.name !== "Items" && itemHeading.column1.name !== "Services" && itemHeading.column1.name !== "Products")){
            this.setState({
              column1: itemHeading.column1.name
            })
          }
          if((itemHeading.column2.name !== "Quantity" && itemHeading.column2.name !== "Hours")){
            this.setState({
              column2: itemHeading.column2.name
            })
          }
          if((itemHeading.column3.name !== "Price" && itemHeading.column3.name !== "Rate")){
            this.setState({
              column3: itemHeading.column3.name
            })
          }
          if((itemHeading.column4.name !== "Amount")){
            this.setState({
              column4: itemHeading.column4.name
            })
          }
        // })
      }
    }
  }

  onSaveClick = e => {
    e.preventDefault();
    let checkArr = this.state.invoiceColumnValidation;
    const updateSettings = this.state.invoiceColumnSettings
    const { itemHeading } = updateSettings;
    if(!!itemHeading.column1.shouldShow && (itemHeading.column1.name === 'Other' ? !this.state.column1 : !itemHeading.column1.name)){
      checkArr = {
        ...checkArr,
        column1: true
      }
    }else{
      checkArr = {
        ...checkArr,
        column1: false
      }
    }
    if(!!itemHeading.column2.shouldShow && (itemHeading.column2.name === 'Other' ? !this.state.column2 : !itemHeading.column2.name)){
      checkArr = {
        ...checkArr,
        column2: true
      }
    }else{
      checkArr = {
        ...checkArr,
        column2: false
      }
    }
    if(!!itemHeading.column3.shouldShow && (itemHeading.column3.name === 'Other' ? !this.state.column3 : !itemHeading.column3.name)){
      checkArr = {
        ...checkArr,
        column3: true
      }
    }else{
      checkArr = {
        ...checkArr,
        column3: false
      }
    }
    if(!!itemHeading.column4.shouldShow && (itemHeading.column4.name === 'Other' ? !this.state.column4 : !itemHeading.column4.name)){
      checkArr = {
        ...checkArr,
        column4: true
      }
    }else{
      checkArr = {
        ...checkArr,
        column4: false
      }
    }
    this.setState({invoiceColumnValidation: checkArr})
    let checkValue = Object.values(checkArr).includes(true)
    if(!checkValue){
      let newSettings = cloneDeep(updateSettings.itemHeading)
      const oldSetting = this.props.invoice.itemHeading
      if (newSettings.savedForFuture && !oldSetting.savedForFuture) {
        delete newSettings.savedForFuture
        this.updateInvoiceSettings(newSettings)
      }
      this.props.onSave(updateSettings)
    }
  }

  updateInvoiceSettings = async itemHeading => {
    let salesSettingInput = {
      itemHeading
    }
    let response = await patchSalesSetting({ salesSettingInput })
    this.props.setUserSettings(response.data.salesSetting)
  }
  /**Used for handling @other value */
  handleItemHeadingValue = ({target: {name, value} }) => {
    this.setState({[name] : value, invoiceColumnSettings: {
      ...this.state.invoiceColumnSettings,
      itemHeading: {
        ...this.state.invoiceColumnSettings.itemHeading,
        [name]: {...this.state.invoiceColumnSettings.itemHeading[name], name: value }
      }
    },
    invoiceColumnValidation: {
      ...this.state.invoiceColumnValidation,
      [name]: !!value ? false : true
    }})
  }

  handleItemHeading = (event, isOther) => {
    let updateSettings = cloneDeep(this.state.invoiceColumnSettings)
    const { name, value } = event.target
    if (name.includes('column')) {
      updateSettings.itemHeading[name].name = value
      if(isOther !== 'Other'){
        this.setState({
          [name]: '',
          invoiceColumnValidation: {
            ...this.state.invoiceColumnValidation,
            [name]: false
          }
        })
      }
    } else {
      if (name === 'hideDescription') {
        updateSettings.itemHeading['hideItem'] = false
      } else if (name === 'hideItem') {
        updateSettings.itemHeading['hideDescription'] = false
      }
      updateSettings.itemHeading[name] = !updateSettings.itemHeading[name]
    }
    this.setState({ invoiceColumnSettings: updateSettings })
  }

  render() {
    const { openHeader, onClose, from = 'invoice' } = this.props
    let { invoice } = this.props;
    const { itemHeading } = this.state.invoiceColumnSettings
    const { invoiceColumnValidation } = this.state
    return (
      <Modal
        isOpen={openHeader}
        toggle={onClose}
        className="customize_invoice_modal"
        centered
      >
        <ModalHeader toggle={onClose} className="py-text--strong">
          Customize this {from}
        </ModalHeader>
        <ModalBody>
          <p className="py-form-legend py-text--samibold">
            Edit the titles of the columns on this {from}:
          </p>
          <div className="py-form-field py-form-field--inline">
            <div className="py-form-field__label--align-top">Items</div>
            <div className="py-form-field__element">
              {['Items', 'Services', 'Products', 'Other'].map(
                (itemType, index) => {
                  return (
                    <div key={itemType + index}>
                      <Label className="py-radio">
                        <input
                          type="radio"
                          name="column1"
                          checked={
                            itemHeading.column1.name === '' || itemHeading.column1.name === itemType ||
                            ![
                              'Items',
                              'Services',
                              'Products',
                              'Other'
                            ].includes(itemHeading.column1.name)
                          }
                          value={itemType}
                          onClick={(e)=>this.handleItemHeading(e,itemType)}
                        />
                        <span className="py-form__element__faux"></span>
                        <span className="py-form__element__label">
                          {itemType}
                        </span>
                        <span className="py-text--emphasized">
                          {itemType === 'Items' ? `(Default)` : ''}
                        </span>
                      </Label>

                      {itemType === 'Other' ? (
                        <div className="py-form-field__hint">
                          <Input
                            type="text"
                            name="column1"
                            id="column1"
                            onChange={e => this.handleItemHeadingValue(e, 'Other')}
                            className="py-form__element__medium"
                            // onFocus={this.handleItemHeading}
                            value = {this.state.column1}
                          />
                          <FormValidationError
                            showError={invoiceColumnValidation['column1']}
                          />
                        </div>
                      ) : (
                        ''
                      )}
                    </div>
                  )
                }
              )}
            </div>
          </div>

          <div className="py-divider"></div>
          <div className="py-form-field py-form-field--inline">
            <div className="py-form-field__label--align-top">Units</div>
            <div className="py-form-field__element">
              {['Quantity', 'Hours', 'Other'].map((unitType, index) => {
                return (
                  <div key={unitType + index}>
                    <Label className="py-radio">
                      <input
                        type="radio"
                        name="column2"
                        checked={ itemHeading.column2.name === unitType ||
                          !['Quantity', 'Hours', 'Other'].includes(itemHeading.column2.name)}
                        value={unitType}
                        onClick={(e) => this.handleItemHeading(e,unitType)}
                      />
                      <span className="py-form__element__faux"></span>
                      <span className="py-form__element__label">
                        {unitType}
                      </span>
                      <span className="py-text--emphasized">
                        {unitType === 'Quantity' ? `(Default)` : ''}
                      </span>
                    </Label>

                    {unitType === 'Other' ? (
                      <div className="py-form-field__hint">
                        <Input
                          type="text"
                          name="column2"
                          id="column2"
                          onChange={e => this.handleItemHeadingValue(e, 'Other')}
                          value = {this.state.column2}
                          // onFocus={this.handleItemHeading}
                        />
                        <FormValidationError
                            showError={invoiceColumnValidation['column2']}
                          />
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="py-divider"></div>

          <div className="py-form-field py-form-field--inline">
            <div className="py-form-field__label--align-top">Price</div>
            <div className="py-form-field__element">
              {['Price', 'Rate', 'Other'].map((priceType, index) => {
                return (
                  <div key={priceType + index} className="radio">
                    <Label className="py-radio">
                      <input
                        type="radio"
                        name="column3"
                        checked={itemHeading.column3.name === priceType || !['Price', 'Rate', 'Other'].includes(itemHeading.column3.name)}
                        value={priceType}
                        onClick={(e) => this.handleItemHeading(e,priceType)}
                      />
                      <span className="py-form__element__faux"></span>
                      <span className="py-form__element__label">
                        {priceType}
                      </span>
                      <span className="py-text--emphasized">
                        {priceType === 'Price' ? `(Default)` : ''}
                      </span>
                    </Label>
                    {priceType === 'Other' ? (
                      <div className="py-form-field__hint">
                        <Input
                          type="text"
                          name="column3"
                          id="column3"
                          value = {this.state.column3}
                          onChange={e => this.handleItemHeadingValue(e, 'Other')}
                          // onFocus={this.handleItemHeading}
                        />
                        <FormValidationError
                          showError={invoiceColumnValidation['column3']}
                        />
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="py-divider"></div>
          <div className="py-form-field py-form-field--inline">
            <label className="py-form-field__label--align-top">Amount</label>
            <div className="py-form-field__element">
              {['Amount', 'Other'].map((amountType, index) => {
                return (
                  <div key={amountType + index}>
                    <Label className="py-radio">
                      <input
                        type="radio"
                        name="column4"
                        checked={itemHeading.column4.name === amountType || !['Amount', 'Other'].includes( itemHeading.column4.name )}
                        value= {amountType}
                        onClick={(e) => this.handleItemHeading(e , amountType)}
                      />
                      <span className="py-form__element__faux"></span>
                      <span className="py-form__element__label">
                        {amountType}
                      </span>
                      <span className="py-text--emphasized">
                        {amountType === 'Amount' ? `(Default)` : ''}
                      </span>
                    </Label>
                    {amountType === 'Other' ? (
                      <div className="py-form-field__hint ">
                        <Input
                          type="text"
                          name="column4"
                          id="column4"
                          value = {this.state.column4}
                          onChange={e => this.handleItemHeadingValue(e, 'Other')}
                          // onFocus={this.handleItemHeading}
                        />
                        <FormValidationError
                          showError={invoiceColumnValidation['column4']}
                        />
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="py-divider"></div>
          <div className="py-form-field py-form-field--inline">
            <div className="py-form-field__label--align-top h5">
              Hide columns:
            </div>
            <div className="py-form-field__element">
              <Label className="py-checkbox me-2">
                <input
                  type="checkbox"
                  name={'hideItem'}
                  value={itemHeading.hideItem}
                  checked={itemHeading.hideItem}
                  onChange={this.handleItemHeading}
                />
                <span className="py-form__element__faux"></span>
                <span className="py-form__element__label">Hide item name</span>
              </Label>
              <Label className="py-checkbox me-4">
                <input
                  type="checkbox"
                  name={'hideDescription'}
                  value={itemHeading.hideDescription}
                  checked={itemHeading.hideDescription}
                  onChange={this.handleItemHeading}
                />
                <span className="py-form__element__faux"></span>
                <span className="py-form__element__label">
                  Hide item description
                </span>
              </Label>              
              <div className="py-text--hint mt-2 mb-3">
                Your {from} must show at least one of the above.
              </div>
              <div className="mt-0">
                <ul className="list-unstyled mb-0">
                  <li className="mb-0">
                    <Label className="py-checkbox">
                      <input
                        type="checkbox"
                        name={'hideQuantity'}
                        value={itemHeading.hideQuantity}
                        checked={itemHeading.hideQuantity}
                        onChange={this.handleItemHeading}
                      />
                      <span className="py-form__element__faux"></span>
                      <span className="py-form__element__label">
                        Hide units
                      </span>
                    </Label>
                  </li>
                  <li className="mb-0">
                    <Label className="py-checkbox">
                      <input
                        type="checkbox"
                        name={'hidePrice'}
                        value={itemHeading.hidePrice}
                        checked={itemHeading.hidePrice}
                        onChange={this.handleItemHeading}
                      />
                      <span className="py-form__element__faux"></span>
                      <span className="py-form__element__label">
                        Hide price
                      </span>
                    </Label>
                  </li>
                  <li>
                    <Label className="py-checkbox">
                      <input
                        type="checkbox"
                        name={'hideAmount'}
                        value={itemHeading.hideAmount}
                        checked={itemHeading.hideAmount}
                        onChange={this.handleItemHeading}
                      />
                      <span className="py-form__element__faux"></span>
                      <span className="py-form__element__label">
                        Hide amount
                      </span>
                    </Label>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="py-divider"></div>

          <div className="py-form-field py-form-field--inline">
            <label className="py-form-field__label"></label>
            <div className="py-form-field__element">
              <Label className="py-checkbox">
                <input
                  type="checkbox"
                  name={'savedForFuture'}
                  value={itemHeading.savedForFuture}
                  checked={itemHeading.savedForFuture}
                  onChange={this.handleItemHeading}
                />
                <span className="py-form__element__faux"></span>
                <span className="py-form__element__label">
                  Apply these settings for all future {from}s.
                </span>
              </Label>
              <span className="py-form-field__hint">
                These settings will apply to recurring and non-recurring {from}s. You can change these anytime from Invoice
                Customization settings.
              </span>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" outline className="me-2" onClick={onClose}>Cancel</Button>
          <Button color="primary" onClick={this.onSaveClick}>Save</Button>
        </ModalFooter>
      </Modal>
    )
  }
}

export default connect(null, { setUserSettings })(CustomizeHeader)
