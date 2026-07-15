import React, { useState, useEffect } from 'react';
//Api
import { fetchStatesByCountryId } from '../../../../../../../api/CustomerServices'

//import steps
import StepOne from './StepOne';
import StepTwo from './stepTwo';
import StepThree from './stepThree';
import StepFour from './stepFour';
import StepFive from './stepFive';
import StepSix from './stepSix';

const Index = (props) => {
    const [statesOptions, setStatesOptions] = useState(null)
    useEffect(() => {
        fetchStates();
    }, [])

    const fetchStates = async () => {
        try {
            const _id =
                props.selectedBusiness && props.selectedBusiness.country
                    ? props.selectedBusiness.country.id
                    : 1;
            const statesList = await fetchStatesByCountryId(_id)
            setStatesOptions(statesList.states)
        } catch (error) { }
    }


    const renderForm = () => {
        const step = parseInt(props.activeStep);
        switch (step) {
            case 0: {
                return <StepOne {...props} />
            }
            case 1: {
                return <StepTwo {...props} statesOptions={statesOptions} />
            }
            case 2: {
                return <StepThree {...props} statesOptions={statesOptions} />
            }
            case 3: {
                return <StepFour {...props} />
            }
            case 4: {
                return <StepFive {...props} />
            }
            case 5: {
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

export default Index;