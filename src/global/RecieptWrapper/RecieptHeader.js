import React from 'react';
import { NavLink } from 'react-router-dom';

export const RecieptHeader = ({ invoiceData, readonly = false, reminder = false }) => (
    <div className="reciept-container">
        {readonly ? (<header>
            <div className="px-2 d-flex align-items-center flex-wrap justify-content-between">
                <span className="py-2">You are previewing your customer's receipt for payment on {!!invoiceData && invoiceData.invoiceNumber !== 0
                    && <strong> {invoiceData && invoiceData.receiptFor === 'peyme' ? 'Finance.Me' : invoiceData && invoiceData.receiptFor === 'checkout' ? 'Checkout' : 'Invoice'} {invoiceData && invoiceData.invoiceNumber}.</strong>}
                </span>
                <span className="py-2"><NavLink to="/">Go back to Finance</NavLink></span>
            </div>
        </header>)
            :
            (<header>
                <div className="px-2 d-flex align-items-center flex-wrap justify-content-between">
                    <span className="py-2" >This is a preview of the email {!!reminder ? 'for the payment reminder' : ''} that your customer will see.</span>
                    <span className="py-2"><a href="#" className="btn btn-outline-danger" onClick={() =>window.close()}>Close this tab</a></span>
                </div>
            </header>)}
    </div>
)