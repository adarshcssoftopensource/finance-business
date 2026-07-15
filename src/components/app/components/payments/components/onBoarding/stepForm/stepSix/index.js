import React, { useEffect } from 'react';

import Verify from './verify';
import Success from './success';
import history from '../../../../../../../../customHistory'
const Index = (props) => {

    
    useEffect(() => {
        let timer;
        if (props.paymemntSettings.data.isVerified.payment) {
            return () => clearInterval(timer);
        } else {
            timer = setInterval(() => props.getOnboardingStatus(), 10000);
        }
        return () => clearInterval(timer);
    }, [props.paymemntSettings]);

    return (
        <div>
            {props.paymemntSettings.data.isVerified.payment ? <Success /> : <Verify />}
        </div>
    )
}

export default Index;