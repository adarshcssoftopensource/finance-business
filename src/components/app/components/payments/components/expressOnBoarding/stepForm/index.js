import React from 'react';

//import steps
import StepFirst from './StepFirst';
import StepFour from './stepFour';
import StepFive from '../../onBoarding/stepForm/stepFive';
import StepSix from '../../onBoarding/stepForm//stepSix';

const index = (props) => {
    const renderForm = () => {
        const step = parseInt(props.activeStep);
        switch (step) {
            case 0: {
                return <StepFirst {...props} />
            }
            case 1: {
                return <StepFour {...props} />
            }
            case 2: {
                return <StepFive {...props} />
            }
            case 3: {
                return <StepSix {...props} />
            }
        }
    }
    return (
        <div>
            {renderForm()}
        </div>
    );
}

export default index;