import 'rc-steps/assets/index.css';
import React, { useEffect } from 'react';
import Steps, { Step } from 'rc-steps';

import { _documentTitle } from '../../../../../../../utils/GlobalFunctions';

import { steps } from '../data';

const Index = (props) => {
    useEffect(() => {
        _documentTitle({}, steps[props.activeStep])
    })

    return (
        <Steps direction="vertical" current={props.activeStep}>
            {steps.map((step, idx) => <Step key={idx} title={step} onClick={() => props.handleSteps(idx)} />)}
        </Steps>
    );
}

export default Index;