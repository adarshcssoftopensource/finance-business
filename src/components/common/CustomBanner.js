import React, { Component } from 'react'
import Icon from './Icon'
import symbolsIcon from "../../assets/icons/product/symbols.svg";

export default class CustomBanner extends Component {
    render() {
        return (
            <div 
                className={`Banner ${this.props.statusClass} Banner__WithinPage ${this.props.dismissible && 'Banner__isDismissible'} ${this.props.className}`}>
                <div className="Banner__Ribbon">
                    <span className="Icon">
                        <Icon
                            className="Icon__Svg"
                            xlinkHref={`${symbolsIcon}#${this.props.iconName}`}
                        />
                    </span>
                </div>
                <div>
                    <div className="Banner__Header">
                        <p className="Banner__Heading">{this.props.title}</p>
                    </div>
                    <div className="Banner__Content">
                        <p>{this.props.content}</p>
                        <div className="Banner__Actions">
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
