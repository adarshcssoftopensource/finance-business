import React from 'react';
import { NavLink } from 'react-router-dom';
import SuccessSvg from '../../../../../../../../global/SuccessSvg';
const success=(props)=> {
    return (
        <div className="text-center">
            {/* <img src="/assets/images/final-step.png" /> */}
            <SuccessSvg />
            <div className="py-heading--subtitle mb-2"> Your customers can now pay you online. </div>
            <div className="py-heading--subtitle mt-0">And they'll love you for it.</div>
            <div>
                <NavLink className="btn btn-primary" to="/app/invoices">Create a new invoice</NavLink>
            </div>
        </div>
    );
}

export default success;