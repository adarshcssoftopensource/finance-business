import React, { Component, Fragment } from 'react'
import { Button } from 'reactstrap';
import history from '../../customHistory'
export default class PaymentPopover extends Component {
    goToPayments = () => {
        history.push('/app/payments')
    }
    render() {
        const { invoiceData } = this.props
        return (
            <Fragment>
                <button className="py-popup-close" onClick={this.props.toggle}>
                    <i className="fal fa-times" /></button>
                <div className="py-popup-content-wrapper">
                    <div className="changePref text-center">
                        <div className="text-center" style={{ padding: '30px 0' }}>
                            <img src={`${process.env.REACT_APP_CDN_URL}/static/web-assets/card-cross.png`} />
                        </div>
                        <p className="text-danger">{invoiceData && invoiceData.remarks}</p>
                        <Button type="button" onClick={this.goToPayments} color="primary" className="mt-2" >Activate Payments</Button>
                        {/* <p>Online payments can be enabled only for invoices created in USD & CAD.</p> */}
                    </div>
                </div>
            </Fragment>
        )
    }
}