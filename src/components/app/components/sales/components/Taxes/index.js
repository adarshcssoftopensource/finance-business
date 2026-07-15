import React, { Component, Fragment } from 'react'
import SelectBox from '../../../../../../utils/formWrapper/SelectBox';
import AddTax from './AddTax';

const initialProduct = (state, isEditMode) => {
  let data = {
    id: state && state._id || '',
    userId: state && state.userId || localStorage.getItem('user.id'),
    businessId: state && state.businessId || localStorage.getItem('businessId'),
    name: state && state.name || '',
    description: state && state.description || '',
    price: state && state.price || 0.00,
    buy: state ? state.buy : { allowed: false },
    sell: state ? state.sell : { allowed: false },
    taxes: state && state.taxes || []
  };
  if (!isEditMode) {
    delete data.id
  }
  return data
};

class Taxes extends Component {
  state = {
    openAddTax: false,
    options: []
  };

  componentDidMount() {
    const { isEditMode, taxValue } = this.props;
    const onSelect = isEditMode ? taxValue : null;
    const formatedData = initialProduct(onSelect, isEditMode);
    this.fetchTaxes(formatedData, 'setData')
  }

  componentDidUpdate(prevProps){
    const { isEditMode, taxValue } = this.props;
    const onSelect = isEditMode ? taxValue : null;
    const formatedData = initialProduct(onSelect, isEditMode);
    if(this.props !== prevProps){
      this.fetchTaxes(formatedData, isEditMode ? 'setData' : '')
    }
  }
  componentWillReceiveProps(props) {
    const { isEditMode, taxValue, taxList } = this.props;
    const onSelect = (taxValue) ? taxValue : null;
    const formatedData = initialProduct(onSelect, isEditMode);
    this.fetchTaxes(formatedData, 'setData')
  }

  fetchTaxes = async (formatedData, type) => {
    const { taxList } = this.props;
    let list = taxList;
    let taxArray = [];
    list.map(item => {
      taxArray.push({
        value: item._id,
        label: `${item.abbreviation}  ${item.rate}%`,
        rate: item.rate,
        className: item.className,
      })
    });
    taxArray.unshift({
      value: 'Select a tax/vat',
      label: <a>
        <i className="Icon pe pe-7s-plus" />
        <span className="text">&nbsp;Add new tax</span>
      </a>
    });
    this.setState(() => ({options: taxArray}), () => {

      if (type === 'setData') {
        this.setOptionDataInModal(formatedData)
      }
    });
  };

  setOptionDataInModal = (formatedData) => {
    let selectedOption = [];
    formatedData.taxes.length && formatedData.taxes.map(data => {
      this.state.options.filter(item => {
        if (typeof data === 'object') {
          if (item.value === data._id) {
            selectedOption.push(item)
          }
        } else {
          if (item.value === data) {
            selectedOption.push(item)
          }
        }
        return item
      });
      return data
    });
    this.setState({ selectedOption });

  };

  handleSelectChange = (selectedOption) => {
    const length = selectedOption.length;
    if (length && selectedOption[length - 1].value === 'Select a tax/vat') {
      this.setState({ openAddTax: true })
    } else {
      const { onChange, index } = this.props;
      this.setState({ selectedOption });
      onChange(selectedOption, index)
    }
  };


  onAddTax = async (event, newOption) => {
    event.preventDefault();
    let selectedOption = this.state.selectedOption;
    selectedOption.push(newOption);
    await this.fetchtaxList();
    this.onCloseTax();
    this.handleSelectChange(selectedOption, true)
  };

  fetchtaxList = async () => {
   await this.props.fetchtaxList();
    this.fetchTaxes()
  };

  onCloseTax = () => {
    this.setState({ openAddTax: false })
  };

  render() {
    const { openAddTax, selectedOption, options } = this.state;
    return (
      <Fragment>
        <SelectBox
          value={selectedOption}
          onChange={this.handleSelectChange}
          options={options}
          clearable={false}
          placeholder="Select a tax/vat"
          isMulti
        />
        <AddTax
          openAddTax={openAddTax}
          onClose={this.onCloseTax}
          onAddTax={this.onAddTax} />
      </Fragment>
    )
  }

}

export default Taxes
