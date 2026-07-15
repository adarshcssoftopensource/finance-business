import React, { Component, Fragment } from 'react'
import Icon from './Icon'
import DatepickerWrapper from "../../utils/formWrapper/DatepickerWrapper";
import { _toDateConvert } from '../../utils/globalMomentDateFunc';
import symbolsIcon from "../../assets/icons/product/symbols.svg";

export default class CustomLabelDropDown extends Component {
    render() {
        return (
            <div className={`Input__container Input_Select ${this.props.className}`}>
                <label className="Input__label {this.props.required && is-required }" id={this.props.id}>{this.props.label}</label>
                <Fragment>
                    <select id={this.props.id} className="Input__control" style={{fontSize: "18px"}} onChange={(e) => this.props.onChange(e)} value={this.props.value}>
                        {
                            this.props.showSelectDefault && (
                                <option selected value={''}>Select {this.props.name}</option>
                            )
                        }
                        {
                            !!this.props.options && this.props.options.length > 0 && (
                                this.props.options.map((opt, i) => {
                                    return (
                                    <option value={opt.value} key={i}>{opt.name}</option>
                                    )
                                })
                            )
                        }
                    </select>
                    <Icon
                        className="Icon"
                        xlinkHref={`${symbolsIcon}#expand_more`}
                    />
                    {this.props.value === 'specific' && (
                        <DatepickerWrapper
                            isClearable={false}
                            placeholderText="Choose Custom"
                            popperPlacement="top-end"
                            className="DateRange__dateInput"
                            selected={_toDateConvert(this.props.valueDate)}
                            maxDate={_toDateConvert(new Date())}
                            onChange={date =>
                                this.props.onChangeDate(_toDateConvert(date))
                            }
                            name="startdate"
                            // calendarContainer = {(e) => this.MyContainer(e, 'startDate')}
                        />
                    )}
                </Fragment>
            </div>
        )
    }
}
