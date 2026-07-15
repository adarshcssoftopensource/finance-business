import React, {Fragment} from "react";
import {RecieptHeader} from "../../global/RecieptWrapper/RecieptHeader";
import unpaidPng from "../../assets/unpaid.png"

class ReminderPreview extends React.Component {
    componentDidMount() {
        document.title = 'Finance'
    }

    render() {
        const token = localStorage.getItem('token');
        return (
            <Fragment>
                <div className="invoice-reminder-email-preview">
                    {
                        !!token && (
                            <RecieptHeader reminder={true}/>
                        )
                    }
                    <div className="invoice-reminder-email-preview__preview-img">
                        <img src={unpaidPng}/>
                    </div>
                </div>
            </Fragment>
        );
    }
}

export default ReminderPreview;
