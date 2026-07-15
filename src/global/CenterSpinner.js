import React, { Component } from 'react'
import { Spinner } from 'reactstrap';

export default class CenterSpinner extends Component {
    render() {
        return (
            <div className="spinner-wrapper">
                <div className="spinner-box">
                    <Spinner  color="primary" className="loader"/>
                </div>
            </div>
        )
    }
}
