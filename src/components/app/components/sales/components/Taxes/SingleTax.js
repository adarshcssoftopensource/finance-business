import React, { Component, Fragment } from 'react'
import AddTax from './AddTax';
import { cloneDeep } from 'lodash';
import SelectBox from '../../../../../../utils/formWrapper/SelectBox';
import { toMoney, getAmountToDisplay } from "../../../../../../utils/GlobalFunctions";
import Icon from '../../../../../../components/common/Icon';
import symbolsIcon from "../../../../../../assets/icons/product/symbols.svg";


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
        taxes: state && state.taxes.length > 0 && state.taxes.map(item => {
            if(!!item && typeof item === 'object' && Object.keys(item).length > 0 && item.hasOwnProperty('_id')){
                return item._id
            }else{
                return item
            }
        }) || []
    }
    if (!isEditMode) {
        delete data.id
    }
    return data
}

class SingleTax extends Component {
    state = {
        openAddTax: false,
        selectedOption: []
    }
    options = []

    componentDidMount() {
        const { isEditMode, taxValue } = this.props
        const onSelect = isEditMode ? taxValue : null
        const formatedData = initialProduct(onSelect, isEditMode)
        this.fetchTaxes(formatedData, 'setData')
    }

    componentDidUpdate(prevProps) {
        const { isEditMode, taxValue } = this.props
        if (prevProps.taxValue != taxValue) {
            const onSelect = isEditMode ? taxValue : null
            const formatedData = initialProduct(onSelect, isEditMode)
            this.fetchTaxes(formatedData, 'setData')
        }
    }
    componentWillReceiveProps(nextProps){
        const { isEditMode, taxValue } = nextProps
        if(taxValue !== this.props.taxList){
            const onSelect = isEditMode ? taxValue : null
            const formatedData = initialProduct(onSelect, isEditMode)
            this.fetchTaxes(formatedData, 'setData')
        }
    }

    fetchTaxes = async (formatedData, type) => {
        const { taxList } = this.props
        let list = taxList
        let taxArray = []
        list.map(item => {
            if(item !== null && item !== undefined){
                taxArray.push({
                    value: item._id,
                    label: `${item.abbreviation}  ${item.rate}%`,
                    rate: item.rate
                })
            }
        })
        taxArray.unshift({
            value: 'Select a tax/vat',
            label: <a> <i className="Icon pe pe-7s-plus"></i> Add a tax</a>
        })
        this.options = taxArray
        if (type === 'setData') {
            this.setOptionDataInModal(formatedData)
        }
    }

    setOptionDataInModal = (formatedData) => {
        let selectedOption = []
        formatedData.taxes.length && formatedData.taxes.map(data => {
            this.options.filter(item => {
                if (item.value === data) {
                    selectedOption.push(item)
                }
                return item
            })
            return data
        })
        selectedOption.push(undefined)
        this.setState({ selectedOption: selectedOption.length ? selectedOption : [] })

    }

    handleSelectChange = (selected, idx) => {
        if (selected && selected.value === 'Select a tax/vat') {
            this.setState({ openAddTax: true })
        } else {
            const { onChange, index } = this.props
            let updateOption = cloneDeep(this.state.selectedOption)
            if (idx > -1) {
                updateOption[idx] = selected
            } else {
                if (selected) {
                    updateOption.push(selected)
                }
                else {
                    updateOption = updateOption.filter((item, index) => {
                        return index !== idx
                    })
                }
            }
            this.setState({ selectedOption: updateOption })
            onChange(updateOption, index)
        }
    }

    deleteTax = (data, idx) => {
        const { index, onChange } = this.props
        let selectedOption = cloneDeep(this.state.selectedOption)
        selectedOption = selectedOption.filter((item, index) => { return index !== idx })
        this.setState({ selectedOption }, () => onChange(selectedOption, index))
    }

    onAddTax = async (event, newOption) => {
        event.preventDefault();
        let selectedOption = this.state.selectedOption
        selectedOption = selectedOption.filter(ele =>{
            if(ele && ele !== null && ele !== undefined){
                return ele
            }
        })
        selectedOption.push(newOption)
        await this.fetchtaxList()
        this.onCloseTax()
        this.handleSelectChange(newOption)
    }

    fetchtaxList = async () => {
        await this.props.fetchtaxList()
        this.fetchTaxes()
    }

    onCloseTax = () => {
        this.setState({ openAddTax: false })
    }

    taxCalculation = (item) => {
        if (item) {
            const { currencySymbol } = this.props
            const data = this.props.taxValue
            let subTotal = data.column3 * data.column4;
            if(this.props.from === 'estimate'){
                subTotal = data.quantity * data.price;
            }
            const amount = (subTotal / 100) * item.rate
            return getAmountToDisplay(currencySymbol, amount);
        }
        else {
            return "--"
        }
    }

    filterTaxOption = () => {
        const { taxValue } = this.props
        let newOption = []
        if (this.options.length > 0) {
            newOption = this.options.filter(itm => {
                return !taxValue.taxes.includes(itm.value)
            })
        }
        return newOption
    }

    render() {
        const { openAddTax, selectedOption } = this.state
        const filterOption = this.filterTaxOption()
        return (
            <Fragment>
                {selectedOption.length > 0 ? selectedOption.map((item, index) => {
                    return (
                        <Fragment key={index}>
                            <div className="invoice-item-row-tax-section__tax">
                                <div className="py-table__cell amount-cell">
                                    Tax
                                </div>
                                <div className="py-table__cell tex-cell">
                                    <SelectBox
                                        value={!!item && item}
                                        onChange={(e) => this.handleSelectChange(e, index)}
                                        options={filterOption}
                                        clearable={false}
                                        placeholder="Select a tax/vat"
                                    />
                                </div>
                                <div className="py-table__cell amount-cell">
                                    {this.taxCalculation(item)}
                                </div>
                                <div className="py-table__cell">
                                    <div className="py-table__action py-table__action__danger Icon" onClick={e => item ? this.deleteTax(item, index) : null}>
                                        {item && <Icon className="Icon" xlinkHref={`${symbolsIcon}#delete`} /> }
                                    </div>
                                </div>

                            </div>
                        </Fragment>
                    )
                }) :
                    <Fragment key={-1}>
                        <div className="invoice-item-row-tax-section__tax">
                            <div className="py-table__cell amount-cell">
                                Tax
                                </div>
                            <div className="py-table__cell tex-cell">
                                <SelectBox
                                    onChange={(e) => this.handleSelectChange(e)}
                                    options={filterOption}
                                    clearable={false}
                                    placeholder="Select a tax/vat"
                                />
                            </div>
                            <div className="py-table__cell amount-cell">--</div>
                            <div className="py-table__cell">
                                <div className="py-table__action py-table__action__danger Icon">
                                    <Icon className="Icon" xlinkHref={`${symbolsIcon}#delete`} />
                                </div>
                            </div>
                        </div>
                    </Fragment>
                }
                <AddTax
                    openAddTax={openAddTax}
                    onClose={this.onCloseTax}
                    onAddTax={this.onAddTax} />
            </Fragment>
        )
    }

}

export default SingleTax