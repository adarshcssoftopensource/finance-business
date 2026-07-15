import React, { Component } from 'react';
import Icon from '../../../../common/Icon';
import symbolsIcon from '../../../../../assets/icons/product/symbols.svg'

export default class BankDetails extends Component {
    render() {
        return (
            <div className={`account-card__single-header ${this.props.className}`}>
                <div className="d-flex justify-content-between">
                    <div className="d-flex">
                        <div className="bg-primary Icon__Lg d-flex align-items-center rounded justify-content-center  text-white me-2">
                            <Icon
                                className="Icon"
                                xlinkHref={`${symbolsIcon}#vault`}
                            />
                        </div>
                        <div className="">
                            <h6 className="font-weight-normal">{this.props.bankName}</h6>
                            <div className="account-number">
                                <Icon
                                    style={{height: '20px'}}
                                    className="Icon Margin__r-8"
                                    xlinkHref={`${symbolsIcon}#mask`}
                                />
                                **** {this.props.accountNo}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="">
                    <span className="text-uppercase text-muted text-sm d-block">Bank balance</span>
                    <span className="">{this.props.balance}</span>
                </div>
            </div>
        )
    }
}
