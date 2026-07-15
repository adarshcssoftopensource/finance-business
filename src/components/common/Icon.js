import React, { Component } from 'react'

export default class Icon extends Component {
    render() {
        return (
            <svg className={this.props.className} style={this.props.style}>
                <use xlinkHref={this.props.xlinkHref}/>
            </svg>
        )
    }
}
