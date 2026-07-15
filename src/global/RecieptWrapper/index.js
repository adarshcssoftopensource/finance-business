import React, { Component, Fragment } from 'react'
import { RecieptHeader } from './RecieptHeader';

import { RecieptPreview } from './RecieptPreview';
import "./style.scss";

export default class RecieptWrapper extends Component {
    componentDidMount() {
        const { invoiceData: { businessId } } = this.props
        document.title = `Finance - ${businessId && businessId.organizationName} - Receipt`
    }
    render() {
        const { pathname } = this.props.location
        const token = localStorage.getItem("token")
        return (
            <div className="mainWrapper">
                {pathname.includes('readonly') ?
                    <Fragment >
                        {
                            !!token && (
                                <RecieptHeader {...this.props} readonly={true} />
                            )
                        }
                        <div className="recenpt-template"><RecieptPreview {...this.props} readonly={true}/></div>
                    </Fragment>
                    :
                    <Fragment >
                        {!!token && (
                                <RecieptHeader {...this.props} readonly={false} />
                            )
                        }
                        <div className="recenpt-template"><RecieptPreview {...this.props} readonly={false}/></div>
                    </Fragment>
                }
            </div>
        )
    }
}
